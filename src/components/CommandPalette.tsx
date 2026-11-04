import React, { useState, useEffect, useRef } from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { Search, X, ArrowRight, Check, Compass, BarChart2, Award, Terminal, ExternalLink, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Problem } from '../types';
import { CURRICULUM } from '../data/curriculumStats';
import { sounds } from '../utils/audio';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal?: (modal: 'rules' | 'strategy' | 'reset' | 'backup' | 'resume' | 'profile' | 'placements' | 'auth') => void;
}

interface CommandAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onOpenModal }) => {
  const { progress, toggleProblem, setActiveWeek } = useProgress();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Static quick actions
  const defaultActions: CommandAction[] = [
    {
      id: 'cmd-today',
      title: "Today's Operational Missions",
      subtitle: 'View active target problems, daily streak, and timer',
      icon: <Compass size={15} style={{ color: '#818cf8' }} />,
      action: () => { navigate('/dashboard'); onClose(); }
    },
    {
      id: 'cmd-curriculum',
      title: 'Syllabus & Curriculum',
      subtitle: `Browse all ${CURRICULUM.totalProblems} problems across 25 weeks`,
      icon: <span style={{ fontSize: 13 }}>📚</span>,
      action: () => { navigate('/curriculum'); onClose(); }
    },
    {
      id: 'cmd-analytics',
      title: 'Analytics & Readiness Metrics',
      subtitle: 'Inspect weekly velocity, time investment, and confidence curves',
      icon: <BarChart2 size={15} style={{ color: '#10b981' }} />,
      action: () => { navigate('/analytics'); onClose(); }
    },
    {
      id: 'cmd-leaderboard',
      title: 'Leaderboard & Private Cohorts',
      subtitle: 'Compare consistency against global peers and study groups',
      icon: <Award size={15} style={{ color: '#f59e0b' }} />,
      action: () => { navigate('/leaderboard'); onClose(); }
    },
    {
      id: 'cmd-terminal-os',
      title: 'Launch Retro Terminal OS (GrindOS 95)',
      subtitle: 'Switch to keyboard-driven terminal desktop with chiptune audio',
      icon: <Terminal size={15} style={{ color: '#3ddc84' }} />,
      action: () => { navigate('/os'); onClose(); },
      badge: 'RETRO'
    },
  ];

  if (onOpenModal) {
    defaultActions.push({
      id: 'cmd-auth',
      title: 'Cloud Authentication & Sync',
      subtitle: 'Sign in, register, or link Supabase database',
      icon: <Cloud size={15} style={{ color: '#10b981' }} />,
      action: () => { onOpenModal('auth'); onClose(); }
    });
    defaultActions.push({
      id: 'cmd-placements',
      title: 'Placement Pipeline Tracker',
      subtitle: 'Manage applications, technical screens, and offers',
      icon: <span style={{ fontSize: 13 }}>💼</span>,
      action: () => { onOpenModal('placements'); onClose(); }
    });
  }

