import React, { useState } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { sounds } from '../../../utils/audio';

interface SetupWindowProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
  onClose: () => void;
}

export const SetupWindow: React.FC<SetupWindowProps> = ({
  currentTheme,
  onThemeChange,
  onLog,
  onClose,
}) => {
  const { userProfile, updateProfile } = useProgress();

  const [name, setName] = useState(userProfile.name === 'User' ? '' : userProfile.name);
  const [tagline, setTagline] = useState(userProfile.tagline || 'IIT-B BATCH 2027');
  const [targetTier, setTargetTier] = useState(userProfile.targetTier || 'tier1');
  const [restDay, setRestDay] = useState(userProfile.restDay || 'sunday');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || 'operator';
    const cleanTag = tagline.trim() || 'FAANG Ready';

    updateProfile({
      ...userProfile,
      name: cleanName,
      tagline: cleanTag,
      restDay: restDay as any,
      targetTier,
    });

    setSavedSuccess(true);
    sounds.playVictorySound();
    onLog(`setup: terminal initialized for [${cleanName}] @ ${cleanTag} [${targetTier}]`, 'ok');

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="wbody" style={{ width: 480, maxWidth: '90vw' }}>
      <h4>▸ USER IDENT / TERMINAL CALIBRATION</h4>
      <div className="dimtxt" style={{ fontSize: 11, marginBottom: 12 }}>
        Configure your handle, college/cohort affiliation, target tier, and phosphor palette.
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block', marginBottom: 2 }}>
            OPERATOR CALLSIGN / HANDLE
          </label>
          <input
            type="text"
            className="retro-input"
            placeholder="e.g. devansh_algo, aarav_2027"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block', marginBottom: 2 }}>
            INSTITUTION / COHORT BATCH
          </label>
          <input
            type="text"
            className="retro-input"
            placeholder="e.g. IIT Bombay Batch 2027, BITS Pilani, Self-Taught"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block', marginBottom: 2 }}>
              TARGET COMPANY TIER
            </label>
            <select
              className="retro-select"
              style={{ width: '100%' }}
              value={targetTier}
              onChange={(e) => setTargetTier(e.target.value)}
            >
              <option value="tier1">TIER-1 (FAANG / ₹35+ LPA)</option>
              <option value="fintech">QUANT & HIGH-FREQ FINTECH</option>
              <option value="unicorns">TIER-2 HIGH-GROWTH UNICORNS</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block', marginBottom: 2 }}>
              WEEKLY PROTECTED REST DAY
            </label>
            <select
              className="retro-select"
              style={{ width: '100%' }}
              value={restDay}
              onChange={(e) => setRestDay(e.target.value)}
            >
              <option value="sunday">SUNDAY (RECOMMENDED)</option>
              <option value="saturday">SATURDAY</option>
              <option value="none">NONE (HARDCORE ENGINE)</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block', marginBottom: 4 }}>
            PHOSPHOR CRT PALETTE
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { id: 'green', label: 'PHOSPHOR GREEN (VT220)' },
              { id: 'amber', label: 'AMBER CRT (C64)' },
              { id: 'white', label: 'CYBER WHITE (MATRIX)' },
              { id: 'cyan', label: 'CYAN TERMINAL (NEON)' },
            ].map((th) => (
              <button
                type="button"
                key={th.id}
                className={`k small ${currentTheme === th.id ? '' : 'ghost'}`}
                style={{ textAlign: 'left', padding: '4px 8px', fontSize: 10 }}
                onClick={() => {
                  onThemeChange(th.id);
                  sounds.playTickSound();
                }}
              >
                {currentTheme === th.id ? '▶ ' : '  '}
                {th.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <button type="submit" className="k" style={{ width: '100%', padding: '6px 12px' }}>
            APPLY CALIBRATION & LAUNCH DESKTOP
          </button>
        </div>
      </form>

      {savedSuccess && (
        <div style={{ marginTop: 10, color: 'var(--fg)', fontSize: 11 }}>
          <hr />
          <span className="blink">
            ▶ PERSONALIZATION APPLIED. WELCOME ABOARD, {name.toUpperCase() || 'OPERATOR'}. █
          </span>
        </div>
      )}
    </div>
  );
};
