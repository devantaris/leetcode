// GrindOS — Supabase Client
// Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from Vite env vars.
// Returns null if not configured — leaderboard features degrade gracefully.

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Wrap in try/catch — if the key format is wrong or the lib throws,
// we degrade gracefully (leaderboard shows "not configured") instead of
// crashing the entire app at module load time.
let _supabase: SupabaseClient | null = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (err) {
  console.warn('[GrindOS] Supabase init failed — leaderboard disabled:', err);
}

// Export a null-safe client; callers must check for null before using
export const supabase: SupabaseClient | null = _supabase;

export const isLeaderboardEnabled = !!supabase;

// ─── Leaderboard Row Type ─────────────────────────────────────────────────────
export interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string;
  tagline: string;
  is_anonymous: boolean;
  solved_count: number;
  streak: number;
  days_remaining: number;
  readiness_pct: number;
  last_synced_at: string;
  created_at: string;
}
