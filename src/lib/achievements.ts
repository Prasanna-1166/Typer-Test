// ============================================================
// TypeMaster — Achievement Definitions & Engine
// ============================================================
import type { Achievement, UnlockedAchievement, TypingResult, UserProgress } from '@/types';

export const ACHIEVEMENTS: Achievement[] = [
  // Milestone
  {
    id: 'first_lesson',
    title: 'First Steps',
    description: 'Complete your very first lesson.',
    icon: 'target',
    xpReward: 50,
    conditionType: 'first_lesson',
    conditionValue: 1,
    category: 'lessons',
  },
  {
    id: 'first_test',
    title: 'Test Drive',
    description: 'Complete your first typing test.',
    icon: 'timer',
    xpReward: 50,
    conditionType: 'first_test',
    conditionValue: 1,
    category: 'misc',
  },
  {
    id: 'lessons_5',
    title: 'Eager Learner',
    description: 'Complete 5 lessons.',
    icon: 'book',
    xpReward: 100,
    conditionType: 'lessons_completed',
    conditionValue: 5,
    category: 'lessons',
  },
  {
    id: 'lessons_20',
    title: 'Dedicated Student',
    description: 'Complete 20 lessons.',
    icon: 'graduation-cap',
    xpReward: 300,
    conditionType: 'lessons_completed',
    conditionValue: 20,
    category: 'lessons',
  },
  {
    id: 'lessons_50',
    title: 'Course Champion',
    description: 'Complete 50 lessons.',
    icon: 'award',
    xpReward: 750,
    conditionType: 'lessons_completed',
    conditionValue: 50,
    category: 'lessons',
  },
  // Speed
  {
    id: 'wpm_30',
    title: 'Speed Starter',
    description: 'Reach 30 WPM in a test.',
    icon: 'zap',
    xpReward: 75,
    conditionType: 'wpm_reached',
    conditionValue: 30,
    category: 'speed',
  },
  {
    id: 'wpm_60',
    title: 'Smooth Operator',
    description: 'Reach 60 WPM in a test.',
    icon: 'zap',
    xpReward: 150,
    conditionType: 'wpm_reached',
    conditionValue: 60,
    category: 'speed',
  },
  {
    id: 'wpm_80',
    title: 'Speed Demon',
    description: 'Reach 80 WPM in a test.',
    icon: 'zap',
    xpReward: 300,
    conditionType: 'wpm_reached',
    conditionValue: 80,
    category: 'speed',
  },
  {
    id: 'wpm_100',
    title: 'Century Mark',
    description: 'Reach 100 WPM in a test.',
    icon: 'zap',
    xpReward: 500,
    conditionType: 'wpm_reached',
    conditionValue: 100,
    category: 'speed',
  },
  {
    id: 'wpm_120',
    title: 'Lightning Fingers',
    description: 'Reach 120 WPM in a test.',
    icon: 'zap',
    xpReward: 1000,
    conditionType: 'wpm_reached',
    conditionValue: 120,
    category: 'speed',
  },
  // Accuracy
  {
    id: 'accuracy_95',
    title: 'Sharp Shooter',
    description: 'Achieve 95% accuracy in a test.',
    icon: 'target',
    xpReward: 100,
    conditionType: 'accuracy_reached',
    conditionValue: 95,
    category: 'accuracy',
  },
  {
    id: 'accuracy_99',
    title: 'Perfection Seeker',
    description: 'Achieve 99% accuracy in a test.',
    icon: 'crosshair',
    xpReward: 400,
    conditionType: 'accuracy_reached',
    conditionValue: 99,
    category: 'accuracy',
  },
  // Streak
  {
    id: 'streak_3',
    title: 'On a Roll',
    description: 'Practice 3 days in a row.',
    icon: 'flame',
    xpReward: 100,
    conditionType: 'streak_days',
    conditionValue: 3,
    category: 'streak',
  },
  {
    id: 'streak_7',
    title: 'Weekly Warrior',
    description: 'Practice 7 days in a row.',
    icon: 'calendar',
    xpReward: 250,
    conditionType: 'streak_days',
    conditionValue: 7,
    category: 'streak',
  },
  {
    id: 'streak_30',
    title: 'Monthly Mastery',
    description: 'Practice 30 days in a row.',
    icon: 'calendar',
    xpReward: 1000,
    conditionType: 'streak_days',
    conditionValue: 30,
    category: 'streak',
  },
  // Tests
  {
    id: 'tests_10',
    title: 'Tester',
    description: 'Complete 10 typing tests.',
    icon: 'clipboard-check',
    xpReward: 150,
    conditionType: 'tests_completed',
    conditionValue: 10,
    category: 'misc',
  },
  {
    id: 'tests_50',
    title: 'Practice Makes Perfect',
    description: 'Complete 50 typing tests.',
    icon: 'award',
    xpReward: 500,
    conditionType: 'tests_completed',
    conditionValue: 50,
    category: 'misc',
  },
  // Personal Best
  {
    id: 'personal_best',
    title: 'Personal Record',
    description: 'Beat your own personal best WPM.',
    icon: 'trophy',
    xpReward: 200,
    conditionType: 'personal_best',
    conditionValue: 1,
    category: 'speed',
  },
  // Level completion
  {
    id: 'beginner_complete',
    title: 'Beginner Graduate',
    description: 'Complete the Beginner course.',
    icon: 'graduation-cap',
    xpReward: 500,
    conditionType: 'level_completed',
    conditionValue: 1,
    category: 'lessons',
  },
  {
    id: 'intermediate_complete',
    title: 'Intermediate Graduate',
    description: 'Complete the Intermediate course.',
    icon: 'trophy',
    xpReward: 1000,
    conditionType: 'level_completed',
    conditionValue: 2,
    category: 'lessons',
  },
  {
    id: 'advanced_complete',
    title: 'Master Typist',
    description: 'Complete the Advanced course.',
    icon: 'award',
    xpReward: 2000,
    conditionType: 'level_completed',
    conditionValue: 3,
    category: 'lessons',
  },
];

