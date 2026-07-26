import type { WeekPlan } from '../types';
import { PLAN_DATA } from './planData';
import { TOP_150_ADDITIONS } from './top150Additions';
import { TOP_150_LC_NUMBERS } from './top150List';

/**
 * Builds the final merged plan data by:
 * 1. Inserting the 60 missing Top 150 problems into their target days
 * 2. Reordering each day's problems so Top 150 come first
 *
 * This runs once at module load time — zero runtime cost.
 */
function buildMergedPlan(): WeekPlan[] {
  // Deep clone to avoid mutating original
  const merged: WeekPlan[] = JSON.parse(JSON.stringify(PLAN_DATA));

  // Build a fast lookup: dayNumber → DayPlan reference
  const dayMap = new Map<number, { problems: any[] }>();
  for (const week of merged) {
    for (const day of week.days) {
      dayMap.set(day.day, day);
    }
  }

  // Insert missing Top 150 problems into their target days
  for (const addition of TOP_150_ADDITIONS) {
    const day = dayMap.get(addition.targetDay);
    if (day) {
      day.problems.push(addition.problem);
    }
  }

  // Reorder each day's problems: Top 150 first, then custom
  for (const week of merged) {
    for (const day of week.days) {
      day.problems.sort((a, b) => {
        const aIsTop = TOP_150_LC_NUMBERS.has(a.lcNumber) ? 0 : 1;
        const bIsTop = TOP_150_LC_NUMBERS.has(b.lcNumber) ? 0 : 1;
        return aIsTop - bIsTop;
      });
    }
  }

  return merged;
}

/** The final merged plan: original 247 custom problems + 60 missing Top 150, sorted Top 150 first. */
export const MERGED_PLAN_DATA: WeekPlan[] = buildMergedPlan();

/** Count of unique Top 150 problems in the merged plan (should be 150). */
export const TOP_150_IN_PLAN_COUNT = (() => {
  const seen = new Set<number>();
  for (const week of MERGED_PLAN_DATA) {
    for (const day of week.days) {
      for (const p of day.problems) {
        if (TOP_150_LC_NUMBERS.has(p.lcNumber) && p.lcNumber !== 0 && !p.isReview) {
          seen.add(p.lcNumber);
        }
      }
    }
  }
  return seen.size;
})();
