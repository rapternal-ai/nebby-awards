function validateCategoryName(name) {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 60;
}

module.exports = { validateCategoryName };
