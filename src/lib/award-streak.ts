export function currentStreak(isoDays: string[]): number {
  if (isoDays.length === 0) return 0;

  const dayMs = 24 * 60 * 60 * 1000;
  const uniqueDays = new Set<number>();

  for (const isoDay of isoDays) {
    uniqueDays.add(Date.parse(`${isoDay}T00:00:00Z`));
  }

  const sorted = [...uniqueDays].sort((a, b) => a - b);
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] === dayMs) {
      current += 1;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }

  return longest;
}