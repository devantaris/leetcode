import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA } from '../data/mergedPlanData';
import { TOP_150_LC_NUMBERS } from '../data/top150List';
import { Trophy } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

export const Top150Card: React.FC = () => {
  const { progress } = useProgress();

  // Gather all unique Top 150 problems in the plan (by lcNumber, skip reviews)
  const top150ProblemsMap = new Map<number, { id: string; difficulty: string }>();
  for (const week of MERGED_PLAN_DATA) {
    for (const day of week.days) {
      for (const p of day.problems) {
        if (TOP_150_LC_NUMBERS.has(p.lcNumber) && p.lcNumber !== 0 && !p.isReview) {
          if (!top150ProblemsMap.has(p.lcNumber)) {
            top150ProblemsMap.set(p.lcNumber, { id: p.id, difficulty: p.difficulty });
          }
        }
      }
    }
  }

  // Build a map: lcNumber → solved (check ALL problem IDs with that lcNumber)
  const solvedByLc = new Set<number>();
  for (const week of MERGED_PLAN_DATA) {
    for (const day of week.days) {
      for (const p of day.problems) {
        if (TOP_150_LC_NUMBERS.has(p.lcNumber) && p.lcNumber !== 0 && !p.isReview && progress[p.id]) {
          solvedByLc.add(p.lcNumber);
        }
      }
    }
  }

  const totalTop150 = top150ProblemsMap.size;
  const solvedTop150 = solvedByLc.size;
  const pct = Math.round((solvedTop150 / Math.max(1, totalTop150)) * 100);

  // Difficulty breakdown
  let easySolved = 0, easyTotal = 0;
  let medSolved = 0, medTotal = 0;
  let hardSolved = 0, hardTotal = 0;

  for (const [lcNum, info] of top150ProblemsMap) {
    const isSolved = solvedByLc.has(lcNum);
    if (info.difficulty === 'Easy') {
      easyTotal++;
      if (isSolved) easySolved++;
    } else if (info.difficulty === 'Medium') {
      medTotal++;
      if (isSolved) medSolved++;
    } else {
      hardTotal++;
      if (isSolved) hardSolved++;
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1220] via-[#101028] to-[#14102a] border border-indigo-500/30 p-6 shadow-2xl">
        {/* Background glow */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          {/* LEFT: Title + Progress */}
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
                LeetCode Top Interview 150
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-extrabold text-white">
                <AnimatedCounter value={solvedTop150} />
              </span>
              <span className="font-mono text-lg text-gray-400">/ {totalTop150}</span>
              <span className="text-xs font-mono text-indigo-400 ml-2">{pct}%</span>
            </div>

            {/* Main progress bar */}
            <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* RIGHT: Difficulty breakdown */}
          <div className="flex gap-4 sm:gap-6 shrink-0">
            <div className="text-center">
              <span className="text-green-400 font-mono font-bold text-lg block">
                {easySolved}<span className="text-gray-500 text-xs">/{easyTotal}</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono uppercase">Easy</span>
            </div>
            <div className="text-center">
              <span className="text-orange-400 font-mono font-bold text-lg block">
                {medSolved}<span className="text-gray-500 text-xs">/{medTotal}</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono uppercase">Medium</span>
            </div>
            <div className="text-center">
              <span className="text-red-400 font-mono font-bold text-lg block">
                {hardSolved}<span className="text-gray-500 text-xs">/{hardTotal}</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono uppercase">Hard</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
