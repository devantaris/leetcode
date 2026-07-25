import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { sounds } from '../utils/audio';
import toast from 'react-hot-toast';

export const DailyFocusTimer: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState<number>(45 * 60); // 45 min default
  const [isActive, setIsActive] = useState<boolean>(false);
  const [totalSeconds, setTotalSeconds] = useState<number>(45 * 60);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setIsActive(false);
            sounds.playVictorySound();
            toast.success("🏆 45-Minute Focus Session Completed! Take a breather.", { duration: 5000 });
            return 0;
          }
          if (prev % 300 === 0) {
            sounds.playTickSound();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = (minutes: number = 45) => {
    setIsActive(false);
    setTotalSeconds(minutes * 60);
    setSecondsLeft(minutes * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPct = Math.round(((totalSeconds - secondsLeft) / (totalSeconds || 1)) * 100);

  return (
    <div className="bg-[#101018] border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
      
      {/* LEFT TITLE & DESCRIPTION */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 shrink-0">
          <Timer className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            DAILY FOCUS STOPWATCH
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            45-60 min focused practice slot. Put away phone & eliminate distractions.
          </p>
        </div>
      </div>

      {/* TIMER DISPLAY & CONTROLS */}
      <div className="flex items-center gap-5">
        
        {/* TIME DIGITS */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-4xl font-black text-white tracking-widest bg-black/40 px-4 py-1.5 rounded-xl border border-gray-800">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-mono text-gray-500 mt-1">
            {progressPct}% Completed
          </span>
        </div>

        {/* PRESET BUTTONS */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => resetTimer(25)}
              className={`px-2 py-1 rounded text-[10px] font-mono border transition ${
                totalSeconds === 25 * 60 ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
              }`}
            >
              25m
            </button>
            <button
              onClick={() => resetTimer(45)}
              className={`px-2 py-1 rounded text-[10px] font-mono border transition ${
                totalSeconds === 45 * 60 ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
              }`}
            >
              45m
            </button>
            <button
              onClick={() => resetTimer(60)}
              className={`px-2 py-1 rounded text-[10px] font-mono border transition ${
                totalSeconds === 60 * 60 ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
              }`}
            >
              60m
            </button>
          </div>

          {/* PLAY / PAUSE / RESET */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTimer}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-md ${
                isActive
                  ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                  : 'bg-green-500 hover:bg-green-400 text-black'
              }`}
            >
              {isActive ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
              <span>{isActive ? 'Pause' : 'Start'}</span>
            </button>

            <button
              onClick={() => resetTimer(45)}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition border border-gray-700"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
