// ============================================================
// TypeMaster — Courses Page (Level Overview)
// ============================================================
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Lock, ChevronRight, PlayCircle, GraduationCap, Zap, Award } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getLessonsForLevel, getModulesForLevel } from '@/data/courseData';
import type { LevelId } from '@/types';

const LEVELS = [
  {
    id: 'beginner' as LevelId,
    name: 'Beginner',
    tagline: 'Build the Foundation',
    description: 'Perfect for those new to touch typing or looking to build proper technique from scratch.',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.2)',
    icon: GraduationCap,
    targetWpm: '20–40 WPM',
    targetAccuracy: '85%+',
  },
  {
    id: 'intermediate' as LevelId,
    name: 'Intermediate',
    tagline: 'Build Speed & Accuracy',
    description: 'For typists who know the basics but want to significantly improve speed and error reduction.',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    icon: Zap,
    targetWpm: '40–70 WPM',
    targetAccuracy: '90%+',
  },
  {
    id: 'advanced' as LevelId,
    name: 'Advanced',
    tagline: 'Achieve Mastery',
    description: 'For proficient typists aiming for expert-level speed, accuracy, and consistency under pressure.',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.08)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
    icon: Award,
    targetWpm: '70+ WPM',
    targetAccuracy: '93%+',
  },
];

export function CoursesPage() {
  const { progress } = useApp();

  return (
    <div className="page">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="page-header">
          <h1 className="page-title">
            <BookOpen size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--clr-primary-500)' }} aria-hidden="true" />
            Curriculum Courses
          </h1>
          <p className="page-subtitle">47 structured lessons across three comprehensive learning tracks.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {LEVELS.map(level => {
            const Icon = level.icon;
            const cp = progress.courseProgress[level.id];
            const lessons = getLessonsForLevel(level.id);
            const modules = getModulesForLevel(level.id);
            const completed = cp.completedLessonIds.length;
            const total = lessons.length;
            const pct = Math.round((completed / total) * 100);
            const nextLessonId = cp.unlockedLessonIds.find(id => !cp.completedLessonIds.includes(id)) ?? lessons[0]?.id;

            return (
              <div
                key={level.id}
                className="card"
                style={{ background: 'var(--bg-surface)', border: `1.5px solid ${level.borderColor}`, padding: '1.75rem' }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {/* Left: overview */}
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', background: level.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: level.color }}>
                        <Icon size={20} aria-hidden="true" />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: level.color }}>{level.name}</h2>
                        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{level.tagline}</p>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                      {level.description}
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                      <Metric label="Lessons" value={total} />
                      <Metric label="Modules" value={modules.length} />
                      <Metric label="Target Speed" value={level.targetWpm} />
                      <Metric label="Min Accuracy" value={level.targetAccuracy} />
                    </div>

                    {/* Progress */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Track Progress</span>
                        <span style={{ fontWeight: 600, color: level.color }}>{completed}/{total} lessons ({pct}%)</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: level.color }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {nextLessonId ? (
                        <Link to={`/courses/${level.id}/${nextLessonId}`} className="btn" style={{ background: level.color, color: 'white', borderColor: level.color }}>
                          <PlayCircle size={15} aria-hidden="true" />
                          {completed === 0 ? 'Start Course' : 'Continue Course'}
                        </Link>
                      ) : null}
                      <Link to={`/courses/${level.id}`} className="btn btn-secondary">
                        View All Lessons <ChevronRight size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>

                  {/* Right: module list */}
                  <div style={{ width: '280px', flexShrink: 0 }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                      Track Modules ({modules.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {modules.map(module => {
                        const moduleLessons = lessons.filter(l => l.moduleId === module.id);
                        const moduleCompleted = moduleLessons.filter(l => cp.completedLessonIds.includes(l.id)).length;
                        const allDone = moduleCompleted === moduleLessons.length && moduleLessons.length > 0;
                        const anyDone = moduleCompleted > 0;

                        return (
                          <div key={module.id} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.5rem 0.75rem', background: 'var(--bg-surface-2)',
                            borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
                            fontSize: '0.8rem',
                          }}>
                            {allDone
                              ? <CheckCircle size={15} style={{ color: level.color, flexShrink: 0 }} aria-label="Complete" />
                              : anyDone
                                ? <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${level.color}`, flexShrink: 0 }} aria-hidden="true" />
                                : <Lock size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} aria-label="Not started" />
                            }
                            <span style={{ flex: 1, fontWeight: anyDone ? 600 : 400, color: anyDone ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                              {module.name}
                            </span>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>
                              {moduleCompleted}/{moduleLessons.length}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}
