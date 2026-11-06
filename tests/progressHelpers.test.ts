import { describe, it, expect } from 'vitest';
import { normalizeUserProfile, computeCurrentDay, computeCatchUpQueue, generateUUID } from '../src/utils/progressHelpers';

describe('progressHelpers unit test suite', () => {
  describe('normalizeUserProfile', () => {
    it('returns null for falsy or non-object input', () => {
      expect(normalizeUserProfile(null)).toBeNull();
      expect(normalizeUserProfile(undefined)).toBeNull();
      expect(normalizeUserProfile('invalid')).toBeNull();
      expect(normalizeUserProfile(42)).toBeNull();
    });

    it('populates defaults when given empty object', () => {
      const normalized = normalizeUserProfile({});
      expect(normalized).not.toBeNull();
      expect(normalized?.name).toBe('Operator');
      expect(normalized?.restDay).toBe('sunday');
      expect(normalized?.dailyQuota).toBe(3);
      expect(normalized?.targetTier).toBe('tier1');
      expect(normalized?.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(normalized?.targetDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('preserves valid custom profile values and custom company targets', () => {
      const custom = {
        name: 'Devansh',
        restDay: 'saturday',
        dailyQuota: 4,
        targetTier: 'faang',
        targetCompany: 'Google',
        tagline: 'Staff Engineer Velocity',
        startDate: '2026-01-01',
        targetDate: '2026-06-01',
      };
      const result = normalizeUserProfile(custom);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Devansh');
      expect(result?.restDay).toBe('saturday');
      expect(result?.dailyQuota).toBe(4);
      expect(result?.targetTier).toBe('faang');
      expect(result?.tagline).toBe('Staff Engineer Velocity');
    });
  });

  describe('generateUUID', () => {
    it('generates valid RFC4122 v4 UUID strings', () => {
      const id1 = generateUUID();
      const id2 = generateUUID();
      expect(typeof id1).toBe('string');
      expect(id1).toHaveLength(36);
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  describe('computeCurrentDay', () => {
    const mockPlan = [
      {
        week: 1,
        days: [
          { day: 1, type: 'regular', problems: [{ id: 'p1' }, { id: 'p2' }] },
          { day: 2, type: 'regular', problems: [{ id: 'p3' }, { id: 'p4' }] },
          { day: 3, type: 'rest', problems: [] },
          { day: 4, type: 'regular', problems: [{ id: 'p5' }] },
        ]
      }
    ];

    it('returns day 1 when nothing is solved', () => {
      expect(computeCurrentDay({}, mockPlan, 140)).toBe(1);
    });

    it('stays on day 1 if only partial day 1 problems are solved', () => {
      expect(computeCurrentDay({ p1: true }, mockPlan, 140)).toBe(1);
    });

    it('advances to day 2 once all required day 1 problems are solved', () => {
      expect(computeCurrentDay({ p1: true, p2: true }, mockPlan, 140)).toBe(2);
    });

    it('skips rest day 3 and advances to day 4 once day 1 and 2 are complete', () => {
      expect(computeCurrentDay({ p1: true, p2: true, p3: true, p4: true }, mockPlan, 140)).toBe(4);
    });

    it('caps at totalDays if all curriculum problems are solved', () => {
      expect(computeCurrentDay({ p1: true, p2: true, p3: true, p4: true, p5: true }, mockPlan, 140)).toBe(140);
    });
  });

  describe('computeCatchUpQueue', () => {
    const mockPlan = [
      {
        week: 1,
        days: [
          {
            day: 1,
            type: 'regular',
            topic: 'Arrays',
            problems: [
              { id: 'p1', name: 'Two Sum', difficulty: 'Easy', url: 'https://leetcode.com', lcNumber: 1 },
              { id: 'p2', name: '3Sum', difficulty: 'Medium', url: 'https://leetcode.com', lcNumber: 15 },
            ]
          },
          {
            day: 2,
            type: 'regular',
            topic: 'Strings',
            problems: [
              { id: 'p3', name: 'Valid Anagram', difficulty: 'Easy', url: 'https://leetcode.com', lcNumber: 242 },
            ]
          },
          {
            day: 3,
            type: 'rest',
            topic: 'Rest Day',
            problems: []
          }
        ]
      }
    ];

    it('returns empty array if current day is 1 (no previous days)', () => {
      const queue = computeCatchUpQueue({}, mockPlan, 1);
      expect(queue).toEqual([]);
    });

    it('collects unsolved problems from previous days in descending day order', () => {
      const queue = computeCatchUpQueue({ p1: true }, mockPlan, 3);
      expect(queue).toHaveLength(2);
      expect(queue[0].day).toBe(2);
      expect(queue[0].solvedCount).toBe(0);
      expect(queue[0].totalCount).toBe(1);

      expect(queue[1].day).toBe(1);
      expect(queue[1].solvedCount).toBe(1);
      expect(queue[1].totalCount).toBe(2);
    });

    it('does not include days where all required problems are solved', () => {
      const queue = computeCatchUpQueue({ p1: true, p2: true }, mockPlan, 3);
      expect(queue).toHaveLength(1);
      expect(queue[0].day).toBe(2);
    });
  });
});
