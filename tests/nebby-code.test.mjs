import test from "node:test";
import assert from "node:assert/strict";
import nebbyCode from "../src/lib/nebby-code.js";

const { generateNebbyCode } = nebbyCode;

test("generateNebbyCode is deterministic", () => {
  assert.equal(generateNebbyCode("x"), generateNebbyCode("x"));
});

test("generateNebbyCode returns a 6-char code", () => {
  assert.equal(generateNebbyCode("x").length, 6);
});