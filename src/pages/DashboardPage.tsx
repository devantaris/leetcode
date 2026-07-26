import React from 'react';
import { TodayMission } from '../components/TodayMission';
import { BrutalityBanner } from '../components/BrutalityBanner';
import { Top150Card } from '../components/Top150Card';
import { StatsAnalyticsDashboard } from '../components/StatsAnalyticsDashboard';
import { HeatmapGrid } from '../components/HeatmapGrid';
import { DailyFocusTimer } from '../components/DailyFocusTimer';
import { motion } from 'framer-motion';

export const DashboardPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-6"
    >
      {/* TODAY'S MISSION HERO */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-4">
        <TodayMission />
      </div>

      {/* BRUTALITY BANNER */}
      <BrutalityBanner />

      {/* LEETCODE TOP 150 PROGRESS */}
      <Top150Card />

      {/* STATS & METRICS */}
      <StatsAnalyticsDashboard />

      {/* 140-DAY CURRICULUM MATRIX */}
      <div className="w-full max-w-7xl mx-auto px-4">
        <HeatmapGrid />
      </div>

      {/* PRACTICE TIMER */}
      <div className="w-full max-w-7xl mx-auto px-4 mb-8">
        <DailyFocusTimer />
      </div>
    </motion.div>
  );
};
