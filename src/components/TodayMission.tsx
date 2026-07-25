import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { PLAN_DATA } from '../data/planData';
import { Sparkles, ExternalLink, CheckCircle2, Coffee, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TodayMission: React.FC = () => {
  const { stats, progress, toggleProblem, markDayComplete, isDayComplete, setActiveWeek } = useProgress();

  // Determine greeting based on local time
  const hour = new Date().getHours();
  let greeting = "Good Morning";
  if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  if (hour >= 17) greeting = "Good Evening";

  // Find current week and day plan
  const currentWeekPlan = PLAN_DATA.find((w) => w.week === stats.currentWeek) || PLAN_DATA[0];
  const todayDayPlan = currentWeekPlan.days.find((d) => d.day === stats.currentDay) || currentWeekPlan.days[0];
  const isComplete = isDayComplete(currentWeekPlan.week, todayDayPlan.day);

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-[#12121e] via-[#101018] to-[#18121f] border border-orange-500/30 p-6 shadow-2xl relative overflow-hidden">
      {/* BACKGROUND GLOW ACCENT */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* HEADER & TOPIC INFO */}
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
              WEEK {currentWeekPlan.week} • DAY {todayDayPlan.day} ({todayDayPlan.weekday})
            </span>
            {isComplete && (
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> MISSION ACCOMPLISHED
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{greeting}, Devansh</span>
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </h2>

          <p className="text-sm text-gray-300 font-medium leading-relaxed">
            Today's Target: <strong className="text-white">{todayDayPlan.topic}</strong>. Complete these 3 curated problems to maintain your <strong className="text-orange-400">{stats.streak}-day streak</strong>!
          </p>
        </div>

        {/* QUICK ACTION BUTTON */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/curriculum"
            onClick={() => setActiveWeek(currentWeekPlan.week)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition flex items-center gap-2"
          >
            <span>Full Curriculum</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* TODAY'S PROBLEM CARDS */}
      <div className="mt-6 pt-5 border-t border-gray-800/80">
        {todayDayPlan.type === 'rest' ? (
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-300 flex items-center gap-3">
            <Coffee className="w-5 h-5 text-orange-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Sunday Rest Day & Academic Sprint</h4>
              <p className="text-gray-400">Reserved for DIP Research Paper (Medical/Agriculture Image Encryption) or SkillSync/Biome project work. Zero DSA guilt today!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {todayDayPlan.problems.map((p) => {
              const isChecked = !!progress[p.id];
              let badgeColor = "bg-orange-500/20 text-orange-400 border-orange-500/30";
              if (p.difficulty === 'Easy') badgeColor = "bg-green-500/20 text-green-400 border-green-500/30";
              if (p.difficulty === 'Hard') badgeColor = "bg-red-500/20 text-red-400 border-red-500/30";

              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isChecked
                      ? 'bg-green-950/20 border-green-500/40'
                      : 'bg-[#141420] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleProblem(p.id)}
                        className="w-4 h-4 accent-green-500 rounded cursor-pointer shrink-0"
                      />
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-white hover:text-orange-400 transition flex items-center gap-1 group line-clamp-1"
                      >
                        <span>{p.name}</span>
                        <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-orange-400 shrink-0" />
                      </a>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${badgeColor}`}>
                      {p.difficulty}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 italic line-clamp-2 pl-6">
                    {p.note}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* MARK DAY COMPLETE BUTTON */}
        {todayDayPlan.type !== 'rest' && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => markDayComplete(currentWeekPlan.week, todayDayPlan.day)}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-green-500 hover:text-black border border-gray-700 text-xs font-bold text-gray-200 transition flex items-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Mark Today Complete
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
