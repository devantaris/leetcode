import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { ExternalLink, Check, ChevronDown, ChevronUp, AlertTriangle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CatchUpQueueCard: React.FC = () => {
  const { catchUpQueue, progress, toggleProblem, setActiveWeek } = useProgress();
  const [expanded, setExpanded] = useState(false);

  if (!catchUpQueue || catchUpQueue.length === 0) return null;

  const totalMissed = catchUpQueue.reduce((s, item) => s + (item.totalCount - item.solvedCount), 0);
  const visibleItems = expanded ? catchUpQueue : catchUpQueue.slice(0, 3);

  return (
    <div
      className="modern-card"
      style={{
        border: '1px solid var(--color-warning-border)',
        background: 'var(--color-warning-bg)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} style={{ color: 'var(--color-warning-text)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-warning-text)', letterSpacing: '-0.01em' }}>
              Catch-Up Queue
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
              {totalMissed} unsolved problem{totalMissed !== 1 ? 's' : ''} across {catchUpQueue.length} missed day{catchUpQueue.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <Link
          to="/curriculum"
          onClick={() => setActiveWeek(catchUpQueue[0]?.week || 1)}
          className="btn btn-default"
          style={{ fontSize: 11, padding: '4px 10px' }}
        >
          <BookOpen size={11} /> View All
        </Link>
      </div>

      {/* Problem rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {visibleItems.map((item) =>
          item.problems
            .filter(p => !progress[p.id])
            .slice(0, expanded ? undefined : 2)
            .map(p => {
              const isChecked = !!progress[p.id];
              const diffColor =
                p.difficulty === 'Easy' ? 'var(--color-success-text)' :
                p.difficulty === 'Hard' ? 'var(--color-danger-text)' :
                'var(--color-warning-text)';
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onClick={() => toggleProblem(p.id)}
                >
                  <div className={`checkbox-minimal ${isChecked ? 'checked' : ''}`} style={{ flexShrink: 0 }}>
                    {isChecked && <Check size={10} strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 500,
                      color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: isChecked ? 'line-through' : 'none',
                    }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6, fontFamily: 'var(--font-mono)' }}>
                      Day {item.day} · {item.topic}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: diffColor, fontWeight: 600 }}>{p.difficulty}</span>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Expand / collapse */}
      {catchUpQueue.length > 3 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="btn btn-ghost"
          style={{ fontSize: 11, padding: '4px 0', alignSelf: 'flex-start', color: 'var(--color-warning-text)' }}
        >
          {expanded
            ? <><ChevronUp size={12} /> Show less</>
            : <><ChevronDown size={12} /> Show {catchUpQueue.length - 3} more missed days</>
          }
        </button>
      )}
    </div>
  );
};
