/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { 
  UserProgressMap, 
  SolveRecordMap, 
  AppStats, 
  PlacementRecord, 
  CohortInfo, 
  CompanyTag, 
  ReadinessBreakdown 
} from '../types';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { differenceInCalendarDays, parseISO, format, addDays } from 'date-fns';
import { APP_CONFIG } from '../config/appConfig';
import { STORAGE_KEYS, migrateLegacyStorageKeys } from '../config/storageKeys';

// Migrate old 'dsa_*' keys to 'go_*' BEFORE any state initialization reads localStorage
migrateLegacyStorageKeys();
import { AuthService } from '../services/authService';
import type { AuthUser } from '../services/authService';
import { CloudSyncService } from '../services/cloudSync';
import { CURRICULUM } from '../data/curriculumStats';
import { 
  DEFAULT_PROFILE, 
  normalizeUserProfile, 
  generateUUID, 
  problemLookupMap,
  computeCurrentDay,
  computeCatchUpQueue,
} from '../utils/progressHelpers';
import type { CatchUpItem } from '../utils/progressHelpers';
export type { UserProfile } from '../utils/progressHelpers';
export { problemLookupMap } from '../utils/progressHelpers';
export type { CatchUpItem } from '../utils/progressHelpers';

// ─── Solve Log Types ───────────────────────────────────────────────────────────
export interface DailySolveItem {
  problemId: string;
  name: string;
  lcNumber: number;
  difficulty: string;
  url: string;
  topic: string;
  timestamp: string;
  timeFormatted: string;
}

export interface DailySolveGroup {
  dateStr: string; // 'yyyy-MM-dd'
  displayDate: string; // e.g. 'Tue, Jul 28, 2026'
  items: DailySolveItem[];
}

