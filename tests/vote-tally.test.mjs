import test from "node:test";
import assert from "node:assert";
import voteTally from "../src/lib/vote-tally.js";

const { tallyVotes } = voteTally;

test("tallyVotes counts repeated choices", () => {
  assert.strictEqual(tallyVotes(["a", "b", "a"]).a, 2);
});
