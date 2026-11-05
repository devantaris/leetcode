import React, { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Bot, Target, ShieldCheck } from 'lucide-react';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export const AICoachCard: React.FC = () => {
  const { stats, userProfile } = useProgress();

  const currentWeekPlan = PLAN_DATA.find((w) => w.week === stats.currentWeek) || PLAN_DATA[0];
  const todayDayPlan = currentWeekPlan.days.find((d) => d.day === stats.currentDay) || currentWeekPlan.days[0];

  const currentTopic = todayDayPlan.topic;
  const currentPhase = stats.currentWeek <= 4 ? 1 : stats.currentWeek <= 9 ? 2 : stats.currentWeek <= 13 ? 3 : stats.currentWeek <= 14 ? 4 : 5;

  const phaseIntel = useMemo(() => {
    switch (currentPhase) {
      case 1:
        return {
          title: 'Linear Foundations',
          insight: 'Arrays, Two Pointers & HashMaps are tested in 75%+ of technical phone screens. Verify you can solve Two Sum, 3Sum, and Container With Most Water cleanly without hesitation.',
          priority: 'Eliminate brute force O(N²) habits.'
        };
      case 2:
        return {
          title: 'Hierarchical & Graphs',
          insight: 'Tree BFS/DFS and Matrix traversals are high-frequency topics. Focus on recognizing whether a graph problem requires BFS (shortest path) or DFS (connected components).',
          priority: 'Master Level-Order BFS and recursive DFS path sums.'
        };
      case 3:
        return {
          title: 'Dynamic Programming',
          insight: 'DP questions frequently filter candidates in OAs. Focus on state formulation: memoization (top-down) before attempting tabulation (bottom-up).',
          priority: 'Identify 0/1 Knapsack and Longest Common Subsequence templates.'
        };
      case 4:
        return {
          title: 'Architecture & System Design',
          insight: 'Crucial for software engineering conversions. Focus on caching (Redis), rate limiting, and horizontal partitioning concepts.',
          priority: 'Understand high-level latency vs throughput trade-offs.'
        };
      default:
        return {
          title: 'Offer Sprint & Timed Mocks',
          insight: 'Speed and verbalization under 40-minute constraints dictate offers. Practice explaining complexities upfront before writing code.',
          priority: 'Simulate high-pressure live coding environments.'
        };
    }
  }, [currentPhase]);

  return (
    <Card className="shadow-xs border-border/60">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Bot className="size-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              Placement Coach
              <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 border-border/60 text-muted-foreground">
                Phase {currentPhase}
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {phaseIntel.title} · {currentTopic}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs defaultValue="brief" className="w-full">
          <TabsList className="grid grid-cols-3 w-full h-8 mb-3 bg-muted/50 p-1">
            <TabsTrigger value="brief" className="text-xs">
              Brief
            </TabsTrigger>
            <TabsTrigger value="diagnostic" className="text-xs">
              Diagnostic
            </TabsTrigger>
            <TabsTrigger value="strategy" className="text-xs">
              Strategy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brief" className="m-0 flex flex-col gap-2.5">
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
              {phaseIntel.insight}
            </p>
            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 bg-muted/30 text-xs">
              <Target className="size-3.5 text-primary shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground font-medium">Core Focus:</strong> {phaseIntel.priority}
              </span>
            </div>
          </TabsContent>

          <TabsContent value="diagnostic" className="m-0 flex flex-col gap-2.5">
            <div className="p-3 rounded-lg border border-border/50 bg-muted/20 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Readiness Assessment:</span>
                <span className="font-mono font-semibold text-foreground">{stats.oddsPercentage}% benchmark</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {stats.oddsPercentage >= 70
                  ? 'Your solve consistency and depth put you in the top candidate bracket for top tech interviews.'
                  : 'Maintain daily discipline. Consistency over 4+ weeks creates compounding algorithmic intuition.'}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="strategy" className="m-0 flex flex-col gap-2.5">
            <div className="p-3 rounded-lg border border-border/50 bg-muted/20 flex flex-col gap-1.5 text-xs">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                Target: {userProfile.targetCompany || 'Top Tech Roles'}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Prioritize Medium complexity problems. In technical interviews, 80% of live coding rounds test Medium-level patterns under a 35-minute time window.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