// ─── Context Type ──────────────────────────────────────────────────────────────
interface ProgressContextType {
  progress: UserProgressMap;
  solveHistory: SolveRecordMap;
  streak: number;
  dailySolveLog: DailySolveGroup[];
  stats: AppStats;
  userProfile: UserProfile;
  isOnboarded: boolean;
  updateProfile: (profile: UserProfile) => void;
  resumeFromDay: (newStartDate: string) => void;
  toggleProblem: (problemId: string) => void;
  markDayComplete: (weekNum: number, dayNum: number) => void;
  isDayComplete: (weekNum: number, dayNum: number) => boolean;
  activeWeek: number;
  setActiveWeek: (week: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (diff: string) => void;
  statusFilter: 'all' | 'solved' | 'unsolved' | 'review' | 'top150';
  setStatusFilter: (filter: 'all' | 'solved' | 'unsolved' | 'review' | 'top150') => void;
  companyFilter: CompanyTag | 'all';
  setCompanyFilter: (filter: CompanyTag | 'all') => void;
  placements: PlacementRecord[];
  addPlacement: (rec: Omit<PlacementRecord, 'id'>) => void;
  updatePlacement: (id: string, updates: Partial<PlacementRecord>) => void;
  deletePlacement: (id: string) => void;
  activeCohort: CohortInfo | null;
  joinCohort: (code: string, name?: string) => Promise<boolean>;
  leaveCohort: () => void;
  exportJSON: () => void;
  exportJSONString: () => string;
  importJSON: (jsonString: string) => boolean;
  resetAll: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  authUser: AuthUser | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastCloudSync: Date | null;
  triggerCloudSync: () => Promise<boolean>;
  catchUpQueue: CatchUpItem[];
}

export const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// ─── Streak + Log Computation ──────────────────────────────────────────────────
function computeLogAndStreak(solveHistory: SolveRecordMap, restDay: string): { dailySolveLog: DailySolveGroup[]; streak: number } {
  const groupMap: { [dateStr: string]: DailySolveItem[] } = {};

  Object.entries(solveHistory).forEach(([problemId, isoTimestamp]) => {
    if (!isoTimestamp) return;
    try {
      const dateObj = parseISO(isoTimestamp);
      const dateStr = format(dateObj, 'yyyy-MM-dd');
      const info = problemLookupMap.get(problemId);

      const item: DailySolveItem = {
        problemId,
        name: info?.name || problemId,
        lcNumber: info?.lcNumber || 0,
        difficulty: info?.difficulty || 'Medium',
        url: info?.url || '#',
        topic: info?.topic || 'General',
        timestamp: isoTimestamp,
        timeFormatted: format(dateObj, 'hh:mm a')
      };

      if (!groupMap[dateStr]) {
        groupMap[dateStr] = [];
      }
      groupMap[dateStr].push(item);
    } catch {
      // ignore invalid date strings
    }
  });

  const sortedDates = Object.keys(groupMap).sort((a, b) => b.localeCompare(a));
  const dailySolveLog: DailySolveGroup[] = sortedDates.map((dateStr) => {
    const items = groupMap[dateStr].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const sampleDate = parseISO(items[0]?.timestamp || dateStr);
    return {
      dateStr,
      displayDate: format(sampleDate, 'EEE, MMM dd, yyyy'),
      items
    };
  });

  // Dynamic Streak Calculation
  const activeDatesSet = new Set<string>(Object.keys(groupMap));
  if (activeDatesSet.size === 0) {
    return { dailySolveLog, streak: 0 };
  }

  const restDayNum = restDay === 'sunday' ? 0 : restDay === 'saturday' ? 6 : -1;
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const yesterday = addDays(now, -1);
  const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

  let currentCheckDate = now;
  if (activeDatesSet.has(todayStr)) {
    currentCheckDate = now;
  } else if (activeDatesSet.has(yesterdayStr)) {
    currentCheckDate = yesterday;
  } else if (yesterday.getDay() === restDayNum) {
    const prevDay = addDays(now, -2);
    const prevDayStr = format(prevDay, 'yyyy-MM-dd');
    if (activeDatesSet.has(prevDayStr)) {
      currentCheckDate = prevDay;
    } else {
      return { dailySolveLog, streak: 0 };
    }
  } else {
    return { dailySolveLog, streak: 0 };
  }

  let calculatedStreak = 0;
  let iterDate = currentCheckDate;

  for (let i = 0; i < 365; i++) {
    const dStr = format(iterDate, 'yyyy-MM-dd');
    if (activeDatesSet.has(dStr)) {
      calculatedStreak++;
    } else if (iterDate.getDay() === restDayNum) {
      // Rest day: skip without breaking
    } else {
      break;
    }
    iterDate = addDays(iterDate, -1);
  }

  return { dailySolveLog, streak: calculatedStreak };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.userProfile);
      return (saved ? normalizeUserProfile(JSON.parse(saved)) : null) || DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const isOnboarded = true;

