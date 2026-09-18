// GrindOS — Dynamic Curriculum Statistics
// Computed once at module load from actual plan data.
// Replaces all hardcoded magic numbers (140, 20, 247, 307, etc.)

import { MERGED_PLAN_DATA, TOP_150_IN_PLAN_COUNT } from './mergedPlanData';

// Compute all curriculum metrics dynamically from the plan
const computeCurriculumStats = () => {
  const totalWeeks = MERGED_PLAN_DATA.length;

  let totalDays = 0;
  let totalProblems = 0;
  let practiceDays = 0;
  const uniqueProblemIds = new Set<string>();
  const topicSet = new Set<string>();

  for (const week of MERGED_PLAN_DATA) {
    for (const day of week.days) {
      totalDays++;
      if (day.type !== 'rest') {
        practiceDays++;
      }
      topicSet.add(day.topic);
      for (const problem of day.problems) {
        if (!problem.isReview) {
          uniqueProblemIds.add(problem.id);
        }
      }
    }
  }

  totalProblems = uniqueProblemIds.size;
  const totalTopics = topicSet.size;
  const dailyTarget = Math.ceil(totalProblems / Math.max(1, practiceDays));

  return {
    totalWeeks,
    totalDays,
    totalProblems,
    totalTopics,
    practiceDays,
    dailyTarget,
    top150Count: TOP_150_IN_PLAN_COUNT,
  };
};

export const CURRICULUM = computeCurriculumStats();
