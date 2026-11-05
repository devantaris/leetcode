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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[CloudSync] Pull failed:', msg);
      return { success: false, error: msg };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Real-time atomic solve recorder.
   * Immediately persists a newly solved problem in Supabase `user_progress`.
   */
  public static async recordSolve(
    userId: string,
    problemId: string,
    difficulty: string = 'Medium'
  ): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabase();
    if (!sb || !userId) return { success: false, error: 'Database unauthenticated' };

    try {
      const { error } = await sb.from('user_progress').upsert(
        {
          user_id: userId,
          problem_id: problemId,
          difficulty,
          solved_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,problem_id' }
      );
      if (error) {
        console.warn('[CloudSync] recordSolve warning:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Real-time atomic solve remover.
   * Immediately deletes a problem row from Supabase `user_progress` when unchecked.
   */
  public static async removeSolve(
    userId: string,
    problemId: string
  ): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabase();
    if (!sb || !userId) return { success: false, error: 'Database unauthenticated' };

    try {
      const { error } = await sb
        .from('user_progress')
        .delete()
        .eq('user_id', userId)
        .eq('problem_id', problemId);

      if (error) {
        console.warn('[CloudSync] removeSolve warning:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Batch solve recorder (e.g., when marking an entire day complete).
   */
  public static async recordBatchSolves(
    userId: string,
    solves: Array<{ problem_id: string; difficulty?: string; solved_at?: string }>
  ): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabase();
    if (!sb || !userId || solves.length === 0) return { success: false };

    try {
      const rows = solves.map((s) => ({
        user_id: userId,
        problem_id: s.problem_id,
        difficulty: s.difficulty || 'Medium',
        solved_at: s.solved_at || new Date().toISOString(),
      }));

      const { error } = await sb.from('user_progress').upsert(rows, {
        onConflict: 'user_id,problem_id',
      });

      if (error) {
        console.warn('[CloudSync] recordBatchSolves warning:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Merges local guest solves into the user's Supabase cloud account upon login/signup.
   * Only uploads solves that don't already exist in Supabase to avoid overwriting timestamps.
   */
  public static async mergeLocalProgressToCloud(
    userId: string,
    localProgress: UserProgressMap,
    localHistory: SolveRecordMap
  ): Promise<number> {
    const sb = getSupabase();
    if (!sb || !userId) return 0;

    try {
      const localSolvedKeys = Object.entries(localProgress)
        .filter(([_, isSolved]) => isSolved)
        .map(([id]) => id);

      if (localSolvedKeys.length === 0) return 0;

      // 1. Fetch what's already on the server
      const { data: cloudData } = await sb
        .from('user_progress')
        .select('problem_id')
        .eq('user_id', userId);

      const existingCloudSet = new Set((cloudData || []).map((r: { problem_id: string }) => r.problem_id));
      const solvesToPush = localSolvedKeys
        .filter((k) => !existingCloudSet.has(k))
        .map((k) => ({
          user_id: userId,
          problem_id: k,
          difficulty: 'Medium',
          solved_at: localHistory[k] || new Date().toISOString(),
        }));

      if (solvesToPush.length === 0) return 0;

      // Batch insert in chunks of 50
      for (let i = 0; i < solvesToPush.length; i += 50) {
        const batch = solvesToPush.slice(i, i + 50);
        await sb.from('user_progress').upsert(batch, { onConflict: 'user_id,problem_id' });
      }

      return solvesToPush.length;
    } catch (err) {
      console.warn('[CloudSync] mergeLocalProgressToCloud error:', err);
      return 0;
    }
  }

  /**
   * Persists an interview placement application directly into Supabase.
   */
  public static async savePlacement(
    userId: string,
    placement: PlacementRecord
  ): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabase();
    if (!sb || !userId) return { success: false, error: 'Database unauthenticated' };

    try {
      const isValidUUID = placement.id && placement.id.includes('-') && placement.id.length === 36;
      const row = {
        ...(isValidUUID ? { id: placement.id } : {}),
        user_id: userId,
        company: placement.company,
        role: placement.role,
        stage: placement.stage,
        applied_date: placement.appliedDate || new Date().toISOString().split('T')[0],
        compensation: placement.compensation || '',
        notes: placement.notes || '',
        updated_at: new Date().toISOString(),
      };

      const { error } = await sb.from('placement_records').upsert(row);
      if (error) {
        console.warn('[CloudSync] savePlacement warning:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Deletes an interview placement record from Supabase.
   */
  public static async deletePlacement(
    userId: string,
    placementId: string
  ): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabase();
    if (!sb || !userId) return { success: false, error: 'Database unauthenticated' };

    try {
      const { error } = await sb
        .from('placement_records')
        .delete()
        .eq('user_id', userId)
        .eq('id', placementId);

      if (error) {
        console.warn('[CloudSync] deletePlacement warning:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Persists user profile updates into Supabase `user_profiles`.
   */
  public static async saveProfile(
    userId: string,
    profile: UserProfile
  ): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabase();
    if (!sb || !userId) return { success: false, error: 'Database unauthenticated' };

    try {
      const { error } = await sb.from('user_profiles').upsert(
        {
          user_id: userId,
          display_name: profile.name,
          tagline: profile.tagline || 'Software Engineer',
          target_company: profile.targetCompany || 'Top Tech Roles',
          start_date: profile.startDate,
          target_date: profile.targetDate,
          rest_day: profile.restDay || 'sunday',
          secondary_skill: profile.secondarySkill || 'project',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (error) {
        console.warn('[CloudSync] saveProfile warning:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Records a completed Pomodoro deep-work focus session in Supabase `focus_sessions`.
   */
  public static async recordFocusSession(
    userId: string,
    durationMinutes: number
  ): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabase();
    if (!sb || !userId) return { success: false };

    try {
      const { error } = await sb.from('focus_sessions').insert({
        user_id: userId,
        duration_minutes: durationMinutes,
        completed_at: new Date().toISOString(),
      });
      if (error) {
        console.warn('[CloudSync] recordFocusSession warning:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
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
