import { format, addDays } from 'date-fns';
import { APP_CONFIG } from '../config/appConfig';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';

export interface UserProfile {
  name: string;
  tagline: string;
  startDate: string;
  targetDate: string;
  restDay: string;
  secondarySkill: string;
  dailyQuota?: number;
  targetTier?: string;
}

export const DEFAULT_PROFILE: UserProfile = {
  name: APP_CONFIG.defaults.userName,
  tagline: APP_CONFIG.defaults.defaultTagline,
  startDate: format(new Date(), 'yyyy-MM-dd'),
  targetDate: format(addDays(new Date(), APP_CONFIG.defaults.targetDateOffsetDays), 'yyyy-MM-dd'),
  restDay: 'sunday',
  secondarySkill: 'project',
  dailyQuota: 3,
  targetTier: 'tier1',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    dailyQuota: (typeof raw.dailyQuota === 'number' && [2, 3, 4].includes(raw.dailyQuota)) ? raw.dailyQuota : 3,
    targetTier: (typeof raw.targetTier === 'string') ? raw.targetTier : 'tier1',
  };
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const problemLookupMap = (() => {
  const map = new Map<string, { name: string; lcNumber: number; difficulty: string; url: string; topic: string; isReview?: boolean }>();
  PLAN_DATA.forEach((w) => {
    w.days.forEach((d) => {
      d.problems.forEach((p) => {
        if (!map.has(p.id)) {
          map.set(p.id, { name: p.name, lcNumber: p.lcNumber, difficulty: p.difficulty, url: p.url, topic: d.topic, isReview: p.isReview });
        }
      });
    });
  });
  return map;
})();
