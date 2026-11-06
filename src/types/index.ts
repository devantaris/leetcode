export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type DayType = 'regular' | 'review' | 'contest' | 'rest';

export type CompanyTag = 'amazon' | 'google' | 'microsoft' | 'meta' | 'apple' | 'uber' | 'adobe' | 'netflix';

export interface Problem {
  id: string;
  name: string;
  lcNumber: number;
  difficulty: Difficulty;
  url: string;
  note: string;
  isReview?: boolean;
  companyTags?: CompanyTag[];
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

export interface ProblemNoteMap {
  [problemId: string]: string; // Personal approach notes
}

export interface ProblemFlagMap {
  [problemId: string]: boolean; // Flagged for review
}

export interface ReadinessBreakdown {
  coverageScore: number;     // 0-40 based on solved / total
  streakScore: number;       // 0-25 based on streak consistency
  paceScore: number;         // 0-25 based on target pace vs deadline
  breadthScore: number;      // 0-10 based on phase distribution
  actionableAdvice: string;  // Explicit guidance on what moves the score
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
  readinessBreakdown: ReadinessBreakdown;
}

export type PlacementStage = 
  | 'Wishlist' 
  | 'Applied' 
  | 'OA Pending' 
  | 'OA Cleared' 
  | 'Technical Round 1' 
  | 'Technical Round 2' 
  | 'Managerial / HR' 
  | 'Offer Received 🎉' 
  | 'Rejected';

export interface PlacementRecord {
  id: string;
  company: string;
  role: string;
  stage: PlacementStage;
  appliedDate: string;
  interviewDate?: string;
  contactInfo?: string;
  compensation?: string;
  notes?: string;
}

export interface CohortInfo {
  code: string;
  name: string;
  memberCount: number;
  isOwner?: boolean;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'banner' | 'modal' | 'toast';
  category: 'update' | 'pricing' | 'maintenance' | 'feature';
  targetTier: 'all' | 'free' | 'pro';
  ctaLabel?: string;
  ctaUrl?: string;
  isActive: boolean;
  startsAt: string;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface AdminTelemetry {
  totalRegisteredUsers: number;
  activeSolvers7d: number;
  solvesToday: number;
  totalSolvesCount: number;
  offerConversionRate: number;
  totalCohorts: number;
  companyDistribution: Array<{ company: string; count: number; percentage: number }>;
  tierDistribution: Array<{ tier: string; count: number }>;
}

export interface AdminUserRecord {
  userId: string;
  displayName: string;
  tagline?: string;
  targetCompany?: string;
  targetTier?: string;
  isPro: boolean;
  solvedCount: number;
  streak: number;
  lastSyncedAt?: string;
  createdAt: string;
}
