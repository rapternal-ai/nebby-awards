import { currentStreak } from './award-streak';

export function streakBadge(isoDays: string[]): 'gold' | 'silver' | 'bronze' | 'none' {
  const streak = currentStreak(isoDays);

  if (streak >= 7) return 'gold';
  if (streak >= 3) return 'silver';
  if (streak >= 1) return 'bronze';
  return 'none';
}
