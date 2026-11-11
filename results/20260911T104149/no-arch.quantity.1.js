export function parsePortion(input, servingGrams) {
  if (typeof input !== "string") {
    throw new TypeError("Input must be a string");
  }

  const trimmed = input.trim();

  // Regex explanation:
  // ^([0-9]+) : Captures digits at the start
  // (x[0-9]+)? : Optional 'x' followed by digits
  // g$ : Must end in 'g'
  const gramRegex = /^([0-9]+)(x([0-9]+))?g$/;
  
  // Regex explanation:
  // ^([0-9]+)serv$ : Captures digits followed by 'serv'
  const servingRegex = /^([0-9]+)serv$/;

  if (trimmed.endsWith("g")) {
    const match = trimmed.match(gramRegex);
    if (!match) {
      throw new SyntaxError("Malformed gram format");
    }

    const amount = parseInt(match[1], 10);
    const multiplier = match[3] ? parseInt(match[3], 10) : 1;
    const result = amount * multiplier;

    if (result === 0) {
      throw new RangeError("Quantity cannot be zero");
    }

    // Validation for "120 g" or "1.5g" or "120G" which are malformed
    // The regex allows "120g", but the test expects "120 g" (space) to be SyntaxError
    // and "1.5g" (dot) to be SyntaxError. 
    // Since our regex is strict on digits only, we just need to ensure the original 
    // trimmed string matches the pattern exactly.
    if (trimmed !== trimmed.replace(/\s/g, "")) {
       throw new SyntaxError("Malformed gram format");
    }
    
    // Additional check to fail "120g" vs "120 g" if needed by regex logic
    // Actually, the regex ^([0-9]+)(x([0-9]+))?g$ already fails "120 g" 
    // because of the space.

    // Handle "120G" (uppercase)
    if (trimmed.endsWith("G")) {
        throw new SyntaxError("Malformed gram format");
    }

    return result;
  } else if (trimmed.endsWith("serv")) {
    const match = trimmed.match(servingRegex);
    if (!match) {
      throw new SyntaxError("Malformed serving format");
    }

    if (servingGrams === null || servingGrams === undefined) {
      throw new RangeError("Serving grams not provided");
    }

    const servings = parseInt(match[1], 10);
    const result = servings * servingGrams;

    if (result === 0) {
      throw new RangeError("Quantity cannot be zero");
    }

    return result;
  } else {
    throw new SyntaxError("Invalid quantity format");
  }
}
