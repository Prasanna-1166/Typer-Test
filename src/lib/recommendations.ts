// ============================================================
// TypeMaster — Recommendation Engine
// ============================================================
import type { Recommendation, UserProgress } from '@/types';
import { movingAverage } from './metrics';

// Thresholds (configurable)
const THRESHOLDS = {
  LOW_ACCURACY: 90,           // below this → accuracy focus
  HIGH_ACCURACY: 97,          // above this → may push speed
  SLOW_WPM: 30,               // below this → fundamentals
  INTERMEDIATE_WPM: 60,       // below this → mid-level drills
  HIGH_WPM: 80,               // above this → challenge drills
  HIGH_VARIANCE_THRESHOLD: 15,// WPM variance above this → consistency focus
  MIN_RESULTS_FOR_TREND: 3,   // minimum results before trend analysis
  WEAK_KEY_MIN_ERRORS: 5,     // minimum per-key errors to call it a weak key
};

export { THRESHOLDS as RECOMMENDATION_THRESHOLDS };

function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
}

/**
 * Generate personalized recommendations from real progress data.
 * Only uses information actually available in local storage.
 */
export function generateRecommendations(progress: UserProgress): Recommendation[] {
  const results = progress.results;
  const recommendations: Recommendation[] = [];

  if (results.length === 0) {
    // New user
    recommendations.push({
      id: 'onboarding',
      type: 'next_lesson',
      title: 'Start Your First Lesson',
      description: 'Begin with beginner fundamentals to build a strong foundation.',
      reason: 'You haven\'t completed any lessons yet. Start from the beginning!',
      priority: 1,
      action: { type: 'start_lesson', levelId: 'beginner' },
    });
    return recommendations;
  }

  const recent = results.slice(-10);
  const recentWpms = recent.map(r => r.netWpm);
  const recentAccuracies = recent.map(r => r.accuracy);
  const avgWpm = movingAverage(recentWpms);
  const avgAccuracy = movingAverage(recentAccuracies);
  const wpmVariance = variance(recentWpms);

  // 1. Low accuracy recommendation
  if (avgAccuracy < THRESHOLDS.LOW_ACCURACY && results.length >= THRESHOLDS.MIN_RESULTS_FOR_TREND) {
    recommendations.push({
      id: 'rec_accuracy',
      type: 'accuracy',
      title: 'Focus on Accuracy',
      description: 'Your recent accuracy is below 90%. Slow down and type with precision.',
      reason: `Your last ${recent.length} sessions averaged ${avgAccuracy.toFixed(1)}% accuracy. Aim for 95%+ before pushing speed.`,
      priority: 1,
      action: { type: 'start_test', testMode: 'timed', testDuration: 60 },
    });
  }

  // 2. High variance → consistency
  if (wpmVariance > THRESHOLDS.HIGH_VARIANCE_THRESHOLD ** 2 && results.length >= THRESHOLDS.MIN_RESULTS_FOR_TREND) {
    recommendations.push({
      id: 'rec_consistency',
      type: 'consistency',
      title: 'Build Consistency',
      description: 'Your typing speed varies significantly between sessions. Regular practice will smooth this out.',
      reason: `Your WPM varies widely (σ²=${Math.round(wpmVariance)}). Consistent daily practice builds muscle memory.`,
      priority: 2,
      action: { type: 'start_test', testMode: 'timed', testDuration: 60 },
    });
  }

  // 3. Slow WPM → beginner drills
  if (avgWpm < THRESHOLDS.SLOW_WPM) {
    recommendations.push({
      id: 'rec_beginner_drills',
      type: 'speed',
      title: 'Practice Beginner Drills',
      description: 'Focus on home row and basic finger placement to build speed naturally.',
      reason: `Your average speed is ${avgWpm} WPM. Structured lessons will help you build speed systematically.`,
      priority: 1,
      action: { type: 'start_lesson', levelId: 'beginner' },
    });
  }

  // 4. Intermediate WPM → intermediate drills
  if (avgWpm >= THRESHOLDS.SLOW_WPM && avgWpm < THRESHOLDS.INTERMEDIATE_WPM && avgAccuracy >= THRESHOLDS.LOW_ACCURACY) {
    recommendations.push({
      id: 'rec_intermediate',
      type: 'speed',
      title: 'Intermediate Speed Drills',
      description: 'Your accuracy is good — now push your speed with timed exercises.',
      reason: `You\'re at ${avgWpm} WPM with ${avgAccuracy.toFixed(1)}% accuracy. Time to push toward 60+ WPM.`,
      priority: 2,
      action: { type: 'start_lesson', levelId: 'intermediate' },
    });
  }

  // 5. High accuracy, reasonable speed → push speed
  if (avgAccuracy >= THRESHOLDS.HIGH_ACCURACY && avgWpm >= THRESHOLDS.INTERMEDIATE_WPM) {
    recommendations.push({
      id: 'rec_speed_challenge',
      type: 'speed',
      title: 'Speed Challenge',
      description: 'Your accuracy is excellent! Try a 30-second sprint to push your top speed.',
      reason: `You're maintaining ${avgAccuracy.toFixed(1)}% accuracy. It\'s time to challenge your maximum speed.`,
      priority: 2,
      action: { type: 'start_test', testMode: 'timed', testDuration: 30 },
    });
  }

  // 6. Weak key analysis
  const charErrorTotals: Record<string, number> = {};
  for (const result of results) {
    for (const [char, count] of Object.entries(result.charErrors ?? {})) {
      charErrorTotals[char] = (charErrorTotals[char] ?? 0) + count;
    }
  }
  const weakKeys = Object.entries(charErrorTotals)
    .filter(([, count]) => count >= THRESHOLDS.WEAK_KEY_MIN_ERRORS)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (weakKeys.length > 0) {
    const keyList = weakKeys.map(([k]) => `"${k}"`).join(', ');
    recommendations.push({
      id: 'rec_weak_keys',
      type: 'weak_key',
      title: `Practice Weak Keys: ${weakKeys.map(([k]) => k).join(', ')}`,
      description: `You make frequent mistakes on ${keyList}. Target practice will help.`,
      reason: `These keys account for ${weakKeys.reduce((s, [, c]) => s + c, 0)} errors across your recent sessions.`,
      priority: 1,
      action: {
        type: 'start_practice',
        practiceText: generateWeakKeyPractice(weakKeys.map(([k]) => k)),
      },
    });
  }

  // 7. Performance decline
  if (results.length >= 6) {
    const firstHalf = results.slice(-6, -3).map(r => r.netWpm);
    const secondHalf = results.slice(-3).map(r => r.netWpm);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    if (secondAvg < firstAvg - 5) {
      recommendations.push({
        id: 'rec_decline',
        type: 'revisit',
        title: 'Review Recent Lessons',
        description: 'Your performance has dipped recently. A refresher on earlier lessons can help.',
        reason: `Your speed dropped from ~${Math.round(firstAvg)} WPM to ~${Math.round(secondAvg)} WPM in recent sessions.`,
        priority: 2,
        action: { type: 'start_lesson', levelId: 'beginner' },
      });
    }
  }

  // Ensure at least one recommendation
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec_free_practice',
      type: 'next_lesson',
      title: 'Keep Practising',
      description: 'Your progress is solid. Keep up the consistent practice!',
      reason: `You\'re averaging ${avgWpm} WPM at ${avgAccuracy.toFixed(1)}% accuracy. Great work!`,
      priority: 3,
      action: { type: 'start_test', testMode: 'timed', testDuration: 60 },
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}

function generateWeakKeyPractice(weakKeys: string[]): string {
  const words: string[] = [];
  const keySet = weakKeys.map(k => k.toLowerCase()).filter(k => /[a-z]/.test(k));

  // Generate simple repetition and combination words
  for (const key of keySet) {
    words.push(key.repeat(3), key + 'a' + key, key + 'e' + key, key + 'o' + key);
  }

  // Simple sentences using those letters
  const sentences = [
    `Practice typing: ${keySet.join(', ')}.`,
    `The keys ${keySet.join(' and ')} need attention.`,
  ];

  return [...words, ...sentences].join(' ');
}

/**
 * Get the next recommended lesson for a level.
 */
export function getNextLesson(
  progress: UserProgress,
  levelId: string
): string | null {
  const courseProgress = progress.courseProgress[levelId as keyof typeof progress.courseProgress];
  if (!courseProgress) return null;
  const completed = new Set(courseProgress.completedLessonIds);
  const unlocked = courseProgress.unlockedLessonIds;
  return unlocked.find(id => !completed.has(id)) ?? null;
}
