import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentStreak } from '../src/lib/award-streak';

test('returns streak length for consecutive days', () => {
  assert.equal(currentStreak(['2026-01-01', '2026-01-02', '2026-01-03']), 3);
});

test('returns 0 for empty input', () => {
  assert.equal(currentStreak([]), 0);
});