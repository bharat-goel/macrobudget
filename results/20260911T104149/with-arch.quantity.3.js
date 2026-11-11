export function parsePortion(spec, servingGrams) {
  if (typeof spec !== "string") {
    throw new TypeError();
  }

  const trimmed = spec.trim();

  // Regex explanation:
  // ^(\d+)g$          -> Matches "120g" (Group 1: n)
  // ^(\d+)x(\d+)g$    -> Matches "3x30g" (Group 1: n, Group 2: m)
  // ^(\d+)serv$       -> Matches "2serv" (Group 1: n)
  const gramMatch = trimmed.match(/^(\d+)g$/);
  if (gramMatch) {
    const grams = parseInt(gramMatch[1], 10);
    if (grams === 0) throw new RangeError();
    return grams;
  }

  const multiplierMatch = trimmed.match(/^(\d+)x(\d+)g$/);
  if (multiplierMatch) {
    const n = parseInt(multiplierMatch[1], 10);
    const m = parseInt(multiplierMatch[2], 10);
    const grams = n * m;
    if (grams === 0) throw new RangeError();
    return grams;
  }

  const servMatch = trimmed.match(/^(\d+)serv$/);
  if (servMatch) {
    if (servingGrams === null) throw new RangeError();
    const n = parseInt(servMatch[1], 10);
    const grams = n * servingGrams;
    if (grams === 0) throw new RangeError();
    return grams;
  }

  throw new SyntaxError();
}
