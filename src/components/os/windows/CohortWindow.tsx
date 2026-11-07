import React, { useState, useEffect, useCallback } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { sounds } from '../../../utils/audio';
import { CloudSyncService } from '../../../services/cloudSync';
import { getActiveSupabaseCredentials } from '../../../config/supabaseClient';

interface CohortWindowProps {
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
  userXP: number;
}

interface Peer {
  handle: string;
  xp: number;
  streak: number;
  solved?: number;
  isUser?: boolean;
}

export const CohortWindow: React.FC<CohortWindowProps> = ({ onLog, userXP }) => {
  const { userProfile, activeCohort, joinCohort, stats, streak, triggerCloudSync } = useProgress();
  const [tab, setTab] = useState<'cohort' | 'global'>('cohort');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showJoinBox, setShowJoinBox] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveGlobalPeers, setLiveGlobalPeers] = useState<Peer[]>([]);

  const cohortName = activeCohort?.name || 'PRIVATE COHORT';
  const cohortCode = activeCohort?.code || 'GRND01';
  const creds = getActiveSupabaseCredentials();

  // Fetch live global leaderboard from Supabase
  const loadLiveLeaderboard = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const rows = await CloudSyncService.fetchLiveLeaderboard();
      if (rows && rows.length > 0) {
        const mapped: Peer[] = rows.map((r: { display_name?: string; solved_count: number; streak: number }) => ({
          handle: r.display_name || 'Anonymous',
          xp: (r.solved_count * 15) + (r.streak * 20),
          streak: r.streak || 0,
          solved: r.solved_count || 0,
        }));
        setLiveGlobalPeers(mapped);
        onLog(`cohort: live leaderboard synced (${rows.length} peer nodes)`, 'ok');
      } else {
        setLiveGlobalPeers([]);
      }
    } catch {
      setLiveGlobalPeers([]);
    } finally {
      setIsRefreshing(false);
    }
  }, [onLog]);

  useEffect(() => {
    loadLiveLeaderboard();
  }, [loadLiveLeaderboard]);

  const currentPeers = tab === 'cohort'
    ? []
    : liveGlobalPeers;

  // Insert current user and sort descending by XP
  const userHandle = userProfile.name ? userProfile.name.toLowerCase().replace(/\s+/g, '_') : 'operator';
  const combinedList = [
    ...currentPeers,
    { handle: `${userHandle} (you)`, xp: userXP, streak, solved: stats.solvedCount, isUser: true },
  ].sort((a, b) => b.xp - a.xp);

  const userRank = combinedList.findIndex((p) => p.isUser) + 1;
  const topXP = combinedList[0]?.xp || userXP;
  const gapToTop = Math.max(0, topXP - userXP);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const ok = await joinCohort(joinCodeInput.trim().toUpperCase());
    if (ok) {
      sounds.playVictorySound();
      onLog(`cohort: joined node [${joinCodeInput.toUpperCase()}]`, 'ok');
      setShowJoinBox(false);
      setJoinCodeInput('');
    } else {
      sounds.playUncheckSound();
      onLog(`cohort error: could not link node`, 'warn');
    }
  };

  const handleSyncMyRank = async () => {
    sounds.playTickSound();
    await triggerCloudSync();
    await loadLiveLeaderboard();
  };

  return (
    <div className="wbody" style={{ width: 490, maxWidth: '90vw' }}>
      {/* Top Banner & Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
        <button
          className={`k small ${tab === 'cohort' ? '' : 'ghost'}`}
          onClick={() => { setTab('cohort'); sounds.playTickSound(); }}
        >
          COHORT: {cohortCode}
        </button>
        <button
          className={`k small ${tab === 'global' ? '' : 'ghost'}`}
          onClick={() => { setTab('global'); sounds.playTickSound(); }}
        >
          LIVE GLOBAL BATCH
        </button>

        <button
          className="k ghost small"
          style={{ marginLeft: 'auto' }}
          onClick={handleSyncMyRank}
          title="Push stats and fetch latest live board"
        >
          {isRefreshing ? 'SYNCING...' : 'SYNC LIVE ⟳'}
        </button>

        <button
          className="k ghost small"
          onClick={() => setShowJoinBox(!showJoinBox)}
        >
          {showJoinBox ? 'CANCEL' : '+ JOIN'}
        </button>
      </div>

      {showJoinBox && (
        <form onSubmit={handleJoin} style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <input
            type="text"
            className="retro-input"
            placeholder="INVITE CODE (e.g. GRND27, IITD26)..."
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
            style={{ textTransform: 'uppercase' }}
          />
          <button type="submit" className="k small">
            LINK
          </button>
        </form>
      )}

      {/* Leaderboard ASCII table */}
      <pre
        className="dimtxt"
        style={{
          lineHeight: 1.85,
          fontFamily: 'var(--mono)',
          fontSize: 12,
          margin: 0,
          background: 'rgba(0,0,0,0.5)',
          padding: '8px 10px',
          border: '1px solid var(--line)',
        }}
      >
        {' RANK  HANDLE             XP      SOLVE  STRK\n'}
        {'───────────────────────────────────────────────\n'}
        {combinedList.map((p, idx) => {
          const rankNum = idx + 1;
          const rankStr = String(rankNum).padStart(2, ' ') + '.';
          const handleStr = p.handle.padEnd(18, ' ');
          const xpStr = p.xp.toLocaleString().padStart(6, ' ');
          const solveStr = String(p.solved || 0).padStart(5, ' ');
          const streakStr = `${p.streak}🔥`.padStart(5, ' ');

          if (p.isUser) {
            return (
              <span key={idx} style={{ color: 'var(--fg)', fontWeight: 700 }}>
                {` ${rankStr}  ${handleStr} ${xpStr}  ${solveStr} ${streakStr}  ←\n`}
              </span>
            );
          }

          if (rankNum === 1) {
            return (
              <span key={idx} className="ambtxt">
                {` ${rankStr}  ${handleStr} ${xpStr}  ${solveStr} ${streakStr}\n`}
              </span>
            );
          }

          return (
            <span key={idx} className="dimtxt">
              {` ${rankStr}  ${handleStr} ${xpStr}  ${solveStr} ${streakStr}\n`}
            </span>
          );
        })}
      </pre>

      <hr />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--dim)' }}>
        <div>
          STATUS:{' '}
          <span style={{ color: creds.source !== 'none' ? 'var(--fg)' : 'var(--amb)' }}>
            {creds.source !== 'none' ? '● LIVE DATABASE CONNECTED' : '○ LOCAL CACHE / DISCONNECTED'}
          </span>
        </div>
        <div>NODE: <span style={{ color: 'var(--fg)' }}>{cohortName} [{cohortCode}]</span></div>
      </div>

      <div className="dimtxt" style={{ fontSize: 11, marginTop: 4 }}>
        YOUR RANK: #{userRank} · GAP TO #1:{' '}
        <b style={{ color: gapToTop === 0 ? 'var(--fg)' : 'var(--amb)' }}>{gapToTop} XP</b>
        {gapToTop > 0
          ? ` (${Math.ceil(gapToTop / 15)} SOLVES FLIP THE BOARD)`
          : ' (YOU HOLD THE BOARD 👑)'}
      </div>
    </div>
  );
};
