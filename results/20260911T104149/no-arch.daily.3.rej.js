import { parseQuantity } from "./quantity.js";
import { scale } from "./scale.js";

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
    const multiplier = parseQuantity(portion, label);

    consumed.kcal += label.kcal * multiplier;
    consumed.proteinCg += label.proteinCg * multiplier;
    consumed.carbsCg += label.carbsCg * multiplier;
    consumed.fiberCg += label.fiberCg * multiplier;
    consumed.fatCg += label.fatCg * multiplier;
  }

  consumed.netCarbsCg = Math.max(0, Math.floor(consumed.carbsCg - consumed.fiberCg));

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
