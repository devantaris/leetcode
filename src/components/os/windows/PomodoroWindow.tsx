import React, { useState, useEffect, useRef } from 'react';
import { beep, sounds } from '../../../utils/audio';

interface PomodoroWindowProps {
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
  onAwardXP: (amount: number) => void;
}

export const PomodoroWindow: React.FC<PomodoroWindowProps> = ({ onLog, onAwardXP }) => {
  const [modeMinutes, setModeMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedPips, setCompletedPips] = useState<number>(0);
  const [justFinished, setJustFinished] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      onLog('pomodoro: paused focus session', 'dim');
    } else {
      setIsRunning(true);
      setJustFinished(false);
      beep(880, 0.06);
      onLog(`pomodoro: started ${modeMinutes}m deep work block`, 'ok');
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(modeMinutes * 60);
    setJustFinished(false);
    sounds.playTickSound();
    onLog('pomodoro: timer reset', 'dim');
  };

  const setPreset = (mins: number) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setModeMinutes(mins);
    setSecondsLeft(mins * 60);
    setJustFinished(false);
    sounds.playTickSound();
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setCompletedPips((p) => Math.min(4, p + 1));
            setJustFinished(true);
            sounds.playVictorySound();
            onAwardXP(25);
            onLog(`pomodoro: deep work block complete! +25 XP awarded ☕`, 'ok');
            return modeMinutes * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, modeMinutes, onAwardXP, onLog]);

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
