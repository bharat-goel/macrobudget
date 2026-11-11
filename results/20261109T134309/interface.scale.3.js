export function roundHalfEven(x) {
  const floor = Math.floor(x);
  const diff = x - floor;

  if (diff < 0.5) {
    return floor;
  } else if (diff > 0.5) {
    return floor + 1;
  } else {
    return floor % 2 === 0 ? floor : floor + 1;
  }
}

export function scaleLabel(label, grams) {
  const ratio = grams / 100;

  const scale = (value) => roundHalfEven(value * ratio);

  // Special case for kcal: the label is per 100g, 
  // but the test implies kcal scales linearly (100kcal/100g -> 50kcal/50g).
  // The conflict test confirms we use the label's kcal value, not calculated from macros.
  return {
    kcal: roundHalfEven(label.kcal * ratio),
    proteinCg: scale(label.proteinCg),
    carbsCg: scale(label.carbsCg),
    fiberCg: scale(label.fiberCg),
    fatCg: scale(label.fatCg),
  };
}
