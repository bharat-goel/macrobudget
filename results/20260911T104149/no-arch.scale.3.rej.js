export function roundHalfEven(num) {
  const f = Math.floor(num);
  const d = num - f;
  if (Math.abs(d - 0.5) < 0.0000000001) {
    return f % 2 === 0 ? f : f + 1;
  }
  return Math.round(num);
}

export function scaleLabel(label, portion) {
  const servingGrams = label.servingGrams ?? 1;
  const ratio = portion / servingGrams;

  return {
    kcal: Math.round(label.kcal * ratio),
    proteinCg: roundHalfEven(label.proteinCg * ratio),
    carbsCg: roundHalfEven(label.carbsCg * ratio),
    fiberCg: roundHalfEven(label.fiberCg * ratio),
    fatCg: roundHalfEven(label.fatCg * ratio),
  };
}
