import { describe, it, expect } from 'vitest';
import { checkAchievements, applyAchievements, ACHIEVEMENTS } from '@/lib/achievements';
import { defaultUserProgress } from '@/lib/storage';
import type { TypingResult } from '@/types';

describe('Achievements Engine', () => {
  it('has 21 distinct predefined achievements', () => {
    expect(ACHIEVEMENTS.length).toBe(21);
    const ids = new Set(ACHIEVEMENTS.map(a => a.id));
    expect(ids.size).toBe(21);
  });

  it('detects first_test achievement upon test completion', () => {
    const progress = defaultUserProgress();
    const result: TypingResult = {
      id: 'res-1',
      mode: 'timed',
      duration: 60,
      elapsedMs: 60000,
      grossWpm: 45,
      netWpm: 42,
      accuracy: 96,
      correctChars: 210,
      errorChars: 3,
      totalKeystrokes: 220,
      charErrors: {},
      completedAt: Date.now(),
      textLength: 213,
      charsTyped: 213,
    };
    progress.results.push(result);

    const newlyUnlocked = checkAchievements(progress, result);
    const ids = newlyUnlocked.map(a => a.id);
    expect(ids).toContain('first_test');
    expect(ids).toContain('wpm_30');
    expect(ids).toContain('accuracy_95');
  });

  it('applies newly unlocked achievements and adds their XP to user progress', () => {
    const progress = defaultUserProgress();
    const ach = ACHIEVEMENTS.find(a => a.id === 'first_test')!;
    const updated = applyAchievements(progress, [ach]);

    expect(updated.unlockedAchievements.some(u => u.achievementId === 'first_test')).toBe(true);
    expect(updated.xp).toBe(ach.xpReward);
  });

  it('is idempotent and does not award duplicate achievements', () => {
    let progress = defaultUserProgress();
    const ach = ACHIEVEMENTS.find(a => a.id === 'first_test')!;
    progress = applyAchievements(progress, [ach]);

    const result: TypingResult = {
      id: 'res-2',
      mode: 'timed',
      duration: 60,
      elapsedMs: 60000,
      grossWpm: 25,
      netWpm: 25,
      accuracy: 95,
      correctChars: 125,
      errorChars: 0,
      totalKeystrokes: 125,
      charErrors: {},
      completedAt: Date.now(),
      textLength: 125,
      charsTyped: 125,
    };
    progress.results.push(result);

    const newlyUnlocked = checkAchievements(progress, result);
    expect(newlyUnlocked.map(a => a.id)).not.toContain('first_test');
  });
});
