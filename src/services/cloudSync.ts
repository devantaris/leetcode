// GrindOS — Production Live Cloud Synchronization Engine
// Synchronizes solve progress, profile, streak, and placements across all devices.

import { getSupabase } from '../config/supabaseClient';
import type { UserProfile } from '../context/ProgressContext';
import type { PlacementRecord, UserProgressMap, SolveRecordMap } from '../types';
import { CURRICULUM } from '../data/curriculumStats';

export interface CloudSyncPayload {
  userId: string;
  userProfile: UserProfile;
  progress: UserProgressMap;
  solveHistory: SolveRecordMap;
  placements: PlacementRecord[];
  streak: number;
  solvedCount: number;
}

export interface CloudDataResponse {
  userProfile?: UserProfile;
  progress?: UserProgressMap;
  solveHistory?: SolveRecordMap;
  placements?: PlacementRecord[];
  lastSyncedAt?: string;
}

export class CloudSyncService {
  private static isSyncing = false;
  private static lastSyncTime: Date | null = null;

  public static getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  public static getSyncStatus(): 'synced' | 'syncing' | 'offline' | 'error' {
    if (this.isSyncing) return 'syncing';
    if (!getSupabase()) return 'offline';
    if (this.lastSyncTime) return 'synced';
    return 'offline';
  }

  /**
   * Pushes the entire local user state to the cloud database.
   */
  public static async pushToCloud(payload: CloudSyncPayload): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabase();
    if (!sb || !payload.userId) {
      return { success: false, error: 'Database not connected or unauthenticated' };
    }

    this.isSyncing = true;
    try {
      // 1. Upsert user profile
      const { error: profileErr } = await sb.from('user_profiles').upsert(
        {
          user_id: payload.userId,
          display_name: payload.userProfile.name,
          tagline: payload.userProfile.tagline,
          start_date: payload.userProfile.startDate,
          target_date: payload.userProfile.targetDate,
          rest_day: payload.userProfile.restDay,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (profileErr) console.warn('[CloudSync] Profile upsert warning:', profileErr.message);

      // 2. Upsert solves into user_progress
      const solveEntries = Object.entries(payload.progress)
        .filter(([_, isSolved]) => isSolved)
        .map(([probId]) => ({
          user_id: payload.userId,
          problem_id: probId,
          solved_at: payload.solveHistory[probId] || new Date().toISOString(),
        }));

      if (solveEntries.length > 0) {
        // Upsert in batches of 50
        for (let i = 0; i < solveEntries.length; i += 50) {
          const batch = solveEntries.slice(i, i + 50);
          const { error: progErr } = await sb.from('user_progress').upsert(batch, {
            onConflict: 'user_id,problem_id',
          });
          if (progErr) console.warn('[CloudSync] Progress batch upsert warning:', progErr.message);
        }
      }

      // 3. Upsert placements
      if (payload.placements.length > 0) {
        const placementRows = payload.placements.map((p) => {
          const isValidUUID = p.id && p.id.includes('-') && p.id.length === 36;
          return {
            ...(isValidUUID ? { id: p.id } : {}),
            user_id: payload.userId,
            company: p.company,
            role: p.role,
            stage: p.stage,
            compensation: p.compensation || '',
            notes: p.notes || '',
          };
        });

        const { error: placeErr } = await sb.from('placement_records').upsert(placementRows);
        if (placeErr) console.warn('[CloudSync] Placement upsert warning:', placeErr.message);
      }

      // 4. Upsert global leaderboard entry
      const totalProblems = CURRICULUM.totalProblems || 332;
      const { error: lbErr } = await sb.from('leaderboard_entries').upsert(
        {
          user_id: payload.userId,
          display_name: payload.userProfile.name,
          tagline: payload.userProfile.tagline,
          solved_count: payload.solvedCount,
          streak: payload.streak,
          readiness_pct: Math.min(100, Math.round((payload.solvedCount / totalProblems) * 100)),
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (lbErr) console.warn('[CloudSync] Leaderboard upsert warning:', lbErr.message);

      this.lastSyncTime = new Date();
      return { success: true };
    } catch (err: any) {
      console.error('[CloudSync] Push failed:', err);
      return { success: false, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Pulls the user state from the cloud database so any new device restores exact state.
   */
  public static async pullFromCloud(userId: string): Promise<{ success: boolean; data?: CloudDataResponse; error?: string }> {
    const sb = getSupabase();
    if (!sb || !userId) {
      return { success: false, error: 'Database not connected or unauthenticated' };
    }

    this.isSyncing = true;
    try {
      // 1. Fetch user profile
      const { data: profileData } = await sb
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // 2. Fetch progress solves
      const { data: progressData } = await sb
        .from('user_progress')
        .select('problem_id, solved_at')
        .eq('user_id', userId);

      // 3. Fetch placements
      const { data: placementData } = await sb
        .from('placement_records')
        .select('*')
        .eq('user_id', userId);

      const progressMap: UserProgressMap = {};
      const historyMap: SolveRecordMap = {};

      if (progressData) {
        progressData.forEach((row: any) => {
          progressMap[row.problem_id] = true;
          historyMap[row.problem_id] = row.solved_at;
        });
      }

      const placementsList: PlacementRecord[] = (placementData || []).map((row: any) => ({
        id: row.id,
        company: row.company,
        role: row.role,
        stage: row.stage,
        appliedDate: row.applied_date || row.created_at,
        compensation: row.compensation,
        notes: row.notes,
      }));

      const restoredProfile: UserProfile | undefined = profileData
        ? {
            name: profileData.display_name || 'Operator',
            tagline: profileData.tagline || 'Software Engineer',
            startDate: profileData.start_date || new Date().toISOString().split('T')[0],
            targetDate: profileData.target_date || new Date().toISOString().split('T')[0],
            restDay: profileData.rest_day || 'sunday',
            secondarySkill: profileData.secondary_skill || 'project',
          }
        : undefined;

      this.lastSyncTime = new Date();
      return {
        success: true,
        data: {
          userProfile: restoredProfile,
          progress: progressMap,
          solveHistory: historyMap,
          placements: placementsList,
          lastSyncedAt: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      console.error('[CloudSync] Pull failed:', err);
      return { success: false, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Fetches real-time live global leaderboard from Supabase.
   */
  public static async fetchLiveLeaderboard(): Promise<any[]> {
    const sb = getSupabase();
    if (!sb) return [];

    try {
      const { data, error } = await sb
        .from('leaderboard_entries')
        .select('*')
        .order('solved_count', { ascending: false })
        .order('streak', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('[Leaderboard] Live fetch error:', error.message);
        return [];
      }
      return data || [];
    } catch {
      return [];
    }
  }
}
