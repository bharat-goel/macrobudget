export function roundHalfEven(x) {
  const integerPart = Math.floor(x);
  const fractionalPart = x - integerPart;

  if (fractionalPart === 0.5) {
    return integerPart % 2 === 0 ? integerPart : integerPart + 1;
  }

  return Math.round(x);
}

export function scaleLabel(label, grams) {
  const scaleFactor = grams / 100;

  // Rule 3: kcal is scaled from label.kcal and from nothing else.
  // Note: The test "kcal comes from the label, never from the macros" 
  // implies kcal is scaled linearly by the weight, but the "Rule 3" 
  // text says "kcal is scaled from label.kcal". 
  // Looking at the YOGURT test: (59 * 170 / 100) = 100.3 -> 100.
  // Looking at the CONFLICT test: (100 * 50 / 100) = 50.
  // This means kcal follows the same scaling logic as macros.
  
  const scale = (val) => roundHalfEven(val * scaleFactor);

  return {
    kcal: scale(label.kcal),
    proteinCg: scale(label.proteinCg),
    carbsCg: scale(label.carbsCg),
    fiberCg: scale(label.fiberCg),
    fatCg: scale(label.fatCg),
  };
}
