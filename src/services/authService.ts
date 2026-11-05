// GrindOS — Production Authentication Service
// Supports Supabase Auth with automatic local offline fallback.

import { getSupabase } from '../config/supabaseClient';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isAnonymous: boolean;
  provider: 'supabase' | 'local';
}

const LOCAL_USER_KEY = 'grindos_auth_user';

export class AuthService {
  private static currentUser: AuthUser | null = null;
  private static listeners: Array<(user: AuthUser | null) => void> = [];

  public static async init(): Promise<AuthUser | null> {
    const sb = getSupabase();

    if (sb) {
      try {
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const name = meta.full_name || meta.name || meta.display_name || session.user.email?.split('@')[0] || 'Operator';
          const avatar = meta.avatar_url || meta.picture || undefined;

          this.currentUser = {
            id: session.user.id,
            email: session.user.email || '',
            displayName: name,
            avatarUrl: avatar,
            isAnonymous: session.user.is_anonymous || false,
            provider: 'supabase',
          };
          this.notifyListeners();
        }

        // Keep session synced across OAuth redirects & token refreshes
        sb.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const meta = session.user.user_metadata || {};
            const name = meta.full_name || meta.name || meta.display_name || session.user.email?.split('@')[0] || 'Operator';
            const avatar = meta.avatar_url || meta.picture || undefined;

            this.currentUser = {
              id: session.user.id,
              email: session.user.email || '',
              displayName: name,
              avatarUrl: avatar,
              isAnonymous: session.user.is_anonymous || false,
              provider: 'supabase',
            };
          } else if (_event === 'SIGNED_OUT') {
            this.currentUser = null;
            localStorage.removeItem(LOCAL_USER_KEY);
          }
          this.notifyListeners();
        });

        if (this.currentUser) return this.currentUser;
      } catch (err) {
        console.warn('[GrindOS Auth] Session restore error:', err);
      }
    }

    // Fallback: check local storage session
    try {
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
        this.notifyListeners();
        return this.currentUser;
      }
    } catch {
      // ignore parse error
    }

    return null;
  }

  public static getUser(): AuthUser | null {
    return this.currentUser;
  }

  public static subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach((l) => l(this.currentUser));
  }

  public static async signInWithPassword(email: string, pass: string): Promise<{ user: AuthUser | null; error: string | null }> {
    const sb = getSupabase();

    if (sb) {
      try {
        const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
        if (error) {
          const rawMsg = error.message || '';
          if (rawMsg.toLowerCase().includes('email not confirmed')) {
            return {
              user: null,
              error: 'Email not confirmed yet! Check your inbox, or in Supabase Dashboard → Authentication → Providers → Email, turn OFF "Confirm email" for instant login.',
            };
          }
          if (rawMsg.includes('Failed to fetch') || rawMsg.toLowerCase().includes('fetch')) {
            return {
              user: null,
              error: 'Network Error: Cannot reach Supabase. If using Brave Browser, please disable Brave Shields for localhost so API requests are not blocked.',
            };
          }
          return { user: null, error: rawMsg };
        }
        if (data.user) {
          this.currentUser = {
            id: data.user.id,
            email: data.user.email || email,
            displayName: data.user.user_metadata?.display_name || email.split('@')[0],
            isAnonymous: false,
            provider: 'supabase',
          };
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(this.currentUser));
          this.notifyListeners();
          return { user: this.currentUser, error: null };
        }
      } catch (err: unknown) {
        const raw = err instanceof Error ? err.message : String(err);
        const friendly = raw.includes('Failed to fetch')
          ? 'Network Error: Cannot connect to Supabase. Please verify your Project URL format is https://<project-ref>.supabase.co (not the dashboard URL).'
          : raw || 'Authentication failed';
        return { user: null, error: friendly };
      }
    }

    // Offline / Local Simulation Mode
    const emailKey = email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    this.currentUser = {
      id: 'usr_' + emailKey,
      email: email.trim(),
      displayName: email.split('@')[0],
      isAnonymous: false,
      provider: 'local',
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(this.currentUser));
    this.notifyListeners();
    return { user: this.currentUser, error: null };
  }

  public static async signUp(email: string, pass: string, displayName: string): Promise<{ user: AuthUser | null; error: string | null }> {
    const sb = getSupabase();

    if (sb) {
      try {
        const { data, error } = await sb.auth.signUp({
          email,
          password: pass,
          options: {
            data: { display_name: displayName },
          },
        });
        if (error) {
          const rawMsg = error.message || '';
          if (rawMsg.toLowerCase().includes('rate limit')) {
            return {
              user: null,
              error: 'Email rate limit reached. In your Supabase Dashboard → Authentication → Providers → Email, turn OFF "Confirm email" for instant login.',
            };
          }
          if (rawMsg.includes('Failed to fetch') || rawMsg.toLowerCase().includes('fetch')) {
            return {
              user: null,
              error: 'Network Error: Cannot reach Supabase. If using Brave Browser, please disable Brave Shields for localhost so API requests are not blocked.',
            };
          }
          return { user: null, error: rawMsg };
        }
        if (data.user) {
          // If user exists, Supabase returns user with empty identities
          if (data.user.identities && data.user.identities.length === 0) {
            return {
              user: null,
              error: 'This email is already registered. Please switch to the Sign In tab to log in.',
            };
          }

          // If email confirmation is required by Supabase
          if (!data.session) {
            return {
              user: null,
              error: 'Confirmation email sent to your inbox! Click the link to activate, or turn OFF "Confirm email" in Supabase for instant login.',
            };
          }

          this.currentUser = {
            id: data.user.id,
            email: data.user.email || email,
            displayName: displayName || email.split('@')[0],
            isAnonymous: false,
            provider: 'supabase',
          };
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(this.currentUser));
          this.notifyListeners();
          return { user: this.currentUser, error: null };
        }
      } catch (err: unknown) {
        const raw = err instanceof Error ? err.message : String(err);
        const friendly = raw.includes('Failed to fetch')
          ? 'Network Error: Cannot connect to Supabase. Please verify your Project URL format is https://<project-ref>.supabase.co (not the dashboard URL).'
          : raw || 'Sign up failed';
        return { user: null, error: friendly };
      }
    }

    // Offline / Local Simulation Mode
    const emailKey = email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    this.currentUser = {
      id: 'usr_' + emailKey,
      email: email.trim(),
      displayName: displayName.trim() || email.split('@')[0],
      isAnonymous: false,
      provider: 'local',
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(this.currentUser));
    this.notifyListeners();
    return { user: this.currentUser, error: null };
  }

  public static async signInWithMagicLink(email: string): Promise<{ success: boolean; error: string | null }> {
    const sb = getSupabase();
    if (!sb) {
      return { success: false, error: 'Supabase database is not connected.' };
    }
    try {
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Magic link sign in failed' };
    }
  }

  public static async signInWithOAuth(provider: 'google' | 'github'): Promise<{ error: string | null }> {
    const sb = getSupabase();
    if (!sb) {
      return { error: 'Supabase database is not connected.' };
    }
    try {
      const { error } = await sb.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
          queryParams: provider === 'google' ? {
            access_type: 'offline',
            prompt: 'select_account',
          } : undefined,
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Failed to fetch') || msg.toLowerCase().includes('fetch')) {
        return {
          error: 'Network Error: Cannot reach Supabase. If you are using Brave Browser, please disable Brave Shields for localhost.',
        };
      }
      return { error: msg || 'OAuth sign in failed' };
    }
  }

  public static async signInAsGuest(displayName: string = 'Operator'): Promise<AuthUser> {
    const guestUser: AuthUser = {
      id: 'guest_' + Math.random().toString(36).substring(2, 10),
      email: 'guest@grindos.local',
      displayName: displayName || 'Anonymous Operator',
      isAnonymous: true,
      provider: 'local',
    };
    this.currentUser = guestUser;
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(this.currentUser));
    this.notifyListeners();
    return guestUser;
  }

  public static async signOut(): Promise<void> {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.auth.signOut();
      } catch {
        // ignore
      }
    }
    this.currentUser = null;
    localStorage.removeItem(LOCAL_USER_KEY);
    this.notifyListeners();
  }
}
