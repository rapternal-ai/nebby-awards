import test from 'node:test';
import assert from 'node:assert';
import slugLib from '../src/lib/slug.js';

const { slugify } = slugLib;

test('slugify converts text to expected slug', () => {
  assert.strictEqual(slugify('Hello World!'), 'hello-world');
});
