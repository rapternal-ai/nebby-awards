import test from 'node:test';
import assert from 'node:assert/strict';
import { badgeForPlacement } from '../src/lib/award-badges.js';

test('returns gold medal for first place', () => {
  assert.equal(badgeForPlacement(1), '🥇');
});

test('returns nominee for non-medal placements', () => {
  assert.equal(badgeForPlacement(5), 'nominee');
});
