import React, { useState, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { ChevronDown, ExternalLink, CheckCircle2, RefreshCw, Trophy, Coffee, Sparkles } from 'lucide-react';
import type { Problem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { TOP_150_LC_NUMBERS } from '../data/top150List';

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
    userProfile,
  } = useProgress();

  const SKILL_LABELS: Record<string, string> = {
    project: 'your personal project',
    research: 'your research paper or thesis',
    competitive: 'competitive programming',
    systemdesign: 'system design reading',
    openSource: 'open source contributions',
    other: 'rest and recharge',
  };
  const restActivity = SKILL_LABELS[userProfile?.secondarySkill] || 'your secondary focus';

  const [openDays, setOpenDays] = useState<{ [dayKey: string]: boolean }>({});

  // Auto-scroll to the current active week on first render
  useEffect(() => {
    const el = document.getElementById(`week-anchor-${activeWeek}`);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [activeWeek]);

  const toggleDayOpen = (dayKey: string) => {
    setOpenDays((prev) => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-6 flex flex-col gap-6">
      {PLAN_DATA.map((w) => {
        let totalWeekProblems = 0;
        let solvedWeekProblems = 0;

        w.days.forEach((d) => {
          d.problems.forEach((p) => {
            totalWeekProblems++;
            if (progress[p.id]) solvedWeekProblems++;
          });
        });

        const weekPct = totalWeekProblems > 0 ? Math.round((solvedWeekProblems / totalWeekProblems) * 100) : 100;
        const isCurrentWeekActive = activeWeek === w.week;

        return (
          <div
            key={w.week}
            id={`week-anchor-${w.week}`}
            className={`rounded-2xl border transition-all duration-300 ${
              isCurrentWeekActive
                ? 'bg-[#101018] border-orange-500/50 shadow-2xl shadow-orange-500/10'
                : 'bg-[#0c0c12] border-gray-800'
            }`}
          >
            {/* WEEK HEADER */}
            <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-gray-800 text-orange-400 border border-gray-700">
                  WEEK {w.week}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {w.title}
                  </h2>
                  <span className="text-xs text-gray-400 font-mono">Topic: {w.topic}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="font-mono text-xs text-gray-400">
                  {solvedWeekProblems} / {totalWeekProblems} Solved ({weekPct}%)
                </span>
                <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-green-400 transition-all"
                    style={{ width: `${weekPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* DAYS GRID */}
            <div className="p-4 flex flex-col gap-3">
              {w.days.map((d) => {
                const dayKey = `${w.week}-${d.day}`;
                const isOpen = openDays[dayKey] ?? (w.week === activeWeek && d.weekday === 'Mon');
                const complete = isDayComplete(w.week, d.day);

                // Filter problems inside day based on search query & dropdown filters
                const filteredProblems = d.problems.filter((p: Problem) => {
                  if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
                  if (statusFilter === 'top150' && (!TOP_150_LC_NUMBERS.has(p.lcNumber) || p.isReview)) return false;
                  if (statusFilter === 'solved' && !progress[p.id]) return false;
                  if (statusFilter === 'unsolved' && progress[p.id]) return false;
                  if (statusFilter === 'review' && !p.isReview) return false;
                  if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    const matchName = p.name.toLowerCase().includes(q);
                    const matchNote = p.note.toLowerCase().includes(q);
                    const matchLC = p.lcNumber.toString().includes(q);
                    return matchName || matchNote || matchLC;
                  }
                  return true;
                });

                if (searchQuery && filteredProblems.length === 0 && d.type !== 'rest') {
                  return null;
                }

                return (
                  <div
                    key={d.day}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      complete
                        ? 'bg-green-950/10 border-green-500/30'
                        : d.type === 'review'
                        ? 'bg-yellow-950/10 border-yellow-500/30'
                        : d.type === 'contest'
                        ? 'bg-blue-950/10 border-blue-500/30'
                        : d.type === 'rest'
                        ? 'bg-gray-900/30 border-gray-850 opacity-60'
                        : 'bg-[#14141f] border-gray-800/80 hover:border-gray-700'
                    }`}
                  >
                    {/* DAY HEADER */}
                    <div
                      onClick={() => toggleDayOpen(dayKey)}
                      className="px-4 py-3 flex items-center justify-between cursor-pointer select-none hover:bg-white/[0.02] transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-gray-400 min-w-[75px]">
                          Day {d.day} ({d.weekday})
                        </span>

                        <span className="text-sm font-semibold text-gray-200">
                          {d.topic}
                        </span>

                        {d.type === 'review' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            <RefreshCw className="w-3 h-3" /> Blind Review
                          </span>
                        )}

                        {d.type === 'contest' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            <Trophy className="w-3 h-3" /> Live Contest
                          </span>
                        )}

                        {d.type === 'rest' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                            <Coffee className="w-3 h-3" /> Rest Day
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {complete ? (
                          <span className="text-green-400 flex items-center gap-1 text-xs font-mono font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Completed
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs font-mono">
                            {d.problems.filter(p => progress[p.id]).length}/{d.problems.length}
                          </span>
                        )}

                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* DAY BODY WITH FRAMER MOTION ANIMATION */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 pb-4 pt-1 border-t border-gray-800/40 bg-black/20"
                        >
                          {d.type === 'rest' ? (
                            <div className="py-3 text-xs text-gray-400 font-medium italic flex items-center gap-2">
                              <Coffee className="w-4 h-4 text-orange-400" />
                              Rest day — time for {restActivity}. Zero DSA guilt today!
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2.5 mt-2">
                              {filteredProblems.map((p) => {
                                const isChecked = !!progress[p.id];
                                let diffBadgeClass = "bg-orange-500/20 text-orange-400 border-orange-500/30";
                                if (p.difficulty === 'Easy') diffBadgeClass = "bg-green-500/20 text-green-400 border-green-500/30";
                                if (p.difficulty === 'Hard') diffBadgeClass = "bg-red-500/20 text-red-400 border-red-500/30";

                                return (
                                  <div
                                    key={p.id}
                                    className={`p-3 rounded-xl border transition flex flex-col gap-1.5 ${
                                      isChecked
                                        ? 'bg-green-950/20 border-green-500/30'
                                        : 'bg-[#181824] border-gray-800 hover:border-gray-700'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => toggleProblem(p.id)}
                                          className="w-4 h-4 accent-green-500 rounded cursor-pointer"
                                        />
                                        <a
                                          href={p.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm font-semibold text-white hover:text-orange-400 transition flex items-center gap-1.5 group"
                                        >
                                          <span className={`transition-all duration-300 ${isChecked ? 'line-through text-gray-500' : ''}`}>{p.name}</span>
                                          {p.lcNumber > 0 && <span className="text-xs text-gray-500 font-mono">#{p.lcNumber}</span>}
                                          <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-orange-400 transition" />
                                        </a>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {p.isReview && (
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                            Blind Re-solve
                                          </span>
                                        )}
                                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${diffBadgeClass}`}>
                                          {p.difficulty}
                                        </span>
                                        {TOP_150_LC_NUMBERS.has(p.lcNumber) && !p.isReview && (
                                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                                            TOP 150
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <p className="text-xs text-gray-400 pl-7 italic">
                                      {p.note}
                                    </p>
                                  </div>
                                );
                              })}

                              <div className="flex justify-end mt-2 pt-2 border-t border-gray-800/40">
                                {complete ? (
                                  <span className="px-4 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-xs font-semibold text-green-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> All Done!
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => markDayComplete(w.week, d.day)}
                                    className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-green-500 hover:text-black border border-gray-700 text-xs font-semibold text-gray-200 transition flex items-center gap-1.5"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Mark Day Complete
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
