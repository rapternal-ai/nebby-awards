import test from 'node:test';
import assert from 'node:assert';
import slugModule from '../src/lib/slug.js';

const { slugify } = slugModule;

test('slugify converts text into slug format', () => {
  assert.strictEqual(slugify('Hello World!'), 'hello-world');
});