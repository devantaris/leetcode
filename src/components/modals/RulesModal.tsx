import React from 'react';
import { BookOpen } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { useProgress } from '../../context/ProgressContext';
import { CURRICULUM } from '../../data/curriculumStats';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REST_DAY_LABELS: Record<string, string> = {
  sunday: 'Sundays',
  saturday: 'Saturdays',
  none: 'No scheduled rest day',
};

const SKILL_LABELS: Record<string, string> = {
  project: 'personal projects',
  research: 'research papers',
  competitive: 'competitive programming',
  'system-design': 'system design',
  'open-source': 'open source contributions',
  other: 'other interests',
};

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const { userProfile } = useProgress();
  const restLabel = REST_DAY_LABELS[userProfile.restDay] || 'Sundays';
  const skillLabel = SKILL_LABELS[userProfile.secondarySkill] || 'personal projects';
  const hasRestDay = userProfile.restDay !== 'none';

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="The 4 Core Rules">
      <div>
        <div className="flex items-center gap-2 text-orange-400 font-extrabold text-lg mb-4">
          <BookOpen className="w-5 h-5" />
          <span>THE 4 CORE RULES</span>
        </div>

        <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800">
            <h4 className="font-bold text-white mb-1">1. Daily Practice (45-60 min)</h4>
            <p className="text-gray-400">{CURRICULUM.dailyTarget} curated problems every practice day. Set the built-in timer, eliminate distractions, and solve.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-yellow-950/20 border border-yellow-500/30">
            <h4 className="font-bold text-yellow-300 mb-1">2. Weekly Blind Review</h4>
            <p className="text-gray-400">Dedicate one day per week to review. Re-solve 2 previous problems BLIND without looking at past code. Finish with 1 new Medium.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30">
            <h4 className="font-bold text-blue-300 mb-1">3. Weekly Live Contest</h4>
            <p className="text-gray-400">Join a weekly or biweekly contest. Target: Solve 2-3 problems under real-time pressure.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800">
            <h4 className="font-bold text-gray-200 mb-1">4. Scheduled Rest Day</h4>
            <p className="text-gray-400">
              {hasRestDay
                ? <>{restLabel} are for {skillLabel} or rest. Zero algorithms. Recharge your brain.</>
                : <>No rest days configured — but remember to take breaks when needed. Burnout kills consistency.</>
              }
            </p>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
