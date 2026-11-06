// GrindOS — Centralized Storage Key Registry
// All localStorage and sessionStorage keys in one place.
// Prevents key collisions and makes migration/namespacing trivial.

const PREFIX = 'go'; // GrindOS

export const STORAGE_KEYS = {
  // Core progress (localStorage)
  progress: `${PREFIX}_progress_v2`,
  streak: `${PREFIX}_streak_v2`,
  solveHistory: `${PREFIX}_solve_history_v2`,
  userProfile: `${PREFIX}_user_profile_v1`,

  // Timer state (sessionStorage)
  timerSeconds: `${PREFIX}_timer_seconds`,
  timerTotal: `${PREFIX}_timer_total`,
  timerActive: `${PREFIX}_timer_active`,
  timerStartedAt: `${PREFIX}_timer_started_at`,

  // UI & Audio state
  bannerDismissed: `${PREFIX}_banner_dismissed`,
  soundEnabled: `${PREFIX}_sound_enabled`,

  // Leaderboard (localStorage)
  leaderboardOptIn: `${PREFIX}_leaderboard_optin`,
  leaderboardAnonymous: `${PREFIX}_leaderboard_anonymous`,
  leaderboardUserId: `${PREFIX}_leaderboard_user_id`,

  // Placements, Notes & Cohort (localStorage)
  placements: `${PREFIX}_placements_v1`,
  activeCohort: `${PREFIX}_active_cohort_v1`,
  problemNotes: `${PREFIX}_problem_notes_v1`,
  flaggedProblems: `${PREFIX}_flagged_problems_v1`,
} as const;

export type StorageKeys = typeof STORAGE_KEYS;

// --- Storage Cleanup ---
// Purges legacy and local progress keys: GrindOS is strictly cloud-only via Supabase.

export function migrateLegacyStorageKeys(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;

    // Purge legacy and local progress keys: GrindOS is strictly cloud-only via Supabase
    const keysToPurge = [
      'dsa_progress_v2',
      'dsa_streak_v2',
      'dsa_solve_history_v2',
      'dsa_user_profile_v1',
      'dsa_last_date_v2',
      STORAGE_KEYS.progress,
      STORAGE_KEYS.solveHistory,
      STORAGE_KEYS.streak,
      STORAGE_KEYS.userProfile,
      STORAGE_KEYS.placements,
      STORAGE_KEYS.problemNotes,
      STORAGE_KEYS.flaggedProblems,
    ];

    for (const key of keysToPurge) {
      localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn('[GrindOS] Storage purge safely skipped:', err);
  }
}
