// GrindOS — Production Supabase Client
// Reads from Vite environment variables OR user-provided localStorage credentials.
// Seamlessly allows live cross-device synchronization and real-time leaderboard.

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://bjjfiycwhkghbibffmtr.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_LZEFz60xje4AKVpppwyIGQ_VO-kxcse';

const ENV_URL = (
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ||
  DEFAULT_SUPABASE_URL
)?.trim();

const ENV_KEY = (
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
  DEFAULT_SUPABASE_KEY
)?.trim();

const STORAGE_URL_KEY = 'grindos_supabase_url';
const STORAGE_ANON_KEY = 'grindos_supabase_anon_key';

let _client: SupabaseClient | null = null;

export function normalizeSupabaseUrl(rawUrl: string): string {
  let u = rawUrl.trim();
  // If user pasted dashboard URL: https://supabase.com/dashboard/project/ojyvn...
  const dashboardMatch = u.match(/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }
  // Strip trailing slashes
  u = u.replace(/\/+$/, '');
  // Add https:// if missing
  if (u && !u.startsWith('http://') && !u.startsWith('https://')) {
    u = 'https://' + u;
  }
  return u;
}

export function getActiveSupabaseCredentials(): { url: string; key: string; source: 'env' | 'custom' | 'none' } {
  if (ENV_URL && ENV_KEY && !ENV_URL.includes('your-project-id')) {
    return { url: normalizeSupabaseUrl(ENV_URL), key: ENV_KEY, source: 'env' };
  }
  const customUrl = localStorage.getItem(STORAGE_URL_KEY)?.trim();
  const customKey = localStorage.getItem(STORAGE_ANON_KEY)?.trim();
  if (customUrl && customKey) {
    const clean = normalizeSupabaseUrl(customUrl);
    if (clean !== customUrl) {
      localStorage.setItem(STORAGE_URL_KEY, clean);
    }
    return { url: clean, key: customKey, source: 'custom' };
  }
  return { url: '', key: '', source: 'none' };
}

export function initializeSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  if (customUrl && customKey) {
    const clean = normalizeSupabaseUrl(customUrl);
    localStorage.setItem(STORAGE_URL_KEY, clean);
    localStorage.setItem(STORAGE_ANON_KEY, customKey.trim());
  }

  const { url, key } = getActiveSupabaseCredentials();

  if (!url || !key) {
    _client = null;
    return null;
  }

  try {
    _client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    });
    return _client;
  } catch (err) {
    console.warn('[GrindOS] Supabase initialization failed:', err);
    _client = null;
    return null;
  }
}

export function clearCustomSupabaseCredentials(): void {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_ANON_KEY);
  initializeSupabaseClient();
}

// Initial client creation
_client = initializeSupabaseClient();

export const supabase: SupabaseClient | null = _client;

export function getSupabase(): SupabaseClient | null {
  if (!_client) {
    _client = initializeSupabaseClient();
  }
  return _client;
}

export const isLeaderboardEnabled = !!_client;
export const checkIsLeaderboardEnabled = (): boolean => !!getSupabase();

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
