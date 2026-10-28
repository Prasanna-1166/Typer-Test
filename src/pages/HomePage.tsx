// ============================================================
// TypeMaster — Home / Landing Page
// ============================================================
import { Link } from 'react-router-dom';
import {
  Keyboard, BarChart3, Trophy, Zap, BookOpen,
  Target, TrendingUp, Award, ArrowRight, CheckCircle,
  GraduationCap, ShieldCheck
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

const LEVELS = [
  {
    id: 'beginner',
    name: 'Beginner',
    tagline: 'Build the Foundation',
    description: 'Learn proper finger placement, home row keys, and touch-typing fundamentals from scratch.',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.2)',
    icon: GraduationCap,
    lessons: 22,
    skills: ['Home Row Keys', 'All Alphabet Letters', 'Capitalization', 'Core Punctuation'],
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    tagline: 'Build Speed & Accuracy',
    description: 'Push your WPM with longer passages, numbers, symbols, and timed exercises.',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    icon: Zap,
    lessons: 14,
    skills: ['Speed Drills', 'Numbers & Symbols', 'Extended Passages', 'Error Reduction'],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    tagline: 'Achieve Mastery',
    description: 'Type complex literary, technical, and programming syntax at professional speeds.',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.08)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
    icon: Award,
    lessons: 11,
    skills: ['Technical Vocabulary', 'Code Syntax', 'Endurance Tests', 'Final Certification'],
  },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: '47 Structured Lessons',
    description: 'Three complete learning tracks with progressive difficulty and clear educational objectives.',
    color: '#6366f1',
  },
  {
    icon: BarChart3,
    title: 'Detailed Analytics',
    description: 'Track WPM, accuracy, error patterns, and improvement trends over time.',
    color: '#22c55e',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description: 'Real-time character highlighting shows correct, incorrect, and corrected input instantly.',
    color: '#f59e0b',
  },
  {
    icon: Trophy,
    title: 'Gamified Progress',
    description: 'Earn XP, unlock 21 achievements, maintain daily practice streaks, and earn completion certificates.',
    color: '#ec4899',
  },
  {
    icon: Target,
    title: 'Personalized Recommendations',
    description: 'Data-driven suggestions based on your actual error patterns and performance trends.',
    color: '#06b6d4',
  },
  {
    icon: TrendingUp,
    title: 'Local Privacy & Persistence',
    description: 'All progress is saved locally in your browser via IndexedDB. Export and import data anytime.',
    color: '#8b5cf6',
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Take a Skill Check',
    description: 'Start with a quick assessment to evaluate your baseline speed and accuracy.',
    icon: Target,
  },
  {
    step: 2,
    title: 'Follow Structured Lessons',
    description: 'Complete lessons in order, building muscle memory progressively with each module.',
    icon: BookOpen,
  },
  {
    step: 3,
    title: 'Track Your Progress',
    description: 'Review your analytics, observe improvement trends, and follow personalized recommendations.',
    icon: BarChart3,
  },
  {
    step: 4,
    title: 'Earn Your Certificate',
    description: 'Pass each track\'s final assessment to earn a shareable, verified completion certificate.',
    icon: Award,
  },
];