  const [progress, setProgress] = useState<UserProgressMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.progress);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [solveHistory, setSolveHistory] = useState<SolveRecordMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.solveHistory);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // ── Auth & Live Cloud Sync State ───────────────────────────────────────────
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('offline');
  const [lastCloudSync, setLastCloudSync] = useState<Date | null>(null);

  const { dailySolveLog, streak } = useMemo(
    () => computeLogAndStreak(solveHistory, userProfile?.restDay || 'sunday'),
    [solveHistory, userProfile?.restDay]
  );

  const [activeWeek, _setActiveWeek] = useState<number>(1);
  const [searchQuery, _setSearchQuery] = useState<string>('');
  const [selectedDifficulty, _setSelectedDifficulty] = useState<string>('All');
  const [statusFilter, _setStatusFilter] = useState<'all' | 'solved' | 'unsolved' | 'review' | 'top150'>('all');
  const [companyFilter, _setCompanyFilter] = useState<CompanyTag | 'all'>('all');
  const [soundEnabled, _setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('grindos_sound_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    sounds.setEnabled(soundEnabled);
    try {
      localStorage.setItem('grindos_sound_enabled', String(soundEnabled));
    } catch {
      // ignore storage errors
    }
  }, [soundEnabled]);

  // ── Placements & Cohort ──────────────────────────────────────────────────────
  const [placements, setPlacements] = useState<PlacementRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.placements);
      if (!saved) return [];
      const list: PlacementRecord[] = JSON.parse(saved);
      // Migrate legacy place_ IDs to standard UUIDs
      let migrated = false;
      const normalized = list.map((p) => {
        if (!p.id || !p.id.includes('-') || p.id.length !== 36) {
          migrated = true;
          return { ...p, id: generateUUID() };
        }
        return p;
      });
      if (migrated) {
        localStorage.setItem(STORAGE_KEYS.placements, JSON.stringify(normalized));
      }
      return normalized;
    } catch {
      return [];
    }
  });

  const [activeCohort, setActiveCohort] = useState<CohortInfo | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.activeCohort);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.placements, JSON.stringify(placements));
  }, [placements]);

  useEffect(() => {
    if (activeCohort) {
      localStorage.setItem(STORAGE_KEYS.activeCohort, JSON.stringify(activeCohort));
    } else {
      localStorage.removeItem(STORAGE_KEYS.activeCohort);
    }
  }, [activeCohort]);

  const addPlacement = useCallback((rec: Omit<PlacementRecord, 'id'>) => {
    const newRec: PlacementRecord = {
      ...rec,
      id: generateUUID()
    };
    setPlacements(prev => [newRec, ...prev]);
    toast.success(`Logged application for ${rec.company}! 🎯`);

    if (authUser && authUser.provider === 'supabase') {
      CloudSyncService.savePlacement(authUser.id, newRec);
    }
  }, [authUser]);

  const updatePlacement = useCallback((id: string, updates: Partial<PlacementRecord>) => {
    setPlacements(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      const target = updated.find(p => p.id === id);
      if (target && authUser && authUser.provider === 'supabase') {
        CloudSyncService.savePlacement(authUser.id, target);
      }
      return updated;
    });
    toast.success('Interview status updated! 🚀');
  }, [authUser]);

  const deletePlacement = useCallback((id: string) => {
    setPlacements(prev => prev.filter(p => p.id !== id));
    toast.success('Application record removed.');
    if (authUser && authUser.provider === 'supabase') {
      CloudSyncService.deletePlacement(authUser.id, id);
    }
  }, [authUser]);

  const joinCohort = useCallback(async (code: string, name?: string): Promise<boolean> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return false;
    const cohort: CohortInfo = {
      code: cleanCode,
      name: name || `Cohort ${cleanCode}`,
      memberCount: Math.floor(Math.random() * 12) + 3,
    };
    setActiveCohort(cohort);
    toast.success(`Joined cohort ${cohort.name}! 👥`);
    return true;
  }, []);

  const leaveCohort = useCallback(() => {
    setActiveCohort(null);
    toast.success('Left cohort.');
  }, []);

  const setActiveWeek = useCallback((week: number) => _setActiveWeek(week), []);
  const setSearchQuery = useCallback((query: string) => _setSearchQuery(query), []);
  const setSelectedDifficulty = useCallback((diff: string) => _setSelectedDifficulty(diff), []);
  const setStatusFilter = useCallback((filter: 'all' | 'solved' | 'unsolved' | 'review' | 'top150') => _setStatusFilter(filter), []);
  const setCompanyFilter = useCallback((filter: CompanyTag | 'all') => _setCompanyFilter(filter), []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.solveHistory, JSON.stringify(solveHistory));
  }, [solveHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.streak, streak.toString());
  }, [streak]);

  useEffect(() => {
    if (userProfile !== null) {
      localStorage.setItem(STORAGE_KEYS.userProfile, JSON.stringify(userProfile));
    }
  }, [userProfile]);

  // ── Profile Actions ──────────────────────────────────────────────────────────
  const updateProfile = useCallback((profile: UserProfile) => {
    const normalized = normalizeUserProfile(profile) || DEFAULT_PROFILE;
    setUserProfile(normalized);
    toast.success(`Profile updated! Welcome, ${normalized.name} 👋`, { id: 'profile-update' });

    if (authUser && authUser.provider === 'supabase') {
      CloudSyncService.saveProfile(authUser.id, normalized);
    }
  }, [authUser]);

  /**
   * Shift the program start date forward to recover from a travel gap.
   * All solved problems are preserved; only the origin date changes.
   * This makes today's day/week counters pick up from where you left off.
   */
  const resumeFromDay = useCallback((newStartDate: string) => {
    setUserProfile((prev) => {
      const updated = { ...(prev ?? DEFAULT_PROFILE), startDate: newStartDate };
      localStorage.setItem(STORAGE_KEYS.userProfile, JSON.stringify(updated));
      return updated;
    });
    toast.success('Program date adjusted! Picking up from where you left off 🎯', { id: 'resume-toast' });
  }, []);

  // ── Sound ────────────────────────────────────────────────────────────────────
  const toggleSound = useCallback(() => {
    _setSoundEnabled((prev) => {
      const next = !prev;
      sounds.setEnabled(next);
      toast.success(next ? "Sound Enabled 🔊" : "Sound Muted 🔇", { id: 'sound-toggle' });
      return next;
    });
  }, []);

  // ── Problem Toggle ───────────────────────────────────────────────────────────
  const toggleProblem = useCallback((problemId: string) => {
    const nextState = !progress[problemId];
    const nowIso = new Date().toISOString();

    if (nextState) {
      sounds.playCheckSound();
      toast.success("Problem marked solved! 🎉", { id: `solve-${problemId}` });
    } else {
      sounds.playUncheckSound();
    }

    setProgress((prev) => ({ ...prev, [problemId]: nextState }));
    setSolveHistory((prev) => {
      const updated = { ...prev };
      if (nextState) {
        updated[problemId] = nowIso;
      } else {
        delete updated[problemId];
      }
      return updated;
    });

    // Authoritative Real-Time Cloud Persistence
    if (authUser && authUser.provider === 'supabase') {
      if (nextState) {
        const prob = problemLookupMap.get(problemId);
        CloudSyncService.recordSolve(authUser.id, problemId, prob?.difficulty || 'Medium');
      } else {
        CloudSyncService.removeSolve(authUser.id, problemId);
      }
    }
  }, [progress, authUser]);

  // ── Day Completion ───────────────────────────────────────────────────────────
  const isDayComplete = useCallback((weekNum: number, dayNum: number): boolean => {
    const week = PLAN_DATA.find((w) => w.week === weekNum);
    if (!week) return false;
    const day = week.days.find((d) => d.day === dayNum);
    if (!day || day.problems.length === 0) return false;
    return day.problems.every((p) => progress[p.id]);
  }, [progress]);

  const markDayComplete = useCallback((weekNum: number, dayNum: number) => {
    const week = PLAN_DATA.find((w) => w.week === weekNum);
    if (!week) return;
    const day = week.days.find((d) => d.day === dayNum);
    if (!day) return;

    const newProgress = { ...progress };
    const newHistory = { ...solveHistory };
    const nowIso = new Date().toISOString();

    day.problems.forEach((p) => {
      newProgress[p.id] = true;
      if (!newHistory[p.id]) {
        newHistory[p.id] = nowIso;
      }
    });

    setProgress(newProgress);
    setSolveHistory(newHistory);
    sounds.playVictorySound();

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 }
    });

    toast.success(`Day ${dayNum} (${day.topic}) Fully Completed! 🚀`, {
      duration: 4000
    });

    // Authoritative Real-Time Cloud Persistence
    if (authUser && authUser.provider === 'supabase') {
      const batchSolves = day.problems.map((p) => ({
        problem_id: p.id,
        difficulty: p.difficulty,
        solved_at: nowIso,
      }));
      CloudSyncService.recordBatchSolves(authUser.id, batchSolves);
    }
  }, [progress, solveHistory, authUser]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats: AppStats = useMemo(() => {
    let completedDaysCount = 0;
    const uniqueSolvedIds = new Set<string>();

    PLAN_DATA.forEach((w) => {
      w.days.forEach((d) => {
        let allSolved = d.problems.length > 0;
        d.problems.forEach((p) => {
          if (progress[p.id]) {
            if (!p.isReview) {
              uniqueSolvedIds.add(p.id);
            }
          } else {
            allSolved = false;
          }
        });
        if (allSolved) completedDaysCount++;
      });
    });

    const totalProblems = CURRICULUM.totalProblems;
    const solvedCount = uniqueSolvedIds.size;

    const now = new Date();

    // Use the user's chosen start date, falling back to today if not onboarded yet
    let programStartDate = now;
    try {
      if (userProfile?.startDate) {
        const d = parseISO(userProfile.startDate);
        if (!isNaN(d.getTime())) programStartDate = d;
      }
    } catch {
      programStartDate = now;
    }

    const daysSinceStart = Math.max(0, differenceInCalendarDays(now, programStartDate) || 0);
    const currentDay = computeCurrentDay(progress, PLAN_DATA, CURRICULUM.totalDays);
    // currentWeek derived from which week the active day belongs to
    const activeWeekObj = PLAN_DATA.find(w => w.days.some(d => d.day === currentDay));
    const currentWeek = activeWeekObj ? activeWeekObj.week : Math.min(CURRICULUM.totalWeeks, Math.floor(daysSinceStart / 7) + 1);

    let missedDaysCount = 0;
    PLAN_DATA.forEach((w) => {
      w.days.forEach((d) => {
        if (d.day < currentDay && d.type !== 'rest') {
          const dayDone = d.problems.length > 0 && d.problems.every((p) => progress[p.id]);
          if (!dayDone) missedDaysCount++;
        }
      });
    });

    let targetDate = addDays(now, APP_CONFIG.defaults.targetDateOffsetDays);
    try {
      if (userProfile?.targetDate) {
        const d = parseISO(userProfile.targetDate);
        if (!isNaN(d.getTime())) targetDate = d;
      }
    } catch {
      targetDate = addDays(now, APP_CONFIG.defaults.targetDateOffsetDays);
    }
    const diffTime = targetDate.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0);

    // Explainable Readiness Formula: Coverage (40%) + Consistency/Streak (25%) + Pace (25%) + Breadth (10%)
    const coverageScore = Math.min(40, Math.round((solvedCount / (totalProblems || 1)) * 40));
    const streakScore = Math.min(25, Math.round(streak * 1.6));
    const paceScore = solvedCount === 0 ? 0 : Math.max(0, Math.min(25, 25 - missedDaysCount * 3));
    const breadthScore = (solvedCount > 0 && currentDay > 0)
      ? Math.min(10, Math.round((completedDaysCount / Math.max(1, currentDay)) * 10))
      : 0;

    const rawOdds = coverageScore + streakScore + paceScore + breadthScore;
    const oddsPercentage = solvedCount === 0 ? 0 : Math.min(95, Math.max(10, rawOdds));

    let actionableAdvice = 'Pace is rock solid. Keep tackling today\'s mission to protect your streak.';
    if (solvedCount === 0) {
      actionableAdvice = 'Start your journey by solving Day 1\'s mission to establish your baseline readiness index.';
    } else if (missedDaysCount >= 3) {
      actionableAdvice = `You have ${missedDaysCount} missed practice days dragging your pace score (-${missedDaysCount * 3} pts). Clear backlogged questions to regain momentum.`;
    } else if (streak < 3) {
      actionableAdvice = 'Your streak is just starting. A 5-day consecutive solve streak will add +8 pts to your readiness score.';
    } else if (coverageScore < 15) {
      actionableAdvice = 'Prioritize completing Phase 1 & 2 foundations (Arrays, Trees) to build baseline OA problem coverage.';
    } else if (oddsPercentage >= 75) {
      actionableAdvice = 'Elite placement tier! Focus on timed mock speedruns and target company problem tags.';
    }

    const readinessBreakdown: ReadinessBreakdown = {
      coverageScore,
      streakScore,
      paceScore,
      breadthScore,
      actionableAdvice
    };

    const solvedRatePerDay = solvedCount > 0 ? solvedCount / Math.max(1, daysSinceStart) : 1.8;
    const remainingProblems = totalProblems - solvedCount;
    const projectedDaysNeeded = Math.ceil(remainingProblems / Math.max(0.5, solvedRatePerDay));
    const projectedCompletionDate = format(addDays(now, projectedDaysNeeded), 'MMM dd, yyyy');

    const isOnTrack = missedDaysCount <= 3 && solvedCount >= Math.floor(currentDay * 1.5);

    return {
      solvedCount,
      totalProblems,
      streak,
      daysLeft,
      missedDaysCount,
      oddsPercentage,
      completedDaysCount,
      currentWeek,
      currentDay,
      isOnTrack,
      projectedCompletionDate,
      readinessBreakdown
    };
  }, [progress, streak, userProfile]);

  const catchUpQueue = useMemo(
    () => computeCatchUpQueue(progress, PLAN_DATA, stats.currentDay),
    [progress, stats.currentDay]
  );

  // ── Import / Export ──────────────────────────────────────────────────────────
  const exportJSONString = useCallback((): string => {
    const data = {
      version: 4,
      progress,
      solveHistory,
      streak,
      userProfile,
      placements,
      activeCohort,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }, [progress, solveHistory, streak, userProfile, placements, activeCohort]);

  const exportJSON = useCallback(() => {
    const jsonStr = exportJSONString();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (userProfile?.name || 'user').toLowerCase().replace(/\s+/g, '_');
    a.download = `${APP_CONFIG.exports.filenamePrefix}_${safeName}_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    toast.success("Progress backup downloaded! 💾");
  }, [exportJSONString, userProfile]);

  const importJSON = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed.progress === 'object') {
        setProgress(parsed.progress);
        if (parsed.solveHistory) setSolveHistory(parsed.solveHistory);
        if (parsed.userProfile && typeof parsed.userProfile === 'object') {
          setUserProfile(parsed.userProfile);
        }
        if (Array.isArray(parsed.placements)) {
          setPlacements(parsed.placements);
        }
        if (parsed.activeCohort && typeof parsed.activeCohort === 'object') {
          setActiveCohort(parsed.activeCohort);
        }
        toast.success("Progress & placements restored! 🔄");
        return true;
      }
      toast.error("Invalid backup file structure.");
      return false;
    } catch {
      toast.error("Failed to parse JSON backup.");
      return false;
    }
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.progress);
    localStorage.removeItem(STORAGE_KEYS.solveHistory);
    localStorage.removeItem(STORAGE_KEYS.streak);
    localStorage.removeItem(STORAGE_KEYS.userProfile);
    localStorage.removeItem(STORAGE_KEYS.placements);
    localStorage.removeItem(STORAGE_KEYS.activeCohort);
    setProgress({});
    setSolveHistory({});
    setUserProfile(DEFAULT_PROFILE);
    setPlacements([]);
    setActiveCohort(null);
    toast.error("All progress wiped.", { id: 'reset-toast' });
  }, []);

  // ── Auth & Live Cloud Sync Listener ─────────────────────────────────────────
  useEffect(() => {
    let unmounted = false;

    const handleUserSync = async (user: AuthUser | null) => {
      if (unmounted) return;
      setAuthUser(user);

      if (user && user.provider === 'supabase') {
        setCloudSyncStatus('syncing');

        // 1. Merge any existing guest/local solves into newly authenticated cloud account
        try {
          const rawLocal = localStorage.getItem(STORAGE_KEYS.progress);
          const rawHist = localStorage.getItem(STORAGE_KEYS.solveHistory);
          const localProg = rawLocal ? JSON.parse(rawLocal) : {};
          const localHist = rawHist ? JSON.parse(rawHist) : {};

          if (Object.keys(localProg).length > 0) {
            await CloudSyncService.mergeLocalProgressToCloud(user.id, localProg, localHist);
          }
        } catch {
          // ignore localStorage parse issues
        }

        // 2. Authoritative pull from Supabase
        const pull = await CloudSyncService.pullFromCloud(user.id);
        if (pull.success && pull.data) {
          if (pull.data.progress && Object.keys(pull.data.progress).length > 0) {
            setProgress((prev) => ({ ...prev, ...pull.data!.progress }));
          }
          if (pull.data.solveHistory && Object.keys(pull.data.solveHistory).length > 0) {
            setSolveHistory((prev) => ({ ...prev, ...pull.data!.solveHistory }));
          }
          if (pull.data.placements && pull.data.placements.length > 0) {
            setPlacements(pull.data.placements);
          }
          if (pull.data.userProfile) {
            setUserProfile(pull.data.userProfile);
          } else if (user.displayName) {
            // Auto-provision profile from Google OAuth identity
            const initialProfile: UserProfile = {
              ...DEFAULT_PROFILE,
              name: user.displayName,
            };
            setUserProfile(initialProfile);
            await CloudSyncService.saveProfile(user.id, initialProfile);
          }
          setCloudSyncStatus('synced');
          setLastCloudSync(new Date());
        } else {
          setCloudSyncStatus('synced');
        }
      } else {
        setCloudSyncStatus('offline');
      }
    };

    AuthService.init().then(handleUserSync);

    const unsubscribe = AuthService.subscribe((u) => {
      if (!unmounted) setAuthUser(u);
    });

    return () => {
      unmounted = true;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setCloudSyncStatus('syncing');
    const res = await AuthService.signInWithPassword(email, pass);
    if (res.error) {
      setCloudSyncStatus('error');
      return { success: false, error: res.error };
    }
    setAuthUser(res.user);
    if (res.user && res.user.provider === 'supabase') {
      // 1. Merge local solves
      await CloudSyncService.mergeLocalProgressToCloud(res.user.id, progress, solveHistory);
      // 2. Pull authoritative cloud state
      const pull = await CloudSyncService.pullFromCloud(res.user.id);
      if (pull.success && pull.data) {
        if (pull.data.progress) setProgress((prev) => ({ ...prev, ...pull.data!.progress }));
        if (pull.data.solveHistory) setSolveHistory((prev) => ({ ...prev, ...pull.data!.solveHistory }));
        if (pull.data.placements) setPlacements(pull.data.placements);
        if (pull.data.userProfile) setUserProfile(pull.data.userProfile);
      }
      setCloudSyncStatus('synced');
      setLastCloudSync(new Date());
    }
    return { success: true };
  }, [progress, solveHistory]);

  const signup = useCallback(async (email: string, pass: string, name: string) => {
    setCloudSyncStatus('syncing');
    const res = await AuthService.signUp(email, pass, name);
    if (res.error) {
      setCloudSyncStatus('error');
      return { success: false, error: res.error };
    }
    setAuthUser(res.user);
    if (res.user && res.user.provider === 'supabase') {
      const newProfile: UserProfile = userProfile || { ...DEFAULT_PROFILE, name };
      setUserProfile(newProfile);
      await CloudSyncService.pushToCloud({
        userId: res.user.id,
        userProfile: newProfile,
        progress,
        solveHistory,
        placements,
        streak,
        solvedCount: stats.solvedCount,
      });
      setCloudSyncStatus('synced');
      setLastCloudSync(new Date());
    }
    return { success: true };
  }, [userProfile, progress, solveHistory, placements, streak, stats.solvedCount]);

  const signInWithMagicLink = useCallback(async (email: string) => {
    return await AuthService.signInWithMagicLink(email);
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    return await AuthService.signInWithOAuth(provider);
  }, []);

  const logout = useCallback(async () => {
    await AuthService.signOut();
    setAuthUser(null);
    setCloudSyncStatus('offline');
  }, []);

  const triggerCloudSync = useCallback(async (): Promise<boolean> => {
    if (!authUser) return false;
    setCloudSyncStatus('syncing');
    const res = await CloudSyncService.pushToCloud({
      userId: authUser.id,
      userProfile: userProfile || DEFAULT_PROFILE,
      progress,
      solveHistory,
      placements,
      streak,
      solvedCount: stats.solvedCount,
    });
    if (res.success) {
      setCloudSyncStatus('synced');
      setLastCloudSync(new Date());
      return true;
    } else {
      setCloudSyncStatus('error');
      return false;
    }
  }, [authUser, userProfile, progress, solveHistory, placements, streak, stats.solvedCount]);

  // Debounced auto-sync when solves change
  useEffect(() => {
    if (!authUser) return;
    const timer = setTimeout(() => {
      CloudSyncService.pushToCloud({
        userId: authUser.id,
        userProfile: userProfile || DEFAULT_PROFILE,
        progress,
        solveHistory,
        placements,
        streak,
        solvedCount: stats.solvedCount,
      }).then((res) => {
        if (res.success) {
          setCloudSyncStatus('synced');
          setLastCloudSync(new Date());
        }
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [authUser, progress, userProfile, placements, solveHistory, streak, stats.solvedCount]);

  const contextValue = useMemo(() => ({
    progress,
    solveHistory,
    streak,
    dailySolveLog,
    stats,
    userProfile: userProfile ?? DEFAULT_PROFILE,
    isOnboarded,
    updateProfile,
    resumeFromDay,
    toggleProblem,
    markDayComplete,
    isDayComplete,
    activeWeek,
    setActiveWeek,
    searchQuery,
    setSearchQuery,
    selectedDifficulty,
    setSelectedDifficulty,
    statusFilter,
    setStatusFilter,
    companyFilter,
    setCompanyFilter,
    placements,
    addPlacement,
    updatePlacement,
    deletePlacement,
    activeCohort,
    joinCohort,
    leaveCohort,
    exportJSON,
    exportJSONString,
    importJSON,
    resetAll,
    soundEnabled,
    toggleSound,
    authUser,
    login,
    signup,
    signInWithMagicLink,
    signInWithOAuth,
    logout,
    cloudSyncStatus,
    lastCloudSync,
    triggerCloudSync,
    catchUpQueue,
  }), [
    progress, solveHistory, streak, dailySolveLog, stats, userProfile, isOnboarded,
    updateProfile, resumeFromDay, toggleProblem, markDayComplete, isDayComplete,
    activeWeek, setActiveWeek, searchQuery, setSearchQuery, selectedDifficulty, setSelectedDifficulty,
    statusFilter, setStatusFilter, companyFilter, setCompanyFilter, placements, addPlacement,
    updatePlacement, deletePlacement, activeCohort, joinCohort, leaveCohort, exportJSON, exportJSONString,
    importJSON, resetAll, soundEnabled, toggleSound,
    authUser, login, signup, signInWithMagicLink, signInWithOAuth, logout, cloudSyncStatus, lastCloudSync, triggerCloudSync, catchUpQueue
  ]);

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
};

export { useProgress } from './useProgress';
