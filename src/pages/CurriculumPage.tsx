import React from 'react';
import { SearchAndFilter } from '../components/SearchAndFilter';
import { WeekAccordion } from '../components/WeekAccordion';
import { useProgress } from '../context/ProgressContext';
import { CURRICULUM } from '../data/curriculumStats';
import { BookOpen, CheckCircle2, Flame, Award } from 'lucide-react';

export const CurriculumPage: React.FC = () => {
  const { stats } = useProgress();
  const pct = Math.round((stats.solvedCount / Math.max(1, stats.totalProblems)) * 100);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Title & Quick Telemetry Header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOpen size={14} />
            </div>
            <h1 style={{
              fontSize: 22, fontWeight: 700, color: 'var(--text-primary)',
              letterSpacing: '-0.02em', margin: 0
            }}>
              Syllabus &amp; Curriculum
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            25-week chronological progression through {CURRICULUM.totalProblems} foundational problems &amp; patterns.
          </p>
        </div>

        {/* Quick telemetry badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 6,
            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            fontSize: 12, fontFamily: 'var(--font-mono)'
          }}>
            <CheckCircle2 size={13} style={{ color: 'var(--color-success-text)' }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{stats.solvedCount}</span>
            <span style={{ color: 'var(--text-muted)' }}>/ {CURRICULUM.totalProblems}</span>
            <span style={{ color: 'var(--color-success-text)', fontWeight: 700 }}>({pct}%)</span>
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 6,
            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            fontSize: 12, fontFamily: 'var(--font-mono)'
          }}>
            <Flame size={13} style={{ color: '#f59e0b' }} />
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{stats.streak}d streak</span>
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 6,
            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            fontSize: 12, fontFamily: 'var(--font-mono)'
          }}>
            <Award size={13} style={{ color: '#818cf8' }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{stats.top150Count}</span>
            <span style={{ color: 'var(--text-muted)' }}>/ 150 Top</span>
          </div>
        </div>
      </div>

      {/* Instant Search & Filter */}
      <SearchAndFilter />

      {/* Week-by-Week Accordion */}
      <WeekAccordion />
    </div>
  );
};
