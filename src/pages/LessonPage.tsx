// ============================================================
// TypeMaster — Lesson Page (Individual lesson with typing interface)
// ============================================================
import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CheckCircle,
  RotateCcw, Target, Info, BookOpen, X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getLessonById, getNextLesson, getPrevLesson, CERTIFICATE_REQUIREMENTS } from '@/data/courseData';
import { TypingInterface } from '@/components/TypingInterface';
import type { TypingResult, TypingSessionConfig } from '@/types';
import { formatWpm } from '@/lib/metrics';

type Phase = 'intro' | 'typing' | 'result';

export function LessonPage() {
  const { levelId, lessonId } = useParams<{ levelId: string; lessonId: string }>();
  const { progress, completeLessonAndAdvance, showToast } = useApp();

  const lesson = getLessonById(lessonId ?? '');
  const nextLesson = lessonId ? getNextLesson(lessonId) : undefined;
  const prevLesson = lessonId ? getPrevLesson(lessonId) : undefined;

  const [phase, setPhase] = useState<Phase>('intro');
  const [result, setResult] = useState<TypingResult | null>(null);
  const [showHints, setShowHints] = useState(false);

  const handleRestart = useCallback(() => {
    setResult(null);
    setPhase('intro');
  }, []);

  const handleComplete = useCallback(async (typingResult: TypingResult) => {
    if (!lesson) return;
    const fullResult: TypingResult = { ...typingResult, levelId: lesson.levelId, lessonId: lesson.id };

    const passed = fullResult.accuracy >= lesson.minAccuracy
      && (lesson.minWpm === 0 || fullResult.netWpm >= lesson.minWpm);

    setResult(fullResult);
    setPhase('result');

    if (passed) {
      const { newAchievements } = await completeLessonAndAdvance(lesson.id, fullResult);

      if (newAchievements.length > 0) {
        setTimeout(() => {
          showToast({
            type: 'success',
            title: `Achievement Unlocked: ${newAchievements[0].title}`,
            message: newAchievements[0].description,
            duration: 5000,
          });
        }, 500);
      }

      // Check certificate eligibility
      const certReq = CERTIFICATE_REQUIREMENTS[lesson.levelId];
      if (certReq) {
        const allRequired = certReq.lessonsRequired.every(id =>
          id === lesson.id || progress.courseProgress[lesson.levelId].completedLessonIds.includes(id)
        );
        if (allRequired && fullResult.accuracy >= certReq.minAccuracy && fullResult.netWpm >= certReq.minWpm) {
          setTimeout(() => {
            showToast({
              type: 'success',
              title: 'Certificate Available',
              message: `You've completed the ${lesson.levelId} track. You can claim your certificate!`,
              duration: 6000,
            });
          }, 1000);
        }
      }
    }
  }, [lesson, completeLessonAndAdvance, showToast, progress]);

  if (!lesson) {
    return (
      <div className="page">
        <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <h1>Lesson Not Found</h1>
          <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const lp = progress.lessonProgress[lesson.id];
  const isCompleted = lp?.completedAt !== null && lp?.completedAt !== undefined;
  const bestWpm = lp?.bestWpm ?? 0;

  const config: TypingSessionConfig = {
    mode: 'passage',
    text: lesson.text,
    lessonId: lesson.id,
    allowBackspace: true,
  };

  // ---- Intro Phase ----
  if (phase === 'intro') {
    return (
      <div className="page">
        <div className="container container-sm" style={{ padding: '2rem 1.5rem' }}>
          {/* Breadcrumb nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Link to="/courses" style={{ color: 'var(--text-secondary)' }}>Courses</Link>
            <span>/</span>
            <Link to={`/courses/${lesson.levelId}`} style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
              {lesson.levelId}
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{lesson.title}</span>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className={`badge level-${lesson.levelId}`} style={{ textTransform: 'uppercase' }}>
                    {lesson.levelId}
                  </span>
                  <span className="badge badge-neutral">
                    Difficulty {lesson.difficulty} of 5
                  </span>
                  {isCompleted && (
                    <span className="badge badge-success">
                      <CheckCircle size={11} style={{ marginRight: '0.25rem' }} />
                      Completed
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{lesson.title}</h1>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {lesson.description}
            </p>

            {/* Target criteria */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '1rem', padding: '1rem', background: 'var(--bg-surface-2)',
              borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem',
            }}>
              <RequirementItem label="Min Accuracy" value={`${lesson.minAccuracy}%`} icon={<Target size={14} />} />
              <RequirementItem label="Target Speed" value={lesson.minWpm > 0 ? `${lesson.minWpm} WPM` : 'Any speed'} icon={<Target size={14} />} />
              <RequirementItem label="XP Reward" value={`+${lesson.xpReward} XP`} icon={<Target size={14} />} />
              {bestWpm > 0 && (
                <RequirementItem label="Personal Best" value={`${bestWpm} WPM`} icon={<CheckCircle size={14} />} />
              )}
            </div>

            {/* Focus keys */}
            {lesson.focusKeys && lesson.focusKeys.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Focus Keys
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {lesson.focusKeys.map(k => (
                    <kbd key={k} className="kbd" style={{ minWidth: '2rem', height: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            )}

            {/* Objectives */}
            {lesson.objectives && lesson.objectives.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Learning Objectives
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: 0, listStyle: 'none' }}>
                  {lesson.objectives.map(obj => (
                    <li key={obj} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <CheckCircle size={14} style={{ color: 'var(--clr-primary-500)', flexShrink: 0 }} aria-hidden="true" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions */}
            {lesson.instructions && (
              <div style={{ padding: '0.875rem 1rem', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                <Info size={16} style={{ color: 'var(--clr-primary-500)', flexShrink: 0, marginTop: '0.1rem' }} aria-hidden="true" />
                <span>{lesson.instructions}</span>
              </div>
            )}

            {/* Hints toggle */}
            {lesson.hints && lesson.hints.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowHints(!showHints)}
                  aria-expanded={showHints}
                  style={{ color: 'var(--clr-primary-500)' }}
                >
                  <Info size={14} aria-hidden="true" />
                  {showHints ? 'Hide Helpful Tips' : 'Show Helpful Tips'}
                </button>
                {showHints && (
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {lesson.hints.map((hint, i) => (
                      <li key={i}>{hint}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Start Button */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setPhase('typing')}
              >
                {isCompleted ? 'Practice Again' : 'Start Lesson'}
              </button>
              {prevLesson && (
                <Link to={`/courses/${prevLesson.levelId}/${prevLesson.id}`} className="btn btn-secondary btn-lg" aria-label="Previous lesson">
                  <ChevronLeft size={16} aria-hidden="true" />
                </Link>
              )}
              {nextLesson && (
                <Link to={`/courses/${nextLesson.levelId}/${nextLesson.id}`} className="btn btn-secondary btn-lg" aria-label="Next lesson">
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Typing Phase ----
  if (phase === 'typing') {
    return (
      <div className="page" style={{ padding: '2rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <span className={`badge level-${lesson.levelId}`} style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                {lesson.levelId}
              </span>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{lesson.title}</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={handleRestart}>
                <RotateCcw size={14} aria-hidden="true" /> Restart
              </button>
              <Link to={`/courses/${lesson.levelId}`} className="btn btn-ghost btn-sm">
                Exit
              </Link>
            </div>
          </div>

          <TypingInterface
            config={config}
            focusKeys={lesson.focusKeys}
            onComplete={handleComplete}
            targetAccuracy={lesson.minAccuracy}
            targetWpm={lesson.minWpm}
          />
        </div>
      </div>
    );
  }

  // ---- Result Phase ----
  if (phase === 'result' && result) {
    const passed = result.accuracy >= lesson.minAccuracy && (lesson.minWpm === 0 || result.netWpm >= lesson.minWpm);

    return (
      <div className="page">
        <div className="container container-sm" style={{ padding: '2rem 1.5rem' }}>
          {/* Result card */}
          <div className="card" style={{
            textAlign: 'center',
            background: 'var(--bg-surface)',
            border: `1.5px solid ${passed ? 'var(--clr-success-500)' : 'var(--border-default)'}`,
            padding: '2.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              width: '4rem', height: '4rem', borderRadius: '50%',
              background: passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `2px solid ${passed ? 'var(--clr-success-500)' : 'var(--clr-error-500)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              {passed
                ? <CheckCircle size={32} style={{ color: 'var(--clr-success-500)' }} aria-hidden="true" />
                : <RotateCcw size={28} style={{ color: 'var(--clr-error-500)' }} aria-hidden="true" />
              }
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              {passed ? 'Lesson Completed' : 'Requirements Not Met'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              {passed
                ? 'Great job! You met the criteria and advanced your curriculum progress.'
                : `You need at least ${lesson.minAccuracy}% accuracy${lesson.minWpm > 0 ? ` and ${lesson.minWpm} WPM` : ''} to pass this lesson.`
              }
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <ResultMetric label="Net WPM" value={formatWpm(result.netWpm)} color="var(--clr-primary-500)" />
              <ResultMetric label="Accuracy" value={`${result.accuracy.toFixed(1)}%`} color={result.accuracy >= lesson.minAccuracy ? 'var(--clr-success-500)' : 'var(--clr-error-500)'} />
              <ResultMetric label="Correct" value={result.correctChars} color="var(--clr-success-500)" />
              <ResultMetric label="Errors" value={result.errorChars} color={result.errorChars === 0 ? 'var(--clr-success-500)' : 'var(--clr-error-500)'} />
            </div>

            {/* Requirements check */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <RequirementCheck
                label={`Accuracy ≥ ${lesson.minAccuracy}%`}
                met={result.accuracy >= lesson.minAccuracy}
                value={`${result.accuracy.toFixed(1)}%`}
              />
              {lesson.minWpm > 0 && (
                <RequirementCheck
                  label={`WPM ≥ ${lesson.minWpm}`}
                  met={result.netWpm >= lesson.minWpm}
                  value={`${result.netWpm} WPM`}
                />
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={handleRestart}>
                <RotateCcw size={15} aria-hidden="true" /> Try Again
              </button>
              {passed && nextLesson && (
                <Link to={`/courses/${nextLesson.levelId}/${nextLesson.id}`} className="btn btn-primary">
                  Next Lesson <ChevronRight size={15} aria-hidden="true" />
                </Link>
              )}
              {passed && !nextLesson && (
                <Link to="/certificates" className="btn btn-primary">
                  <BookOpen size={15} aria-hidden="true" /> View Track Certificate
                </Link>
              )}
              <Link to={`/courses/${levelId}`} className="btn btn-ghost">
                <ChevronLeft size={15} aria-hidden="true" /> Track Overview
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function RequirementItem({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
      <span style={{ color: 'var(--text-secondary)' }}>{label}:</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function ResultMetric({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

function RequirementCheck({ label, met, value }: { label: string; met: boolean; value: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-full)',
      background: met ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${met ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
      fontSize: '0.8rem',
    }}>
      {met
        ? <CheckCircle size={14} style={{ color: 'var(--clr-success-500)' }} aria-hidden="true" />
        : <X size={14} style={{ color: 'var(--clr-error-500)' }} aria-hidden="true" />
      }
      <span style={{ color: met ? 'var(--clr-success-600)' : 'var(--clr-error-600)', fontWeight: 600 }}>
        {label}: {value}
      </span>
    </div>
  );
}
