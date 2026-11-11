import { parseQuantity } from "./quantity.js";
import { scaleByPortion } from "./scale.js";

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
    const quantity = parseQuantity(portion);
    const scaled = scaleByPortion(label, quantity);

    consumed.kcal += scaled.kcal;
    consumed.proteinCg += scaled.proteinCg;
    consumed.carbsCg += scaled.carbsCg;
    consumed.fiberCg += scaled.fiberCg;
    consumed.fatCg += scaled.fatCg;
  }

  consumed.netCarbsCg = Math.max(0, consumed.carbsCg - consumed.fiberCg);

  const remaining = {};
  for (const key of ["kcal", "proteinCg", "carbsCg", "fatCg"]) {
    remaining[key] = targets[key] - consumed[key];
  }

  return { consumed, remaining };
}
