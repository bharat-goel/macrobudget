export function roundHalfEven(x) {
  const f = x % 1;
  if (Math.abs(f) === 0.5) {
    const i = Math.floor(x);
    return i % 2 === 0 ? i : i + 1;
  }
  return Math.round(x);
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
