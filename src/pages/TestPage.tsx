// ============================================================
// TypeMaster — Typing Test Page
// ============================================================
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Timer, Keyboard, Infinity as InfinityIcon, Play, BarChart3, RotateCcw, ChevronRight, Sparkles, Target } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TypingInterface } from '@/components/TypingInterface';
import type { TypingResult, TimedDuration, TestMode, TypingSessionConfig } from '@/types';
import { getPassageForTest, FREE_PRACTICE_TEXT } from '@/data/passages';
import { formatDuration, formatWpm } from '@/lib/metrics';
import { nanoid } from '@/lib/nanoid';

type Phase = 'setup' | 'typing' | 'result';

const DURATIONS: { value: TimedDuration; label: string }[] = [
  { value: 15, label: '15 sec' },
  { value: 30, label: '30 sec' },
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
];

const DIFFICULTIES = [
  { value: 1 as const, label: 'Easy', description: 'Common words and simple sentences' },
  { value: 2 as const, label: 'Medium', description: 'Varied vocabulary and punctuation' },
  { value: 3 as const, label: 'Hard', description: 'Complex passages and technical text' },
];

export function TestPage() {
  const { progress, recordResult, showToast } = useApp();
  const [phase, setPhase] = useState<Phase>('setup');
  const [mode, setMode] = useState<TestMode>('timed');
  const [duration, setDuration] = useState<TimedDuration>(60);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [sessionKey, setSessionKey] = useState(() => nanoid(6));

  const getConfig = useCallback((): TypingSessionConfig => {
    if (mode === 'free') {
      return { mode: 'free', text: FREE_PRACTICE_TEXT + ' ' + FREE_PRACTICE_TEXT };
    }
    if (mode === 'passage') {
      return { mode: 'passage', text: getPassageForTest(999, difficulty) };
    }
    return {
      mode: 'timed',
      duration,
      text: getPassageForTest(duration, difficulty),
      difficulty,
    };
  }, [mode, duration, difficulty]);

  const handleComplete = useCallback(async (typingResult: TypingResult) => {
    setResult(typingResult);
    setPhase('result');

    await recordResult(typingResult);

    // Check personal best
    const prevBest = progress.results.length > 0
      ? Math.max(...progress.results.map(r => r.netWpm))
      : 0;
    if (typingResult.netWpm > prevBest && prevBest > 0) {
      setTimeout(() => {
        showToast({
          type: 'success',
          title: 'New Personal Best!',
          message: `${typingResult.netWpm} WPM — that's a new personal record!`,
          duration: 5000,
        });
      }, 300);
    }
  }, [recordResult, progress.results, showToast]);

  const handleRetry = useCallback(() => {
    setResult(null);
    setSessionKey(nanoid(6));
    setPhase('typing');
  }, []);

  const config = getConfig();

  // ---- Setup Phase ----
  if (phase === 'setup') {
    return (
      <div className="page">
        <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
          <div className="page-header">
            <h1 className="page-title">
              <Keyboard size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--clr-primary-500)' }} aria-hidden="true" />
              Typing Test
            </h1>
            <p className="page-subtitle">Choose your test mode and start typing. All results are saved to your history.</p>
          </div>

          {/* Mode selection */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Test Mode
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <ModeCard
                id="timed"
                icon={<Timer size={22} />}
                label="Timed Test"
                description="Type as much as you can within the time limit."
                selected={mode === 'timed'}
                onClick={() => setMode('timed')}
              />
              <ModeCard
                id="passage"
                icon={<Keyboard size={22} />}
                label="Passage"
                description="Type the entire passage as fast and accurately as you can."
                selected={mode === 'passage'}
                onClick={() => setMode('passage')}
              />
              <ModeCard
                id="free"
                icon={<InfinityIcon size={22} />}
                label="Free Practice"
                description="No timer, no pressure. Just practice at your own pace."
                selected={mode === 'free'}
                onClick={() => setMode('free')}
              />
            </div>
          </div>

          {/* Duration (timed only) */}
          {mode === 'timed' && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Duration
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {DURATIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setDuration(value)}
                    className="btn"
                    aria-pressed={duration === value}
                    style={{
                      background: duration === value ? 'var(--clr-primary-500)' : 'var(--bg-surface-2)',
                      color: duration === value ? 'white' : 'var(--text-primary)',
                      border: duration === value ? '1.5px solid var(--clr-primary-500)' : '1.5px solid var(--border-default)',
                      minWidth: '80px',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty */}
          {mode !== 'free' && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Difficulty
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {DIFFICULTIES.map(({ value, label, description }) => (
                  <button
                    key={value}
                    onClick={() => setDifficulty(value)}
                    aria-pressed={difficulty === value}
                    style={{
                      padding: '0.875rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${difficulty === value ? 'var(--clr-primary-500)' : 'var(--border-default)'}`,
                      background: difficulty === value ? 'rgba(99,102,241,0.08)' : 'var(--bg-surface-2)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: difficulty === value ? 'var(--clr-primary-500)' : 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
          <button
            className="btn btn-primary btn-xl"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setPhase('typing')}
          >
            <Play size={18} aria-hidden="true" />
            {mode === 'timed' ? `Start ${duration}-Second Test` : mode === 'passage' ? 'Start Passage Test' : 'Start Free Practice'}
          </button>

          {/* Personal bests */}
          {progress.results.length > 0 && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <h2 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                Your Personal Bests
              </h2>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <PBStat label="Best WPM" value={Math.max(...progress.results.map(r => r.netWpm))} />
                <PBStat label="Best Accuracy" value={`${Math.max(...progress.results.map(r => r.accuracy)).toFixed(1)}%`} />
                <PBStat label="Tests Completed" value={progress.results.length} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- Typing Phase ----
  if (phase === 'typing') {
    return (
      <div className="page">
        <div className="container" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700 }}>
              {mode === 'timed' ? `${duration}-Second Test` : mode === 'passage' ? 'Passage Test' : 'Free Practice'}
              {mode !== 'free' && ` · ${DIFFICULTIES[difficulty - 1].label}`}
            </h1>
            <button className="btn btn-ghost btn-sm" onClick={() => { setPhase('setup'); setResult(null); }}>
              ← Back to Setup
            </button>
          </div>

          <TypingInterface
            key={sessionKey}
            config={config}
            showKeyboard={true}
            showFingerGuide={false}
            onComplete={handleComplete}
            onCancel={() => { setPhase('setup'); setResult(null); }}
          />
        </div>
      </div>
    );
  }

  // ---- Result Phase ----
  if (phase === 'result' && result) {
    const prevBest = progress.results.length > 1
      ? Math.max(...progress.results.slice(1).map(r => r.netWpm))
      : 0;
    const isNewBest = result.netWpm > prevBest && prevBest > 0;

    return (
      <div className="page">
        <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
          <div className="card" style={{
            textAlign: 'center', padding: '2.5rem',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(217,70,239,0.04))',
            border: '1.5px solid rgba(99,102,241,0.15)',
            marginBottom: '1.5rem',
          }}>
            {isNewBest && (
              <div style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.375rem 1rem', background: 'var(--clr-primary-500)', color: 'white', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.85rem' }}>
                <Sparkles size={15} aria-hidden="true" />
                New Personal Best!
              </div>
            )}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {mode === 'free' ? 'Practice Complete' : 'Test Complete'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {mode === 'timed' ? `${duration}-second timed test` : mode === 'passage' ? 'Passage completion test' : 'Free practice session'}
              {mode !== 'free' && ` · ${DIFFICULTIES[difficulty - 1].label}`}
            </p>

            {/* Main metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <BigMetric label="Net WPM" value={formatWpm(result.netWpm)} sub={`Gross: ${result.grossWpm}`} color="var(--clr-primary-500)" />
              <BigMetric label="Accuracy" value={`${result.accuracy.toFixed(1)}%`} color={result.accuracy >= 95 ? 'var(--clr-success-500)' : result.accuracy >= 85 ? 'var(--clr-warning-500)' : 'var(--clr-error-500)'} />
              <BigMetric label="Correct" value={result.correctChars} color="var(--clr-success-500)" />
              <BigMetric label="Errors" value={result.errorChars} color={result.errorChars === 0 ? 'var(--clr-success-500)' : 'var(--clr-error-500)'} />
              <BigMetric label="Duration" value={formatDuration(result.elapsedMs)} color="var(--clr-warning-500)" />
              <BigMetric label="Keystrokes" value={result.totalKeystrokes} color="var(--clr-primary-400)" />
            </div>

            {/* Comparison to previous best */}
            {prevBest > 0 && (
              <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'inline-block' }}>
                {isNewBest
                  ? `Previous best was ${prevBest} WPM — you improved by ${result.netWpm - prevBest} WPM.`
                  : `Your previous record is ${prevBest} WPM (${prevBest - result.netWpm} WPM faster than this session).`
                }
              </div>
            )}

            {/* Metric explanations */}
            <details style={{ textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                How are metrics calculated?
              </summary>
              <div style={{ padding: '0.75rem', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', lineHeight: 1.6 }}>
                <p><strong>Gross WPM:</strong> (characters typed ÷ 5) ÷ elapsed minutes. All typed characters count regardless of accuracy.</p>
                <p style={{ marginTop: '0.5rem' }}><strong>Net WPM:</strong> Gross WPM minus (errors ÷ elapsed minutes). Penalizes uncorrected errors.</p>
                <p style={{ marginTop: '0.5rem' }}><strong>Accuracy:</strong> Correct keystrokes ÷ total keystrokes × 100. Corrected mistakes still count against total keystrokes.</p>
              </div>
            </details>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handleRetry}>
                <RotateCcw size={15} aria-hidden="true" /> Try Again
              </button>
              <button className="btn btn-secondary" onClick={() => { setPhase('setup'); setResult(null); }}>
                Change Settings
              </button>
              <Link to="/reports" className="btn btn-ghost">
                <BarChart3 size={15} aria-hidden="true" /> View Analytics
              </Link>
            </div>
          </div>

          {/* Recommendations */}
          {result.accuracy < 90 && (
            <div className="card" style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--clr-warning-500)' }}>
                <Target size={15} aria-hidden="true" /> Practice Recommendation
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Your accuracy was below 90%. We recommend slowing down to focus on precision and finger technique. Check out the Beginner home row lessons to reinforce consistency.
              </p>
              <Link to="/courses" className="btn btn-sm btn-secondary" style={{ marginTop: '0.75rem' }}>
                View Lessons <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function ModeCard({ id, icon, label, description, selected, onClick }: {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={`mode-${id}`}
      onClick={onClick}
      aria-pressed={selected}
      style={{
        padding: '1.25rem 1rem',
        borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${selected ? 'var(--clr-primary-500)' : 'var(--border-default)'}`,
        background: selected ? 'rgba(99,102,241,0.08)' : 'var(--bg-surface-2)',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all var(--transition-fast)',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <span style={{ color: selected ? 'var(--clr-primary-500)' : 'var(--text-secondary)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: selected ? 'var(--clr-primary-500)' : 'var(--text-primary)' }}>{label}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{description}</span>
    </button>
  );
}

function BigMetric({ label, value, sub, color }: { label: string; value: string | number; sub?: string | number; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{sub}</div>}
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

function PBStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, color: 'var(--clr-primary-500)' }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}
