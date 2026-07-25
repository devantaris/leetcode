import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { X, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ModalsProps {
  activeModal: 'rules' | 'strategy' | 'reset' | null;
  onClose: () => void;
}

export const Modals: React.FC<ModalsProps> = ({ activeModal, onClose }) => {
  const { resetAll, stats } = useProgress();
  const [resetInput, setResetInput] = useState<string>('');

  if (!activeModal) return null;

  const handleConfirmReset = () => {
    if (resetInput.trim() === 'RESET') {
      resetAll();
      setResetInput('');
      onClose();
    } else {
      toast.error("Incorrect keyword. Type RESET to confirm.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#101018] border border-gray-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[85vh]">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition p-1.5 rounded-xl hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* RULES MODAL */}
        {activeModal === 'rules' && (
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-extrabold text-lg mb-4">
              <BookOpen className="w-5 h-5" />
              <span>THE 4 COMMANDMENTS OF THE ULTIMATUM</span>
            </div>

            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800">
                <h4 className="font-bold text-white mb-1">1. Mon-Fri Daily Grinding (45-60 min)</h4>
                <p className="text-gray-400">Exactly 3 LeetCode problems every day. Set the built-in timer, eliminate phone distractions, and solve.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-yellow-950/20 border border-yellow-500/30">
                <h4 className="font-bold text-yellow-300 mb-1">2. Thursday Blind Review Rule</h4>
                <p className="text-gray-400">Thursdays are Review Days. Re-solve 2 previous problems BLIND without looking at past code. Finish with 1 new Medium.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30">
                <h4 className="font-bold text-blue-300 mb-1">3. Saturday Live Contest Rule</h4>
                <p className="text-gray-400">Saturday is LeetCode Weekly/Biweekly contest day. Target: Solve 2-3 problems under real-time pressure.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800">
                <h4 className="font-bold text-gray-200 mb-1">4. Sunday Guilt-Free Rest</h4>
                <p className="text-gray-400">Sundays are strictly for your DIP Research Paper or SkillSync/Biome project work. Zero DSA. Recharge your brain.</p>
              </div>
            </div>
          </div>
        )}

        {/* STRATEGY MODAL */}
        {activeModal === 'strategy' && (
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
        )}

        {/* RESET MODAL */}
        {activeModal === 'reset' && (
          <div>
            <div className="flex items-center gap-2 text-red-500 font-extrabold text-lg mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>NUCLEAR RESET OPTION</span>
            </div>

            <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300 mb-4">
              <strong>Warning:</strong> You are about to erase <strong className="text-white font-mono">{stats.solvedCount} solved problems</strong> and your <strong className="text-white font-mono">{stats.streak}-day streak</strong> stored in this browser.
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-mono text-gray-300">
                Type <strong className="text-red-400">RESET</strong> to confirm:
              </label>
              <input
                type="text"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="RESET"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-500"
              />

              <button
                onClick={handleConfirmReset}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-lg shadow-red-600/30"
              >
                ERASE ALL PROGRESS
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