  // Filter commands by query
  const q = query.trim().toLowerCase();
  const filteredActions = q
    ? defaultActions.filter(a => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q))
    : defaultActions;

  // Search problems
  const matchedProblems: { problem: Problem; week: number; day: number; topic: string }[] = [];
  if (q) {
    PLAN_DATA.forEach((w) => {
      w.days.forEach((d) => {
        d.problems.forEach((p) => {
          if (
            p.name.toLowerCase().includes(q) ||
            p.note.toLowerCase().includes(q) ||
            p.lcNumber.toString().includes(q) ||
            w.topic.toLowerCase().includes(q)
          ) {
            matchedProblems.push({ problem: p, week: w.week, day: d.day, topic: d.topic });
          }
        });
      });
    });
  }

  const handleSelectWeek = (weekNum: number) => {
    setActiveWeek(weekNum);
    navigate('/curriculum');
    onClose();
  };

  const handleToggle = (id: string) => {
    sounds.playTickSound();
    toggleProblem(id);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 110,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '70px 16px 16px', background: 'rgba(4, 5, 10, 0.75)', backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 620,
          background: 'var(--bg-card)', border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.1)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '75vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-elevated)'
        }}>
          <Search size={18} style={{ color: 'var(--text-accent)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search problems (e.g. 'LRU', '15', 'DP') or commands..."
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: 'none', color: 'var(--text-primary)', fontSize: 14,
              fontWeight: 500
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 4, display: 'flex'
              }}
            >
              <X size={15} />
            </button>
          )}
          <kbd style={{
            fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 6px',
            borderRadius: 4, background: 'var(--bg-app)', border: '1px solid var(--border-default)',
            color: 'var(--text-muted)'
          }}>
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div style={{ padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Commands Section */}
          {filteredActions.length > 0 && (
            <div>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                color: 'var(--text-muted)', padding: '4px 8px 6px', textTransform: 'uppercase'
              }}>
                Commands &amp; Navigation
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {filteredActions.map((cmd) => (
                  <div
                    key={cmd.id}
                    onClick={() => { sounds.playTickSound(); cmd.action(); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', borderRadius: 'var(--radius-md)',
                      background: 'transparent', cursor: 'pointer',
                      border: '1px solid transparent',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-elevated)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {cmd.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {cmd.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {cmd.subtitle}
                        </div>
                      </div>
                    </div>
                    {cmd.badge && (
                      <span className="badge-mono" style={{ color: '#3ddc84', borderColor: 'rgba(61, 220, 132, 0.4)' }}>
                        {cmd.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Problems */}
          {q && (
            <div>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                color: 'var(--text-muted)', padding: '8px 8px 6px', textTransform: 'uppercase',
                display: 'flex', justifyContent: 'space-between'
              }}>
                <span>Problems Matching "{query}"</span>
                <span>{matchedProblems.length} results</span>
              </div>

              {matchedProblems.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                  No algorithmic problems found matching "{query}"
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {matchedProblems.slice(0, 30).map(({ problem, week, day }) => {
                    const isChecked = !!progress[problem.id];
                    const diffClass = problem.difficulty === 'Easy'
                      ? 'diff-easy'
                      : problem.difficulty === 'Hard'
                      ? 'diff-hard'
                      : 'diff-medium';

                    return (
                      <div
                        key={problem.id}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: 'var(--radius-md)',
                          background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
                          border: `1px solid ${isChecked ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)'}`,
                          gap: 12
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                          <div
                            className={`checkbox-done ${isChecked ? 'checked' : ''}`}
                            onClick={() => handleToggle(problem.id)}
                            style={{ cursor: 'pointer' }}
                            title={isChecked ? 'Mark unsolved' : 'Mark solved'}
                          >
                            {isChecked && <Check size={11} style={{ color: '#fff' }} />}
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
                              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                                #{problem.lcNumber}
                              </span>
                              <a
                                href={problem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: 13, fontWeight: 500,
                                  color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                                  textDecoration: isChecked ? 'line-through' : 'none',
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                }}
                              >
                                {problem.name}
                              </a>
                              <a
                                href={problem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--text-muted)', display: 'inline-flex' }}
                                title="Open on LeetCode"
                              >
                                <ExternalLink size={11} />
                              </a>
                            </div>
                            {problem.note && (
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {problem.note}
                              </div>
                            )}
                          </div>

                          <span className={diffClass} style={{ fontSize: 10, padding: '1px 6px', flexShrink: 0 }}>
                            {problem.difficulty}
                          </span>
                        </div>

                        <button
                          onClick={() => handleSelectWeek(week)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                            cursor: 'pointer', fontSize: 11, color: 'var(--text-secondary)',
                            padding: '3px 7px', borderRadius: 4, flexShrink: 0
                          }}
                          title={`Navigate to Week ${week}, Day ${day}`}
                        >
                          W{week}D{day} <ArrowRight size={10} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div style={{
          padding: '8px 16px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)'
        }}>
          <span>{CURRICULUM.totalProblems} problems indexed</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <span>Type to filter</span>
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
