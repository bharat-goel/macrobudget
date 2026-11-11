export function parsePortion(spec, servingGrams) {
  if (typeof spec !== "string") {
    throw new TypeError("Input must be a string");
  }

  const trimmed = spec.trim();

  if (trimmed === "") {
    throw new SyntaxError();
  }

  // Check for "serv" suffix
  if (trimmed.endsWith("serv")) {
    if (servingGrams === null) {
      throw new RangeError("servingGrams is required for serving units");
    }
    const match = trimmed.match(/^(\d+)serv$/);
    if (!match) throw new SyntaxError();
    const count = parseInt(match[1], 10);
    const total = count * servingGrams;
    if (total === 0) throw new RangeError();
    return total;
  }

  // Check for multiplier form "Nx_g"
  if (trimmed.includes("x")) {
    const parts = trimmed.split("x");
    if (parts.length !== 2) throw new SyntaxError();

    const multiplierStr = parts[0];
    const amountStr = parts[1];

    if (multiplierStr.includes(" ") || amountStr.includes(" ")) {
      throw new SyntaxError();
    }

    const multiplier = parseInt(multiplierStr, 10);
    const amountMatch = amountStr.match(/^(\d+)g$/);
    if (!amountMatch) throw new SyntaxError();

    const amount = parseInt(amountMatch[1], 10);
    const total = multiplier * amount;
    if (total === 0) throw new RangeError();
    return total;
  }

  // Check for plain "Xg" form
  const plainMatch = trimmed.match(/^(\d+)g$/);
  if (!plainMatch) {
    throw new SyntaxError();
  }

  const amount = parseInt(plainMatch[1], 10);
  if (amount === 0) throw new RangeError();
  return amount;
}
