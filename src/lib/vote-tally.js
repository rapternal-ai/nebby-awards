function tallyVotes(votes) {
  return votes.reduce((counts, choice) => {
    counts[choice] = (counts[choice] ?? 0) + 1;
    return counts;
  }, {});
}

module.exports = { tallyVotes };
