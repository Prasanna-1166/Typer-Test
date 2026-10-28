// ============================================================
// TypeMaster — Application Context
// ============================================================
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type {
  UserProgress,
  AppSettings,
  TypingResult,
  LessonProgress,
  Achievement,
  LevelId,
  CertificateRecord,
} from '@/types';
import {
  loadProgress,
  saveProgress,
  loadSettings,
  saveSettings,
  defaultUserProgress,
  defaultSettings,
} from '@/lib/storage';
import { calcStreak, calcXpLevel, toISODate } from '@/lib/metrics';
import { checkAchievements, applyAchievements, ACHIEVEMENTS } from '@/lib/achievements';
import { getInitialUnlockedLessons, getUnlockedAfterCompletion } from '@/data/courseData';

// ---- Toast ----
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// ---- Context Shape ----
interface AppContextValue {
  // Data
  progress: UserProgress;
  settings: AppSettings;
  isLoading: boolean;

  // Derived
  xpInfo: ReturnType<typeof calcXpLevel>;

  // Progress actions
  recordResult: (result: TypingResult) => Promise<Achievement[]>;
  updateLessonProgress: (lessonId: string, update: Partial<LessonProgress>) => Promise<void>;
  completeLessonAndAdvance: (lessonId: string, result: TypingResult) => Promise<{ newAchievements: Achievement[] }>;
  addXp: (amount: number, reason?: string) => Promise<void>;
  issueCertificate: (cert: CertificateRecord) => Promise<void>;

  // Settings actions
  updateSettings: (patch: Partial<AppSettings>) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Reload
  reloadProgress: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(defaultUserProgress());
  const [settings, setSettings] = useState<AppSettings>(defaultSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastCounter = useRef(0);

  // Resolved theme
  const resolvedTheme = (): 'light' | 'dark' => {
    if (settings.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return settings.theme;
  };

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // ---- Load initial data ----
  const reloadProgress = useCallback(async () => {
    const [prog, sett] = await Promise.all([loadProgress(), loadSettings()]);
    setProgress(prog);
    setSettings(sett);
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await reloadProgress();
      setIsLoading(false);
    };
    init();
  }, [reloadProgress]);

  // ---- Apply theme ----
  useEffect(() => {
    const t = resolvedTheme();
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  }, [settings.theme]);

  // ---- Toast helpers ----
  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${++toastCounter.current}`;
    const duration = toast.duration ?? 4000;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ---- Settings ----
  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    updateSettings({ theme: theme === 'light' ? 'dark' : 'light' });
  }, [theme, updateSettings]);

  // ---- Record result ----
  const recordResult = useCallback(async (result: TypingResult): Promise<Achievement[]> => {
    let newProgress: UserProgress = { ...progress };

    // Prevent duplicate result
    if (newProgress.results.some(r => r.id === result.id)) {
      return [];
    }

    // Add result
    newProgress.results = [result, ...newProgress.results].slice(0, 500);

    // Update streak
    const today = toISODate(Date.now());
    const timestamps = newProgress.results.map(r => r.completedAt);
    const { current, longest } = calcStreak(timestamps, today);
    newProgress.streak = current;
    newProgress.longestStreak = Math.max(longest, newProgress.longestStreak);
    newProgress.lastPracticeDate = today;

    // Update practice time
    newProgress.totalPracticeMinutes += Math.round(result.elapsedMs / 60000);

    // Ensure course progress initialized
    const levelId = result.levelId as LevelId | undefined;
    if (levelId && newProgress.courseProgress[levelId]) {
      if (!newProgress.courseProgress[levelId].startedAt) {
        newProgress.courseProgress[levelId].startedAt = Date.now();
      }
    }

    // Check achievements
    const newAchievements = checkAchievements(newProgress, result);
    newProgress = applyAchievements(newProgress, newAchievements);

    // Update XP level
    const xp = calcXpLevel(newProgress.xp);
    newProgress.level = xp.level;

    await saveProgress(newProgress);
    setProgress(newProgress);

    return newAchievements;
  }, [progress]);

  // ---- Lesson completion ----
  const completeLessonAndAdvance = useCallback(async (
    lessonId: string,
    result: TypingResult
  ): Promise<{ newAchievements: Achievement[] }> => {
    let newProgress: UserProgress = { ...progress };

    // Update lesson progress
    const existing = newProgress.lessonProgress[lessonId] ?? {
      lessonId, completedAt: null, attempts: 0, bestWpm: 0, bestAccuracy: 0,
    };

    const isNewCompletion = existing.completedAt === null;
    const updatedLesson: LessonProgress = {
      ...existing,
      lessonId,
      completedAt: Date.now(),
      attempts: existing.attempts + 1,
      bestWpm: Math.max(existing.bestWpm, result.netWpm),
      bestAccuracy: Math.max(existing.bestAccuracy, result.accuracy),
      lastResult: result,
    };
    newProgress.lessonProgress = { ...newProgress.lessonProgress, [lessonId]: updatedLesson };

    // Update course progress
    const levelId = result.levelId as LevelId;
    if (levelId && newProgress.courseProgress[levelId]) {
      const cp = newProgress.courseProgress[levelId];

      if (isNewCompletion && !cp.completedLessonIds.includes(lessonId)) {
        cp.completedLessonIds = [...cp.completedLessonIds, lessonId];
      }

      if (!cp.startedAt) cp.startedAt = Date.now();

      // Unlock next lesson
      const newUnlocks = getUnlockedAfterCompletion(lessonId, cp.completedLessonIds);
      for (const unlockId of newUnlocks) {
        if (!cp.unlockedLessonIds.includes(unlockId)) {
          cp.unlockedLessonIds = [...cp.unlockedLessonIds, unlockId];
        }
      }

      // Initialize unlocked lessons if empty
      if (cp.unlockedLessonIds.length === 0) {
        cp.unlockedLessonIds = getInitialUnlockedLessons(levelId);
      }

      newProgress.courseProgress = { ...newProgress.courseProgress, [levelId]: cp };
    }

    // Add result and XP
    const newAchievements = await recordResult(result);

    // Re-read to get achievements applied
    await saveProgress(newProgress);
    setProgress(newProgress);

    return { newAchievements };
  }, [progress, recordResult]);

  // ---- XP ----
  const addXp = useCallback(async (amount: number) => {
    const next = { ...progress, xp: progress.xp + amount };
    const xp = calcXpLevel(next.xp);
    next.level = xp.level;
    await saveProgress(next);
    setProgress(next);
  }, [progress]);

  // ---- Certificates ----
  const issueCertificate = useCallback(async (cert: CertificateRecord) => {
    const next: UserProgress = {
      ...progress,
      certificates: [cert, ...progress.certificates.filter(c => c.levelId !== cert.levelId)],
    };
    await saveProgress(next);
    setProgress(next);
  }, [progress]);

  const xpInfo = calcXpLevel(progress.xp);

  const value: AppContextValue = {
    progress,
    settings,
    isLoading,
    xpInfo,
    recordResult,
    issueCertificate,
    updateLessonProgress: async (lessonId, update) => {
      const existing = progress.lessonProgress[lessonId] ?? {
        lessonId, completedAt: null, attempts: 0, bestWpm: 0, bestAccuracy: 0,
      };
      const next = {
        ...progress,
        lessonProgress: { ...progress.lessonProgress, [lessonId]: { ...existing, ...update } },
      };
      await saveProgress(next);
      setProgress(next);
    },
    completeLessonAndAdvance,
    addXp,
    updateSettings,
    theme,
    toggleTheme,
    toasts,
    showToast,
    dismissToast,
    reloadProgress,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { ACHIEVEMENTS };
