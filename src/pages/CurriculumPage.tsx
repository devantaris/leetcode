import React from 'react';
import { SearchAndFilter } from '../components/SearchAndFilter';
import { WeekAccordion } from '../components/WeekAccordion';
import { useProgress } from '../context/ProgressContext';
import { CURRICULUM } from '../data/curriculumStats';
import { BookOpen, CheckCircle2, Flame, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const CurriculumPage: React.FC = () => {
  const { stats } = useProgress();
  const pct = Math.round((stats.solvedCount / Math.max(1, stats.totalProblems)) * 100);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* ── Title & Quick Telemetry Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="size-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <BookOpen className="size-3.5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
              Syllabus &amp; Problem Explorer
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            20-week structured progression covering {CURRICULUM.totalProblems} foundational patterns and interview questions.
          </p>
        </div>

        {/* Quick telemetry badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="font-mono text-xs py-1 px-2.5 gap-1.5 border-border/60">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>
              <strong className="text-foreground">{stats.solvedCount}</strong> / {CURRICULUM.totalProblems} solved ({pct}%)
            </span>
          </Badge>

          {stats.streak > 0 && (
            <Badge variant="outline" className="font-mono text-xs py-1 px-2.5 gap-1.5 border-amber-500/30 text-amber-500 bg-amber-500/10">
              <Flame className="size-3.5 fill-amber-500/20" />
              <span>{stats.streak}d streak</span>
            </Badge>
          )}

          <Badge variant="outline" className="font-mono text-xs py-1 px-2.5 gap-1.5 border-purple-500/30 text-purple-400 bg-purple-500/10">
            <Award className="size-3.5" />
            <span>Top 150 Set</span>
          </Badge>
        </div>
      </div>

      {/* Instant Search & Filter */}
      <SearchAndFilter />

      {/* Week-by-Week Accordion */}
      <WeekAccordion />
    </div>
  );
};
