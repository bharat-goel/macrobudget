export function roundHalfEven(x) {
  const f = Math.floor(x);
  const d = x - f;
  if (d < 0.5) {
    return f;
  } else if (d > 0.5) {
    return f + 1;
  } else {
    return f % 2 === 0 ? f : f + 1;
  }
}

export function scaleLabel(label, grams) {
  const factor = grams / 100;
  
  // Kcal is special: it's an integer on the label, 
  // and the test shows it scales linearly without rounding 
  // until the very end or if it's a specific fractional case.
  // Looking at CONFLICT: 100 kcal * (50/100) = 50.
  // Looking at YOGURT: 59 * (170/100) = 100.3 -> 100.
  // This suggests kcal is scaled then rounded half-even.
  const scaledKcal = roundHalfEven(label.kcal * factor);

  return {
    kcal: scaledKcal,
    proteinCg: roundHalfEven(label.proteinCg * factor),
    carbsCg: roundHalfEven(label.carbsCg * factor),
    fiberCg: roundHalfEven(label.fiberCg * factor),
    fatCg: roundHalfEven(label.fatCg * factor),
  };
}
