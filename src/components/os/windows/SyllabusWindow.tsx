import React, { useState, useMemo } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { MERGED_PLAN_DATA } from '../../../data/mergedPlanData';
import { sounds } from '../../../utils/audio';

interface SyllabusWindowProps {
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
}

const TOP_COMPANIES = ['ALL', 'GOOGLE', 'AMAZON', 'META', 'MICROSOFT', 'UBER', 'APPLE'];

export const SyllabusWindow: React.FC<SyllabusWindowProps> = ({ onLog }) => {
  const { progress, toggleProblem } = useProgress();

  const [query, setQuery] = useState('');
  const [diffFilter, setDiffFilter] = useState<'ALL' | 'Easy' | 'Medium' | 'Hard'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SOLVED' | 'UNSOLVED'>('ALL');
  const [weekFilter, setWeekFilter] = useState<number | 'ALL'>('ALL');
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');

  // Flatten all problems with week and day info
  const allProblems = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      lcNumber: number;
      difficulty: 'Easy' | 'Medium' | 'Hard';
      url: string;
      week: number;
      day: number;
      topic: string;
      companyTags?: string[];
    }> = [];

    MERGED_PLAN_DATA.forEach((w) => {
      w.days.forEach((d) => {
        d.problems.forEach((p) => {
          list.push({
            id: p.id,
            name: p.name,
            lcNumber: p.lcNumber,
            difficulty: p.difficulty,
            url: p.url,
            week: w.week,
            day: d.day,
            topic: d.topic,
            companyTags: p.companyTags,
          });
        });
      });
    });
    return list;
  }, []);

  // Filtered list
  const filtered = useMemo(() => {
    return allProblems.filter((p) => {
      if (weekFilter !== 'ALL' && p.week !== weekFilter) return false;
      if (diffFilter !== 'ALL' && p.difficulty !== diffFilter) return false;
      const isDone = !!progress[p.id];
      if (statusFilter === 'SOLVED' && !isDone) return false;
      if (statusFilter === 'UNSOLVED' && isDone) return false;

      if (companyFilter !== 'ALL') {
        const cLower = companyFilter.toLowerCase();
        if (!p.companyTags?.some((c) => c.toLowerCase() === cLower)) {
          return false;
        }
      }

      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesTopic = p.topic.toLowerCase().includes(q);
        const matchesLc = `#${p.lcNumber}`.includes(q) || `${p.lcNumber}`.includes(q);
        const matchesCompany = p.companyTags?.some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesTopic && !matchesLc && !matchesCompany) return false;
      }

      return true;
    });
  }, [allProblems, weekFilter, diffFilter, statusFilter, companyFilter, query, progress]);

  const solvedTotal = allProblems.filter((p) => !!progress[p.id]).length;

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

  return (
    <div className="wbody" style={{ width: 640, maxWidth: '90vw' }}>
      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <input
          type="text"
          className="retro-input"
          placeholder="SEARCH PROBLEM, TOPIC, LC #, OR COMPANY..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="retro-select"
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value as any)}
        >
          <option value="ALL">ALL DIFF</option>
          <option value="Easy">EASY</option>
          <option value="Medium">MEDIUM</option>
          <option value="Hard">HARD</option>
        </select>
        <select
          className="retro-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="ALL">ALL STATUS</option>
          <option value="UNSOLVED">UNSOLVED</option>
          <option value="SOLVED">SOLVED</option>
        </select>
        <select
          className="retro-select"
          value={weekFilter}
          onChange={(e) => setWeekFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
        >
          <option value="ALL">ALL 20 WEEKS</option>
          {Array.from({ length: 20 }, (_, i) => i + 1).map((w) => (
            <option key={w} value={w}>
              WEEK {w}
            </option>
          ))}
        </select>
      </div>

      {/* Target Company Filter Chips */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--dim)', alignSelf: 'center', marginRight: 4 }}>
          COMPANY:
        </span>
        {TOP_COMPANIES.map((c) => (
          <button
            key={c}
            className={`k small ${companyFilter === c ? '' : 'ghost'}`}
            style={{ fontSize: 9, padding: '1px 6px', margin: 0 }}
            onClick={() => {
              setCompanyFilter(c);
              sounds.playTickSound();
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--dim)', marginBottom: 6 }}>
        <span>
          SHOWING <b style={{ color: 'var(--fg)' }}>{filtered.length}</b> OF {allProblems.length} PROBLEMS
        </span>
        <span>
          OVERALL: <b style={{ color: 'var(--fg)' }}>{solvedTotal}</b>/{allProblems.length} SOLVED ({((solvedTotal / allProblems.length) * 100).toFixed(1)}%)
        </span>
      </div>

      <hr />

      {/* Table List */}
      <div style={{ maxHeight: '42vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filtered.length === 0 ? (
          <div className="dimtxt" style={{ padding: '16px 0', textAlign: 'center' }}>
            — NO PROBLEMS MATCHING FILTER —
          </div>
        ) : (
          filtered.slice(0, 100).map((p) => {
            const isDone = !!progress[p.id];
            const diffTag = p.difficulty === 'Easy' ? 'e' : p.difficulty === 'Hard' ? 'h' : 'm';
            const diffText = p.difficulty === 'Easy' ? 'EASY' : p.difficulty === 'Hard' ? 'HARD' : 'MED';

            return (
              <div
                key={p.id}
                className={`row ${isDone ? 'done' : ''}`}
                onClick={(e) => handleToggle(p, e)}
              >
                <span className="chk">{isDone ? '[x]' : '[ ]'}</span>
                <span className="id" style={{ width: 62 }}>W{p.week} D{p.day}</span>
                <span className="id" style={{ width: 44 }}>#{p.lcNumber}</span>
                <span className="nm">{p.name}</span>

                {p.companyTags && p.companyTags.length > 0 && (
                  <span className="tag" style={{ color: 'var(--dim)', borderColor: 'var(--line)', fontSize: 9 }}>
                    {p.companyTags[0].toUpperCase()}
                  </span>
                )}

                <span className={`tag ${diffTag}`}>{diffText}</span>

                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="k ghost small"
                  style={{ padding: '0 4px', fontSize: 9, margin: 0 }}
                  title="Open on LeetCode"
                >
                  ↗
                </a>
              </div>
            );
          })
        )}
        {filtered.length > 100 && (
          <div className="dimtxt" style={{ fontSize: 10, textAlign: 'center', marginTop: 4 }}>
            ... and {filtered.length - 100} more problems (refine filter above)
          </div>
        )}
      </div>

      <hr />
      <div className="dimtxt" style={{ fontSize: 10 }}>
        [SPACE / CLICK ROW] TOGGLE STATUS · [↗] OPEN ON LEETCODE
      </div>
    </div>
  );
};
