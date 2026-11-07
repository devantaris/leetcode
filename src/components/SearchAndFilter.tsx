import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Search, X, RotateCcw } from 'lucide-react';
import type { CompanyTag } from '../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PricingModal } from './modals/PricingModal';
import toast from 'react-hot-toast';

export const SearchAndFilter: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedDifficulty,
    setSelectedDifficulty,
    statusFilter,
    setStatusFilter,
    companyFilter,
    setCompanyFilter,
    isPro
  } = useProgress();

  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const hasActiveFilters = searchQuery || selectedDifficulty !== 'All' || statusFilter !== 'all' || companyFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty('All');
    setStatusFilter('all');
    setCompanyFilter('all');
  };

  const handleCompanyChange = (val: string) => {
    if (val !== 'all' && !isPro) {
      setIsPricingModalOpen(true);
      toast.error('Filtering by specific company tags is a Pro feature! 🌟');
      return;
    }
    setCompanyFilter(val as CompanyTag | 'all');
  };

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-border/50">
      {/* Search Input */}
      <div className="relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by problem name, topic, LeetCode #, or algorithmic pattern..."
          className="pl-9 pr-9 text-xs sm:text-sm h-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 size-6 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-between flex-wrap gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Difficulty pills */}
          <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1 border border-border/40 text-xs">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
              const active = selectedDifficulty === diff;
              return (
                <Button
                  key={diff}
                  variant={active ? 'secondary' : 'ghost'}
                  size="xs"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`text-xs h-7 px-2.5 ${
                    active ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {diff}
                </Button>
              );
            })}
          </div>

          {/* Company filter */}
          <select
            value={companyFilter}
            onChange={(e) => handleCompanyChange(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring"
          >
            <option value="all">All Companies</option>
            <option value="amazon">Amazon {!isPro ? '🔒' : ''}</option>
            <option value="google">Google {!isPro ? '🔒' : ''}</option>
            <option value="microsoft">Microsoft {!isPro ? '🔒' : ''}</option>
            <option value="meta">Meta {!isPro ? '🔒' : ''}</option>
            <option value="uber">Uber {!isPro ? '🔒' : ''}</option>
            <option value="apple">Apple {!isPro ? '🔒' : ''}</option>
            <option value="adobe">Adobe {!isPro ? '🔒' : ''}</option>
            <option value="netflix">Netflix {!isPro ? '🔒' : ''}</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'solved' | 'unsolved' | 'top150' | 'flagged')}
            className="h-8 rounded-md border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring"
          >
            <option value="all">All Status</option>
            <option value="unsolved">Unsolved Only</option>
            <option value="solved">Solved Only</option>
            <option value="top150">Top 150 Benchmark</option>
            <option value="flagged">Flagged for Review</option>
          </select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground h-8 gap-1"
          >
            <RotateCcw className="size-3" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>

      <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} />
    </div>
  );
};
