import test from 'node:test';
import assert from 'node:assert/strict';
import nebbyCode from '../src/lib/nebby-code.js';

const { generateNebbyCode } = nebbyCode;

test('generateNebbyCode is deterministic and 6 chars long', () => {
  const first = generateNebbyCode('x');
  const second = generateNebbyCode('x');

  assert.equal(first, second);
  assert.equal(first.length, 6);
});
