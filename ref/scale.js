export function roundHalfEven(x) {
  const f = Math.floor(x);
  const diff = x - f;
  if (diff > 0.5) return f + 1;
  if (diff < 0.5) return f;
  return f % 2 === 0 ? f : f + 1;
}

export function scaleLabel(label, grams) {
  const at = (v) => roundHalfEven((v * grams) / 100);
  return {
    kcal: at(label.kcal),
    proteinCg: at(label.proteinCg),
    carbsCg: at(label.carbsCg),
    fiberCg: at(label.fiberCg),
    fatCg: at(label.fatCg),
  };
}
