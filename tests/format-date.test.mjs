import test from "node:test";
import assert from "node:assert";
import formatDate from "../src/lib/format-date.js";

const { formatAwardDate } = formatDate;

test("formatAwardDate returns YYYY-MM-DD", () => {
  assert.match(
    formatAwardDate(new Date("2026-01-15T10:00:00Z")),
    /^\d{4}-\d{2}-\d{2}$/,
  );
});
