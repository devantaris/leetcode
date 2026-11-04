import React, { useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { X, Mail, Lock, User, LogIn, UserPlus, Cloud, Shield, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = 'login' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, authUser, logout, cloudSyncStatus, lastCloudSync, triggerCloudSync, signInWithMagicLink } = useProgress();
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await login(email.trim(), password);
        if (!res.success) {
          setError(res.error || 'Login failed. Check your email & password.');
        } else {
          setSuccess('Signed in! Your progress is now synced to the cloud. ☁️');
          toast.success('Welcome back!');
          setTimeout(onClose, 1200);
        }
      } else {
        if (!name.trim()) {
          setError('Display name is required.');
          setLoading(false);
          return;
        }
        const res = await signup(email.trim(), password, name.trim());
        if (!res.success) {
          setError(res.error || 'Sign up failed. Please try again.');
        } else {
          setSuccess('Account created! Your local solves have been synced to the cloud. 🚀');
          toast.success('Account created successfully!');
          setTimeout(onClose, 1500);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setError('Enter your email address above to receive a login link.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await signInWithMagicLink(email.trim());
    setLoading(false);
    if (res.success) {
      setSuccess('✨ Magic link sent! Check your email inbox to sign in instantly.');
      toast.success('Check your email inbox!');
    } else {
      setError(res.error || 'Failed to send magic link.');
    }
  };

  const handleManualSync = async () => {
    setLoading(true);
    const ok = await triggerCloudSync();
    setLoading(false);
    if (ok) {
      toast.success('Progress pushed to cloud! ☁️');
    } else {
      toast.error('Sync failed. Check your network connection.');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out.');
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
        width: '100%', maxWidth: 400,
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
                {authUser ? 'Your Account' : 'Account & Sync'}
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
            /* Sign-in / Sign-up form (Clean consumer UI) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Tab switcher: Sign In vs Register only */}
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
                  ✨ Create Account
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tab === 'signup' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="Display Name (or Callsign)"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="input"
                      style={{ fontSize: 13, flex: 1 }}
                      autoComplete="name"
                      required
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
                    placeholder="Password (minimum 6 characters)"
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
                    <><LogIn size={14} /> Sign In</>
                  ) : (
                    <><UserPlus size={14} /> Create Free Account</>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>or passwordless</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                </div>

                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={loading}
                  className="btn btn-default"
                  style={{ width: '100%', padding: '8px 12px', fontSize: 12 }}
                  title="Send a login link to your email without needing a password"
                >
                  <Mail size={12} /> Send Magic Sign-In Link
                </button>
              </form>

              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                {tab === 'login'
                  ? 'New grinder? Switch to Create Account above.'
                  : 'Already have an account? Switch to Sign In above.'}
                <br />
                Guest mode works offline — your data stays safe in local cache until you sign in.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
