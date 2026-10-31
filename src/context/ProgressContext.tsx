import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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

// ─── User Profile ─────────────────────────────────────────────────────────────
export interface UserProfile {
  name: string;
  tagline: string;
  startDate: string;
  targetDate: string;
  restDay: string;        // 'sunday' | 'saturday' | 'none'
  secondarySkill: string; // e.g. 'project' | 'research' | 'competitive' etc.
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'User',
  tagline: APP_CONFIG.defaults.defaultTagline,
  startDate: format(new Date(), 'yyyy-MM-dd'),
  targetDate: format(addDays(new Date(), APP_CONFIG.defaults.targetDateOffsetDays), 'yyyy-MM-dd'),
  restDay: 'sunday',
  secondarySkill: 'project',
};

export function normalizeUserProfile(raw: any): UserProfile | null {
  if (!raw || typeof raw !== 'object') return null;
  const now = new Date();
  const startDate = (raw.startDate && typeof raw.startDate === 'string') ? raw.startDate : format(now, 'yyyy-MM-dd');
  const targetDate = (raw.targetDate && typeof raw.targetDate === 'string')
    ? raw.targetDate
    : format(addDays(now, APP_CONFIG.defaults.targetDateOffsetDays), 'yyyy-MM-dd');

  return {
    name: (raw.name && typeof raw.name === 'string') ? raw.name : 'User',
    tagline: (raw.tagline && typeof raw.tagline === 'string') ? raw.tagline : APP_CONFIG.defaults.defaultTagline,
    startDate,
    targetDate,
    restDay: (raw.restDay === 'saturday' || raw.restDay === 'sunday' || raw.restDay === 'none') ? raw.restDay : 'sunday',
    secondarySkill: (raw.secondarySkill && typeof raw.secondarySkill === 'string') ? raw.secondarySkill : 'project',
  };
}

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
  logout: () => Promise<void>;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastCloudSync: Date | null;
  triggerCloudSync: () => Promise<boolean>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// ─── Problem Lookup Map ────────────────────────────────────────────────────────
