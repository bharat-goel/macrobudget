export function parsePortion(spec, servingGrams) {
  if (typeof spec !== "string") {
    throw new TypeError();
  }

  const trimmed = spec.trim();

  // Match <n>g
  const gramMatch = trimmed.match(/^(\d+)g$/);
  if (gramMatch) {
    const grams = parseInt(gramMatch[1], 10);
    if (grams === 0) throw new RangeError();
    return grams;
  }

  // Match <n>x<m>g
  const multiplierMatch = trimmed.match(/^(\d+)x(\d+)g$/);
  if (multiplierMatch) {
    const n = parseInt(multiplierMatch[1], 10);
    const m = parseInt(multiplierMatch[2], 10);
    const grams = n * m;
    if (grams === 0) throw new RangeError();
    return grams;
  }

  // Match <n>serv
  const servingMatch = trimmed.match(/^(\d+)serv$/);
  if (servingMatch) {
    if (servingGrams === null) {
      throw new RangeError();
    }
    const n = parseInt(servingMatch[1], 10);
    const grams = n * servingGrams;
    if (grams === 0) throw new RangeError();
    return grams;
  }

  throw new SyntaxError();
}
