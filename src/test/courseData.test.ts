import { describe, it, expect } from 'vitest';
import {
  LESSONS,
  MODULES,
  CERTIFICATE_REQUIREMENTS,
  getLessonsForLevel,
  getInitialUnlockedLessons,
  getUnlockedAfterCompletion,
} from '@/data/courseData';

describe('Course Data & Curriculum Integrity', () => {
  it('contains all 47 lessons across 3 levels', () => {
    expect(LESSONS.length).toBe(47);
    const beginner = getLessonsForLevel('beginner');
    const intermediate = getLessonsForLevel('intermediate');
    const advanced = getLessonsForLevel('advanced');

    expect(beginner.length).toBeGreaterThan(0);
    expect(intermediate.length).toBeGreaterThan(0);
    expect(advanced.length).toBeGreaterThan(0);
    expect(beginner.length + intermediate.length + advanced.length).toBe(47);
  });

  it('ensures every lesson has non-empty text, title, and valid difficulty', () => {
    for (const lesson of LESSONS) {
      expect(lesson.id).toBeTruthy();
      expect(lesson.title).toBeTruthy();
      expect(lesson.text.length).toBeGreaterThan(10);
      expect(lesson.difficulty).toBeGreaterThanOrEqual(1);
      expect(lesson.difficulty).toBeLessThanOrEqual(5);
      expect(lesson.minAccuracy).toBeGreaterThanOrEqual(70);
    }
  });

  it('ensures all lesson IDs are unique', () => {
    const ids = new Set(LESSONS.map(l => l.id));
    expect(ids.size).toBe(LESSONS.length);
  });

  it('ensures every lesson belongs to a valid registered module', () => {
    const moduleIds = new Set(MODULES.map(m => m.id));
    for (const lesson of LESSONS) {
      expect(moduleIds.has(lesson.moduleId)).toBe(true);
    }
  });

  it('unlocks the initial lesson and advances sequentially upon completion', () => {
    const initial = getInitialUnlockedLessons('beginner');
    expect(initial.length).toBe(1);
    expect(initial[0]).toBe(LESSONS[0].id);

    // After completing first lesson, next lesson in track is unlocked
    const unlocked = getUnlockedAfterCompletion(LESSONS[0].id, [LESSONS[0].id]);
    expect(unlocked.length).toBe(1);
    expect(unlocked[0]).toBe(LESSONS[1].id);
  });

  it('provides certificate requirements for all three tracks', () => {
    expect(CERTIFICATE_REQUIREMENTS.beginner.minWpm).toBe(18);
    expect(CERTIFICATE_REQUIREMENTS.intermediate.minWpm).toBe(35);
    expect(CERTIFICATE_REQUIREMENTS.advanced.minWpm).toBe(60);
  });
});
