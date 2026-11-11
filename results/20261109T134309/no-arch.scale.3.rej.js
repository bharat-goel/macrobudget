export function roundHalfEven(n) {
  const rounded = Math.round(n);
  const diff = Math.abs(n - rounded);
  if (diff === 0.5) {
    return rounded % 2 === 0 ? rounded : rounded - 1;
  }
  return rounded;
}

export function scaleLabel(label, grams) {
  const ratio = grams / label.servingGrams;
  return {
    kcal: Math.round(label.kcal * ratio),
    proteinCg: roundHalfEven(label.proteinCg * ratio),
    carbsCg: roundHalfEven(label.carbsCg * ratio),
    fiberCg: roundHalfEven(label.fiberCg * ratio),
    fatCg: roundHalfEven(label.fatCg * ratio),
  };
}
