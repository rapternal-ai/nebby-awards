export function validateCategoryName(name) {
  if (typeof name !== "string") {
    return false;
  }

  const trimmedName = name.trim();
  return trimmedName.length > 0 && trimmedName.length <= 60;
}
