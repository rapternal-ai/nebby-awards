import test from 'node:test';
import assert from 'node:assert';

import validateCategoryModule from '../src/lib/validate-category.js';

const { validateCategoryName } = validateCategoryModule;

test('validateCategoryName rejects whitespace-only names', () => {
  assert.strictEqual(validateCategoryName('  '), false);
});

test('validateCategoryName accepts valid names', () => {
  assert.strictEqual(validateCategoryName('Fun'), true);
});
