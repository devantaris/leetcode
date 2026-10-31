// GrindOS — LeaderboardOptInBanner
// Clean SaaS Minimalist

import { useState } from 'react';
import { Trophy, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { isLeaderboardEnabled } from '../config/supabaseClient';
import { STORAGE_KEYS } from '../config/storageKeys';

const BANNER_DISMISSED_KEY = 'go_leaderboard_banner_dismissed';
const SHOW_AFTER_DAYS = 2;

export function LeaderboardOptInBanner() {
  const { stats } = useProgress();

  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
  });

  const isOptedIn = localStorage.getItem(STORAGE_KEYS.leaderboardOptIn) === 'true';

  const shouldShow =
    isLeaderboardEnabled &&
    !dismissed &&
    !isOptedIn &&
    stats.completedDaysCount >= SHOW_AFTER_DAYS;

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
  }

  if (!shouldShow) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '12px 16px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 'var(--radius-md)',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-primary)', flexShrink: 0
        }}>
          <Trophy size={14} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            Compare progress with peers
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            You've solved {stats.solvedCount} problems. Join the peer leaderboard or private cohorts.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Link to="/leaderboard" className="btn btn-default" style={{ fontSize: 12, padding: '5px 10px' }}>
          Leaderboard <ArrowRight size={11} />
        </Link>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, display: 'flex'
          }}
          title="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
