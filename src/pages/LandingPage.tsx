import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Timer, ArrowRight, ChevronDown, ChevronUp,
  Check, Target, Building2, Briefcase, Users, Shield,
  Terminal, Sparkles, RefreshCw, LogIn, CreditCard, UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { APP_CONFIG } from '../config/appConfig';
import { useProgress } from '../context/ProgressContext';
import { CURRICULUM } from '../data/curriculumStats';
import { sounds } from '../utils/audio';
import { AuthModal } from '../components/modals/AuthModal';
import { PricingModal } from '../components/modals/PricingModal';
import { DemoChoiceModal } from '../components/modals/DemoChoiceModal';
import MeadowRiseFooter from '@/components/ui/meadow-rise-footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PHASES = [
  {
    id: 1,
    weeks: 'Weeks 1-5',
    title: 'Linear Foundations & Core Pointers',
    subtitle: 'Arrays, Two Pointers, Sliding Window, Prefix Sums & Hash Maps',
    problems: 65,
    description: 'Master core patterns tested in 70% of technical phone screens. Eliminates brute-force O(N^2) habits.',
    keyPatterns: ['Opposite & Fast/Slow Pointers', 'Dynamic & Fixed Sliding Window', 'Prefix Sums & Frequency Counting', 'Monotonic Stack / Queue'],
    sampleProblems: ['3Sum (LC 15)', 'Longest Substring Without Repeating (LC 3)', 'Daily Temperatures (LC 739)', 'Trapping Rain Water (LC 42)']
  },
  {
    id: 2,
    weeks: 'Weeks 6-10',
    title: 'Hierarchical & Graph Algorithms',
    subtitle: 'Binary Trees, BSTs, BFS/DFS, Topological Sort & Shortest Path',
    problems: 75,
    description: 'Deconstruct complex tree traversals and graph algorithms into reusable recursive and iterative mental models.',
    keyPatterns: ['Tree DFS & Path Sum', 'Tree Level-Order BFS', 'Connected Components (Flood Fill)', 'Topological Sort (Kahn\'s Algorithm)', 'Dijkstra & Shortest Path'],
    sampleProblems: ['Lowest Common Ancestor (LC 236)', 'Course Schedule (LC 207)', 'Number of Islands (LC 200)', 'Word Ladder (LC 127)']
  },
  {
    id: 3,
    weeks: 'Weeks 11-15',
    title: 'Dynamic Programming & Memoization',
    subtitle: '1D/2D DP, Subsequences, Knapsack & State Transitions',
    problems: 65,
    description: 'Demystify DP by learning state definitions and recurrence transitions rather than memorizing solutions.',
    keyPatterns: ['0/1 Knapsack & Unbounded Knapsack', 'Longest Common Subsequence (LCS)', 'State Machine DP (Stock Series)', 'Interval DP & Matrix Chain'],
    sampleProblems: ['Coin Change (LC 322)', 'Longest Increasing Subsequence (LC 300)', 'Edit Distance (LC 72)', 'Target Sum (LC 494)']
  },
  {
    id: 4,
    weeks: 'Weeks 16-18',
    title: 'Architecture & System Design Foundations',
    subtitle: 'Distributed Caching, Rate Limiting, Partitioning & Resiliency',
    problems: 28,
    description: 'Bridge algorithmic thinking with high-throughput distributed system design evaluated in senior and FAANG loops.',
    keyPatterns: ['Token Bucket & Leaky Bucket Rate Limiters', 'Consistent Hashing & Ring Partitions', 'Cache-Aside & Write-Through Strategies', 'Distributed Unique IDs (Snowflake)'],
    sampleProblems: ['Design URL Shortener (TinyURL)', 'Design Distributed Rate Limiter', 'Design Key-Value Store with LSM', 'Design Notification Pipeline']
  },
  {
    id: 5,
    weeks: 'Weeks 19-25',
    title: 'Offer Sprint & Timed Mock Pressure',
    subtitle: 'High-Frequency Speedruns, Top 150 Benchmarks & Mock Interviews',
    problems: 74,
    description: 'Simulate live interview pressure under strict 45-minute constraints. Focuses exclusively on top company-tagged variants.',
    keyPatterns: ['45-Minute Timed Mock Runs', 'Cross-Topic Pattern Blending', 'Complexity Verbalization', 'Edge-Case Explaining Under Pressure'],
    sampleProblems: ['LRU Cache (LC 146)', 'Median of Two Sorted Arrays (LC 4)', 'Merge k Sorted Lists (LC 23)', 'Alien Dictionary (LC 269)']
  }
];

