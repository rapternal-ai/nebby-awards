function formatAwardDate(date) {
  const value = date instanceof Date ? date : new Date(date);
  return value.toISOString().slice(0, 10);
}

module.exports = {
  formatAwardDate,
};
