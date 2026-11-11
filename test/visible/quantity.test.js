import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePortion } from "../../src/quantity.js";

test("plain gram form", () => {
  assert.equal(parsePortion("120g", 170), 120);
  assert.equal(parsePortion("7g", null), 7);
});

test("leading and trailing whitespace is trimmed", () => {
  assert.equal(parsePortion("  120g  ", 170), 120);
  assert.equal(parsePortion("\t3x30g\n", null), 90);
});

test("multiplier form", () => {
  assert.equal(parsePortion("3x30g", null), 90);
  assert.equal(parsePortion("12x5g", 170), 60);
});

test("serving form uses servingGrams", () => {
  assert.equal(parsePortion("2serv", 170), 340);
  assert.equal(parsePortion("1serv", 60), 60);
});

test("non-string spec throws TypeError", () => {
  assert.throws(() => parsePortion(120, 170), TypeError);
  assert.throws(() => parsePortion(null, 170), TypeError);
});

test("malformed spec throws SyntaxError", () => {
  for (const bad of ["-5g", "1.5g", "120 g", "120G", "120", "", "3 x 30g", "2servings", "g"]) {
    assert.throws(() => parsePortion(bad, 170), SyntaxError, `expected SyntaxError for ${JSON.stringify(bad)}`);
  }
});

test("well-formed but zero grams throws RangeError", () => {
  assert.throws(() => parsePortion("0g", 170), RangeError);
  assert.throws(() => parsePortion("0x30g", 170), RangeError);
  assert.throws(() => parsePortion("3x0g", 170), RangeError);
  assert.throws(() => parsePortion("0serv", 170), RangeError);
});

test("serving form with no declared serving throws RangeError", () => {
  assert.throws(() => parsePortion("2serv", null), RangeError);
});
