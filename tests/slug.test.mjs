import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../src/lib/slug.js';

test('slugify converts text into slug format', () => {
  assert.equal(slugify('Hello World!'), 'hello-world');
});
