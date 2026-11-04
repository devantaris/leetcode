import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { ChevronDown, ExternalLink, Check, Coffee } from 'lucide-react';
import type { Problem } from '../types';
import { TOP_150_LC_NUMBERS } from '../data/top150List';
import { COMPANY_LABELS } from '../data/companyMappings';

export const WeekAccordion: React.FC = () => {
  const {
    progress,
    toggleProblem,
    markDayComplete,
    isDayComplete,
    activeWeek,
    searchQuery,
    selectedDifficulty,
    statusFilter,
    companyFilter,
  } = useProgress();

  const [openWeeks, setOpenWeeks] = useState<{ [weekNum: number]: boolean }>({
    [activeWeek]: true,
  });

  const toggleWeek = (weekNum: number) => {
    setOpenWeeks(prev => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {PLAN_DATA.map((w) => {
        let totalProblems = 0;
        let solvedProblems = 0;

        w.days.forEach((d) => {
          d.problems.forEach((p) => {
            totalProblems++;
            if (progress[p.id]) solvedProblems++;
          });
        });

        const isWeekComplete = totalProblems > 0 && solvedProblems === totalProblems;
        const isOpen = openWeeks[w.week] ?? (w.week === activeWeek || searchQuery.trim().length > 0);

        return (
          <div
            key={w.week}
            id={`week-anchor-${w.week}`}
            style={{
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              overflow: 'hidden'
            }}
          >
            {/* Week Row Header */}
            <div
              onClick={() => toggleWeek(w.week)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', cursor: 'pointer', userSelect: 'none',
                background: isOpen ? 'var(--bg-elevated)' : 'transparent',
                transition: 'background var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="badge-mono" style={{
                  color: isWeekComplete ? 'var(--color-success-text)' : 'var(--text-primary)',
                  borderColor: isWeekComplete ? 'var(--color-success-border)' : 'var(--border-default)'
                }}>
                  W{w.week}
                </span>

                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {w.topic}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {solvedProblems} / {totalProblems}
                </span>

                <ChevronDown
                  size={14}
                  style={{
                    color: 'var(--text-muted)',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform var(--transition-fast)'
                  }}
                />
              </div>
            </div>

            {/* Week Content */}
            {isOpen && (
              <div style={{ borderTop: '1px solid var(--border-default)' }}>
                {w.days.map((d) => {
                  const complete = isDayComplete(w.week, d.day);

                  const filteredProblems = d.problems.filter((p: Problem) => {
                    if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
                    if (statusFilter === 'top150' && (!TOP_150_LC_NUMBERS.has(p.lcNumber) || p.isReview)) return false;
                    if (statusFilter === 'solved' && !progress[p.id]) return false;
                    if (statusFilter === 'unsolved' && progress[p.id]) return false;
                    if (companyFilter !== 'all' && (!p.companyTags || !p.companyTags.includes(companyFilter))) return false;
                    if (searchQuery.trim()) {
                      const q = searchQuery.toLowerCase();
                      return (
                        p.name.toLowerCase().includes(q) ||
                        p.note.toLowerCase().includes(q) ||
                        p.lcNumber.toString().includes(q) ||
                        d.topic.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  });

                  if (searchQuery.trim() && filteredProblems.length === 0 && d.type !== 'rest') {
                    return null;
                  }

                  return (
                    <div
                      key={d.day}
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        background: complete ? 'var(--color-success-bg)' : 'transparent'
                      }}
                    >
                      {/* Day summary line */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: d.type === 'rest' ? 0 : 8, fontSize: 11
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 600 }}>
                            D{d.day} · {d.weekday}
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {d.topic}
                          </span>
                          {d.type === 'rest' && (
                            <span className="badge-mono">Rest</span>
                          )}
                          {d.type === 'review' && (
                            <span className="badge-mono" style={{ color: 'var(--color-warning-text)' }}>Review</span>
                          )}
                        </div>

                        {!complete && d.type !== 'rest' && (
                          <button
                            onClick={() => markDayComplete(w.week, d.day)}
                            className="btn btn-ghost"
                            style={{ fontSize: 11, padding: '2px 6px', color: 'var(--text-muted)' }}
                          >
                            Mark Done
                          </button>
                        )}
                        {complete && (
                          <span style={{ color: 'var(--color-success-text)', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Check size={11} /> Done
                          </span>
                        )}
                      </div>

                      {/* Day Problems */}
                      {d.type === 'rest' ? (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, paddingTop: 4 }}>
                          <Coffee size={12} /> Scheduled recovery day
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {filteredProblems.map((p) => {
                            const isChecked = !!progress[p.id];
                            const diffClass = p.difficulty === 'Easy'
                              ? 'diff-easy'
                              : p.difficulty === 'Hard'
                              ? 'diff-hard'
                              : 'diff-medium';

                            return (
                              <div
                                key={p.id}
                                onClick={() => toggleProblem(p.id)}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                  padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                                  background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-elevated)',
                                  border: `1px solid ${isChecked ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)'}`,
                                  cursor: 'pointer', gap: 8, transition: 'all var(--transition-fast)'
                                }}
                                onMouseOver={(e) => {
                                  if (!isChecked) e.currentTarget.style.background = 'var(--bg-hover)';
                                }}
                                onMouseOut={(e) => {
                                  if (!isChecked) e.currentTarget.style.background = 'var(--bg-elevated)';
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                                  <div className={`checkbox-minimal ${isChecked ? 'checked' : ''}`}>
                                    {isChecked && <Check size={11} strokeWidth={3} />}
                                  </div>

                                  <a
                                    href={p.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      fontSize: 12, fontWeight: 500,
                                      color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                                      textDecoration: isChecked ? 'line-through' : 'none',
                                      display: 'inline-flex', alignItems: 'center', gap: 4,
                                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {p.name}
                                    <ExternalLink size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                  </a>

                                  {p.lcNumber > 0 && (
                                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                                      #{p.lcNumber}
                                    </span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                  <span className={diffClass}>
                                    {p.difficulty}
                                  </span>

                                  {TOP_150_LC_NUMBERS.has(p.lcNumber) && !p.isReview && (
                                    <span className="badge-top150">
                                      Top 150
                                    </span>
                                  )}

                                  {p.companyTags?.slice(0, 2).map((tag) => {
                                    const meta = COMPANY_LABELS[tag];
                                    return meta ? (
                                      <span key={tag} className="badge-company">
                                        {meta.badge}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
