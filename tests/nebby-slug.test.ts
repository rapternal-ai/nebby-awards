import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../src/lib/nebby-slug';

test('slugify converts text into expected slug', () => {
  assert.equal(slugify('Nebby Awards!'), 'nebby-awards');
  assert.equal(slugify(''), '');
});