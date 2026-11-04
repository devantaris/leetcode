import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Modals } from './components/Modals';
import { CommandPalette } from './components/CommandPalette';
import { OnboardingPage } from './pages/OnboardingPage';
import { useProgress } from './context/ProgressContext';
import toast, { Toaster } from 'react-hot-toast';
import { APP_CONFIG } from './config/appConfig';
import { CURRICULUM } from './data/curriculumStats';
import { Sun, Moon, Settings, Download, Upload, RotateCcw, User, CalendarClock, Terminal, Search, Volume2, VolumeX } from 'lucide-react';

type Theme = 'dark' | 'light';
type ModalType = 'rules' | 'strategy' | 'reset' | 'backup' | 'resume' | 'profile' | 'placements' | null;

interface LayoutProps {
  onSwitchToOS?: () => void;
  onGoToHome?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ onSwitchToOS, onGoToHome }) => {
  const { importJSON, isOnboarded, userProfile, stats, exportJSON, soundEnabled, toggleSound } = useProgress();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('cadence-theme');
    return (saved as Theme) || 'dark';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cadence-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setShowSettings(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside settings
  useEffect(() => {
    if (!showSettings) return;
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSettings]);

  const handleTriggerImport = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) importJSON(content);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      toast.error('Failed to read file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const openModal = (modal: ModalType) => {
    setActiveModal(modal);
    setShowSettings(false);
  };

  if (!isOnboarded) return <OnboardingPage />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── TOP NAV HEADER ── */}
      <header className="site-header">
        {/* Brand */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-mono)',
            boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)'
          }}>
            {APP_CONFIG.shortName}
          </div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.2 }}>
              {APP_CONFIG.name}
            </span>
          </div>
        </Link>

        {/* Segmented switcher (Today · Syllabus · Analytics · Leaderboard) */}
        <nav className="nav-segment">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Today
          </NavLink>
          <NavLink to="/curriculum" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Syllabus
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Analytics
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Leaderboard
          </NavLink>
        </nav>

        {/* Right utility icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Quick Search / Command Palette trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              padding: '4px 8px', borderRadius: 'var(--radius-md)',
              fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            title="Search problems and commands (Ctrl+K)"
          >
            <Search size={13} style={{ color: 'var(--text-muted)' }} />
            <span className="hidden sm:inline" style={{ fontSize: 11 }}>Search</span>
            <kbd style={{
              fontSize: 9, fontFamily: 'var(--font-mono)',
              padding: '1px 4px', borderRadius: 3,
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)'
            }}>
              ⌘K
            </kbd>
          </button>

          {/* Active streak pill */}
          {stats.streak > 0 && (
            <div
              style={{
                fontSize: 11, fontFamily: 'var(--font-mono)',
                color: 'var(--color-warning-text)', fontWeight: 700,
                background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)',
                padding: '3px 9px', borderRadius: 'var(--radius-full)',
                display: 'flex', alignItems: 'center', gap: 4,
                boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)'
              }}
              title={`${stats.streak}-day streak active!`}
            >
              🔥 {stats.streak}d
            </div>
          )}

          {/* Switch to Retro OS */}
          {onSwitchToOS && (
            <button
              onClick={onSwitchToOS}
              style={{
                background: 'rgba(61, 220, 132, 0.08)',
                border: '1px solid rgba(61, 220, 132, 0.35)',
                color: '#3ddc84',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(61, 220, 132, 0.15)',
                transition: 'all var(--transition-fast)'
              }}
              title="Switch to Retro Terminal OS"
            >
              <Terminal size={12} /> OS Shell
            </button>
          )}

          {/* Mode Selector / Landing Page */}
          <Link
            to="/"
            onClick={onGoToHome}
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 500
            }}
            title="Switch Experience / Return to Landing"
          >
            Portal
          </Link>

          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', padding: 6, display: 'flex',
              borderRadius: 'var(--radius-sm)'
            }}
            title={soundEnabled ? 'Mute sound effects' : 'Enable tactile audio effects'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} style={{ opacity: 0.5 }} />}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', padding: 6, display: 'flex',
              borderRadius: 'var(--radius-sm)'
            }}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Settings dropdown */}
          <div ref={settingsRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSettings(s => !s)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', padding: 6, display: 'flex',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Settings & Data"
            >
              <Settings size={14} />
            </button>

            {showSettings && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 6,
                width: 200, background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)', padding: 4, boxShadow: 'var(--shadow-lg)',
                zIndex: 60, display: 'flex', flexDirection: 'column', gap: 2
              }}>
                <button
                  onClick={() => openModal('profile')}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: 12, padding: '6px 8px' }}
                >
                  <User size={13} /> Edit Profile ({userProfile.name})
                </button>
                <button
                  onClick={() => openModal('resume')}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: 12, padding: '6px 8px' }}
                >
                  <CalendarClock size={13} /> Adjust Dates
                </button>
                <button
                  onClick={() => openModal('placements')}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: 12, padding: '6px 8px' }}
                >
                  <span>💼 Placement Pipeline</span>
                </button>
                {onSwitchToOS && (
                  <button
                    onClick={() => { setShowSettings(false); onSwitchToOS(); }}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: 12, padding: '6px 8px' }}
                  >
                    <Terminal size={13} /> Switch to Terminal OS
                  </button>
                )}
                <div className="divider" style={{ margin: '3px 0' }} />
                <button
                  onClick={() => { exportJSON(); setShowSettings(false); }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: 12, padding: '6px 8px' }}
                >
                  <Download size={13} /> Export Backup (.json)
                </button>
                <button
                  onClick={() => { handleTriggerImport(); setShowSettings(false); }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: 12, padding: '6px 8px' }}
                >
                  <Upload size={13} /> Restore File
                </button>
                <div className="divider" style={{ margin: '3px 0' }} />
                <button
                  onClick={() => openModal('reset')}
                  className="btn btn-ghost"
                  style={{
                    width: '100%', justifyContent: 'flex-start', fontSize: 12, padding: '6px 8px',
                    color: 'var(--color-danger-text)'
                  }}
                >
                  <RotateCcw size={13} /> Reset All Data
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT OUTLET ── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── FOOTER STATUS BAR ── */}
      <footer style={{
        padding: '14px 24px', borderTop: '1px solid var(--border-subtle)',
        fontSize: 12, color: 'var(--text-secondary)', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)',
        background: 'rgba(8, 9, 15, 0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--text-accent)', fontWeight: 700 }}>{APP_CONFIG.name} Pro</span>
          <span>·</span>
          <span>Day {stats.currentDay} / {CURRICULUM.totalDays}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span><strong style={{ color: 'var(--color-success-text)' }}>{stats.solvedCount}</strong> / {stats.totalProblems} solved</span>
          {stats.streak > 0 && <span style={{ color: 'var(--color-warning-text)', fontWeight: 700 }}>· 🔥 {stats.streak}d streak</span>}
        </div>
      </footer>

      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />

      {/* Modals */}
      <Modals activeModal={activeModal} onClose={() => setActiveModal(null)} onTriggerImportFile={handleTriggerImport} />

      {/* Command Palette */}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onOpenModal={openModal} />

      {/* Toast notifications */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            fontSize: '12px',
            boxShadow: 'var(--shadow-lg)'
          }
        }}
      />
    </div>
  );
};
