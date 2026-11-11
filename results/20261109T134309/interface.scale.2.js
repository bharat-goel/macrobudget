export function roundHalfEven(x) {
  const f = Math.floor(x);
  const r = x - f;
  if (r === 0.5) {
    return f % 2 === 0 ? f : f + 1;
  }
  return Math.round(x);
}

export function scaleLabel(label, grams) {
  const ratio = grams / 100;
  return {
    kcal: roundHalfEven(label.kcal * ratio),
    proteinCg: roundHalfEven(label.proteinCg * ratio),
    carbsCg: roundHalfEven(label.carbsCg * ratio),
    fiberCg: roundHalfEven(label.fiberCg * ratio),
    fatCg: roundHalfEven(label.fatCg * ratio),
  };
}
