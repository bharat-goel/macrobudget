# Does an ARCHITECTURE.md do real work?

Measured 2026-09-11 on a 24 GB M-series Mac, LM Studio, via `qtask`.
Model: `google/gemma-4-12b-qat`. 3 reps per cell. Harness: `bench.sh`.

## Question

My workspace notes asserted that "an `ARCHITECTURE.md` in the prompt does real
work." That was an impression, not a measurement. This tests it directly.

## Method

New project, new domain — `macrobudget`, deliberately unseen by the model, so
the result is not contaminated by the prompts from an earlier, unpublished benchmark (2026-09-10).
Three modules with a real cross-module contract: `daily.js` must import and
correctly call `quantity.js` and `scale.js`.

Two arms, identical tasks and identical gate:

- **with-arch** — `ARCHITECTURE.md` + the module's visible test in the prompt.
- **no-arch** — the module's visible test only.

The test file is the floor both arms get; it is the only way the model can
learn the import path at all.

Each module is measured **independently**: `src/` is seeded with the reference
implementation of the other two modules and the target is deleted. The
cross-module contract is preserved — `daily.js` still has to call the real
`quantity.js` — but an upstream failure cannot cascade and corrupt a downstream
cell.

Three attempts per cell (`--retries 2`), so the model gets to iterate against
the failing test the way a human would.

## The gate, and why it is trustworthy

- `ref/` holds a reference implementation the model never sees. It exists to
  prove the gate is **passable** — 22 visible, 18 held-out, green.
- `mutate.sh` breaks each documented rule one at a time (8 mutants: `Math.round`
  for half-to-even, kcal recomputed from 4/4/9, net carbs floored per entry,
  remaining clamped at zero, carbs measured against total instead of net, the
  `SyntaxError`/`RangeError` taxonomy collapsed, `trim` dropped, null serving
  accepted). **All 8 are caught by the visible and the held-out suite
  independently.** A rule that survived would be a rule this benchmark cannot
  measure.
- The held-out suite has its own values throughout, including its own exact
  rounding ties and its own label-vs-macros energy conflict. It is never in any
  prompt.

## Results

| Arm | Module | Visible | Held-out | Mean attempts | Median s |
|---|---|---|---|---|---|
| **with-arch** | quantity | **3/3** | **3/3** | 1.0 | 26 |
| **with-arch** | scale | 2/3 | 2/3 | 2.7 | 51 |
| **with-arch** | daily | **3/3** | **3/3** | 1.0 | 28 |
| no-arch | quantity | 2/3 | 2/3 | 2.7 | 135 |
| no-arch | scale | 1/3 | 1/3 | 2.7 | 269 |
| no-arch | daily | **0/3** | — | 3.0 | 126 |

**with-arch 8/9. no-arch 3/9.** Wall clock for the whole arm: 5m30s with the
doc, 26m07s without — nearly 5x, because failure costs three attempts and
success often costs one.

## Findings

**1. The document does real work, and the claim survives re-measurement.**
8/9 vs 3/9 at n=3 per cell. The effect is large enough to survive the sample
size; the per-cell ordering is not.

**2. What the doc supplies is the interface, not the logic.** Every `no-arch`
failure is an unstated convention, not a reasoning error:

- `daily` reps 2 and 3 failed at import time — the model invented
  `parseQuantity` where the export is `parsePortion`. It never reached the
  arithmetic.
- `daily` rep 1 called `parsePortion(portion, label)` instead of
  `(portion, label.servingGrams)`, and called the module namespace object as a
  function.
- `scale` reps 1 and 3 scaled by `portion / label.servingGrams` — they assumed
  the label was **per serving**. It is per 100 g. Nothing in the test says so in
  words, and the model did not infer it from the numbers.

This is the mechanism behind finding 1. The model can do the arithmetic; it
cannot guess the contract. A prose paragraph naming the units and the export
names is worth more than another assertion.

**3. Rejection semantics is still the weak axis.** The one `no-arch quantity`
failure was the `SyntaxError` vs `RangeError` distinction — a malformed string
and a well-formed impossible value treated as the same failure. This is the
same axis that broke two Qwen models on that earlier benchmark. Stating the taxonomy
explicitly fixed it (3/3 with the doc), which is a genuine update: the previous
write-up called rejection semantics unreliable full stop. It is unreliable
**when unstated**.

