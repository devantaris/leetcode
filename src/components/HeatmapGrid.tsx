import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { CURRICULUM } from '../data/curriculumStats';
import { useNavigate } from 'react-router-dom';

export const HeatmapGrid: React.FC = () => {
  const { isDayComplete, setActiveWeek, stats } = useProgress();
  const navigate = useNavigate();

  const handleWeekClick = (weekNum: number) => {
    setActiveWeek(weekNum);
    navigate('/curriculum');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
            {CURRICULUM.totalDays}-Day Matrix
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Click any week to jump to curriculum
          </div>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { color: 'var(--color-success)', label: 'Done' },
            { color: 'var(--color-warning)', opacity: 0.4, label: 'Review' },
            { color: 'var(--color-info)', opacity: 0.4, label: 'Contest' },
            { color: 'var(--border-default)', label: 'Pending' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 10, height: 10, borderRadius: 2,
                background: color, flexShrink: 0
              }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div className="inline-grid grid-cols-20" style={{ gap: 6, minWidth: 680 }}>
          {PLAN_DATA.map((w) => {
            const isCurrentWeek = w.week === stats.currentWeek;
            return (
              <div
                key={w.week}
                onClick={() => handleWeekClick(w.week)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '6px 4px',
                  borderRadius: 6, cursor: 'pointer',
                  border: `1px solid ${isCurrentWeek ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
                  background: isCurrentWeek ? 'var(--bg-hover)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseOver={e => !isCurrentWeek && (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseOut={e => !isCurrentWeek && (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{
                  fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  color: isCurrentWeek ? 'var(--text-primary)' : 'var(--text-dimmed)',
                  letterSpacing: '0.02em'
                }}>
                  {w.week}
                </span>

                {w.days.map((d) => {
                  const complete = isDayComplete(w.week, d.day);
                  let bg = 'var(--bg-elevated)';
                  let border = 'var(--border-subtle)';

                  if (complete) {
                    bg = 'var(--color-success)';
                    border = 'var(--color-success)';
                  } else if (d.type === 'review') {
                    bg = 'rgba(217,119,6,0.25)';
                    border = 'var(--color-warning)';
                  } else if (d.type === 'contest') {
                    bg = 'rgba(37,99,235,0.25)';
                    border = 'var(--color-info)';
                  } else if (d.type === 'rest') {
                    bg = 'var(--bg-app)';
                  }

                  return (
                    <div
                      key={d.day}
                      title={`Day ${d.day} (${d.weekday}) — ${d.topic} — ${complete ? 'Done' : 'Pending'}`}
                      style={{
                        width: '100%', height: 11, borderRadius: 2,
                        background: bg, border: `1px solid ${border}`,
                        transition: 'transform var(--transition-fast)',
                      }}
                      onMouseOver={e => (e.currentTarget.style.transform = 'scaleX(1.1)')}
                      onMouseOut={e => (e.currentTarget.style.transform = 'scaleX(1)')}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
