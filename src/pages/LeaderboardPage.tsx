import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Target, TrendingUp, RefreshCw, Crown, Shield, Zap, Globe, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useLeaderboard } from '../hooks/useLeaderboard';
import type { LeaderboardEntry } from '../config/supabaseClient';
import { format, parseISO } from 'date-fns';

// ─── Rank Crown ───────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return <Crown size={18} className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]" />;
  if (rank === 2)
    return <Crown size={16} className="text-slate-300" />;
  if (rank === 3)
    return <Crown size={16} className="text-amber-600" />;
  return <span className="text-gray-500 font-mono text-sm w-[18px] text-center">{rank}</span>;
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, value, label, color }: { icon: React.ElementType; value: string | number; label: string; color: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
      <Icon size={11} />
      <span>{value}</span>
      <span className="opacity-60">{label}</span>
    </div>
  );
}

// ─── Entry Row ────────────────────────────────────────────────────────────────
function EntryRow({ entry, rank, isMe }: { entry: LeaderboardEntry; rank: number; isMe: boolean }) {
  const isTop3 = rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(rank * 0.03, 0.6) }}
      className={`
        relative flex items-center gap-4 px-4 py-3 rounded-xl border transition-all
        ${isMe
          ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.15)]'
          : isTop3
            ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
        }
      `}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        <RankBadge rank={rank} />
      </div>

      {/* Name + tagline */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-semibold truncate text-sm ${isMe ? 'text-red-300' : 'text-white'}`}>
            {entry.is_anonymous ? 'Anonymous' : entry.display_name}
          </span>
          {isMe && (
            <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
              YOU
            </span>
          )}
        </div>
        {entry.tagline && !entry.is_anonymous && (
          <p className="text-gray-500 text-xs truncate mt-0.5">{entry.tagline}</p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatPill
          icon={Trophy}
          value={entry.solved_count}
          label="solved"
          color="text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
        />
        <StatPill
          icon={Flame}
          value={entry.streak}
          label="streak"
          color="text-orange-400 border-orange-500/20 bg-orange-500/5"
        />
        <StatPill
          icon={TrendingUp}
          value={`${entry.readiness_pct}%`}
          label="ready"
          color="text-violet-400 border-violet-500/20 bg-violet-500/5"
        />
        <div className="hidden sm:block">
          <StatPill
            icon={Target}
            value={entry.days_remaining}
            label="days left"
            color="text-sky-400 border-sky-500/20 bg-sky-500/5"
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Opt-In Panel ─────────────────────────────────────────────────────────────
function OptInPanel({
  isOptedIn,
  isAnonymous,
  isSyncing,
  onToggleOptIn,
  onToggleAnonymous,
}: {
  isOptedIn: boolean;
  isAnonymous: boolean;
  isSyncing: boolean;
  onToggleOptIn: () => void;
  onToggleAnonymous: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
        <Shield size={14} className="text-red-400" />
        Your Visibility
      </h3>

      {/* Opt-in toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Appear on Leaderboard</p>
          <p className="text-xs text-gray-500 mt-0.5">Your stats sync anonymously every 5 min</p>
        </div>
        <button
          onClick={onToggleOptIn}
          disabled={isSyncing}
          className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
            isOptedIn ? 'bg-red-500' : 'bg-white/10'
          }`}
          aria-label={isOptedIn ? 'Leave leaderboard' : 'Join leaderboard'}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              isOptedIn ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Anonymous toggle (only shown when opted in) */}
      <AnimatePresence>
        {isOptedIn && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between pt-3 border-t border-white/5"
          >
            <div className="flex items-center gap-2">
              {isAnonymous ? <EyeOff size={14} className="text-gray-400" /> : <Eye size={14} className="text-gray-400" />}
              <div>
                <p className="text-sm font-medium text-white">Show as Anonymous</p>
                <p className="text-xs text-gray-500 mt-0.5">Hide your name from other users</p>
              </div>
            </div>
            <button
              onClick={onToggleAnonymous}
              className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                isAnonymous ? 'bg-red-500' : 'bg-white/10'
              }`}
              aria-label={isAnonymous ? 'Show name' : 'Go anonymous'}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  isAnonymous ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opt-out warning */}
      {!isOptedIn && (
        <p className="text-xs text-gray-600 flex items-start gap-1.5 pt-1">
          <AlertCircle size={11} className="flex-shrink-0 mt-0.5" />
          Opting out permanently removes your row from the global board.
        </p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function LeaderboardPage() {
  const { stats, userProfile } = useProgress();
  const {
    entries,
    myEntry,
    myRank,
    isOptedIn,
    isAnonymous,
    toggleOptIn,
    toggleAnonymous,
    syncStats,
    fetchEntries,
    isSyncing,
    isFetching,
    isEnabled,
    lastSyncedAt,
    error,
  } = useLeaderboard();

  // Sync on mount and whenever stats change (debounced inside hook)
  const handleSync = useCallback(async () => {
    await syncStats({
      solvedCount: stats.solvedCount,
      streak: stats.streak,
      daysLeft: stats.daysLeft,
      oddsPercentage: stats.oddsPercentage,
      displayName: userProfile.name,
      tagline: userProfile.tagline,
    });
  }, [syncStats, stats, userProfile]);

  useEffect(() => {
    if (isOptedIn) {
      handleSync();
    }
  }, [isOptedIn, handleSync]);

  const userEntryInList = entries.some(e => e.user_id === (myEntry?.user_id ?? ''));

  return (
    <div className="min-h-screen bg-[#060609] text-white pb-16">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-red-950/20 to-transparent">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between gap-6 flex-wrap"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Globe size={20} className="text-red-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight">Global Leaderboard</h1>
                  <p className="text-gray-500 text-sm">Top {Math.min(entries.length, 50)} active grinders worldwide</p>
                </div>
              </div>

              {/* Live indicator */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs text-gray-500">
                  {isFetching ? 'Refreshing…' : lastSyncedAt
                    ? `Last synced ${format(lastSyncedAt, 'h:mm a')}`
                    : 'Live'}
                </span>
              </div>
            </div>

            {/* Refresh + your rank */}
            <div className="flex items-center gap-3">
              {myRank && (
                <div className="text-center px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Your Rank</p>
                  <p className="text-2xl font-black text-red-400">#{myRank}</p>
                </div>
              )}
              <button
                onClick={fetchEntries}
                disabled={isFetching}
                className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50"
                title="Refresh leaderboard"
              >
                <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Body ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* Left: table */}
        <div className="space-y-3 min-w-0">

          {/* Disabled state */}
          {!isEnabled && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
              <Lock size={32} className="text-gray-700 mx-auto mb-4" />
              <p className="text-white font-semibold text-lg mb-2">Leaderboard Not Configured</p>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                The app owner hasn't connected a database yet. Leaderboard rankings will appear here once configured.
              </p>
            </div>
          )}

          {/* Error */}
          {isEnabled && error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3 text-sm text-red-400">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Opt-in CTA (when enabled but not opted in) */}
          {isEnabled && !isOptedIn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center"
            >
              <Zap size={28} className="text-red-400 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">You're not on the board yet</p>
              <p className="text-gray-500 text-sm mb-4">
                Join anonymously and see how you stack up against other grinders.
                Stats are synced every 5 minutes. Opt out anytime.
              </p>
              <button
                onClick={toggleOptIn}
                className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors"
              >
                Join the Leaderboard
              </button>
            </motion.div>
          )}

          {/* Syncing indicator */}
          {isEnabled && isSyncing && (
            <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
              <RefreshCw size={12} className="animate-spin" />
              Syncing your stats…
            </div>
          )}

          {/* Entries */}
          {isEnabled && entries.length === 0 && !isFetching && !error && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-10 text-center">
              <Trophy size={32} className="text-gray-700 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">No entries yet</p>
              <p className="text-gray-500 text-sm">
                Be the first on the global leaderboard.
              </p>
            </div>
          )}

          {isEnabled && isFetching && entries.length === 0 && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Entry rows */}
          {isEnabled && entries.length > 0 && (
            <div className="space-y-2">
              {/* Pinned "you" row if not in top N */}
              {isOptedIn && myEntry && !userEntryInList && (
                <>
                  <EntryRow entry={myEntry} rank={myRank ?? 99} isMe />
                  <div className="border-t border-white/5 my-2" />
                </>
              )}

              {entries.map((entry, i) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  rank={i + 1}
                  isMe={entry.user_id === myEntry?.user_id}
                />
              ))}
            </div>
          )}

          {entries.length > 0 && (
            <p className="text-center text-gray-700 text-xs mt-4">
              Only users active in the last 30 days shown · {entries.length} active grinder{entries.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Right: sidebar */}
        <div className="space-y-4">
          {/* Your stats card */}
          {isEnabled && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Trophy size={14} className="text-red-400" />
                Your Stats
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Solved', value: stats.solvedCount, icon: Trophy, color: 'text-emerald-400' },
                  { label: 'Streak', value: stats.streak, icon: Flame, color: 'text-orange-400' },
                  { label: 'Days Left', value: stats.daysLeft, icon: Target, color: 'text-sky-400' },
                  { label: 'Readiness', value: `${stats.oddsPercentage}%`, icon: TrendingUp, color: 'text-violet-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                    <Icon size={16} className={`${color} mx-auto mb-1`} />
                    <p className={`text-xl font-black ${color}`}>{value}</p>
                    <p className="text-gray-600 text-[11px] uppercase tracking-wider">{label}</p>
                  </div>
                ))}
              </div>
              {isOptedIn && (
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'Syncing…' : 'Sync Now'}
                </button>
              )}
            </div>
          )}

          {/* Privacy panel */}
          {isEnabled && (
            <OptInPanel
              isOptedIn={isOptedIn}
              isAnonymous={isAnonymous}
              isSyncing={isSyncing}
              onToggleOptIn={toggleOptIn}
              onToggleAnonymous={toggleAnonymous}
            />
          )}

          {/* Legend */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest">How Rankings Work</h4>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <Trophy size={11} className="text-emerald-500" />
                Primary sort: problems solved
              </li>
              <li className="flex items-center gap-2">
                <Flame size={11} className="text-orange-500" />
                Tiebreak: current streak
              </li>
              <li className="flex items-center gap-2">
                <Target size={11} className="text-sky-500" />
                Only last 30 days shown
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
