import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Flame, X, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { STORAGE_KEYS } from '../config/storageKeys';
import { CURRICULUM } from '../data/curriculumStats';
import { Button } from '@/components/ui/button';

export const BrutalityBanner: React.FC = () => {
  const { stats, userProfile } = useProgress();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_KEYS.bannerDismissed) === 'true';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEYS.bannerDismissed, 'true');
    setDismissed(true);
  };

  const isStreakHigh = stats.streak >= 7;
  const targetStr = (() => {
    try {
      return userProfile?.targetDate ? format(new Date(userProfile.targetDate), 'MMM d, yyyy') : 'Target Date';
    } catch {
      return 'Target Date';
    }
  })();

  return (
    <div className="relative flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 border ${
          isStreakHigh
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
            : 'bg-primary/10 border-primary/25 text-primary'
        }`}>
          {isStreakHigh ? (
            <Flame className="size-4 fill-amber-500/30 text-amber-500" />
          ) : (
            <Zap className="size-4 text-primary" />
          )}
        </div>
        <div className="text-xs sm:text-sm text-foreground/90 font-normal leading-relaxed">
          {isStreakHigh ? (
            <>
              <strong className="text-foreground font-semibold">{stats.streak}-Day Streak Active:</strong> Algorithmic momentum is at peak velocity. Keep solving daily to lock in procedural memory.
            </>
          ) : (
            <>
              <span className="font-semibold text-foreground">Algorithmic Pace:</span> Solve{' '}
              <strong className="text-foreground font-bold">{CURRICULUM.dailyTarget} problems daily</strong> to complete the curriculum by{' '}
              <span className="font-mono font-medium text-foreground underline underline-offset-4 decoration-primary/40">{targetStr}</span>.
              {stats.missedDaysCount > 0 && (
                <span className="text-rose-400 font-medium ml-1.5">
                  ({stats.missedDaysCount} days in backlog)
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleDismiss}
        className="text-muted-foreground hover:text-foreground shrink-0 size-7 rounded-md"
        title="Dismiss alert"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
};
