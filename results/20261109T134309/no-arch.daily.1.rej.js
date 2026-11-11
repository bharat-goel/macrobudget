import { parsePortion } from "./quantity.js";
import { getScale } from "./scale.js";

export function summarizeDay(entries, targets) {
  const consumed = {
    kcal: 0,
    proteinCg: 0,
    carbsCg: 0,
    fiberCg: 0,
    fatCg: 0,
    netCarbsCg: 0,
  };

  for (const entry of entries) {
    const { label, portion } = entry;
    const amount = parsePortion(portion, label);

    consumed.kcal += label.kcal * amount;
    consumed.proteinCg += label.proteinCg * amount;
    consumed.carbsCg += label.carbsCg * amount;
    consumed.fiberCg += label.fiberCg * amount;
    consumed.fatCg += label.fatCg * amount;
  }

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
