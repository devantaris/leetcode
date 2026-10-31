import React, { useState } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { MERGED_PLAN_DATA } from '../../../data/mergedPlanData';
import { sounds } from '../../../utils/audio';

interface MissionsWindowProps {
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
}

export const MissionsWindow: React.FC<MissionsWindowProps> = ({ onLog }) => {
  const { progress, toggleProblem, stats } = useProgress();

  // Find all days flatly for quick lookup
  const allDays = React.useMemo(() => {
    const list: Array<{
      day: number;
      week: number;
      weekday: string;
      topic: string;
      problems: any[];
    }> = [];
    MERGED_PLAN_DATA.forEach((w) => {
      w.days.forEach((d) => {
        list.push({
          day: d.day,
          week: w.week,
          weekday: d.weekday,
          topic: d.topic,
          problems: d.problems,
        });
      });
    });
    return list;
  }, []);

  const todayDay = Math.min(Math.max(stats.currentDay || 1, 1), 140);
  const [selectedDay, setSelectedDay] = useState<number>(todayDay);
  const [expandedHintId, setExpandedHintId] = useState<string | null>(null);

  const currentDayData = allDays.find((d) => d.day === selectedDay) || allDays[0];
  const problems = currentDayData?.problems || [];

  const solvedCount = problems.filter((p) => !!progress[p.id]).length;
  const isDayComplete = problems.length > 0 && solvedCount === problems.length;

  const handleToggle = (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowDone = !progress[p.id];
    toggleProblem(p.id);

    if (isNowDone) {
      sounds.playCheckSound();
      onLog(`solve: ${p.name} (LC #${p.lcNumber}) +15XP`, 'ok');
    } else {
      sounds.playUncheckSound();
      onLog(`unsolve: ${p.name} -15XP`, 'warn');
    }
  };

  const nextDay = () => {
    if (selectedDay < 140) {
      setSelectedDay((d) => d + 1);
      sounds.playTickSound();
    }
  };

  const prevDay = () => {
    if (selectedDay > 1) {
      setSelectedDay((d) => d - 1);
      sounds.playTickSound();
    }
  };

  const jumpToToday = () => {
    setSelectedDay(todayDay);
    sounds.playTickSound();
  };

  return (
    <div className="wbody" style={{ width: 500, maxWidth: '90vw' }}>
      {/* Day Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <button className="k small" onClick={prevDay} disabled={selectedDay <= 1}>
            &lt; PREV
          </button>
          <button className="k small" onClick={nextDay} disabled={selectedDay >= 140}>
            NEXT &gt;
          </button>
          {selectedDay !== todayDay && (
            <button className="k ghost small" onClick={jumpToToday}>
              TODAY (DAY {todayDay})
            </button>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--dim)' }}>
          DAY <b style={{ color: 'var(--fg)' }}>{selectedDay}</b>/140 · W{currentDayData.week} ({currentDayData.weekday})
        </div>
      </div>

      <h4>
        ▸ {currentDayData.topic} —{' '}
        <span style={{ color: isDayComplete ? 'var(--fg)' : 'var(--amb)' }}>
          {solvedCount}/{problems.length} SOLVED
        </span>
      </h4>

      {/* Problems list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
        {problems.map((p) => {
          const isDone = !!progress[p.id];
          const diffTag = p.difficulty === 'Easy' ? 'e' : p.difficulty === 'Hard' ? 'h' : 'm';
          const diffText = p.difficulty === 'Easy' ? 'EASY' : p.difficulty === 'Hard' ? 'HARD' : 'MED';
          const isHintOpen = expandedHintId === p.id;

          return (
            <div key={p.id}>
              <div
                className={`row ${isDone ? 'done' : ''}`}
                onClick={(e) => handleToggle(p, e)}
                title="Click row to toggle completion"
              >
                <span className="chk">{isDone ? '[x]' : '[ ]'}</span>
                <span className="id">#{p.lcNumber}</span>
                <span className="nm">{p.name}</span>

                {p.companyTags && p.companyTags.length > 0 && (
                  <span className="tag" style={{ color: 'var(--dim)', borderColor: 'var(--line)', fontSize: 9 }}>
                    {p.companyTags[0].toUpperCase()}
                  </span>
                )}

                <span className={`tag ${diffTag}`}>{diffText}</span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedHintId(isHintOpen ? null : p.id);
                    sounds.playTickSound();
                  }}
                  className={`k small ${isHintOpen ? '' : 'ghost'}`}
                  style={{ padding: '0 5px', fontSize: 9, margin: 0 }}
                  title="Toggle algorithmic hint"
                >
                  ?
                </button>

                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="k ghost small"
                  style={{ padding: '0 4px', fontSize: 9, margin: 0 }}
                  title="Open problem in LeetCode"
                >
                  ↗
                </a>
              </div>

              {isHintOpen && (
                <div
                  style={{
                    background: '#000',
                    border: '1px solid var(--line)',
                    padding: '6px 10px',
                    margin: '2px 0 6px 30px',
                    fontSize: 11,
                    lineHeight: 1.6,
                    color: 'var(--fg)',
                  }}
                >
                  <div style={{ color: 'var(--amb)', fontWeight: 700, fontSize: 10 }}>
                    PATTERN DIRECTIVE:
                  </div>
                  <div>
                    {p.note || `Apply standard ${currentDayData.topic} principles. Check constraint bounds before implementing.`}
                  </div>
                  <div className="dimtxt" style={{ fontSize: 10, marginTop: 4 }}>
                    GOAL: Aim to solve in &lt; 25 mins without viewing external solutions.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <hr />
      <div className="dimtxt" style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
        <span>TARGET: 45 MIN DEEP WORK · +15 XP PER SOLVE</span>
        <span>DAY STREAK: 🔥 {stats.streak}</span>
      </div>

      {isDayComplete && (
        <div style={{ marginTop: 10, color: 'var(--fg)', fontSize: 11 }}>
          <hr />
          <span className="blink">
            ▶ DAY {selectedDay} COMPLETE — REVIEWS QUEUED FOR DAY {selectedDay + 3}. REST DAY PROTECTED. █
          </span>
        </div>
      )}
    </div>
  );
};
