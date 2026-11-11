import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeDay } from "../../src/daily.js";

const YOGURT = { name: "greek yogurt", kcal: 59, proteinCg: 1000, carbsCg: 360, fiberCg: 0, fatCg: 40, servingGrams: 170 };
const BAR = { name: "protein bar", kcal: 380, proteinCg: 3000, carbsCg: 4000, fiberCg: 1500, fatCg: 1200, servingGrams: 60 };
const HIGH_FIBER = { name: "psyllium", kcal: 10, proteinCg: 0, carbsCg: 100, fiberCg: 500, fatCg: 0, servingGrams: null };
const LOW_FIBER = { name: "sugar", kcal: 10, proteinCg: 0, carbsCg: 900, fiberCg: 0, fatCg: 0, servingGrams: null };

const TARGETS = { kcal: 2000, proteinCg: 15000, carbsCg: 20000, fatCg: 7000 };

test("sums a day and subtracts from the target", () => {
  const day = summarizeDay([{ label: YOGURT, portion: "1serv" }, { label: BAR, portion: "60g" }], TARGETS);
  assert.deepEqual(day.consumed, { kcal: 328, proteinCg: 3500, carbsCg: 3012, fiberCg: 900, fatCg: 788, netCarbsCg: 2112 });
  assert.deepEqual(day.remaining, { kcal: 1672, proteinCg: 11500, carbsCg: 17888, fatCg: 6212 });
});

test("net carbs are floored once on the day total, not per entry", () => {
  const day = summarizeDay(
    [{ label: HIGH_FIBER, portion: "100g" }, { label: LOW_FIBER, portion: "100g" }],
    TARGETS,
  );
  assert.equal(day.consumed.carbsCg, 1000);
  assert.equal(day.consumed.fiberCg, 500);
  // flooring each entry first and then summing would give 900
  assert.equal(day.consumed.netCarbsCg, 500);
  assert.equal(day.remaining.carbsCg, 19500);
});

test("net carbs floor at zero when the day has more fiber than carbs", () => {
  const day = summarizeDay([{ label: HIGH_FIBER, portion: "100g" }], TARGETS);
  assert.equal(day.consumed.netCarbsCg, 0);
  assert.equal(day.remaining.carbsCg, 20000);
});

test("remaining goes negative and is never clamped", () => {
  const tight = { kcal: 200, proteinCg: 1000, carbsCg: 500, fatCg: 100 };
  const day = summarizeDay([{ label: YOGURT, portion: "1serv" }, { label: BAR, portion: "60g" }], tight);
  assert.equal(day.remaining.kcal, -128);
  assert.equal(day.remaining.proteinCg, -2500);
  assert.equal(day.remaining.carbsCg, -1612);
  assert.equal(day.remaining.fatCg, -688);
});

test("an empty day consumes nothing and leaves the whole target", () => {
  const day = summarizeDay([], TARGETS);
  assert.deepEqual(day.consumed, { kcal: 0, proteinCg: 0, carbsCg: 0, fiberCg: 0, fatCg: 0, netCarbsCg: 0 });
  assert.deepEqual(day.remaining, { kcal: 2000, proteinCg: 15000, carbsCg: 20000, fatCg: 7000 });
});

test("portion specs are resolved against each entry's own label", () => {
  const day = summarizeDay([{ label: BAR, portion: "2serv" }], TARGETS);
  assert.equal(day.consumed.kcal, 456);
  assert.equal(day.consumed.proteinCg, 3600);
});

test("remaining has no fiber key", () => {
  const day = summarizeDay([], TARGETS);
  assert.deepEqual(Object.keys(day.remaining).sort(), ["carbsCg", "fatCg", "kcal", "proteinCg"]);
});
