import { describe, it, expect } from 'vitest';
import {
  calcGrossWpm,
  calcNetWpm,
  calcAccuracy,
  calcErrorRate,
  calcXpLevel,
  calcStreak,
  formatDuration,
  formatAccuracy,
  movingAverage,
  toISODate,
} from '@/lib/metrics';

describe('Metrics Calculation Engine', () => {
  describe('Gross WPM', () => {
    it('calculates standard gross WPM correctly (5 chars = 1 word)', () => {
      // 300 characters in 60,000 ms (1 minute) = 60 words = 60 WPM
      expect(calcGrossWpm(300, 60000)).toBe(60);
    });

    it('returns 0 when elapsed time is 0 or chars typed is 0', () => {
      expect(calcGrossWpm(0, 60000)).toBe(0);
      expect(calcGrossWpm(300, 0)).toBe(0);
    });

    it('scales correctly for non-minute durations', () => {
      // 150 chars in 30 seconds (30,000 ms) = 30 words in 0.5 min = 60 WPM
      expect(calcGrossWpm(150, 30000)).toBe(60);
    });
  });

  describe('Net WPM', () => {
    it('penalizes uncorrected errors', () => {
      // Gross 60 WPM with 2 errors in 1 minute = 60 - 2 = 58 Net WPM
      expect(calcNetWpm(60, 2, 60000)).toBe(58);
    });

    it('floors Net WPM at 0', () => {
      // Gross 10 WPM with 20 errors in 1 minute = 0
      expect(calcNetWpm(10, 20, 60000)).toBe(0);
    });
  });

  describe('Accuracy & Error Rate', () => {
    it('calculates accuracy percentage accurately', () => {
      expect(calcAccuracy(95, 100)).toBe(95);
      expect(calcAccuracy(98, 100)).toBe(98);
      expect(calcAccuracy(0, 10)).toBe(0);
    });

    it('returns 100% when no keystrokes are recorded', () => {
      expect(calcAccuracy(0, 0)).toBe(100);
    });

    it('caps accuracy at 100%', () => {
      expect(calcAccuracy(110, 100)).toBe(100);
    });

    it('calculates error rate percentage', () => {
      expect(calcErrorRate(5, 100)).toBe(5);
      expect(calcErrorRate(0, 100)).toBe(0);
    });
  });

  describe('XP Level Progression', () => {
    it('calculates initial Level 1 Novice', () => {
      const xp = calcXpLevel(0);
      expect(xp.level).toBe(1);
      expect(xp.title).toBe('Novice');
      expect(xp.progressPercent).toBe(0);
    });

    it('calculates apprentice Level 2 at 150 XP', () => {
      const xp = calcXpLevel(150);
      expect(xp.level).toBe(2);
      expect(xp.title).toBe('Apprentice');
    });

    it('handles Legend level for high XP', () => {
      const xp = calcXpLevel(15000);
      expect(xp.level).toBeGreaterThanOrEqual(10);
      expect(xp.title).toBe('Legend');
    });
  });

  describe('Streak Calculation', () => {
    it('returns 0 for empty timestamps', () => {
      const streak = calcStreak([]);
      expect(streak.current).toBe(0);
      expect(streak.longest).toBe(0);
    });

    it('calculates active consecutive daily streak', () => {
      const now = new Date('2026-10-27T12:00:00Z').getTime();
      const day1 = now - 2 * 86_400_000;
      const day2 = now - 1 * 86_400_000;
      const day3 = now;

      const streak = calcStreak([day1, day2, day3], toISODate(now));
      expect(streak.current).toBe(3);
      expect(streak.longest).toBe(3);
    });
  });

  describe('Utility Formatting', () => {
    it('formats duration in mm:ss', () => {
      expect(formatDuration(65000)).toBe('1:05');
      expect(formatDuration(120000)).toBe('2:00');
      expect(formatDuration(5000)).toBe('0:05');
    });

    it('formats accuracy percentage', () => {
      expect(formatAccuracy(98.45)).toBe('98.5%');
    });

    it('calculates moving average', () => {
      expect(movingAverage([40, 50, 60, 70, 80], 5)).toBe(60);
      expect(movingAverage([10, 20, 30], 2)).toBe(25);
    });
  });
});
