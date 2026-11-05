import React from 'react';
import { TodayMission } from '../components/TodayMission';
import { BrutalityBanner } from '../components/BrutalityBanner';
import { AICoachCard } from '../components/AICoachCard';
import { DailyFocusTimer } from '../components/DailyFocusTimer';
import { Top150Card } from '../components/Top150Card';
import { StatsAnalyticsDashboard } from '../components/StatsAnalyticsDashboard';
import { HeatmapGrid } from '../components/HeatmapGrid';
import { CatchUpQueueCard } from '../components/CatchUpQueueCard';

export const DashboardPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full">
      {/* Dynamic Motivation & Streak Alert */}
      <BrutalityBanner />

      {/* Catch-Up Queue — only shown when backlog exists */}
      <CatchUpQueueCard />

      {/* Primary Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Primary: Today's Mission */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <TodayMission />
        </div>

        {/* Right / Secondary: AI Placement Coach & Deep-Work Stopwatch */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          <AICoachCard />
          <DailyFocusTimer />
        </div>
      </div>

      {/* Intelligence & Benchmark Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 xl:col-span-4">
          <Top150Card />
        </div>
        <div className="lg:col-span-7 xl:col-span-8">
          <StatsAnalyticsDashboard />
        </div>
      </div>

      {/* 140-Day Curriculum Matrix */}
      <HeatmapGrid />
    </div>
  );
};