**4. A documented exception leaks.** The single `with-arch` failure is the most
interesting cell in the run. Rule 3 says energy is special — the label is
authoritative, never recompute it from macros. The model wrote a correct
`roundHalfEven`, applied it to all four centigram fields, and then used
`Math.round` on `kcal` alone. It absorbed "kcal is the exception" and
over-applied it to the *rounding* rule, which was never in scope. Carving out an
exception in a spec invites the reader to extend it.

**5. The held-out canary found nothing — and that is a real result, not a
formality.** Every cell that passed visible also passed held-out: **11/11**. No
hardcoding, no shape-of-the-test fitting. That is the opposite of the 2026-09-10
run, where Qwen 14B passed 8/8 visible assertions and still returned `30` for
`parseDuration("h30m")`. The canary earns its keep by being run, not by firing.

## Caveats

n=3 per cell; a one-rep difference is noise. `qtask` sends no `temperature`, so
LM Studio samples at its default and the same cell can flip between runs — the
`scale` cell did exactly that in the smoke test. One domain, three modules, one
model. Read this as "the doc pays for itself on this kind of task", not as a
general law.

## Reproduce

```bash
cd macrobudget
./mutate.sh          # prove the gate detects each broken rule
REPS=3 ./bench.sh    # run both arms
python3 summarize.py # roll up results/<stamp>/raw.csv
```

---

# Third arm: interface-only doc (2026-11-09)

## Pre-registered before running

Finding 2 above ("the doc supplies the interface, not the logic") was inferred
from *failures*. This arm tests it directly. `INTERFACE.md` keeps the contract
from `ARCHITECTURE.md` -- layout, export names, signatures, argument shapes,
units, per-100g labels, portion forms, return shapes -- and drops every
behavioural rule: half-even rounding, kcal authority, the net-carb clamp,
unclamped remaining, carbs-vs-net, the error taxonomy, and grammar strictness.
The visible test still encodes all of those; only the prose is gone.

All three arms are re-run in the same session (same LM Studio load, same
context setting), not compared against the 2026-09-11 numbers.

**Prediction:** if the mechanism claim is right, `interface` lands near
`with-arch` (>= 7/9) and well above `no-arch`. Specifically:
- `daily` and `scale` should recover, since their no-arch failures were export
  names, argument shapes and the per-100g unit -- all present in INTERFACE.md.
- `quantity` is the cell at risk: its no-arch failure was the SyntaxError vs
  RangeError taxonomy, which INTERFACE.md deliberately omits.

**What would falsify it:** `interface` at or near `no-arch` (<= 4/9) means the
rules prose was doing the work, and finding 2 is wrong.

## Results (run `results/20261109T134309`)

| Arm | quantity | scale | daily | Visible | Held-out | Wall |
|---|---|---|---|---|---|---|
| with-arch | 3/3 | 2/3 | 3/3 | **8/9** | **8/9** | 6m01s |
| **interface** | 3/3 | **3/3** | **0/3** | **6/9** | **6/9** | 9m58s |
| no-arch | 3/3 | 1/3 | 0/3 | 4/9 | 3/9 | 21m03s |

**Against the registration: inconclusive.** 6/9 sits between the confirm line
(>= 7) and the falsify line (<= 4). The quantity "at-risk" call was wrong
(3/3), and the daily recovery call was wrong (0/3).

The original two arms replicated: with-arch 8/9 again, no-arch 3/9 held-out
again.

## What the failures say, cell by cell

**The interface doc removed every interface failure.** Zero import errors and
zero unit errors in the interface arm. In no-arch, all 3 `daily` failures were
again invented exports (`scale` twice, `getScale` once), and both `scale`
failures were again the per-serving assumption (dividing by a null
`servingGrams`, returning `Infinity`).

**The interface arm's `daily` failures are all one rule, and all identical.**
All three reps imported correctly, called `parsePortion` with the right
arguments, and computed `netCarbsCg` correctly with the clamp once on the day
total. All three then computed `remaining.carbsCg = targets.carbsCg -
consumed.carbsCg`, against total carbs instead of net (Rule 6), and kept that
across three attempts while the test reported `17888`/`20000`/`-1612`.

