import test from "node:test";
import assert from "node:assert/strict";
import slugModule from "../src/lib/nebby-slug.js";

const { slugify } = slugModule;

test("slugify converts phrase to kebab-case slug", () => {
  assert.equal(slugify("Nebby Awards!"), "nebby-awards");
});

test("slugify returns empty string for empty input", () => {
  assert.equal(slugify(""), "");
});