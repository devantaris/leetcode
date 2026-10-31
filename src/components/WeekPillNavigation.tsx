import React, { useRef, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { Check } from 'lucide-react';

export const WeekPillNavigation: React.FC = () => {
  const { activeWeek, setActiveWeek, isDayComplete } = useProgress();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.getElementById(`pill-w-${activeWeek}`);
    if (el && scrollRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    const weekAnchor = document.getElementById(`week-anchor-${activeWeek}`);
    if (weekAnchor) {
      weekAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeWeek]);

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'var(--bg-app)',
      padding: '8px 0 12px',
      borderBottom: '1px solid var(--border-default)',
      marginBottom: 16
    }}>
      <div
        ref={scrollRef}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          overflowX: 'auto', paddingBottom: 4
        }}
      >
        {PLAN_DATA.map((w) => {
          const isActive = activeWeek === w.week;
          const isWeekComplete = w.days.every((d) => d.problems.length === 0 || isDayComplete(w.week, d.day));

          return (
            <button
              key={w.week}
              id={`pill-w-${w.week}`}
              onClick={() => setActiveWeek(w.week)}
              style={{
                padding: '5px 10px',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                border: `1px solid ${
                  isActive
                    ? 'var(--text-primary)'
                    : isWeekComplete
                    ? 'var(--color-success-border)'
                    : 'var(--border-default)'
                }`,
                background: isActive
                  ? 'var(--text-primary)'
                  : isWeekComplete
                  ? 'var(--color-success-bg)'
                  : 'var(--bg-card)',
                color: isActive
                  ? 'var(--text-inverse)'
                  : isWeekComplete
                  ? 'var(--color-success-text)'
                  : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all var(--transition-fast)'
              }}
            >
              <span>W{w.week}</span>
              {isWeekComplete ? (
                <Check size={11} />
              ) : (
                <span style={{ fontSize: 10, opacity: 0.7 }}>{w.topic.slice(0, 10)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
