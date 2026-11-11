# macrobudget

A tiny nutrition-log library. Takes packaged-food label data and a logged
portion, and works out what a day adds up to against a target.

Deliberately small, deliberately opinionated. The conventions below are not the
obvious defaults; code that ignores them will look right and compute wrong.

## Layout

```
src/quantity.js   parse a portion spec string into whole grams
src/scale.js      scale a per-100g label down to one portion
src/daily.js      aggregate scaled portions into a day total vs. a target
```

`daily.js` imports from both of the others. Nothing imports `daily.js`.

## Code conventions

1. **ES modules, named exports only.** No `export default` anywhere.
2. No dependencies. Node's built-in test runner only.
3. **No floats in stored or returned values.** Every nutrient value that
   crosses a function boundary is an integer. Floats may exist only inside a
   single expression, never in a return value.
4. No `Date`, no locale-sensitive APIs, no `toLocaleString`.

## Units

**Every nutrient mass is an integer number of centigrams (cg): hundredths of a
gram.** A label reading 10.5 g of protein is stored as `1050`. Energy is the
one exception: it is an integer number of kcal, not centigrams.

Grams (portion sizes) are plain integers, because you cannot log a fraction of
a gram.

## The label record

All nutrient fields are **per 100 g of product**, exactly as printed on the
package.

```js
{
  name: "greek yogurt",
  kcal: 59,           // per 100 g, integer kcal
  proteinCg: 1000,    // per 100 g, centigrams
  carbsCg: 360,
  fiberCg: 0,
  fatCg: 40,
  servingGrams: 170   // integer, or null if the package declares no serving
}
```

## Module 1 — `src/quantity.js`

```js
export function parsePortion(spec, servingGrams)  // -> integer grams
```

`spec` is trimmed of leading and trailing whitespace, then must match exactly
one of three forms. **No internal whitespace is permitted** in any form.

| Form | Example | Result |
|---|---|---|
| `<n>g` | `"120g"` | `120` |
| `<n>x<m>g` | `"3x30g"` | `90` |
| `<n>serv` | `"2serv"` | `2 * servingGrams` |

`<n>` and `<m>` are runs of ASCII digits. That means `"-5g"`, `"1.5g"`,
`"120 g"`, `"120G"`, `"120"` and `""` all fail to match.

**Errors are two different kinds, and the distinction matters:**

- `spec` is not a string → **`TypeError`**
- `spec` does not match one of the three forms → **`SyntaxError`**
- `spec` matches a form, but the resulting grams is `0` → **`RangeError`**
- `spec` is the `<n>serv` form and `servingGrams` is `null` → **`RangeError`**

A malformed string and a well-formed impossible value are not the same failure.
Throwing `SyntaxError` for both, or `Error` for either, is wrong.

## Module 2 — `src/scale.js`

```js
export function roundHalfEven(x)                  // -> integer
export function scaleLabel(label, grams)          // -> scaled entry
```

**Rule 1 — scaling.** A label is per 100 g. For a portion of `grams`:

```
scaled = roundHalfEven(labelValue * grams / 100)
```

**Rule 2 — round half to even, not half up.** When the scaled value lands
exactly on `.5`, round to the **nearest even integer**. `4.5` becomes `4`.
`5.5` becomes `6`. `2.5` becomes `2`. This is banker's rounding; it is not
`Math.round`, and the difference shows up only on exact ties, which is why it
is easy to ship wrong. Values that are not exact ties round normally.

**Rule 3 — energy is never recomputed.** `kcal` is scaled from `label.kcal` and
from nothing else. Packaged-label energy routinely disagrees with 4/4/9 applied
to the same label's macros, because of sugar alcohols, fiber and rounding on
the package itself. **The label is authoritative.** No code in this library may
derive kcal from protein, carbs or fat.

`scaleLabel` returns exactly these five keys, all integers:

```js
{ kcal, proteinCg, carbsCg, fiberCg, fatCg }
```

It does not return `name` or `servingGrams`.

## Module 3 — `src/daily.js`

```js
export function summarizeDay(entries, targets)
```

`entries` is an array of `{ label, portion }`, where `portion` is a spec string
for `parsePortion` and the serving size comes from that entry's own
`label.servingGrams`.

`targets` is `{ kcal, proteinCg, carbsCg, fatCg }` — note there is no fiber
target.

**Rule 4 — net carbs are computed once, on the day total.** European labels
include fiber inside the carbohydrate figure, so:

```
netCarbsCg = max(0, totalCarbsCg - totalFiberCg)
```

The clamp at zero applies **to the day total, once**, after everything has been
summed. Flooring each entry at zero and then adding the entries up gives a
different — and wrong — answer whenever one item has more fiber than carbs.

**Rule 5 — remaining is never clamped.** Remaining is `target - consumed`, and
it goes negative when the target is exceeded. A negative remaining is the entire
point of a budget; clamping it at zero destroys the only signal the caller
wants.

**Rule 6 — carbs remaining is measured against net carbs**, not total carbs:

```
remaining.carbsCg = targets.carbsCg - consumed.netCarbsCg
```

Protein, fat and kcal remaining are measured against their own consumed totals.

Return shape:

```js
{
  consumed:  { kcal, proteinCg, carbsCg, fiberCg, fatCg, netCarbsCg },
  remaining: { kcal, proteinCg, carbsCg, fatCg }
}
```

An empty `entries` array yields all-zero `consumed` (including `netCarbsCg`)
and a `remaining` equal to `targets`.
