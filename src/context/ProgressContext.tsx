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

export const PROGRAM_START_DATE = new Date("2026-07-27T00:00:00");

interface ProgressContextType {
  progress: UserProgressMap;
  solveHistory: SolveRecordMap;
  streak: number;
  stats: AppStats;
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

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const [streak, setStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem(KEY_STREAK) || '0', 10);
  });

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

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
    toast.success(next ? "Sound Enabled 🔊" : "Sound Muted 🔇", { id: 'sound-toggle' });
  };

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

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const lastDateStr = localStorage.getItem(KEY_LAST_DATE);

    if (lastDateStr !== todayStr) {
      if (!lastDateStr) {
        setStreak(1);
      } else {
        const lastDate = parseISO(lastDateStr);
        const daysDiff = differenceInCalendarDays(new Date(), lastDate);
        if (daysDiff === 1) {
          setStreak((prev) => prev + 1);
        } else if (daysDiff > 1) {
          const yesterday = addDays(new Date(), -1);
          if (yesterday.getDay() === 0 && daysDiff === 2) {
            setStreak((prev) => prev + 1);
          } else {
            setStreak(1);
            toast.error("Streak broken! Starting fresh today.", { id: 'streak-reset' });
          }
        }
      }
      localStorage.setItem(KEY_LAST_DATE, todayStr);
    }
  };

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
  const daysSinceStart = Math.max(0, differenceInCalendarDays(now, PROGRAM_START_DATE));
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

  const targetDate = new Date("2027-01-15T00:00:00");
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

  const exportJSONString = (): string => {
    const data = {
      version: 3,
      progress,
      solveHistory,
      streak,
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
    a.download = `leetcode_planner_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    toast.success("Progress backup downloaded! 💾");
  };

  const importJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed.progress === 'object') {
        setProgress(parsed.progress);
        if (parsed.solveHistory) setSolveHistory(parsed.solveHistory);
        if (typeof parsed.streak === 'number') setStreak(parsed.streak);
        if (parsed.lastDate) localStorage.setItem(KEY_LAST_DATE, parsed.lastDate);
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
    setProgress({});
    setSolveHistory({});
    setStreak(0);
    toast.error("All progress wiped.", { id: 'reset-toast' });
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        solveHistory,
        streak,
        stats,
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
