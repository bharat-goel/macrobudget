export function parsePortion(spec, servingGrams) {
  if (typeof spec !== "string") {
    throw new TypeError();
  }

  const trimmed = spec.trim();

  let grams;
  if (/^\d+g$/.test(trimmed)) {
    grams = parseInt(trimmed, 10);
  } else if (/^\d+x\d+g$/.test(trimmed)) {
    const [part1, part2] = trimmed.split("x");
    grams = parseInt(part1, 10) * parseInt(part2, 10);
  } else if (/^\d+serv$/.test(trimmed)) {
    if (servingGrams === null) {
      throw new RangeError();
    }
    grams = parseInt(trimmed.replace("serv", ""), 10) * servingGrams;
  } else {
    throw new SyntaxError();
  }

  if (grams === 0) {
    throw new RangeError();
  }

  return grams;
}
