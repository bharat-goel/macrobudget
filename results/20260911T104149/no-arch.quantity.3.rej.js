export function parsePortion(input, servingGrams) {
  if (typeof input !== "string") {
    throw new TypeError("Input must be a string");
  }

  const trimmed = input.trim();
  if (!trimmed) {
    throw new SyntaxError("Empty input");
  }

  let result = 0;

  if (trimmed.endsWith("serv")) {
    if (servingGrams === null || servingGrams === undefined) {
      throw new RangeError("Serving grams not provided");
    }
    const match = trimmed.match(/^(\d+)serv$/);
    if (!match) {
      throw new SyntaxError("Invalid serving format");
    }
    result = parseInt(match[1], 10) * servingGrams;
  } else if (trimmed.includes("x")) {
    const parts = trimmed.split("x");
    if (parts.length !== 2) {
      throw new SyntaxError("Invalid multiplier format");
    }
    const left = parts[0].trim();
    const right = parts[1].trim();

    if (left === "" || right === "" || !/^\d+$/.test(left) || !/^\d+g$/.test(right)) {
      throw new SyntaxError("Invalid multiplier components");
    }

    const multiplier = parseInt(left, 10);
    const gramValue = parseInt(right, 10);
    result = multiplier * gramValue;
  } else {
    if (!/^\d+g$/.test(trimmed)) {
      throw new SyntaxError("Invalid gram format");
    }
    result = parseInt(trimmed, 10);
  }

  if (result === 0) {
    throw new RangeError("Quantity cannot be zero");
  }

  return result;
}
