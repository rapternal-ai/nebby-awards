import { test } from 'node:test';
import assert from 'node:assert/strict';

test('smoke: basic assertion passes', () => {
  assert.equal(1 + 1, 2);
});
