function badgeForPlacement(place) {
  if (place === 1) return '🥇';
  if (place === 2) return '🥈';
  if (place === 3) return '🥉';
  return 'nominee';
}

module.exports = { badgeForPlacement };
