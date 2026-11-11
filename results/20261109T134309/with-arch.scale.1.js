export function roundHalfEven(x) {
  const integerPart = Math.floor(x);
  const fractionalPart = x - integerPart;

  if (fractionalPart === 0.5) {
    return integerPart % 2 === 0 ? integerPart : integerPart + 1;
  }

  return Math.round(x);
}

export function scaleLabel(label, grams) {
  const scale = grams / 100;

  const kcal = label.kcal * scale;
  const proteinCg = label.proteinCg * scale;
  const carbsCg = label.carbsCg * scale;
  const fiberCg = label.fiberCg * scale;
  const fatCg = label.fatCg * scale;

  return {
    kcal: roundHalfEven(kcal),
    proteinCg: roundHalfEven(proteinCg),
    carbsCg: roundHalfEven(carbsCg),
    fiberCg: roundHalfEven(fiberCg),
    fatCg: roundHalfEven(fatCg),
  };
}