interface LandingPageProps {
  onSelectMode?: (mode: 'os' | 'web') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile, stats, authUser, isDemoMode, loadDemoData } = useProgress();

  const [demoSolved, setDemoSolved] = useState<Record<string, boolean>>({
    'p1': true,
    'p2': false,
    'p3': false
  });

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [openPhase, setOpenPhase] = useState<number | null>(1);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Automatically prompt auth modal if user arrived from an auth-guarded route
  useEffect(() => {
    if (searchParams.get('auth') === 'required' && !authUser && !isDemoMode) {
      setIsAuthModalOpen(true);
      toast('Please sign in or create an account to access GrindOS.', {
        icon: '🔒',
        id: 'auth-required-toast',
      });
    }
  }, [searchParams, authUser, isDemoMode]);

  const handleLaunch = (mode: 'os' | 'web') => {
    sounds.playTickSound();
    if (!authUser && !isDemoMode) {
      setIsAuthModalOpen(true);
      toast('Please sign in or create an account to access GrindOS.', {
        icon: '🔒',
        id: 'auth-launch-toast',
      });
      return;
    }
    if (onSelectMode) {
      onSelectMode(mode);
    } else {
      try {
        localStorage.setItem('grindos_ui_mode', mode);
      } catch {
        // ignore
      }
      if (mode === 'os') {
        navigate('/os');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleTryDemo = (mode: 'os' | 'web' = 'web') => {
    sounds.playTickSound();
    loadDemoData();
    toast.success('Loaded interactive demo dataset! 🚀');
    if (mode === 'os') {
      navigate('/os');
    } else {
      navigate('/dashboard');
    }
  };

  const toggleDemoProblem = (id: string) => {
    setDemoSolved(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (!prev[id]) {
        sounds.playTickSound();
        const allDone = Object.values(next).every(Boolean);
        if (allDone) {
          sounds.playVictorySound();
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
      }
      return next;
    });
  };

  const solvedDemoCount = Object.values(demoSolved).filter(Boolean).length;
  const progressPct = Math.round((stats.solvedCount / Math.max(1, stats.totalProblems)) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-foreground text-background flex items-center justify-center font-extrabold text-xs font-mono">
            {APP_CONFIG.shortName}
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight block text-foreground">
              {APP_CONFIG.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono block">
              Dual-Engine Workstation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a href="#curriculum" className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline transition-colors">
            Curriculum
          </a>
          <a href="#compare" className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline transition-colors">
            Compare
          </a>
          <a href="#features" className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline transition-colors">
            Features
          </a>
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline transition-colors cursor-pointer"
          >
            Pricing
          </button>
          <a href="#faq" className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline transition-colors">
            FAQ
          </a>

          {/* Authentication Action */}
          {authUser ? (
            <button
              onClick={() => handleLaunch('web')}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
            >
              <UserCheck size={12} className="text-emerald-400" />
              <span>Enter App ({userProfile.name})</span>
              <ArrowRight size={12} />
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogIn size={12} /> <span>Sign In</span>
            </button>
          )}

          {/* Direct interface launching triggers */}
          <button
            onClick={() => handleLaunch('os')}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Launch in Retro Terminal OS format"
          >
            <Terminal size={12} /> <span>OS Mode</span>
          </button>

          <button
            onClick={() => handleLaunch('web')}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
            title="Launch in Modern Web format"
          >
            <Sparkles size={12} /> <span>Modern App</span>
          </button>
        </div>
      </header>

      {/* ── HERO SECTION: DUAL FORK ── */}
      <section className="relative max-w-5xl mx-auto px-5 pt-16 pb-10 text-center">
        {/* Ambient atmospheric backdrop glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[420px] pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[550px] h-[280px] bg-emerald-500/10 blur-[110px] rounded-full" />
        </div>

        {/* 21st.dev luxury status pill */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-card/80 border border-emerald-500/20 text-xs text-muted-foreground mb-6 shadow-sm backdrop-blur-xs">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-medium">100% Shared Cloud State</span>
          <span className="text-border">/</span>
          <span>Two Interfaces</span>
          <span className="text-border">/</span>
          <span className="text-foreground/80">Zero Silos</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] max-w-4xl mx-auto mb-5 text-foreground">
          One Structured Syllabus.<br />
          <span style={{ fontFamily: '"Instrument Serif", "Cormorant Garamond", Georgia, serif' }} className="italic font-normal text-emerald-400">
            Two Distinct Realities.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-6">
          Master {CURRICULUM.totalProblems} curated algorithmic problems across {CURRICULUM.totalWeeks} disciplined weeks.
          Choose between the deep retro immersion of a 90s terminal OS, or the crisp efficiency of a modern engineering dashboard.
        </p>

        {/* Primary Conversion Funnel CTA */}
        <div className="flex items-center justify-center gap-3 mb-3.5 flex-wrap">
          {authUser ? (
            <button
              onClick={() => handleLaunch('web')}
              className="text-sm font-bold px-6 py-2.5 rounded-xl bg-primary text-primary-foreground flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-sm font-semibold px-6 py-2.5 rounded-xl bg-primary text-primary-foreground flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Start 140-Day Prep Free</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="text-xs font-semibold px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs"
                title="Preview GrindOS with sample solved problems and telemetry"
              >
                <Sparkles size={14} className="text-emerald-400" />
                <span>Explore Interactive Demo</span>
              </button>
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="text-xs font-semibold px-4 py-2.5 rounded-xl border border-border bg-card/80 hover:bg-muted text-foreground flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <CreditCard size={14} />
                <span>Lifetime Pro ($29)</span>
              </button>
            </>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground mb-8 font-mono">
          ✓ Free Community Tier • ✓ Real-Time Cloud Sync • ✓ No Credit Card Required
        </div>

        {/* User state resume banner if authenticated and has active solve data */}
        {authUser && stats.solvedCount > 0 && (
          <div className="max-w-2xl mx-auto mb-9 bg-card border border-border rounded-2xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3.5 text-left shadow-xs">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-muted border border-border flex items-center justify-center text-base">
                🔥
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">
                  Welcome back, {userProfile.name}!
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  Day {stats.currentDay} / {CURRICULUM.totalDays} • {stats.solvedCount} of {stats.totalProblems} solved ({progressPct}%) {stats.streak > 0 && `• ${stats.streak}d streak`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLaunch('os')}
                className="text-xs h-8 font-mono gap-1.5"
              >
                <Terminal className="size-3.5" />
                <span>Resume in OS</span>
              </Button>
              <Button
                size="sm"
                onClick={() => handleLaunch('web')}
                className="text-xs h-8 gap-1.5 font-semibold"
              >
                <span>Resume in Modern</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ── THE EXPERIENCE FORK: DUAL INTERFACE CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mt-4">
          {/* OPTION 1: RETRO TERMINAL OS */}
          <div style={{
            background: '#040805',
            border: '2px solid #1a6b42',
            borderRadius: '1.5rem',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 0 25px rgba(61, 220, 132, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Retro Badge */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16
              }}>
                <span style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
                  padding: '2px 8px', borderRadius: 4,
                  background: 'rgba(61, 220, 132, 0.15)', color: '#3ddc84',
                  border: '1px solid rgba(61, 220, 132, 0.3)'
                }}>
                  RETRO WORKSTATION
                </span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#888' }}>
                  VT220 • CHIP SYNTH
                </span>
              </div>

              <h2 style={{
                fontSize: 22, fontWeight: 800, color: '#3ddc84',
                fontFamily: 'var(--font-mono)', margin: '0 0 8px', letterSpacing: '-0.02em'
              }}>
                GrindOS 95 Shell
              </h2>

              <p style={{ fontSize: 13, color: '#9bb8a5', lineHeight: 1.5, margin: '0 0 20px' }}>
                For engineers who thrive in deep-work terminal immersion, multi-window multitasking, retro sound feedback, and keyboard-driven efficiency.
              </p>

              {/* Terminal Box Graphic */}
              <div style={{
                background: '#020403', border: '1px solid #134a2e',
                borderRadius: 6, padding: '12px 14px', marginBottom: 20,
                fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3ddc84',
                lineHeight: 1.6
              }}>
                <div style={{ color: '#888', borderBottom: '1px solid #0e3a24', paddingBottom: 6, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>MISSIONS.EXE — VT220</span>
                  <span>[ _ ▢ ✕ ]</span>
                </div>
                <div>C:\&gt; grindos --boot</div>
                <div style={{ color: '#e8c35a' }}>[OK] 20 WEEKS / 140 DAYS / 332 PROBLEMS INITIALIZED</div>
                <div>[OK] WINDOW MANAGER &amp; CHIP SYNTH ONLINE</div>
                <div style={{ color: '#888' }}>&gt; MISSIONS.EXE • ORACLE.EXE • POMO.EXE</div>
              </div>

              {/* Feature Points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  'Draggable multi-window desktop with taskbar & Start menu',
                  'VT220 terminal CLI & keyboard shortcuts',
                  '8-bit oscillator audio synthesis & CRT phosphor themes',
                  'Integrated Pomodoro timer & retro arcade mini-games'
                ].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#b2d8be' }}>
                    <span style={{ color: '#3ddc84', fontWeight: 800 }}>❯</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                onClick={() => handleLaunch('os')}
                style={{
                  background: '#3ddc84', color: '#000',
                  border: '1px solid #3ddc84',
                  borderRadius: 6, padding: '12px 18px',
                  fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, cursor: 'pointer', transition: 'all 0.15s ease',
                  flex: 1
                }}
              >
                <Terminal size={14} /> Launch Retro Terminal OS
              </button>
              <button
                onClick={() => handleTryDemo('os')}
                style={{
                  background: '#0a1a12', color: '#3ddc84',
                  border: '1px solid rgba(61, 220, 132, 0.4)',
                  borderRadius: 6, padding: '12px 14px',
                  fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, cursor: 'pointer', transition: 'all 0.15s ease'
                }}
                title="Preview Retro OS in guest demo mode"
              >
                Demo OS
              </button>
            </div>
          </div>

          {/* OPTION 2: MODERN MINIMALIST WEB */}
          <div className="bg-card border-2 border-border/80 rounded-3xl p-6 flex flex-col justify-between shadow-md hover:border-primary/40 transition-all relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="font-mono font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 bg-muted text-foreground border-border">
                  Modern Dashboard
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">
                  Linear • High Density
                </span>
              </div>

              <h2 className="text-xl font-bold font-sans text-foreground tracking-tight m-0 mb-2">
                Cadence Pro Web
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed m-0 mb-5">
                For engineers who prefer a sleek executive developer dashboard, luminous telemetry charts, GitHub-style heatmaps, and structured Kanban tracking.
              </p>

              {/* Modern Card Graphic */}
              <div className="bg-muted/40 border border-border/80 rounded-xl p-3.5 mb-5 text-xs text-foreground leading-relaxed">
                <div className="flex justify-between border-b border-border/60 pb-1.5 mb-2 font-medium">
                  <span>Day 14: Sliding Window &amp; Two Pointers</span>
                  <span className="text-amber-500 font-mono font-semibold">🔥 4d</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-[11px] py-0.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Longest Substring Without Repeating</span>
                  <span className="ml-auto text-amber-500 font-semibold">Med</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-[11px] py-0.5">
                  <span className="opacity-40">○</span>
                  <span>Minimum Window Substring</span>
                  <span className="ml-auto text-destructive font-semibold">Hard</span>
                </div>
              </div>

              {/* Feature Points */}
              <div className="flex flex-col gap-2 mb-6">
                {[
                  'Luminous midnight obsidian interface with Linear/Vercel fidelity',
                  'Recharts analytics & 25-week activity heatmaps',
                  'Placement pipeline Kanban board & interview tracker',
                  'Quick command palette (Ctrl+K) & company track filtering'
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-primary font-bold">•</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                size="lg"
                onClick={() => handleLaunch('web')}
                className="flex-1 h-11 text-xs font-semibold gap-2 shadow-xs cursor-pointer"
              >
                <Sparkles className="size-4" />
                <span>Launch Modern Web App</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleTryDemo('web')}
                className="h-11 text-xs font-semibold gap-1.5 border-border cursor-pointer"
                title="Preview Modern Dashboard with sample data"
              >
                Explore Demo
              </Button>
            </div>
          </div>
        </div>

        {/* ── 100% SHARED STATE CALLOUT ── */}
        <div className="mt-7 p-4 sm:p-5 rounded-2xl bg-card border border-border flex items-center justify-between flex-wrap gap-3.5 text-left shadow-xs">
          <div className="flex items-center gap-3">
            <RefreshCw className="size-5 text-emerald-500 shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-bold text-foreground">
                100% Synchronized Progress &amp; Zero Lock-in
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Every problem solved, daily streak, and note taken in one interface is immediately reflected in the other. Switch back and forth anytime with 1 click.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <span>Dual View</span>
            <span>·</span>
            <span>Single Store</span>
            <span>·</span>
            <span className="text-emerald-500 font-semibold">Cloud-First</span>
          </div>
        </div>

        {/* Quick metrics bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 pt-7 border-t border-border text-center">
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {CURRICULUM.totalDays}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Curated Days</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {CURRICULUM.totalProblems}+
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Problems</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {CURRICULUM.top150Count}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">LeetCode Benchmark</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">
              &lt; 50 ms
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Cloud Sync Latency</div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO CARD ── */}
      <section id="demo" className="max-w-4xl mx-auto px-5 py-4 pb-16">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
            <div>
              <span className="text-[11px] font-mono uppercase font-bold text-primary tracking-wider block mb-1">
                Live Experience Demo
              </span>
              <h3 className="text-base font-bold text-foreground m-0">
                Day 14: Sliding Window &amp; Two Pointers
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">
                {solvedDemoCount} / 3 complete
              </span>
              <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${(solvedDemoCount / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { id: 'p1', name: 'Longest Substring Without Repeating Characters', diff: 'Medium', tags: ['Google', 'Meta'], diffColor: 'text-amber-500' },
              { id: 'p2', name: 'Minimum Window Substring', diff: 'Hard', tags: ['Amazon', 'Uber'], diffColor: 'text-destructive' },
              { id: 'p3', name: 'Container With Most Water', diff: 'Medium', tags: ['Apple', 'Microsoft'], diffColor: 'text-amber-500' },
            ].map((p) => {
              const isChecked = !!demoSolved[p.id];
              return (
                <div
                  key={p.id}
                  onClick={() => toggleDemoProblem(p.id)}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-muted/30 border-border hover:bg-muted/60'
                  }`}
                >
                  <div className={`size-4.5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                    isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-muted-foreground/40 bg-background'
                  }`}>
                    {isChecked && <Check className="size-3 text-white" />}
                  </div>

                  <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                    <span className={`text-xs sm:text-sm font-semibold ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {p.name}
                    </span>
                    <span className={`text-xs font-semibold ${p.diffColor}`}>{p.diff}</span>
                    {p.tags.map(t => (
                      <Badge key={t} variant="outline" className="text-[10px] font-mono px-1.5 py-0 bg-background/50">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── EARLY ACCESS & CURRICULUM ARCHITECTURE ── */}
      <section className="max-w-4xl mx-auto px-5 pb-16">
        <div className="text-center mb-7">
          <span className="text-[11px] font-mono uppercase font-bold text-primary tracking-wider block mb-1">
            Early Access
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 mb-2 font-sans">
            Built for Engineers Who Are Serious About Tier-1 Roles
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto m-0 leading-relaxed">
            GrindOS is currently in early access. Be among the first engineers to master the full cloud-synced dual-engine curriculum.
          </p>
        </div>

        {/* Structured curriculum trust metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-center">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
            <div className="text-2xl font-bold font-mono text-foreground">140</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Structured Days</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
            <div className="text-2xl font-bold font-mono text-emerald-500">332</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Curated Problems</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
            <div className="text-2xl font-bold font-mono text-foreground">20</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Weeks of Structure</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
            <div className="text-2xl font-bold font-mono text-amber-500">$29</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Lifetime Pro Access</div>
          </div>
        </div>

        {/* Early access invitation card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center shadow-xs">
          <div className="text-base font-bold text-foreground mb-2">
            Join the Early Access Cohort
          </div>
          <p className="text-xs text-muted-foreground max-w-md mx-auto m-0 mb-5 leading-relaxed">
            The Free Community tier is fully operational with live Supabase cloud sync. Lifetime Pro access is locked in at $29 for early adopters before public scaling.
          </p>
          <div className="flex justify-center gap-2.5 flex-wrap">
            <Button
              size="sm"
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs h-9 px-5 font-semibold"
            >
              Start Free • No Credit Card
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPricingModalOpen(true)}
              className="text-xs h-9 px-4 font-semibold"
            >
              View Plan Details
            </Button>
          </div>
        </div>
      </section>

      {/* ── SIDE-BY-SIDE INTERFACE COMPARISON MATRIX ── */}
      <section id="compare" className="max-w-4xl mx-auto px-5 pb-16">
        <div className="text-center mb-8">
          <span className="text-[11px] font-mono uppercase font-bold text-primary tracking-wider block mb-1">
            Compare Workstations
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 font-sans">
            Choose The Mode That Fits Your Workflow
          </h2>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="p-3.5 sm:p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feature</th>
                  <th className="p-3.5 sm:p-4 text-xs font-bold text-[#3ddc84] font-mono">
                    🖥️ Retro Terminal OS
                  </th>
                  <th className="p-3.5 sm:p-4 text-xs font-bold text-foreground">
                    ✨ Modern Web App
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Primary Aesthetic', os: '90s VT220 CRT Phosphor Terminal', web: 'Clean Swiss Monochrome SaaS' },
                  { feature: 'Window Management', os: 'Multi-window draggable desktop', web: 'Streamlined dedicated page views' },
                  { feature: 'Audio Synthesis', os: '8-bit Web Audio chiptune synth', web: 'Crisp minimal modern clicks' },
                  { feature: 'Command Tools', os: 'Interactive CLI Terminal emulator', web: 'Command Palette (Ctrl+K)' },
                  { feature: 'Focus Pomodoro', os: 'Retro CLI timer with arcade breaks', web: 'Persistent status bar timer' },
                  { feature: 'Analytics View', os: 'ASCII metrics console & logs', web: 'Recharts interactive charts & heatmap' },
                  { feature: 'Data & Progress', os: '100% Shared Real-Time State', web: '100% Shared Real-Time State' },
                  { feature: 'Cloud & Device Sync', os: 'Direct Supabase Cloud Sync', web: 'Direct Supabase Cloud Sync' }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 sm:p-4 font-semibold text-foreground">{row.feature}</td>
                    <td className="p-3.5 sm:p-4 text-[#9bb8a5] font-mono text-xs">{row.os}</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground text-xs">{row.web}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Which Mode Should I Choose? (Decision Guide) */}
        <div className="mt-5 bg-card border border-border rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm sm:text-base font-bold text-foreground m-0 mb-4 flex items-center gap-2">
            <span>🧭</span> Which workstation should you start with?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div style={{
              background: '#040805',
              border: '1px solid #1a6b42',
              borderRadius: '0.75rem',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#3ddc84', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                  Choose Retro Terminal OS if you:
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#9bb8a5', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li>Want <strong>zero-distraction deep work</strong> with multi-window desktop tiling.</li>
                  <li>Love <strong>keyboard-first terminal workflows</strong> and retro CRT/audio immersion.</li>
                  <li>Are grinding coding sessions on desktop with built-in Pomodoro &amp; mini-breaks.</li>
                </ul>
              </div>
              <button
                onClick={() => handleLaunch('os')}
                style={{
                  background: '#3ddc84', color: '#000', border: 'none', borderRadius: 6,
                  padding: '8px 12px', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  cursor: 'pointer', textAlign: 'center'
                }}
              >
                Start in Retro OS →
              </button>
            </div>

            <div className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col justify-between gap-3">
              <div>
                <div className="text-xs sm:text-sm font-bold text-foreground mb-1.5">
                  Choose Modern Web Dashboard if you:
                </div>
                <ul className="m-0 pl-4 text-xs text-muted-foreground leading-relaxed flex flex-col gap-1 list-disc">
                  <li>Prefer <strong>executive telemetry</strong>: velocity graphs, heatmaps, and readiness dials.</li>
                  <li>Are tracking <strong>active interview rounds &amp; offers</strong> via the Kanban pipeline.</li>
                  <li>Want a mobile/laptop-responsive layout with seamless fast browsing.</li>
                </ul>
              </div>
              <Button
                size="sm"
                onClick={() => handleLaunch('web')}
                className="w-full text-xs h-8 font-semibold"
              >
                Start in Modern Web →
              </Button>
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground text-center">
            💡 <strong>No lock-in:</strong> You can switch back and forth at any second with 1 click in the top navigation. Your entire progress and notes remain synchronized across both in Supabase cloud.
          </div>
        </div>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section id="features" className="max-w-4xl mx-auto px-5 pb-16">
        <div className="text-center mb-8">
          <span className="text-[11px] font-mono uppercase font-bold text-primary tracking-wider block mb-1">
            System Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 font-sans">
            Engineered for Placement Conversion
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Card 1: Placement Readiness Engine */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-2 shadow-xs hover:border-border/90 transition-colors">
            <Target className="size-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground m-0">Placement Readiness Engine</h3>
            <p className="text-xs text-muted-foreground leading-relaxed m-0">
              Calculates your interview odds formula, tracks pace against your target offer deadline, and benchmarks topic mastery across all 25 curriculum categories.
            </p>
          </div>

          {/* Card 2: Placement Pipeline */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-2 shadow-xs hover:border-border/90 transition-colors">
            <Briefcase className="size-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground m-0">Placement Pipeline Tracker</h3>
            <p className="text-xs text-muted-foreground leading-relaxed m-0">
              Track applications across Wishlist, OA, Technical Rounds, and Offers with compensation metrics and notes.
            </p>
          </div>

          {/* Card 3: Company Tagging */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-2 shadow-xs hover:border-border/90 transition-colors">
            <Building2 className="size-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground m-0">Company-Specific Tracks</h3>
            <p className="text-xs text-muted-foreground leading-relaxed m-0">
              Filter curriculum problems directly by target companies: Google, Amazon, Microsoft, Meta, Uber, and Apple.
            </p>
          </div>

          {/* Card 4: Cohort Competition */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-2 shadow-xs hover:border-border/90 transition-colors">
            <Users className="size-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground m-0">Campus &amp; Squad Cohorts</h3>
            <p className="text-xs text-muted-foreground leading-relaxed m-0">
              Create or join private 6-character code cohorts to compare streaks and progress with your college batch or friends.
            </p>
          </div>

          {/* Card 5: Cloud Persistence */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-2 shadow-xs hover:border-border/90 transition-colors">
            <Shield className="size-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground m-0">Enterprise Cloud Persistence</h3>
            <p className="text-xs text-muted-foreground leading-relaxed m-0">
              All progress is synced directly to your secure Supabase cloud database. One-click JSON backup and data exports anytime.
            </p>
          </div>

          {/* Card 6: Focus Stopwatch */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-2 shadow-xs hover:border-border/90 transition-colors">
            <Timer className="size-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground m-0">Deep-Work Practice Timer</h3>
            <p className="text-xs text-muted-foreground leading-relaxed m-0">
              Built-in 25m, 45m, and 60m focus blocks that persist across page navigation to enforce timed problem-solving discipline.
            </p>
          </div>
        </div>
      </section>

      {/* ── CURRICULUM ACCORDION ── */}
      <section id="curriculum" className="max-w-4xl mx-auto px-5 pb-16">
        <div className="text-center mb-8">
          <span className="text-[11px] font-mono uppercase font-bold text-primary tracking-wider block mb-1">
            {CURRICULUM.totalWeeks} Weeks · {CURRICULUM.totalDays} Days · {CURRICULUM.totalProblems} Problems
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 font-sans">
            Structured Algorithmic Syllabus
          </h2>
        </div>

        <div className="flex flex-col gap-2.5">
          {PHASES.map((phase) => {
            const isOpen = openPhase === phase.id;
            return (
              <div
                key={phase.id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs transition-colors"
              >
                <div
                  onClick={() => setOpenPhase(isOpen ? null : phase.id)}
                  className="p-3.5 sm:p-4.5 flex items-center justify-between cursor-pointer select-none hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 bg-muted/50 text-foreground border-border">
                      {phase.weeks}
                    </Badge>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-foreground">
                        {phase.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{phase.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground font-mono">
                      {phase.problems} problems
                    </span>
                    {isOpen ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="p-4 sm:p-5 border-t border-border/60 bg-muted/20 text-xs">
                    <p className="text-xs text-muted-foreground m-0 mb-3 leading-relaxed">
                      {phase.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {phase.keyPatterns.map(pattern => (
                        <Badge key={pattern} variant="secondary" className="font-mono text-[10px] px-2 py-0.5">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      <strong className="text-foreground">Key Benchmarks:</strong> {phase.sampleProblems.join(' • ')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-4xl mx-auto px-5 pb-16">
        <div className="text-center mb-8">
          <span className="text-[11px] font-mono uppercase font-bold text-primary tracking-wider block mb-1">
            Common Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 font-sans">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {[
            {
              q: 'Why are there two different interfaces (Retro OS vs Modern Web)?',
              a: 'Feedback showed users were passionately divided: some love the deep immersion of a 90s retro CRT window manager with chiptune audio, while others prefer the clean, minimalist modern web dashboard. We give you both running seamlessly on the exact same engine.'
            },
            {
              q: 'Does my progress transfer when I switch between interfaces?',
              a: 'Yes, 100%. Both interfaces read and write from the exact same Supabase cloud database. When you mark a problem solved or update a note in Modern Web, it is immediately reflected when you launch Retro OS, and vice versa — in real-time.'
            },
            {
              q: 'How do I switch between Retro OS and Modern Web after choosing?',
              a: 'In Retro OS, click the "MODERN UI" button in the taskbar or Start Menu. In Modern Web, click the "OS Shell" button in the top navigation bar. You can also return to this landing page at any time.'
            },
            {
              q: 'How is my progress stored and synchronized across devices?',
              a: 'GrindOS uses direct cloud synchronization backed by Supabase. Your solved problems, notes, streaks, and interview pipelines are securely synchronized across any device in real-time, with one-click full JSON export available anytime.'
            },
            {
              q: 'How does the Placement Readiness algorithm work?',
              a: 'Your readiness percentage is calculated from 4 transparent factors: Problem Coverage (40%), Streak Consistency (25%), Pace vs Target Deadline (25%), and Topic Breadth (10%).'
            }
          ].map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-xs transition-colors"
              >
                <div
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer text-xs sm:text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp className="size-3.5 text-muted-foreground" /> : <ChevronDown className="size-3.5 text-muted-foreground" />}
                </div>
                {isOpen && (
                  <div className="px-4 pb-3.5 pt-0 text-xs text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── MEADOW RISE INTERACTIVE CANVAS FOOTER ── */}
      <MeadowRiseFooter
        name="GrindOS"
        brandHref="/"
        heading="Master 140 days of *algorithmic prep* today."
        subheading="332 curated LeetCode problems. Spaced repetition telemetry. Dual-engine workstation."
        cta={{
          label: "Start 140-Day Prep Free",
          onClick: () => setIsAuthModalOpen(true),
        }}
        tagline="A disciplined placement operating system designed to get engineers and students placement-ready for Tier-1 tech companies."
        placeholder="Enter your email for placement drops"
        onSubscribe={async (email) => {
          toast.success(`Subscribed ${email} for placement drops! 🚀`);
        }}
        columns={[
          {
            title: "Workstation",
            links: [
              { label: "Modern Bento App", onClick: () => handleLaunch('web') },
              { label: "Retro Terminal OS", onClick: () => handleLaunch('os') },
              { label: "Interactive Demo Sandbox", onClick: () => setIsDemoModalOpen(true) },
              { label: "Curriculum Syllabus", href: "#curriculum" },
            ],
          },
          {
            title: "Preparation",
            links: [
              { label: "Placement Tracker", onClick: () => handleLaunch('web') },
              { label: "Global Peer Cohorts", onClick: () => handleLaunch('web') },
              { label: "Top 150 Benchmarks", href: "#features" },
              { label: "Lifetime Pro License", onClick: () => setIsPricingModalOpen(true) },
            ],
          },
          {
            title: "Legal & System",
            links: [
              { label: "Pricing & Plans", onClick: () => setIsPricingModalOpen(true) },
              { label: "Terms of Service", href: "/terms" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Stealth Ops Console", href: "/_ops" },
            ],
          },
        ]}
        socialTitle="Community"
        socials={[
          { icon: "x", href: "https://x.com", label: "X (Twitter)" },
          { icon: "linkedin", href: "https://linkedin.com", label: "LinkedIn" },
        ]}
        legal={[
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
        ]}
        copyright={`© ${new Date().getFullYear()} GrindOS. All rights reserved. Dual-Engine Placement Workstation.`}
      />

      {/* Auth, Pricing & Demo Choice Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} />
      <DemoChoiceModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectMode={onSelectMode}
      />
    </div>
  );
};
