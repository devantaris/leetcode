import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Modals } from './components/Modals';
import { CommandPalette } from './components/CommandPalette';
import { OnboardingPage } from './pages/OnboardingPage';
import { useProgress } from './context/ProgressContext';
import toast, { Toaster } from 'react-hot-toast';
import { APP_CONFIG } from './config/appConfig';
import { CURRICULUM } from './data/curriculumStats';
import { Sun, Moon, Settings, Download, Upload, RotateCcw, User, CalendarClock, Terminal } from 'lucide-react';

type Theme = 'dark' | 'light';
type ModalType = 'rules' | 'strategy' | 'reset' | 'backup' | 'resume' | 'profile' | 'placements' | null;

interface LayoutProps {
  onSwitchToOS?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ onSwitchToOS }) => {
  const { importJSON, isOnboarded, userProfile, stats, exportJSON } = useProgress();
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
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 'var(--radius-xs)',
            background: 'var(--text-primary)', color: 'var(--text-inverse)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)'
          }}>
            {APP_CONFIG.shortName}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {APP_CONFIG.name}
          </span>
        </Link>

        {/* Segmented switcher (Today · Syllabus · Leaderboard) */}
        <nav className="nav-segment">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Today
          </NavLink>
          <NavLink to="/curriculum" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Syllabus
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Leaderboard
          </NavLink>
        </nav>

        {/* Right utility icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Switch to Retro OS */}
          {onSwitchToOS && (
            <button
              onClick={onSwitchToOS}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}
              title="Launch Retro Terminal Shell"
            >
              <Terminal size={12} /> OS Shell
            </button>
          )}

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
                width: 190, background: 'var(--bg-card)', border: '1px solid var(--border-default)',
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
        padding: '12px 20px', borderTop: '1px solid var(--border-subtle)',
        fontSize: 11, color: 'var(--text-muted)', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)'
      }}>
        <span>{APP_CONFIG.name} · Day {stats.currentDay} / {CURRICULUM.totalDays}</span>
        <span>{stats.solvedCount} / {stats.totalProblems} solved {stats.streak > 0 && `· 🔥 ${stats.streak}d`}</span>
      </footer>

      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />

      {/* Modals */}
      <Modals activeModal={activeModal} onClose={() => setActiveModal(null)} onTriggerImportFile={handleTriggerImport} />

      {/* Command Palette */}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />

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
