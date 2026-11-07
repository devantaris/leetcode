import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { CURRICULUM } from '../data/curriculumStats';
import { TodayMission } from '../components/TodayMission';
import { BrutalityBanner } from '../components/BrutalityBanner';
import { DailyFocusTimer } from '../components/DailyFocusTimer';
import { Top150Card } from '../components/Top150Card';
import { StatsAnalyticsDashboard } from '../components/StatsAnalyticsDashboard';
import { HeatmapGrid } from '../components/HeatmapGrid';
import { CatchUpQueueCard } from '../components/CatchUpQueueCard';
import { CheckCircle2, Flame, Target, Award, Plus, Download, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const DashboardPage: React.FC = () => {
  const { stats, exportJSON, userProfile } = useProgress();
  const pct = Math.round((stats.solvedCount / Math.max(1, stats.totalProblems)) * 100);
  const dailyTarget = userProfile?.dailyQuota || CURRICULUM.dailyTarget;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full">
      {/* ── DASHBOARD HEADER (DONEZO STYLE) ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Plan, prioritize, and accomplish your DSA missions with ease.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/curriculum">
            <Button
              size="sm"
              className="h-9 px-4 rounded-xl text-xs gap-1.5 font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <Plus className="size-4" />
              <span>Explore Problems</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={exportJSON}
            className="h-9 px-3.5 rounded-xl text-xs gap-1.5 border-border bg-card text-foreground hover:bg-muted"
          >
            <Download className="size-3.5" />
            <span>Export Data</span>
          </Button>
        </div>
      </div>

      {/* ── 4 SUMMARY METRIC TILES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Tile 1: Signature Forest Green Primary Tile */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[140px] transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold opacity-90">Total Solved</span>
            <div className="size-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-4 text-white" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight font-sans">
              {stats.solvedCount}
            </div>
            <div className="text-[11px] opacity-80 mt-1">
              {pct}% of curriculum ({stats.totalProblems} total)
            </div>
          </div>
        </div>

        {/* Tile 2: Crisp Surface Tile */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[140px] transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Streak</span>
            <div className="size-7 rounded-full border border-border bg-amber-500/10 flex items-center justify-center shrink-0">
              <Flame className="size-4 text-amber-500" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground font-sans">
              {stats.streak}d
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              🔥 Consistent daily discipline
            </div>
          </div>
        </div>

        {/* Tile 3: Crisp Surface Tile */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[140px] transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Daily Target</span>
            <div className="size-7 rounded-full border border-border bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="size-4 text-primary" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground font-sans">
              {dailyTarget}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Problems required daily
            </div>
          </div>
        </div>

        {/* Tile 4: Crisp Surface Tile */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[140px] transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Interview Readiness</span>
            <div className="size-7 rounded-full border border-border bg-primary/10 flex items-center justify-center shrink-0">
              <Award className="size-4 text-primary" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground font-sans">
              {stats.oddsPercentage}%
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Top candidate benchmark
            </div>
          </div>
        </div>
      </div>

      {/* Day 1 Onboarding Kickoff Prompt if user has zero solves */}
      {stats.solvedCount === 0 && (
        <div className="p-4 sm:p-5 rounded-2xl border border-primary/30 bg-primary/5 flex items-center justify-between flex-wrap gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Welcome to Day 1, {userProfile?.name || 'Candidate'}!</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Your 140-day algorithmic preparation sequence is initialized. Start with today&apos;s mission below to begin your solve trajectory.
              </div>
            </div>
          </div>
          <Link to="/curriculum">
            <Button size="sm" className="h-8.5 text-xs font-semibold gap-1.5">
              <span>View Day 1 Mission</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Dynamic Motivation & Streak Alert */}
      <BrutalityBanner />

      {/* Catch-Up Queue — only shown when backlog exists */}
      <CatchUpQueueCard />

      {/* Primary Operations Grid (Today's Mission & Timer / Benchmark) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Today's Mission (7/8 columns) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <TodayMission />
          <StatsAnalyticsDashboard />
        </div>

        {/* Right: Deep-Work Stopwatch & Top 150 Benchmark (4/5 columns) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          <DailyFocusTimer />
          <Top150Card />
        </div>
      </div>

      {/* 140-Day Curriculum Matrix */}
      <HeatmapGrid />
    </div>
  );
};
