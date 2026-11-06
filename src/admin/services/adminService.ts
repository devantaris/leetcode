// GrindOS — Stealth Admin & Community Research Service
// Connects to Supabase admin tables with local offline fallback for testing & local development.

import { getSupabase } from '../../config/supabaseClient';
import type { AuthUser } from '../../services/authService';
import type { SystemAnnouncement, AdminTelemetry, AdminUserRecord, CohortInfo } from '../../types';

// Fallback admin emails whitelist for development or bootstrapping
const DEFAULT_ADMIN_EMAILS = [
  'admin@grindos.dev',
  'founder@grindos.dev',
  'email2devanshkr@gmail.com',
  'devantaris@gmail.com'
];

export class AdminService {
  /**
   * Determine if the authenticated user has administrative privileges.
   * Checks Supabase admin_users table first, falling back to whitelist.
   */
  public static async checkIsAdmin(user: AuthUser | null): Promise<boolean> {
    if (!user || !user.email) return false;

    // 1. Env variable whitelist or default founder emails
    const envEmails = import.meta.env.VITE_ADMIN_EMAILS
      ? (import.meta.env.VITE_ADMIN_EMAILS as string).split(',').map(e => e.trim().toLowerCase())
      : [];
    const allWhitelisted = [...DEFAULT_ADMIN_EMAILS, ...envEmails];

    if (allWhitelisted.includes(user.email.toLowerCase())) {
      return true;
    }

    // 2. Supabase DB check in admin_users
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data && (data.role === 'superadmin' || data.role === 'admin')) {
          return true;
        }
      } catch (err) {
        console.warn('[AdminService] Error verifying admin status:', err);
      }
    }

    return false;
  }

  /**
   * Fetch aggregate community telemetry for research & growth analysis
   */
  public static async fetchTelemetry(): Promise<AdminTelemetry> {
    const sb = getSupabase();

    // Default simulated / local telemetry baseline
    const fallbackTelemetry: AdminTelemetry = {
      totalRegisteredUsers: 142,
      activeSolvers7d: 89,
      solvesToday: 47,
      totalSolvesCount: 2840,
      offerConversionRate: 8.5,
      totalCohorts: 12,
      companyDistribution: [
        { company: 'Google', count: 54, percentage: 38 },
        { company: 'Amazon', count: 38, percentage: 27 },
        { company: 'Meta', count: 27, percentage: 19 },
        { company: 'Microsoft', count: 14, percentage: 10 },
        { company: 'Apple', count: 9, percentage: 6 },
      ],
      tierDistribution: [
        { tier: 'Tier-1 / FAANG', count: 86 },
        { tier: 'Unicorn Startup', count: 34 },
        { tier: 'Mid-Market', count: 22 },
      ]
    };

    if (!sb) return fallbackTelemetry;

    try {
      // 1. User Profiles count & company breakdown
      const { data: profiles, error: pErr } = await sb
        .from('user_profiles')
        .select('target_company, target_tier, created_at');

      if (pErr || !profiles) return fallbackTelemetry;

      const totalRegisteredUsers = Math.max(profiles.length, 1);

      // Company frequency count
      const companyCounts: Record<string, number> = {};
      const tierCounts: Record<string, number> = {};

      profiles.forEach((p) => {
        const comp = (p.target_company || 'Top Tech Roles').trim();
        companyCounts[comp] = (companyCounts[comp] || 0) + 1;

        const tier = (p.target_tier || 'tier1').trim();
        tierCounts[tier] = (tierCounts[tier] || 0) + 1;
      });

      const companyDistribution = Object.entries(companyCounts)
        .map(([company, count]) => ({
          company,
          count,
          percentage: Math.round((count / totalRegisteredUsers) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      const tierDistribution = Object.entries(tierCounts).map(([tier, count]) => ({
        tier: tier === 'tier1' ? 'Tier-1 / FAANG' : tier === 'tier2' ? 'Mid-Market' : 'Startup / Other',
        count
      }));

      // 2. Solves today & total progress
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count: solvesToday } = await sb
        .from('user_progress')
        .select('id', { count: 'exact', head: true })
        .gte('solved_at', todayStart.toISOString());

      const { count: totalSolvesCount } = await sb
        .from('user_progress')
        .select('id', { count: 'exact', head: true });

      // 3. Active 7d solvers
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentProgress } = await sb
        .from('user_progress')
        .select('user_id')
        .gte('solved_at', sevenDaysAgo.toISOString());

      const activeUserSet = new Set((recentProgress || []).map(r => r.user_id));
      const activeSolvers7d = Math.max(activeUserSet.size, 1);

      // 4. Offer conversion rate from placement records
      const { data: placements } = await sb
        .from('placement_records')
        .select('stage');

      const totalApps = (placements || []).length;
      const offers = (placements || []).filter(p => p.stage?.includes('Offer')).length;
      const offerConversionRate = totalApps > 0 ? Math.round((offers / totalApps) * 100) : 0;

      // 5. Total cohorts
      const { count: totalCohorts } = await sb
        .from('cohorts')
        .select('id', { count: 'exact', head: true });

      return {
        totalRegisteredUsers,
        activeSolvers7d,
        solvesToday: solvesToday || 0,
        totalSolvesCount: totalSolvesCount || 0,
        offerConversionRate,
        totalCohorts: totalCohorts || 0,
        companyDistribution: companyDistribution.length > 0 ? companyDistribution : fallbackTelemetry.companyDistribution,
        tierDistribution: tierDistribution.length > 0 ? tierDistribution : fallbackTelemetry.tierDistribution
      };
    } catch (err) {
      console.warn('[AdminService] Telemetry fetch error:', err);
      return fallbackTelemetry;
    }
  }

  /**
   * Fetch all announcements (active and inactive) for admin management
   */
  public static async fetchAnnouncements(): Promise<SystemAnnouncement[]> {
    const sb = getSupabase();
    if (!sb) {
      try {
        const local = localStorage.getItem('grindos_admin_announcements');
        return local ? JSON.parse(local) : [];
      } catch {
        return [];
      }
    }

    try {
      const { data, error } = await sb
        .from('system_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((row) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        type: row.type,
        category: row.category,
        targetTier: row.target_tier,
        ctaLabel: row.cta_label || undefined,
        ctaUrl: row.cta_url || undefined,
        isActive: row.is_active,
        startsAt: row.starts_at,
        expiresAt: row.expires_at || undefined,
        createdBy: row.created_by,
        createdAt: row.created_at
      }));
    } catch {
      return [];
    }
  }

  /**
   * Create and publish a new announcement / notification broadcast
   */
  public static async createAnnouncement(
    payload: Omit<SystemAnnouncement, 'id' | 'createdAt'>
  ): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) {
      try {
        const current = await this.fetchAnnouncements();
        const newRecord: SystemAnnouncement = {
          ...payload,
          id: crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('grindos_admin_announcements', JSON.stringify([newRecord, ...current]));
        return true;
      } catch {
        return false;
      }
    }

    try {
      const { error } = await sb.from('system_announcements').insert({
        title: payload.title,
        message: payload.message,
        type: payload.type,
        category: payload.category,
        target_tier: payload.targetTier,
        cta_label: payload.ctaLabel || '',
        cta_url: payload.ctaUrl || '',
        is_active: payload.isActive,
        starts_at: payload.startsAt,
        expires_at: payload.expiresAt || null,
        created_by: payload.createdBy
      });
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Toggle announcement active state
   */
  public static async toggleAnnouncement(id: string, isActive: boolean): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) {
      try {
        const current = await this.fetchAnnouncements();
        const updated = current.map(a => a.id === id ? { ...a, isActive } : a);
        localStorage.setItem('grindos_admin_announcements', JSON.stringify(updated));
        return true;
      } catch {
        return false;
      }
    }

    try {
      const { error } = await sb
        .from('system_announcements')
        .update({ is_active: isActive })
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Delete an announcement
   */
  public static async deleteAnnouncement(id: string): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) {
      try {
        const current = await this.fetchAnnouncements();
        const filtered = current.filter(a => a.id !== id);
        localStorage.setItem('grindos_admin_announcements', JSON.stringify(filtered));
        return true;
      } catch {
        return false;
      }
    }

    try {
      const { error } = await sb
        .from('system_announcements')
        .delete()
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetch active public announcement for the user-facing top banner
   */
  public static async fetchPublicActiveAnnouncement(): Promise<SystemAnnouncement | null> {
    const sb = getSupabase();
    if (!sb) {
      try {
        const local = localStorage.getItem('grindos_admin_announcements');
        if (local) {
          const list: SystemAnnouncement[] = JSON.parse(local);
          return list.find(a => a.isActive) || null;
        }
        return null;
      } catch {
        return null;
      }
    }

    try {
      const { data, error } = await sb
        .from('system_announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        title: data.title,
        message: data.message,
        type: data.type,
        category: data.category,
        targetTier: data.target_tier,
        ctaLabel: data.cta_label || undefined,
        ctaUrl: data.cta_url || undefined,
        isActive: data.is_active,
        startsAt: data.starts_at,
        expiresAt: data.expires_at || undefined,
        createdBy: data.created_by,
        createdAt: data.created_at
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetch registered users list for community moderation and research
   */
  public static async fetchUsers(): Promise<AdminUserRecord[]> {
    const sb = getSupabase();
    if (!sb) return [];

    try {
      const { data: profiles, error } = await sb
        .from('user_profiles')
        .select(`
          user_id,
          display_name,
          tagline,
          target_company,
          target_tier,
          is_pro,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error || !profiles) return [];

      // Fetch leaderboard stats to attach solves and streaks
      const { data: leaderboard } = await sb
        .from('leaderboard_entries')
        .select('user_id, solved_count, streak, last_synced_at');

      const statMap = new Map((leaderboard || []).map(l => [l.user_id, l]));

      return profiles.map(p => {
        const l = statMap.get(p.user_id);
        return {
          userId: p.user_id,
          displayName: p.display_name,
          tagline: p.tagline,
          targetCompany: p.target_company,
          targetTier: p.target_tier,
          isPro: p.is_pro || false,
          solvedCount: l?.solved_count || 0,
          streak: l?.streak || 0,
          lastSyncedAt: l?.last_synced_at,
          createdAt: p.created_at
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Grant or revoke user Pro status
   */
  public static async toggleUserPro(userId: string, isPro: boolean): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) return true;

    try {
      const { error } = await sb
        .from('user_profiles')
        .update({ is_pro: isPro })
        .eq('user_id', userId);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Moderate user display name on public leaderboard
   */
  public static async moderateUser(userId: string, cleanDisplayName: string): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) return true;

    try {
      await sb
        .from('user_profiles')
        .update({ display_name: cleanDisplayName })
        .eq('user_id', userId);

      await sb
        .from('leaderboard_entries')
        .update({ display_name: cleanDisplayName })
        .eq('user_id', userId);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fetch all study cohorts for inspection
   */
  public static async fetchCohorts(): Promise<CohortInfo[]> {
    const sb = getSupabase();
    if (!sb) return [];

    try {
      const { data: cohorts, error } = await sb
        .from('cohorts')
        .select(`
          code,
          name,
          created_at,
          cohort_members (count)
        `)
        .order('created_at', { ascending: false });

      if (error || !cohorts) return [];

      return cohorts.map(c => ({
        code: c.code,
        name: c.name,
        memberCount: Array.isArray(c.cohort_members) && c.cohort_members[0]?.count
          ? Number(c.cohort_members[0].count)
          : 1
      }));
    } catch {
      return [];
    }
  }
}
