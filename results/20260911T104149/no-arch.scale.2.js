export function roundHalfEven(num) {
  const f = Math.floor(num);
  const diff = num - f;
  if (diff === 0.5) {
    return f % 2 === 0 ? f : f + 1;
  }
  return Math.round(num);
}

export function scaleLabel(label, portionGrams) {
  const ratio = portionGrams / 100;
  const result = {};

  const macros = ["proteinCg", "carbsCg", "fiberCg", "fatCg"];
  
  macros.forEach(key => {
    const scaled = label[key] * ratio;
    result[key] = roundHalfEven(scaled);
  });

  // kcal logic: if servingGrams is null, it scales based on the portion/100 logic
  // but if it's provided, it scales based on the label's kcal / label.servingGrams * portionGrams
  // Wait, looking at YOGURT: (59 / 170) * 170 = 59. But test says 100.
  // Let's re-calculate: YOGURT kcal 59, serving 170, portion 170.
  // If result.kcal = 100 and portion = 170, and ratio = 170/100 = 1.7.
  // 59 * 1.7 = 100.3. Round(100.3) = 100.
  // So kcal also uses the 100 base ratio regardless of servingGrams?
  // Let's check CONFLICT: kcal 100, serving null, portion 50.
  // 100 * (50 / 100) = 50. Matches.
  // Let's check TIE: kcal 150, serving null, portion 3.
  // 150 * (3 / 100) = 4.5. RoundHalfEven(4.5) = 4. Matches!
  
  result.kcal = roundHalfEven(label.kcal * ratio);

  return result;
}
