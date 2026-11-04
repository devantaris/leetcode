import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA } from '../data/mergedPlanData';
import { TOP_150_LC_NUMBERS } from '../data/top150List';
import { Trophy, ArrowRight } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { useNavigate } from 'react-router-dom';

const top150ProblemsMap = new Map<number, { id: string; difficulty: string }>();
let easyTotal = 0, medTotal = 0, hardTotal = 0;

for (const week of MERGED_PLAN_DATA) {
  for (const day of week.days) {
    for (const p of day.problems) {
      if (TOP_150_LC_NUMBERS.has(p.lcNumber) && p.lcNumber !== 0 && !p.isReview) {
        if (!top150ProblemsMap.has(p.lcNumber)) {
          top150ProblemsMap.set(p.lcNumber, { id: p.id, difficulty: p.difficulty });
          if (p.difficulty === 'Easy') easyTotal++;
          else if (p.difficulty === 'Medium') medTotal++;
          else hardTotal++;
        }
      }
    }
  }
}
const totalTop150 = top150ProblemsMap.size;

export const Top150Card: React.FC = () => {
  const { progress, setStatusFilter } = useProgress();
  const navigate = useNavigate();

  const solvedByLc = new Set<number>();
  for (const week of MERGED_PLAN_DATA) {
    for (const day of week.days) {
      for (const p of day.problems) {
        if (TOP_150_LC_NUMBERS.has(p.lcNumber) && p.lcNumber !== 0 && !p.isReview && progress[p.id]) {
          solvedByLc.add(p.lcNumber);
        }
      }
    }
  }

  const solvedTop150 = solvedByLc.size;
  const pct = Math.round((solvedTop150 / Math.max(1, totalTop150)) * 100);

  let easySolved = 0;
  let medSolved = 0;
  let hardSolved = 0;

  for (const lcNum of solvedByLc) {
    const info = top150ProblemsMap.get(lcNum);
    if (info) {
      if (info.difficulty === 'Easy') easySolved++;
      else if (info.difficulty === 'Medium') medSolved++;
      else hardSolved++;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-primary)'
          }}>
            <Trophy size={14} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              LeetCode Top 150
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2, marginTop: 2 }}>
              Industry benchmark curated set
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setStatusFilter('top150');
            navigate('/curriculum');
          }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 3
          }}
        >
          Filter <ArrowRight size={11} />
        </button>
      </div>

      {/* Big number & bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            <AnimatedCounter value={solvedTop150} />
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ {totalTop150}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-info-text)', marginLeft: 'auto' }}>
            {pct}%
          </span>
        </div>

        <div className="progress-track" style={{ height: 6 }}>
          <div className="progress-fill-info" style={{ width: `${pct}%`, height: '100%', borderRadius: 99 }} />
        </div>
      </div>

      {/* Difficulty breakdown */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
        paddingTop: 12, borderTop: '1px solid var(--border-subtle)', textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-md)', padding: '6px 4px'
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#34d399' }}>
            {easySolved}<span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/{easyTotal}</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2, fontWeight: 600 }}>Easy</div>
        </div>
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 'var(--radius-md)', padding: '6px 4px'
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fbbf24' }}>
            {medSolved}<span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/{medTotal}</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2, fontWeight: 600 }}>Med</div>
        </div>
        <div style={{
          background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)',
          borderRadius: 'var(--radius-md)', padding: '6px 4px'
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fb7185' }}>
            {hardSolved}<span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/{hardTotal}</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2, fontWeight: 600 }}>Hard</div>
        </div>
      </div>
    </div>
  );
};
