// ============================================================
// TypeMaster — Navigation Component
// ============================================================
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Keyboard, LayoutDashboard, BookOpen, BarChart3, Trophy,
  Settings, Moon, Sun, Menu, X, Zap, Award
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
  { to: '/test', icon: Keyboard, label: 'Test' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/certificates', icon: Award, label: 'Certificates' },
];

export function Navigation() {
  const { theme, toggleTheme, progress, xpInfo } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on navigation
  useEffect(() => setMobileOpen(false), [location.pathname]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <nav className="nav" role="navigation" aria-label="Main navigation">
        <div className="container">
          <div className="nav-inner">
            {/* Logo */}
            <NavLink to="/" className="nav-logo" aria-label="TypeMaster Home">
              TypeMaster
            </NavLink>

            {/* Desktop links */}
            <ul className="nav-links" style={{ display: 'flex' }} role="list">
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    aria-current={location.pathname.startsWith(to) ? 'page' : undefined}
                  >
                    <Icon size={15} aria-hidden="true" />
                    <span className="desktop-only">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="nav-actions">
              {/* XP indicator */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600 }}
                title={`Level ${xpInfo.level} — ${progress.xp} XP total`}
              >
                <Zap size={13} style={{ color: 'var(--clr-warning-500)' }} aria-hidden="true" />
                <span>{progress.xp} XP</span>
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="btn btn-ghost"
                style={{ padding: '0.5rem' }}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light'
                  ? <Moon size={18} aria-hidden="true" />
                  : <Sun size={18} aria-hidden="true" />
                }
              </button>

              {/* Settings */}
              <NavLink
                to="/settings"
                className="btn btn-ghost"
                style={{ padding: '0.5rem' }}
                aria-label="Settings"
                title="Settings"
              >
                <Settings size={18} aria-hidden="true" />
              </NavLink>

              {/* Mobile hamburger */}
              <button
                className="btn btn-ghost mobile-menu-toggle"
                style={{ padding: '0.5rem' }}
                onClick={() => setMobileOpen(true)}
                aria-expanded={mobileOpen}
                aria-label="Open navigation menu"
                aria-controls="mobile-nav"
              >
                <Menu size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu" id="mobile-nav" role="dialog" aria-label="Navigation menu" aria-modal="true">
          <div
            className="mobile-menu-overlay"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav className="mobile-menu-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="nav-logo">TypeMaster</span>
              <button
                className="btn btn-ghost"
                style={{ padding: '0.5rem' }}
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </NavLink>
            ))}

            <div className="divider" />

            <NavLink
              to="/settings"
              className="nav-link"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
            >
              <Settings size={18} aria-hidden="true" />
              Settings
            </NavLink>

            <NavLink
              to="/admin"
              className="nav-link"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
            >
              Admin Dashboard
            </NavLink>
          </nav>
        </div>
      )}

      <style>{`
        .mobile-menu-toggle { display: none; }
        @media (max-width: 768px) {
          .mobile-menu-toggle { display: flex; }
          .desktop-only { display: none; }
        }
        @media (min-width: 769px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  );
}
