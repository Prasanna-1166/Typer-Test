// ============================================================
// TypeMaster — Metric Calculation Utilities
// ============================================================
// All calculations are pure, testable functions.
//
// Definitions:
//   correctChars      — characters typed correctly at the right position
//   errorChars        — characters typed incorrectly (each backspace+retype is a fresh char)
//   totalKeystrokes   — total keys pressed (correct + incorrect, excluding Backspace itself)
//   accuracy          — correctKeystrokes / totalKeystrokes × 100 (capped 0–100)
//   grossWpm          — (totalCharsTyped / 5) / elapsedMinutes  [standard 5-char word]
//   netWpm            — grossWpm − (errors / elapsedMinutes)
//   elapsedMinutes    — elapsedMs / 60000
// ============================================================

/**
 * Safe division — returns 0 when denominator is zero or NaN.
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (!denominator || !isFinite(denominator) || denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Elapsed time in minutes from milliseconds.
 */
export function msToMinutes(ms: number): number {
  if (ms <= 0) return 0;
  return ms / 60_000;
}

/**
 * Gross WPM calculation.
 * Uses total characters typed (correct + incorrect) divided by 5 as the word count.
 * This is the conventional standard-word metric.
 *
 * @param charsTyped   — total characters typed (not keystrokes — final char count)
 * @param elapsedMs    — elapsed time in ms (must be > 0)
 */
export function calcGrossWpm(charsTyped: number, elapsedMs: number): number {
  if (charsTyped <= 0 || elapsedMs <= 0) return 0;
  const minutes = msToMinutes(elapsedMs);
  const words = charsTyped / 5;
  return Math.round(safeDivide(words, minutes));
}

/**
 * Net WPM calculation.
 * Net WPM = Gross WPM − (uncorrected errors / elapsed minutes)
 * Floored at 0.
 *
 * @param grossWpm     — already calculated gross WPM
 * @param errorCount   — uncorrected errors at end of session
 * @param elapsedMs    — elapsed time in ms
 */
export function calcNetWpm(grossWpm: number, errorCount: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = msToMinutes(elapsedMs);
  const penaltyWpm = safeDivide(errorCount, minutes);
  return Math.max(0, Math.round(grossWpm - penaltyWpm));
}

/**
 * Accuracy calculation.
 * Accuracy = (correctKeystrokes / totalKeystrokes) × 100, capped [0, 100].
 *
 * @param correctKeystrokes — correct keys pressed
 * @param totalKeystrokes   — all keys pressed (excluding backspace)
 */
export function calcAccuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes <= 0) return 100; // No attempts → perfect (not penalised)
  const raw = safeDivide(correctKeystrokes, totalKeystrokes) * 100;
  return Math.min(100, Math.max(0, Math.round(raw * 10) / 10));
}

/**
 * Error rate as a percentage.
 */
export function calcErrorRate(errorCount: number, totalKeystrokes: number): number {
  if (totalKeystrokes <= 0) return 0;
  return Math.round((safeDivide(errorCount, totalKeystrokes)) * 100 * 10) / 10;
}

/**
 * Count correctly typed characters from a CharState array.
 */
export function countCorrectChars(chars: { status: string }[]): number {
  return chars.filter(c => c.status === 'correct').length;
}

/**
 * Count error characters (typed incorrectly, not subsequently corrected).
 */
export function countErrorChars(chars: { status: string }[]): number {
  return chars.filter(c => c.status === 'error').length;
}

/**
 * Count corrected characters (typed incorrectly, then corrected via backspace).
 */
export function countCorrectedChars(chars: { status: string }[]): number {
  return chars.filter(c => c.status === 'corrected').length;
}

/**
 * Number of characters the user has typed (progressed past).
 */
export function countCharsTyped(chars: { status: string }[]): number {
  return chars.filter(c => c.status !== 'upcoming').length;
}

/**
 * Format a duration in milliseconds to a human-readable string (mm:ss).
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format WPM to a display string.
 */
export function formatWpm(wpm: number): string {
  return Math.round(wpm).toString();
}

/**
 * Format accuracy to a display string.
 */
export function formatAccuracy(accuracy: number): string {
  return accuracy.toFixed(1) + '%';
}

/**
 * Calculate XP for this level.
 * Returns { currentLevelXp, xpToNext, level }.
 */
export function calcXpLevel(totalXp: number): {
  level: number;
  currentLevelXp: number;
  xpToNext: number;
  progressPercent: number;
  title: string;
} {
  const thresholds = [
    { level: 1, xp: 0, title: 'Novice' },
    { level: 2, xp: 100, title: 'Apprentice' },
    { level: 3, xp: 300, title: 'Typist' },
    { level: 4, xp: 600, title: 'Skilled' },
    { level: 5, xp: 1000, title: 'Proficient' },
    { level: 6, xp: 1500, title: 'Expert' },
    { level: 7, xp: 2500, title: 'Master' },
    { level: 8, xp: 4000, title: 'Grandmaster' },
    { level: 9, xp: 6500, title: 'Virtuoso' },
    { level: 10, xp: 10000, title: 'Legend' },
  ];

  let current = thresholds[0];
  let next = thresholds[1];

  for (let i = 0; i < thresholds.length - 1; i++) {
    if (totalXp >= thresholds[i].xp && totalXp < thresholds[i + 1].xp) {
      current = thresholds[i];
      next = thresholds[i + 1];
      break;
    }
    if (totalXp >= thresholds[thresholds.length - 1].xp) {
      current = thresholds[thresholds.length - 1];
      next = { level: 11, xp: current.xp + 5000, title: 'Legend' };
    }
  }

  const currentLevelXp = totalXp - current.xp;
  const xpToNext = next.xp - current.xp;
  const progressPercent = Math.min(100, Math.round(safeDivide(currentLevelXp, xpToNext) * 100));

  return {
    level: current.level,
    currentLevelXp,
    xpToNext,
    progressPercent,
    title: current.title,
  };
}

/**
 * Get the ISO date string (YYYY-MM-DD) for a timestamp.
 */
export function toISODate(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/**
 * Calculate streak from an array of result timestamps (ms).
 * Returns { current, longest }.
 */
export function calcStreak(
  resultTimestamps: number[],
  today: string = toISODate(Date.now())
): { current: number; longest: number } {
  if (resultTimestamps.length === 0) return { current: 0, longest: 0 };

  const dates = [...new Set(resultTimestamps.map(toISODate))].sort();

  let longest = 0;
  let current = 0;
  let streakCount = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
    if (diffDays === 1) {
      streakCount++;
    } else {
      longest = Math.max(longest, streakCount);
      streakCount = 1;
    }
  }
  longest = Math.max(longest, streakCount);

  // Current streak: was last practice today or yesterday?
  const lastDate = dates[dates.length - 1];
  const yesterday = toISODate(Date.now() - 86_400_000);
  if (lastDate === today || lastDate === yesterday) {
    // count backwards
    current = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
      const curr = new Date(dates[i + 1]);
      const prev = new Date(dates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
      if (diffDays === 1) current++;
      else break;
    }
  } else {
    current = 0;
  }

  return { current, longest };
}

/**
 * Moving average of last N values.
 */
export function movingAverage(values: number[], n: number = 5): number {
  if (values.length === 0) return 0;
  const slice = values.slice(-n);
  return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
}
