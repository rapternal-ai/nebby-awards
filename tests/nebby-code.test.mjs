import test from 'node:test';
import assert from 'node:assert/strict';
import { generateNebbyCode } from '../src/lib/nebby-code.js';

test('generateNebbyCode is deterministic for same seed', () => {
  assert.equal(generateNebbyCode('x'), generateNebbyCode('x'));
});

test('generateNebbyCode returns 6-character code', () => {
  assert.equal(generateNebbyCode('x').length, 6);
});
