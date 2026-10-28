// ============================================================
// TypeMaster — Typing Interface Component
// ============================================================
// Reusable typing UI used by both lessons and tests.
// ============================================================

import { useEffect, useRef, useCallback, memo } from 'react';
import { Pause, Play, RotateCcw, X, Clock } from 'lucide-react';
import type { TypingSessionConfig } from '@/types';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { VirtualKeyboard } from './VirtualKeyboard';
import { formatDuration } from '@/lib/metrics';
import type { TypingResult } from '@/types';

interface TypingInterfaceProps {
  config: TypingSessionConfig;
  showKeyboard?: boolean;
  showFingerGuide?: boolean;
  focusKeys?: string[];
  onComplete?: (result: TypingResult) => void;
  onCancel?: () => void;
  onRestart?: () => void;
  targetAccuracy?: number;
  targetWpm?: number;
}

// Memoized character display
const CharDisplay = memo(({ char, status, isCursor }: {
  char: string;
  status: string;
  isCursor: boolean;
}) => {
  const displayChar = char === ' ' ? '\u00A0' : char;
  return (
    <span
      className={[
        'char',
        `char-${status}`,
        isCursor ? 'char-cursor' : '',
      ].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      {displayChar}
    </span>
  );
});
CharDisplay.displayName = 'CharDisplay';

export function TypingInterface({
  config,
  showKeyboard = true,
  showFingerGuide = true,
  focusKeys,
  onComplete,
  onCancel,
  onRestart,
  targetAccuracy: _targetAccuracy,
  targetWpm: _targetWpm,
}: TypingInterfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  const {
    state,
    elapsedMs,
    remainingMs,
    liveWpm,
    liveAccuracy,
    pause,
    resume,
    cancel,
    reset,
    handleKeyDown,
  } = useTypingEngine(config, onComplete);

  // Focus management
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // Global key listener
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const listener = (e: KeyboardEvent) => {
      if (state.status === 'completed' || state.status === 'cancelled') return;
      handleKeyDown(e);
    };

    el.addEventListener('keydown', listener);
    return () => el.removeEventListener('keydown', listener);
  }, [handleKeyDown, state.status]);

  const handleRestart = useCallback(() => {
    reset(config);
    onRestart?.();
    focusInput();
  }, [config, reset, onRestart, focusInput]);

  const handleCancel = useCallback(() => {
    cancel();
    onCancel?.();
  }, [cancel, onCancel]);

  // Current key for virtual keyboard
  const currentChar = state.chars[state.currentIndex]?.char ?? '';

  // Progress percentage
  const progressPct = state.chars.length > 0
    ? Math.round((state.currentIndex / state.chars.length) * 100)
    : 0;

  const isTimedMode = config.mode === 'timed';
  const timeDisplay = isTimedMode && remainingMs !== null
    ? formatDuration(remainingMs)
    : formatDuration(elapsedMs);

  return (
    <div className="typing-interface" ref={containerRef}>
      {/* Live stats bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '1rem',
      }}>
        <StatBox label="WPM" value={liveWpm} color="var(--clr-primary-500)" />
        <StatBox label="Accuracy" value={`${liveAccuracy.toFixed(1)}%`} color="var(--clr-success-500)" />
        <StatBox
          label={isTimedMode ? 'Remaining' : 'Elapsed'}
          value={timeDisplay}
          color="var(--clr-warning-500)"
        />
        <StatBox label="Errors" value={state.errorCount} color="var(--clr-error-500)" />
      </div>

      {/* Progress bar */}
      {!isTimedMode && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            <span>Progress</span>
            <span>{progressPct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {/* Typing area */}
      <div
        ref={inputRef}
        className="typing-area"
        tabIndex={0}
        role="textbox"
        aria-label="Typing area — start typing to begin"
        aria-multiline="false"
        aria-readonly={state.status === 'completed' || state.status === 'cancelled'}
        onClick={focusInput}
        style={{ outline: 'none', cursor: 'text', minHeight: '8rem' }}
      >
        {state.status === 'ready' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.03)',
            borderRadius: 'var(--radius-lg)',
            zIndex: 1,
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            gap: '0.5rem',
          }}>
            <Clock size={16} aria-hidden="true" />
            Start typing to begin…
          </div>
        )}

        {state.status === 'paused' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 'var(--radius-lg)',
            zIndex: 1,
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'white',
            gap: '0.5rem',
          }}>
            <Pause size={20} aria-hidden="true" />
            Paused
          </div>
        )}

        <div className="typing-text" aria-live="off">
          {state.chars.map((charState, i) => (
            <CharDisplay
              key={i}
              char={charState.char}
              status={charState.status}
              isCursor={i === state.currentIndex && state.status !== 'completed'}
            />
          ))}
        </div>

        {/* Screen reader progress */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {state.status === 'completed' ? 'Typing complete!' : ''}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        {state.status === 'running' && (
          <button className="btn btn-secondary btn-sm" onClick={pause} aria-label="Pause">
            <Pause size={15} aria-hidden="true" /> Pause
          </button>
        )}
        {state.status === 'paused' && (
          <button className="btn btn-primary btn-sm" onClick={resume} aria-label="Resume">
            <Play size={15} aria-hidden="true" /> Resume
          </button>
        )}
        <button className="btn btn-secondary btn-sm" onClick={handleRestart} aria-label="Restart">
          <RotateCcw size={15} aria-hidden="true" /> Restart
        </button>
        {onCancel && state.status !== 'completed' && (
          <button className="btn btn-ghost btn-sm" onClick={handleCancel} aria-label="Exit">
            <X size={15} aria-hidden="true" /> Exit
          </button>
        )}

        {/* Touch device hint */}
        <div
          className="touch-hint"
          style={{ display: 'none', fontSize: '0.8rem', color: 'var(--text-secondary)', alignItems: 'center', gap: '0.5rem' }}
          aria-live="polite"
        >
          ⌨️ Physical keyboard recommended for best experience
        </div>
      </div>

      {/* Virtual keyboard */}
      {showKeyboard && state.status !== 'completed' && (
        <div style={{ marginTop: '1.5rem', overflow: 'auto' }}>
          <VirtualKeyboard
            activeKey={state.status === 'running' || state.status === 'paused' ? currentChar : undefined}
            focusKeys={focusKeys}
            showFingerGuide={showFingerGuide}
          />
        </div>
      )}

      <style>{`
        .typing-interface { position: relative; }
        @media (max-width: 600px) {
          .touch-hint { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="card" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  );
}
