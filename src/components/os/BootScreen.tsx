import React, { useState, useEffect, useRef, useCallback } from 'react';
import { beep } from '../../utils/audio';

interface BootScreenProps {
  onComplete: () => void;
}

interface BootLine {
  text: string;
  type: 'ok' | 'dim' | 'warn' | '';
}

const BOOT_LINES: BootLine[] = [
  { text: 'GRINDOS BIOS v2.4 — 140-DAY PLACEMENT OS', type: 'dim' },
  { text: '', type: '' },
  { text: 'CPU : CONSISTENCY ENGINE @ 100% ............ [OK]', type: 'ok' },
  { text: 'MEM : 640K RETENTION ....................... [OK]', type: 'ok' },
  { text: 'DSK : 280+ PROBLEMS CURATED (TOP 150) ....... [OK]', type: 'ok' },
  { text: 'SR  : LEITNER SPACED REPETITION (D3/7/21) .. [ARMED]', type: 'warn' },
  { text: 'NET : COHORT SYNC (IIT-B/42 NODES) ......... [ONLINE]', type: 'ok' },
  { text: '', type: '' },
  { text: 'LOADING KERNEL & PERSISTENCE STORE...', type: 'dim' },
];

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<BootLine[]>([]);
  const [showProgress, setShowProgress] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const completedRef = useRef(false);

  const finishBoot = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    beep(1200, 0.12);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (completedRef.current) {
        clearInterval(interval);
        return;
      }
      if (index < BOOT_LINES.length) {
        const nextLine = BOOT_LINES[index];
        setLines((prev) => [...prev, nextLine]);
        beep(320 + index * 55, 0.03);
        index++;
      } else {
        clearInterval(interval);
        setShowProgress(true);
        setTimeout(() => setProgressWidth(100), 50);
        setTimeout(() => {
          finishBoot();
        }, 850);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [finishBoot]);

  return (
    <div 
      className="boot-screen" 
      onClick={finishBoot}
      tabIndex={0}
      onKeyDown={finishBoot}
    >
      <div id="bootlog">
        {lines.map((ln, idx) => (
          <div key={idx} className={`ln ${ln.type}`}>
            {ln.text}
          </div>
        ))}
        {showProgress && (
          <div>
            <div className="bar">
              <i style={{ width: `${progressWidth}%`, transition: 'width 0.6s linear' }} />
            </div>
            <span className="dim">GRINDOS READY — LAUNCHING SHELL...</span>
          </div>
        )}
      </div>
      <div className="skip">[ CLICK ANYWHERE TO SKIP BOOT ]</div>
    </div>
  );
};