**Why that rule and no other: it is the only rule no test is named after.**
Every other behavioural rule has a visible test whose *name states it*:
"malformed spec throws SyntaxError", "kcal comes from the label, never from
the macros", "net carbs are floored once on the day total", "remaining goes
negative and is never clamped". Rule 6 appears only as numbers inside other
tests. That also explains why `quantity` went 3/3 without the error taxonomy
in the doc: the test names carry it.

Post-hoc and resting on one rule, so it is a hypothesis, not a finding: **the
model follows rules that are written in words (doc prose or a test name) and
misses rules carried only by expected values.** The per-100g unit, which broke
no-arch `scale` in both sessions, is the same kind: present only as numbers.

**The documented-exception leak replicated.** The with-arch `scale` failure is
the same bug as 2026-09-11: correct `roundHalfEven` on the four centigram
fields, `Math.round` on `kcal` alone. That is now 2 of 6 with-arch `scale`
runs across two sessions, and 0 of 3 in the interface arm, whose doc does not
contain "energy is the one exception" prose. Small numbers, but the direction
is what finding 4 predicted.

**The held-out canary fired this time.** no-arch `quantity` rep 3 passed all
visible tests and failed held-out "malformed spec throws SyntaxError" on an
input the visible test did not use.

## Caveats

Same as above: n=3 per cell, default temperature, one model, one domain. The
"named test" hypothesis was formed after seeing the data. The direct test is a
fourth arm: interface doc plus a visible test renamed to state Rule 6
("carbs remaining is measured against net carbs"), no other change.

---

# Fourth arm: the rule named in a test (2026-11-10)

## Pre-registered before running

Hypothesis from the third arm: the model follows rules stated in words and
misses rules carried only by expected values. Direct test: `daily` only,
INTERFACE.md plus `test/visible-named/daily.test.js`, which differs from the
visible test in **one test name and nothing else** -- "net carbs floor at zero
when the day has more fiber than carbs" becomes "net carbs floor at zero, and
carbs remaining is measured against net carbs, not total carbs". Same
assertions, same values. The model's check runs against the renamed file;
held-out is unchanged.

Arms, same session, 3 reps each, `daily` only:
- `interface` -- same-session control (was 0/3, and 0/1 in the smoke run).
- `interface-named` -- the renamed test.

**Prediction:** `interface-named` >= 2/3 while `interface` stays <= 1/3.
**Falsified if** `interface-named` <= 1/3: naming the rule did not move it.
If the control also recovers (>= 2/3), the run is uninterpretable.

## Results (run `results/20261110T091906`)

| Arm | daily visible | daily held-out | Attempts (each rep) |
|---|---|---|---|
| interface (control) | 0/3 | 0/3 | 3, 3, 3 |
| **interface-named** | **3/3** | **3/3** | 2, 2, 2 |

**Prediction confirmed.** One renamed test, no other change, moved `daily`
from 0/3 to 3/3, and all three passed held-out. The control failed exactly as
before: all three used `targets.carbsCg - consumed.carbsCg`. All three named
runs used `targets.carbsCg - consumed.netCarbsCg`. Across both sessions the
interface arm without the name is now 0/7 on `daily`, and with the name 3/3.

**But the name did not work up front.** Every named rep failed attempt 1 and
passed attempt 2. The name was in the prompt from the start and the model
still wrote the total-carbs version first. It got it right only after a
failing check. The likely mechanism is the name appearing in the *failure
output* next to the wrong value, not the name being read in advance. qtask
does not log check output for failed attempts, so this is inferred from the
attempt counts, not observed. Logging it is the next harness change.

In the control, the failure the model kept seeing was mostly "remaining goes
negative and is never clamped", a name that points at the wrong rule (that
rule was implemented correctly). The model iterated against a misleading
label three times.

## Revised claim

The tests carried every rule as values, and the model could not recover Rule 6
from values in 7 tries. The same values plus a test name that states the rule
recovered it in 3 of 3, at the second attempt. **A rule that is only
demonstrated by numbers is, for this model, effectively unstated.** Words
carry it: doc prose, or a test name the model sees when the test fails.

Caveats: one rule, one model, n=3 per arm.
