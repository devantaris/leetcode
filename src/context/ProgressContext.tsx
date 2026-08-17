import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProgressMap, SolveRecordMap, AppStats } from '../types';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { differenceInCalendarDays, parseISO, format, addDays } from 'date-fns';

const KEY_PROGRESS = "dsa_progress_v2";
const KEY_STREAK = "dsa_streak_v2";
const KEY_LAST_DATE = "dsa_last_date_v2";
const KEY_SOLVE_HISTORY = "dsa_solve_history_v2";
const KEY_USER_PROFILE = "dsa_user_profile_v1";

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
  tagline: 'LeetCode Planner',
  startDate: format(new Date(), 'yyyy-MM-dd'),
  targetDate: '2027-01-15',
  restDay: 'sunday',
  secondarySkill: 'project',
};

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
  exportJSON: () => void;
  exportJSONString: () => string;
  importJSON: (jsonString: string) => boolean;
  resetAll: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
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
function computeLogAndStreak(solveHistory: SolveRecordMap): { dailySolveLog: DailySolveGroup[]; streak: number } {
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

  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const yesterday = addDays(now, -1);
  const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

  let currentCheckDate = now;
  if (activeDatesSet.has(todayStr)) {
    currentCheckDate = now;
  } else if (activeDatesSet.has(yesterdayStr)) {
    currentCheckDate = yesterday;
  } else if (yesterday.getDay() === 0) {
    const sat = addDays(now, -2);
    const satStr = format(sat, 'yyyy-MM-dd');
    if (activeDatesSet.has(satStr)) {
      currentCheckDate = sat;
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
    } else if (iterDate.getDay() === 0) {
      // Sunday rest day: skip without breaking
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
      const saved = localStorage.getItem(KEY_USER_PROFILE);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isOnboarded = userProfile !== null;

  const [progress, setProgress] = useState<UserProgressMap>(() => {
    try {
      const saved = localStorage.getItem(KEY_PROGRESS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [solveHistory, setSolveHistory] = useState<SolveRecordMap>(() => {
    try {
      const saved = localStorage.getItem(KEY_SOLVE_HISTORY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const { dailySolveLog, streak } = computeLogAndStreak(solveHistory);

  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved' | 'review' | 'top150'>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem(KEY_PROGRESS, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(KEY_SOLVE_HISTORY, JSON.stringify(solveHistory));
  }, [solveHistory]);

  useEffect(() => {
    localStorage.setItem(KEY_STREAK, streak.toString());
  }, [streak]);

  useEffect(() => {
    if (userProfile !== null) {
      localStorage.setItem(KEY_USER_PROFILE, JSON.stringify(userProfile));
    }
  }, [userProfile]);

  // ── Profile Actions ──────────────────────────────────────────────────────────
  const updateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    toast.success(`Profile updated! Welcome, ${profile.name} 👋`, { id: 'profile-update' });
  };

  /**
   * Shift the program start date forward to recover from a travel gap.
   * All solved problems are preserved; only the origin date changes.
   * This makes today's day/week counters pick up from where you left off.
   */
  const resumeFromDay = (newStartDate: string) => {
    setUserProfile((prev) => {
      const updated = { ...(prev ?? DEFAULT_PROFILE), startDate: newStartDate };
      localStorage.setItem(KEY_USER_PROFILE, JSON.stringify(updated));
      return updated;
    });
    toast.success('Program date adjusted! Picking up from where you left off 🎯', { id: 'resume-toast' });
  };

  // ── Sound ────────────────────────────────────────────────────────────────────
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
    toast.success(next ? "Sound Enabled 🔊" : "Sound Muted 🔇", { id: 'sound-toggle' });
  };

  // ── Problem Toggle ───────────────────────────────────────────────────────────
  const toggleProblem = (problemId: string) => {
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
  };

  // ── Day Completion ───────────────────────────────────────────────────────────
  const isDayComplete = (weekNum: number, dayNum: number): boolean => {
    const week = PLAN_DATA.find((w) => w.week === weekNum);
    if (!week) return false;
    const day = week.days.find((d) => d.day === dayNum);
    if (!day || day.problems.length === 0) return false;
    return day.problems.every((p) => progress[p.id]);
  };

  const markDayComplete = (weekNum: number, dayNum: number) => {
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
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
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
  const programStartDate = userProfile
    ? parseISO(userProfile.startDate)
    : now;

  const daysSinceStart = Math.max(0, differenceInCalendarDays(now, programStartDate));
  const currentDay = Math.min(140, daysSinceStart + 1);
  const currentWeek = Math.min(20, Math.floor(daysSinceStart / 7) + 1);

  let missedDaysCount = 0;
  PLAN_DATA.forEach((w) => {
    w.days.forEach((d) => {
      if (d.day < currentDay && d.type !== 'rest') {
        const dayDone = d.problems.length > 0 && d.problems.every((p) => progress[p.id]);
        if (!dayDone) missedDaysCount++;
      }
    });
  });

  const targetDate = userProfile
    ? parseISO(userProfile.targetDate)
    : new Date('2027-01-15');
  const diffTime = targetDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const oddsPercentage = Math.min(
    85,
    Math.round(15 + (solvedCount / (totalProblems || 1)) * 60 + Math.min(streak, 20) * 0.5)
  );

  const solvedRatePerDay = solvedCount > 0 ? solvedCount / Math.max(1, daysSinceStart) : 1.8;
  const remainingProblems = totalProblems - solvedCount;
  const projectedDaysNeeded = Math.ceil(remainingProblems / Math.max(0.5, solvedRatePerDay));
  const projectedCompletionDate = format(addDays(now, projectedDaysNeeded), 'MMM dd, yyyy');

  const isOnTrack = missedDaysCount <= 3 && solvedCount >= Math.floor(currentDay * 1.5);

  const stats: AppStats = {
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
    projectedCompletionDate
  };

  // ── Import / Export ──────────────────────────────────────────────────────────
  const exportJSONString = (): string => {
    const data = {
      version: 3,
      progress,
      solveHistory,
      streak,
      userProfile,
      lastDate: localStorage.getItem(KEY_LAST_DATE),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  };

  const exportJSON = () => {
    const jsonStr = exportJSONString();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (userProfile?.name || 'user').toLowerCase().replace(/\s+/g, '_');
    a.download = `dsa_planner_${safeName}_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    toast.success("Progress backup downloaded! 💾");
  };

  const importJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed.progress === 'object') {
        setProgress(parsed.progress);
        if (parsed.solveHistory) setSolveHistory(parsed.solveHistory);
        if (parsed.lastDate) localStorage.setItem(KEY_LAST_DATE, parsed.lastDate);
        // Restore profile if present in backup
        if (parsed.userProfile && typeof parsed.userProfile === 'object') {
          setUserProfile(parsed.userProfile);
        }
        toast.success("Progress restored successfully! 🔄");
        return true;
      }
      toast.error("Invalid backup file structure.");
      return false;
    } catch {
      toast.error("Failed to parse JSON backup.");
      return false;
    }
  };

  const resetAll = () => {
    localStorage.removeItem(KEY_PROGRESS);
    localStorage.removeItem(KEY_SOLVE_HISTORY);
    localStorage.removeItem(KEY_STREAK);
    localStorage.removeItem(KEY_LAST_DATE);
    localStorage.removeItem(KEY_USER_PROFILE);
    setProgress({});
    setSolveHistory({});
    setUserProfile(null as unknown as UserProfile);
    toast.error("All progress wiped.", { id: 'reset-toast' });
  };

  return (
    <ProgressContext.Provider
      value={{
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
        exportJSON,
        exportJSONString,
        importJSON,
        resetAll,
        soundEnabled,
        toggleSound
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
};
