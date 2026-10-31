import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { useProgress } from '../../context/ProgressContext';
import { ModalWrapper } from './ModalWrapper';
import toast from 'react-hot-toast';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const { stats, resumeFromDay } = useProgress();
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            Resume from Break
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            Shift your start date to realign today's mission with where you left off. Solved problems remain preserved.
          </p>
        </div>

        <div style={{
          padding: '10px 12px', background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
          fontSize: 12, color: 'var(--text-secondary)'
        }}>
          Current schedule: <strong style={{ color: 'var(--text-primary)' }}>Week {stats.currentWeek}, Day {stats.currentDay}</strong>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
            New Start Date
          </label>
          <input
            type="date"
            value={resumeDate}
            onChange={(e) => setResumeDate(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')}
            className="input"
          />
        </div>

        <div>
          <div className="section-label" style={{ marginBottom: 6 }}>Quick Align Presets</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[1, 7, 14, 28, 42].map((day) => (
              <button
                key={day}
                onClick={() => setResumeDate(computeStartDateForDay(day))}
                className="btn btn-default"
                style={{ fontSize: 11, padding: '3px 8px' }}
              >
                Day {day}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button onClick={onClose} className="btn btn-default">
            Cancel
          </button>
          <button onClick={handleResume} className="btn btn-primary">
            Update Start Date
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
