import React from 'react';
import { BookOpen } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="The 4 Core Rules">
      <div>
        <div className="flex items-center gap-2 text-orange-400 font-extrabold text-lg mb-4">
          <BookOpen className="w-5 h-5" />
          <span>THE 4 CORE RULES OF THE PLANNER</span>
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
            <p className="text-gray-400">Sundays are strictly for your projects or rest. Zero DSA. Recharge your brain.</p>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
