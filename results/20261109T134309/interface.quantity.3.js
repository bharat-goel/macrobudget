export function parsePortion(spec, servingGrams) {
  if (typeof spec !== "string") {
    throw new TypeError("Spec must be a string");
  }

  const trimmed = spec.trim();

  // Regex patterns for the three valid forms:
  // 1. <n>g (where n is integer)
  // 2. <n>x<m>g (where n and m are integers)
  // 3. <n>serv (where n is integer)
  const gramMatch = trimmed.match(/^(\d+)g$/);
  const multiplierMatch = trimmed.match(/^(\d+)x(\d+)g$/);
  const servingMatch = trimmed.match(/^(\d+)serv$/);

  let result;

  if (gramMatch) {
    result = parseInt(gramMatch[1], 10);
  } else if (multiplierMatch) {
    result = parseInt(multiplierMatch[1], 10) * parseInt(multiplierMatch[2], 10);
  } else if (servingMatch) {
    if (servingGrams === null || servingGrams === undefined) {
      throw new RangeError("Serving grams must be provided for 'serv' spec");
    }
    result = parseInt(servingMatch[1], 10) * servingGrams;
  } else {
    throw new SyntaxError("Invalid portion spec");
  }

  if (result <= 0) {
    throw new RangeError("Portion must be greater than zero");
  }

  return result;
}
