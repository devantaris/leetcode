import React, { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid } from 'recharts';
import { CURRICULUM } from '../data/curriculumStats';
import { TrendingUp, Zap, Target, Award, Calendar, History, ExternalLink, CheckCircle2, Flag, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const AnalyticsPage: React.FC = () => {
  const { stats, progress, dailySolveLog, userProfile } = useProgress();

  const weeklySolveVelocity = useMemo(() => {
    let elapsedDays = stats.currentDay;
    if (userProfile?.startDate) {
      const start = new Date(userProfile.startDate);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);
      elapsedDays = diffDays;
    }
    return ((stats.solvedCount / Math.max(1, elapsedDays)) * 7).toFixed(1);
  }, [stats.solvedCount, stats.currentDay, userProfile?.startDate]);

  const recent14DaysData = useMemo(() => {
    const result = [];
    const dateMap = new Map<string, number>();
    dailySolveLog.forEach((g) => {
      dateMap.set(g.dateStr, g.items.length);
    });

    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const monthDay = dateStr.slice(5); // MM-DD
      result.push({
        date: monthDay,
        Solved: dateMap.get(dateStr) || 0,
      });
    }
    return result;
  }, [dailySolveLog]);

  const { easySolved, easyTotal, medSolved, medTotal, hardSolved, hardTotal, topicDataMap } = useMemo(() => {
    let easySolved = 0, easyTotal = 0;
    let medSolved = 0, medTotal = 0;
    let hardSolved = 0, hardTotal = 0;
    const topicDataMap: { [topic: string]: { total: number; solved: number } } = {};

    PLAN_DATA.forEach((w) => {
      if (!topicDataMap[w.topic]) topicDataMap[w.topic] = { total: 0, solved: 0 };
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
          if (progress[p.id]) topicDataMap[w.topic].solved++;
        });
      });
    });
    return { easySolved, easyTotal, medSolved, medTotal, hardSolved, hardTotal, topicDataMap };
  }, [progress]);

  const topicChartData = useMemo(() => {
    return Object.keys(topicDataMap).map((topic) => ({
      name: topic.length > 14 ? topic.substring(0, 12) + '..' : topic,
      Solved: topicDataMap[topic].solved,
      Remaining: topicDataMap[topic].total - topicDataMap[topic].solved
    }));
  }, [topicDataMap]);

  const weekTrajectoryData = useMemo(() => {
    return PLAN_DATA.map((w) => {
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
  }, [progress]);

  const phaseData = useMemo(() => {
    const currentWeek = stats.currentWeek;
    const PHASES = [
      { phase: 1, name: 'Phase 1: Linear Foundations', weeks: [1, 2, 3, 4], desc: 'Arrays, Two Pointers, Sliding Window, Monotonic Stack, Linked Lists' },
      { phase: 2, name: 'Phase 2: Tree & Graph Hierarchies', weeks: [5, 6, 7, 8, 9], desc: 'Binary Trees, BST, Heaps, Backtracking, BFS/DFS, Shortest Paths' },
      { phase: 3, name: 'Phase 3: Dynamic Programming & Greedy', weeks: [10, 11, 12, 13], desc: '1D & 2D Memoization, Tabulation, Knapsack, Greedy Intervals' },
      { phase: 4, name: 'Phase 4: Architecture & Design', weeks: [14], desc: 'Distributed caching, rate limiting, and core system design patterns' },
      { phase: 5, name: 'Phase 5: Timed Mocks & Speedruns', weeks: [15, 16, 17, 18, 19, 20], desc: 'Company tags, 40-min timed runs, and live contest pressure' },
    ];

    const currentPhase = PHASES.find(p => p.weeks.includes(currentWeek)) || PHASES[0];

    // Compute progress across all phases
    const phaseStats = PHASES.map((p) => {
      let total = 0;
      let solved = 0;
      PLAN_DATA.forEach(w => {
        if (p.weeks.includes(w.week)) {
          w.days.forEach(d => {
            d.problems.forEach(prob => {
              if (!prob.isReview) {
                total++;
                if (progress[prob.id]) solved++;
              }
            });
          });
        }
      });
      const pct = Math.round((solved / Math.max(1, total)) * 100);
      const isCurrent = p.phase === currentPhase.phase;
      const isDone = pct === 100;
      return { ...p, total, solved, pct, isCurrent, isDone };
    });

    const activeStats = phaseStats.find(p => p.phase === currentPhase.phase) || phaseStats[0];

    return { activeStats, phaseStats };
  }, [stats.currentWeek, progress]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Title */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
            Velocity &amp; Progress Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Solve speed, category completion ratios, and historical pace telemetry.
          </p>
        </div>

        <Badge variant="outline" className="font-mono text-xs py-1 px-3 gap-1.5 border-border/60">
          <Calendar className="size-3.5 text-primary" />
          <span className="text-muted-foreground">Projected Target:</span>
          <strong className="text-foreground">{stats.projectedCompletionDate}</strong>
        </Badge>
      </div>

      {/* Metric summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="shadow-xs border-border/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Solve Velocity</span>
            <Zap className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-mono font-bold text-foreground tabular-nums mt-1">
            {weeklySolveVelocity}
            <span className="text-xs font-normal text-muted-foreground"> / wk</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Problems per 7 days
          </div>
        </Card>

        <Card className="shadow-xs border-border/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Pace Status</span>
            <TrendingUp className={`size-4 ${stats.isOnTrack ? 'text-emerald-500' : 'text-amber-500'}`} />
          </div>
          <div className={`text-xl font-bold font-serif tracking-tight mt-1 ${stats.isOnTrack ? 'text-emerald-500' : 'text-amber-500'}`}>
            {stats.isOnTrack ? 'On Schedule' : 'Behind Pace'}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 font-mono">
            Target: ~{CURRICULUM.dailyTarget} problems / day
          </div>
        </Card>

        <Card className="shadow-xs border-border/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Easy Mastery</span>
            <Award className="size-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-primary tabular-nums mt-1">
            {Math.round((easySolved / (easyTotal || 1)) * 100)}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 font-mono">
            {easySolved} / {easyTotal} problems
          </div>
        </Card>

        <Card className="shadow-xs border-border/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Med / Hard Ratio</span>
            <Target className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-mono font-bold text-primary tabular-nums mt-1">
            {Math.round(((medSolved + hardSolved) / ((medTotal + hardTotal) || 1)) * 100)}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 font-mono">
            {medSolved + hardSolved} / {medTotal + hardTotal} problems
          </div>
        </Card>
      </div>

      {/* Placement Readiness Breakdown Card */}
      <Card className="border border-border/70 shadow-xs bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                <span>Placement Readiness Index Breakdown</span>
                <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30 bg-primary/10">
                  {stats.oddsPercentage}%
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Transparent 4-factor scoring model evaluated in Tier-1 software engineering hiring loops.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-border/50 bg-muted/20">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">Problem Coverage</span>
                <span className="font-mono font-bold text-foreground">{stats.readinessBreakdown.coverageScore} / 40 pts</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(stats.readinessBreakdown.coverageScore / 40) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1.5">40% weight • Curriculum depth</div>
            </div>

            <div className="p-3 rounded-xl border border-border/50 bg-muted/20">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">Streak Consistency</span>
                <span className="font-mono font-bold text-amber-500">{stats.readinessBreakdown.streakScore} / 25 pts</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${(stats.readinessBreakdown.streakScore / 25) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1.5">25% weight • Habit discipline</div>
            </div>

            <div className="p-3 rounded-xl border border-border/50 bg-muted/20">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">Pace vs Target</span>
                <span className="font-mono font-bold text-emerald-500">{stats.readinessBreakdown.paceScore} / 25 pts</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${(stats.readinessBreakdown.paceScore / 25) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1.5">25% weight • Deadline buffer</div>
            </div>

            <div className="p-3 rounded-xl border border-border/50 bg-muted/20">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">Topic Breadth</span>
                <span className="font-mono font-bold text-foreground">{stats.readinessBreakdown.breadthScore} / 10 pts</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/70 rounded-full transition-all"
                  style={{ width: `${(stats.readinessBreakdown.breadthScore / 10) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1.5">10% weight • Multi-phase mastery</div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground flex items-center gap-2">
            <span className="font-bold text-primary shrink-0">Actionable Advice:</span>
            <span className="text-muted-foreground">{stats.readinessBreakdown.actionableAdvice}</span>
          </div>
        </CardContent>
      </Card>

      {/* Phase Milestone Velocity Roadmap Card */}
      <Card className="border border-border/70 shadow-xs bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Flag className="size-4.5 text-primary" />
                <span>Active Milestone: {phaseData.activeStats.name}</span>
                <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30 bg-primary/10">
                  {phaseData.activeStats.pct}% Complete
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {phaseData.activeStats.desc} • {phaseData.activeStats.solved} of {phaseData.activeStats.total} phase problems solved
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-0">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground font-medium">Phase 140-Day Sub-Goal</span>
              <span className="text-primary font-bold">{phaseData.activeStats.solved} / {phaseData.activeStats.total} problems ({phaseData.activeStats.pct}%)</span>
            </div>
            <Progress value={phaseData.activeStats.pct} className="h-2 w-full" />
          </div>

          {/* 5-Phase Horizontal Track */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-border/50">
            {phaseData.phaseStats.map((p) => (
              <div
                key={p.phase}
                className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
                  p.isCurrent
                    ? 'border-primary/50 bg-primary/10 shadow-xs ring-1 ring-primary/30'
                    : p.isDone
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-border/60 bg-muted/20 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className={p.isCurrent ? 'text-primary' : 'text-foreground'}>Phase {p.phase}</span>
                  {p.isDone ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <span className="font-mono text-[10px] text-muted-foreground">{p.pct}%</span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {p.weeks.length === 1 ? `Week ${p.weeks[0]}` : `Weeks ${p.weeks[0]}–${p.weeks[p.weeks.length - 1]}`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts row 1: Weekly trajectory & daily velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trajectory */}
        <Card className="shadow-xs border-border/60">
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              {CURRICULUM.totalWeeks}-Week Target Trajectory
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">Target vs Solved</Badge>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekTrajectoryData} margin={{ top: 5, right: 10, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
                  <XAxis dataKey="week" stroke="currentColor" className="text-[10px] text-muted-foreground" tickLine={false} />
                  <YAxis stroke="currentColor" className="text-[10px] text-muted-foreground" tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line type="monotone" dataKey="Target" stroke="var(--muted-foreground)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="Solved" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--primary)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Velocity */}
        <Card className="shadow-xs border-border/60">
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Recent Solve Velocity
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">Last 14 Days</Badge>
          </CardHeader>

          <CardContent className="pt-0">
            {dailySolveLog.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
                No solves logged in the last 14 days. Start today&apos;s mission to build your curve!
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={recent14DaysData}
                    margin={{ top: 5, right: 10, left: -24, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
                    <XAxis dataKey="date" stroke="currentColor" className="text-[10px] text-muted-foreground" tickLine={false} />
                    <YAxis stroke="currentColor" className="text-[10px] text-muted-foreground" tickLine={false} allowDecimals={false} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '8px',
                        fontSize: '11px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="Solved" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Topic breakdown */}
      <Card className="shadow-xs border-border/60">
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            Complete Curriculum Topic Mastery
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-mono">All 25 Topics</Badge>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicChartData} margin={{ top: 5, right: 10, left: -24, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
                <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} stroke="currentColor" className="text-[9px] text-muted-foreground" />
                <YAxis stroke="currentColor" className="text-[10px] text-muted-foreground" tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="Solved" fill="var(--primary)" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="Remaining" fill="var(--muted)" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chronological Solve Activity Stream */}
      <Card className="shadow-xs border-border/60">
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Recent Solve Activity Log
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            {stats.solvedCount} total recorded
          </Badge>
        </CardHeader>

        <CardContent className="pt-0">
          {dailySolveLog.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
              No solve logs found yet. Complete missions in the syllabus to build your history!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {dailySolveLog.slice(0, 7).map((group) => (
                <div key={group.dateStr} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Calendar className="size-3 text-primary" />
                    <span>{group.displayDate}</span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4.5 font-mono">
                      {group.items.length} solve{group.items.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {group.items.map((item) => (
                      <div
                        key={item.problemId}
                        className="p-2.5 rounded-xl border border-border/50 bg-muted/20 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-foreground truncate">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono truncate">
                              {item.topic} • {item.timeFormatted}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                            {item.difficulty}
                          </Badge>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground p-0.5"
                            title="Open problem"
                          >
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
