import React, { useState } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { sounds, beep } from '../../../utils/audio';
import { getActiveSupabaseCredentials, initializeSupabaseClient, clearCustomSupabaseCredentials } from '../../../config/supabaseClient';

interface ConfigWindowProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
  onOpenAuth?: () => void;
}

type ConfigTab = 'cloud' | 'display' | 'audio' | 'workstation' | 'storage';

export const ConfigWindow: React.FC<ConfigWindowProps> = ({
  currentTheme,
  onThemeChange,
  onLog,
  onOpenAuth,
}) => {
  const {
    userProfile,
    updateProfile,
    soundEnabled,
    toggleSound,
    exportJSON,
    importJSON,
    resetAll,
    authUser,
    cloudSyncStatus,
    lastCloudSync,
    triggerCloudSync,
  } = useProgress();

  const [activeTab, setActiveTab] = useState<ConfigTab>('cloud');

  // Workstation states
  const [name, setName] = useState(userProfile.name);
  const [tagline, setTagline] = useState(userProfile.tagline);
  const [restDay, setRestDay] = useState(userProfile.restDay);
  const [startDate, setStartDate] = useState(userProfile.startDate);
  const [dailyQuota, setDailyQuota] = useState<number>(3);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Custom DB states
  const creds = getActiveSupabaseCredentials();
  const [dbUrl, setDbUrl] = useState(creds.url);
  const [dbKey, setDbKey] = useState(creds.key);
  const [dbSaveNotice, setDbSaveNotice] = useState<string | null>(null);

  // CRT Display states
  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(() => {
    return localStorage.getItem('grindos_scanlines') !== 'false';
  });
  const [vignetteEnabled, setVignetteEnabled] = useState<boolean>(() => {
    return localStorage.getItem('grindos_vignette') !== 'false';
  });

  const toggleScanlines = () => {
    const next = !scanlinesEnabled;
    setScanlinesEnabled(next);
    localStorage.setItem('grindos_scanlines', String(next));
    document.body.classList.toggle('no-scanlines', !next);
    sounds.playTickSound();
    onLog(`display: scanlines ${next ? 'enabled' : 'disabled'}`, 'dim');
  };

  const toggleVignette = () => {
    const next = !vignetteEnabled;
    setVignetteEnabled(next);
    localStorage.setItem('grindos_vignette', String(next));
    document.body.classList.toggle('no-vignette', !next);
    sounds.playTickSound();
    onLog(`display: CRT vignette ${next ? 'enabled' : 'disabled'}`, 'dim');
  };

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
    onLog(`config: saved profile parameters for [${name}]`, 'ok');
  };

  const handleSaveDb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUrl.trim() || !dbKey.trim()) return;
    initializeSupabaseClient(dbUrl.trim(), dbKey.trim());
    sounds.playVictorySound();
    setDbSaveNotice('DATABASE CONFIG SAVED & INITIALIZED');
    onLog('config: live Supabase backend credentials linked', 'ok');
    setTimeout(() => setDbSaveNotice(null), 3000);
  };

  const handleResetDb = () => {
    clearCustomSupabaseCredentials();
    setDbUrl('');
    setDbKey('');
    sounds.playUncheckSound();
    setDbSaveNotice('RESET TO DEFAULT CREDENTIALS');
    onLog('config: custom database link detached', 'dim');
    setTimeout(() => setDbSaveNotice(null), 3000);
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
    { id: 'green', name: 'PHOSPHOR GREEN (VT220)' },
    { id: 'amber', name: 'AMBER CRT (COMMODORE)' },
    { id: 'white', name: 'CYBER WHITE (MATRIX)' },
    { id: 'cyan', name: 'CYAN TERMINAL (NEON)' },
  ];

  return (
    <div className="wbody" style={{ width: 540, maxWidth: '90vw' }}>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
        <button
          className={`k small ${activeTab === 'cloud' ? '' : 'ghost'}`}
          onClick={() => { setActiveTab('cloud'); sounds.playTickSound(); }}
        >
          1. CLOUD SYNC & AUTH
        </button>
        <button
          className={`k small ${activeTab === 'display' ? '' : 'ghost'}`}
          onClick={() => { setActiveTab('display'); sounds.playTickSound(); }}
        >
          2. CRT DISPLAY
        </button>
        <button
          className={`k small ${activeTab === 'audio' ? '' : 'ghost'}`}
          onClick={() => { setActiveTab('audio'); sounds.playTickSound(); }}
        >
          3. AUDIO
        </button>
        <button
          className={`k small ${activeTab === 'workstation' ? '' : 'ghost'}`}
          onClick={() => { setActiveTab('workstation'); sounds.playTickSound(); }}
        >
          4. WORKSTATION
        </button>
        <button
          className={`k small ${activeTab === 'storage' ? '' : 'ghost'}`}
          onClick={() => { setActiveTab('storage'); sounds.playTickSound(); }}
        >
          5. BACKUP
        </button>
      </div>

      {/* TAB 1: CLOUD SYNC & AUTH */}
      {activeTab === 'cloud' && (
        <div>
          <h4>▸ CROSS-DEVICE CLOUD SYNCHRONIZATION</h4>
          <div
            style={{
              border: '1px solid var(--line)',
              padding: 10,
              background: 'rgba(0,0,0,0.4)',
              marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--dim)' }}>AUTHENTICATED OPERATOR</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: authUser ? 'var(--fg)' : 'var(--amb)' }}>
                  {authUser ? authUser.email : 'GUEST MODE (LOCAL STORAGE ONLY)'}
                </div>
              </div>
              <button
                className="k small"
                onClick={() => onOpenAuth?.()}
              >
                {authUser ? 'ACCOUNT DETAILS' : 'LOGIN / SIGN UP'}
              </button>
            </div>

            <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 8 }}>
              SYNC STATUS:{' '}
              <b style={{ color: cloudSyncStatus === 'synced' ? 'var(--fg)' : 'var(--amb)' }}>
                {cloudSyncStatus.toUpperCase()}
              </b>{' '}
              · LAST PUSH: {lastCloudSync ? lastCloudSync.toLocaleTimeString() : 'PENDING'}
            </div>

            {authUser && (
              <div style={{ marginTop: 8 }}>
                <button
                  className="k small"
                  onClick={async () => {
                    const ok = await triggerCloudSync();
                    if (ok) sounds.playVictorySound();
                  }}
                >
                  PUSH STATE TO CLOUD NOW
                </button>
              </div>
            )}
          </div>

          <h4>▸ LIVE BACKEND PARAMETERS</h4>
          <form onSubmit={handleSaveDb} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="dimtxt" style={{ fontSize: 10 }}>
              CONNECT YOUR OWN SUPABASE DATABASE TO PERSIST DATA ACROSS LAPTOP, DESKTOP, AND MOBILE.
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block' }}>VITE_SUPABASE_URL</label>
              <input
                type="url"
                className="retro-input"
                placeholder="https://xyz.supabase.co"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block' }}>VITE_SUPABASE_ANON_KEY</label>
              <input
                type="password"
                className="retro-input"
                placeholder="eyJhbGciOi..."
                value={dbKey}
                onChange={(e) => setDbKey(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <button type="submit" className="k small">SAVE DATABASE PARAMETERS</button>
              <button type="button" className="k ghost small" onClick={handleResetDb}>DETACH CUSTOM DB</button>
            </div>
          </form>

          {dbSaveNotice && (
            <div style={{ color: 'var(--fg)', fontSize: 11, marginTop: 6 }} className="blink">
              ▶ {dbSaveNotice} █
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CRT DISPLAY */}
      {activeTab === 'display' && (
        <div>
          <h4>▸ PHOSPHOR CRT PALETTE</h4>
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

          <h4>▸ HARDWARE EMULATION SHADERS</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <button
              className={`k small ${scanlinesEnabled ? '' : 'ghost'}`}
              onClick={toggleScanlines}
            >
              CRT SCANLINES: {scanlinesEnabled ? 'ENABLED [ON]' : 'DISABLED [OFF]'}
            </button>
            <button
              className={`k small ${vignetteEnabled ? '' : 'ghost'}`}
              onClick={toggleVignette}
            >
              BARREL VIGNETTE: {vignetteEnabled ? 'ENABLED [ON]' : 'DISABLED [OFF]'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIO */}
      {activeTab === 'audio' && (
        <div>
          <h4>▸ SYNTHESIZER OSCILLATOR ENGINE</h4>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <button
              className={`k small ${soundEnabled ? '' : 'ghost'}`}
              onClick={() => {
                toggleSound();
                onLog(`config: sound effects ${soundEnabled ? 'muted' : 'enabled'}`, 'dim');
              }}
            >
              {soundEnabled ? 'MASTER AUDIO: ENABLED [🔊]' : 'MASTER AUDIO: MUTED [🔇]'}
            </button>
            <button
              className="k ghost small"
              onClick={() => {
                beep(990, 0.08);
                setTimeout(() => beep(1320, 0.08), 90);
              }}
            >
              TEST FREQUENCY CHIRP ♬
            </button>
          </div>

          <div className="dimtxt" style={{ fontSize: 11 }}>
            Audio engine utilizes Web Audio API square-wave frequency ramps mimicking classic VT220 and Commodore microcomputers.
          </div>
        </div>
      )}

      {/* TAB 4: WORKSTATION */}
      {activeTab === 'workstation' && (
        <div>
          <h4>▸ OPERATOR IDENTITY & TARGETS</h4>
          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                className="retro-input"
                placeholder="CALLSIGN / HANDLE"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="text"
                className="retro-input"
                placeholder="INSTITUTION / BATCH"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block' }}>DAILY PROBLEM QUOTA</label>
                <select
                  className="retro-select"
                  style={{ width: '100%' }}
                  value={dailyQuota}
                  onChange={(e) => setDailyQuota(Number(e.target.value))}
                >
                  <option value={2}>2 PROBLEMS / DAY (PACED)</option>
                  <option value={3}>3 PROBLEMS / DAY (STANDARD)</option>
                  <option value={4}>4 PROBLEMS / DAY (INTENSIVE)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block' }}>PROTECTED REST DAY</label>
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
              <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block' }}>JOURNEY START DATE</label>
              <input
                type="date"
                className="retro-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <button type="submit" className="k small">SAVE WORKSTATION PARAMETERS</button>
          </form>
        </div>
      )}

      {/* TAB 5: BACKUP & STORAGE */}
      {activeTab === 'storage' && (
        <div>
          <h4>▸ LOCAL-FIRST PERSISTENCE & ARCHIVAL</h4>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            <button
              className="k small"
              onClick={() => {
                exportJSON();
                onLog('config: exported backup JSON archive', 'ok');
              }}
            >
              DOWNLOAD BACKUP JSON
            </button>

            <label className="k ghost small" style={{ display: 'inline-flex', alignItems: 'center' }}>
              RESTORE FROM JSON
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <h4>▸ MEMORY PURGE (FACTORY RESET)</h4>
          {!showResetConfirm ? (
            <button
              className="k danger small"
              onClick={() => setShowResetConfirm(true)}
            >
              FACTORY RESET SYSTEM
            </button>
          ) : (
            <div style={{ border: '1px solid var(--red)', padding: 10, background: 'rgba(224,90,90,0.06)' }}>
              <div className="redtxt" style={{ fontSize: 11, marginBottom: 8 }}>
                WARNING: THIS WILL ERASE ALL SOLVE HISTORY, STREAKS, AND PLACEMENT RECORDS FROM LOCAL STORAGE.
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
                CONFIRM TOTAL PURGE
              </button>
              <button
                className="k ghost small"
                onClick={() => setShowResetConfirm(false)}
              >
                CANCEL
              </button>
            </div>
          )}
        </div>
      )}

      <hr />
      <div className="dimtxt" style={{ fontSize: 10 }}>
        GRINDOS v2.4 PRODUCTION CONFIGURATION · ZERO TRACKING · MULTI-DEVICE CLOUD READY.
      </div>
    </div>
  );
};
