import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { useProgress } from '../../context/ProgressContext';
import { ModalWrapper } from './ModalWrapper';
import toast from 'react-hot-toast';
import { CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const { stats, resumeFromDay } = useProgress();
  const [resumeDate, setResumeDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const handleResume = () => {
    if (!resumeDate) {
      toast.error('Please pick a new start date.');
      return;
    }
    resumeFromDay(resumeDate);
    toast.success('Curriculum schedule realigned!');
    onClose();
  };

  const computeStartDateForDay = (targetDay: number): string => {
    const today = new Date();
    const daysBack = targetDay - 1;
    return format(addDays(today, -daysBack), 'yyyy-MM-dd');
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Resume Progress">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <CalendarClock className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold tracking-tight text-foreground">
              Realign Timeline / Day
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Shift your schedule date to align missions without losing any completed solves.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-border/50 bg-muted/20 text-xs">
          Active Timeline Position: <strong className="font-semibold text-foreground">Week {stats.currentWeek}, Day {stats.currentDay}</strong>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">
            New Effective Start Date
          </label>
          <Input
            type="date"
            value={resumeDate}
            onChange={(e) => setResumeDate(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')}
            className="text-xs h-9"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
            Quick Day Presets
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {[1, 15, 30, 60, 90, 120, 140].map((day) => (
              <Button
                key={day}
                variant="outline"
                size="xs"
                onClick={() => setResumeDate(computeStartDateForDay(day))}
                className="text-xs h-7 px-2.5 font-mono"
              >
                Day {day}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-border/50">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleResume} className="text-xs">
            Save Timeline
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
