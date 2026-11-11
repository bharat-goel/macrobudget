# macrobudget

A small benchmark for one question: **what does a small local model need to be
told, in words, to implement code against a test suite?**

It is the harness behind the post
[The test name was the spec](https://bharatgoel.com/writing/test-names-are-the-spec).
Full method, every result, and each prediction (written before its run) are in
[`RESULTS.md`](RESULTS.md).

## Headline results

`google/gemma-4-12b-qat` in LM Studio, 3 reps per cell, held-out passes:

| Arm | What the model gets besides the visible test | Held-out |
|---|---|---|
| with-arch | `ARCHITECTURE.md`: interface plus all six behavioural rules | 8/9 |
| interface | `INTERFACE.md`: interface only, no rules | 6/9 |
| no-arch | nothing | 3/9 |
| interface-named (`daily` only) | `INTERFACE.md` plus one test renamed to state a rule | 3/3 (control 0/3) |

Short version: without the interface in prose, the model invents export names
and misreads units. With it, the model follows every rule a test *name* states
and misses the one rule shown only as expected values. Renaming that one test
fixed it. n=3, one model, one domain: read `RESULTS.md` for the caveats.

## Layout

```
ARCHITECTURE.md        full spec: interface + rules (with-arch arm)
INTERFACE.md           interface only (interface arm)
ref/                   reference implementation; proves the gate is passable
src/                   working copy; bench.sh seeds it from ref/ per run
test/visible/          tests the model sees
test/visible-named/    daily test with one test renamed (fourth arm)
test/hidden/           held-out tests with different values; never in a prompt
mutate.sh              breaks each rule in ref/ one at a time; both suites must catch all 8
bench.sh               runs the arms
summarize.py           rolls up results/<stamp>/raw.csv
tools/qtask            the one-shot task runner bench.sh calls (Python 3, no deps)
results/               raw logs, accepted and rejected code for every run
```

`results/smoke-20261109T133832` was a one-rep check that the third arm was
wired correctly. It is not counted in any table. Absolute home-directory paths
in the logs' stack traces were rewritten to `./`; nothing else was edited.

## Reproduce

Needs Node 20+, Python 3, and [LM Studio](https://lmstudio.ai) serving the
model on `127.0.0.1:1234` (override with `QTASK_URL` / `QTASK_MODEL`).

```bash
npm test                      # reference passes the visible suite
npm run test:hidden           # ...and the held-out suite
./mutate.sh                   # gate catches all 8 broken rules
PATH="$PWD/tools:$PATH" REPS=3 ./bench.sh
PATH="$PWD/tools:$PATH" ARMS="interface interface-named" MODS=daily REPS=3 ./bench.sh
python3 summarize.py          # latest results/<stamp>/raw.csv
```

qtask sends no `temperature`, so LM Studio samples at its default and the same
cell can flip between runs. Re-run before believing any single number.

## Known gap

qtask does not log the check output from failed attempts, so the claim that
the renamed test works *through the failure output* is inferred from attempt
counts, not observed. Logging it is the next change.

## License

MIT