const problemLookupMap = (() => {
  const map = new Map<string, { name: string; lcNumber: number; difficulty: string; url: string; topic: string }>();
  PLAN_DATA.forEach((w) => {
    w.days.forEach((d) => {
      d.problems.forEach((p) => {
        if (!map.has(p.id)) {
          map.set(p.id, { name: p.name, lcNumber: p.lcNumber, difficulty: p.difficulty, url: p.url, topic: d.topic });
        }
      });
    });
  });
  return map;
})();

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.userProfile);
      return saved ? normalizeUserProfile(JSON.parse(saved)) : null;
    } catch {
      return null;
    }
  });

  const isOnboarded = userProfile !== null;

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

  const { dailySolveLog, streak } = useMemo(
    () => computeLogAndStreak(solveHistory, userProfile?.restDay || 'sunday'),
    [solveHistory, userProfile?.restDay]
  );

  const [activeWeek, _setActiveWeek] = useState<number>(1);
  const [searchQuery, _setSearchQuery] = useState<string>('');
  const [selectedDifficulty, _setSelectedDifficulty] = useState<string>('All');
  const [statusFilter, _setStatusFilter] = useState<'all' | 'solved' | 'unsolved' | 'review' | 'top150'>('all');
  const [companyFilter, _setCompanyFilter] = useState<CompanyTag | 'all'>('all');
  const [soundEnabled, _setSoundEnabled] = useState<boolean>(true);

  // ── Placements & Cohort ──────────────────────────────────────────────────────
  const [placements, setPlacements] = useState<PlacementRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.placements);
      return saved ? JSON.parse(saved) : [];
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
      id: `place_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    setPlacements(prev => [newRec, ...prev]);
    toast.success(`Logged application for ${rec.company}! 🎯`);
  }, []);

  const updatePlacement = useCallback((id: string, updates: Partial<PlacementRecord>) => {
    setPlacements(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    toast.success('Interview status updated! 🚀');
  }, []);

  const deletePlacement = useCallback((id: string) => {
    setPlacements(prev => prev.filter(p => p.id !== id));
    toast.success('Application record removed.');
  }, []);

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
  }, []);

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
  }, [progress]);

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
  }, [progress, solveHistory]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats: AppStats = useMemo(() => {
    let totalProblems = 0;
    let solvedCount = 0;
    let completedDaysCount = 0;

    PLAN_DATA.forEach((w) => {
      w.days.forEach((d) => {
        let allSolved = d.problems.length > 0;
        d.problems.forEach((p) => {
          totalProblems++;
          if (progress[p.id]) {
            solvedCount++;
          } else {
            allSolved = false;
          }
        });
        if (allSolved) completedDaysCount++;
      });
    });

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
    const currentDay = Math.min(CURRICULUM.totalDays, daysSinceStart + 1);
    const currentWeek = Math.min(CURRICULUM.totalWeeks, Math.floor(daysSinceStart / 7) + 1);

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
    const paceScore = Math.max(0, Math.min(25, 25 - missedDaysCount * 3));
    const breadthScore = currentDay > 0
      ? Math.min(10, Math.round((completedDaysCount / Math.max(1, currentDay)) * 10))
      : 5;

    const rawOdds = coverageScore + streakScore + paceScore + breadthScore;
    const oddsPercentage = Math.min(95, Math.max(10, rawOdds));

    let actionableAdvice = 'Pace is rock solid. Keep tackling today\'s mission to protect your streak.';
    if (missedDaysCount >= 3) {
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
    setUserProfile(null);
    setPlacements([]);
    setActiveCohort(null);
    toast.error("All progress wiped.", { id: 'reset-toast' });
  }, []);

  // ── Auth & Live Cloud Sync ──────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('offline');
  const [lastCloudSync, setLastCloudSync] = useState<Date | null>(null);

  useEffect(() => {
    let unmounted = false;
    AuthService.init().then(async (user) => {
      if (unmounted) return;
      setAuthUser(user);
      if (user) {
        setCloudSyncStatus('syncing');
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
          }
          setCloudSyncStatus('synced');
          setLastCloudSync(new Date());
        } else {
          setCloudSyncStatus('synced');
        }
      }
    });

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
    if (res.user) {
      const pull = await CloudSyncService.pullFromCloud(res.user.id);
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
        }
      }
      setCloudSyncStatus('synced');
      setLastCloudSync(new Date());
    }
    return { success: true };
  }, []);

  const signup = useCallback(async (email: string, pass: string, name: string) => {
    setCloudSyncStatus('syncing');
    const res = await AuthService.signUp(email, pass, name);
    if (res.error) {
      setCloudSyncStatus('error');
      return { success: false, error: res.error };
    }
    setAuthUser(res.user);
    if (res.user) {
      await CloudSyncService.pushToCloud({
        userId: res.user.id,
        userProfile: userProfile || DEFAULT_PROFILE,
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
    logout,
    cloudSyncStatus,
    lastCloudSync,
    triggerCloudSync,
  }), [
    progress, solveHistory, streak, dailySolveLog, stats, userProfile, isOnboarded,
    updateProfile, resumeFromDay, toggleProblem, markDayComplete, isDayComplete,
    activeWeek, setActiveWeek, searchQuery, setSearchQuery, selectedDifficulty, setSelectedDifficulty,
    statusFilter, setStatusFilter, companyFilter, setCompanyFilter, placements, addPlacement,
    updatePlacement, deletePlacement, activeCohort, joinCohort, leaveCohort, exportJSON, exportJSONString,
    importJSON, resetAll, soundEnabled, toggleSound,
    authUser, login, signup, logout, cloudSyncStatus, lastCloudSync, triggerCloudSync
  ]);

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
};
