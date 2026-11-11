export function parsePortion(spec, servingGrams) {
  if (typeof spec !== "string") {
    throw new TypeError("Input must be a string");
  }

  const trimmed = spec.trim();

  // Check for "serv" form
  if (trimmed.endsWith("serv")) {
    if (servingGrams === null || servingGrams === undefined) {
      throw new RangeError("Serving grams not provided");
    }
    const match = trimmed.match(/^(\d+)serv$/);
    if (!match) {
      throw new SyntaxError("Invalid serving format");
    }
    const count = parseInt(match[1], 10);
    const value = count * servingGrams;
    if (value <= 0) {
      throw new RangeError("Quantity must be greater than zero");
    }
    return value;
  }

  // Check for "x" form
  if (trimmed.includes("x")) {
    const parts = trimmed.split("x");
    if (parts.length !== 2) {
      throw new SyntaxError("Invalid multiplier format");
    }
    const part1 = parts[0];
    const part2 = parts[1];

    // The spec "3 x 30g" (with spaces) should throw SyntaxError
    // Our logic ensures that parts must not contain spaces and must match exact patterns
    if (part1.includes(" ") || part2.includes(" ")) {
      throw new SyntaxError("Invalid quantity format");
    }

    if (!/^\d+$/.test(part1) || !/^\d+g$/.test(part2)) {
      throw new SyntaxError("Invalid multiplier format");
    }

    const multiplier = parseInt(part1, 10);
    const grams = parseInt(part2, 10);
    const value = multiplier * grams;
    if (value <= 0) {
      throw new RangeError("Quantity must be greater than zero");
    }
    return value;
  }

  // Plain gram form
  if (!/^\d+g$/.test(trimmed)) {
    throw new SyntaxError("Invalid quantity format");
  }
  const value = parseInt(trimmed, 10);
  if (value <= 0) {
    throw new RangeError("Quantity must be greater than zero");
  }

  return value;
}
