import React, { useState } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { sounds, beep } from '../../../utils/audio';
import { getActiveSupabaseCredentials, initializeSupabaseClient } from '../../../config/supabaseClient';

interface AuthWindowProps {
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
  onClose?: () => void;
}

export const AuthWindow: React.FC<AuthWindowProps> = ({ onLog, onClose }) => {
  const { authUser, login, signup, logout, cloudSyncStatus, lastCloudSync, triggerCloudSync } = useProgress();

  const [mode, setMode] = useState<'signin' | 'signup' | 'custom_db'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Custom Supabase credentials
  const currentCreds = getActiveSupabaseCredentials();
  const [customUrl, setCustomUrl] = useState(currentCreds.url);
  const [customKey, setCustomKey] = useState(currentCreds.key);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (mode === 'signin') {
      const res = await login(email.trim(), password);
      setLoading(false);
      if (res.success) {
        sounds.playVictorySound();
        setSuccessMsg(`AUTHENTICATED AS ${email.trim()}`);
        onLog(`auth: operator login verified [${email.trim()}]`, 'ok');
        setTimeout(() => onClose?.(), 1000);
      } else {
        beep(440, 0.08);
        setErrorMsg(res.error || 'Login failed. Check credentials.');
        onLog(`auth failed: ${res.error || 'invalid credentials'}`, 'warn');
      }
    } else {
      const res = await signup(email.trim(), password, displayName.trim());
      setLoading(false);
      if (res.success) {
        sounds.playVictorySound();
        setSuccessMsg(`ACCOUNT CREATED FOR ${displayName.trim() || email.trim()}`);
        onLog(`auth: new operator account created [${email.trim()}]`, 'ok');
        setTimeout(() => onClose?.(), 1000);
      } else {
        beep(440, 0.08);
        setErrorMsg(res.error || 'Signup failed.');
        onLog(`auth signup failed: ${res.error || 'unknown error'}`, 'warn');
      }
    }
  };

  const handleSaveDb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customKey.trim()) return;
    initializeSupabaseClient(customUrl.trim(), customKey.trim());
    sounds.playVictorySound();
    setSuccessMsg('LIVE DATABASE PARAMETERS LINKED');
    onLog(`cloud: linked custom database [${customUrl.trim().slice(0, 24)}...]`, 'ok');
    setTimeout(() => setMode('signin'), 1000);
  };

  const handleManualSync = async () => {
    setLoading(true);
    const ok = await triggerCloudSync();
    setLoading(false);
    if (ok) {
      sounds.playVictorySound();
      setSuccessMsg('LOCAL SOLVES SYNCED TO CLOUD');
      onLog('cloud: cross-device state push complete', 'ok');
    } else {
      sounds.playUncheckSound();
      setErrorMsg('Cloud sync failed. Check database connectivity.');
      onLog('cloud error: state push failed', 'warn');
    }
  };

  return (
    <div className="wbody" style={{ width: 490, maxWidth: '90vw' }}>
      {/* Session Banner */}
      <div
        style={{
          border: '1px solid var(--line)',
          background: 'rgba(0,0,0,0.5)',
          padding: '8px 12px',
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: 'var(--dim)', letterSpacing: '0.1em' }}>
            OPERATOR IDENTITY STATUS
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: authUser ? 'var(--fg)' : 'var(--amb)' }}>
            {authUser ? `ONLINE: ${authUser.email}` : 'GUEST / LOCAL WORKSTATION'}
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--dim)' }}>
          <div>
            DATABASE:{' '}
            <b style={{ color: currentCreds.source !== 'none' ? 'var(--fg)' : 'var(--amb)' }}>
              {currentCreds.source === 'env' ? 'SUPABASE (ENV)' : currentCreds.source === 'custom' ? 'CUSTOM CLOUD' : 'LOCAL CACHE'}
            </b>
          </div>
          <div>
            SYNC:{' '}
            <span style={{ color: cloudSyncStatus === 'synced' ? 'var(--fg)' : 'var(--amb)' }}>
              {cloudSyncStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {authUser ? (
        /* Logged In View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--fg)' }}>
            AUTHENTICATED CALLSIGN: <b>{authUser.displayName}</b>
          </div>
          <div style={{ fontSize: 11, color: 'var(--dim)' }}>
            USER ID: <code>{authUser.id}</code>
          </div>
          <div style={{ fontSize: 11, color: 'var(--dim)' }}>
            LAST CLOUD SYNC: {lastCloudSync ? lastCloudSync.toLocaleTimeString() : 'PENDING'}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="k small" onClick={handleManualSync} disabled={loading}>
              {loading ? 'SYNCING...' : 'SYNC ALL DEVICES NOW'}
            </button>
            <button
              className="k danger small"
              onClick={async () => {
                await logout();
                sounds.playUncheckSound();
                onLog('auth: operator logged out', 'dim');
              }}
            >
              LOGOUT WORKSTATION
            </button>
          </div>
        </div>
      ) : (
        /* Unauthenticated View: Sign In / Sign Up */
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <button
              type="button"
              className={`k small ${mode === 'signin' ? '' : 'ghost'}`}
              onClick={() => { setMode('signin'); setErrorMsg(null); }}
            >
              SIGN IN
            </button>
            <button
              type="button"
              className={`k small ${mode === 'signup' ? '' : 'ghost'}`}
              onClick={() => { setMode('signup'); setErrorMsg(null); }}
            >
              CREATE ACCOUNT
            </button>
            <button
              type="button"
              className={`k small ${mode === 'custom_db' ? '' : 'ghost'}`}
              onClick={() => { setMode('custom_db'); setErrorMsg(null); }}
              style={{ marginLeft: 'auto' }}
            >
              DB CONFIG
            </button>
          </div>

          {mode === 'custom_db' ? (
            /* Database Config Mode */
            <form onSubmit={handleSaveDb} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="dimtxt" style={{ fontSize: 11 }}>
                Paste your own Supabase credentials to synchronize your progress across phone, laptop, and iPad without hosting code.
              </div>
              <div>
                <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block' }}>
                  SUPABASE PROJECT URL
                </label>
                <input
                  type="url"
                  className="retro-input"
                  placeholder="https://xyz.supabase.co"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block' }}>
                  SUPABASE ANON PUBLIC KEY
                </label>
                <input
                  type="password"
                  className="retro-input"
                  placeholder="eyJhbGciOi..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="k small">
                LINK LIVE DATABASE
              </button>
            </form>
          ) : (
            /* Sign In / Sign Up Form */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mode === 'signup' && (
                <div>
                  <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block' }}>
                    OPERATOR HANDLE / NAME
                  </label>
                  <input
                    type="text"
                    className="retro-input"
                    placeholder="e.g. devansh_algo"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block' }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  className="retro-input"
                  placeholder="operator@placement.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: 10, color: 'var(--dim)', display: 'block' }}>
                  PASSWORD
                </label>
                <input
                  type="password"
                  className="retro-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginTop: 4 }}>
                <button type="submit" className="k small" disabled={loading} style={{ width: '100%' }}>
                  {loading ? 'AUTHENTICATING...' : mode === 'signin' ? 'AUTHENTICATE & RESTORE PROGRESS' : 'CREATE ACCOUNT & INITIALIZE SYNC'}
                </button>
              </div>
            </form>
          )}

          {errorMsg && (
            <div className="redtxt" style={{ fontSize: 11, marginTop: 8 }}>
              [ERROR] {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ color: 'var(--fg)', fontSize: 11, marginTop: 8 }} className="blink">
              ▶ {successMsg} █
            </div>
          )}
        </div>
      )}

      <hr />
      <div className="dimtxt" style={{ fontSize: 10 }}>
        END-TO-END CROSS-DEVICE SYNC: SOLVES, STREAKS, AND PLACEMENT OFFERS SYNCED VIA ENCRYPTED TLS.
      </div>
    </div>
  );
};
