import { test } from 'node:test';
import assert from 'node:assert/strict';

import { streakBadge } from '../src/lib/streak-badge';

test('streakBadge returns silver for a 3-day streak', () => {
  assert.equal(streakBadge(['2026-01-01', '2026-01-02', '2026-01-03']), 'silver');
});

test('streakBadge returns none for an empty streak', () => {
  assert.equal(streakBadge([]), 'none');
});
