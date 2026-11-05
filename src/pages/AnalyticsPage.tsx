import React, { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid } from 'recharts';
import { CURRICULUM } from '../data/curriculumStats';
import { TrendingUp, Zap, Target, Award, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AnalyticsPage: React.FC = () => {
  const { stats, progress, dailySolveLog } = useProgress();

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
            {((stats.solvedCount / Math.max(1, stats.currentDay)) * 7).toFixed(1)}
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
                    data={[...dailySolveLog].reverse().slice(-14).map((g) => ({
                      date: g.dateStr.slice(5),
                      Solved: g.items.length,
                    }))}
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
    </div>
  );
};
