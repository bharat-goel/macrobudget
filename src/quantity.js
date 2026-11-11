const GRAMS = /^(\d+)g$/;
const MULTI = /^(\d+)x(\d+)g$/;
const SERV = /^(\d+)serv$/;

export function parsePortion(spec, servingGrams) {
  if (typeof spec !== "string") throw new TypeError("portion spec must be a string");
  const s = spec.trim();

  let m = GRAMS.exec(s);
  if (m) return check(Number(m[1]));

  m = MULTI.exec(s);
  if (m) return check(Number(m[1]) * Number(m[2]));

  m = SERV.exec(s);
  if (m) {
    if (servingGrams === null) throw new RangeError("label declares no serving size");
    return check(Number(m[1]) * servingGrams);
  }

  throw new SyntaxError(`unrecognised portion spec: ${JSON.stringify(spec)}`);
}

function check(grams) {
  if (grams === 0) throw new RangeError("portion is zero grams");
  return grams;
}
