import { test } from "node:test";
import assert from "node:assert/strict";
import { roundHalfEven, scaleLabel } from "../../src/scale.js";

const YOGURT = { name: "greek yogurt", kcal: 59, proteinCg: 1000, carbsCg: 360, fiberCg: 0, fatCg: 40, servingGrams: 170 };
const BAR = { name: "protein bar", kcal: 380, proteinCg: 3000, carbsCg: 4000, fiberCg: 1500, fatCg: 1200, servingGrams: 60 };
// every field of this label lands exactly on .5 at a 3 g portion
const TIE = { name: "tie", kcal: 150, proteinCg: 150, carbsCg: 250, fiberCg: 450, fatCg: 550, servingGrams: null };
// label kcal deliberately disagrees with 4/4/9 on its own macros (which give 170)
const CONFLICT = { name: "conflict", kcal: 100, proteinCg: 1000, carbsCg: 1000, fiberCg: 0, fatCg: 1000, servingGrams: null };

test("roundHalfEven rounds ties to even", () => {
  assert.equal(roundHalfEven(0.5), 0);
  assert.equal(roundHalfEven(1.5), 2);
  assert.equal(roundHalfEven(2.5), 2);
  assert.equal(roundHalfEven(3.5), 4);
  assert.equal(roundHalfEven(4.5), 4);
  assert.equal(roundHalfEven(5.5), 6);
});

test("roundHalfEven rounds non-ties normally", () => {
  assert.equal(roundHalfEven(4.4), 4);
  assert.equal(roundHalfEven(4.6), 5);
  assert.equal(roundHalfEven(7), 7);
});

test("scales a label to a portion", () => {
  assert.deepEqual(scaleLabel(YOGURT, 170), { kcal: 100, proteinCg: 1700, carbsCg: 612, fiberCg: 0, fatCg: 68 });
  assert.deepEqual(scaleLabel(BAR, 60), { kcal: 228, proteinCg: 1800, carbsCg: 2400, fiberCg: 900, fatCg: 720 });
});

test("scaling uses half-to-even on exact ties", () => {
  assert.deepEqual(scaleLabel(TIE, 3), { kcal: 4, proteinCg: 4, carbsCg: 8, fiberCg: 14, fatCg: 16 });
});

test("kcal comes from the label, never from the macros", () => {
  assert.equal(scaleLabel(CONFLICT, 100).kcal, 100);
  assert.equal(scaleLabel(CONFLICT, 50).kcal, 50);
});

test("returns exactly the five nutrient keys", () => {
  assert.deepEqual(Object.keys(scaleLabel(YOGURT, 100)).sort(), ["carbsCg", "fatCg", "fiberCg", "kcal", "proteinCg"]);
});

test("every returned value is an integer", () => {
  for (const v of Object.values(scaleLabel(YOGURT, 37))) assert.ok(Number.isInteger(v), `${v} is not an integer`);
});
