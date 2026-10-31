import React, { useState } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { sounds, beep } from '../../../utils/audio';

interface ConfigWindowProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
}

export const ConfigWindow: React.FC<ConfigWindowProps> = ({ currentTheme, onThemeChange, onLog }) => {
  const {
    userProfile,
    updateProfile,
    soundEnabled,
    toggleSound,
    exportJSON,
    importJSON,
    resetAll,
  } = useProgress();

  const [name, setName] = useState(userProfile.name);
  const [tagline, setTagline] = useState(userProfile.tagline);
  const [restDay, setRestDay] = useState(userProfile.restDay);
  const [startDate, setStartDate] = useState(userProfile.startDate);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      ...userProfile,
      name: name.trim() || 'User',
      tagline: tagline.trim() || 'Software Engineer',
      restDay: restDay as any,
      startDate,
    });
    sounds.playVictorySound();
    onLog(`config: saved profile calibration for ${name}`, 'ok');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importJSON(content);
        if (ok) {
          sounds.playVictorySound();
          onLog('config: imported local backup data successfully', 'ok');
        } else {
          sounds.playUncheckSound();
          onLog('config error: invalid backup JSON payload', 'warn');
        }
      }
    };
    reader.readAsText(file);
  };

  const themes = [
    { id: 'green', name: 'PHOSPHOR GREEN (CLASSIC VT220)' },
    { id: 'amber', name: 'AMBER CRT (CYBERPUNK COMMODORE)' },
    { id: 'white', name: 'CYBER WHITE (MONO MATRIX)' },
    { id: 'cyan', name: 'CYAN TERMINAL (NEUROMANCER)' },
  ];

  return (
    <div className="wbody" style={{ width: 480, maxWidth: '90vw' }}>
      {/* Phosphor theme selection */}
      <h4>▸ CRT PHOSPHOR PALETTE</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
        {themes.map((t) => (
          <button
            key={t.id}
            className={`k small ${currentTheme === t.id ? '' : 'ghost'}`}
            style={{ textAlign: 'left', padding: '6px 8px' }}
            onClick={() => {
              onThemeChange(t.id);
              sounds.playTickSound();
              onLog(`config: switched CRT theme to ${t.name}`, 'ok');
            }}
          >
            {currentTheme === t.id ? '▶ ' : '  '}
            {t.name}
          </button>
        ))}
      </div>

      {/* Audio FX */}
      <h4>▸ SYNTHESIZER AUDIO FX</h4>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <button
          className={`k small ${soundEnabled ? '' : 'ghost'}`}
          onClick={() => {
            toggleSound();
            onLog(`config: sound effects ${soundEnabled ? 'muted' : 'enabled'}`, 'dim');
          }}
        >
          {soundEnabled ? 'SOUND: ENABLED [OK]' : 'SOUND: MUTED [OFF]'}
        </button>
        <button
          className="k ghost small"
          onClick={() => {
            beep(990, 0.08);
            setTimeout(() => beep(1320, 0.08), 90);
          }}
        >
          TEST CHIRP ♬
        </button>
      </div>

      {/* Profile Calibration */}
      <h4>▸ SYSTEM CALIBRATION</h4>
      <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            className="retro-input"
            placeholder="HANDLE / USERNAME"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            className="retro-input"
            placeholder="COLLEGE / TAGLINE"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <select
            className="retro-select"
            value={restDay}
            onChange={(e) => setRestDay(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="sunday">REST DAY: SUNDAY (DEFAULT)</option>
            <option value="saturday">REST DAY: SATURDAY</option>
            <option value="none">REST DAY: NONE (HARDCORE)</option>
          </select>

          <input
            type="date"
            className="retro-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: 140 }}
            title="Start date of 140-day journey"
          />

          <button type="submit" className="k small">
            SAVE
          </button>
        </div>
      </form>

      {/* Data Backup & Restore */}
      <h4>▸ LOCAL-FIRST PERSISTENCE</h4>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <button
          className="k small"
          onClick={() => {
            exportJSON();
            onLog('config: exported backup JSON archive', 'ok');
          }}
        >
          EXPORT BACKUP JSON
        </button>

        <label className="k ghost small" style={{ display: 'inline-flex', alignItems: 'center' }}>
          RESTORE JSON
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Factory Reset */}
      <h4>▸ MEMORY PURGE</h4>
      {!showResetConfirm ? (
        <button
          className="k danger small"
          onClick={() => setShowResetConfirm(true)}
        >
          FACTORY RESET SYSTEM
        </button>
      ) : (
        <div style={{ border: '1px solid var(--red)', padding: 8, background: 'rgba(224,90,90,0.06)' }}>
          <div className="redtxt" style={{ fontSize: 11, marginBottom: 6 }}>
            ARE YOU SURE? THIS PURGES ALL SOLVE RECORDS & STREAKS FROM BROWSER MEMORY.
          </div>
          <button
            className="k danger small"
            onClick={() => {
              resetAll();
              setShowResetConfirm(false);
              sounds.playUncheckSound();
              onLog('config: system memory cleared — factory reset complete', 'warn');
            }}
          >
            CONFIRM PURGE
          </button>
          <button
            className="k ghost small"
            onClick={() => setShowResetConfirm(false)}
          >
            CANCEL
          </button>
        </div>
      )}

      <hr />
      <div className="dimtxt" style={{ fontSize: 10 }}>
        NO TELEMETRY SENT OUTSIDE THIS BROWSER. TOTAL ZERO-TRACKING PRIVACY.
      </div>
    </div>
  );
};
