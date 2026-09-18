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
} as const;

export type StorageKeys = typeof STORAGE_KEYS;
