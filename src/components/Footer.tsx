// ============================================================
// TypeMaster — Global Footer Component
// ============================================================
import { Link } from 'react-router-dom';
import { Keyboard, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer no-print" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: '3rem 1.5rem 2rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ background: 'var(--clr-primary-500)', color: 'white', padding: '0.35rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>
                <Keyboard size={18} aria-hidden="true" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>TypeMaster</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '280px' }}>
              Master touch typing with structured progression, scientific speed-building exercises, and verifiable certificates.
            </p>
          </div>

          {/* Learn Tracks */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Curriculum Tracks
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
              <li>
                <Link to="/courses/beginner" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Beginner: Home Row & Fundamentals
                </Link>
              </li>
              <li>
                <Link to="/courses/intermediate" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Intermediate: Speed & Numbers
                </Link>
              </li>
              <li>
                <Link to="/courses/advanced" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Advanced: Mastery & Code Syntax
                </Link>
              </li>
              <li>
                <Link to="/courses" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  All 47 Learning Lessons
                </Link>
              </li>
            </ul>
          </div>

          {/* Practice & Tools */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Practice & Analytics
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
              <li>
                <Link to="/test" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Timed Speed Tests (15s–120s)
                </Link>
              </li>
              <li>
                <Link to="/reports" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Detailed Analytics & Weak Keys
                </Link>
              </li>
              <li>
                <Link to="/achievements" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  21 Gamified Achievements
                </Link>
              </li>
              <li>
                <Link to="/certificates" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Printable Verification Certificates
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Settings */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Local First
            </h4>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem', color: 'var(--clr-success-500)', fontWeight: 600 }}>
                <ShieldCheck size={16} aria-hidden="true" /> 100% Offline & Private
              </div>
              <p style={{ margin: '0 0 0.75rem 0' }}>
                All progress and keystroke metrics are saved locally in your browser via IndexedDB. No accounts or tracking.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/settings" style={{ color: 'var(--clr-primary-500)', fontWeight: 600, textDecoration: 'none' }}>
                  Settings
                </Link>
                <Link to="/admin" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          <div>
            © {new Date().getFullYear()} TypeMaster. Designed for typists worldwide.
          </div>
          <div>
            Built with React, TypeScript & IndexedDB
          </div>
        </div>
      </div>
    </footer>
  );
}
