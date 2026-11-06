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
  Sun, Moon, Settings, RotateCcw, User,
  CalendarClock, Terminal, Search, Volume2, VolumeX,
  BookOpen, BarChart2, Award, Cloud, Briefcase, Flame,
  LayoutDashboard, Menu, ArrowUpRight, Zap, Share2, Sparkles, Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type Theme = 'dark' | 'light';
type ModalType = 'rules' | 'strategy' | 'reset' | 'backup' | 'resume' | 'profile' | 'placements' | 'share' | 'pricing' | 'auth' | null;

interface LayoutProps {
  onSwitchToOS?: () => void;
  onGoToHome?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ onSwitchToOS, onGoToHome }) => {
  const {
    importJSON, isOnboarded, userProfile, stats,
    soundEnabled, toggleSound, authUser, cloudSyncStatus
  } = useProgress();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('grindos-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // Donezo / ACRU default clean light aesthetic
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

  const displayName = authUser?.displayName || userProfile.name || 'Devansh Kumar';
  const displayEmail = authUser?.email || (userProfile.name ? `${userProfile.name.toLowerCase().replace(/\s+/g, '')}@placement.io` : 'operator@grindos.dev');
  const userInitials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'OP';

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col justify-between h-full gap-6">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 px-2 py-1 transition-opacity hover:opacity-90"
        >
          <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-mono font-bold text-sm shadow-xs shrink-0">
            {APP_CONFIG.shortName}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-bold text-lg tracking-tight text-foreground">
                {APP_CONFIG.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openModal('pricing');
                }}
                className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary/10 text-primary font-semibold border border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors"
                title="View Pro Plans"
              >
                PRO
              </button>
            </div>
            <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
              {userProfile.targetCompany ? `Target: ${userProfile.targetCompany}` : '140-Day System'}
            </span>
          </div>
        </Link>

        {/* Section: MENU */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-3 mb-1">
            Menu
          </span>

          <NavLink
            to="/dashboard"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold relative before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:bg-primary before:rounded-r'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="size-4.5 shrink-0" />
              <span>Dashboard</span>
            </div>
          </NavLink>

          <NavLink
            to="/curriculum"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold relative before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:bg-primary before:rounded-r'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <BookOpen className="size-4.5 shrink-0" />
              <span>Syllabus</span>
            </div>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
              {CURRICULUM.totalDays}d
            </span>
          </NavLink>

          <NavLink
            to="/analytics"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold relative before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:bg-primary before:rounded-r'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <BarChart2 className="size-4.5 shrink-0" />
              <span>Analytics</span>
            </div>
          </NavLink>

          <NavLink
            to="/leaderboard"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold relative before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:bg-primary before:rounded-r'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Award className="size-4.5 shrink-0" />
              <span>Leaderboard</span>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={() => { openModal('placements'); onNavigate?.(); }}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150 text-left"
          >
            <div className="flex items-center gap-3">
              <Briefcase className="size-4.5 shrink-0" />
              <span>Applications</span>
            </div>
          </button>
        </div>

        {/* Section: GENERAL */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-3 mb-1">
            General
          </span>

          <button
            type="button"
            onClick={() => { openModal('profile'); onNavigate?.(); }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150 text-left"
          >
            <Settings className="size-4.5 shrink-0" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => { openModal('pricing'); onNavigate?.(); }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150 text-left"
          >
            <Sparkles className="size-4.5 shrink-0 text-primary" />
            <span>Plans &amp; Upgrades</span>
          </button>

          <button
            type="button"
            onClick={() => { openModal('auth'); onNavigate?.(); }}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150 text-left"
          >
            <div className="flex items-center gap-3">
              {cloudSyncStatus === 'syncing' ? (
                <Loader2 className="size-4.5 shrink-0 text-primary animate-spin" />
              ) : (
                <Cloud className="size-4.5 shrink-0" />
              )}
              <span>Cloud Sync</span>
            </div>
            <span
              className={`size-2 rounded-full ${
                cloudSyncStatus === 'synced'
                  ? 'bg-primary shadow-[0_0_8px_rgba(61,220,132,0.6)]'
                  : cloudSyncStatus === 'syncing'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-muted-foreground/40'
              }`}
              title={`Status: ${cloudSyncStatus}`}
            />
          </button>

          {onSwitchToOS && (
            <button
              type="button"
              onClick={() => { onSwitchToOS(); onNavigate?.(); }}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150 text-left"
            >
              <Terminal className="size-4.5 shrink-0" />
              <span>Terminal OS</span>
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Bottom Banner Widget (Donezo Style) */}
      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Zap className="size-4" />
            </div>
            <span className="font-semibold text-xs text-foreground">Target Velocity</span>
          </div>
          <span className="font-mono text-xs font-bold text-primary">{stats.streak}d streak</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Maintain 3 problems daily to secure placement offers by Day 140.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { openModal('strategy'); onNavigate?.(); }}
          className="w-full text-xs h-8 gap-1 border-primary/30 text-primary hover:bg-primary/10"
        >
          <span>View Strategy</span>
          <ArrowUpRight className="size-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <TooltipProvider delay={200}>
      <div className="min-h-screen flex bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card p-5 sticky top-0 h-screen overflow-y-auto">
          <NavContent />
        </aside>

        {/* ── MAIN WORKSPACE ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
            {/* Left: Mobile trigger & Search Bar */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              {/* Mobile Drawer */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger render={
                  <Button variant="ghost" size="icon-sm" className="lg:hidden text-muted-foreground hover:text-foreground">
                    <Menu className="size-5" />
                  </Button>
                } />
                <SheetContent side="left" className="w-72 p-5 bg-card">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </SheetHeader>
                  <NavContent onNavigate={() => setMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>

              {/* Search Bar (Donezo / ACRU Search style) */}
              <div
                onClick={() => setIsCommandPaletteOpen(true)}
                className="flex items-center gap-2.5 px-3 py-1.5 w-full rounded-xl border border-border/80 bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer text-xs"
              >
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">Search problems, patterns, topics...</span>
                <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[9px] font-semibold text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right: Quick actions, Controls & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Streak Badge */}
              {stats.streak > 0 && (
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex h-8 gap-1.5 px-2.5 font-mono text-xs border-primary/30 bg-primary/10 text-primary font-semibold"
                >
                  <Flame className="size-3.5 fill-primary/20" />
                  <span>{stats.streak}d streak</span>
                </Badge>
              )}

              {/* Cloud Sync Status */}
              <button
                type="button"
                onClick={() => openModal('auth')}
                className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-border/70 hover:border-foreground/30 bg-background text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                title={`Cloud Sync Status: ${cloudSyncStatus} (${authUser ? authUser.email : 'Local Only'})`}
              >
                {cloudSyncStatus === 'syncing' ? (
                  <Loader2 className="size-3.5 text-primary animate-spin" />
                ) : (
                  <Cloud className={`size-3.5 ${cloudSyncStatus === 'synced' ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
                <span className="font-mono text-[10px] capitalize">{cloudSyncStatus}</span>
              </button>

              {/* Share Badge Button */}
              <Button
                variant="outline"
                size="xs"
                onClick={() => openModal('share')}
                className="hidden sm:inline-flex h-8 gap-1.5 px-2.5 text-xs text-foreground border-border/80 hover:bg-muted"
                title="Share your candidate velocity badge"
              >
                <Share2 className="size-3.5 text-primary" />
                <span>Share Badge</span>
              </Button>

              {/* Tactile Audio toggle */}
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

              {/* User Profile Pill (Donezo Style: Avatar + Name + Email) */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl border border-border/70 hover:border-foreground/20 bg-background transition-all cursor-pointer text-left focus:outline-hidden"
                >
                  {authUser?.avatarUrl ? (
                    <img
                      src={authUser.avatarUrl}
                      alt={displayName}
                      className="size-8 rounded-full object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                      {userInitials}
                    </div>
                  )}
                  <div className="hidden md:flex flex-col min-w-0 pr-1">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                      {displayEmail}
                    </span>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-card border border-border/80 p-1.5 text-card-foreground shadow-lg shadow-black/10 z-50 flex flex-col gap-0.5">
                    <div className="px-2.5 py-2 flex flex-col gap-0.5 border-b border-border/50 mb-1">
                      <span className="font-semibold text-xs text-foreground truncate">{displayName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono truncate">{displayEmail}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => { openModal('auth'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 transition-colors text-left"
                    >
                      <Cloud className="size-4 text-primary" />
                      <span>Account &amp; Cloud Sync</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { openModal('profile'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 transition-colors text-left"
                    >
                      <User className="size-4 text-muted-foreground" />
                      <span>Profile &amp; Goals</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { openModal('pricing'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 transition-colors text-left"
                    >
                      <Sparkles className="size-4 text-primary" />
                      <span>Plans &amp; Upgrades</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { openModal('share'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 transition-colors text-left"
                    >
                      <Share2 className="size-4 text-primary" />
                      <span>Share Candidate Badge</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { openModal('placements'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 transition-colors text-left"
                    >
                      <Briefcase className="size-4 text-muted-foreground" />
                      <span>Placement Pipeline</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { openModal('resume'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 transition-colors text-left"
                    >
                      <CalendarClock className="size-4 text-muted-foreground" />
                      <span>Adjust Timeline / Day</span>
                    </button>

                    <div className="h-px bg-border/50 my-1" />

                    <button
                      type="button"
                      onClick={() => { openModal('strategy'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 transition-colors text-left"
                    >
                      <Zap className="size-4 text-muted-foreground" />
                      <span>Phase Strategy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { openModal('backup'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 transition-colors text-left"
                    >
                      <Cloud className="size-4 text-muted-foreground" />
                      <span>Export / Backup Data</span>
                    </button>

                    {onGoToHome && (
                      <button
                        type="button"
                        onClick={() => { onGoToHome(); setUserMenuOpen(false); }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 transition-colors text-left"
                      >
                        <LayoutDashboard className="size-4 text-muted-foreground" />
                        <span>Experience Portal</span>
                      </button>
                    )}

                    <div className="h-px bg-border/50 my-1" />

                    <button
                      type="button"
                      onClick={() => { openModal('reset'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      <RotateCcw className="size-4" />
                      <span>Reset All Data</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── MAIN CONTENT CONTAINER (CENTERED, CLEAN BENTO CANVAS) ── */}
          <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mb-16 lg:mb-0">
            <Outlet />
          </main>
        </div>

        {/* ── MOBILE BOTTOM NAVIGATION ── */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around h-14 px-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground'
              }`
            }
          >
            <LayoutDashboard className="size-4.5" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/curriculum"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground'
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
                isActive ? 'text-primary font-bold' : 'text-muted-foreground'
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
                isActive ? 'text-primary font-bold' : 'text-muted-foreground'
              }`
            }
          >
            <Award className="size-4.5" />
            <span>Ranks</span>
          </NavLink>
        </nav>

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
            className: '!bg-card !text-card-foreground !border !border-border !rounded-xl !text-xs !shadow-md',
          }}
        />
      </div>
    </TooltipProvider>
  );
};
