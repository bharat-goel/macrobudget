import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeDay } from "../../src/daily.js";

const OATS = { name: "rolled oats", kcal: 389, proteinCg: 1690, carbsCg: 6600, fiberCg: 1060, fatCg: 690, servingGrams: 40 };
const WHEY = { name: "whey isolate", kcal: 400, proteinCg: 8000, carbsCg: 700, fiberCg: 200, fatCg: 500, servingGrams: 30 };
const HIGH_FIBER = { name: "bran", kcal: 5, proteinCg: 0, carbsCg: 200, fiberCg: 900, fatCg: 0, servingGrams: null };
const LOW_FIBER = { name: "honey", kcal: 5, proteinCg: 0, carbsCg: 1400, fiberCg: 0, fatCg: 0, servingGrams: null };

const TARGETS = { kcal: 2200, proteinCg: 16000, carbsCg: 18000, fatCg: 6500 };

test("hidden: day total and remaining", () => {
  const day = summarizeDay([{ label: OATS, portion: "40g" }, { label: WHEY, portion: "1serv" }], TARGETS);
  assert.deepEqual(day.consumed, { kcal: 276, proteinCg: 3076, carbsCg: 2850, fiberCg: 484, fatCg: 426, netCarbsCg: 2366 });
  assert.deepEqual(day.remaining, { kcal: 1924, proteinCg: 12924, carbsCg: 15634, fatCg: 6074 });
});

test("hidden: net carbs floored once on the total", () => {
  const day = summarizeDay([{ label: HIGH_FIBER, portion: "100g" }, { label: LOW_FIBER, portion: "100g" }], TARGETS);
  assert.equal(day.consumed.carbsCg, 1600);
  assert.equal(day.consumed.fiberCg, 900);
  // per-entry flooring would give 1400
  assert.equal(day.consumed.netCarbsCg, 700);
  assert.equal(day.remaining.carbsCg, 17300);
});

test("hidden: net carbs clamp at zero on the total", () => {
  const day = summarizeDay([{ label: HIGH_FIBER, portion: "100g" }], TARGETS);
  assert.equal(day.consumed.netCarbsCg, 0);
  assert.equal(day.remaining.carbsCg, 18000);
});

test("hidden: remaining is not clamped", () => {
  const tight = { kcal: 100, proteinCg: 3000, carbsCg: 2000, fatCg: 400 };
  const day = summarizeDay([{ label: OATS, portion: "40g" }, { label: WHEY, portion: "1serv" }], tight);
  assert.equal(day.remaining.kcal, -176);
  assert.equal(day.remaining.proteinCg, -76);
  assert.equal(day.remaining.carbsCg, -366);
  assert.equal(day.remaining.fatCg, -26);
});

test("hidden: empty day", () => {
  const day = summarizeDay([], TARGETS);
  assert.deepEqual(day.consumed, { kcal: 0, proteinCg: 0, carbsCg: 0, fiberCg: 0, fatCg: 0, netCarbsCg: 0 });
  assert.deepEqual(day.remaining, { kcal: 2200, proteinCg: 16000, carbsCg: 18000, fatCg: 6500 });
});

test("hidden: multi-serving portions", () => {
  const day = summarizeDay([{ label: WHEY, portion: "2serv" }], TARGETS);
  assert.equal(day.consumed.kcal, 240);
  assert.equal(day.consumed.proteinCg, 4800);
});
