import React, { useState, useEffect, useRef } from 'react';
import { beep, sounds } from '../../../utils/audio';

interface PomodoroWindowProps {
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
  onAwardXP: (amount: number) => void;
}

interface SavedPomoState {
  modeMinutes: number;
  secondsLeft: number;
  isRunning: boolean;
  targetEndTime: number | null;
  completedPips: number;
}

const STORAGE_KEY = 'grindos_pomo_state';

export const PomodoroWindow: React.FC<PomodoroWindowProps> = ({ onLog, onAwardXP }) => {
  const [modeMinutes, setModeMinutes] = useState<number>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s).modeMinutes || 25 : 25;
    } catch {
      return 25;
    }
  });

  const [completedPips, setCompletedPips] = useState<number>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s).completedPips || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [isRunning, setIsRunning] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (!s) return false;
      const parsed: SavedPomoState = JSON.parse(s);
      if (parsed.isRunning && parsed.targetEndTime) {
        return parsed.targetEndTime > Date.now();
      }
      return false;
    } catch {
      return false;
    }
  });

  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (!s) return 25 * 60;
      const parsed: SavedPomoState = JSON.parse(s);
      if (parsed.isRunning && parsed.targetEndTime) {
        const diff = Math.round((parsed.targetEndTime - Date.now()) / 1000);
        return Math.max(0, diff);
      }
      return parsed.secondsLeft || (parsed.modeMinutes ? parsed.modeMinutes * 60 : 25 * 60);
    } catch {
      return 25 * 60;
    }
  });

  const [justFinished, setJustFinished] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Synchronize state to localStorage
  const saveState = (updates: Partial<SavedPomoState>) => {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const parsed = current ? JSON.parse(current) : {};
      const next = { ...parsed, modeMinutes, secondsLeft, isRunning, completedPips, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage error
    }
  };

  const saveStateRef = useRef(saveState);
  saveStateRef.current = saveState;

  const fmt = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      beep(440, 0.05);
      saveState({ isRunning: false, targetEndTime: null, secondsLeft });
      onLog('pomodoro: paused focus session', 'dim');
    } else {
      setIsRunning(true);
      setJustFinished(false);
      beep(880, 0.06);
      const targetEndTime = Date.now() + secondsLeft * 1000;
      saveState({ isRunning: true, targetEndTime });
      onLog(`pomodoro: started ${modeMinutes}m deep work block`, 'ok');
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const resetSecs = modeMinutes * 60;
    setSecondsLeft(resetSecs);
    setJustFinished(false);
    saveState({ isRunning: false, targetEndTime: null, secondsLeft: resetSecs });
    sounds.playTickSound();
    onLog('pomodoro: timer reset', 'dim');
  };

  const setPreset = (mins: number) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setModeMinutes(mins);
    const resetSecs = mins * 60;
    setSecondsLeft(resetSecs);
    setJustFinished(false);
    saveState({ modeMinutes: mins, isRunning: false, targetEndTime: null, secondsLeft: resetSecs });
    sounds.playTickSound();
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            const nextPips = Math.min(4, completedPips + 1);
            setCompletedPips(nextPips);
            setJustFinished(true);
            sounds.playVictorySound();
            onAwardXP(25);
            onLog(`pomodoro: deep work block complete! +25 XP awarded ☕`, 'ok');
            const resetSecs = modeMinutes * 60;
            saveStateRef.current({ isRunning: false, targetEndTime: null, secondsLeft: resetSecs, completedPips: nextPips });
            return resetSecs;
          }
          saveStateRef.current({ secondsLeft: prev - 1 });
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, modeMinutes, completedPips, onAwardXP, onLog]);

  return (
    <div className="wbody" style={{ width: 380, maxWidth: '90vw' }}>
      {/* Preset selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button
          className={`k small ${modeMinutes === 25 ? '' : 'ghost'}`}
          onClick={() => setPreset(25)}
        >
          25 MIN (STD)
        </button>
        <button
          className={`k small ${modeMinutes === 45 ? '' : 'ghost'}`}
          onClick={() => setPreset(45)}
        >
          45 MIN (DEEP)
        </button>
        <button
          className={`k small ${modeMinutes === 60 ? '' : 'ghost'}`}
          onClick={() => setPreset(60)}
        >
          60 MIN (HEROIC)
        </button>
      </div>

      {/* Clock display */}
      <div className="clock" style={{ color: isRunning ? 'var(--fg)' : 'var(--amb)' }}>
        {fmt(secondsLeft)}
      </div>

      {/* Pips */}
      <div className="pips">
        {[0, 1, 2, 3].map((idx) => (
          <i key={idx} className={idx < completedPips ? 'full' : ''} />
        ))}
      </div>

      <div className="dimtxt" style={{ fontSize: 11, marginBottom: 12 }}>
        {isRunning
          ? 'FOCUSING… ████████████░░ (DO NOT SWITCH TABS)'
          : `READY — 4 POMODOROS = 1 DEEP BLOCK (+25 XP PER BLOCK)`}
      </div>

      {/* Action buttons */}
      <div>
        <button className="k" onClick={handleStartPause}>
          {isRunning ? 'PAUSE' : 'START'}
        </button>
        <button className="k ghost" onClick={handleReset}>
          RESET
        </button>
      </div>

      {justFinished && (
        <div style={{ marginTop: 12, color: 'var(--fg)', fontSize: 11 }}>
          <hr />
          <span className="blink">
            ▶ BLOCK COMPLETE (+25 XP) — TAKE A 5-MIN BRAIN BREAK. █
          </span>
        </div>
      )}
    </div>
  );
};
