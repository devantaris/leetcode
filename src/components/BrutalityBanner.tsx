import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Flame, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { STORAGE_KEYS } from '../config/storageKeys';
import { CURRICULUM } from '../data/curriculumStats';

export const BrutalityBanner: React.FC = () => {
  const { stats, userProfile } = useProgress();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_KEYS.bannerDismissed) === 'true';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEYS.bannerDismissed, 'true');
    setDismissed(true);
  };

  const isStreakHigh = stats.streak >= 7;
  const targetStr = (() => {
    try {
      return userProfile?.targetDate ? format(new Date(userProfile.targetDate), 'MMM d, yyyy') : 'your target date';
    } catch {
      return 'your target date';
    }
  })();

  const type = isStreakHigh ? 'success' : 'warning';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '12px 16px',
      background: `var(--color-${type}-bg)`,
      border: `1px solid var(--color-${type}-border)`,
      borderRadius: 'var(--radius-lg)',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        {isStreakHigh
          ? <Flame size={16} style={{ color: 'var(--color-warning-text)', flexShrink: 0 }} />
          : <AlertCircle size={16} style={{ color: 'var(--color-warning-text)', flexShrink: 0 }} />
        }
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          {isStreakHigh
            ? <><strong style={{ color: 'var(--text-primary)' }}>{stats.streak}-day streak!</strong> Keep the momentum — consistency is the biggest predictor of interview success.</>
            : <>Solve {CURRICULUM.dailyTarget} problems daily to hit your goal by <strong style={{ color: 'var(--text-primary)' }}>{targetStr}</strong>. {stats.missedDaysCount > 0 && <span style={{ color: 'var(--color-danger-text)' }}>{stats.missedDaysCount} days missed.</span>}</>
          }
        </p>
      </div>

      <button
        onClick={handleDismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          color: 'var(--text-muted)', borderRadius: 4, flexShrink: 0, lineHeight: 0
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};
