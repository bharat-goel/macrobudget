export function parsePortion(spec, servingGrams) {
  if (typeof spec !== "string") {
    throw new TypeError();
  }

  const trimmed = spec.trim();

  // Match <n>g
  const gMatch = trimmed.match(/^(\d+)g$/);
  if (gMatch) {
    const grams = parseInt(gMatch[1], 10);
    if (grams === 0) throw new RangeError();
    return grams;
  }

  // Match <n>x<m>g
  const xMatch = trimmed.match(/^(\d+)x(\d+)g$/);
  if (xMatch) {
    const n = parseInt(xMatch[1], 10);
    const m = parseInt(xMatch[2], 10);
    const grams = n * m;
    if (grams === 0) throw new RangeError();
    return grams;
  }

  // Match <n>serv
  const servMatch = trimmed.match(/^(\d+)serv$/);
  if (servMatch) {
    if (servingGrams === null) {
      throw new RangeError();
    }
    const n = parseInt(servMatch[1], 10);
    const grams = n * servingGrams;
    if (grams === 0) throw new RangeError();
    return grams;
  }

  throw new SyntaxError();
}
