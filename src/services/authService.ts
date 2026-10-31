// GrindOS — Production Authentication Service
// Supports Supabase Auth with automatic local offline fallback.

import { getSupabase } from '../config/supabaseClient';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
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
          this.currentUser = {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Operator',
            isAnonymous: session.user.is_anonymous || false,
            provider: 'supabase',
          };
          this.notifyListeners();
          return this.currentUser;
        }
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
        if (error) return { user: null, error: error.message };
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
      } catch (err: any) {
        return { user: null, error: err.message || 'Authentication failed' };
      }
    }

    // Offline / Local Simulation Mode
    this.currentUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 10),
      email,
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
        if (error) return { user: null, error: error.message };
        if (data.user) {
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
      } catch (err: any) {
        return { user: null, error: err.message || 'Sign up failed' };
      }
    }

    // Offline / Local Simulation Mode
    this.currentUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 10),
      email,
      displayName: displayName || email.split('@')[0],
      isAnonymous: false,
      provider: 'local',
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(this.currentUser));
    this.notifyListeners();
    return { user: this.currentUser, error: null };
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
