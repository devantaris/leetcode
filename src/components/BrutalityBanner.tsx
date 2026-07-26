import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { AlertTriangle, Flame, Skull, X, Sparkles } from 'lucide-react';

export const BrutalityBanner: React.FC = () => {
  const { stats } = useProgress();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('dsa_banner_dismissed') === 'true';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('dsa_banner_dismissed', 'true');
    setDismissed(true);
  };

  const isStreakHigh = stats.streak >= 7;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-4">
      <div
        className={`relative overflow-hidden rounded-2xl border p-4 shadow-xl transition-all ${
          isStreakHigh
            ? 'border-orange-500/40 bg-gradient-to-r from-orange-950/30 via-[#141018] to-yellow-950/20 shadow-orange-950/20'
            : 'border-red-500/40 bg-gradient-to-r from-red-950/40 via-red-900/20 to-orange-950/30 shadow-red-950/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pr-6">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                isStreakHigh
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                  : 'bg-red-500/20 border-red-500/40 text-red-400'
              }`}
            >
              {isStreakHigh ? (
                <Sparkles className="w-5 h-5 animate-pulse text-yellow-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              )}
            </div>

            <div>
              <h3
                className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                  isStreakHigh ? 'text-orange-300' : 'text-amber-300'
                }`}
              >
                {isStreakHigh ? 'EXCELLENT MOMENTUM' : 'DAILY PRACTICE FOCUS'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 font-medium mt-0.5 leading-snug">
                {isStreakHigh
                  ? `You're on a ${stats.streak}-day streak! Keep up the momentum to master the Top 150 problems before placement season.`
                  : 'Target: 2 LeetCode Top 150 problems daily. Consistency keeps you on track for Jan 15, 2027 placement readiness!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 font-mono text-xs border-t sm:border-t-0 sm:border-l border-gray-800 pt-2 sm:pt-0 sm:pl-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Skull className="w-4 h-4 text-red-500" />
              <span>Missed: <strong className="text-red-400">{stats.missedDaysCount}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-orange-400 font-bold">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>{stats.streak} Streak</span>
            </div>
          </div>
        </div>

        {/* DISMISS BUTTON */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 transition p-1 rounded-lg hover:bg-black/40"
          title="Dismiss Banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
