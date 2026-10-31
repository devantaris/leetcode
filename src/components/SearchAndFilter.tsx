import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { Search, X } from 'lucide-react';
import type { CompanyTag } from '../types';

export const SearchAndFilter: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedDifficulty,
    setSelectedDifficulty,
    statusFilter,
    setStatusFilter,
    companyFilter,
    setCompanyFilter
  } = useProgress();

  const hasActiveFilters = searchQuery || selectedDifficulty !== 'All' || statusFilter !== 'all' || companyFilter !== 'all';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 10,
      paddingBottom: 16, borderBottom: '1px solid var(--border-default)'
    }}>
      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{
          position: 'absolute', left: 10, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-muted)'
        }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter problems, patterns, topics, or numbers..."
          className="input"
          style={{ paddingLeft: 30, fontSize: 13 }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              padding: 4, display: 'flex'
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Difficulty pills */}
          <div style={{
            display: 'inline-flex', gap: 2, background: 'var(--bg-elevated)',
            padding: 2, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)'
          }}>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
              const active = selectedDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  style={{
                    fontSize: 11, fontWeight: 500, padding: '3px 7px',
                    borderRadius: 'var(--radius-xs)', border: 'none', cursor: 'pointer',
                    background: active ? 'var(--bg-card)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {diff}
                </button>
              );
            })}
          </div>

          {/* Company filter */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value as CompanyTag | 'all')}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
              padding: '4px 8px', fontSize: 11, outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="all">All Companies</option>
            <option value="amazon">Amazon</option>
            <option value="google">Google</option>
            <option value="microsoft">Microsoft</option>
            <option value="meta">Meta</option>
            <option value="uber">Uber</option>
            <option value="apple">Apple</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'solved' | 'unsolved' | 'review' | 'top150')}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
              padding: '4px 8px', fontSize: 11, outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="top150">Top 150 Only</option>
            <option value="unsolved">Unsolved</option>
            <option value="solved">Solved</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDifficulty('All');
              setStatusFilter('all');
              setCompanyFilter('all');
            }}
            className="btn btn-ghost"
            style={{ fontSize: 11, padding: '3px 6px' }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
