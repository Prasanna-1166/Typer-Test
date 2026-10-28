// ============================================================
// TypeMaster — Reports / Analytics Page
// ============================================================
import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Target, Clock, Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toISODate } from '@/lib/metrics';
import type { TypingResult } from '@/types';

type TimeRange = '7d' | '30d' | 'all';

function filterByRange(results: TypingResult[], range: TimeRange): TypingResult[] {
  if (range === 'all') return results;
  const days = range === '7d' ? 7 : 30;
  const cutoff = Date.now() - days * 86_400_000;
  return results.filter(r => r.completedAt >= cutoff);
}

export function ReportsPage() {
  const { progress } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const allResults = progress.results;
  const filtered = useMemo(() => filterByRange(allResults, timeRange), [allResults, timeRange]);

  const isEmpty = filtered.length === 0;

  // Aggregate chart data by date
  const chartData = useMemo(() => {
    const byDate: Record<string, { date: string; wpm: number[]; accuracy: number[]; sessions: number }> = {};
    for (const r of filtered) {
      const d = toISODate(r.completedAt);
      if (!byDate[d]) byDate[d] = { date: d, wpm: [], accuracy: [], sessions: 0 };
      byDate[d].wpm.push(r.netWpm);
      byDate[d].accuracy.push(r.accuracy);
      byDate[d].sessions++;
    }
    return Object.values(byDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({
        date: d.date.slice(5), // MM-DD
        avgWpm: Math.round(d.wpm.reduce((s, v) => s + v, 0) / d.wpm.length),
        maxWpm: Math.max(...d.wpm),
        avgAccuracy: Math.round(d.accuracy.reduce((s, v) => s + v, 0) / d.accuracy.length * 10) / 10,
        sessions: d.sessions,
      }));
  }, [filtered]);

  // Summary stats
  const summaryStats = useMemo(() => {
    if (filtered.length === 0) return null;
    const wpms = filtered.map(r => r.netWpm);
    const accs = filtered.map(r => r.accuracy);
    return {
      bestWpm: Math.max(...wpms),
      avgWpm: Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length),
      bestAccuracy: Math.max(...accs),
      avgAccuracy: Math.round(accs.reduce((a, b) => a + b, 0) / accs.length * 10) / 10,
      totalSessions: filtered.length,
      totalChars: filtered.reduce((s, r) => s + r.charsTyped, 0),
      totalMinutes: Math.round(filtered.reduce((s, r) => s + r.elapsedMs, 0) / 60000),
    };
  }, [filtered]);

  // Per-key error analysis
  const weakKeys = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const r of filtered) {
      for (const [k, v] of Object.entries(r.charErrors ?? {})) {
        totals[k] = (totals[k] ?? 0) + v;
      }
    }
    return Object.entries(totals)
      .filter(([k]) => /^[a-zA-Z]$/.test(k))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([char, count]) => ({ char, count }));
  }, [filtered]);

  return (
    <div className="page">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="page-header">
          <h1 className="page-title">
            <BarChart3 size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--clr-primary-500)' }} aria-hidden="true" />
            Reports & Analytics
          </h1>
          <p className="page-subtitle">Your typing performance history and trends.</p>
        </div>

        {/* Time range selector */}
        <div className="tabs" style={{ marginBottom: '2rem' }}>
          {(['7d', '30d', 'all'] as TimeRange[]).map(range => (
            <button
              key={range}
              className={`tab${timeRange === range ? ' active' : ''}`}
              onClick={() => setTimeRange(range)}
              aria-pressed={timeRange === range}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
              <BarChart3 size={44} aria-hidden="true" />
            </div>
            <h2 className="empty-state-title">No Practice Data Recorded</h2>
            <p className="empty-state-desc">Complete lessons or timed tests to visualize your speed, accuracy, and keystroke analytics here.</p>
          </div>
        )}

        {/* Summary stats */}
        {summaryStats && (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <StatCard icon={TrendingUp} label="Best WPM" value={summaryStats.bestWpm} color="#6366f1" />
            <StatCard icon={TrendingUp} label="Avg WPM" value={summaryStats.avgWpm} color="#22c55e" />
            <StatCard icon={Target} label="Best Accuracy" value={`${summaryStats.bestAccuracy.toFixed(1)}%`} color="#f59e0b" />
            <StatCard icon={Target} label="Avg Accuracy" value={`${summaryStats.avgAccuracy}%`} color="#f59e0b" />
            <StatCard icon={Flame} label="Sessions" value={summaryStats.totalSessions} color="#ef4444" />
            <StatCard icon={Clock} label="Practice Time" value={`${summaryStats.totalMinutes}m`} color="#8b5cf6" />
          </div>
        )}

        {/* WPM over time chart */}
        {chartData.length > 1 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>WPM Over Time</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}
                  formatter={(value: any, name: any) => [value, name === 'avgWpm' ? 'Avg WPM' : 'Best WPM']}
                />
                <Legend formatter={(value) => value === 'avgWpm' ? 'Avg WPM' : 'Best WPM'} />
                <Line type="monotone" dataKey="avgWpm" stroke="#6366f1" strokeWidth={2} dot={false} name="avgWpm" />
                <Line type="monotone" dataKey="maxWpm" stroke="#22c55e" strokeWidth={2} dot={false} strokeDasharray="4 2" name="maxWpm" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Accuracy chart */}
        {chartData.length > 1 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Accuracy Over Time</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}
                  formatter={(value: any) => [`${value}%`, 'Avg Accuracy']}
                />
                <Line type="monotone" dataKey="avgAccuracy" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sessions per day */}
        {chartData.length > 1 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Sessions Per Day</h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}
                  formatter={(value: any) => [value, 'Sessions']}
                />
                <Bar dataKey="sessions" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weak keys */}
        {weakKeys.length > 0 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Most Frequently Mistyped Keys
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Based on {filtered.length} session{filtered.length !== 1 ? 's' : ''}. Only alphabetical key errors shown.
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              {weakKeys.map(({ char, count }) => (
                <div key={char} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                  padding: '0.5rem 0.75rem', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)', minWidth: '3rem',
                }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '1rem', fontWeight: 700, color: 'var(--clr-error-500)' }}>
                    {char}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{count} err</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent results table */}
        {filtered.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Session History
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.75rem', fontWeight: 400 }}>
                Showing {Math.min(filtered.length, 50)} of {filtered.length} sessions
              </span>
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {['Date', 'Net WPM', 'Gross WPM', 'Accuracy', 'Errors', 'Duration', 'Mode'].map(h => (
                      <th key={h} style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: h === 'Date' || h === 'Mode' ? 'left' : 'right', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...filtered].slice(0, 50).map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(r.completedAt).toLocaleDateString()} {new Date(r.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--clr-primary-500)', fontFamily: 'Outfit' }}>{r.netWpm}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{r.grossWpm}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600, color: r.accuracy >= 95 ? 'var(--clr-success-500)' : r.accuracy >= 85 ? 'var(--clr-warning-500)' : 'var(--clr-error-500)' }}>
                        {r.accuracy.toFixed(1)}%
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: r.errorChars > 0 ? 'var(--clr-error-500)' : 'var(--clr-success-500)' }}>{r.errorChars}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {Math.round(r.elapsedMs / 1000)}s
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <span className="badge badge-neutral">{r.mode}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof TrendingUp;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
      <Icon size={18} style={{ color, margin: '0 auto 0.375rem', display: 'block' }} aria-hidden="true" />
      <div style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}
