export function parsePortion(spec, servingGrams) {
  if (typeof spec !== "string") {
    throw new TypeError("Spec must be a string");
  }

  const trimmed = spec.trim();
  if (!trimmed) {
    throw new SyntaxError("Empty spec");
  }

  let grams;

  if (trimmed.endsWith("serv")) {
    if (servingGrams === null || servingGrams === undefined) {
      throw new RangeError("Serving grams required for 'serv' spec");
    }
    const match = trimmed.match(/^(\d+)serv$/);
    if (!match) {
      throw new SyntaxError("Malformed 'serv' spec");
    }
    grams = parseInt(match[1], 10) * servingGrams;
  } else if (trimmed.includes("x")) {
    // Must not contain spaces around the 'x'
    if (trimmed.includes(" x ") || trimmed.includes("x ")) {
      throw new SyntaxError("Spaces not allowed in multiplier form");
    }
    const parts = trimmed.split("x");
    if (parts.length !== 2) {
      throw new SyntaxError("Malformed multiplier spec");
    }
    const multiplierStr = parts[0];
    const amountStr = parts[1];

    if (!/^\d+$/.test(multiplierStr) || !/^\d+g$/.test(amountStr)) {
      throw new SyntaxError("Invalid multiplier components");
    }

    const multiplier = parseInt(multiplierStr, 10);
    const amount = parseInt(amountStr.slice(0, -1), 10);
    grams = multiplier * amount;
  } else if (trimmed.endsWith("g")) {
    const match = trimmed.match(/^(\d+)g$/);
    if (!match) {
      throw new SyntaxError("Malformed gram spec");
    }
    grams = parseInt(match[1], 10);
  } else {
    throw new SyntaxError("Invalid spec format");
  }

  if (grams <= 0) {
    throw new RangeError("Portion must be greater than zero grams");
  }

  return grams;
}
