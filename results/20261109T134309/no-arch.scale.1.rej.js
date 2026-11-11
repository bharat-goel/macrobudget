export function roundHalfEven(num) {
  const f = Math.floor(num);
  const d = num - f;
  if (d === 0.5) {
    return f % 2 === 0 ? f : f + 1;
  }
  return Math.round(num);
}

export function scaleLabel(label, portionGrams) {
  const ratio = portionGrams / label.servingGrams;
  const result = {};

  // kcal is scaled linearly but rounded normally (Math.round)
  // Wait, looking at the requirements:
  // "kcal comes from the label, never from the macros" means kcal = (label.kcal * ratio)
  // But "every returned value is an integer" implies rounding.
  // The test "kcal comes from the label" shows scaleLabel(CONFLICT, 50) is 50.
  // Since CONFLICT.kcal is 100 and 50/100 is 0.5, 100 * 0.5 = 50.
  // So kcal is (label.kcal * ratio) rounded.
  
  result.kcal = Math.round(label.kcal * ratio);
  result.proteinCg = roundHalfEven(label.proteinCg * ratio);
  result.carbsCg = roundHalfEven(label.carbsCg * ratio);
  result.fiberCg = roundHalfEven(label.fiberCg * ratio);
  result.fatCg = roundHalfEven(label.fatCg * ratio);

  return result;
}
