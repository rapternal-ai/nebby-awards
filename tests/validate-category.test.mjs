import test from 'node:test';
import assert from 'node:assert';
import { validateCategoryName } from '../src/lib/validate-category.js';

test('returns false for blank category names', () => {
  assert.strictEqual(validateCategoryName('  '), false);
});

test('returns true for valid category names', () => {
  assert.strictEqual(validateCategoryName('Fun'), true);
});
