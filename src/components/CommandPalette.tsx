import React, { useState, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';
import { PLAN_DATA } from '../data/planData';
import { Search, X, ExternalLink, Command, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Problem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { progress, toggleProblem, setActiveWeek } = useProgress();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Flatten problems with week & day context
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#101018] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        
        {/* SEARCH INPUT */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-800 gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems by name, LC #, or topic (e.g. 'Two Sum', '53', 'DP')..."
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-mono"
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RESULTS LIST */}
        <div className="p-4 overflow-y-auto flex flex-col gap-2">
          {!query.trim() ? (
            <div className="py-6 text-center text-xs text-gray-500 font-mono flex flex-col items-center gap-2">
              <Command className="w-8 h-8 text-gray-700" />
              <span>Type to search across all 247 LeetCode problems & 20 topics</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 rounded bg-gray-900 border border-gray-800 text-[10px]">Ctrl + K to toggle</span>
                <span className="px-2 py-1 rounded bg-gray-900 border border-gray-800 text-[10px]">ESC to close</span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 font-mono">
              No matching problems found for "{query}".
            </div>
          ) : (
            results.slice(0, 30).map(({ problem, week, day }) => {
              const isChecked = !!progress[problem.id];
              return (
                <div
                  key={problem.id}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-green-950/20 border-green-500/30'
                      : 'bg-[#161622] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleProblem(problem.id)}
                      className="w-4 h-4 accent-green-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-white hover:text-orange-400 transition flex items-center gap-1"
                        >
                          <span>{problem.name}</span>
                          {problem.lcNumber > 0 && <span className="text-[10px] text-gray-500 font-mono">#{problem.lcNumber}</span>}
                          <ExternalLink className="w-3 h-3 text-gray-500" />
                        </a>
                      </div>
                      <p className="text-[11px] text-gray-400 italic line-clamp-1">{problem.note}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectWeek(week)}
                    className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-[10px] font-mono text-orange-400 shrink-0 flex items-center gap-1"
                  >
                    <span>W{week} D{day}</span>
                    <ArrowRight className="w-3 h-3" />
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
