import React, { useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { getActiveSupabaseCredentials, initializeSupabaseClient } from '../../config/supabaseClient';
import { X, Mail, Lock, User, LogIn, UserPlus, Cloud, Shield, Database, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = 'login' | 'signup' | 'db';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, authUser, logout, cloudSyncStatus, lastCloudSync, triggerCloudSync, signInWithMagicLink, signInWithOAuth } = useProgress();
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Custom Supabase database credentials
  const currentCreds = getActiveSupabaseCredentials();
  const [dbUrl, setDbUrl] = useState(currentCreds.url);
  const [dbKey, setDbKey] = useState(currentCreds.key);

  if (!isOpen) return null;

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setError('Enter your email above to receive a magic link.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await signInWithMagicLink(email.trim());
    setLoading(false);
    if (res.success) {
      setSuccess('✨ Magic link sent to your inbox! Check your email to sign in.');
    } else {
      setError(res.error || 'Failed to send magic link.');
    }
  };

  const handleGoogleOAuth = async () => {
    setLoading(true);
    setError(null);
    const res = await signInWithOAuth('google');
    setLoading(false);
    if (res.error) {
      setError(res.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Login failed. Check your credentials.');
        } else {
          setSuccess('Signed in! Your cloud data has been loaded. ☁️');
          setTimeout(onClose, 1200);
        }
      } else if (tab === 'signup') {
        if (!name.trim()) {
          setError('Display name is required.');
          setLoading(false);
          return;
        }
        const res = await signup(email, password, name.trim());
        if (!res.success) {
          setError(res.error || 'Sign up failed. Try a different email.');
        } else {
          setSuccess('Account created! Your local progress has been saved to the cloud. 🚀');
          setTimeout(onClose, 1500);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUrl.trim() || !dbKey.trim()) {
      setError('Both Supabase URL and Anon Key are required.');
      return;
    }
    const client = initializeSupabaseClient(dbUrl.trim(), dbKey.trim());
    if (client) {
      setSuccess('Supabase database linked successfully! ⚡');
      toast.success('Database configured!');
      setTimeout(() => setTab('login'), 1000);
    } else {
      setError('Failed to initialize Supabase client with provided credentials.');
    }
  };

  const handleManualSync = async () => {
    setLoading(true);
    const ok = await triggerCloudSync();
    setLoading(false);
    if (ok) {
      toast.success('All progress pushed to cloud! ☁️');
    } else {
      toast.error('Sync failed. Check database connection.');
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const syncLabel = {
    synced: '✅ Synced to Cloud',
    syncing: '⏳ Syncing…',
    offline: '🔴 Local Cache / Offline',
    error: '⚠️ Sync Error',
  }[cloudSyncStatus];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 440,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cloud size={18} style={{ color: 'var(--text-accent)' }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                {authUser ? 'Your Account & Cloud' : 'Account & Cloud Sync'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                {authUser ? syncLabel : 'Save progress across all devices'}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Signed-in state */}
          {authUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                padding: '14px 16px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--color-info-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <User size={14} style={{ color: 'var(--color-info-text)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {authUser.displayName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {authUser.email}
                    </div>
                  </div>
                </div>
                {lastCloudSync && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    Last sync: {lastCloudSync.toLocaleTimeString()}
                  </div>
                )}
              </div>

              <div style={{
                padding: '10px 14px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid var(--color-success-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12, color: 'var(--color-success-text)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Shield size={14} style={{ flexShrink: 0 }} />
                <span>Your solves sync automatically across browsers and devices.</span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleManualSync}
                  disabled={loading}
                  className="btn btn-default"
                  style={{ flex: 1, padding: '9px 12px', fontSize: 12 }}
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  onClick={handleLogout}
                  className="btn btn-danger"
                  style={{ flex: 1, padding: '9px 12px', fontSize: 12 }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Sign-in / Sign-up / DB form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Tab switcher */}
              <div style={{
                display: 'flex', gap: 2,
                background: 'var(--bg-elevated)',
                padding: 3, borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}>
                <button
                  onClick={() => { setTab('login'); setError(null); setSuccess(null); }}
                  style={{
                    flex: 1, padding: '7px 8px',
                    borderRadius: 'var(--radius-xs)',
                    border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600,
                    background: tab === 'login' ? 'var(--bg-card)' : 'transparent',
                    color: tab === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  🔑 Sign In
                </button>
                <button
                  onClick={() => { setTab('signup'); setError(null); setSuccess(null); }}
                  style={{
                    flex: 1, padding: '7px 8px',
                    borderRadius: 'var(--radius-xs)',
                    border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600,
                    background: tab === 'signup' ? 'var(--bg-card)' : 'transparent',
                    color: tab === 'signup' ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  ✨ Register
                </button>
                <button
                  onClick={() => { setTab('db'); setError(null); setSuccess(null); }}
                  style={{
                    flex: 1, padding: '7px 8px',
                    borderRadius: 'var(--radius-xs)',
                    border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600,
                    background: tab === 'db' ? 'var(--bg-card)' : 'transparent',
                    color: tab === 'db' ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  ⚡ Database
                </button>
              </div>

              {tab === 'db' ? (
                /* Database configuration tab */
                <form onSubmit={handleSaveDb} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Connect your own Supabase project or customize endpoints for live cross-device sync.
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Supabase Project URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://xyzcompany.supabase.co"
                      value={dbUrl}
                      onChange={e => setDbUrl(e.target.value)}
                      className="input"
                      style={{ fontSize: 12, width: '100%', fontFamily: 'var(--font-mono)' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Supabase Anon Public API Key
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOi..."
                      value={dbKey}
                      onChange={e => setDbKey(e.target.value)}
                      className="input"
                      style={{ fontSize: 12, width: '100%', fontFamily: 'var(--font-mono)' }}
                      required
                    />
                  </div>

                  {error && (
                    <div style={{
                      padding: '8px 12px',
                      background: 'var(--color-danger-bg)',
                      border: '1px solid var(--color-danger-border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12, color: 'var(--color-danger-text)',
                    }}>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div style={{
                      padding: '8px 12px',
                      background: 'var(--color-success-bg)',
                      border: '1px solid var(--color-success-border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12, color: 'var(--color-success-text)',
                    }}>
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '9px 16px', fontSize: 13, marginTop: 4 }}
                  >
                    <Database size={13} /> Link Database
                  </button>
                </form>
              ) : (
                /* Sign in or Sign up form */
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {tab === 'signup' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <User size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <input
                        type="text"
                        placeholder="Display Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="input"
                        style={{ fontSize: 13, flex: 1 }}
                        autoComplete="name"
                      />
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input"
                      style={{ fontSize: 13, flex: 1 }}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input"
                      style={{ fontSize: 13, flex: 1 }}
                      autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                      required
                      minLength={6}
                    />
                  </div>

                  {error && (
                    <div style={{
                      padding: '8px 12px',
                      background: 'var(--color-danger-bg)',
                      border: '1px solid var(--color-danger-border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12, color: 'var(--color-danger-text)',
                    }}>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div style={{
                      padding: '8px 12px',
                      background: 'var(--color-success-bg)',
                      border: '1px solid var(--color-success-border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12, color: 'var(--color-success-text)',
                    }}>
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ padding: '10px 16px', fontSize: 13, marginTop: 4 }}
                  >
                    {loading ? (
                      '…'
                    ) : tab === 'login' ? (
                      <><LogIn size={14} /> Sign In with Password</>
                    ) : (
                      <><UserPlus size={14} /> Create Account</>
                    )}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>or</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={handleMagicLink}
                      disabled={loading}
                      className="btn btn-default"
                      style={{ flex: 1, padding: '8px 10px', fontSize: 11 }}
                      title="Send a login link to your email without passwords"
                    >
                      <Mail size={12} /> Magic Link
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogleOAuth}
                      disabled={loading}
                      className="btn btn-default"
                      style={{ flex: 1, padding: '8px 10px', fontSize: 11 }}
                      title="Sign in with Google OAuth"
                    >
                      <span>Google</span>
                    </button>
                  </div>
                </form>
              )}

              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                {tab === 'login'
                  ? 'No account yet? Click Register above.'
                  : tab === 'signup'
                  ? 'Already have an account? Click Sign In above.'
                  : 'Database credentials are saved securely in your browser session.'}
                <br />
                Guest mode works offline — your data persists in local cache until you sign in.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
