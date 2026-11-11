export function roundHalfEven(x) {
  const floor = Math.floor(x);
  const diff = x - floor;

  if (diff === 0.5) {
    return floor % 2 === 0 ? floor : floor + 1;
  }

  return Math.round(x);
}

export function scaleLabel(label, grams) {
  const ratio = grams / 100;

  // Rule 3: energy is never recomputed. 
  // Rule 1: scaled = roundHalfEven(labelValue * grams / 100)
  // However, the test "kcal comes from the label" implies that for kcal, 
  // we don't apply the roundHalfEven scaling logic, but just standard scaling.
  // Re-reading Rule 1 vs Rule 3: "kcal is scaled from label.kcal and 
  // from nothing else." 
  // Looking at the failure: actual kcal 5 was expected 4. 
  // 150 * (3 / 100) = 4.5. roundHalfEven(4.5) is 4.
  // Therefore, kcal MUST also use roundHalfEven.
  
  const kcal = roundHalfEven(label.kcal * ratio);
  const proteinCg = roundHalfEven(label.proteinCg * ratio);
  const carbsCg = roundHalfEven(label.carbsCg * ratio);
  const fiberCg = roundHalfEven(label.fiberCg * ratio);
  const fatCg = roundHalfEven(label.fatCg * ratio);

  return {
    kcal,
    proteinCg,
    carbsCg,
    fiberCg,
    fatCg,
  };
}
