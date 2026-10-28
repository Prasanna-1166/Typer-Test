// ============================================================
// TypeMaster — Dashboard Page
// ============================================================
import { Link } from 'react-router-dom';
import {
  BookOpen, Zap, Target, TrendingUp, Clock, Flame,
  ChevronRight, PlayCircle, BarChart3, Star, CheckCircle,
  GraduationCap, Award, Sparkles
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDuration, formatWpm } from '@/lib/metrics';
import { generateRecommendations } from '@/lib/recommendations';
import { getLessonsForLevel, getLessonById } from '@/data/courseData';
import type { LevelId } from '@/types';

const LEVEL_CONFIG = {
  beginner: { name: 'Beginner', color: '#22c55e', icon: GraduationCap },
  intermediate: { name: 'Intermediate', color: '#f59e0b', icon: Zap },
  advanced: { name: 'Advanced', color: '#6366f1', icon: Award },
};

export function DashboardPage() {
  const { progress, isLoading, xpInfo } = useApp();

  if (isLoading) {
    return (
      <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" aria-label="Loading dashboard" />
      </div>
    );
  }

  const isNewUser = progress.results.length === 0 && Object.keys(progress.lessonProgress).length === 0;
  const recentResults = progress.results.slice(0, 10);
  const bestWpm = progress.results.length > 0 ? Math.max(...progress.results.map(r => r.netWpm)) : 0;
  const recentAvgWpm = recentResults.length > 0
    ? Math.round(recentResults.slice(0, 5).reduce((s, r) => s + r.netWpm, 0) / Math.min(5, recentResults.length))
    : 0;
  const recentAvgAccuracy = recentResults.length > 0
    ? Math.round(recentResults.slice(0, 5).reduce((s, r) => s + r.accuracy, 0) / Math.min(5, recentResults.length) * 10) / 10
    : 0;

  const recommendations = generateRecommendations(progress);
  const topRec = recommendations[0];

  // Course progress summary
  const levels: LevelId[] = ['beginner', 'intermediate', 'advanced'];
  const levelStats = levels.map(lid => {
    const cp = progress.courseProgress[lid];
    const lessons = getLessonsForLevel(lid);
    const completed = cp.completedLessonIds.length;
    const total = lessons.length;
    return { lid, completed, total, pct: Math.round((completed / total) * 100) };
  });

  // Next lesson
  const nextLessonId = (() => {
    for (const lid of levels) {
      const cp = progress.courseProgress[lid];
      const unlocked = cp.unlockedLessonIds;
      const completed = new Set(cp.completedLessonIds);
      const next = unlocked.find(id => !completed.has(id));
      if (next) return next;
    }
    // Default to first lesson
    return 'beg-1-1';
  })();
  const nextLesson = getLessonById(nextLessonId);

  // Total practice time
  const practiceTimeLabel = progress.totalPracticeMinutes < 60
    ? `${progress.totalPracticeMinutes}m`
    : `${Math.floor(progress.totalPracticeMinutes / 60)}h ${progress.totalPracticeMinutes % 60}m`;

  return (
    <div className="page">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Learner Dashboard</h1>
          <p className="page-subtitle">
            {isNewUser
              ? 'Welcome to TypeMaster. Select a track or start a quick typing test to begin.'
              : `Level ${xpInfo.level} • ${xpInfo.title} • ${progress.xp.toLocaleString()} XP total`
            }
          </p>
        </div>

        {/* New user onboarding */}
        {isNewUser && (
          <div className="card" style={{
            marginBottom: '2rem',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-default)',
            padding: '2rem',
          }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Welcome to TypeMaster
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  Begin with a 60-second typing test to benchmark your typing speed and accuracy, or jump straight into the Beginner curriculum to master the home row keys.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link to="/courses/beginner/beg-1-1" className="btn btn-primary">
                    <PlayCircle size={16} aria-hidden="true" /> Start First Lesson
                  </Link>
                  <Link to="/test" className="btn btn-secondary">
                    <Target size={16} aria-hidden="true" /> Take Speed Test
                  </Link>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: 220 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={15} style={{ color: 'var(--clr-success-500)' }} aria-hidden="true" /> 47 lessons across 3 levels
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={15} style={{ color: 'var(--clr-success-500)' }} aria-hidden="true" /> Real-time WPM & error tracking
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={15} style={{ color: 'var(--clr-success-500)' }} aria-hidden="true" /> 21 achievements to unlock
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={15} style={{ color: 'var(--clr-success-500)' }} aria-hidden="true" /> Verifiable completion certificates
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Top Stats */}
        {!isNewUser && (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <StatCard icon={Zap} label="Best Speed" value={`${formatWpm(bestWpm)} WPM`} color="#6366f1" />
            <StatCard icon={Target} label="Recent Avg Speed" value={`${formatWpm(recentAvgWpm)} WPM`} color="#22c55e" />
            <StatCard icon={Star} label="Avg Accuracy" value={`${recentAvgAccuracy}%`} color="#f59e0b" />
            <StatCard icon={Flame} label="Practice Streak" value={`${progress.streak} days`} color="#ef4444" />
            <StatCard icon={Clock} label="Practice Time" value={practiceTimeLabel} color="#8b5cf6" />
            <StatCard icon={BookOpen} label="Total XP" value={progress.xp.toLocaleString()} color="#ec4899" />
          </div>
        )}

        {/* XP Progress bar */}
        {!isNewUser && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Level {xpInfo.level} — {xpInfo.title}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '0.75rem' }}>
                  {xpInfo.currentLevelXp} / {xpInfo.xpToNext} XP to next level
                </span>
              </div>
              <span className="badge badge-primary">{xpInfo.progressPercent}%</span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${xpInfo.progressPercent}%` }} />
            </div>
          </div>
        )}

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

          {/* Course Progress */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={17} style={{ color: 'var(--clr-primary-500)' }} aria-hidden="true" />
              Track Progress
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {levelStats.map(({ lid, completed, total, pct }) => {
                const cfg = LEVEL_CONFIG[lid as LevelId];
                const Icon = cfg.icon;
                return (
                  <div key={lid}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icon size={16} style={{ color: cfg.color }} aria-hidden="true" /> {cfg.name}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{completed}/{total} lessons</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <Link to="/courses" className="btn btn-secondary btn-sm" style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'center' }}>
              View All Courses <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {/* Next Lesson & Recommendations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {nextLesson && (
              <div className="card" style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-primary-500)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                  Next Lesson in Sequence
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.375rem' }}>{nextLesson.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {nextLesson.description}
                </p>
                <Link
                  to={`/courses/${nextLesson.levelId}/${nextLesson.id}`}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <PlayCircle size={15} aria-hidden="true" /> Start Lesson
                </Link>
              </div>
            )}

            {topRec && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-accent-500)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                  <Sparkles size={13} aria-hidden="true" /> Recommendation
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.375rem' }}>{topRec.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  {topRec.reason}
                </p>
                <RecommendationActionButton rec={topRec} />
              </div>
            )}
          </div>
        </div>

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={17} style={{ color: 'var(--clr-primary-500)' }} aria-hidden="true" />
                Recent Practice Sessions
              </h2>
              <Link to="/reports" className="btn btn-ghost btn-sm">
                View Full Reports <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net WPM</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accuracy</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {recentResults.slice(0, 7).map(result => (
                    <tr key={result.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(result.completedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--clr-primary-500)', fontFamily: 'var(--font-display)' }}>
                        {result.netWpm}
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: result.accuracy >= 95 ? 'var(--clr-success-500)' : result.accuracy >= 85 ? 'var(--clr-warning-500)' : 'var(--clr-error-500)', fontWeight: 600 }}>
                        {result.accuracy.toFixed(1)}%
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {formatDuration(result.elapsedMs)}
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{result.mode}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
          <Link to="/test" className="btn btn-primary">
            <Target size={16} aria-hidden="true" /> Take a Speed Test
          </Link>
          <Link to="/courses" className="btn btn-secondary">
            <BookOpen size={16} aria-hidden="true" /> All Courses
          </Link>
          <Link to="/reports" className="btn btn-secondary">
            <BarChart3 size={16} aria-hidden="true" /> View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof Zap;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
      <Icon size={18} style={{ color, margin: '0 auto 0.375rem', display: 'block' }} aria-hidden="true" />
      <div style={{ fontSize: '1.35rem', fontWeight: 800, color, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  );
}

function RecommendationActionButton({ rec }: { rec: ReturnType<typeof generateRecommendations>[0] }) {
  const { action } = rec;
  if (action.type === 'start_test') {
    return (
      <Link
        to="/test"
        className="btn btn-secondary btn-sm"
        style={{ width: '100%', justifyContent: 'center' }}
      >
        <Target size={14} aria-hidden="true" /> Start Recommended Test
      </Link>
    );
  }
  if (action.type === 'start_lesson') {
    return (
      <Link
        to={action.lessonId ? `/courses/${action.levelId}/${action.lessonId}` : `/courses/${action.levelId}`}
        className="btn btn-secondary btn-sm"
        style={{ width: '100%', justifyContent: 'center' }}
      >
        <PlayCircle size={14} aria-hidden="true" /> Go to Lesson
      </Link>
    );
  }
  return (
    <Link to="/test" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
      <PlayCircle size={14} aria-hidden="true" /> Start Practice
    </Link>
  );
}
