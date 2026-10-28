// ============================================================
// TypeMaster — Virtual Keyboard Component
// ============================================================
import { useMemo } from 'react';

interface VirtualKeyboardProps {
  activeKey?: string;
  focusKeys?: string[];
  showFingerGuide?: boolean;
}

// QWERTY layout
const ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Space'],
];

const KEY_WIDTHS: Record<string, string> = {
  Backspace: '3.5rem',
  Tab: '2.5rem',
  CapsLock: '2.875rem',
  Enter: '3rem',
  Shift: '4.25rem',
  Space: '12rem',
  '\\': '2rem',
};

// Finger color assignments
const FINGER_MAP: Record<string, string> = {
  '`': 'left-pinky', '1': 'left-pinky', 'q': 'left-pinky', 'a': 'left-pinky', 'z': 'left-pinky',
  '2': 'left-ring', 'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring',
  '3': 'left-middle', 'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle',
  '4': 'left-index', '5': 'left-index', 'r': 'left-index', 't': 'left-index',
  'f': 'left-index', 'g': 'left-index', 'v': 'left-index', 'b': 'left-index',
  '6': 'right-index', '7': 'right-index', 'y': 'right-index', 'u': 'right-index',
  'h': 'right-index', 'j': 'right-index', 'n': 'right-index', 'm': 'right-index',
  '8': 'right-middle', 'i': 'right-middle', 'k': 'right-middle', ',': 'right-middle',
  '9': 'right-ring', 'o': 'right-ring', 'l': 'right-ring', '.': 'right-ring',
  '0': 'right-pinky', '-': 'right-pinky', '=': 'right-pinky',
  'p': 'right-pinky', '[': 'right-pinky', ']': 'right-pinky', '\\': 'right-pinky',
  ';': 'right-pinky', '\'': 'right-pinky', '/': 'right-pinky',
};

export function VirtualKeyboard({ activeKey, focusKeys, showFingerGuide = true }: VirtualKeyboardProps) {
  const focusSet = useMemo(() => new Set(focusKeys?.map(k => k.toLowerCase()) ?? []), [focusKeys]);

  return (
    <div className="virtual-keyboard" aria-hidden="true" role="presentation">
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="key-row">
          {row.map((key, keyIdx) => {
            const lKey = key.toLowerCase();
            const isActive = activeKey?.toLowerCase() === lKey;
            const isFocus = focusSet.size > 0 && focusSet.has(lKey);
            const finger = FINGER_MAP[lKey];
            const fingerClass = showFingerGuide && finger ? `key-finger-${finger}` : '';

            return (
              <div
                key={`${rowIdx}-${keyIdx}`}
                className={[
                  'key',
                  isActive ? 'key-active' : '',
                  fingerClass,
                  isFocus ? 'key-focus' : '',
                ].filter(Boolean).join(' ')}
                style={{
                  minWidth: KEY_WIDTHS[key] ?? '2.5rem',
                  background: isFocus && !isActive ? 'rgba(99,102,241,0.1)' : undefined,
                  borderColor: isFocus && !isActive ? 'var(--clr-primary-400)' : undefined,
                  fontWeight: isFocus ? 700 : undefined,
                }}
                title={key}
              >
                {key === 'Space' ? '' : key === 'Backspace' ? '⌫' : key === 'CapsLock' ? 'Caps' : key}
              </div>
            );
          })}
        </div>
      ))}

      {showFingerGuide && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.7rem' }}>
          {[
            { label: 'L. Pinky', cls: 'key-finger-left-pinky', color: '#f43f5e' },
            { label: 'L. Ring', cls: 'key-finger-left-ring', color: '#f97316' },
            { label: 'L. Middle', cls: 'key-finger-left-middle', color: '#eab308' },
            { label: 'L. Index', cls: 'key-finger-left-index', color: '#22c55e' },
            { label: 'R. Index', cls: 'key-finger-right-index', color: '#06b6d4' },
            { label: 'R. Middle', cls: 'key-finger-right-middle', color: '#6366f1' },
            { label: 'R. Ring', cls: 'key-finger-right-ring', color: '#8b5cf6' },
            { label: 'R. Pinky', cls: 'key-finger-right-pinky', color: '#ec4899' },
          ].map(f => (
            <span key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, display: 'inline-block' }} />
              {f.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
