import React from 'react';
import { SearchAndFilter } from '../components/SearchAndFilter';
import { WeekAccordion } from '../components/WeekAccordion';

export const CurriculumPage: React.FC = () => {
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Title */}
      <div>
        <h1 style={{
          fontSize: 22, fontWeight: 700, color: 'var(--text-primary)',
          letterSpacing: '-0.02em', margin: '0 0 4px'
        }}>
          Syllabus
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          25-week chronological progression through foundational data structures and algorithms.
        </p>
      </div>

      {/* Instant Search & Filter */}
      <SearchAndFilter />

      {/* Week-by-Week Accordion */}
      <WeekAccordion />
    </div>
  );
};
