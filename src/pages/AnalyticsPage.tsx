import React, { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid } from 'recharts';
import { CURRICULUM } from '../data/curriculumStats';
import { TrendingUp, Zap, Target, Award, Calendar } from 'lucide-react';

const CARD_STYLE: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-lg)',
  padding: '20px',
  boxShadow: 'var(--shadow-sm)',
};

export const AnalyticsPage: React.FC = () => {
  const { stats, progress, dailySolveLog } = useProgress();

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
          if (p.difficulty === 'Easy') {
            easyTotal++;
            if (progress[p.id]) easySolved++;
          } else if (p.difficulty === 'Medium') {
            medTotal++;
            if (progress[p.id]) medSolved++;
          } else if (p.difficulty === 'Hard') {
            hardTotal++;
            if (progress[p.id]) hardSolved++;
          }
          if (progress[p.id]) topicDataMap[w.topic].solved++;
        });
      });
    });
    return { easySolved, easyTotal, medSolved, medTotal, hardSolved, hardTotal, topicDataMap };
  }, [progress]);

  const topicChartData = useMemo(() => {
    return Object.keys(topicDataMap).map((topic) => ({
      name: topic.length > 14 ? topic.substring(0, 12) + '..' : topic,
      Solved: topicDataMap[topic].solved,
      Remaining: topicDataMap[topic].total - topicDataMap[topic].solved
    }));
  }, [topicDataMap]);

  const weekTrajectoryData = useMemo(() => {
    return PLAN_DATA.map((w) => {
      let weekTotal = 0;
      let weekSolved = 0;
      w.days.forEach((d) => {
        d.problems.forEach((p) => {
          weekTotal++;
          if (progress[p.id]) weekSolved++;
        });
      });
      return {
        week: `W${w.week}`,
        Solved: weekSolved,
        Target: weekTotal
      };
    });
  }, [progress]);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{
            fontSize: 24, fontWeight: 800, color: 'var(--text-primary)',
            letterSpacing: '-0.02em', margin: '0 0 4px'
          }}>
            Analytics & Velocity
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Solve speed, category completion ratios, and historical consistency.
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', background: 'var(--bg-card)',
          border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
          fontSize: 12, fontFamily: 'var(--font-mono)', boxShadow: 'var(--shadow-sm)'
        }}>
          <Calendar size={14} style={{ color: 'var(--text-accent)' }} />
          <span style={{ color: 'var(--text-muted)' }}>Projected Finish:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{stats.projectedCompletionDate}</span>
        </div>
      </div>

      {/* Metric summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div style={CARD_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="section-label">Solve Velocity</span>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={13} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {((stats.solvedCount / Math.max(1, stats.currentDay)) * 7).toFixed(1)}
            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}> / wk</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Problems solved per 7 days
          </div>
        </div>

        <div style={CARD_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="section-label">Pace Status</span>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: stats.isOnTrack ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: stats.isOnTrack ? '#34d399' : '#fbbf24',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <TrendingUp size={13} />
            </div>
          </div>
          <div style={{
            color: stats.isOnTrack ? 'var(--color-success-text)' : 'var(--color-warning-text)',
            fontSize: 22, fontWeight: 800, lineHeight: 1
          }}>
            {stats.isOnTrack ? 'On Schedule' : 'Behind Pace'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Target: ~{CURRICULUM.dailyTarget} problems / day
          </div>
        </div>

        <div style={CARD_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="section-label">Easy Ratio</span>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'rgba(16, 185, 129, 0.15)', color: '#34d399',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Award size={13} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--diff-easy)', lineHeight: 1 }}>
            {Math.round((easySolved / (easyTotal || 1)) * 100)}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            {easySolved} of {easyTotal} problems
          </div>
        </div>

        <div style={CARD_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="section-label">Med &amp; Hard Ratio</span>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Target size={13} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--diff-medium)', lineHeight: 1 }}>
            {Math.round(((medSolved + hardSolved) / ((medTotal + hardTotal) || 1)) * 100)}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            {medSolved + hardSolved} of {medTotal + hardTotal} problems
          </div>
        </div>
      </div>

      {/* Charts row 1: Weekly trajectory & daily velocity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        {/* Trajectory */}
        <div style={CARD_STYLE}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              {CURRICULUM.totalWeeks}-Week Completion Trajectory
            </span>
            <span className="section-label">Target vs Solved</span>
          </div>

          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekTrajectoryData} margin={{ top: 5, right: 10, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                    borderRadius: 8, color: 'var(--text-primary)', fontSize: 12,
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <Line type="monotone" dataKey="Target" stroke="rgba(255, 255, 255, 0.2)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="Solved" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 3, fill: '#818cf8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Velocity */}
        <div style={CARD_STYLE}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Recent Solves Velocity
            </span>
            <span className="section-label">Last 14 days</span>
          </div>

          {dailySolveLog.length === 0 ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              No solves logged yet.
            </div>
          ) : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...dailySolveLog].reverse().slice(-14).map((g) => ({
                    date: g.dateStr.slice(5),
                    Solved: g.items.length,
                  }))}
                  margin={{ top: 5, right: 10, left: -24, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                      borderRadius: 8, color: 'var(--text-primary)', fontSize: 12,
                      boxShadow: 'var(--shadow-md)'
                    }}
                  />
                  <Bar dataKey="Solved" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Topic breakdown */}
      <div style={CARD_STYLE}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Topic Mastery Distribution
          </span>
          <span className="section-label">{CURRICULUM.totalTopics} Categories</span>
        </div>

        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicChartData} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} angle={-30} textAnchor="end" />
              <YAxis stroke="var(--text-muted)" fontSize={10} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                  borderRadius: 8, color: 'var(--text-primary)', fontSize: 12,
                  boxShadow: 'var(--shadow-md)'
                }}
              />
              <Bar dataKey="Solved" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Remaining" stackId="a" fill="rgba(255, 255, 255, 0.08)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Date-wise solve history */}
      <div style={CARD_STYLE}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Activity History
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Log of solved problems by date and time
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-warning">🔥 {stats.streak}d streak</span>
            <span className="badge badge-neutral">{dailySolveLog.length} active days</span>
          </div>
        </div>

        {dailySolveLog.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            No problem solves logged yet. Mark problems solved to begin recording your timeline.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dailySolveLog.map((group) => (
              <div
                key={group.dateStr}
                style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)', padding: '10px 12px'
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {group.displayDate}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {group.items.length} {group.items.length === 1 ? 'problem' : 'problems'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 6 }}>
                  {group.items.map((item) => {
                    const diffColor = item.difficulty === 'Easy'
                      ? 'var(--color-success-text)'
                      : item.difficulty === 'Hard'
                      ? 'var(--color-danger-text)'
                      : 'var(--color-warning-text)';

                    return (
                      <div
                        key={`${group.dateStr}-${item.problemId}`}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '6px 8px', background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                          fontSize: 12
                        }}
                      >
                        <div style={{ minWidth: 0, paddingRight: 6 }}>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: 'var(--text-primary)', textDecoration: 'none',
                              fontWeight: 500, display: 'block', overflow: 'hidden',
                              textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}
                          >
                            {item.name}
                          </a>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            {item.timeFormatted}
                          </div>
                        </div>

                        <span style={{ fontSize: 10, fontWeight: 600, color: diffColor, flexShrink: 0 }}>
                          {item.difficulty}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
