// GrindOS — Production Live Cloud Synchronization Engine
// Synchronizes solve progress, profile, streak, and placements across all devices.

import { getSupabase } from '../config/supabaseClient';
import type { UserProfile } from '../utils/progressHelpers';
import type { PlacementRecord, UserProgressMap, SolveRecordMap, ProblemNoteMap, ProblemFlagMap, CohortInfo } from '../types';
import { CURRICULUM } from '../data/curriculumStats';

export interface CloudSyncPayload {
  userId: string;
  userProfile: UserProfile;
  progress: UserProgressMap;
  solveHistory: SolveRecordMap;
  problemNotes?: ProblemNoteMap;
  flaggedProblems?: ProblemFlagMap;
  placements: PlacementRecord[];
  streak: number;
  solvedCount: number;
}

export interface CloudDataResponse {
  userProfile?: UserProfile;
  progress?: UserProgressMap;
  solveHistory?: SolveRecordMap;
  problemNotes?: ProblemNoteMap;
  flaggedProblems?: ProblemFlagMap;
  placements?: PlacementRecord[];
  activeCohort?: CohortInfo;
  lastSyncedAt?: string;
}

function formatDatabaseError(err: { code?: string; message: string } | null, featureName: string): string {
  if (!err) return 'Operation failed';
  if (err.code === 'PGRST205' || err.message.toLowerCase().includes('schema cache') || err.message.toLowerCase().includes('could not find the table')) {
    return `${featureName} is currently initializing on cloud servers. Please check back shortly.`;
  }
  return err.message;
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
      // 1. Upsert user profile (with graceful fallback if newer schema columns aren't present)
      const fullProfileRow: Record<string, any> = {
        user_id: payload.userId,
        display_name: payload.userProfile.name,
        tagline: payload.userProfile.tagline || 'Software Engineer',
        target_company: payload.userProfile.targetCompany || 'Top Tech Roles',
        start_date: payload.userProfile.startDate,
        target_date: payload.userProfile.targetDate,
        rest_day: payload.userProfile.restDay || 'sunday',
        secondary_skill: payload.userProfile.secondarySkill || 'project',
        theme: payload.userProfile.theme || 'light',
        updated_at: new Date().toISOString(),
      };
      const { error: profileErr } = await sb.from('user_profiles').upsert(fullProfileRow, { onConflict: 'user_id' });
      if (profileErr) {
        // Fallback to baseline profile schema
        const baseProfileRow = {
          user_id: payload.userId,
          display_name: payload.userProfile.name,
          tagline: payload.userProfile.tagline || 'Software Engineer',
          start_date: payload.userProfile.startDate,
          target_date: payload.userProfile.targetDate,
          rest_day: payload.userProfile.restDay || 'sunday',
          secondary_skill: payload.userProfile.secondarySkill || 'project',
          updated_at: new Date().toISOString(),
        };
        const { error: baseProfErr } = await sb.from('user_profiles').upsert(baseProfileRow, { onConflict: 'user_id' });
        if (baseProfErr) console.warn('[CloudSync] Profile upsert fallback warning:', baseProfErr.message);
      }

      // 2. Upsert solves into user_progress (with graceful fallback if notes/flag columns aren't present)
      const allProblemIds = new Set([
        ...Object.keys(payload.progress).filter((id) => payload.progress[id]),
        ...Object.keys(payload.solveHistory || {}),
        ...Object.keys(payload.problemNotes || {}),
        ...Object.keys(payload.flaggedProblems || {}).filter((id) => payload.flaggedProblems?.[id]),
      ]);

      const solveEntries = Array.from(allProblemIds).map((probId) => ({
        user_id: payload.userId,
        problem_id: probId,
        solved_at: payload.solveHistory[probId] || new Date().toISOString(),
        approach_notes: payload.problemNotes?.[probId] || '',
        is_flagged: !!payload.flaggedProblems?.[probId],
      }));

      if (solveEntries.length > 0) {
        // Upsert in batches of 50
        for (let i = 0; i < solveEntries.length; i += 50) {
          const batch = solveEntries.slice(i, i + 50);
          const { error: progErr } = await sb.from('user_progress').upsert(batch, {
            onConflict: 'user_id,problem_id',
          });
          if (progErr) {
            // Fallback: retry preserving approach_notes and is_flagged
            const baseBatch = batch.map((item) => ({
              user_id: item.user_id,
              problem_id: item.problem_id,
              solved_at: item.solved_at,
              approach_notes: item.approach_notes,
              is_flagged: item.is_flagged,
            }));
            const { error: baseProgErr } = await sb.from('user_progress').upsert(baseBatch, {
              onConflict: 'user_id,problem_id',
            });
            if (baseProgErr) console.warn('[CloudSync] Progress batch upsert fallback warning:', baseProgErr.message);
          }
        }
      }

      // 3. Upsert placements (with fallback if interview_date/contact_info columns aren't present)
      if (payload.placements.length > 0) {
        const placementRows = payload.placements.map((p) => {
          const isValidUUID = p.id && p.id.includes('-') && p.id.length === 36;
          return {
            ...(isValidUUID ? { id: p.id } : {}),
            user_id: payload.userId,
            company: p.company,
            role: p.role || 'Software Engineer',
            stage: p.stage || 'Applied',
            applied_date: p.appliedDate || new Date().toISOString().split('T')[0],
            interview_date: p.interviewDate || null,
            contact_info: p.contactInfo || '',
            compensation: p.compensation || '',
            notes: p.notes || '',
            updated_at: new Date().toISOString(),
          };
        });

        const { error: placeErr } = await sb.from('placement_records').upsert(placementRows);
        if (placeErr) {
          // Fallback to baseline placement columns
          const basePlacementRows = payload.placements.map((p) => {
            const isValidUUID = p.id && p.id.includes('-') && p.id.length === 36;
            return {
              ...(isValidUUID ? { id: p.id } : {}),
              user_id: payload.userId,
              company: p.company,
              role: p.role || 'Software Engineer',
              stage: p.stage || 'Applied',
              applied_date: p.appliedDate || new Date().toISOString().split('T')[0],
              compensation: p.compensation || '',
              notes: p.notes || '',
            };
          });
          const { error: basePlaceErr } = await sb.from('placement_records').upsert(basePlacementRows);
          if (basePlaceErr) console.warn('[CloudSync] Placement upsert fallback warning:', basePlaceErr.message);
        }
      }

      // 4. Upsert global leaderboard entry
      const totalProblems = CURRICULUM.totalProblems || 332;
      let daysRemaining = 140;
      try {
        if (payload.userProfile?.targetDate) {
          const diff = new Date(payload.userProfile.targetDate).getTime() - Date.now();
          daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        }
      } catch {
        daysRemaining = 140;
      }

      const { error: lbErr } = await sb.from('leaderboard_entries').upsert(
        {
          user_id: payload.userId,
          display_name: payload.userProfile.name,
          tagline: payload.userProfile.tagline || 'Software Engineer',
          solved_count: payload.solvedCount,
          streak: payload.streak,
          days_remaining: daysRemaining,
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

      // 2. Fetch progress solves, notes, and flags with graceful fallback
      let progressData: any[] | null = null;
      const { data: richProgData, error: richProgErr } = await sb
        .from('user_progress')
        .select('problem_id, solved_at, approach_notes, is_flagged')
        .eq('user_id', userId);

      if (richProgErr) {
        // Fallback to baseline columns (problem_id, solved_at)
        const { data: baseProgData, error: baseProgErr } = await sb
          .from('user_progress')
          .select('problem_id, solved_at')
          .eq('user_id', userId);

        if (baseProgErr) {
          console.warn('[CloudSync] Pull user_progress error:', baseProgErr.message);
          return { success: false, error: baseProgErr.message };
        }
        progressData = baseProgData || [];
      } else {
        progressData = richProgData || [];
      }

      // 3. Fetch placements
      const { data: placementData } = await sb
        .from('placement_records')
        .select('*')
        .eq('user_id', userId);

      // 4. Fetch cohort membership
      let activeCohort: CohortInfo | undefined;
      try {
        const { data: memberRow } = await sb
          .from('cohort_members')
          .select('cohort_id, cohorts(code, name, created_by)')
          .eq('user_id', userId)
          .maybeSingle();

        if (memberRow?.cohorts) {
          const c: any = memberRow.cohorts;
          activeCohort = {
            code: c.code,
            name: c.name,
            memberCount: 1,
            isOwner: c.created_by === userId,
          };
        }
      } catch {
        // non-blocking
      }

      const progressMap: UserProgressMap = {};
      const historyMap: SolveRecordMap = {};
      const notesMap: Record<string, string> = {};
      const flagMap: Record<string, boolean> = {};

      if (progressData && progressData.length > 0) {
        progressData.forEach((row: any) => {
          progressMap[row.problem_id] = true;
          if (row.solved_at) historyMap[row.problem_id] = row.solved_at;
          if (row.approach_notes) notesMap[row.problem_id] = row.approach_notes;
          if (row.is_flagged) flagMap[row.problem_id] = true;
        });
      }

      const placementsList: PlacementRecord[] = (placementData || []).map((row: any) => ({
        id: row.id,
        company: row.company,
        role: row.role,
        stage: row.stage,
        appliedDate: row.applied_date || row.created_at,
        interviewDate: row.interview_date || undefined,
        contactInfo: row.contact_info || undefined,
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
            targetTier: profileData.target_company || 'top_tech',
            isPro: profileData.is_pro || false,
          }
        : undefined;

      this.lastSyncTime = new Date();
      return {
        success: true,
        data: {
          userProfile: restoredProfile,
          progress: progressMap,
          solveHistory: historyMap,
          problemNotes: notesMap,
          flaggedProblems: flagMap,
          placements: placementsList,
          activeCohort,
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
        // Fallback without difficulty column
        const { error: baseErr } = await sb.from('user_progress').upsert(
          {
            user_id: userId,
            problem_id: problemId,
            solved_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,problem_id' }
        );
        if (baseErr) {
          console.warn('[CloudSync] recordSolve fallback warning:', baseErr.message);
          return { success: false, error: baseErr.message };
        }
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
        // Fallback without difficulty column
        const baseRows = solves.map((s) => ({
          user_id: userId,
          problem_id: s.problem_id,
          solved_at: s.solved_at || new Date().toISOString(),
        }));
        const { error: baseErr } = await sb.from('user_progress').upsert(baseRows, {
          onConflict: 'user_id,problem_id',
        });
        if (baseErr) {
          console.warn('[CloudSync] recordBatchSolves fallback warning:', baseErr.message);
          return { success: false, error: baseErr.message };
        }
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
        role: placement.role || 'Software Engineer',
        stage: placement.stage || 'Applied',
        applied_date: placement.appliedDate || new Date().toISOString().split('T')[0],
        interview_date: placement.interviewDate || null,
        contact_info: placement.contactInfo || '',
        compensation: placement.compensation || '',
        notes: placement.notes || '',
        updated_at: new Date().toISOString(),
      };

      const { error } = await sb.from('placement_records').upsert(row);
      if (error) {
        // Fallback to baseline placement columns
        const baseRow = {
          ...(isValidUUID ? { id: placement.id } : {}),
          user_id: userId,
          company: placement.company,
          role: placement.role || 'Software Engineer',
          stage: placement.stage || 'Applied',
          applied_date: placement.appliedDate || new Date().toISOString().split('T')[0],
          compensation: placement.compensation || '',
          notes: placement.notes || '',
        };
        const { error: baseErr } = await sb.from('placement_records').upsert(baseRow);
        if (baseErr) {
          console.warn('[CloudSync] savePlacement fallback warning:', baseErr.message);
          return { success: false, error: baseErr.message };
        }
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
      const fullRow = {
        user_id: userId,
        display_name: profile.name,
        tagline: profile.tagline || 'Software Engineer',
        target_company: profile.targetCompany || 'Top Tech Roles',
        start_date: profile.startDate,
        target_date: profile.targetDate,
        rest_day: profile.restDay || 'sunday',
        secondary_skill: profile.secondarySkill || 'project',
        theme: profile.theme || 'light',
        updated_at: new Date().toISOString(),
      };
      const { error } = await sb.from('user_profiles').upsert(fullRow, { onConflict: 'user_id' });
      if (error) {
        // Fallback to baseline profile schema
        const baseRow = {
          user_id: userId,
          display_name: profile.name,
          tagline: profile.tagline || 'Software Engineer',
          start_date: profile.startDate,
          target_date: profile.targetDate,
          rest_day: profile.restDay || 'sunday',
          secondary_skill: profile.secondarySkill || 'project',
          updated_at: new Date().toISOString(),
        };
        const { error: baseErr } = await sb.from('user_profiles').upsert(baseRow, { onConflict: 'user_id' });
        if (baseErr) {
          console.warn('[CloudSync] saveProfile fallback warning:', baseErr.message);
          return { success: false, error: baseErr.message };
        }
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

  /**
   * Creates a new cohort and adds the creator as a member.
   */
  public static async createCohort(
    userId: string,
    name: string
  ): Promise<{ success: boolean; cohort?: CohortInfo; error?: string }> {
    const sb = getSupabase();
    if (!sb || !userId) return { success: false, error: 'Database unauthenticated' };

    try {
      const code = 'G' + Math.random().toString(36).substring(2, 7).toUpperCase();
      const { data: cohort, error: cohortErr } = await sb
        .from('cohorts')
        .insert({
          code,
          name: name.trim() || 'Grind Cohort',
          created_by: userId,
        })
        .select('*')
        .single();

      if (cohortErr) return { success: false, error: formatDatabaseError(cohortErr, 'Peer Study Cohorts') };

      await sb.from('cohort_members').insert({
        cohort_id: cohort.id,
        user_id: userId,
      });

      return {
        success: true,
        cohort: {
          code: cohort.code,
          name: cohort.name,
          memberCount: 1,
          isOwner: true,
        },
      };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Joins an existing cohort by its code.
   */
  public static async joinCohort(
    userId: string,
    code: string
  ): Promise<{ success: boolean; cohort?: CohortInfo; error?: string }> {
    const sb = getSupabase();
    if (!sb || !userId) return { success: false, error: 'Database unauthenticated' };

    try {
      const cleanCode = code.trim().toUpperCase();
      const { data: cohort, error: findErr } = await sb
        .from('cohorts')
        .select('id, code, name, created_by')
        .eq('code', cleanCode)
        .maybeSingle();

      if (findErr) {
        return { success: false, error: formatDatabaseError(findErr, 'Peer Study Cohorts') };
      }
      if (!cohort) {
        return { success: false, error: 'Cohort code not found. Check code and try again.' };
      }

      await sb.from('cohort_members').upsert(
        { cohort_id: cohort.id, user_id: userId },
        { onConflict: 'cohort_id,user_id' }
      );

      return {
        success: true,
        cohort: {
          code: cohort.code,
          name: cohort.name,
          memberCount: 2,
          isOwner: cohort.created_by === userId,
        },
      };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Leaves a cohort.
   */
  public static async leaveCohort(
    userId: string,
    cohortCode: string
  ): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabase();
    if (!sb || !userId) return { success: false };

    try {
      const { data: cohort } = await sb
        .from('cohorts')
        .select('id')
        .eq('code', cohortCode)
        .maybeSingle();

      if (cohort?.id) {
        await sb
          .from('cohort_members')
          .delete()
          .eq('cohort_id', cohort.id)
          .eq('user_id', userId);
      }
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Fetches leaderboard ranking scoped to a cohort.
   */
  public static async fetchCohortLeaderboard(cohortCode: string): Promise<any[]> {
    const sb = getSupabase();
    if (!sb || !cohortCode) return [];

    try {
      const { data: cohort } = await sb
        .from('cohorts')
        .select('id')
        .eq('code', cohortCode.trim().toUpperCase())
        .maybeSingle();

      if (!cohort) return [];

      const { data: members } = await sb
        .from('cohort_members')
        .select('user_id')
        .eq('cohort_id', cohort.id);

      if (!members || members.length === 0) return [];

      const userIds = members.map((m: any) => m.user_id);

      const { data: entries, error } = await sb
        .from('leaderboard_entries')
        .select('*')
        .in('user_id', userIds)
        .order('solved_count', { ascending: false })
        .order('streak', { ascending: false });

      if (error) {
        console.warn('[Leaderboard] Cohort fetch error:', error.message);
        return [];
      }
      return entries || [];
    } catch {
      return [];
    }
  }

  /**
   * Saves or updates an approach note for a specific problem.
   */
  public static async saveProblemNote(
    userId: string,
    problemId: string,
    notes: string
  ): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabase();
    if (!sb || !userId) return { success: false };

    try {
      const { error } = await sb
        .from('user_progress')
        .update({ approach_notes: notes })
        .eq('user_id', userId)
        .eq('problem_id', problemId);

      if (error) {
        console.warn('[CloudSync] Note update warning:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Toggles review flag for a specific problem.
   */
  public static async toggleProblemFlag(
    userId: string,
    problemId: string,
    isFlagged: boolean
  ): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabase();
    if (!sb || !userId) return { success: false };

    try {
      const { error } = await sb
        .from('user_progress')
        .update({ is_flagged: isFlagged })
        .eq('user_id', userId)
        .eq('problem_id', problemId);

      if (error) {
        console.warn('[CloudSync] Flag update warning:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}
