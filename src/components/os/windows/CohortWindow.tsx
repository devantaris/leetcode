import React, { useState } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { sounds } from '../../../utils/audio';

interface CohortWindowProps {
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
  userXP: number;
}

interface Peer {
  handle: string;
  xp: number;
  streak: number;
  isUser?: boolean;
}

export const CohortWindow: React.FC<CohortWindowProps> = ({ onLog, userXP }) => {
  const { userProfile, activeCohort, joinCohort } = useProgress();
  const [tab, setTab] = useState<'cohort' | 'global'>('cohort');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showJoinBox, setShowJoinBox] = useState(false);

  const cohortName = activeCohort?.name || 'IIT-B BATCH 2027';
  const cohortCode = activeCohort?.code || 'GRND27';

  // Base peers for cohort
  const cohortPeers: Peer[] = [
    { handle: 'sneha_k', xp: 2680, streak: 24 },
    { handle: 'arjun_cs', xp: 2510, streak: 19 },
    { handle: 'rohan_m', xp: 2100, streak: 15 },
    { handle: 'ishaan_v', xp: 1940, streak: 12 },
    { handle: 'priya_d', xp: 1820, streak: 16 },
    { handle: 'tanvi_99', xp: 1650, streak: 10 },
  ];

  // Base peers for global
  const globalPeers: Peer[] = [
    { handle: 'karan_algo', xp: 3420, streak: 45 },
    { handle: 'code_ninja_x', xp: 3100, streak: 38 },
    { handle: 'dev_varma', xp: 2890, streak: 31 },
    { handle: 'alok_verma', xp: 2410, streak: 22 },
    { handle: 'neha_singh', xp: 2020, streak: 14 },
    { handle: 'vikram_r', xp: 1780, streak: 9 },
  ];

  const currentPeers = tab === 'cohort' ? cohortPeers : globalPeers;

  // Insert current user and sort descending by XP
  const userHandle = userProfile.name ? userProfile.name.toLowerCase().replace(/\s+/g, '_') : 'devansh';
  const combinedList = [...currentPeers, { handle: `${userHandle} (you)`, xp: userXP, streak: 18, isUser: true }]
    .sort((a, b) => b.xp - a.xp);

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

  return (
    <div className="wbody" style={{ width: 460, maxWidth: '90vw' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
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
          GLOBAL BATCH
        </button>
        <button
          className="k ghost small"
          style={{ marginLeft: 'auto' }}
          onClick={() => setShowJoinBox(!showJoinBox)}
        >
          {showJoinBox ? 'CANCEL' : '+ JOIN CODE'}
        </button>
      </div>

      {showJoinBox && (
        <form onSubmit={handleJoin} style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <input
            type="text"
            className="retro-input"
            placeholder="ENTER INVITE CODE (e.g. GRND27)..."
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
        {' RANK  HANDLE             XP      STRK\n'}
        {'─────────────────────────────────────────\n'}
        {combinedList.map((p, idx) => {
          const rankNum = idx + 1;
          const rankStr = String(rankNum).padStart(2, ' ') + '.';
          const handleStr = p.handle.padEnd(18, ' ');
          const xpStr = p.xp.toLocaleString().padStart(6, ' ');
          const streakStr = `${p.streak}🔥`.padStart(5, ' ');

          if (p.isUser) {
            return (
              <span key={idx} style={{ color: 'var(--fg)', fontWeight: 700 }}>
                {` ${rankStr}  ${handleStr} ${xpStr}   ${streakStr}  ←\n`}
              </span>
            );
          }

          if (rankNum === 1) {
            return (
              <span key={idx} className="ambtxt">
                {` ${rankStr}  ${handleStr} ${xpStr}   ${streakStr}\n`}
              </span>
            );
          }

          return (
            <span key={idx} className="dimtxt">
              {` ${rankStr}  ${handleStr} ${xpStr}   ${streakStr}\n`}
            </span>
          );
        })}
      </pre>

      <hr />
      <div className="dimtxt" style={{ fontSize: 11 }}>
        NODE: <span style={{ color: 'var(--fg)' }}>{cohortName}</span> · INVITE CODE:{' '}
        <span style={{ color: 'var(--fg)' }}>{cohortCode}</span> (42 NODES ONLINE)
      </div>
      <div className="dimtxt" style={{ fontSize: 11, marginTop: 4 }}>
        CURRENT RANK: #{userRank} · GAP TO #1:{' '}
        <b style={{ color: gapToTop === 0 ? 'var(--fg)' : 'var(--amb)' }}>{gapToTop} XP</b>
        {gapToTop > 0
          ? ` (${Math.ceil(gapToTop / 15)} SOLVES FLIP THE BOARD)`
          : ' (YOU HOLD THE LEAD 👑)'}
      </div>
    </div>
  );
};
