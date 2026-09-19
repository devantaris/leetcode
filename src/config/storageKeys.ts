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

  // UI state (sessionStorage)
  bannerDismissed: `${PREFIX}_banner_dismissed`,

  // Leaderboard (localStorage)
  leaderboardOptIn: `${PREFIX}_leaderboard_optin`,
  leaderboardAnonymous: `${PREFIX}_leaderboard_anonymous`,
  leaderboardUserId: `${PREFIX}_leaderboard_user_id`,
} as const;

export type StorageKeys = typeof STORAGE_KEYS;

// --- Data Migration ---
// Migrate old 'dsa_' prefixed keys to new 'go_' prefix.
// Runs once on app load. Safe to call multiple times (idempotent).
const LEGACY_KEY_MAP: [string, string][] = [
  ['dsa_progress_v2', STORAGE_KEYS.progress],
  ['dsa_streak_v2', STORAGE_KEYS.streak],
  ['dsa_solve_history_v2', STORAGE_KEYS.solveHistory],
  ['dsa_user_profile_v1', STORAGE_KEYS.userProfile],
];

export function migrateLegacyStorageKeys(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;

    for (const [oldKey, newKey] of LEGACY_KEY_MAP) {
      const oldData = localStorage.getItem(oldKey);
      const newData = localStorage.getItem(newKey);

      // Only migrate if old data exists AND new key is empty
      // (don't overwrite if user already has new-format data)
      if (oldData && !newData) {
        localStorage.setItem(newKey, oldData);
        console.info(`[GrindOS] Migrated storage: ${oldKey} → ${newKey}`);
      }

      // Clean up old key after migration (regardless)
      if (oldData) {
        localStorage.removeItem(oldKey);
      }
    }

    // Also clean up the dead KEY_LAST_DATE that was removed earlier
    localStorage.removeItem('dsa_last_date_v2');
  } catch (err) {
    console.warn('[GrindOS] Storage migration safely skipped:', err);
  }
}
