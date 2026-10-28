// ============================================================
// TypeMaster — Settings & Data Management Page
// ============================================================
import { useState, useRef } from 'react';
import {
  Settings, Moon, Sun, Monitor, Keyboard,
  Download, Upload, Trash2, AlertTriangle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { exportAllData, importAllData, resetAllProgress } from '@/lib/storage';
import type { TimedDuration } from '@/types';

export function SettingsPage() {
  const { settings, updateSettings, progress, reloadProgress, showToast } = useApp();
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export handler
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const json = await exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `typemaster-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast({
        type: 'success',
        title: 'Export Complete',
        message: 'Your progress and settings were saved as JSON.',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: err instanceof Error ? err.message : 'Unknown error during export',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Import handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const result = await importAllData(text);
      if (result.success) {
        await reloadProgress();
        showToast({
          type: 'success',
          title: 'Import Successful',
          message: 'All typing history, achievements, and settings restored.',
        });
      } else {
        showToast({
          type: 'error',
          title: 'Import Failed',
          message: result.error || 'Failed to parse JSON backup file.',
        });
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Import Error',
        message: err instanceof Error ? err.message : 'Invalid backup file',
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Reset progress handler
  const handleResetProgress = async () => {
    await resetAllProgress();
    await reloadProgress();
    setResetConfirmOpen(false);
    showToast({
      type: 'info',
      title: 'Progress Reset',
      message: 'All typing history and achievements have been reset.',
    });
  };

  return (
    <div className="page">
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            <Settings size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--clr-primary-500)' }} aria-hidden="true" />
            Preferences & Settings
          </h1>
          <p className="page-subtitle">
            Configure typing tutor behaviors, visual appearance, and manage local data backups.
          </p>
        </div>

        {/* Section 1: Appearance */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sun size={18} style={{ color: 'var(--clr-primary-500)' }} aria-hidden="true" /> Appearance & Theme
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Theme selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Interface Theme
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {(['light', 'dark', 'system'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`btn ${settings.theme === t ? 'btn-primary' : 'btn-ghost'}`}
                    style={{
                      justifyContent: 'center',
                      textTransform: 'capitalize',
                      border: settings.theme === t ? undefined : '1px solid var(--border-default)',
                    }}
                    onClick={() => updateSettings({ theme: t })}
                    aria-pressed={settings.theme === t}
                  >
                    {t === 'light' && <Sun size={15} style={{ marginRight: '0.25rem' }} />}
                    {t === 'dark' && <Moon size={15} style={{ marginRight: '0.25rem' }} />}
                    {t === 'system' && <Monitor size={15} style={{ marginRight: '0.25rem' }} />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Practice Text Size
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {(['sm', 'md', 'lg'] as const).map(size => (
                  <button
                    key={size}
                    type="button"
                    className={`btn ${settings.fontSize === size ? 'btn-primary' : 'btn-ghost'}`}
                    style={{
                      justifyContent: 'center',
                      border: settings.fontSize === size ? undefined : '1px solid var(--border-default)',
                    }}
                    onClick={() => updateSettings({ fontSize: size })}
                    aria-pressed={settings.fontSize === size}
                  >
                    {size === 'sm' && 'Small'}
                    {size === 'md' && 'Medium (Default)'}
                    {size === 'lg' && 'Large'}
                  </button>
                ))}
              </div>
            </div>

            {/* Caret Style */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Caret Indicator Style
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {(['line', 'block', 'underline'] as const).map(caret => (
                  <button
                    key={caret}
                    type="button"
                    className={`btn ${settings.caretStyle === caret ? 'btn-primary' : 'btn-ghost'}`}
                    style={{
                      justifyContent: 'center',
                      textTransform: 'capitalize',
                      border: settings.caretStyle === caret ? undefined : '1px solid var(--border-default)',
                    }}
                    onClick={() => updateSettings({ caretStyle: caret })}
                    aria-pressed={settings.caretStyle === caret}
                  >
                    {caret}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Typing Tutor Options */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Keyboard size={18} style={{ color: 'var(--clr-primary-500)' }} aria-hidden="true" /> Practice & Engine Options
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Virtual Keyboard Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Display Virtual Keyboard</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Show dynamic on-screen QWERTY layout with active key highlighting</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showVirtualKeyboard}
                onChange={e => updateSettings({ showVirtualKeyboard: e.target.checked })}
                aria-label="Toggle virtual keyboard"
                style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
            </div>

            <div className="divider" />

            {/* Finger Guide Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Finger Placement Guide</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Highlight which finger (e.g., Left Index, Right Pinky) presses each incoming key</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showFingerGuide}
                onChange={e => updateSettings({ showFingerGuide: e.target.checked })}
                aria-label="Toggle finger placement guide"
                style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
            </div>

            <div className="divider" />

            {/* Countdown toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Start Countdown</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Provide a 3-second preparation countdown before timed test runs</div>
              </div>
              <input
                type="checkbox"
                checked={settings.countdown}
                onChange={e => updateSettings({ countdown: e.target.checked })}
                aria-label="Toggle countdown before test"
                style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
            </div>

            <div className="divider" />

            {/* Sound effects */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Typing Audio Clicks</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Play subtle mechanical click sounds on key input and error buzzer</div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={e => updateSettings({ soundEnabled: e.target.checked })}
                aria-label="Toggle typing sound"
                style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
            </div>

            <div className="divider" />

            {/* Default Test Duration */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Default Timed Test Duration
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {([15, 30, 60, 120] as TimedDuration[]).map(dur => (
                  <button
                    key={dur}
                    type="button"
                    className={`btn ${settings.defaultTestDuration === dur ? 'btn-primary' : 'btn-ghost'}`}
                    style={{
                      justifyContent: 'center',
                      border: settings.defaultTestDuration === dur ? undefined : '1px solid var(--border-default)',
                    }}
                    onClick={() => updateSettings({ defaultTestDuration: dur })}
                    aria-pressed={settings.defaultTestDuration === dur}
                  >
                    {dur < 60 ? `${dur}s` : `${dur / 60}m`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Data Management & Backup */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} style={{ color: 'var(--clr-primary-500)' }} aria-hidden="true" /> Data Management & Backup
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Your typing history and achievements are saved locally in this browser using IndexedDB. Export a backup anytime to transfer to another computer.
          </p>

          {/* Quick Storage Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'var(--bg-surface-2)', padding: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{progress.results.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Saved Tests</div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{Object.keys(progress.lessonProgress).length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lessons Practiced</div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{progress.unlockedAchievements.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Achievements</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary"
              onClick={handleExport}
              disabled={isExporting}
              aria-label="Export backup as JSON"
            >
              <Download size={16} aria-hidden="true" /> {isExporting ? 'Exporting...' : 'Export All Data (JSON)'}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              aria-label="Upload backup file"
            />
            <button
              className="btn btn-ghost"
              style={{ border: '1px solid var(--border-default)' }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              aria-label="Import data from backup JSON"
            >
              <Upload size={16} aria-hidden="true" /> {isImporting ? 'Importing...' : 'Import Data (JSON)'}
            </button>
          </div>
        </div>

        {/* Section 4: Danger Zone */}
        <div className="card" style={{ border: '1px solid var(--clr-danger-500)', background: 'rgba(239, 68, 68, 0.03)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--clr-danger-500)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} aria-hidden="true" /> Danger Zone
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Permanently delete your local typing session history, streaks, and unlocked achievements.
          </p>

          {!resetConfirmOpen ? (
            <button
              className="btn btn-danger"
              onClick={() => setResetConfirmOpen(true)}
              aria-label="Open reset progress confirmation"
            >
              <Trash2 size={16} aria-hidden="true" /> Reset All Learning Progress
            </button>
          ) : (
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-danger-500)' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-danger-500)', marginBottom: '0.5rem' }}>
                Are you sure? This cannot be undone. All your stats and achievements will be erased.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-danger"
                  onClick={handleResetProgress}
                  aria-label="Confirm reset all progress"
                >
                  Yes, Erase Everything
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setResetConfirmOpen(false)}
                  aria-label="Cancel reset"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
