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
      <div style={{ overflowX: 'auto', paddingBottom: 6 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${PLAN_DATA.length}, minmax(28px, 1fr))`, gap: 6, minWidth: 780 }}>
          {PLAN_DATA.map((w) => {
            const isCurrentWeek = w.week === stats.currentWeek;
            return (
              <div
                key={w.week}
                onClick={() => handleWeekClick(w.week)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '8px 4px',
                  borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${isCurrentWeek ? 'rgba(99, 102, 241, 0.5)' : 'var(--border-subtle)'}`,
                  background: isCurrentWeek ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-elevated)',
                  boxShadow: isCurrentWeek ? '0 0 12px rgba(99, 102, 241, 0.2)' : 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseOver={e => !isCurrentWeek && (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseOut={e => !isCurrentWeek && (e.currentTarget.style.background = 'var(--bg-elevated)')}
              >
                <span style={{
                  fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  color: isCurrentWeek ? '#818cf8' : 'var(--text-muted)',
                  letterSpacing: '0.02em'
                }}>
                  W{w.week}
                </span>

                {w.days.map((d) => {
                  const complete = isDayComplete(w.week, d.day);
                  let bg = 'rgba(255, 255, 255, 0.04)';
                  let border = 'var(--border-subtle)';
                  let shadow = 'none';

                  if (complete) {
                    bg = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    border = '#10b981';
                    shadow = '0 0 6px rgba(16, 185, 129, 0.35)';
                  } else if (d.type === 'review') {
                    bg = 'rgba(245, 158, 11, 0.2)';
                    border = 'rgba(245, 158, 11, 0.4)';
                  } else if (d.type === 'contest') {
                    bg = 'rgba(99, 102, 241, 0.2)';
                    border = 'rgba(99, 102, 241, 0.4)';
                  } else if (d.type === 'rest') {
                    bg = 'rgba(255, 255, 255, 0.02)';
                  }

                  return (
                    <div
                      key={d.day}
                      title={`Day ${d.day} (${d.weekday}) — ${d.topic} — ${complete ? 'Done' : 'Pending'}`}
                      style={{
                        width: '100%', height: 12, borderRadius: 3,
                        background: bg, border: `1px solid ${border}`,
                        boxShadow: shadow,
                        transition: 'transform var(--transition-fast)',
                      }}
                      onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                      onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
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
