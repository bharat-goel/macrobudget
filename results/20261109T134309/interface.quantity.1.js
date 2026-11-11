export function parsePortion(spec, servingGrams) {
  if (typeof spec !== "string") {
    throw new TypeError("spec must be a string");
  }

  const trimmed = spec.trim();
  let result;

  // Case: <n>serv
  if (trimmed.endsWith("serv")) {
    if (servingGrams === null) {
      throw new RangeError("servingGrams is null but 'serv' was used");
    }
    const match = trimmed.match(/^(\d+)serv$/);
    if (!match) throw new SyntaxError("Invalid serving format");
    const count = parseInt(match[1], 10);
    result = count * servingGrams;
  } 
  // Case: <n>x<m>g
  else if (trimmed.endsWith("g") && trimmed.includes("x")) {
    const match = trimmed.match(/^(\d+)x(\d+)g$/);
    if (!match) throw new SyntaxError("Invalid multiplier format");
    const n = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    result = n * m;
  } 
  // Case: <n>g
  else if (trimmed.endsWith("g")) {
    const match = trimmed.match(/^(\d+)g$/);
    if (!match) throw new SyntaxError("Invalid gram format");
    result = parseInt(match[1], 10);
  } 
  else {
    throw new SyntaxError("Invalid spec format");
  }

  if (result <= 0) {
    throw new RangeError("Resulting grams must be greater than zero");
  }

  return result;
}
