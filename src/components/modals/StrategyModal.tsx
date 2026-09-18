import React from 'react';
import { Sparkles } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrategyModal: React.FC<StrategyModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Topic Progression Roadmap">
      <div>
        <div className="flex items-center gap-2 text-yellow-400 font-extrabold text-lg mb-4">
          <Sparkles className="w-5 h-5" />
          <span>TOPIC PROGRESSION ROADMAP</span>
        </div>

        <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
            <strong className="text-orange-400">Phase 1 (Weeks 1-4): Linear Foundations & Search</strong> — Arrays, Two Pointers, Sliding Window, LL, Stack, Binary Search & Matrix.
          </div>
          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
            <strong className="text-blue-400">Phase 2 (Weeks 5-9): Tree & Graph Hierarchies</strong> — Trees, Heaps, Tries, Backtracking, BFS/DFS, Union Find, Dijkstra.
          </div>
          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
            <strong className="text-red-400">Phase 3 (Weeks 10-13): Dynamic Programming & Bits</strong> — 1D & 2D DP, Knapsack, String DP, Greedy Intervals & Bitwise tricks.
          </div>
          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
            <strong className="text-purple-400">Phase 4 (Week 14): System Design Shift</strong> — Reading DDIA, designing TinyURL, Rate Limiters with Redis.
          </div>
          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
            <strong className="text-green-400">Phase 5 (Weeks 15-20): FAANG & FinTech Sprint</strong> — Company-specific grinding (Razorpay, PhonePe, Google) & Mock Interviews.
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
