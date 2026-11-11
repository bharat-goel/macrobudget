export function parsePortion(spec, servingGrams) {
  if (typeof spec !== "string") {
    throw new TypeError("Spec must be a string");
  }

  const trimmed = spec.trim();

  if (trimmed.endsWith("serv")) {
    if (servingGrams === null || servingGrams === undefined) {
      throw new RangeError("Serving grams required");
    }
    const match = trimmed.match(/^(\d+)serv$/);
    if (!match) throw new SyntaxError();
    const count = parseInt(match[1], 10);
    const result = count * servingGrams;
    if (result <= 0) throw new RangeError();
    return result;
  }

  if (trimmed.endsWith("g")) {
    if (trimmed.includes("x")) {
      const parts = trimmed.split("x");
      if (parts.length !== 2) throw new SyntaxError();
      const [multStr, gramStr] = parts;
      
      // Check for internal spaces in the parts
      if (multStr.includes(" ") || gramStr.includes(" ")) throw new SyntaxError();
      
      const multiplier = parseInt(multStr, 10);
      const grams = parseInt(gramStr, 10);

      if (isNaN(multiplier) || isNaN(grams) || !/^\d+$/.test(multStr) || !/^\d+g$/.test(gramStr)) {
        throw new SyntaxError();
      }

      const result = multiplier * grams;
      if (result <= 0) throw new RangeError();
      return result;
    } else {
      const match = trimmed.match(/^(\d+)g$/);
      if (!match) throw new SyntaxError();
      const grams = parseInt(match[1], 10);
      if (grams <= 0) throw new RangeError();
      return grams;
    }
  }

  throw new SyntaxError();
}
