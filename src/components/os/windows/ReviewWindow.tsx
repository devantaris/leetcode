import React, { useState, useMemo, useEffect } from 'react';
import { useProgress, problemLookupMap } from '../../../context/ProgressContext';
import { beep } from '../../../utils/audio';
import { differenceInCalendarDays, parseISO } from 'date-fns';

interface ReviewWindowProps {
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
  onAwardXP: (amount: number) => void;
}

interface ReviewItem {
  id: string;
  name: string;
  lcNumber: number;
  url?: string;
  interval: 'D3' | 'D7' | 'D21';
  done: boolean;
}

export const ReviewWindow: React.FC<ReviewWindowProps> = ({ onLog, onAwardXP }) => {
  const { solveHistory } = useProgress();

  // Persistent review completion state
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('go_reviews_done');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('go_reviews_done', JSON.stringify(completedMap));
    } catch {
      // ignore storage error
    }
  }, [completedMap]);

  // Generate review queue dynamically from solveHistory using actual problem lookup + elapsed intervals
  const reviewQueue = useMemo<ReviewItem[]>(() => {
    const list: ReviewItem[] = [];
    const entries = Object.entries(solveHistory);
    const now = new Date();

    if (entries.length > 0) {
      entries.slice(0, 8).forEach(([problemId, isoTimestamp]) => {
        const info = problemLookupMap.get(problemId);
        let daysAgo = 1;
        try {
          if (isoTimestamp) {
            daysAgo = Math.max(0, differenceInCalendarDays(now, parseISO(isoTimestamp)));
          }
        } catch {
          daysAgo = 1;
        }

        const interval: 'D3' | 'D7' | 'D21' = daysAgo >= 14 ? 'D21' : daysAgo >= 5 ? 'D7' : 'D3';
        list.push({
          id: problemId,
          name: info?.name || problemId,
          lcNumber: info?.lcNumber || 0,
          url: info?.url || 'https://leetcode.com/problemset/',
          interval,
          done: !!completedMap[problemId],
        });
      });
    }

    // If fewer than 3 items, provide curated calibration spaced repetition cards
    if (list.length < 3) {
      const defaults = [
        { id: 'LC-001', name: 'Two Sum (Hash Map Index Lookup)', lcNumber: 1, url: 'https://leetcode.com/problems/two-sum/', interval: 'D3' as const },
        { id: 'LC-121', name: 'Best Time to Buy and Sell Stock (Valley-Peak)', lcNumber: 121, url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', interval: 'D7' as const },
        { id: 'LC-056', name: 'Merge Intervals (Sort + Sweep)', lcNumber: 56, url: 'https://leetcode.com/problems/merge-intervals/', interval: 'D21' as const },
      ];
      defaults.forEach((d) => {
        if (!list.some((item) => item.id === d.id)) {
          list.push({
            id: d.id,
            name: d.name,
            lcNumber: d.lcNumber,
            url: d.url,
            interval: d.interval,
            done: !!completedMap[d.id],
          });
        }
      });
    }

    return list;
  }, [solveHistory, completedMap]);

  const dueCount = reviewQueue.filter((r) => !r.done).length;
  const allDone = dueCount === 0;

  const handleToggle = (item: ReviewItem) => {
    const nextDone = !item.done;
    setCompletedMap((prev) => ({ ...prev, [item.id]: nextDone }));

    if (nextDone) {
      beep(1100, 0.08);
      onAwardXP(10);
      onLog(`review PASS: ${item.name} (${item.interval}) — interval promoted +10XP`, 'ok');
    } else {
      beep(440, 0.05);
      onLog(`review reset: ${item.name}`, 'dim');
    }
  };

  return (
    <div className="wbody" style={{ width: 480, maxWidth: '90vw' }}>
      <h4>
        ▸ BLIND REVIEWS DUE:{' '}
        <span style={{ color: dueCount > 0 ? 'var(--amb)' : 'var(--fg)' }}>
          {dueCount}
        </span>
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
        {reviewQueue.map((item) => {
          const tagClass = item.interval.toLowerCase();

          return (
            <div
              key={item.id}
              className={`row ${item.done ? 'done' : ''}`}
              onClick={() => handleToggle(item)}
              title="Click to pass blind review recall"
            >
              <span className="chk">{item.done ? '[x]' : '[ ]'}</span>
              <span className="id">{item.lcNumber > 0 ? `#${item.lcNumber}` : 'CARD'}</span>
              <span className="nm">{item.name}</span>
              <span className={`tag ${tagClass}`}>{item.interval}</span>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="k ghost small"
                  style={{ padding: '0 4px', fontSize: 9, margin: 0 }}
                  title="Open on LeetCode"
                >
                  ↗
                </a>
              )}
            </div>
          );
        })}
      </div>

      <hr />
      <div className="dimtxt" style={{ fontSize: 11 }}>
        INTERVALS: DAY 3 / DAY 7 / DAY 21 — BLIND RECALL BEFORE RE-READING CODE.
      </div>

      {allDone && (
        <div style={{ marginTop: 10, color: 'var(--fg)', fontSize: 11 }}>
          <hr />
          <span className="blink">
            ▶ QUEUE CLEAR — NEXT REVIEW IN 72H. RETENTION PROFILE HEALTHY. █
          </span>
        </div>
      )}
    </div>
  );
};
