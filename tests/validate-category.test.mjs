import assert from "node:assert";
import test from "node:test";
import validateCategoryModule from "../src/lib/validate-category.js";

const { validateCategoryName } = validateCategoryModule;

test("validateCategoryName returns false for blank trimmed input", () => {
  assert.strictEqual(validateCategoryName("  "), false);
});

test("validateCategoryName returns true for valid category name", () => {
  assert.strictEqual(validateCategoryName("Fun"), true);
});