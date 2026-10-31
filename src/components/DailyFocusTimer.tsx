import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { sounds } from '../utils/audio';
import toast from 'react-hot-toast';
import { STORAGE_KEYS } from '../config/storageKeys';

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
        toast.success("Focus session completed. Take a short break.", { duration: 5000 });
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
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16
    }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--radius-md)',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-primary)'
        }}>
          <Timer size={16} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Focus Stopwatch
            </span>
            {isActive && (
              <span className="badge badge-success" style={{ fontSize: 10, padding: '1px 6px' }}>
                Running
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            Dedicated deep-work practice session
          </div>
        </div>
      </div>

      {/* Clock display & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700,
            color: 'var(--text-primary)', letterSpacing: '0.05em', lineHeight: 1
          }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            {progressPct}% elapsed
          </div>
        </div>

        {/* Presets */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[25, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => resetTimer(m)}
              style={{
                fontSize: 11, fontFamily: 'var(--font-mono)', padding: '4px 8px',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)',
                background: totalSeconds === m * 60 ? 'var(--bg-hover)' : 'var(--bg-card)',
                color: totalSeconds === m * 60 ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {m}m
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={toggleTimer}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            {isActive ? <Pause size={12} /> : <Play size={12} />}
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={() => resetTimer(totalSeconds / 60)}
            className="btn btn-default"
            style={{ padding: '6px 8px' }}
            title="Reset"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
