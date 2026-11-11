export function roundHalfEven(x) {
  const rounded = Math.round(x);
  const diff = Math.abs(x - rounded);
  if (diff === 0.5) {
    return rounded % 2 === 0 ? rounded : rounded - 1;
  }
  return rounded;
}

export function scaleLabel(label, grams) {
  const factor = grams / 100;
  const kcal = roundHalfEven(label.kcal * factor);
  const proteinCg = roundHalfEven(label.proteinCg * factor);
  const carbsCg = roundHalfEven(label.carbsCg * factor);
  const fiberCg = roundHalfEven(label.fiberCg * factor);
  const fatCg = roundHalfEven(label.fatCg * factor);

  return {
    kcal,
    proteinCg,
    carbsCg,
    fiberCg,
    fatCg,
  };
}
