import React from 'react';
import { TodayMission } from '../components/TodayMission';
import { BrutalityBanner } from '../components/BrutalityBanner';
import { AICoachCard } from '../components/AICoachCard';
import { DailyFocusTimer } from '../components/DailyFocusTimer';
import { Top150Card } from '../components/Top150Card';
import { StatsAnalyticsDashboard } from '../components/StatsAnalyticsDashboard';
import { HeatmapGrid } from '../components/HeatmapGrid';

export const DashboardPage: React.FC = () => {
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Dynamic Motivation & Streak Alert */}
      <BrutalityBanner />

      {/* Primary Operations Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 24,
        alignItems: 'start'
      }}>
        {/* Left Column: Today's Mission */}
        <div>
          <TodayMission />
        </div>

        {/* Right Column: AI Placement Coach & Deep-Work Stopwatch */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="modern-card">
            <AICoachCard />
          </div>
          <div className="modern-card">
            <DailyFocusTimer />
          </div>
        </div>
      </div>

      {/* Intelligence & Benchmark Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 24,
        alignItems: 'start'
      }}>
        <div className="modern-card">
          <Top150Card />
        </div>
        <div>
          <StatsAnalyticsDashboard />
        </div>
      </div>

      {/* 25-Week Curriculum Matrix */}
      <div className="modern-card">
        <HeatmapGrid />
      </div>
    </div>
  );
};
