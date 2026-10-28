// ============================================================
// TypeMaster — Typing Engine Hook
// ============================================================
// State machine: idle → ready → running → paused → completed | cancelled
// Uses performance.now() for monotonic timing.
// ============================================================

import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { TypingSessionConfig, TypingSessionState, CharState, SessionStatus, TypingResult } from '@/types';
import {
  calcGrossWpm,
  calcNetWpm,
  calcAccuracy,
  countCorrectChars,
  countErrorChars,
  countCharsTyped,
} from '@/lib/metrics';
import { nanoid } from '@/lib/nanoid';

// ---- Action Types ----
type Action =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'CANCEL' }
  | { type: 'KEY_PRESS'; key: string }
  | { type: 'RESET'; config: TypingSessionConfig }
  | { type: 'TIME_EXPIRE' };

// ---- Initial state builder ----
function buildInitialState(config: TypingSessionConfig): TypingSessionState {
  const chars: CharState[] = config.text.split('').map(char => ({
    char,
    status: 'upcoming' as const,
  }));

  return {
    status: 'ready',
    config,
    chars,
    currentIndex: 0,
    startTimeMs: null,
    accumulatedMs: 0,
    pauseStartMs: null,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    errorCount: 0,
    charErrors: {},
  };
}

// ---- Reducer ----
function typingReducer(state: TypingSessionState, action: Action): TypingSessionState {
  switch (action.type) {
    case 'START': {
      if (state.status !== 'ready') return state;
      return {
        ...state,
        status: 'running',
        startTimeMs: performance.now(),
      };
    }

    case 'PAUSE': {
      if (state.status !== 'running') return state;
      return {
        ...state,
        status: 'paused',
        pauseStartMs: performance.now(),
      };
    }

    case 'RESUME': {
      if (state.status !== 'paused' || state.pauseStartMs === null) return state;
      const pausedDuration = performance.now() - state.pauseStartMs;
      return {
        ...state,
        status: 'running',
        // Shift start time forward by the paused duration
        startTimeMs: state.startTimeMs !== null ? state.startTimeMs + pausedDuration : performance.now(),
        pauseStartMs: null,
      };
    }

    case 'CANCEL': {
      return { ...state, status: 'cancelled' };
    }

    case 'TIME_EXPIRE': {
      if (state.status !== 'running') return state;
      return { ...state, status: 'completed' };
    }

    case 'RESET': {
      return buildInitialState(action.config);
    }

    case 'KEY_PRESS': {
      if (state.status !== 'running') return state;

      const { key } = action;
      const { chars, currentIndex } = state;

      // ---- Backspace ----
      if (key === 'Backspace') {
        if (currentIndex === 0) return state;
        const newChars = [...chars];
        const prevIndex = currentIndex - 1;
        const prev = newChars[prevIndex];

        // Mark previously-incorrect char as corrected
        if (prev.status === 'error') {
          newChars[prevIndex] = { ...prev, status: 'corrected', typedChar: undefined };
        } else if (prev.status === 'correct' || prev.status === 'corrected') {
          newChars[prevIndex] = { ...prev, status: 'upcoming', typedChar: undefined };
        }

        return {
          ...state,
          chars: newChars,
          currentIndex: prevIndex,
        };
      }

      // ---- Regular key ----
      if (key.length !== 1) return state; // Ignore modifier keys
      if (currentIndex >= chars.length) return state;

      const expected = chars[currentIndex].char;
      const isCorrect = key === expected;

      const newChars = [...chars];
      newChars[currentIndex] = {
        char: expected,
        status: isCorrect ? 'correct' : 'error',
        typedChar: key,
      };

      const newIndex = currentIndex + 1;
      const newTotalKeystrokes = state.totalKeystrokes + 1;
      const newCorrectKeystrokes = state.correctKeystrokes + (isCorrect ? 1 : 0);

      // Track per-character errors
      let charErrors = state.charErrors;
      if (!isCorrect) {
        charErrors = { ...charErrors, [expected]: (charErrors[expected] ?? 0) + 1 };
      }

      // Check completion (passage mode or all chars done)
      const isComplete = newIndex >= chars.length;
      const newStatus: SessionStatus = isComplete ? 'completed' : 'running';

      return {
        ...state,
        chars: newChars,
        currentIndex: newIndex,
        totalKeystrokes: newTotalKeystrokes,
        correctKeystrokes: newCorrectKeystrokes,
        errorCount: state.errorCount + (isCorrect ? 0 : 1),
        charErrors,
        status: newStatus,
      };
    }

    default:
      return state;
  }
}

// ---- Hook ----
export interface UseTypingEngineReturn {
  state: TypingSessionState;
  elapsedMs: number;
  remainingMs: number | null;
  liveWpm: number;
  liveAccuracy: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  reset: (config?: TypingSessionConfig) => void;
  buildResult: () => TypingResult;
  handleKeyDown: (e: KeyboardEvent | React.KeyboardEvent) => void;
}