export function HomePage() {
  const { progress } = useApp();
  const hasProgress = progress.results.length > 0 || Object.values(progress.lessonProgress).some(lp => lp.completedAt !== null);
  const bestWpm = progress.results.length > 0 ? Math.max(...progress.results.map(r => r.netWpm)) : null;

  return (
    <div className="page">
      {/* ---- Hero ---- */}
      <section style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: 'clamp(3rem, 7vw, 5.5rem) 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle background glow */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '60%',
          height: '150%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', background: 'var(--clr-primary-50)', border: '1px solid var(--clr-primary-200)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-primary-600)', marginBottom: '1.5rem' }}>
            <Keyboard size={14} aria-hidden="true" />
            Complete Typing Learning Platform
          </div>

          <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem, 5.5vw, 3.75rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Master the Keyboard.{' '}
            <span style={{ color: 'var(--clr-primary-500)' }}>
              Type with Precision.
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2.25rem', lineHeight: 1.7 }}>
            Structured courses from foundation to advanced. Live accuracy tracking. Data-driven practice recommendations to help you type faster and with fewer errors.
          </p>

          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={hasProgress ? '/dashboard' : '/courses'} className="btn btn-primary btn-xl">
              {hasProgress ? 'Continue Learning' : 'Start Learning'}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/test" className="btn btn-secondary btn-xl">
              <Keyboard size={18} aria-hidden="true" />
              Take a Typing Test
            </Link>
          </div>

          {/* Stats for returning users */}
          {hasProgress && bestWpm !== null && (
            <div style={{ marginTop: '2.5rem', display: 'inline-flex', gap: '2rem', padding: '1rem 2rem', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
              <QuickStat label="Best Speed" value={`${bestWpm} WPM`} />
              <QuickStat label="Practice Sessions" value={progress.results.length.toString()} />
              <QuickStat label="XP Earned" value={progress.xp.toLocaleString()} />
              <QuickStat label="Practice Streak" value={`${progress.streak} days`} />
            </div>
          )}

          {/* Interactive typing sample */}
          <div style={{ marginTop: '2.5rem', maxWidth: '640px', margin: '2.5rem auto 0' }} aria-hidden="true">
            <div className="card" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', lineHeight: 1.8, padding: '1.25rem 1.75rem', textAlign: 'left', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}>
              <span style={{ color: 'var(--clr-success-500)', fontWeight: 600 }}>The quick brown fox</span>
              <span style={{ position: 'relative', color: 'var(--text-primary)' }}>
                <span style={{ position: 'absolute', left: 0, top: '0.15em', bottom: '0.15em', width: '2px', background: 'var(--clr-primary-500)', borderRadius: '1px', animation: 'cursor-blink 1s step-end infinite' }} />
                {' '}
              </span>
              <span style={{ color: 'var(--text-tertiary)' }}>jumps over the lazy dog.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Learning Tracks ---- */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="page-title">Three Structured Tracks</h2>
            <p className="page-subtitle">Designed to take you from initial finger placement to professional-grade touch typing.</p>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {LEVELS.map(level => {
              const Icon = level.icon;
              return (
                <div
                  key={level.id}
                  className="card"
                  style={{
                    background: 'var(--bg-surface)',
                    border: `1.5px solid ${level.borderColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform var(--transition-base), box-shadow var(--transition-base)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-md)', background: level.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: level.color }}>
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <span className="badge" style={{ background: level.bgColor, color: level.color, border: `1px solid ${level.borderColor}` }}>
                      {level.lessons} lessons
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {level.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: level.color, marginBottom: '0.75rem' }}>
                    {level.tagline}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6, flex: 1 }}>
                    {level.description}
                  </p>

                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem', padding: 0, listStyle: 'none' }}>
                    {level.skills.map(skill => (
                      <li key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle size={14} style={{ color: level.color, flexShrink: 0 }} aria-hidden="true" />
                        {skill}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={`/courses/${level.id}`}
                    className="btn"
                    style={{ width: '100%', justifyContent: 'center', background: level.color, color: 'white', borderColor: level.color }}
                  >
                    Explore {level.name} Course
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className="section" style={{ background: 'var(--bg-surface-2)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="page-title">How TypeMaster Works</h2>
            <p className="page-subtitle">A clear step-by-step path toward lasting keyboard proficiency.</p>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {HOW_IT_WORKS.map(({ step, title, description, icon: Icon }) => (
              <div key={step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '3rem', height: '3rem', borderRadius: '50%',
                  background: 'var(--bg-surface)', border: '2px solid var(--clr-primary-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem', color: 'var(--clr-primary-500)', fontWeight: 800, fontSize: '1.15rem',
                }}>
                  {step}
                </div>
                <Icon size={22} style={{ color: 'var(--clr-primary-500)', margin: '0 auto 0.75rem', display: 'block' }} aria-hidden="true" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{title}</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="page-title">Everything You Need to Succeed</h2>
            <p className="page-subtitle">A comprehensive touch typing training system running entirely within your browser.</p>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {FEATURES.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="card" style={{ display: 'flex', gap: '1rem', padding: '1.25rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color }} aria-hidden="true" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Privacy Notice ---- */}
      <section style={{ padding: '2rem 0', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} style={{ color: 'var(--clr-success-500)', flexShrink: 0 }} aria-hidden="true" />
            <span>
              <strong>Private & Offline First:</strong> All practice history and metrics are stored locally in your browser. No telemetry or server syncing.
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--clr-primary-500)', letterSpacing: '-0.01em' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.15rem' }}>
        {label}
      </div>
    </div>
  );
}
