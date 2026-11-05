import React, { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Bot, Target, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
          insight: 'Arrays, Two Pointers & HashMaps appear in 75%+ of technical phone screens. Solve Two Sum, 3Sum, and Container With Most Water cleanly without hesitation.',
          priority: 'Eliminate brute-force O(N²) habits; think in terms of hash sets and sorted pointers.'
        };
      case 2:
        return {
          title: 'Hierarchical & Graphs',
          insight: 'Tree BFS/DFS and Matrix traversals are high-frequency topics. Recognize early whether a graph problem requires BFS (shortest path) or DFS (connected components).',
          priority: 'Master Level-Order BFS and recursive DFS path sums with recursion depth limits.'
        };
      case 3:
        return {
          title: 'Dynamic Programming',
          insight: 'DP questions filter candidates in online assessments. Always formulate the memoization state (top-down) before attempting tabular bottom-up.',
          priority: 'Identify 0/1 Knapsack and Longest Common Subsequence templates immediately.'
        };
      case 4:
        return {
          title: 'System Design & Scalability',
          insight: 'Crucial for mid-to-senior software engineering conversions. Focus on caching (Redis), rate limiting, and horizontal partitioning concepts.',
          priority: 'Understand high-level latency vs. throughput trade-offs and CAP theorem nuances.'
        };
      default:
        return {
          title: 'Offer Sprint & Timed Mocks',
          insight: 'Verbalization under 40-minute constraints dictates offers. Explain time & space complexities upfront before writing a single line of code.',
          priority: 'Simulate high-pressure live coding environments and articulate test cases proactively.'
        };
    }
  }, [currentPhase]);

  return (
    <Card className="border border-border/80 bg-card text-card-foreground shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
            <Bot className="size-4.5" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              Placement Coach
              <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 border-border/70 text-muted-foreground">
                Phase {currentPhase}
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {phaseIntel.title} · <span className="text-foreground/80 font-medium">{currentTopic}</span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 flex flex-col gap-3">
        <Tabs defaultValue="brief" className="w-full">
          <TabsList className="grid grid-cols-3 w-full h-8.5 bg-muted/60 p-1 border border-border/50">
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

          <TabsContent value="brief" className="m-0 flex flex-col gap-3 pt-1">
            <div className="border-l-2 border-primary/70 pl-3 py-1 bg-muted/20 rounded-r-md">
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
                {phaseIntel.insight}
              </p>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-muted/30 text-xs">
              <Target className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-foreground font-semibold">Tactical Focus</span>
                <span className="text-muted-foreground leading-relaxed">{phaseIntel.priority}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="diagnostic" className="m-0 flex flex-col gap-3 pt-1">
            <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <TrendingUp className="size-3.5 text-primary" />
                  Readiness Assessment:
                </span>
                <span className="font-mono font-bold text-foreground text-sm">{stats.oddsPercentage}% benchmark</span>
              </div>
              <Progress value={stats.oddsPercentage} className="h-1.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {stats.oddsPercentage >= 70
                  ? 'Your solve consistency and depth place you in the top candidate bracket for Tier-1 engineering interviews.'
                  : 'Maintain daily velocity. Sustained 3-problem daily momentum over 4+ weeks creates compounding algorithmic intuition.'}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="strategy" className="m-0 flex flex-col gap-3 pt-1">
            <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 flex flex-col gap-2 text-xs">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                <span>Target: {userProfile.targetCompany || 'Top Tech Roles'}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Prioritize LeetCode Medium patterns. 80% of technical interview screens focus on Medium variations tested in 35-minute live pair sessions.
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                <Sparkles className="size-3 text-amber-500 shrink-0" />
                <span>Tip: Always state Space & Time complexities before coding.</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