export function useTypingEngine(
  config: TypingSessionConfig,
  onComplete?: (result: TypingResult) => void
): UseTypingEngineReturn {
  const [state, dispatch] = useReducer(typingReducer, config, buildInitialState);
  const elapsedMsRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const configRef = useRef(config);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // ---- Elapsed time tracking via requestAnimationFrame ----
  useEffect(() => {
    if (state.status !== 'running') {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const tick = () => {
      if (state.startTimeMs !== null) {
        elapsedMsRef.current = performance.now() - state.startTimeMs + state.accumulatedMs;
        forceUpdate();
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [state.status, state.startTimeMs, state.accumulatedMs]);

  // ---- Timer expiration for timed modes ----
  useEffect(() => {
    if (state.status !== 'running') return;
    if (state.config.mode !== 'timed' || !state.config.duration) return;

    const durationMs = (state.config.duration ?? 60) * 1000;
    const alreadyElapsed = elapsedMsRef.current;
    const remaining = durationMs - alreadyElapsed;
    if (remaining <= 0) {
      dispatch({ type: 'TIME_EXPIRE' });
      return;
    }

    const timer = setTimeout(() => {
      dispatch({ type: 'TIME_EXPIRE' });
    }, remaining);

    return () => clearTimeout(timer);
  }, [state.status, state.config.mode, state.config.duration]);

  // ---- Capture final elapsed time on completion/cancellation ----
  useEffect(() => {
    if ((state.status === 'completed' || state.status === 'cancelled') && state.startTimeMs !== null) {
      elapsedMsRef.current = performance.now() - state.startTimeMs + state.accumulatedMs;
    }
  }, [state.status, state.startTimeMs, state.accumulatedMs]);

  // ---- Call onComplete callback ----
  useEffect(() => {
    if (state.status === 'completed' && !completedRef.current) {
      completedRef.current = true;
      const result = buildResultFromState(state, elapsedMsRef.current);
      onCompleteRef.current?.(result);
    }
    if (state.status === 'ready' || state.status === 'running') {
      completedRef.current = false;
    }
  }, [state]);

  // ---- Keyboard handler ----
  const handleKeyDown = useCallback((e: KeyboardEvent | React.KeyboardEvent) => {
    const key = e.key;

    // Do not handle system shortcuts
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Start on first keypress when ready
    if (state.status === 'ready') {
      dispatch({ type: 'START' });
    }

    if (state.status === 'ready' || state.status === 'running') {
      if (key === 'Tab') {
        e.preventDefault(); // prevent focus loss
        return;
      }
      e.preventDefault();
      dispatch({ type: 'KEY_PRESS', key });
    }
  }, [state.status]);

  // ---- Actions ----
  const start = useCallback(() => dispatch({ type: 'START' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const cancel = useCallback(() => dispatch({ type: 'CANCEL' }), []);
  const reset = useCallback((newConfig?: TypingSessionConfig) => {
    completedRef.current = false;
    dispatch({ type: 'RESET', config: newConfig ?? configRef.current });
  }, []);

  const buildResult = useCallback((): TypingResult => {
    return buildResultFromState(state, elapsedMsRef.current);
  }, [state]);

  // ---- Derived values ----
  const elapsedMs = elapsedMsRef.current;
  const durationMs = state.config.duration ? state.config.duration * 1000 : null;
  const remainingMs = durationMs !== null ? Math.max(0, durationMs - elapsedMs) : null;

  const charsTyped = countCharsTyped(state.chars);
  const liveWpm = elapsedMs > 500 ? calcGrossWpm(charsTyped, elapsedMs) : 0;
  const liveAccuracy = calcAccuracy(state.correctKeystrokes, state.totalKeystrokes);

  return {
    state,
    elapsedMs,
    remainingMs,
    liveWpm,
    liveAccuracy,
    start,
    pause,
    resume,
    cancel,
    reset,
    buildResult,
    handleKeyDown,
  };
}

// ---- Build result from state ----
function buildResultFromState(state: TypingSessionState, elapsedMs: number): TypingResult {
  const correctChars = countCorrectChars(state.chars);
  const errorChars = countErrorChars(state.chars);
  const charsTyped = countCharsTyped(state.chars);

  const grossWpm = calcGrossWpm(charsTyped, elapsedMs);
  const netWpm = calcNetWpm(grossWpm, errorChars, elapsedMs);
  const accuracy = calcAccuracy(state.correctKeystrokes, state.totalKeystrokes);

  return {
    id: nanoid(),
    lessonId: state.config.lessonId,
    mode: state.config.mode,
    duration: state.config.duration,
    elapsedMs: Math.max(0, elapsedMs),
    grossWpm,
    netWpm,
    accuracy,
    correctChars,
    errorChars,
    totalKeystrokes: state.totalKeystrokes,
    charErrors: state.charErrors,
    completedAt: Date.now(),
    textLength: state.config.text.length,
    charsTyped,
    levelId: undefined,
  };
}
