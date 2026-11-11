export function parsePortion(spec, servingGrams) {
  if (typeof spec !== "string") {
    throw new TypeError("Input must be a string");
  }

  const trimmed = spec.trim();

  // Serving form (e.g., "2serv")
  if (trimmed.endsWith("serv")) {
    if (servingGrams === null || servingGrams === undefined) {
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

  // Multiplier form (e.g., "3x30g")
  if (trimmed.includes("x")) {
    const parts = trimmed.split("x");
    if (parts.length !== 2) {
      throw new SyntaxError("Invalid multiplier format");
    }

    const multiplierStr = parts[0];
    const amountStr = parts[1];

    // Must not have spaces and must match strictly \d+
    if (multiplierStr === "" || !/^\d+$/.test(multiplierStr)) {
      throw new SyntaxError("Invalid multiplier");
    }
    if (amountStr === "" || !/^\d+g$/.test(amountStr)) {
      throw new SyntaxError("Invalid amount in multiplier");
    }

    const multiplier = parseInt(multiplierStr, 10);
    const amount = parseInt(amountStr.replace("g", ""), 10);

    if (multiplier === 0 || amount === 0) {
      throw new RangeError("Quantity cannot be zero");
    }

    return multiplier * amount;
  }

  // Plain gram form (e.g., "120g")
  if (!/^\d+g$/.test(trimmed)) {
    throw new SyntaxError("Invalid format. Expected e.g. '120g' or '3x30g'");
  }

  const amount = parseInt(trimmed.replace("g", ""), 10);
  if (amount === 0) {
    throw new RangeError("Quantity cannot be zero");
  }

  return amount;
}
