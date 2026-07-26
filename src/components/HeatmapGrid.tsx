import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { useNavigate } from 'react-router-dom';

export const HeatmapGrid: React.FC = () => {
  const { isDayComplete, setActiveWeek, stats } = useProgress();
  const navigate = useNavigate();

  const handleWeekClick = (weekNum: number) => {
    setActiveWeek(weekNum);
    navigate('/curriculum');
  };

  return (
    <div className="bg-[#101018] border border-gray-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
            140-DAY CURRICULUM MATRIX
          </h3>
          <p className="text-xs text-gray-400">Click any week column to jump directly into its curriculum</p>
        </div>

        {/* LEGEND */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono flex-wrap">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-green-500 shadow-sm shadow-green-500/50"></span>
            <span>Done</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-yellow-500/40 border border-yellow-500"></span>
            <span>Review</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-500/40 border border-blue-500"></span>
            <span>Contest</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-gray-800"></span>
            <span>Pending</span>
          </div>
        </div>
      </div>

      {/* HEATMAP MATRIX */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-grid grid-cols-20 gap-2 min-w-[720px]">
          {PLAN_DATA.map((w) => {
            const isCurrentWeek = w.week === stats.currentWeek;
            return (
              <div
                key={w.week}
                onClick={() => handleWeekClick(w.week)}
                className={`flex flex-col gap-1.5 p-2 rounded-xl border cursor-pointer transition text-center group ${
                  isCurrentWeek
                    ? 'bg-orange-500/10 border-orange-500/50 shadow-lg shadow-orange-500/10'
                    : 'bg-gray-900/60 hover:bg-gray-800/80 border-gray-800 hover:border-gray-700'
                }`}
              >
                <span className={`text-[10px] font-mono font-bold group-hover:text-orange-400 ${isCurrentWeek ? 'text-orange-400' : 'text-gray-400'}`}>
                  W{w.week}
                </span>

                {w.days.map((d) => {
                  const complete = isDayComplete(w.week, d.day);
                  let bgClass = "bg-gray-800 border-gray-700/50";

                  if (complete) {
                    bgClass = "bg-green-500 border-green-400 shadow-sm shadow-green-500/50";
                  } else if (d.type === 'review') {
                    bgClass = "bg-yellow-500/20 border-yellow-500/50";
                  } else if (d.type === 'contest') {
                    bgClass = "bg-blue-500/20 border-blue-500/50";
                  } else if (d.type === 'rest') {
                    bgClass = "bg-gray-900 border-gray-850";
                  }

                  return (
                    <div
                      key={d.day}
                      title={`Day ${d.day} (${d.weekday}) - ${d.topic} (${complete ? 'Completed' : 'Pending'})`}
                      className={`w-full h-3.5 rounded border ${bgClass} transition-all hover:scale-110`}
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