/**
 * Check which achievements should be newly unlocked given the current state.
 * Returns only achievements that were NOT already unlocked.
 * This is idempotent — safe to call repeatedly.
 */
export function checkAchievements(
  progress: UserProgress,
  latestResult?: TypingResult
): Achievement[] {
  const alreadyUnlocked = new Set(progress.unlockedAchievements.map(u => u.achievementId));
  const newlyUnlocked: Achievement[] = [];

  const lessonsCompleted = Object.values(progress.lessonProgress).filter(lp => lp.completedAt !== null).length;
  const testsCompleted = progress.results.filter(r => r.mode === 'timed' || r.mode === 'passage').length;
  const bestWpm = progress.results.length > 0 ? Math.max(...progress.results.map(r => r.netWpm)) : 0;
  const bestAccuracy = progress.results.length > 0 ? Math.max(...progress.results.map(r => r.accuracy)) : 0;
  const streak = progress.streak;

  const isNewPersonalBest = latestResult && progress.results.filter(r => r.id !== latestResult.id).length > 0
    ? latestResult.netWpm > Math.max(0, ...progress.results.filter(r => r.id !== latestResult.id).map(r => r.netWpm))
    : false;

  for (const ach of ACHIEVEMENTS) {
    if (alreadyUnlocked.has(ach.id)) continue;

    let shouldUnlock = false;

    switch (ach.conditionType) {
      case 'first_lesson':
        shouldUnlock = lessonsCompleted >= 1;
        break;
      case 'first_test':
        shouldUnlock = testsCompleted >= 1;
        break;
      case 'lessons_completed':
        shouldUnlock = lessonsCompleted >= ach.conditionValue;
        break;
      case 'tests_completed':
        shouldUnlock = testsCompleted >= ach.conditionValue;
        break;
      case 'wpm_reached':
        shouldUnlock = bestWpm >= ach.conditionValue || (latestResult?.netWpm ?? 0) >= ach.conditionValue;
        break;
      case 'accuracy_reached':
        shouldUnlock = bestAccuracy >= ach.conditionValue || (latestResult?.accuracy ?? 0) >= ach.conditionValue;
        break;
      case 'streak_days':
        shouldUnlock = streak >= ach.conditionValue;
        break;
      case 'personal_best':
        shouldUnlock = isNewPersonalBest === true;
        break;
      case 'level_completed':
        if (ach.conditionValue === 1) shouldUnlock = progress.courseProgress.beginner.completedAt !== null;
        if (ach.conditionValue === 2) shouldUnlock = progress.courseProgress.intermediate.completedAt !== null;
        if (ach.conditionValue === 3) shouldUnlock = progress.courseProgress.advanced.completedAt !== null;
        break;
    }

    if (shouldUnlock) {
      newlyUnlocked.push(ach);
    }
  }

  return newlyUnlocked;
}

/**
 * Apply newly unlocked achievements to progress (idempotent).
 */
export function applyAchievements(
  progress: UserProgress,
  newAchievements: Achievement[]
): UserProgress {
  const alreadyUnlocked = new Set(progress.unlockedAchievements.map(u => u.achievementId));
  let xpGain = 0;
  const newUnlocked: UnlockedAchievement[] = [];

  for (const ach of newAchievements) {
    if (!alreadyUnlocked.has(ach.id)) {
      newUnlocked.push({ achievementId: ach.id, unlockedAt: Date.now() });
      xpGain += ach.xpReward;
    }
  }

  return {
    ...progress,
    xp: progress.xp + xpGain,
    unlockedAchievements: [...progress.unlockedAchievements, ...newUnlocked],
  };
}
