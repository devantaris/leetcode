import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { stats, progress, dailySolveLog } = useProgress();

  // Difficulty breakdown data for Pie chart
  let easySolved = 0, easyTotal = 0;
  let medSolved = 0, medTotal = 0;
  let hardSolved = 0, hardTotal = 0;

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

  const topicChartData = Object.keys(topicDataMap).map((topic) => ({
    name: topic,
    Solved: topicDataMap[topic].solved,
    Remaining: topicDataMap[topic].total - topicDataMap[topic].solved
  }));

  // Weekly progress trajectory data
  const weekTrajectoryData = PLAN_DATA.map((w) => {
    let weekTotal = 0;
    let weekSolved = 0;
    w.days.forEach((d) => {
      d.problems.forEach((p) => {
        weekTotal++;
        if (progress[p.id]) weekSolved++;
      });
    });
    return {
      week: `W${w.week}`,
      Solved: weekSolved,
      Target: weekTotal
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6"
    >
      {/* ANALYTICS HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#101018] border border-gray-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-white">INTERNSHIP READINESS & ANALYTICS</h2>
            <span className="text-xs font-mono font-bold bg-orange-500/20 text-orange-400 px-2.5 py-0.5 rounded border border-orange-500/30">
              PRO INSIGHTS
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Data-driven evaluation of your DSA grinding velocity and estimated readiness for Jan 2027 placements.
          </p>
        </div>

        {/* PROJECTED COMPLETION DATE CARD */}
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center gap-3 shrink-0">
          <Calendar className="w-8 h-8 text-orange-400" />
          <div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">PROJECTED COMPLETION</span>
            <span className="text-sm font-extrabold text-white font-mono">{stats.projectedCompletionDate}</span>
          </div>
        </div>
      </div>

      {/* METRIC SUMMARY STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-[#101018] border border-gray-800 shadow-lg">
          <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">SOLVE VELOCITY</span>
          <span className="text-2xl font-extrabold text-white font-mono block mt-1">
            {((stats.solvedCount / Math.max(1, stats.currentDay)) * 7).toFixed(1)} / wk
          </span>
          <span className="text-[10px] text-gray-400 mt-1 block">Problems solved per week</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#101018] border border-gray-800 shadow-lg">
          <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">PACE STATUS</span>
          <span className={`text-xl font-extrabold font-mono block mt-1 ${stats.isOnTrack ? 'text-green-400' : 'text-orange-400'}`}>
            {stats.isOnTrack ? '✅ ON TRACK' : '⚠️ SPEED UP'}
          </span>
          <span className="text-[10px] text-gray-400 mt-1 block">Targeting ~3 problems/day</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#101018] border border-gray-800 shadow-lg">
          <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">EASY MASTERY</span>
          <span className="text-2xl font-extrabold text-green-400 font-mono block mt-1">
            {Math.round((easySolved / (easyTotal || 1)) * 100)}%
          </span>
          <span className="text-[10px] text-gray-400 mt-1 block">{easySolved} of {easyTotal} solved</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#101018] border border-gray-800 shadow-lg">
          <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">MEDIUM / HARD MASTERY</span>
          <span className="text-2xl font-extrabold text-orange-400 font-mono block mt-1">
            {Math.round(((medSolved + hardSolved) / ((medTotal + hardTotal) || 1)) * 100)}%
          </span>
          <span className="text-[10px] text-gray-400 mt-1 block">{medSolved + hardSolved} of {medTotal + hardTotal} solved</span>
        </div>

      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* WEEKLY TRAJECTORY LINE CHART */}
        <div className="bg-[#101018] border border-gray-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              20-Week Completion Trajectory
            </h3>
            <span className="text-xs font-mono text-gray-400">Solved vs Target</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekTrajectoryData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" />
                <XAxis dataKey="week" stroke="#636366" fontSize={10} />
                <YAxis stroke="#636366" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#181824', borderColor: '#262636', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="Target" stroke="#3b3b54" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Solved" stroke="#00e676" strokeWidth={3} dot={{ r: 4, fill: '#00e676' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DIFFICULTY PIE CHART */}
        <div className="bg-[#101018] border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-green-400" />
              Difficulty Level Ratio
            </h3>
            <span className="text-xs font-mono text-gray-400">Easy / Med / Hard</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diffChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
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

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-3 border-t border-gray-800">
            <div>
              <span className="text-green-400 font-bold block">{easySolved} / {easyTotal}</span>
              <span className="text-gray-400 text-[10px]">Easy ({Math.round((easySolved / (easyTotal || 1)) * 100)}%)</span>
            </div>
            <div>
              <span className="text-orange-400 font-bold block">{medSolved} / {medTotal}</span>
              <span className="text-gray-400 text-[10px]">Medium ({Math.round((medSolved / (medTotal || 1)) * 100)}%)</span>
            </div>
            <div>
              <span className="text-red-400 font-bold block">{hardSolved} / {hardTotal}</span>
              <span className="text-gray-400 text-[10px]">Hard ({Math.round((hardSolved / (hardTotal || 1)) * 100)}%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* TOPIC DISTRIBUTION BAR CHART */}
      <div className="bg-[#101018] border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
            All 20 Topics Completion Breakdown
          </h3>
          <span className="text-xs font-mono text-gray-400">Solved vs Remaining per topic</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicChartData} margin={{ top: 5, right: 10, left: -20, bottom: 50 }}>
              <XAxis dataKey="name" stroke="#636366" fontSize={10} angle={-35} textAnchor="end" />
              <YAxis stroke="#636366" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#181824', borderColor: '#262636', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="Solved" stackId="a" fill="#00e676" />
              <Bar dataKey="Remaining" stackId="a" fill="#242436" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DATE-WISE ACTIVITY TIMELINE & SOLVE HISTORY */}
      <div className="bg-[#101018] border border-gray-800 rounded-2xl p-5 shadow-xl mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              DATE-WISE SOLVE LOG & STREAK TIMELINE
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Exact date and timestamp record of every solved problem. Consecutive active days determine your streak!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30">
              🔥 {stats.streak}-Day Active Streak
            </span>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-gray-800 text-gray-300 border border-gray-700">
              {dailySolveLog.length} Active Days
            </span>
          </div>
        </div>

        {dailySolveLog.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-gray-900/50 border border-gray-800 text-gray-400 text-xs font-mono">
            No problem solves logged yet. Mark problems solved on the dashboard to build your date history!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {dailySolveLog.map((group) => (
              <div key={group.dateStr} className="rounded-xl border border-gray-800/90 bg-[#141420] p-4 flex flex-col gap-3">
                
                {/* DATE HEADER */}
                <div className="flex items-center justify-between border-b border-gray-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></span>
                    <h4 className="text-xs font-bold font-mono text-white tracking-wide">
                      {group.displayDate}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                    {group.items.length} {group.items.length === 1 ? 'problem' : 'problems'} solved
                  </span>
                </div>

                {/* SOLVED PROBLEMS LIST FOR THIS DATE */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {group.items.map((item) => {
                    let badgeColor = "bg-orange-500/20 text-orange-400 border-orange-500/30";
                    if (item.difficulty === 'Easy') badgeColor = "bg-green-500/20 text-green-400 border-green-500/30";
                    if (item.difficulty === 'Hard') badgeColor = "bg-red-500/20 text-red-400 border-red-500/30";

                    return (
                      <div
                        key={`${group.dateStr}-${item.problemId}`}
                        className="p-3 rounded-lg bg-[#181826] border border-gray-800 flex items-center justify-between gap-2 hover:border-gray-700 transition"
                      >
                        <div className="flex flex-col min-w-0">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-white hover:text-orange-400 transition truncate"
                          >
                            {item.name}
                          </a>
                          <span className="text-[10px] font-mono text-gray-500">
                            {item.topic} • {item.timeFormatted}
                          </span>
                        </div>

                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${badgeColor}`}>
                          {item.difficulty}
                        </span>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
};
