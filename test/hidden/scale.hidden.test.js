import { test } from "node:test";
import assert from "node:assert/strict";
import { roundHalfEven, scaleLabel } from "../../src/scale.js";

const OATS = { name: "rolled oats", kcal: 389, proteinCg: 1690, carbsCg: 6600, fiberCg: 1060, fatCg: 690, servingGrams: 40 };
const WHEY = { name: "whey isolate", kcal: 400, proteinCg: 8000, carbsCg: 700, fiberCg: 200, fatCg: 500, servingGrams: 30 };
// every field lands exactly on .5 at a 1 g portion
const TIE = { name: "tie", kcal: 350, proteinCg: 650, carbsCg: 750, fiberCg: 850, fatCg: 950, servingGrams: null };
// 4/4/9 on these macros gives 290, not 250
const CONFLICT = { name: "conflict", kcal: 250, proteinCg: 2000, carbsCg: 3000, fiberCg: 0, fatCg: 1000, servingGrams: null };

test("hidden: roundHalfEven ties", () => {
  assert.equal(roundHalfEven(6.5), 6);
  assert.equal(roundHalfEven(7.5), 8);
  assert.equal(roundHalfEven(8.5), 8);
  assert.equal(roundHalfEven(9.5), 10);
  assert.equal(roundHalfEven(10.5), 10);
});

test("hidden: roundHalfEven non-ties", () => {
  assert.equal(roundHalfEven(6.4), 6);
  assert.equal(roundHalfEven(6.6), 7);
  assert.equal(roundHalfEven(12), 12);
});

test("hidden: scales labels", () => {
  assert.deepEqual(scaleLabel(OATS, 40), { kcal: 156, proteinCg: 676, carbsCg: 2640, fiberCg: 424, fatCg: 276 });
  assert.deepEqual(scaleLabel(WHEY, 30), { kcal: 120, proteinCg: 2400, carbsCg: 210, fiberCg: 60, fatCg: 150 });
});

test("hidden: half-to-even on exact ties", () => {
  assert.deepEqual(scaleLabel(TIE, 1), { kcal: 4, proteinCg: 6, carbsCg: 8, fiberCg: 8, fatCg: 10 });
});

test("hidden: kcal is taken from the label", () => {
  assert.equal(scaleLabel(CONFLICT, 100).kcal, 250);
  assert.equal(scaleLabel(CONFLICT, 20).kcal, 50);
});

test("hidden: only the five nutrient keys, all integers", () => {
  const out = scaleLabel(OATS, 73);
  assert.deepEqual(Object.keys(out).sort(), ["carbsCg", "fatCg", "fiberCg", "kcal", "proteinCg"]);
  for (const v of Object.values(out)) assert.ok(Number.isInteger(v), `${v} is not an integer`);
});
