// GrindOS — useLeaderboard Hook
// Manages opt-in state, anonymous user ID, stat sync, and leaderboard fetching.

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isLeaderboardEnabled } from '../config/supabaseClient';
import type { LeaderboardEntry } from '../config/supabaseClient';
import { STORAGE_KEYS } from '../config/storageKeys';
import { AuthService } from '../services/authService';
import { calculateMaxStreak, calculateDaysActive } from '../utils/progressHelpers';

const SYNC_DEBOUNCE_MS = 5 * 60 * 1000; // sync at most every 5 minutes
const TOP_N = 50;

// ─── Anonymous User ID ────────────────────────────────────────────────────────
function getOrCreateUserId(): string {
  const authUser = AuthService.getUser();
  if (authUser?.id) return authUser.id;
  const existing = localStorage.getItem(STORAGE_KEYS.leaderboardUserId);
  if (existing) return existing;
  const newId = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEYS.leaderboardUserId, newId);
  return newId;
}

// ─── Hook Types ───────────────────────────────────────────────────────────────
export interface LeaderboardStats {
  solvedCount: number;
  streak: number;
  highestStreak?: number;
  totalDaysSolved?: number;
  daysActive?: number;
  daysLeft: number;
  oddsPercentage: number;
  displayName: string;
  tagline: string;
}

export interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  myEntry: LeaderboardEntry | null;
  myRank: number | null;
  isOptedIn: boolean;
  isAnonymous: boolean;
  toggleOptIn: () => Promise<void>;
  toggleAnonymous: () => Promise<void>;
  syncStats: (stats: LeaderboardStats) => Promise<void>;
  fetchEntries: () => Promise<void>;
  isSyncing: boolean;
  isFetching: boolean;
  isEnabled: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useLeaderboard(): UseLeaderboardReturn {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [isOptedIn, setIsOptedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.leaderboardOptIn) === 'true';
  });
  const [isAnonymous, setIsAnonymous] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.leaderboardAnonymous) === 'true';
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastSyncTimestampRef = useRef<number>(0);
  const userId = useRef<string>(getOrCreateUserId());

  // Keep userId aligned with current auth user
  useEffect(() => {
    const unsub = AuthService.subscribe((u) => {
      userId.current = u?.id || getOrCreateUserId();
    });
    return unsub;
  }, []);

  // ── Fetch top N entries ────────────────────────────────────────────────────
  const fetchEntries = useCallback(async () => {
    if (!isLeaderboardEnabled || !supabase) return;
    setIsFetching(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .gte('last_synced_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('solved_count', { ascending: false })
        .order('streak', { ascending: false })
        .limit(TOP_N);

      if (fetchErr) throw fetchErr;

      let list: LeaderboardEntry[] = (data ?? []).map((e: any) => ({
        ...e,
        highest_streak: e.highest_streak || e.streak || 0,
        total_days_solved: e.total_days_solved || (e.streak > 0 ? e.streak : 0),
        days_active: e.days_active || calculateDaysActive(e.created_at),
      }));

      // Enrich with real user_progress history so metrics are 100% accurate
      const userIds = list.map(e => e.user_id).filter(Boolean);
      if (userIds.length > 0) {
        try {
          const { data: progressRows } = await supabase
            .from('user_progress')
            .select('user_id, solved_at')
            .in('user_id', userIds);

          if (progressRows && progressRows.length > 0) {
            const datesByUser = new Map<string, string[]>();
            for (const row of progressRows) {
              if (!row.solved_at) continue;
              const dStr = row.solved_at.split('T')[0];
              const arr = datesByUser.get(row.user_id) || [];
              arr.push(dStr);
              datesByUser.set(row.user_id, arr);
            }

            list = list.map(entry => {
              const userDates = datesByUser.get(entry.user_id) || [];
              const uniqueDates = Array.from(new Set(userDates));
              const derivedHighestStreak = calculateMaxStreak(uniqueDates);
              const derivedTotalDaysSolved = uniqueDates.length;
              const derivedDaysActive = calculateDaysActive(entry.created_at);

              return {
                ...entry,
                highest_streak: Math.max(entry.highest_streak || 0, entry.streak || 0, derivedHighestStreak),
                total_days_solved: Math.max(entry.total_days_solved || 0, derivedTotalDaysSolved),
                days_active: entry.days_active || derivedDaysActive,
              };
            });
          }
        } catch (enrichErr) {
          console.warn('[Leaderboard] Progress enrichment skipped:', enrichErr);
        }
      }

      setEntries(list);

      // Find our own entry
      const mine = list.find(e => e.user_id === userId.current) ?? null;
      setMyEntry(mine);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
      setError(msg);
    } finally {
      setIsFetching(false);
    }
  }, []);

  // ── Sync local stats to Supabase ───────────────────────────────────────────
  const syncStats = useCallback(async (stats: LeaderboardStats) => {
    if (!isLeaderboardEnabled || !supabase || !isOptedIn) return;

    // Debounce: don't sync more than once per 5 min
    const now = Date.now();
    if (now - lastSyncTimestampRef.current < SYNC_DEBOUNCE_MS) return;
    lastSyncTimestampRef.current = now;

    setIsSyncing(true);
    setError(null);
    try {
      const payload: Record<string, any> = {
        user_id: userId.current,
        display_name: isAnonymous ? 'Anonymous' : stats.displayName,
        tagline: isAnonymous ? '' : stats.tagline,
        is_anonymous: isAnonymous,
        solved_count: stats.solvedCount,
        streak: stats.streak,
        highest_streak: stats.highestStreak ?? stats.streak,
        total_days_solved: stats.totalDaysSolved ?? 0,
        days_active: stats.daysActive ?? 1,
        days_remaining: Math.max(0, stats.daysLeft),
        readiness_pct: Math.min(100, Math.max(0, stats.oddsPercentage)),
        last_synced_at: new Date().toISOString(),
      };

      let { error: upsertErr } = await supabase
        .from('leaderboard_entries')
        .upsert(payload, { onConflict: 'user_id' });

      // If columns don't exist in Supabase yet, retry with base columns
      if (upsertErr && (upsertErr.code === '42703' || upsertErr.message?.includes('column'))) {
        const { highest_streak, total_days_solved, days_active, ...basePayload } = payload;
        const retry = await supabase
          .from('leaderboard_entries')
          .upsert(basePayload, { onConflict: 'user_id' });
        upsertErr = retry.error;
      }

      if (upsertErr) throw upsertErr;
      setLastSyncedAt(new Date());
      // Refresh entries after sync
      await fetchEntries();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      setError(msg);
    } finally {
      setIsSyncing(false);
    }
  }, [isOptedIn, isAnonymous, fetchEntries]);

  // ── Opt-in toggle ──────────────────────────────────────────────────────────
  const toggleOptIn = useCallback(async () => {
    const newValue = !isOptedIn;
    setIsOptedIn(newValue);
    localStorage.setItem(STORAGE_KEYS.leaderboardOptIn, String(newValue));

    if (!newValue && isLeaderboardEnabled && supabase) {
      // Hard delete on opt-out
      try {
        await supabase
          .from('leaderboard_entries')
          .delete()
          .eq('user_id', userId.current);
        setMyEntry(null);
        // Remove from local list
        setEntries(prev => prev.filter(e => e.user_id !== userId.current));
      } catch (err: unknown) {
        console.warn('[GrindOS] Leaderboard opt-out delete failed:', err);
      }
    }
  }, [isOptedIn]);

  // ── Anonymous toggle ───────────────────────────────────────────────────────
  const toggleAnonymous = useCallback(async () => {
    const newValue = !isAnonymous;
    setIsAnonymous(newValue);
    localStorage.setItem(STORAGE_KEYS.leaderboardAnonymous, String(newValue));
    // Reset debounce so next sync fires immediately
    lastSyncTimestampRef.current = 0;
  }, [isAnonymous]);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // ── Compute rank ───────────────────────────────────────────────────────────
  const myRank = myEntry
    ? entries.findIndex(e => e.user_id === myEntry.user_id) + 1 || null
    : null;

  return {
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
    isEnabled: isLeaderboardEnabled,
    lastSyncedAt,
    error,
  };
}
