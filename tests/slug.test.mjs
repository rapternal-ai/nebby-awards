import test from 'node:test';
import assert from 'node:assert/strict';
import slug from '../src/lib/slug.js';

const { slugify } = slug;

test('slugify converts text to slug', () => {
  assert.equal(slugify('Hello World!'), 'hello-world');
});
