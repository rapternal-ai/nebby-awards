function formatAwardDate(date) {
  const parsedDate = date instanceof Date ? date : new Date(date);
  return parsedDate.toISOString().slice(0, 10);
}

module.exports = { formatAwardDate };
