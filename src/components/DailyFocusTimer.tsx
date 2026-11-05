import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { sounds } from '../utils/audio';
import toast from 'react-hot-toast';
import { STORAGE_KEYS } from '../config/storageKeys';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

function loadTimerState(): { secondsLeft: number; totalSeconds: number; isActive: boolean; startedAt: number | null } {
  try {
    const total = parseInt(sessionStorage.getItem(STORAGE_KEYS.timerTotal) || '') || 45 * 60;
    const active = sessionStorage.getItem(STORAGE_KEYS.timerActive) === 'true';
    const startedAt = parseInt(sessionStorage.getItem(STORAGE_KEYS.timerStartedAt) || '') || null;

    let secondsLeft = parseInt(sessionStorage.getItem(STORAGE_KEYS.timerSeconds) || '') || total;

    if (active && startedAt) {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      secondsLeft = Math.max(0, secondsLeft - elapsed);
    }

    return { secondsLeft, totalSeconds: total, isActive: active && secondsLeft > 0, startedAt };
  } catch {
    return { secondsLeft: 45 * 60, totalSeconds: 45 * 60, isActive: false, startedAt: null };
  }
}

export const DailyFocusTimer: React.FC = () => {
  const initial = loadTimerState();
  const [secondsLeft, setSecondsLeft] = useState<number>(initial.secondsLeft);
  const [isActive, setIsActive] = useState<boolean>(initial.isActive);
  const [totalSeconds, setTotalSeconds] = useState<number>(initial.totalSeconds);
  const startedAtRef = useRef<number | null>(initial.isActive ? Date.now() : null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.timerSeconds, secondsLeft.toString());
    sessionStorage.setItem(STORAGE_KEYS.timerTotal, totalSeconds.toString());
    sessionStorage.setItem(STORAGE_KEYS.timerActive, isActive.toString());
    if (isActive) {
      const ts = Date.now();
      startedAtRef.current = ts;
      sessionStorage.setItem(STORAGE_KEYS.timerStartedAt, ts.toString());
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.timerStartedAt);
      startedAtRef.current = null;
    }
  }, [secondsLeft, isActive, totalSeconds]);

  const prevSecondsRef = useRef<number>(secondsLeft);

  useEffect(() => {
    if (isActive && secondsLeft !== prevSecondsRef.current) {
      if (secondsLeft === 0) {
        setIsActive(false);
        sounds.playVictorySound();
        toast.success("Focus sprint completed. Take a short cognitive break.", { duration: 5000 });
      } else if (secondsLeft % 300 === 0) {
        sounds.playTickSound();
      }
    }
    prevSecondsRef.current = secondsLeft;
  }, [secondsLeft, isActive]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive) {
      startedAtRef.current = Date.now();
      interval = setInterval(() => {
        setSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const toggleTimer = () => setIsActive((prev) => !prev);

  const resetTimer = (minutes: number = 45) => {
    setIsActive(false);
    setTotalSeconds(minutes * 60);
    setSecondsLeft(minutes * 60);
    sessionStorage.removeItem(STORAGE_KEYS.timerStartedAt);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPct = Math.round(((totalSeconds - secondsLeft) / (totalSeconds || 1)) * 100);

  return (
    <Card className="border border-border/80 bg-card text-card-foreground shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
            <Timer className="size-4.5" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Deep Work Timer
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Simulate interview pressure
            </p>
          </div>
        </div>

        {/* Preset quick buttons */}
        <div className="flex items-center gap-1">
          {[25, 45, 60].map((m) => (
            <Button
              key={m}
              variant={totalSeconds === m * 60 ? "secondary" : "ghost"}
              size="xs"
              onClick={() => resetTimer(m)}
              className="text-xs h-6 px-2 font-mono"
            >
              {m}m
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-2 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="font-mono text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isActive ? "secondary" : "default"}
              size="sm"
              onClick={toggleTimer}
              className="h-8 gap-1.5 text-xs px-3"
            >
              {isActive ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              <span>{isActive ? 'Pause' : 'Start'}</span>
            </Button>

            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => resetTimer(Math.round(totalSeconds / 60))}
              className="h-8 size-8 text-muted-foreground hover:text-foreground"
              title="Reset timer"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        </div>

        <Progress value={progressPct} className="h-1.5 w-full bg-muted/60" />
      </CardContent>
    </Card>
  );
};
