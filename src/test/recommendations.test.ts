import { describe, it, expect } from 'vitest';
import { generateRecommendations } from '@/lib/recommendations';
import { defaultUserProgress } from '@/lib/storage';

describe('Adaptive Recommendation Engine', () => {
  it('recommends onboarding first lesson for new users with no practice history', () => {
    const progress = defaultUserProgress();
    const recs = generateRecommendations(progress);

    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].type).toBe('next_lesson');
    expect(recs[0].id).toBe('onboarding');
  });

  it('detects low accuracy and recommends accuracy drills', () => {
    const progress = defaultUserProgress();
    // Add 4 results with low accuracy
    for (let i = 0; i < 4; i++) {
      progress.results.push({
        id: `res-${i}`,
        mode: 'timed',
        elapsedMs: 60000,
        grossWpm: 40,
        netWpm: 35,
        accuracy: 82, // low accuracy
        correctChars: 150,
        errorChars: 20,
        totalKeystrokes: 170,
        charErrors: { 'e': 10 },
        completedAt: Date.now() - i * 3600000,
        textLength: 170,
        charsTyped: 170,
      });
    }

    const recs = generateRecommendations(progress);
    expect(recs.some(r => r.type === 'accuracy')).toBe(true);
    expect(recs.some(r => r.type === 'weak_key')).toBe(true);
  });
});
