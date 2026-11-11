export function roundHalfEven(num) {
  const integerPart = Math.floor(num);
  const fractionalPart = num - integerPart;

  if (fractionalPart === 0.5) {
    return integerPart % 2 === 0 ? integerPart : integerPart + 1;
  }
  return Math.round(num);
}

export function scaleLabel(label, portion) {
  const ratio = portion / label.servingGrams;
  const result = {};

  const nutrients = ["kcal", "proteinCg", "carbsCg", "fiberCg", "fatCg"];

  for (const key of nutrients) {
    if (key === "kcal") {
      result[key] = Math.round(label.kcal * ratio);
    } else {
      result[key] = roundHalfEven(label[key] * ratio);
    }
  }

  return result;
}
