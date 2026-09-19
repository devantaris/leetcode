// GrindOS — LeaderboardOptInBanner
// Floats on Dashboard after day 3, nudges user to join global leaderboard.
// Dismissed permanently once closed.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { isLeaderboardEnabled } from '../config/supabaseClient';
import { STORAGE_KEYS } from '../config/storageKeys';

const BANNER_DISMISSED_KEY = 'go_leaderboard_banner_dismissed';
const SHOW_AFTER_DAYS = 2; // show after user has been active for 2+ days

export function LeaderboardOptInBanner() {
  const { stats } = useProgress();

  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
  });

  const isOptedIn = localStorage.getItem(STORAGE_KEYS.leaderboardOptIn) === 'true';

  // Conditions to show: leaderboard configured, not dismissed, not opted in, active 2+ days
  const shouldShow =
    isLeaderboardEnabled &&
    !dismissed &&
    !isOptedIn &&
    stats.completedDaysCount >= SHOW_AFTER_DAYS;

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="mx-4 mb-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <Globe size={15} className="text-red-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">You have {stats.solvedCount} problems solved — see how you rank</p>
            <p className="text-xs text-gray-500">Join the global leaderboard anonymously. Opt out anytime.</p>
          </div>

          <Link
            to="/leaderboard"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors flex-shrink-0"
          >
            See Board <ArrowRight size={12} />
          </Link>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-white/5 text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0"
            aria-label="Dismiss leaderboard banner"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
