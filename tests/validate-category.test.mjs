import assert from "node:assert";
import test from "node:test";

import { validateCategoryName } from "../src/lib/validate-category.mjs";

test("validateCategoryName returns false for whitespace-only string", () => {
  assert.strictEqual(validateCategoryName("  "), false);
});

test("validateCategoryName returns true for valid category name", () => {
  assert.strictEqual(validateCategoryName("Fun"), true);
});
