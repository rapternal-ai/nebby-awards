import test from 'node:test';
import assert from 'node:assert/strict';
import slugModule from '../src/lib/slug.js';

const { slugify } = slugModule;

test('slugify converts text to slug', () => {
  assert.equal(slugify('Hello World!'), 'hello-world');
});