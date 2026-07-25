import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { CheckCircle2, Flame, Clock, TrendingUp, Target, Skull } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { PLAN_DATA } from '../data/planData';
import { AnimatedCounter } from './AnimatedCounter';

export const StatsAnalyticsDashboard: React.FC = () => {
  const { stats, progress } = useProgress();

  // Difficulty breakdown data for Pie chart
  let easySolved = 0, easyTotal = 0;
  let medSolved = 0, medTotal = 0;
  let hardSolved = 0, hardTotal = 0;

  // Topic breakdown data for Bar chart
  const topicDataMap: { [topic: string]: { total: number; solved: number } } = {};

  PLAN_DATA.forEach((w) => {
    if (!topicDataMap[w.topic]) {
      topicDataMap[w.topic] = { total: 0, solved: 0 };
    }

    w.days.forEach((d) => {
      d.problems.forEach((p) => {
        topicDataMap[w.topic].total++;
        if (p.difficulty === 'Easy') {
          easyTotal++;
          if (progress[p.id]) easySolved++;
        } else if (p.difficulty === 'Medium') {
          medTotal++;
          if (progress[p.id]) medSolved++;
        } else if (p.difficulty === 'Hard') {
          hardTotal++;
          if (progress[p.id]) hardSolved++;
        }

        if (progress[p.id]) {
          topicDataMap[w.topic].solved++;
        }
      });
    });
  });

  const diffChartData = [
    { name: 'Easy', solved: easySolved, total: easyTotal, color: '#34c759' },
    { name: 'Medium', solved: medSolved, total: medTotal, color: '#ff9500' },
    { name: 'Hard', solved: hardSolved, total: hardTotal, color: '#ff3b30' }
  ];

  const topicChartData = Object.keys(topicDataMap)
    .map((topic) => ({
      name: topic.length > 12 ? topic.substring(0, 10) + '...' : topic,
      Solved: topicDataMap[topic].solved,
      Remaining: topicDataMap[topic].total - topicDataMap[topic].solved
    }))
    .slice(0, 8);

  const solvedPct = Math.round((stats.solvedCount / (stats.totalProblems || 1)) * 100);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-6 flex flex-col gap-6">
      
      {/* 5 STAT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* CARD 1: PROBLEMS SOLVED */}
        <div className="relative overflow-hidden rounded-2xl bg-[#101018] border border-gray-800 p-5 shadow-xl">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-bold font-mono tracking-wider uppercase">PROBLEMS SOLVED</span>
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-white">
              <AnimatedCounter value={stats.solvedCount} />
            </span>
            <span className="font-mono text-xs text-gray-400">/ {stats.totalProblems}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${solvedPct}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-gray-400 mt-2 block">
            {solvedPct}% of 247 problems done
          </span>
        </div>

        {/* CARD 2: CURRENT STREAK */}
        <div className="relative overflow-hidden rounded-2xl bg-[#101018] border border-gray-800 p-5 shadow-xl">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-bold font-mono tracking-wider uppercase">CURRENT STREAK</span>
            <Flame className="w-5 h-5 text-orange-400 animate-bounce" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-orange-400">
              <AnimatedCounter value={stats.streak} suffix=" 🔥" />
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-3">
            1 missed day resets momentum!
          </p>
        </div>

        {/* CARD 3: DAYS TO D-DAY */}
        <div className="relative overflow-hidden rounded-2xl bg-[#101018] border border-gray-800 p-5 shadow-xl">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-bold font-mono tracking-wider uppercase">COUNTDOWN</span>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-white">
              <AnimatedCounter value={stats.daysLeft} />
            </span>
            <span className="font-mono text-xs text-gray-400">days left</span>
          </div>
          <span className="text-[11px] font-mono text-blue-400 mt-3 block">
            Jan 15, 2027 Placements
          </span>
        </div>

        {/* CARD 4: TOP INTERNSHIP ODDS */}
        <div className="relative overflow-hidden rounded-2xl bg-[#101018] border border-gray-800 p-5 shadow-xl">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-bold font-mono tracking-wider uppercase">INTERNSHIP ODDS</span>
            <TrendingUp className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-yellow-400">
              <AnimatedCounter value={stats.oddsPercentage} suffix="%" />
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-500"
              style={{ width: `${stats.oddsPercentage}%` }}
            />
          </div>
        </div>

        {/* CARD 5: MISSED DAYS */}
        <div className="relative overflow-hidden rounded-2xl bg-[#101018] border border-gray-800 p-5 shadow-xl">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-bold font-mono tracking-wider uppercase">MISSED DAYS</span>
            <Skull className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-red-400">
              <AnimatedCounter value={stats.missedDaysCount} />
            </span>
            <span className="font-mono text-xs text-gray-400">days</span>
          </div>
          <span className="text-[11px] font-mono text-red-400/80 mt-3 block">
            {stats.missedDaysCount === 0 ? 'Zero missed days! 🔥' : `${stats.missedDaysCount} days skipped`}
          </span>
        </div>

      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: DIFFICULTY BREAKDOWN */}
        <div className="bg-[#101018] border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-green-400" />
              Difficulty Mastery Breakdown
            </h3>
            <span className="text-xs font-mono text-gray-400">Easy / Med / Hard</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diffChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="solved"
                >
                  {diffChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#181824', borderColor: '#262636', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: any, name: any) => [`${value} solved`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-gray-800">
            <div>
              <span className="text-green-400 font-bold block">{easySolved} / {easyTotal}</span>
              <span className="text-gray-400 text-[10px]">Easy</span>
            </div>
            <div>
              <span className="text-orange-400 font-bold block">{medSolved} / {medTotal}</span>
              <span className="text-gray-400 text-[10px]">Medium</span>
            </div>
            <div>
              <span className="text-red-400 font-bold block">{hardSolved} / {hardTotal}</span>
              <span className="text-gray-400 text-[10px]">Hard</span>
            </div>
          </div>
        </div>

        {/* CHART 2: TOPIC PROGRESS BAR CHART */}
        <div className="bg-[#101018] border border-gray-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
              Topic Completion Distribution
            </h3>
            <span className="text-xs font-mono text-gray-400">Solved vs Remaining</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicChartData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#636366" fontSize={10} angle={-25} textAnchor="end" />
                <YAxis stroke="#636366" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#181824', borderColor: '#262636', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="Solved" stackId="a" fill="#ff9500" />
                <Bar dataKey="Remaining" stackId="a" fill="#262636" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
