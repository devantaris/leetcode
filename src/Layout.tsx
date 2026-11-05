import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Modals } from './components/Modals';
import { CommandPalette } from './components/CommandPalette';
import { OnboardingPage } from './pages/OnboardingPage';
import { useProgress } from './context/ProgressContext';
import { AuthModal } from './components/modals/AuthModal';
import toast, { Toaster } from 'react-hot-toast';
import { APP_CONFIG } from './config/appConfig';
import { CURRICULUM } from './data/curriculumStats';
import {
  Sun, Moon, Settings, Download, Upload, RotateCcw, User,
  CalendarClock, Terminal, Search, Volume2, VolumeX, Compass,
  BookOpen, BarChart2, Award, Cloud, LogIn, Briefcase, Flame, CheckCircle2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';

type Theme = 'dark' | 'light';
type ModalType = 'rules' | 'strategy' | 'reset' | 'backup' | 'resume' | 'profile' | 'placements' | 'auth' | null;

interface LayoutProps {
  onSwitchToOS?: () => void;
  onGoToHome?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ onSwitchToOS, onGoToHome }) => {
  const {
    importJSON, isOnboarded, userProfile, stats, exportJSON,
    soundEnabled, toggleSound, authUser, cloudSyncStatus
  } = useProgress();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('grindos-theme');
    if (saved === 'light') return 'light';
    return 'dark';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('grindos-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // Keyboard shortcuts (Ctrl+K, Esc, ?, Ctrl+M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleSound();
      }
      if (!isInput && e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        openModal('rules');
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSound]);

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
  };

  if (!isOnboarded) return <OnboardingPage />;

  return (
    <TooltipProvider delay={200}>
      <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        {/* ── TOP NAV HEADER ── */}
        <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
            
            {/* Left: Brand & Nav Links */}
            <div className="flex items-center gap-6 lg:gap-8">
              <Link to="/dashboard" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
                <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                  {APP_CONFIG.shortName}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-base tracking-tight text-foreground hidden sm:inline-block">
                    {APP_CONFIG.name}
                  </span>
                  <span className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border/60">
                    PRO
                  </span>
                </div>
              </Link>

              {/* Segmented Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1 rounded-lg bg-muted/60 p-1 border border-border/60 text-xs font-medium">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md transition-all ${
                      isActive
                        ? 'bg-background text-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  Today
                </NavLink>
                <NavLink
                  to="/curriculum"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md transition-all ${
                      isActive
                        ? 'bg-background text-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  Syllabus
                </NavLink>
                <NavLink
                  to="/analytics"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md transition-all ${
                      isActive
                        ? 'bg-background text-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  Analytics
                </NavLink>
                <NavLink
                  to="/leaderboard"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md transition-all ${
                      isActive
                        ? 'bg-background text-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  Leaderboard
                </NavLink>
              </nav>
            </div>

            {/* Right: Quick actions, Stats, User Menu */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Command Palette Trigger */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="h-8.5 gap-2 px-3 text-xs text-muted-foreground hover:text-foreground bg-muted/30 border-border/60 hover:border-border"
                title="Search problems and commands (Ctrl+K)"
              >
                <Search className="size-3.5" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="pointer-events-none hidden lg:inline-flex h-4.5 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-mono text-[9px] font-semibold text-muted-foreground">
                  ⌘K
                </kbd>
              </Button>

              {/* Streak Badge */}
              {stats.streak > 0 && (
                <Badge
                  variant="outline"
                  className="h-8 gap-1 px-2.5 font-mono text-xs border-amber-500/30 bg-amber-500/10 text-amber-500 font-semibold"
                  title={`${stats.streak}-day streak active!`}
                >
                  <Flame className="size-3.5 fill-amber-500/20" />
                  <span>{stats.streak}d</span>
                </Badge>
              )}

              {/* Cloud / Auth Trigger */}
              {authUser ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openModal('auth')}
                  className={`h-8 gap-1.5 text-xs ${
                    cloudSyncStatus === 'synced'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                      : 'border-border/60 text-muted-foreground'
                  }`}
                  title={`${authUser.displayName} · ${cloudSyncStatus}`}
                >
                  <Cloud className="size-3.5" />
                  <span className="hidden sm:inline font-medium">{authUser.displayName.split(' ')[0]}</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openModal('auth')}
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <LogIn className="size-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              )}

              {/* Terminal OS Switcher (if available) */}
              {onSwitchToOS && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSwitchToOS}
                  className="h-8 gap-1.5 px-2.5 font-mono text-xs border-emerald-500/40 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 hidden md:inline-flex"
                  title="Switch to Retro Terminal OS"
                >
                  <Terminal className="size-3.5" />
                  <span>OS</span>
                </Button>
              )}

              {/* Audio toggle */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleSound}
                className="text-muted-foreground hover:text-foreground"
                title={soundEnabled ? 'Mute sound effects' : 'Enable tactile audio effects'}
              >
                {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4 opacity-50" />}
              </Button>

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>

              {/* Dropdown Menu for Settings & Modals */}
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground" />}>
                  <Settings className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>GrindOS Console</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => openModal('profile')}>
                      <User className="size-4 mr-2" />
                      <span>Profile ({userProfile.name})</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openModal('placements')}>
                      <Briefcase className="size-4 mr-2" />
                      <span>Placement Pipeline</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openModal('resume')}>
                      <CalendarClock className="size-4 mr-2" />
                      <span>Adjust Timeline / Day</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openModal('auth')}>
                      <Cloud className="size-4 mr-2" />
                      <span>{authUser ? 'Cloud Sync Status' : 'Sign In / Register'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openModal('strategy')}>
                      <BookOpen className="size-4 mr-2" />
                      <span>Strategy Guide</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openModal('rules')}>
                      <CheckCircle2 className="size-4 mr-2" />
                      <span>Rules & Guidelines</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={exportJSON}>
                      <Download className="size-4 mr-2" />
                      <span>Export Backup (.json)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleTriggerImport}>
                      <Upload className="size-4 mr-2" />
                      <span>Restore Backup</span>
                    </DropdownMenuItem>
                    {onGoToHome && (
                      <DropdownMenuItem onClick={onGoToHome}>
                        <Compass className="size-4 mr-2" />
                        <span>Experience Portal</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => openModal('reset')}
                  >
                    <RotateCcw className="size-4 mr-2" />
                    <span>Reset All Data</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* ── MAIN VIEWPORT CONTENT ── */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mb-16 md:mb-0">
          <Outlet />
        </main>

        {/* ── MOBILE BOTTOM NAVIGATION ── */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/40 flex items-center justify-around h-14 px-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <Compass className="size-4.5" />
            <span>Today</span>
          </NavLink>
          <NavLink
            to="/curriculum"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <BookOpen className="size-4.5" />
            <span>Syllabus</span>
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <BarChart2 className="size-4.5" />
            <span>Analytics</span>
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <Award className="size-4.5" />
            <span>Ranks</span>
          </NavLink>
        </nav>

        {/* ── FOOTER STATUS BAR ── */}
        <footer className="hidden md:flex items-center justify-between border-t border-border/40 bg-card/40 px-6 py-3 text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{APP_CONFIG.name}</span>
            <span>·</span>
            <span>Day {stats.currentDay} of {CURRICULUM.totalDays}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              <strong className="text-foreground font-semibold">{stats.solvedCount}</strong> / {stats.totalProblems} solved
            </span>
            {stats.streak > 0 && (
              <>
                <span>·</span>
                <span className="text-amber-500 font-medium">🔥 {stats.streak}d streak</span>
              </>
            )}
            {authUser && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1.5 text-foreground/80">
                  <Cloud className="size-3" />
                  {cloudSyncStatus === 'synced' ? 'Synced' : cloudSyncStatus === 'syncing' ? 'Syncing…' : 'Offline'}
                </span>
              </>
            )}
          </div>
        </footer>

        {/* Hidden file input */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

        {/* Modals orchestrator */}
        <Modals activeModal={activeModal} onClose={() => setActiveModal(null)} onTriggerImportFile={handleTriggerImport} />

        {/* Auth Modal */}
        <AuthModal isOpen={activeModal === 'auth'} onClose={() => setActiveModal(null)} />

        {/* Command Palette */}
        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onOpenModal={openModal} />

        {/* Toast notifications */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            className: '!bg-card !text-card-foreground !border !border-border !rounded-lg !text-xs !shadow-md',
          }}
        />
      </div>
    </TooltipProvider>
  );
};
