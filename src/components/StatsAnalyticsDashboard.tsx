import React, { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { AnimatedCounter } from './AnimatedCounter';

const CARD_STYLE: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-lg)',
  padding: '16px 18px',
};

export const StatsAnalyticsDashboard: React.FC = () => {
  const { stats, progress, userProfile } = useProgress();

  const { easySolved, easyTotal, medSolved, medTotal, hardSolved, hardTotal, topicDataMap } = useMemo(() => {
    let easySolved = 0, easyTotal = 0;
    let medSolved = 0, medTotal = 0;
    let hardSolved = 0, hardTotal = 0;
    const topicDataMap: { [topic: string]: { total: number; solved: number } } = {};

    PLAN_DATA.forEach((w) => {
      if (!topicDataMap[w.topic]) topicDataMap[w.topic] = { total: 0, solved: 0 };
      w.days.forEach((d) => {
        d.problems.forEach((p) => {
          topicDataMap[w.topic].total++;
          if (p.difficulty === 'Easy') { easyTotal++; if (progress[p.id]) easySolved++; }
          else if (p.difficulty === 'Medium') { medTotal++; if (progress[p.id]) medSolved++; }
          else if (p.difficulty === 'Hard') { hardTotal++; if (progress[p.id]) hardSolved++; }
          if (progress[p.id]) topicDataMap[w.topic].solved++;
        });
      });
    });
    return { easySolved, easyTotal, medSolved, medTotal, hardSolved, hardTotal, topicDataMap };
  }, [progress]);

  const diffChartData = useMemo(() => [
    { name: 'Easy', solved: easySolved, total: easyTotal, color: '#10b981' },
    { name: 'Medium', solved: medSolved, total: medTotal, color: '#f59e0b' },
    { name: 'Hard', solved: hardSolved, total: hardTotal, color: '#f43f5e' },
  ], [easySolved, easyTotal, medSolved, medTotal, hardSolved, hardTotal]);

  const topicChartData = useMemo(() => {
    return Object.keys(topicDataMap)
      .map((topic) => ({
        name: topic.length > 12 ? topic.substring(0, 10) + '..' : topic,
        Solved: topicDataMap[topic].solved,
        Remaining: topicDataMap[topic].total - topicDataMap[topic].solved,
      }))
      .slice(0, 8);
  }, [topicDataMap]);

  const solvedPct = Math.round((stats.solvedCount / (stats.totalProblems || 1)) * 100);
  const targetStr = userProfile?.targetDate
    ? new Date(userProfile.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Target Date';

  const readinessColor = stats.oddsPercentage >= 75
    ? 'var(--color-success-text)'
    : stats.oddsPercentage >= 50
    ? 'var(--color-warning-text)'
    : 'var(--color-danger-text)';

  const readinessLabel = stats.oddsPercentage >= 75 ? 'Placement Ready' : stats.oddsPercentage >= 50 ? 'On Track' : 'Building';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Analytics</h2>
        <span className="section-label">Week {stats.currentWeek} · Day {stats.currentDay}</span>
      </div>

      {/* ── Stat cards row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        {/* Problems Solved */}
        <div style={CARD_STYLE}>
          <div className="section-label" style={{ marginBottom: 8 }}>Solved</div>
          <div className="stat-number">
            <AnimatedCounter value={stats.solvedCount} />
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>/{stats.totalProblems}</span>
          </div>
          <div className="progress-track" style={{ marginTop: 10 }}>
            <div className="progress-fill progress-fill-success" style={{ width: `${solvedPct}%` }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{solvedPct}% complete</div>
        </div>

        {/* Streak */}
        <div style={CARD_STYLE}>
          <div className="section-label" style={{ marginBottom: 8 }}>Streak</div>
          <div className="stat-number" style={{ color: stats.streak > 0 ? 'var(--color-warning-text)' : 'var(--text-primary)' }}>
            <AnimatedCounter value={stats.streak} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {stats.streak >= 7 ? 'Excellent consistency!' : 'consecutive days'}
          </div>
        </div>

        {/* Countdown */}
        <div style={CARD_STYLE}>
          <div className="section-label" style={{ marginBottom: 8 }}>Countdown</div>
          <div className="stat-number">
            <AnimatedCounter value={stats.daysLeft} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            days to {targetStr}
          </div>
        </div>

        {/* Readiness */}
        <div style={CARD_STYLE}>
          <div className="section-label" style={{ marginBottom: 8 }}>Readiness</div>
          <div className="stat-number" style={{ color: readinessColor }}>
            <AnimatedCounter value={stats.oddsPercentage} suffix="%" />
          </div>
          <div style={{ fontSize: 11, color: readinessColor, marginTop: 4 }}>
            {readinessLabel}
          </div>
        </div>

        {/* Missed */}
        <div style={CARD_STYLE}>
          <div className="section-label" style={{ marginBottom: 8 }}>Missed</div>
          <div className="stat-number" style={{ color: stats.missedDaysCount === 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)' }}>
            <AnimatedCounter value={stats.missedDaysCount} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {stats.missedDaysCount === 0 ? 'Perfect record!' : 'days off-track'}
          </div>
        </div>
      </div>

      {/* ── Readiness breakdown ── */}
      <div style={{
        ...CARD_STYLE,
        padding: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 2 }}>Readiness Breakdown</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Score: {stats.oddsPercentage}/100
            </div>
          </div>
          <div style={{
            fontSize: 12, color: 'var(--text-secondary)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)', padding: '6px 10px', maxWidth: 320
          }}>
            {stats.readinessBreakdown.actionableAdvice}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
          {[
            { label: 'Coverage', score: stats.readinessBreakdown.coverageScore, max: 40, color: 'var(--color-success-text)' },
            { label: 'Streak', score: stats.readinessBreakdown.streakScore, max: 25, color: 'var(--color-warning-text)' },
            { label: 'Pace', score: stats.readinessBreakdown.paceScore, max: 25, color: 'var(--color-info-text)' },
            { label: 'Breadth', score: stats.readinessBreakdown.breadthScore, max: 10, color: 'var(--text-secondary)' },
          ].map(({ label, score, max, color }) => (
            <div key={label} style={{
              padding: '10px 12px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div className="section-label" style={{ marginBottom: 4 }}>{label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ {max}</span>
              </div>
              <div className="progress-track" style={{ marginTop: 6 }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: color, width: `${(score / max) * 100}%`,
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts ── */}
      {stats.solvedCount === 0 ? (
        <div style={{
          ...CARD_STYLE, padding: '40px 20px',
          textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
        }}>
          <div style={{ fontSize: 32 }}>📊</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>No data yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 300 }}>
            Complete your first problems and charts will appear here automatically.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {/* Difficulty chart */}
          <div style={CARD_STYLE}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Difficulty</div>
              <span className="section-label">Easy / Med / Hard</span>
            </div>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={diffChartData} cx="50%" cy="50%"
                    innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="solved">
                    {diffChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                      borderRadius: 8, color: 'var(--text-primary)', fontSize: 12
                    }}
                    formatter={(value: any, name: any) => [`${value} solved`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, paddingTop: 10, borderTop: '1px solid var(--border-default)', textAlign: 'center' }}>
              {[
                { label: 'Easy', s: easySolved, t: easyTotal, color: 'var(--diff-easy)' },
                { label: 'Med', s: medSolved, t: medTotal, color: 'var(--diff-medium)' },
                { label: 'Hard', s: hardSolved, t: hardTotal, color: 'var(--diff-hard)' },
              ].map(({ label, s, t, color }) => (
                <div key={label}>
                  <div style={{ fontSize: 13, fontWeight: 700, color }}>{s}/{t}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Topic chart */}
          <div style={CARD_STYLE}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Topics</div>
            <div style={{ height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicChartData} margin={{ top: 4, right: 4, left: -24, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={9} angle={-30} textAnchor="end" />
                  <YAxis stroke="var(--text-muted)" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                      borderRadius: 8, color: 'var(--text-primary)', fontSize: 12
                    }}
                  />
                  <Bar dataKey="Solved" stackId="a" fill="var(--color-info)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Remaining" stackId="a" fill="var(--border-default)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
