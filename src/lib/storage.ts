// ============================================================
// TypeMaster — IndexedDB Persistence Service
// ============================================================
import { openDB, type IDBPDatabase } from 'idb';
import type { UserProgress, AppSettings, CourseData, TypingResult, LessonProgress } from '@/types';
import { defaultCourseData } from '@/data/courseData';

const DB_NAME = 'typemaster-db';
const DB_VERSION = 1;

// Store names
const STORES = {
  PROGRESS: 'progress',
  SETTINGS: 'settings',
  COURSE_DATA: 'courseData',
  RESULTS: 'results',
} as const;

// ---- Schema Versions ----
export const PROGRESS_SCHEMA_VERSION = 1;
export const SETTINGS_SCHEMA_VERSION = 1;
export const COURSE_SCHEMA_VERSION = 1;

// ---- Default values ----
export function defaultUserProgress(): UserProgress {
  return {
    xp: 0,
    level: 1,
    streak: 0,
    lastPracticeDate: null,
    longestStreak: 0,
    totalPracticeMinutes: 0,
    unlockedAchievements: [],
    courseProgress: {
      beginner: { levelId: 'beginner', completedLessonIds: [], unlockedLessonIds: [], startedAt: null, completedAt: null },
      intermediate: { levelId: 'intermediate', completedLessonIds: [], unlockedLessonIds: [], startedAt: null, completedAt: null },
      advanced: { levelId: 'advanced', completedLessonIds: [], unlockedLessonIds: [], startedAt: null, completedAt: null },
    },
    lessonProgress: {},
    results: [],
    certificates: [],
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function defaultSettings(): AppSettings {
  return {
    theme: 'system',
    soundEnabled: false,
    reducedMotion: false,
    showVirtualKeyboard: true,
    showFingerGuide: true,
    countdown: true,
    caretStyle: 'line',
    fontSize: 'md',
    defaultTestDuration: 60,
    defaultTestDifficulty: 1,
    schemaVersion: SETTINGS_SCHEMA_VERSION,
  };
}

// ---- DB Initialization ----
let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
          db.createObjectStore(STORES.PROGRESS);
        }
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS);
        }
        if (!db.objectStoreNames.contains(STORES.COURSE_DATA)) {
          db.createObjectStore(STORES.COURSE_DATA);
        }
        if (!db.objectStoreNames.contains(STORES.RESULTS)) {
          const store = db.createObjectStore(STORES.RESULTS, { keyPath: 'id' });
          store.createIndex('completedAt', 'completedAt');
        }
      },
    });
  }
  return dbPromise;
}

// ---- User Progress ----
export async function loadProgress(): Promise<UserProgress> {
  if (typeof indexedDB === 'undefined') return defaultUserProgress();
  try {
    const db = await getDB();
    const data = await db.get(STORES.PROGRESS, 'main');
    if (!data) return defaultUserProgress();
    // Validate schema version
    if (data.schemaVersion !== PROGRESS_SCHEMA_VERSION) {
      return migrateProgress(data);
    }
    return data as UserProgress;
  } catch (e) {
    console.warn('Failed to load progress:', e);
    return defaultUserProgress();
  }
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  try {
    const db = await getDB();
    await db.put(STORES.PROGRESS, { ...progress, updatedAt: Date.now() }, 'main');
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

function migrateProgress(data: unknown): UserProgress {
  // Future migrations go here
  const defaults = defaultUserProgress();
  if (typeof data === 'object' && data !== null) {
    return { ...defaults, ...(data as Partial<UserProgress>), schemaVersion: PROGRESS_SCHEMA_VERSION };
  }
  return defaults;
}

// ---- Results ----
export async function saveResult(result: TypingResult): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  try {
    const db = await getDB();
    await db.put(STORES.RESULTS, result);
    // Also keep inline in progress
    const progress = await loadProgress();
    // Prevent duplicates
    const exists = progress.results.some(r => r.id === result.id);
    if (!exists) {
      progress.results = [result, ...progress.results].slice(0, 500); // cap at 500
      await saveProgress(progress);
    }
  } catch (e) {
    console.error('Failed to save result:', e);
  }
}

export async function loadResults(): Promise<TypingResult[]> {
  if (typeof indexedDB === 'undefined') return [];
  try {
    const progress = await loadProgress();
    return progress.results;
  } catch (e) {
    console.warn('Failed to load results:', e);
    return [];
  }
}

// ---- Settings ----
export async function loadSettings(): Promise<AppSettings> {
  if (typeof indexedDB === 'undefined') return defaultSettings();
  try {
    const db = await getDB();
    const data = await db.get(STORES.SETTINGS, 'main');
    if (!data) return defaultSettings();
    return { ...defaultSettings(), ...(data as Partial<AppSettings>) };
  } catch (e) {
    console.warn('Failed to load settings:', e);
    return defaultSettings();
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  try {
    const db = await getDB();
    await db.put(STORES.SETTINGS, settings, 'main');
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

// ---- Course Data ----
export async function loadCourseData(): Promise<CourseData> {
  if (typeof indexedDB === 'undefined') return { ...defaultCourseData(), customLessons: [] };
  try {
    const db = await getDB();
    const data = await db.get(STORES.COURSE_DATA, 'main');
    if (!data) return { ...defaultCourseData(), customLessons: [] };
    return data as CourseData;
  } catch (e) {
    console.warn('Failed to load course data:', e);
    return { ...defaultCourseData(), customLessons: [] };
  }
}

export async function saveCourseData(data: CourseData): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORES.COURSE_DATA, { ...data, lastModified: Date.now() }, 'main');
  } catch (e) {
    console.error('Failed to save course data:', e);
  }
}

// ---- Lesson Progress ----
export async function updateLessonProgress(lessonId: string, update: Partial<LessonProgress>): Promise<void> {
  const progress = await loadProgress();
  const existing = progress.lessonProgress[lessonId] ?? {
    lessonId,
    completedAt: null,
    attempts: 0,
    bestWpm: 0,
    bestAccuracy: 0,
  };
  progress.lessonProgress[lessonId] = { ...existing, ...update };
  await saveProgress(progress);
}

// ---- Export / Import ----
export async function exportAllData(): Promise<string> {
  const [progress, settings, courseData] = await Promise.all([
    loadProgress(),
    loadSettings(),
    loadCourseData(),
  ]);
  const exportPayload = {
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    progress,
    settings,
    courseData,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export async function importAllData(json: string): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = JSON.parse(json);
    if (!payload || typeof payload !== 'object') {
      return { success: false, error: 'Invalid file format.' };
    }
    if (payload.exportVersion !== 1) {
      return { success: false, error: `Unsupported export version: ${payload.exportVersion}` };
    }
    if (payload.progress) {
      const migrated = migrateProgress(payload.progress);
      await saveProgress(migrated);
    }
    if (payload.settings) {
      await saveSettings({ ...defaultSettings(), ...(payload.settings as Partial<AppSettings>) });
    }
    if (payload.courseData) {
      await saveCourseData(payload.courseData as CourseData);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: `Parse error: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ---- Reset ----
export async function resetAllProgress(): Promise<void> {
  const fresh = defaultUserProgress();
  await saveProgress(fresh);
  try {
    const db = await getDB();
    await db.clear(STORES.RESULTS);
  } catch (_) { /* ignore */ }
}

export async function resetCourseData(): Promise<void> {
  await saveCourseData({ ...defaultCourseData(), customLessons: [] });
}
