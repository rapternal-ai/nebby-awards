import assert from "node:assert";
import test from "node:test";

import slug from "../src/lib/slug.js";

const { slugify } = slug;

test("slugify converts text to a slug", () => {
  assert.equal(slugify("Hello World!"), "hello-world");
});