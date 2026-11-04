import React, { useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { X, Mail, Lock, User, LogIn, UserPlus, Cloud, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = 'login' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, authUser, logout, cloudSyncStatus, lastCloudSync } = useProgress();
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
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Login failed. Check your credentials.');
        } else {
          setSuccess('Signed in! Your cloud data has been loaded. ☁️');
          setTimeout(onClose, 1500);
        }
      } else {
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
          setTimeout(onClose, 1800);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const syncLabel = {
    synced: '✅ Synced',
    syncing: '⏳ Syncing…',
    offline: '🔴 Offline',
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
        width: '100%', maxWidth: 420,
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
                {authUser ? 'Your Account' : 'Sign In to Sync'}
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
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {authUser.displayName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{authUser.email}</div>
                  </div>
                </div>
                {lastCloudSync && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
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
                <Shield size={12} />
                Your progress syncs automatically every time you solve a problem.
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ width: '100%', padding: '10px 16px', fontSize: 13 }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            /* Sign-in / Sign-up form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Tab switcher */}
              <div style={{
                display: 'flex', gap: 2,
                background: 'var(--bg-elevated)',
                padding: 3, borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}>
                {(['login', 'signup'] as AuthTab[]).map(t => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(null); setSuccess(null); }}
                    style={{
                      flex: 1, padding: '7px 12px',
                      borderRadius: 'var(--radius-xs)',
                      border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600,
                      background: tab === t ? 'var(--bg-card)' : 'transparent',
                      color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {t === 'login' ? '🔑 Sign In' : '✨ Create Account'}
                  </button>
                ))}
              </div>

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
                    <><LogIn size={14} /> Sign In</>
                  ) : (
                    <><UserPlus size={14} /> Create Account</>
                  )}
                </button>
              </form>

              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                {tab === 'login'
                  ? 'No account? Switch to Create Account above.'
                  : 'Already have an account? Switch to Sign In above.'}
                <br />
                Guest mode works without signing in — your data stays in this browser only.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
