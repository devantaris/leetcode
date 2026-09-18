import React, { useState } from 'react';
import { RotateCcw, Calendar } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { useProgress } from '../../context/ProgressContext';
import { ModalWrapper } from './ModalWrapper';
import toast from 'react-hot-toast';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const { stats, userProfile, resumeFromDay } = useProgress();
  const [resumeDate, setResumeDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const handleResume = () => {
    if (!resumeDate) {
      toast.error("Please pick a new start date.");
      return;
    }
    resumeFromDay(resumeDate);
    onClose();
  };

  const computeStartDateForDay = (targetDay: number): string => {
    const today = new Date();
    const daysBack = targetDay - 1;
    return format(addDays(today, -daysBack), 'yyyy-MM-dd');
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Resume Progress">
      <div>
        <div className="flex items-center gap-2 text-yellow-400 font-extrabold text-lg mb-2">
          <RotateCcw className="w-5 h-5" />
          <span>RESUME PROGRESS</span>
        </div>

        <div className="p-3.5 rounded-xl bg-yellow-950/20 border border-yellow-500/20 text-xs text-yellow-200 leading-relaxed mb-5">
          <strong className="text-yellow-400">Were you away?</strong> If you missed days due to travel, exams, or anything else — don't go backwards. Instead, shift your program's start date forward so <em>today</em> aligns with the day you left off. <strong className="text-white">Your solved problems stay intact.</strong>
        </div>

        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-300 mb-4 space-y-1">
          <p>Current program start: <strong className="text-white font-mono">{userProfile.startDate}</strong></p>
          <p>You're currently on: <strong className="text-orange-400 font-mono">Week {stats.currentWeek}, Day {stats.currentDay}</strong></p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-yellow-400" />
              New Start Date
            </label>
            <input
              type="date"
              value={resumeDate}
              onChange={(e) => setResumeDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition [color-scheme:dark]"
            />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Set this to a date that makes <em>today = the day you last left off</em>. For example, if you were on Day 22 and took a 4-week break, set this to{' '}
              <strong className="text-gray-300 font-mono">{computeStartDateForDay(22)}</strong>{' '}
              so today reads as Day 22.
            </p>
          </div>

          {resumeDate && (
            <div className="p-3 rounded-xl bg-green-950/20 border border-green-500/20 text-xs text-green-300">
              With this start date, today will be{' '}
              <strong className="text-green-400">
                Day {Math.min(140, Math.max(1, Math.round((new Date().getTime() - parseISO(resumeDate).getTime()) / (1000 * 60 * 60 * 24)) + 1))}
              </strong>
              {' '}of your program.
            </div>
          )}

          <button
            onClick={handleResume}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-sm transition shadow-lg shadow-yellow-500/20"
          >
            Adjust & Resume ✈️
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
