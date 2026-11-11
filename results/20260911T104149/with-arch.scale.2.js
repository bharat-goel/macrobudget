export function roundHalfEven(x) {
  const rounded = Math.round(x);
  const diff = Math.abs(x - rounded);
  if (diff === 0.5) {
    return rounded % 2 === 0 ? rounded : rounded - 1;
  }
  return rounded;
}

export function scaleLabel(label, grams) {
  const scale = grams / 100;

  const scaleMacro = (val) => roundHalfEven(val * scale);

  return {
    kcal: scaleMacro(label.kcal),
    proteinCg: scaleMacro(label.proteinCg),
    carbsCg: scaleMacro(label.carbsCg),
    fiberCg: scaleMacro(label.fiberCg),
    fatCg: scaleMacro(label.fatCg),
  };
}
