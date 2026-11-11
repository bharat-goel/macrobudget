# macrobudget

A tiny nutrition-log library. Takes packaged-food label data and a logged
portion, and works out what a day adds up to against a target.

<!--
  Interface-only variant of ARCHITECTURE.md, for the third bench arm.
  It keeps the contract a caller needs: file layout, export names, signatures,
  argument shapes, units, input formats, return shapes.
  It deliberately drops every behavioural rule: rounding mode, kcal authority,
  the net-carb clamp, unclamped remaining, carbs-vs-net, the error taxonomy
  and the strictness of the portion grammar. The visible test still encodes
  those; this doc does not state them.
-->

## Layout

```
src/quantity.js   parse a portion spec string into whole grams
src/scale.js      scale a per-100g label down to one portion
src/daily.js      aggregate scaled portions into a day total vs. a target
```

`daily.js` imports from both of the others. ES modules, named exports only.

## Units

Every nutrient mass is an integer number of centigrams (cg): hundredths of a
gram. A label reading 10.5 g of protein is stored as `1050`. Energy is an
integer number of kcal. Portion sizes are integer grams.

## The label record

All nutrient fields are **per 100 g of product**, as printed on the package.

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

## `src/quantity.js`

```js
export function parsePortion(spec, servingGrams)  // -> integer grams
```

`servingGrams` is a number (or `null`), not a label object. `spec` takes one
of three forms:

| Form | Example | Result |
|---|---|---|
| `<n>g` | `"120g"` | `120` |
| `<n>x<m>g` | `"3x30g"` | `90` |
| `<n>serv` | `"2serv"` | `2 * servingGrams` |

Invalid input throws.

## `src/scale.js`

```js
export function roundHalfEven(x)                  // -> integer
export function scaleLabel(label, grams)          // -> scaled entry
```

`scaleLabel` takes a whole label record and integer grams, and returns exactly
these five integer keys:

```js
{ kcal, proteinCg, carbsCg, fiberCg, fatCg }
```

## `src/daily.js`

```js
export function summarizeDay(entries, targets)
```

`entries` is an array of `{ label, portion }`, where `portion` is a spec string
for `parsePortion`, and the serving size comes from that entry's own
`label.servingGrams`.

`targets` is `{ kcal, proteinCg, carbsCg, fatCg }`.

Return shape:

```js
{
  consumed:  { kcal, proteinCg, carbsCg, fiberCg, fatCg, netCarbsCg },
  remaining: { kcal, proteinCg, carbsCg, fatCg }
}
```
