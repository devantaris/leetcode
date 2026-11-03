import React from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { MERGED_PLAN_DATA } from '../../../data/mergedPlanData';

interface StatsWindowProps {
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
}

export const StatsWindow: React.FC<StatsWindowProps> = ({ onLog: _onLog }) => {
  const { stats, streak, userProfile, progress } = useProgress();

  // Compute topic breakdown from MERGED_PLAN_DATA
  const topicStats = React.useMemo(() => {
    const topics: Record<string, { total: number; solved: number }> = {};

    MERGED_PLAN_DATA.forEach((w) => {
      w.days.forEach((d) => {
        const topic = d.topic.split('(')[0].trim();
        if (!topics[topic]) {
          topics[topic] = { total: 0, solved: 0 };
        }
        d.problems.forEach((p) => {
          topics[topic].total += 1;
          if (progress[p.id]) {
            topics[topic].solved += 1;
          }
        });
      });
    });

    return Object.entries(topics)
      .map(([name, data]) => ({
        name,
        total: data.total,
        solved: data.solved,
        pct: data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [progress]);

  // Compute difficulty breakdown
  const diffStats = React.useMemo(() => {
    let easyTotal = 0;
    let easySolved = 0;
    let medTotal = 0;
    let medSolved = 0;
    let hardTotal = 0;
    let hardSolved = 0;

    MERGED_PLAN_DATA.forEach((w) => {
      w.days.forEach((d) => {
        d.problems.forEach((p) => {
          if (p.difficulty === 'Easy') {
            easyTotal++;
            if (progress[p.id]) easySolved++;
          } else if (p.difficulty === 'Hard') {
            hardTotal++;
            if (progress[p.id]) hardSolved++;
          } else {
            medTotal++;
            if (progress[p.id]) medSolved++;
          }
        });
      });
    });

    return {
      easy: { solved: easySolved, total: easyTotal },
      med: { solved: medSolved, total: medTotal },
      hard: { solved: hardSolved, total: hardTotal },
    };
  }, [progress]);

  const readinessScore = typeof stats.oddsPercentage === 'number'
    ? stats.oddsPercentage
    : Math.min(100, Math.round((stats.solvedCount / (stats.totalProblems || 1)) * 100));

  const makeAsciiBar = (pct: number, length: number = 18) => {
    const validPct = isNaN(pct) ? 0 : Math.max(0, Math.min(100, pct));
    const filled = Math.round((validPct / 100) * length);
    const empty = Math.max(0, length - filled);
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  return (
    <div className="wbody" style={{ width: 560, maxWidth: '90vw' }}>
      {/* Readiness Hero Score */}
      <div
        style={{
          border: '1px solid var(--fg)',
          padding: '10px 14px',
          background: 'rgba(0,0,0,0.4)',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--dim)', letterSpacing: '0.12em' }}>
              INTERVIEW READINESS INDEX
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--fg)', lineHeight: 1.1 }}>
              {readinessScore}%{' '}
              <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--dim)' }}>
                ({readinessScore >= 75 ? 'TIER-1 READY 🏆' : readinessScore >= 45 ? 'INTERVIEW COMPETENT' : 'FOUNDATION PHASE'})
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--dim)' }}>
            <div>STREAK: <b style={{ color: 'var(--amb)' }}>{streak} DAYS 🔥</b></div>
            <div>SOLVED: <b style={{ color: 'var(--fg)' }}>{stats.solvedCount}/{stats.totalProblems}</b></div>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, marginTop: 6, color: 'var(--fg)' }}>
          [{makeAsciiBar(readinessScore, 34)}]
        </div>

        <div className="dimtxt" style={{ fontSize: 10, marginTop: 6 }}>
          {stats.readinessBreakdown?.actionableAdvice ||
            'ADVICE: Maintain 3 solves daily and clear spaced reviews to unlock 80%+ readiness score.'}
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <h4>▸ PROBLEM DIFFICULTY MATRIX</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ border: '1px solid var(--line)', padding: '6px 8px' }}>
          <div style={{ fontSize: 10, color: 'var(--fg)' }}>EASY PROBLEMS</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>
            {diffStats.easy.solved}/{diffStats.easy.total}
          </div>
          <div style={{ fontSize: 9, color: 'var(--dim)', fontFamily: 'var(--mono)' }}>
            [{makeAsciiBar(diffStats.easy.total > 0 ? Math.round((diffStats.easy.solved / diffStats.easy.total) * 100) : 0, 8)}]
          </div>
        </div>

        <div style={{ border: '1px solid var(--line)', padding: '6px 8px' }}>
          <div style={{ fontSize: 10, color: 'var(--amb)' }}>MEDIUM (CORE FAANG)</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--amb)' }}>
            {diffStats.med.solved}/{diffStats.med.total}
          </div>
          <div style={{ fontSize: 9, color: 'var(--dim)', fontFamily: 'var(--mono)' }}>
            [{makeAsciiBar(diffStats.med.total > 0 ? Math.round((diffStats.med.solved / diffStats.med.total) * 100) : 0, 8)}]
          </div>
        </div>

        <div style={{ border: '1px solid var(--line)', padding: '6px 8px' }}>
          <div style={{ fontSize: 10, color: 'var(--red)' }}>HARD PROBLEMS</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)' }}>
            {diffStats.hard.solved}/{diffStats.hard.total}
          </div>
          <div style={{ fontSize: 9, color: 'var(--dim)', fontFamily: 'var(--mono)' }}>
            [{makeAsciiBar(diffStats.hard.total > 0 ? Math.round((diffStats.hard.solved / diffStats.hard.total) * 100) : 0, 8)}]
          </div>
        </div>
      </div>

      {/* Topic Mastery ASCII List */}
      <h4>▸ TOPIC MASTERY BREAKDOWN</h4>
      <div
        style={{
          maxHeight: '26vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          fontFamily: 'var(--mono)',
          fontSize: 11,
        }}
      >
        {topicStats.slice(0, 10).map((t) => (
          <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--fg)' }}>
              {t.name}
            </span>
            <span style={{ color: t.pct >= 70 ? 'var(--fg)' : t.pct >= 30 ? 'var(--amb)' : 'var(--dim)' }}>
              [{makeAsciiBar(t.pct, 12)}]
            </span>
            <span style={{ width: 40, textAlign: 'right', color: 'var(--dim)' }}>
              {t.pct}%
            </span>
            <span style={{ fontSize: 10, color: 'var(--dim)' }}>
              ({t.solved}/{t.total})
            </span>
          </div>
        ))}
      </div>

      <hr />
      <div className="dimtxt" style={{ fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
        <span>PROJECTED COMPLETION: {stats.projectedCompletionDate || userProfile.targetDate}</span>
        <span>STATUS: {stats.isOnTrack ? 'ON TRACK [NORMAL]' : 'SLIGHT DELAY [RECOVERY ARMED]'}</span>
      </div>
    </div>
  );
};
