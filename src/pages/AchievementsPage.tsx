// ============================================================
// TypeMaster — Achievements Page
// ============================================================
import { useState } from 'react';
import {
  Trophy, Lock, CheckCircle, Zap, Target, BookOpen, Flame, Award, Timer, GraduationCap
} from 'lucide-react';
import { useApp, ACHIEVEMENTS } from '@/context/AppContext';
import type { Achievement } from '@/types';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Award },
  { id: 'speed', label: 'Speed', icon: Zap },
  { id: 'accuracy', label: 'Accuracy', icon: Target },
  { id: 'lessons', label: 'Lessons', icon: BookOpen },
  { id: 'streak', label: 'Streak', icon: Flame },
  { id: 'misc', label: 'Special', icon: Trophy },
] as const;

export function AchievementsPage() {
  const { progress } = useApp();
  const [filter, setFilter] = useState<'all' | Achievement['category']>('all');

  const unlockedIds = new Set(progress.unlockedAchievements.map(u => u.achievementId));
  const unlockedMap = new Map(progress.unlockedAchievements.map(u => [u.achievementId, u]));

  const filtered = ACHIEVEMENTS.filter(a => filter === 'all' || a.category === filter);
  const unlocked = filtered.filter(a => unlockedIds.has(a.id));
  const locked = filtered.filter(a => !unlockedIds.has(a.id));

  const totalXpFromAchievements = ACHIEVEMENTS
    .filter(a => unlockedIds.has(a.id))
    .reduce((s, a) => s + a.xpReward, 0);

  return (
    <div className="page">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="page-header">
          <h1 className="page-title">
            <Trophy size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--clr-warning-500)' }} aria-hidden="true" />
            Achievements
          </h1>
          <p className="page-subtitle">
            {unlockedIds.size} of {ACHIEVEMENTS.length} unlocked · {totalXpFromAchievements} XP earned from achievements
          </p>
        </div>

        {/* Category filter */}
        <div className="tabs" style={{ marginBottom: '2rem' }}>
          {CATEGORIES.map(({ id, label, icon: IconComponent }) => (
            <button
              key={id}
              className={`tab${filter === id ? ' active' : ''}`}
              onClick={() => setFilter(id as typeof filter)}
              aria-pressed={filter === id}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <IconComponent size={14} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Unlocked */}
        {unlocked.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <CheckCircle size={14} style={{ color: 'var(--clr-success-500)' }} aria-hidden="true" />
              <span>Unlocked ({unlocked.length})</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
              {unlocked.map(ach => {
                const unlock = unlockedMap.get(ach.id);
                return (
                  <AchievementCard key={ach.id} achievement={ach} isUnlocked={true} unlockedAt={unlock?.unlockedAt} />
                );
              })}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Lock size={14} aria-hidden="true" />
              <span>Locked ({locked.length})</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
              {locked.map(ach => (
                <AchievementCard key={ach.id} achievement={ach} isUnlocked={false} />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="empty-state">
            <Trophy size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} aria-hidden="true" />
            <h2 className="empty-state-title">No achievements in this category</h2>
          </div>
        )}
      </div>
    </div>
  );
}

function AchievementIconBadge({ achievement, isUnlocked }: { achievement: Achievement; isUnlocked: boolean }) {
  let IconComponent = Trophy;
  let iconColor = 'var(--clr-warning-500)';
  let bgColor = 'rgba(245, 158, 11, 0.12)';

  switch (achievement.category) {
    case 'speed':
      IconComponent = Zap;
      iconColor = 'var(--clr-warning-500)';
      bgColor = 'rgba(245, 158, 11, 0.12)';
      break;
    case 'accuracy':
      IconComponent = Target;
      iconColor = 'var(--clr-primary-500)';
      bgColor = 'rgba(99, 102, 241, 0.12)';
      break;
    case 'lessons':
      if (achievement.id.includes('complete')) {
        IconComponent = GraduationCap;
        iconColor = 'var(--clr-success-500)';
        bgColor = 'rgba(34, 197, 94, 0.12)';
      } else {
        IconComponent = BookOpen;
        iconColor = 'var(--clr-success-500)';
        bgColor = 'rgba(34, 197, 94, 0.12)';
      }
      break;
    case 'streak':
      IconComponent = Flame;
      iconColor = '#ef4444';
      bgColor = 'rgba(239, 68, 68, 0.12)';
      break;
    case 'misc':
    default:
      if (achievement.id.includes('test')) {
        IconComponent = Timer;
        iconColor = 'var(--clr-primary-400)';
        bgColor = 'rgba(99, 102, 241, 0.12)';
      } else {
        IconComponent = Award;
        iconColor = 'var(--clr-warning-500)';
        bgColor = 'rgba(245, 158, 11, 0.12)';
      }
      break;
  }

  return (
    <div
      style={{
        width: '2.5rem',
        height: '2.5rem',
        borderRadius: 'var(--radius-md)',
        background: isUnlocked ? bgColor : 'var(--bg-surface-2)',
        color: isUnlocked ? iconColor : 'var(--text-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <IconComponent size={20} />
    </div>
  );
}

function AchievementCard({ achievement, isUnlocked, unlockedAt }: {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockedAt?: number;
}) {
  return (
    <div
      className={`achievement${isUnlocked ? ' achievement-unlocked' : ' achievement-locked'}`}
      role="article"
      aria-label={`${achievement.title}: ${isUnlocked ? 'Unlocked' : 'Locked'}`}
    >
      <AchievementIconBadge achievement={achievement} isUnlocked={isUnlocked} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>{achievement.title}</h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--clr-warning-500)', fontWeight: 700, whiteSpace: 'nowrap' }}>
            +{achievement.xpReward} XP
          </span>
        </div>
        <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '0.125rem' }}>
          {achievement.description}
        </p>
        {isUnlocked && unlockedAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--clr-success-500)', marginTop: '0.375rem' }}>
            <CheckCircle size={11} aria-hidden="true" />
            <span>Unlocked {new Date(unlockedAt).toLocaleDateString()}</span>
          </div>
        )}
        {!isUnlocked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.375rem' }}>
            <Lock size={10} aria-hidden="true" /> Keep practising to unlock
          </div>
        )}
      </div>
    </div>
  );
}
