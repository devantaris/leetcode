import React, { useState, useEffect, useCallback } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { AuthModal } from '../components/modals/AuthModal';
import { RefreshCw, Users, Globe, Lock, Copy, Check, Eye, EyeOff, LogIn, Cloud } from 'lucide-react';
import toast from 'react-hot-toast';

export const LeaderboardPage: React.FC = () => {
  const { stats, userProfile, activeCohort, joinCohort, leaveCohort, authUser } = useProgress();
  const [boardType, setBoardType] = useState<'global' | 'cohort'>('global');
  const [cohortInput, setCohortInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const {
    entries,
    myEntry,
    myRank,
    isOptedIn,
    isAnonymous,
    toggleOptIn,
    toggleAnonymous,
    syncStats,
    fetchEntries,
    isSyncing,
    isFetching,
    isEnabled,
  } = useLeaderboard();

  const handleSync = useCallback(async () => {
    await syncStats({
      solvedCount: stats.solvedCount,
      streak: stats.streak,
      daysLeft: stats.daysLeft,
      oddsPercentage: stats.oddsPercentage,
      displayName: userProfile.name,
      tagline: userProfile.tagline,
    });
  }, [syncStats, stats, userProfile]);

  useEffect(() => {
    if (isOptedIn) {
      handleSync();
    }
  }, [isOptedIn, handleSync]);

  const renderRankBadge = (rank: number) => {
    if (rank === 1) return <span style={{ color: '#f59e0b', fontWeight: 800 }}>#1</span>;
    if (rank === 2) return <span style={{ color: '#94a3b8', fontWeight: 800 }}>#2</span>;
    if (rank === 3) return <span style={{ color: '#d97706', fontWeight: 800 }}>#3</span>;
    return <span style={{ color: 'var(--text-muted)' }}>#{rank}</span>;
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Title & Switcher Row ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{
            fontSize: 22, fontWeight: 700, color: 'var(--text-primary)',
            letterSpacing: '-0.02em', margin: '0 0 4px'
          }}>
            Leaderboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Compare consistency with global peers or compete in private cohorts.
          </p>
        </div>

        {/* Tab switcher: Global vs Cohort */}
        <div style={{
          display: 'inline-flex', gap: 2, background: 'var(--bg-elevated)',
          padding: 2, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)'
        }}>
          <button
            onClick={() => setBoardType('global')}
            style={{
              padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: 'none',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: boardType === 'global' ? 'var(--bg-card)' : 'transparent',
              color: boardType === 'global' ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Globe size={12} /> Global
            </span>
          </button>
          <button
            onClick={() => setBoardType('cohort')}
            style={{
              padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: 'none',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: boardType === 'cohort' ? 'var(--bg-card)' : 'transparent',
              color: boardType === 'cohort' ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Users size={12} /> Cohort {activeCohort ? `(${activeCohort.code})` : ''}
            </span>
          </button>
        </div>
      </div>

      {/* ── User Status & Sync Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', background: 'var(--bg-card)',
        border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
        fontSize: 12, flexWrap: 'wrap', gap: 10,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 8px', borderRadius: 4, background: 'rgba(99, 102, 241, 0.12)',
            color: '#818cf8', fontWeight: 600, fontSize: 11
          }}>
            <span>Rank</span>
            <strong style={{ fontFamily: 'var(--font-mono)' }}>#{myRank || '—'}</strong>
          </div>
          <span style={{ color: 'var(--border-default)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{stats.solvedCount}</strong> solved · <span style={{ color: '#f59e0b' }}>🔥 {stats.streak}d streak</span> · <span style={{ color: 'var(--color-success-text)' }}>{stats.oddsPercentage}% readiness</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isOptedIn && (
            <button
              onClick={toggleAnonymous}
              className="btn btn-ghost"
              style={{ fontSize: 11, padding: '4px 8px', color: 'var(--text-muted)' }}
              title={isAnonymous ? "Currently Anonymous" : "Showing your name"}
            >
              {isAnonymous ? <EyeOff size={12} /> : <Eye size={12} />}
              {isAnonymous ? 'Anon' : 'Public'}
            </button>
          )}

          <button
            onClick={toggleOptIn}
            className="btn btn-ghost"
            style={{ fontSize: 11, padding: '4px 8px', color: isOptedIn ? 'var(--text-muted)' : 'var(--color-info-text)' }}
          >
            {isOptedIn ? 'Opt out' : 'Join board'}
          </button>

          <button
            onClick={fetchEntries}
            disabled={isFetching}
            className="btn btn-default"
            style={{ fontSize: 11, padding: '4px 8px' }}
            title="Refresh"
          >
            <RefreshCw size={11} className={isFetching || isSyncing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── BOARD CONTENT ── */}
      {boardType === 'cohort' ? (
        activeCohort ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeCohort.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8, fontFamily: 'var(--font-mono)' }}>
                  Code: {activeCohort.code}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeCohort.code);
                    setCopied(true);
                    toast.success(`Copied invite code: ${activeCohort.code}`);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="btn btn-default"
                  style={{ fontSize: 11, padding: '3px 8px' }}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? 'Copied' : 'Share'}
                </button>
                <button
                  onClick={leaveCohort}
                  className="btn btn-danger"
                  style={{ fontSize: 11, padding: '3px 8px' }}
                >
                  Leave
                </button>
              </div>
            </div>

            {/* Members table */}
            <div style={{
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
              overflow: 'hidden', background: 'var(--bg-card)'
            }}>
              {/* You */}
              <div className="data-row" style={{ background: 'var(--color-info-bg)' }}>
                <span style={{ width: 36, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  {renderRankBadge(1)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-info-text)' }}>{userProfile.name} (You)</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                  <span style={{ color: 'var(--color-success-text)', fontWeight: 600 }}>{stats.solvedCount} solved</span>
                  <span style={{ color: '#f59e0b' }}>🔥 {stats.streak}d</span>
                  <span style={{ color: '#818cf8', fontWeight: 600 }}>{stats.oddsPercentage}%</span>
                </div>
              </div>

              {/* Real Cohort Peers */}
              {isEnabled && entries.filter(e => e.user_id !== myEntry?.user_id).map((peer, idx) => (
                <div key={peer.id || peer.user_id} className="data-row">
                  <span style={{ width: 36, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    {renderRankBadge(idx + 2)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {peer.is_anonymous ? 'Anonymous Grinder 🎭' : peer.display_name}
                    </span>
                    {peer.tagline && !peer.is_anonymous && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>{peer.tagline}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', flexShrink: 0 }}>
                    <span style={{ color: 'var(--color-success-text)', fontWeight: 600 }}>{peer.solved_count} solved</span>
                    <span style={{ color: '#f59e0b' }}>🔥 {peer.streak}d</span>
                    <span style={{ color: '#818cf8' }}>{peer.readiness_pct}%</span>
                  </div>
                </div>
              ))}

              {(!isEnabled || entries.filter(e => e.user_id !== myEntry?.user_id).length === 0) && (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6 }}>
                  No other grinders have joined this cohort yet.<br />
                  <span style={{ color: 'var(--text-secondary)' }}>Share your code <strong>{activeCohort.code}</strong> with peers to compare live progress!</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Join or create cohort */
          <div style={{
            padding: '24px 16px', background: 'var(--bg-card)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 380, margin: '0 auto', width: '100%'
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>
              Join or Create a Private Cohort
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
              Enter a 6-character code from a classmate, or type a new name to create one.
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Code or group name"
                value={cohortInput}
                onChange={(e) => setCohortInput(e.target.value)}
                className="input"
                style={{ fontSize: 12 }}
              />
              <button
                onClick={async () => {
                  if (!cohortInput.trim()) return;
                  setIsJoining(true);
                  const isCode = cohortInput.trim().length <= 6 && !cohortInput.includes(' ');
                  if (isCode) {
                    await joinCohort(cohortInput.toUpperCase());
                  } else {
                    const code = cohortInput.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() + Math.floor(10 + Math.random() * 89);
                    await joinCohort(code, cohortInput.trim());
                  }
                  setIsJoining(false);
                }}
                disabled={!cohortInput.trim() || isJoining}
                className="btn btn-primary"
                style={{ fontSize: 12 }}
              >
                Join
              </button>
            </div>
          </div>
        )
      ) : (
        /* Global Board */
        <>
          {!isEnabled && (
            <div style={{
              padding: '32px 16px', textAlign: 'center', background: 'var(--bg-card)',
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)'
            }}>
              <Lock size={18} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Supabase Database Not Connected</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Leaderboard rankings will activate once Supabase environment variables are configured.
              </div>
            </div>
          )}

          {isEnabled && entries.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              No entries logged yet. Be the first to join the leaderboard!
            </div>
          )}

          {isEnabled && entries.length > 0 && (
            <div style={{
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
              overflow: 'hidden', background: 'var(--bg-card)'
            }}>
              {entries.map((entry, idx) => {
                const isMe = entry.user_id === myEntry?.user_id;
                return (
                  <div
                    key={entry.id}
                    className="data-row"
                    style={{ background: isMe ? 'var(--color-info-bg)' : 'transparent' }}
                  >
                    <span style={{ width: 36, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      {renderRankBadge(idx + 1)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 500, color: isMe ? 'var(--color-info-text)' : 'var(--text-primary)' }}>
                        {entry.is_anonymous ? 'Anonymous' : entry.display_name} {isMe && '(You)'}
                      </span>
                      {entry.tagline && !entry.is_anonymous && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>
                          {entry.tagline}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', flexShrink: 0 }}>
                      <span style={{ color: 'var(--color-success-text)', fontWeight: 600 }}>{entry.solved_count} solved</span>
                      <span style={{ color: '#f59e0b' }}>🔥 {entry.streak}d</span>
                      <span style={{ color: '#818cf8' }}>{entry.readiness_pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Auth Banner if Guest */}
      {!authUser && (
        <div style={{
          padding: '16px 20px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Cloud size={20} style={{ color: '#818cf8', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Sync across devices & claim your rank
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Sign in to save your solves to the cloud and keep your rank when switching browsers.
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: 12, padding: '6px 14px' }}
          >
            <LogIn size={13} /> Sign In / Register
          </button>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};
