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
    <div className="flex flex-col gap-6 w-full">
      {/* ── Title & Quick Telemetry Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <BookOpen className="size-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
              Syllabus &amp; Problem Explorer
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            20-week structured progression covering {CURRICULUM.totalProblems} foundational patterns and interview questions.
          </p>
        </div>

        {/* Quick telemetry badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="font-mono text-xs py-1 px-2.5 gap-1.5 border-border">
            <CheckCircle2 className="size-3.5 text-primary" />
            <span>
              <strong className="text-foreground">{stats.solvedCount}</strong> / {CURRICULUM.totalProblems} solved ({pct}%)
            </span>
          </Badge>

          {stats.streak > 0 && (
            <Badge variant="outline" className="font-mono text-xs py-1 px-2.5 gap-1.5 border-primary/30 text-primary bg-primary/10">
              <Flame className="size-3.5 fill-primary/20" />
              <span>{stats.streak}d streak</span>
            </Badge>
          )}

          <Badge variant="outline" className="font-mono text-xs py-1 px-2.5 gap-1.5 border-primary/30 text-primary bg-primary/10">
            <Award className="size-3.5" />
            <span>Top 150 Benchmark</span>
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
