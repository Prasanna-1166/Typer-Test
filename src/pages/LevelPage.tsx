// ============================================================
// TypeMaster — Level Page (All lessons for one level)
// ============================================================
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Lock, PlayCircle, RotateCcw, ChevronLeft, GraduationCap, Zap, Award } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getLessonsForLevel, getModulesForLevel } from '@/data/courseData';
import type { LevelId, Lesson } from '@/types';

const LEVEL_CONFIG = {
  beginner: { name: 'Beginner', color: '#22c55e', icon: GraduationCap },
  intermediate: { name: 'Intermediate', color: '#f59e0b', icon: Zap },
  advanced: { name: 'Advanced', color: '#6366f1', icon: Award },
};

export function LevelPage() {
  const { levelId } = useParams<{ levelId: string }>();
  const { progress } = useApp();

  const level = levelId as LevelId;
  const cfg = LEVEL_CONFIG[level];
  if (!cfg) return <div className="page"><div className="container" style={{ padding: '3rem' }}>Level not found.</div></div>;

  const Icon = cfg.icon;
  const cp = progress.courseProgress[level];
  const lessons = getLessonsForLevel(level);
  const modules = getModulesForLevel(level);
  const completedSet = new Set(cp.completedLessonIds);
  const unlockedSet = new Set(cp.unlockedLessonIds.length > 0 ? cp.unlockedLessonIds : [lessons[0]?.id]);

  const groupedByModule = modules.map(module => ({
    module,
    lessons: lessons.filter(l => l.moduleId === module.id),
  }));

  return (
    <div className="page">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <Link to="/courses" className="btn btn-ghost btn-sm" aria-label="Back to courses">
            <ChevronLeft size={16} aria-hidden="true" /> Courses
          </Link>
        </div>

        <div className="page-header">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Icon size={28} style={{ color: cfg.color }} aria-hidden="true" />
            {cfg.name} Curriculum
          </h1>
          <p className="page-subtitle">
            {cp.completedLessonIds.length} of {lessons.length} lessons completed ({lessons.length > 0 ? Math.round((cp.completedLessonIds.length / lessons.length) * 100) : 0}%)
          </p>
        </div>

        {/* Progress bar */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <span style={{ fontWeight: 600 }}>Track Progression</span>
            <span style={{ color: cfg.color, fontWeight: 700 }}>
              {lessons.length > 0 ? Math.round((cp.completedLessonIds.length / lessons.length) * 100) : 0}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${lessons.length > 0 ? (cp.completedLessonIds.length / lessons.length) * 100 : 0}%`,
                background: cfg.color,
              }}
            />
          </div>
        </div>

        {/* Modules & Lessons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {groupedByModule.map(({ module, lessons: modLessons }, modIdx) => {
            const completedCount = modLessons.filter(l => completedSet.has(l.id)).length;
            const isModuleComplete = completedCount === modLessons.length && modLessons.length > 0;

            return (
              <section key={module.id} aria-labelledby={`module-heading-${module.id}`}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                      background: isModuleComplete ? cfg.color : 'var(--bg-surface-2)',
                      color: isModuleComplete ? 'white' : 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      {isModuleComplete ? <CheckCircle size={14} aria-label="Completed" /> : modIdx + 1}
                    </div>
                    <div>
                      <h2 id={`module-heading-${module.id}`} style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        {module.name}
                      </h2>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {module.description}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    {completedCount}/{modLessons.length}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {modLessons.map(lesson => {
                    const isCompleted = completedSet.has(lesson.id);
                    const isUnlocked = unlockedSet.has(lesson.id) || isCompleted;
                    const lp = progress.lessonProgress[lesson.id];

                    return (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        isCompleted={isCompleted}
                        isUnlocked={isUnlocked}
                        levelColor={cfg.color}
                        bestWpm={lp?.bestWpm ?? 0}
                        bestAccuracy={lp?.bestAccuracy ?? 0}
                        attempts={lp?.attempts ?? 0}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LessonCard({ lesson, isCompleted, isUnlocked, levelColor, bestWpm, bestAccuracy, attempts }: {
  lesson: Lesson;
  isCompleted: boolean;
  isUnlocked: boolean;
  levelColor: string;
  bestWpm: number;
  bestAccuracy: number;
  attempts: number;
}) {
  const isLocked = !isUnlocked && !isCompleted;

  return (
    <div
      className="card"
      style={{
        opacity: isLocked ? 0.6 : 1,
        border: isCompleted ? `1.5px solid ${levelColor}40` : undefined,
        background: isCompleted ? `${levelColor}05` : undefined,
        transition: 'all var(--transition-base)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
            Difficulty {lesson.difficulty} of 5
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{lesson.title}</h3>
        </div>
        {isCompleted && (
          <CheckCircle size={18} style={{ color: levelColor, flexShrink: 0, marginLeft: '0.5rem' }} aria-label="Completed" />
        )}
        {isLocked && (
          <Lock size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginLeft: '0.5rem' }} aria-label="Locked" />
        )}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5, flex: 1 }}>
        {lesson.description}
      </p>

      {isCompleted && (bestWpm > 0 || bestAccuracy > 0) && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
          <span style={{ color: levelColor, fontWeight: 700 }}>Best: {bestWpm} WPM</span>
          <span style={{ color: 'var(--text-secondary)' }}>{bestAccuracy.toFixed(1)}% acc</span>
          <span style={{ color: 'var(--text-tertiary)' }}>{attempts} {attempts === 1 ? 'attempt' : 'attempts'}</span>
        </div>
      )}

      {!isLocked && (
        <Link
          to={`/courses/${lesson.levelId}/${lesson.id}`}
          className="btn btn-sm"
          style={{
            width: '100%', justifyContent: 'center',
            background: isCompleted ? 'transparent' : levelColor,
            color: isCompleted ? levelColor : 'white',
            border: `1.5px solid ${levelColor}`,
          }}
          aria-label={`${isCompleted ? 'Retry' : 'Start'} lesson: ${lesson.title}`}
        >
          {isCompleted
            ? <><RotateCcw size={13} aria-hidden="true" /> Practice Again</>
            : <><PlayCircle size={13} aria-hidden="true" /> Start Lesson</>
          }
        </Link>
      )}

      {isLocked && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', padding: '0.375rem', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)' }}>
          <Lock size={12} aria-hidden="true" /> Complete previous lesson to unlock
        </div>
      )}
    </div>
  );
}
