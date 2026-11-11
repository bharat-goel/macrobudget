export function roundHalfEven(x) {
  const rounded = Math.round(x);
  if (Math.abs(x - rounded) === 0.5) {
    return rounded % 2 === 0 ? rounded : rounded - 1;
  }
  return rounded;
}

export function scaleLabel(label, grams) {
  const scale = grams / 100;

  return {
    kcal: Math.round(label.kcal * scale),
    proteinCg: roundHalfEven(label.proteinCg * scale),
    carbsCg: roundHalfEven(label.carbsCg * scale),
    fiberCg: roundHalfEven(label.fiberCg * scale),
    fatCg: roundHalfEven(label.fatCg * scale),
  };
}
