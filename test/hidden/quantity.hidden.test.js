import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePortion } from "../../src/quantity.js";

test("hidden: gram and multiplier forms", () => {
  assert.equal(parsePortion("250g", 30), 250);
  assert.equal(parsePortion(" 250g ", null), 250);
  assert.equal(parsePortion("4x25g", null), 100);
  assert.equal(parsePortion("10x10g", 30), 100);
});

test("hidden: serving form", () => {
  assert.equal(parsePortion("3serv", 30), 90);
  assert.equal(parsePortion("1serv", 45), 45);
});

test("hidden: non-string spec throws TypeError", () => {
  assert.throws(() => parsePortion(undefined, 30), TypeError);
  assert.throws(() => parsePortion({}, 30), TypeError);
});

test("hidden: malformed spec throws SyntaxError", () => {
  for (const bad of ["-2g", "0.5g", "250 G", "x30g", "4 serv", "250kg", "4x25", "serv"]) {
    assert.throws(() => parsePortion(bad, 30), SyntaxError, `expected SyntaxError for ${JSON.stringify(bad)}`);
  }
});

test("hidden: zero grams throws RangeError", () => {
  assert.throws(() => parsePortion("0g", 30), RangeError);
  assert.throws(() => parsePortion("0x25g", 30), RangeError);
  assert.throws(() => parsePortion("4x0g", 30), RangeError);
  assert.throws(() => parsePortion("0serv", 30), RangeError);
});

test("hidden: serving form with null servingGrams throws RangeError", () => {
  assert.throws(() => parsePortion("2serv", null), RangeError);
});
