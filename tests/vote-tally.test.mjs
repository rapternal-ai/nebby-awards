import test from 'node:test';
import assert from 'node:assert';
import voteTally from '../src/lib/vote-tally.js';

const { tallyVotes } = voteTally;

test('tallyVotes counts repeated choices', () => {
  const result = tallyVotes(['a', 'b', 'a']);
  assert.strictEqual(result.a, 2);
});
