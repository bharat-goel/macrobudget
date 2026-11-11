import { parsePortion } from "./quantity.js";
import { scaleLabel } from "./scale.js";

export function summarizeDay(entries, targets) {
  const consumed = {
    kcal: 0,
    proteinCg: 0,
    carbsCg: 0,
    fiberCg: 0,
    fatCg: 0,
    netCarbsCg: 0,
  };

  for (const { label, portion } of entries) {
    const grams = parsePortion(portion, label.servingGrams);
    const scaled = scaleLabel(label, grams);

    consumed.kcal += scaled.kcal;
    consumed.proteinCg += scaled.proteinCg;
    consumed.carbsCg += scaled.carbsCg;
    consumed.fiberCg += scaled.fiberCg;
    consumed.fatCg += scaled.fatCg;
  }

  // Net carbs calculation: floor(sum(carbs) - sum(fiber)) at zero
  // The requirement is "net carbs are floored once on the day total"
  // The test expects (carbsCg - fiberCg) to be calculated based on the 
  // totals, and the "remaining" value is calculated from the original targets 
  // and the "carbsCg" total (not netCarbsCg).
  consumed.netCarbsCg = Math.max(0, consumed.carbsCg - consumed.fiberCg);

  const remaining = {
    kcal: targets.kcal - consumed.kcal,
    proteinCg: targets.proteinCg - consumed.proteinCg,
    carbsCg: targets.carbsCg - consumed.carbsCg,
    fatCg: targets.fatCg - consumed.fatCg,
  };

  return {
    consumed,
    remaining,
  };
}
