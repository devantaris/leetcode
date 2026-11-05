import React, { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { AnimatedCounter } from './AnimatedCounter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const StatsAnalyticsDashboard: React.FC = () => {
  const { stats, progress } = useProgress();

  const { topicDataMap } = useMemo(() => {
    let easySolved = 0, easyTotal = 0;
    let medSolved = 0, medTotal = 0;
    let hardSolved = 0, hardTotal = 0;
    const topicDataMap: { [topic: string]: { total: number; solved: number } } = {};

    PLAN_DATA.forEach((w) => {
      if (!topicDataMap[w.topic]) topicDataMap[w.topic] = { total: 0, solved: 0 };
      w.days.forEach((d) => {
        d.problems.forEach((p) => {
          topicDataMap[w.topic].total++;
          if (p.difficulty === 'Easy') { easyTotal++; if (progress[p.id]) easySolved++; }
          else if (p.difficulty === 'Medium') { medTotal++; if (progress[p.id]) medSolved++; }
          else if (p.difficulty === 'Hard') { hardTotal++; if (progress[p.id]) hardSolved++; }
          if (progress[p.id]) topicDataMap[w.topic].solved++;
        });
      });
    });
    return { easySolved, easyTotal, medSolved, medTotal, hardSolved, hardTotal, topicDataMap };
  }, [progress]);

  const topicChartData = useMemo(() => {
    return Object.keys(topicDataMap)
      .map((topic) => ({
        name: topic.length > 12 ? topic.substring(0, 10) + '..' : topic,
        Solved: topicDataMap[topic].solved,
        Remaining: topicDataMap[topic].total - topicDataMap[topic].solved,
      }))
      .slice(0, 8);
  }, [topicDataMap]);

  const solvedPct = Math.round((stats.solvedCount / (stats.totalProblems || 1)) * 100);

  return (
    <Card className="border border-border/80 bg-card text-card-foreground shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            Interview Readiness Analytics
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time algorithmic velocity
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-xs border-border/70">
          W{stats.currentWeek} · Day {stats.currentDay}
        </Badge>
      </CardHeader>

      <CardContent className="pt-2 flex flex-col gap-4">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-lg border border-border/50 bg-muted/20 flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Solved</span>
            <span className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums mt-0.5">
              <AnimatedCounter value={stats.solvedCount} />
            </span>
            <span className="text-[10px] text-muted-foreground mt-1">of {stats.totalProblems} ({solvedPct}%)</span>
          </div>

          <div className="p-3 rounded-lg border border-border/50 bg-muted/20 flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Streak</span>
            <span className="font-mono text-2xl font-bold tracking-tight text-amber-500 tabular-nums mt-0.5">
              <AnimatedCounter value={stats.streak} />d
            </span>
            <span className="text-[10px] text-muted-foreground mt-1">consecutive grind</span>
          </div>

          <div className="p-3 rounded-lg border border-border/50 bg-muted/20 flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Readiness</span>
            <span className="font-mono text-2xl font-bold tracking-tight text-primary tabular-nums mt-0.5">
              <AnimatedCounter value={stats.oddsPercentage} />%
            </span>
            <span className="text-[10px] text-muted-foreground mt-1">benchmark score</span>
          </div>

          <div className="p-3 rounded-lg border border-border/50 bg-muted/20 flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Remaining</span>
            <span className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums mt-0.5">
              <AnimatedCounter value={stats.daysLeft} />d
            </span>
            <span className="text-[10px] text-muted-foreground mt-1">until target date</span>
          </div>
        </div>

        {/* Topic Breakdown Bar Chart */}
        <div className="p-3.5 rounded-xl border border-border/50 bg-card">
          <div className="text-xs font-semibold text-foreground mb-3 flex items-center justify-between">
            <span>High-Frequency Topic Distribution</span>
            <span className="text-[10px] text-muted-foreground font-normal">Active vs Solved</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicChartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="currentColor" className="text-[10px] text-muted-foreground" tickLine={false} />
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
                <Bar dataKey="Solved" fill="oklch(0.606 0.25 292.717)" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="Remaining" fill="oklch(0.275 0.011 216.9)" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
