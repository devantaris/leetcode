import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Flame, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { STORAGE_KEYS } from '../config/storageKeys';
import { CURRICULUM } from '../data/curriculumStats';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
      return userProfile?.targetDate ? format(new Date(userProfile.targetDate), 'MMM d, yyyy') : 'your target date';
    } catch {
      return 'your target date';
    }
  })();

  return (
    <Alert className={`relative flex items-center justify-between gap-4 p-4 rounded-xl border ${
      isStreakHigh
        ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500'
        : 'border-amber-500/30 bg-amber-500/5 text-amber-500'
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        {isStreakHigh ? (
          <Flame className="size-5 shrink-0 text-amber-500 fill-amber-500/20" />
        ) : (
          <AlertCircle className="size-5 shrink-0 text-amber-500" />
        )}
        <AlertDescription className="text-xs sm:text-sm text-foreground/90 font-normal leading-relaxed m-0">
          {isStreakHigh ? (
            <>
              <strong className="text-foreground font-semibold">{stats.streak}-day streak active!</strong> Keep the momentum high — algorithmic consistency is the single biggest predictor of interview success.
            </>
          ) : (
            <>
              Solve <span className="font-semibold text-foreground">{CURRICULUM.dailyTarget} problems daily</span> to hit your target by <strong className="text-foreground font-semibold">{targetStr}</strong>.
              {stats.missedDaysCount > 0 && (
                <span className="text-destructive font-medium ml-1">
                  ({stats.missedDaysCount} days in backlog)
                </span>
              )}
            </>
          )}
        </AlertDescription>
      </div>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleDismiss}
        className="text-muted-foreground hover:text-foreground shrink-0 size-6"
        title="Dismiss alert"
      >
        <X className="size-3.5" />
      </Button>
    </Alert>
  );
};
