export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type DayType = 'regular' | 'review' | 'contest' | 'rest';

export interface Problem {
  id: string;
  name: string;
  lcNumber: number;
  difficulty: Difficulty;
  url: string;
  note: string;
  isReview?: boolean;
}

export interface DayPlan {
  day: number; // 1 to 140
  weekday: string; // 'Mon'..'Sun'
  topic: string;
  type: DayType;
  problems: Problem[];
}

export interface WeekPlan {
  week: number; // 1 to 20
  title: string;
  topic: string;
  days: DayPlan[];
}

export interface UserProgressMap {
  [problemId: string]: boolean;
}

export interface SolveRecordMap {
  [problemId: string]: string; // ISO string timestamp when solved
}

export interface AppStats {
  solvedCount: number;
  totalProblems: number;
  streak: number;
  daysLeft: number;
  missedDaysCount: number;
  oddsPercentage: number;
  completedDaysCount: number;
  currentWeek: number;
  currentDay: number;
  isOnTrack: boolean;
  projectedCompletionDate: string;
}
