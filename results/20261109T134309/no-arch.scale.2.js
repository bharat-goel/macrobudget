export function roundHalfEven(num) {
  const f = Math.floor(num);
  const d = num - f;
  if (Math.abs(d - 0.5) < Number.EPSILON) {
    return f % 2 === 0 ? f : f + 1;
  }
  return Math.round(num);
}

export function scaleLabel(label, portionGrams) {
  const ratio = portionGrams / 100;

  return {
    kcal: roundHalfEven(label.kcal * ratio),
    proteinCg: roundHalfEven(label.proteinCg * ratio),
    carbsCg: roundHalfEven(label.carbsCg * ratio),
    fiberCg: roundHalfEven(label.fiberCg * ratio),
    fatCg: roundHalfEven(label.fatCg * ratio),
  };
}
