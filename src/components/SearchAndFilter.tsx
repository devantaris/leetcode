import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { Search, RefreshCw } from 'lucide-react';

export const SearchAndFilter: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedDifficulty,
    setSelectedDifficulty,
    statusFilter,
    setStatusFilter
  } = useProgress();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-6">
      <div className="p-4 rounded-2xl bg-[#101018] border border-gray-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* SEARCH INPUT */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems or notes..."
            className="w-full bg-[#181824] border border-gray-700/60 rounded-xl pl-10 pr-16 py-2 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-orange-500"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
            <span>Ctrl K</span>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-between md:justify-end">
          
          {/* DIFFICULTY PILLS */}
          <div className="flex items-center gap-1 bg-[#181824] p-1 rounded-xl border border-gray-800">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
              const active = selectedDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    active
                      ? diff === 'Easy'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : diff === 'Medium'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : diff === 'Hard'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-orange-500 text-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              );
            })}
          </div>

          {/* STATUS FILTER DROPDOWN */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#181824] border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="top150">🏆 LeetCode Top 150 Only</option>
            <option value="unsolved">Unsolved Only</option>
            <option value="solved">Solved Only</option>
            <option value="review">Blind Reviews Only</option>
          </select>

          {/* RESET FILTERS */}
          {(searchQuery || selectedDifficulty !== 'All' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDifficulty('All');
                setStatusFilter('all');
              }}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition"
              title="Reset Search & Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
