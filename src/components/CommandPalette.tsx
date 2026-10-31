import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { Search, X, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Problem } from '../types';
import { CURRICULUM } from '../data/curriculumStats';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { progress, toggleProblem, setActiveWeek } = useProgress();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const results: { problem: Problem; week: number; day: number; topic: string }[] = [];
  if (query.trim()) {
    const q = query.toLowerCase();
    PLAN_DATA.forEach((w) => {
      w.days.forEach((d) => {
        d.problems.forEach((p) => {
          if (
            p.name.toLowerCase().includes(q) ||
            p.note.toLowerCase().includes(q) ||
            p.lcNumber.toString().includes(q) ||
            w.topic.toLowerCase().includes(q)
          ) {
            results.push({ problem: p, week: w.week, day: d.day, topic: d.topic });
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

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 110,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '70px 16px 16px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 580,
          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '70vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderBottom: '1px solid var(--border-default)'
        }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a problem name, LeetCode number, or topic..."
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: 'none', color: 'var(--text-primary)', fontSize: 13
            }}
            autoFocus
          />
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 4, display: 'flex'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Results */}
        <div style={{ padding: '8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {!query.trim() ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 4 }}>
                Search across {CURRICULUM.totalProblems} problems
              </div>
              <div>Press <kbd style={{ padding: '2px 5px', borderRadius: 4, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>ESC</kbd> to dismiss</div>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              No problems found matching "{query}"
            </div>
          ) : (
            results.slice(0, 25).map(({ problem, week, day }) => {
              const isChecked = !!progress[problem.id];
              const diffColor = problem.difficulty === 'Easy'
                ? 'var(--color-success-text)'
                : problem.difficulty === 'Hard'
                ? 'var(--color-danger-text)'
                : 'var(--color-warning-text)';

              return (
                <div
                  key={problem.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', borderRadius: 'var(--radius-md)',
                    background: isChecked ? 'var(--color-success-bg)' : 'transparent',
                    border: `1px solid ${isChecked ? 'var(--color-success-border)' : 'var(--border-subtle)'}`,
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                    <div
                      className={`checkbox-done ${isChecked ? 'checked' : ''}`}
                      onClick={() => toggleProblem(problem.id)}
                    >
                      {isChecked && <Check size={11} style={{ color: '#fff' }} />}
                    </div>

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

                    <span style={{ fontSize: 10, fontWeight: 600, color: diffColor }}>
                      {problem.difficulty}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectWeek(week)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 11, color: 'var(--text-muted)', padding: '2px 6px',
                      borderRadius: 4
                    }}
                  >
                    W{week}D{day} <ArrowRight size={10} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
