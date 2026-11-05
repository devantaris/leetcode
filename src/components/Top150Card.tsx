import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA } from '../data/mergedPlanData';
import { TOP_150_LC_NUMBERS } from '../data/top150List';
import { Trophy, ArrowRight } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const top150ProblemsMap = new Map<number, { id: string; difficulty: string }>();
let easyTotal = 0, medTotal = 0, hardTotal = 0;

for (const week of MERGED_PLAN_DATA) {
  for (const day of week.days) {
    for (const p of day.problems) {
      if (TOP_150_LC_NUMBERS.has(p.lcNumber) && p.lcNumber !== 0 && !p.isReview) {
        if (!top150ProblemsMap.has(p.lcNumber)) {
          top150ProblemsMap.set(p.lcNumber, { id: p.id, difficulty: p.difficulty });
          if (p.difficulty === 'Easy') easyTotal++;
          else if (p.difficulty === 'Medium') medTotal++;
          else hardTotal++;
        }
      }
    }
  }
}
const totalTop150 = top150ProblemsMap.size;

export const Top150Card: React.FC = () => {
  const { progress, setStatusFilter } = useProgress();
  const navigate = useNavigate();

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

  const solvedTop150 = solvedByLc.size;
  const pct = Math.round((solvedTop150 / Math.max(1, totalTop150)) * 100);

  let easySolved = 0;
  let medSolved = 0;
  let hardSolved = 0;

  for (const lcNum of solvedByLc) {
    const info = top150ProblemsMap.get(lcNum);
    if (info) {
      if (info.difficulty === 'Easy') easySolved++;
      else if (info.difficulty === 'Medium') medSolved++;
      else hardSolved++;
    }
  }

  return (
    <Card className="border border-border/80 bg-card text-card-foreground shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
            <Trophy className="size-4.5" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              LeetCode Top 150
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Industry benchmark problem set
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="xs"
          onClick={() => {
            setStatusFilter('top150');
            navigate('/curriculum');
          }}
          className="text-xs text-muted-foreground hover:text-foreground h-7 gap-1"
        >
          <span>Explore</span>
          <ArrowRight className="size-3" />
        </Button>
      </CardHeader>

      <CardContent className="pt-2 flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-foreground tabular-nums">
              <AnimatedCounter value={solvedTop150} />
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              / {totalTop150} solved ({pct}%)
            </span>
          </div>
        </div>

        <Progress value={pct} className="h-1.5 w-full bg-muted/60" />

        {/* Breakdown row */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/40 text-center">
          <div className="flex flex-col">
            <span className="font-mono text-xs font-semibold text-primary">
              {easySolved} / {easyTotal}
            </span>
            <span className="text-[10px] text-muted-foreground">Easy</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-semibold text-amber-500">
              {medSolved} / {medTotal}
            </span>
            <span className="text-[10px] text-muted-foreground">Medium</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-semibold text-rose-500">
              {hardSolved} / {hardTotal}
            </span>
            <span className="text-[10px] text-muted-foreground">Hard</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
