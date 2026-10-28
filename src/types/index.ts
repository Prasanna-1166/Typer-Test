// ============================================================
// TypeMaster — Core Type Definitions
// ============================================================

// ---- Levels ----
export type LevelId = 'beginner' | 'intermediate' | 'advanced';

// ---- Lesson ----
export interface Lesson {
  id: string;
  levelId: LevelId;
  moduleId: string;
  moduleName: string;
  title: string;
  description: string;
  objectives: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** The text the user must type. May be static string or generated. */
  text: string;
  instructions?: string;
  hints?: string[];
  /** Keys to highlight on virtual keyboard */
  focusKeys?: string[];
  /** Minimum accuracy % required to complete */
  minAccuracy: number;
  /** Minimum WPM required (0 = not required) */
  minWpm: number;
  /** XP awarded on completion */
  xpReward: number;
  /** Whether this lesson is part of the default curriculum */
  isDefault: boolean;
}

export interface Module {
  id: string;
  levelId: LevelId;
  name: string;
  description: string;
  order: number;
}

// ---- Typing Session ----
export type SessionStatus = 'idle' | 'ready' | 'running' | 'paused' | 'completed' | 'cancelled';
export type TestMode = 'timed' | 'passage' | 'free';
export type TimedDuration = 15 | 30 | 60 | 120;

export interface TypingSessionConfig {
  mode: TestMode;
  duration?: TimedDuration;
  text: string;
  lessonId?: string;
  difficulty?: 1 | 2 | 3;
  allowBackspace?: boolean;
}

export interface CharState {
  char: string;
  status: 'upcoming' | 'correct' | 'error' | 'corrected';
  typedChar?: string;
}

export interface TypingSessionState {
  status: SessionStatus;
  config: TypingSessionConfig;
  chars: CharState[];
  currentIndex: number;
  /** Monotonic start time from performance.now() */
  startTimeMs: number | null;
  /** Accumulated ms before current run (for pause/resume) */
  accumulatedMs: number;
  /** Monotonic pause start */
  pauseStartMs: number | null;
  totalKeystrokes: number;
  correctKeystrokes: number;
  errorCount: number;
  /** Map of char → error count */
  charErrors: Record<string, number>;
}

// ---- Metrics ----
export interface TypingResult {
  id: string;
  lessonId?: string;
  mode: TestMode;
  duration?: number; // seconds if timed
  elapsedMs: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number; // 0-100
  correctChars: number;
  errorChars: number;
  totalKeystrokes: number;
  charErrors: Record<string, number>;
  completedAt: number; // Date.now()
  textLength: number;
  charsTyped: number;
  levelId?: LevelId;
}

// ---- Progress ----
export interface LessonProgress {
  lessonId: string;
  completedAt: number | null;
  attempts: number;
  bestWpm: number;
  bestAccuracy: number;
  lastResult?: TypingResult;
}

export interface CourseProgress {
  levelId: LevelId;
  completedLessonIds: string[];
  unlockedLessonIds: string[];
  startedAt: number | null;
  completedAt: number | null;
  /** Qualifying result for certificate */
  finalAssessmentResult?: TypingResult;
}

// ---- Achievements ----
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  /** Condition type for the achievement engine */
  conditionType: AchievementCondition;
  conditionValue: number;
  /** Category for grouping */
  category: 'speed' | 'accuracy' | 'lessons' | 'streak' | 'misc';
}

export type AchievementCondition =
  | 'wpm_reached'
  | 'accuracy_reached'
  | 'lessons_completed'
  | 'tests_completed'
  | 'streak_days'
  | 'first_lesson'
  | 'first_test'
  | 'personal_best'
  | 'level_completed';

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: number;
  resultId?: string;
}

// ---- Gamification ----
export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  lastPracticeDate: string | null; // ISO date YYYY-MM-DD
  longestStreak: number;
  totalPracticeMinutes: number;
  unlockedAchievements: UnlockedAchievement[];
  courseProgress: Record<LevelId, CourseProgress>;
  lessonProgress: Record<string, LessonProgress>;
  results: TypingResult[];
  certificates: CertificateRecord[];
  /** Schema version for migrations */
  schemaVersion: number;
  createdAt: number;
  updatedAt: number;
}

// ---- Certificate ----
export interface CertificateRecord {
  id: string;
  levelId: LevelId;
  displayName: string;
  issuedAt: number;
  finalWpm: number;
  finalAccuracy: number;
  lessonsCompleted: number;
}

// ---- Recommendations ----
export interface Recommendation {
  id: string;
  type: 'accuracy' | 'speed' | 'consistency' | 'weak_key' | 'next_lesson' | 'revisit';
  title: string;
  description: string;
  reason: string;
  /** Action to launch the recommended practice */
  action: RecommendationAction;
  priority: 1 | 2 | 3; // 1 = highest
}

export interface RecommendationAction {
  type: 'start_lesson' | 'start_test' | 'start_practice';
  lessonId?: string;
  testMode?: TestMode;
  testDuration?: TimedDuration;
  practiceText?: string;
  levelId?: LevelId;
}

// ---- Settings ----
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  reducedMotion: boolean;
  showVirtualKeyboard: boolean;
  showFingerGuide: boolean;
  countdown: boolean;
  caretStyle: 'line' | 'block' | 'underline';
  fontSize: 'sm' | 'md' | 'lg';
  defaultTestDuration: TimedDuration;
  defaultTestDifficulty: 1 | 2 | 3;
  schemaVersion: number;
}

// ---- Local Course Content ----
export interface CourseData {
  lessons: Lesson[];
  modules: Module[];
  customLessons: Lesson[];
  schemaVersion: number;
  lastModified: number;
}

// ---- XP Level Thresholds ----
export interface XPLevel {
  level: number;
  minXp: number;
  maxXp: number;
  title: string;
}
