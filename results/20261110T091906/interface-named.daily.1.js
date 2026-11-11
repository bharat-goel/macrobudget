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

  consumed.netCarbsCg = Math.max(0, Math.floor(consumed.carbsCg - consumed.fiberCg));

  return {
    consumed,
    remaining: {
      kcal: targets.kcal - consumed.kcal,
      proteinCg: targets.proteinCg - consumed.proteinCg,
      carbsCg: targets.carbsCg - consumed.netCarbsCg,
      fatCg: targets.fatCg - consumed.fatCg,
    },
  };
}
