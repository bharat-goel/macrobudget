export function parsePortion(spec, servingGrams) {
  if (typeof spec !== "string") {
    throw new TypeError("Input must be a string");
  }

  const trimmed = spec.trim();

  if (trimmed === "") {
    throw new SyntaxError("Empty string");
  }

  // Serving form
  if (trimmed.endsWith("serv")) {
    if (servingGrams === null) {
      throw new RangeError("Serving grams not provided");
    }
    const match = trimmed.match(/^(\d+)serv$/);
    if (!match) {
      throw new SyntaxError("Invalid serving format");
    }
    const count = parseInt(match[1], 10);
    if (count === 0) {
      throw new RangeError("Quantity cannot be zero");
    }
    return count * servingGrams;
  }

  // Multiplier form
  if (trimmed.includes("x")) {
    const parts = trimmed.split("x");
    if (parts.length !== 2) {
      throw new SyntaxError("Invalid multiplier format");
    }

    const multiplierStr = parts[0];
    const amountStr = parts[1];

    if (multiplierStr.includes(" ") || amountStr.includes(" ")) {
      throw new SyntaxError("Spaces not allowed");
    }

    if (!/^\d+$/.test(multiplierStr) || !/^\d+g$/.test(amountStr)) {
      throw new SyntaxError("Invalid format");
    }

    const multiplier = parseInt(multiplierStr, 10);
    const amountStrValue = amountStr.slice(0, -1);
    const amount = parseInt(amountStrValue, 10);

    if (multiplier === 0 || amount === 0) {
      throw new RangeError("Quantity cannot be zero");
    }

    return multiplier * amount;
  }

  // Plain gram form
  if (!trimmed.endsWith("g")) {
    throw new SyntaxError("Must end with g");
  }

  const amountValueStr = trimmed.slice(0, -1);
  if (amountValueStr.includes(" ") || amountValueStr === "") {
    throw new SyntaxError("Invalid amount");
  }

  // Validate numeric string (no signs, no dots)
  if (!/^\d+$/.test(amountValueStr)) {
    throw new SyntaxError("Invalid number");
  }

  const amount = parseInt(amountValueStr, 10);
  if (amount === 0) {
    throw new RangeError("Quantity cannot be zero");
  }

  return amount;
}
