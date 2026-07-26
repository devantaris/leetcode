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

    // Scroll main curriculum container to active week anchor
    const weekAnchor = document.getElementById(`week-anchor-${activeWeek}`);
    if (weekAnchor) {
      weekAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeWeek]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sticky top-[65px] z-40 bg-[#060609]/95 backdrop-blur-md py-3 border-b border-gray-800/60">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
      >
        {PLAN_DATA.map((w) => {
          const isActive = activeWeek === w.week;
          const isWeekComplete = w.days.every((d) => d.problems.length === 0 || isDayComplete(w.week, d.day));

          return (
            <button
              key={w.week}
              id={`pill-w-${w.week}`}
              onClick={() => setActiveWeek(w.week)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold shrink-0 border transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white border-orange-400 shadow-lg shadow-orange-500/25 scale-105'
                  : isWeekComplete
                  ? 'bg-green-950/20 text-green-400 border-green-500/30 hover:bg-green-950/40'
                  : 'bg-[#101018] text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
              }`}
            >
              <span>W{w.week}</span>
              {isWeekComplete ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <span className="text-[10px] text-gray-500 font-normal">({w.topic})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
