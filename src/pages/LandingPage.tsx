import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useProgress } from '../context/ProgressContext';
import { sounds } from '../utils/audio';
import { AuthModal } from '../components/modals/AuthModal';
import { PricingModal } from '../components/modals/PricingModal';
import { DemoChoiceModal } from '../components/modals/DemoChoiceModal';
import { MeadowRiseHero } from '../components/ui/meadow-rise-hero';
import { MeadowRiseFooterExact } from '../components/ui/meadow-rise-footer-exact';

interface LandingPageProps {
  onSelectMode?: (mode: 'os' | 'web') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile, authUser, isDemoMode, loadDemoData } = useProgress();

  // Interactive Demo Checklist State (Day 14: Sliding Window & Two Pointers)
  const [demoSolved, setDemoSolved] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
  });

  // Accordion states
  const [openPhase, setOpenPhase] = useState<number | null>(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Modal open states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Automatically prompt auth modal if arriving from an auth-guarded route
  useEffect(() => {
    if (searchParams.get('auth') === 'required' && !authUser && !isDemoMode) {
      setIsAuthModalOpen(true);
      toast('Please sign in or create an account to access GrindOS.', {
        icon: '🔒',
        id: 'auth-required-toast',
      });
    }
  }, [searchParams, authUser, isDemoMode]);

  // Mode launch helper
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
        // ignore storage errors
      }
      if (mode === 'os') {
        navigate('/os');
      } else {
        navigate('/dashboard');
      }
    }
  };

  // Demo launch helper
  const handleTryDemo = (mode: 'os' | 'web' = 'web') => {
    sounds.playTickSound();
    loadDemoData();
    if (mode === 'os') {
      navigate('/os');
    } else {
      navigate('/dashboard');
    }
  };

  // Toggle problem inside the live demo card
  const toggleProblem = (id: number) => {
    sounds.playTickSound();
    setDemoSolved((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      const solvedCount = Object.values(updated).filter(Boolean).length;
      if (solvedCount === 3) {
        sounds.playVictorySound();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      return updated;
    });
  };

  const solvedDemoCount = Object.values(demoSolved).filter(Boolean).length;
  const demoProgressPct = (solvedDemoCount / 3) * 100;

  // Toggle curriculum accordion
  const toggleAccordion = (id: number) => {
    sounds.playTickSound();
    setOpenPhase((prev) => (prev === id ? null : id));
  };

  // Toggle FAQ accordion
  const toggleFaq = (id: number) => {
    sounds.playTickSound();
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#253019] text-[#eef1e6] font-['Inter_Tight',sans-serif] selection:bg-[#4d5d2c] selection:text-white">
      {/* ── Scoped Meadow Rise Styles ── */}
      <style>{`
        :root {
          --mrf-sans: "Inter Tight", "Inter", "Helvetica Neue", Arial, system-ui, sans-serif;
          --mrf-serif: "Instrument Serif", "Cormorant Garamond", Georgia, serif;
          --mrf-mono: "JetBrains Mono", monospace;
          --mrf-ground: #253019;
          --mrf-ink: #11140d;
          --mrf-sub: #3b4234;
          --mrf-pill: #ffffff;
          --mrf-pill-ink: #11140d;
          --mrf-text: #eef1e6;
          --mrf-muted: #a9b49c;
          --mrf-line: rgba(238, 241, 230, 0.16);
          --mrf-max: 1240px;
        }

        .mrf-scene {
          position: absolute;
          inset: 0 0 auto 0;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }
        .mrf-scene canvas {
          display: block;
          width: 100%;
          height: 100%;
          max-width: none;
        }

        .mrf-h {
          margin: 0;
          max-width: 16ch;
          font-family: var(--mrf-sans);
          font-weight: 500;
          font-size: clamp(38px, 6.3vw, 86px);
          line-height: 1.02;
          letter-spacing: -0.042em;
          color: var(--mrf-ink);
          text-wrap: balance;
        }
        .mrf-line { display: block; white-space: normal; }
        .mrf-w {
          display: inline-block;
          overflow: hidden;
          padding: 0.04em 0.06em 0.16em;
          margin: -0.04em -0.06em -0.16em;
          vertical-align: top;
        }
        .mrf-wi {
          display: inline-block;
          transform: translate3d(0, 108%, 0) rotate(4deg);
          transform-origin: 0 100%;
          transition: transform 1150ms cubic-bezier(.16, 1, .3, 1);
          transition-delay: calc(var(--d, 0) * 1ms);
        }
        .mrf-acc .mrf-wi {
          font-family: var(--mrf-serif);
          font-style: italic;
          font-weight: 400;
          font-size: 1.07em;
          letter-spacing: -0.02em;
          padding-right: 0.04em;
          transform: translate3d(-0.08em, 0, 0) skewX(-10deg);
          clip-path: inset(-20% 100% -30% -5%);
          filter: blur(6px);
          opacity: 0.2;
          transition: clip-path 1400ms cubic-bezier(.65, 0, .25, 1), transform 1600ms cubic-bezier(.16, 1, .3, 1), filter 1100ms ease, opacity 900ms ease;
          transition-delay: calc(var(--d, 0) * 1ms);
        }
        .mrf-in .mrf-wi { transform: none; }
        .mrf-in .mrf-acc .mrf-wi { clip-path: inset(-20% -10% -30% -5%); filter: blur(0); opacity: 1; }

        .mrf-sub {
          margin: clamp(16px, 2.2vw, 26px) auto 0;
          max-width: 46ch;
          font-size: clamp(14px, 1.15vw, 16px);
          line-height: 1.55;
          letter-spacing: -0.005em;
          color: var(--mrf-sub);
        }
        .mrf-r {
          opacity: 0;
          transform: translate3d(0, 14px, 0);
          filter: blur(4px);
          transition: opacity 900ms ease, transform 1100ms cubic-bezier(.16, 1, .3, 1), filter 900ms ease;
          transition-delay: calc(var(--d, 0) * 1ms);
        }
        .mrf-in .mrf-r { opacity: 1; transform: none; filter: blur(0); }

        .mrf-cta {
          --mx: 0px;
          --my: 0px;
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          height: 42px;
          padding: 0 8px 0 20px;
          border-radius: 999px;
          background: var(--mrf-pill);
          color: var(--mrf-pill-ink);
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: -0.01em;
          text-decoration: none;
          overflow: hidden;
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 10px 30px -12px rgba(20, 30, 10, 0.45), 0 2px 6px -2px rgba(20, 30, 10, 0.25);
          transform: translate3d(var(--mx), var(--my), 0);
          transition: transform 500ms cubic-bezier(.2, .9, .3, 1.2), color 450ms ease, box-shadow 450ms ease;
        }
        .mrf-cta::before {
          content: "";
          position: absolute;
          left: var(--fx, 50%);
          top: var(--fy, 50%);
          width: 260px;
          height: 260px;
          margin: -130px 0 0 -130px;
          border-radius: 50%;
          background: var(--mrf-ground);
          transform: scale(0);
          transition: transform 650ms cubic-bezier(.16, 1, .3, 1);
        }
        .mrf-cta > * { position: relative; z-index: 1; }
        .mrf-cta-arrow {
          position: relative;
          display: grid;
          place-items: center;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--mrf-ground);
          color: var(--mrf-pill);
          overflow: hidden;
          transition: background 450ms ease, color 450ms ease;
        }
        .mrf-cta-arrow svg { grid-area: 1 / 1; transition: transform 520ms cubic-bezier(.65, 0, .25, 1); }
        .mrf-cta-arrow .mrf-a2 { transform: translate(-150%, 150%); }
        .mrf-cta:hover, .mrf-cta:focus-visible { color: var(--mrf-text); }
        .mrf-cta:hover::before, .mrf-cta:focus-visible::before { transform: scale(1); }
        .mrf-cta:hover .mrf-cta-arrow, .mrf-cta:focus-visible .mrf-cta-arrow { background: var(--mrf-pill); color: var(--mrf-ground); }
        .mrf-cta:hover .mrf-a1, .mrf-cta:focus-visible .mrf-a1 { transform: translate(150%, -150%); }
        .mrf-cta:hover .mrf-a2, .mrf-cta:focus-visible .mrf-a2 { transform: none; }
        .mrf-cta:focus-visible { outline: 2px solid var(--mrf-ink); outline-offset: 3px; }

        .mrf-cta-sec {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 40px;
          padding: 0 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(17, 20, 13, 0.12);
          color: var(--mrf-ink);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: -0.01em;
          transition: all 250ms ease;
        }
        .mrf-cta-sec:hover {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(17, 20, 13, 0.25);
          transform: translateY(-1px);
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. TOP NAV (PALE TRANSLUCENT AESTHETIC HARMONIZING WITH MEADOW SKY)        */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-[rgba(17,20,13,0.08)] bg-[#f4f4ef]/85 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-[#253019] text-[#ffffff] flex items-center justify-center font-extrabold text-xs font-mono shadow-sm">
            G//
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[#11140d]">GrindOS</span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#4d5d2c]/15 text-[#253019] font-medium border border-[#4d5d2c]/25">
                Dual-Engine
              </span>
            </div>
            <span className="text-[10px] text-[#556a33] font-mono block">140-Day Placement Workstation</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs text-[#3b4234] font-medium">
          <a href="#curriculum" className="hover:text-[#11140d] transition-colors">Curriculum</a>
          <a href="#compare" className="hover:text-[#11140d] transition-colors">Compare</a>
          <a href="#features" className="hover:text-[#11140d] transition-colors">Features</a>
          <a href="#demo" className="hover:text-[#11140d] transition-colors">Live Demo</a>
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="hover:text-[#11140d] transition-colors cursor-pointer"
          >
            Pricing
          </button>
          <a href="#faq" className="hover:text-[#11140d] transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-2.5">
          {authUser ? (
            <button
              onClick={() => handleLaunch('web')}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-[#253019] text-white font-medium flex items-center gap-1.5 hover:bg-[#1a2311] transition-all shadow-xs cursor-pointer"
            >
              <span>Enter App ({userProfile.name})</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs px-3.5 py-1.5 rounded-lg border border-[rgba(17,20,13,0.14)] bg-white/70 hover:bg-white text-[#11140d] font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>Sign In</span>
            </button>
          )}

          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#4d5d2c]/30 bg-[#4d5d2c]/10 hover:bg-[#4d5d2c]/20 text-[#253019] font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <span>OS Shell</span>
          </button>

          {!authUser && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-[#253019] text-[#ffffff] font-medium flex items-center gap-1.5 hover:bg-[#1a2311] transition-all shadow-sm cursor-pointer"
            >
              <span>Start Free</span>
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION WITH EXACT MEADOW RISE MOUNTAINS & MOVEMENTS              */}
      {/* ========================================================================= */}
      <MeadowRiseHero
        onStartFree={() => setIsAuthModalOpen(true)}
        onExploreDemo={() => setIsDemoModalOpen(true)}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        authUser={authUser}
        onEnterApp={() => handleLaunch('web')}
        operatorName={userProfile.name}
        seed={3}
      />

      {/* ========================================================================= */}
      {/* 3. THE DUAL WORKSTATION FORK CARDS (RESTING IN MEADOW GROUND #253019)     */}
      {/* ========================================================================= */}
      <section className="relative z-20 max-w-5xl mx-auto px-5 pt-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* OPTION 1: RETRO TERMINAL OS */}
          <div className="relative bg-[#1a2312] border-2 border-[#3b4e28] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl overflow-hidden hover:border-[#6c8240] transition-all">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#4d5d2c]/40 text-[#c2d6a4] border border-[#6c8240]/40">
                  RETRO WORKSTATION
                </span>
                <span className="text-[11px] font-mono text-[#a9b49c]">
                  VT220 • CHIP SYNTH
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-[#c2d6a4] font-mono mb-2 tracking-tight">
                GrindOS 95 Shell
              </h2>

              <p className="text-xs sm:text-sm text-[#a9b49c] leading-relaxed mb-5">
                For engineers who thrive in deep-work terminal immersion, multi-window multitasking, retro sound feedback, and keyboard-driven efficiency.
              </p>

              {/* Interactive Terminal Box Graphic */}
              <div className="bg-[#10170a] border border-[#2a381c] rounded-lg p-3.5 mb-5 font-mono text-xs text-[#a3b384] leading-relaxed shadow-inner">
                <div className="text-[#7d8f63] border-b border-[#212c16] pb-1.5 mb-2 flex justify-between text-[11px]">
                  <span>MISSIONS.EXE — VT220</span>
                  <span>[ _ ▢ ✕ ]</span>
                </div>
                <div>C:\&gt; grindos --boot --interactive</div>
                <div className="text-[#f1dcc0]">[OK] 20 WEEKS / 140 DAYS / 332 PROBLEMS INITIALIZED</div>
                <div>[OK] WINDOW MANAGER &amp; CHIP SYNTH ONLINE</div>
                <div className="text-[#7d8f63]">&gt; MISSIONS.EXE • ORACLE.EXE • POMO.EXE</div>
              </div>

              {/* Feature Bullets */}
              <div className="flex flex-col gap-2 mb-6 text-xs text-[#dbe6cf]">
                <div className="flex items-center gap-2">
                  <span className="text-[#a3b384] font-bold">❯</span>
                  <span>Draggable multi-window desktop with taskbar &amp; Start menu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#a3b384] font-bold">❯</span>
                  <span>VT220 terminal CLI &amp; keyboard shortcuts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#a3b384] font-bold">❯</span>
                  <span>8-bit oscillator audio synthesis &amp; CRT phosphor themes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#a3b384] font-bold">❯</span>
                  <span>Integrated Pomodoro timer &amp; retro arcade mini-games</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => handleLaunch('os')}
                className="flex-1 bg-[#4d5d2c] text-[#ffffff] border border-[#6c8240] rounded-lg py-2.5 px-4 text-xs font-bold font-mono flex items-center justify-center gap-2 hover:bg-[#5c7035] transition-all cursor-pointer shadow-md"
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                <span>Launch Retro Terminal OS</span>
              </button>
              <button
                onClick={() => handleTryDemo('os')}
                className="bg-[#253019] text-[#c2d6a4] border border-[#4d5d2c] rounded-lg py-2.5 px-3.5 text-xs font-bold font-mono flex items-center justify-center gap-1.5 hover:bg-[#303e20] transition-all cursor-pointer"
              >
                <span>Demo OS</span>
              </button>
            </div>
          </div>

          {/* OPTION 2: MODERN MINIMALIST WEB */}
          <div className="relative bg-[#1f2a16] border-2 border-[#3b4e28] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl overflow-hidden hover:border-[#6c8240] transition-all">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#314324] text-[#ffffff] border border-[#4d5d2c] uppercase tracking-wider">
                  Modern Dashboard
                </span>
                <span className="text-xs font-mono text-[#a9b49c]">
                  Linear • High Density
                </span>
              </div>

              <h2 className="text-2xl font-bold font-sans text-white mb-2 tracking-tight">
                Cadence Pro Web
              </h2>

              <p className="text-xs sm:text-sm text-[#a9b49c] leading-relaxed mb-5">
                For engineers who prefer a sleek executive developer dashboard, luminous telemetry charts, GitHub-style heatmaps, and structured Kanban tracking.
              </p>

              {/* Modern Card Graphic */}
              <div className="bg-[#151e0e] border border-[#2d3d1e] rounded-xl p-3.5 mb-5 text-xs text-white leading-relaxed">
                <div className="flex justify-between border-b border-[#2d3d1e] pb-2 mb-2 font-medium">
                  <span>Day 14: Sliding Window &amp; Two Pointers</span>
                  <span className="text-[#f1dcc0] font-mono font-semibold">🔥 4d</span>
                </div>
                <div className="flex items-center gap-2 text-[#a9b49c] text-[11px] py-0.5">
                  <span className="text-[#93a964] font-bold">✓</span>
                  <span className="text-white">Longest Substring Without Repeating</span>
                  <span className="ml-auto text-[#f1dcc0] font-semibold font-mono">Med</span>
                </div>
                <div className="flex items-center gap-2 text-[#a9b49c] text-[11px] py-0.5">
                  <span className="opacity-40">○</span>
                  <span>Minimum Window Substring</span>
                  <span className="ml-auto text-[#e8a48f] font-semibold font-mono">Hard</span>
                </div>
              </div>

              {/* Feature Bullets */}
              <div className="flex flex-col gap-2 mb-6 text-xs text-[#a9b49c]">
                <div className="flex items-center gap-2">
                  <span className="text-[#93a964] font-bold">•</span>
                  <span>Executive dashboard with Linear/Vercel visual fidelity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#93a964] font-bold">•</span>
                  <span>Interactive analytics &amp; 25-week activity heatmaps</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#93a964] font-bold">•</span>
                  <span>Placement pipeline Kanban board &amp; interview tracker</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#93a964] font-bold">•</span>
                  <span>Quick command palette (Ctrl+K) &amp; company track filtering</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => handleLaunch('web')}
                className="flex-1 bg-white text-[#11140d] rounded-lg py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#eef1e6] transition-all cursor-pointer shadow-md"
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                </svg>
                <span>Launch Modern Web App</span>
              </button>
              <button
                onClick={() => handleTryDemo('web')}
                className="border border-[#3b4e28] bg-[#1a2312] text-[#eef1e6] hover:bg-[#253019] rounded-lg py-2.5 px-3.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Explore Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* 100% SHARED STATE CALLOUT */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-[#1a2312] border border-[#354823] flex items-center justify-between flex-wrap gap-4 text-left shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="size-9 rounded-xl bg-[#4d5d2c]/40 border border-[#6c8240]/40 flex items-center justify-center text-[#c2d6a4] shrink-0">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">
                100% Synchronized Progress &amp; Zero Lock-in
              </div>
              <div className="text-xs text-[#a9b49c] mt-0.5">
                Every problem solved, daily streak, and note taken in one interface is immediately reflected in the other. Switch back and forth anytime with 1 click.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-[11px] text-[#a9b49c]">
            <span>Dual View</span>
            <span>·</span>
            <span>Single Store</span>
            <span>·</span>
            <span className="text-[#a3b384] font-semibold flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-[#a3b384]"></span>
              Cloud-First (&lt; 50ms)
            </span>
          </div>
        </div>

        {/* Quick Curriculum Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 pt-7 border-t border-[rgba(238,241,230,0.12)] text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white">140</div>
            <div className="text-[11px] text-[#a9b49c] mt-0.5">Curated Days</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#a3b384]">332+</div>
            <div className="text-[11px] text-[#a9b49c] mt-0.5">Curated Problems</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white">150</div>
            <div className="text-[11px] text-[#a9b49c] mt-0.5">LeetCode Benchmark</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#f1dcc0]">&lt; 50 ms</div>
            <div className="text-[11px] text-[#a9b49c] mt-0.5">Cloud Sync Latency</div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. LIVE INTERACTIVE PROBLEM DEMO CARD                                      */}
      {/* ========================================================================= */}
      <section id="demo" className="max-w-4xl mx-auto px-5 py-6 pb-20">
        <div className="bg-[#1a2312] border border-[#354823] rounded-3xl p-6 sm:p-7 shadow-lg">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#a3b384] tracking-wider block mb-1">
                Live Experience Demo
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white m-0">
                Day 14: Sliding Window &amp; Two Pointers
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#a9b49c] font-mono font-medium">
                {solvedDemoCount} / 3 complete
              </span>
              <div className="h-2 w-24 rounded-full bg-[#12180d] border border-[#2d3e1e] overflow-hidden">
                <div
                  className="h-full bg-[#829a52] rounded-full transition-all duration-400"
                  style={{ width: `${demoProgressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Problem 1 */}
            <div
              onClick={() => toggleProblem(1)}
              className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all cursor-pointer ${
                demoSolved[1]
                  ? 'bg-[#4d5d2c]/20 border-[#6c8240]/40'
                  : 'bg-[#141b0e] border-[#2d3e1e] hover:bg-[#1a2312]'
              }`}
            >
              <div
                className={`size-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                  demoSolved[1]
                    ? 'bg-[#6c8240] border-[#6c8240] text-white'
                    : 'border-[#4d5d2c] bg-[#12180d]'
                }`}
              >
                {demoSolved[1] && (
                  <svg className="size-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-2.5 flex-wrap">
                <span
                  className={`text-xs sm:text-sm font-semibold ${
                    demoSolved[1] ? 'line-through text-[#a9b49c]' : 'text-white'
                  }`}
                >
                  Longest Substring Without Repeating Characters
                </span>
                <span className="text-xs font-semibold font-mono text-[#f1dcc0]">Medium</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#12180d] border border-[#2d3e1e] text-[#a9b49c]">
                  Google
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#12180d] border border-[#2d3e1e] text-[#a9b49c]">
                  Meta
                </span>
              </div>
            </div>

            {/* Problem 2 */}
            <div
              onClick={() => toggleProblem(2)}
              className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all cursor-pointer ${
                demoSolved[2]
                  ? 'bg-[#4d5d2c]/20 border-[#6c8240]/40'
                  : 'bg-[#141b0e] border-[#2d3e1e] hover:bg-[#1a2312]'
              }`}
            >
              <div
                className={`size-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                  demoSolved[2]
                    ? 'bg-[#6c8240] border-[#6c8240] text-white'
                    : 'border-[#4d5d2c] bg-[#12180d]'
                }`}
              >
                {demoSolved[2] && (
                  <svg className="size-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-2.5 flex-wrap">
                <span
                  className={`text-xs sm:text-sm font-semibold ${
                    demoSolved[2] ? 'line-through text-[#a9b49c]' : 'text-white'
                  }`}
                >
                  Minimum Window Substring
                </span>
                <span className="text-xs font-semibold font-mono text-[#e8a48f]">Hard</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#12180d] border border-[#2d3e1e] text-[#a9b49c]">
                  Amazon
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#12180d] border border-[#2d3e1e] text-[#a9b49c]">
                  Uber
                </span>
              </div>
            </div>

            {/* Problem 3 */}
            <div
              onClick={() => toggleProblem(3)}
              className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all cursor-pointer ${
                demoSolved[3]
                  ? 'bg-[#4d5d2c]/20 border-[#6c8240]/40'
                  : 'bg-[#141b0e] border-[#2d3e1e] hover:bg-[#1a2312]'
              }`}
            >
              <div
                className={`size-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                  demoSolved[3]
                    ? 'bg-[#6c8240] border-[#6c8240] text-white'
                    : 'border-[#4d5d2c] bg-[#12180d]'
                }`}
              >
                {demoSolved[3] && (
                  <svg className="size-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-2.5 flex-wrap">
                <span
                  className={`text-xs sm:text-sm font-semibold ${
                    demoSolved[3] ? 'line-through text-[#a9b49c]' : 'text-white'
                  }`}
                >
                  Container With Most Water
                </span>
                <span className="text-xs font-semibold font-mono text-[#f1dcc0]">Medium</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#12180d] border border-[#2d3e1e] text-[#a9b49c]">
                  Apple
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#12180d] border border-[#2d3e1e] text-[#a9b49c]">
                  Microsoft
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(238,241,230,0.1)] flex items-center justify-between text-xs text-[#a9b49c]">
            <span>Click each problem row to test interactive solving telemetry.</span>
            <span className="text-[#a3b384] font-mono">140 Days • Zero Excuses</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SIDE-BY-SIDE INTERFACE COMPARISON MATRIX                               */}
      {/* ========================================================================= */}
      <section id="compare" className="max-w-4xl mx-auto px-5 pb-20">
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono uppercase font-bold text-[#a3b384] tracking-wider block mb-1">
            Compare Workstations
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Choose The Mode That Fits Your Workflow
          </h2>
        </div>

        <div className="bg-[#1a2312] border border-[#354823] rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#141b0e] border-b border-[#2d3e1e]">
                  <th className="p-4 text-xs font-semibold text-[#a9b49c] uppercase tracking-wider">Feature</th>
                  <th className="p-4 text-xs font-bold text-[#c2d6a4] font-mono">🖥️ Retro Terminal OS</th>
                  <th className="p-4 text-xs font-bold text-white">✨ Modern Web App</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243118]">
                <tr className="hover:bg-[#1f2b16]/50 transition-colors">
                  <td className="p-4 font-semibold text-white">Primary Aesthetic</td>
                  <td className="p-4 text-[#a9b49c] font-mono text-xs">90s VT220 CRT Phosphor Terminal</td>
                  <td className="p-4 text-[#a9b49c] text-xs">Clean Swiss Monochrome SaaS</td>
                </tr>
                <tr className="hover:bg-[#1f2b16]/50 transition-colors">
                  <td className="p-4 font-semibold text-white">Window Management</td>
                  <td className="p-4 text-[#a9b49c] font-mono text-xs">Multi-window draggable desktop</td>
                  <td className="p-4 text-[#a9b49c] text-xs">Streamlined dedicated page views</td>
                </tr>
                <tr className="hover:bg-[#1f2b16]/50 transition-colors">
                  <td className="p-4 font-semibold text-white">Audio Synthesis</td>
                  <td className="p-4 text-[#a9b49c] font-mono text-xs">8-bit Web Audio chiptune synth</td>
                  <td className="p-4 text-[#a9b49c] text-xs">Crisp minimal modern clicks</td>
                </tr>
                <tr className="hover:bg-[#1f2b16]/50 transition-colors">
                  <td className="p-4 font-semibold text-white">Command Tools</td>
                  <td className="p-4 text-[#a9b49c] font-mono text-xs">Interactive CLI Terminal emulator</td>
                  <td className="p-4 text-[#a9b49c] text-xs">Command Palette (Ctrl+K)</td>
                </tr>
                <tr className="hover:bg-[#1f2b16]/50 transition-colors">
                  <td className="p-4 font-semibold text-white">Focus Pomodoro</td>
                  <td className="p-4 text-[#a9b49c] font-mono text-xs">Retro CLI timer with arcade breaks</td>
                  <td className="p-4 text-[#a9b49c] text-xs">Persistent status bar timer</td>
                </tr>
                <tr className="hover:bg-[#1f2b16]/50 transition-colors">
                  <td className="p-4 font-semibold text-white">Analytics View</td>
                  <td className="p-4 text-[#a9b49c] font-mono text-xs">ASCII metrics console &amp; logs</td>
                  <td className="p-4 text-[#a9b49c] text-xs">Interactive charts &amp; heatmap</td>
                </tr>
                <tr className="hover:bg-[#1f2b16]/50 transition-colors">
                  <td className="p-4 font-semibold text-white">Data &amp; Progress</td>
                  <td className="p-4 text-[#a3b384] font-mono text-xs font-semibold">100% Shared Real-Time State</td>
                  <td className="p-4 text-[#a3b384] font-mono text-xs font-semibold">100% Shared Real-Time State</td>
                </tr>
                <tr className="hover:bg-[#1f2b16]/50 transition-colors">
                  <td className="p-4 font-semibold text-white">Cloud &amp; Device Sync</td>
                  <td className="p-4 text-[#a3b384] font-mono text-xs font-semibold">Direct Supabase Cloud Sync</td>
                  <td className="p-4 text-[#a3b384] font-mono text-xs font-semibold">Direct Supabase Cloud Sync</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. BENTO GRID: SYSTEM CAPABILITIES                                        */}
      {/* ========================================================================= */}
      <section id="features" className="max-w-4xl mx-auto px-5 pb-20">
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono uppercase font-bold text-[#a3b384] tracking-wider block mb-1">
            System Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Engineered for Placement Conversion
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-2xl p-5 flex flex-col gap-2.5 shadow-sm hover:border-[#6c8240] transition-all">
            <div className="size-8 rounded-lg bg-[#4d5d2c]/40 border border-[#6c8240]/40 flex items-center justify-center text-[#c2d6a4]">
              <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white m-0">Placement Readiness Engine</h3>
            <p className="text-xs text-[#a9b49c] leading-relaxed m-0">
              Calculates your interview odds formula, tracks pace against your target offer deadline, and benchmarks topic mastery across all 25 curriculum categories.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-2xl p-5 flex flex-col gap-2.5 shadow-sm hover:border-[#6c8240] transition-all">
            <div className="size-8 rounded-lg bg-[#4d5d2c]/40 border border-[#6c8240]/40 flex items-center justify-center text-[#c2d6a4]">
              <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="14" x="2" y="7" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white m-0">Placement Pipeline Tracker</h3>
            <p className="text-xs text-[#a9b49c] leading-relaxed m-0">
              Track applications across Wishlist, OA, Technical Rounds, and Offers with compensation metrics, date milestones, and custom feedback notes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-2xl p-5 flex flex-col gap-2.5 shadow-sm hover:border-[#6c8240] transition-all">
            <div className="size-8 rounded-lg bg-[#4d5d2c]/40 border border-[#6c8240]/40 flex items-center justify-center text-[#c2d6a4]">
              <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="16" height="20" x="4" y="2" rx="2" />
                <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white m-0">Company-Specific Tracks</h3>
            <p className="text-xs text-[#a9b49c] leading-relaxed m-0">
              Filter curriculum problems directly by target companies: Google, Amazon, Microsoft, Meta, Uber, and Apple with high-frequency tags.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-2xl p-5 flex flex-col gap-2.5 shadow-sm hover:border-[#6c8240] transition-all">
            <div className="size-8 rounded-lg bg-[#4d5d2c]/40 border border-[#6c8240]/40 flex items-center justify-center text-[#c2d6a4]">
              <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white m-0">Campus &amp; Squad Cohorts</h3>
            <p className="text-xs text-[#a9b49c] leading-relaxed m-0">
              Create or join private 6-character code cohorts to compare streaks, solve count, and leaderboard ranks with your college batch or squad.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-2xl p-5 flex flex-col gap-2.5 shadow-sm hover:border-[#6c8240] transition-all">
            <div className="size-8 rounded-lg bg-[#4d5d2c]/40 border border-[#6c8240]/40 flex items-center justify-center text-[#c2d6a4]">
              <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white m-0">Enterprise Cloud Persistence</h3>
            <p className="text-xs text-[#a9b49c] leading-relaxed m-0">
              All progress is synced directly to your secure Supabase cloud database with zero lock-in. One-click JSON backup and data exports anytime.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-2xl p-5 flex flex-col gap-2.5 shadow-sm hover:border-[#6c8240] transition-all">
            <div className="size-8 rounded-lg bg-[#4d5d2c]/40 border border-[#6c8240]/40 flex items-center justify-center text-[#c2d6a4]">
              <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="10" x2="14" y1="2" y2="2" />
                <line x1="12" x2="15" y1="14" y2="11" />
                <circle cx="12" cy="14" r="8" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white m-0">Deep-Work Practice Timer</h3>
            <p className="text-xs text-[#a9b49c] leading-relaxed m-0">
              Built-in 25m, 45m, and 60m focus blocks that persist across page navigation to enforce live timed interview problem-solving discipline.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. STRUCTURED 5-PHASE CURRICULUM ACCORDION                                 */}
      {/* ========================================================================= */}
      <section id="curriculum" className="max-w-4xl mx-auto px-5 pb-20">
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono uppercase font-bold text-[#a3b384] tracking-wider block mb-1">
            20 Weeks · 140 Days · 332 Problems
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Structured Algorithmic Syllabus
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {/* Phase 1 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-2xl overflow-hidden transition-all">
            <div
              onClick={() => toggleAccordion(1)}
              className="p-4 sm:p-4.5 flex items-center justify-between cursor-pointer select-none hover:bg-[#202b17] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#2e3e1e] text-[#c2d6a4] border border-[#4d5d2c]">
                  Weeks 1-5
                </span>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-white">
                    Linear Foundations &amp; Core Pointers
                  </div>
                  <div className="text-[11px] text-[#a9b49c]">Arrays, Two Pointers, Sliding Window, Prefix Sums &amp; Hash Maps</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-[#a9b49c] font-mono">65 problems</span>
                <svg
                  className={`size-4 text-[#a9b49c] transition-transform duration-300 ${
                    openPhase === 1 ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            {openPhase === 1 && (
              <div className="p-4 sm:p-5 border-t border-[#243118] bg-[#141b0e] text-xs">
                <p className="text-xs text-[#a9b49c] mb-3 leading-relaxed">
                  Master core patterns tested in 70% of technical phone screens. Eliminates brute-force O(N^2) habits.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    Opposite &amp; Fast/Slow Pointers
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    Dynamic &amp; Fixed Sliding Window
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    Prefix Sums &amp; Frequency Counting
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    Monotonic Stack / Queue
                  </span>
                </div>
                <div className="text-[11px] text-[#a9b49c]">
                  <strong className="text-white">Key Benchmarks:</strong> 3Sum (LC 15) • Longest Substring (LC 3) • Daily Temperatures (LC 739) • Trapping Rain Water (LC 42)
                </div>
              </div>
            )}
          </div>

          {/* Phase 2 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-2xl overflow-hidden transition-all">
            <div
              onClick={() => toggleAccordion(2)}
              className="p-4 sm:p-4.5 flex items-center justify-between cursor-pointer select-none hover:bg-[#202b17] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#2e3e1e] text-[#c2d6a4] border border-[#4d5d2c]">
                  Weeks 6-10
                </span>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-white">
                    Hierarchical &amp; Graph Algorithms
                  </div>
                  <div className="text-[11px] text-[#a9b49c]">Binary Trees, BSTs, BFS/DFS, Topological Sort &amp; Shortest Path</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-[#a9b49c] font-mono">75 problems</span>
                <svg
                  className={`size-4 text-[#a9b49c] transition-transform duration-300 ${
                    openPhase === 2 ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            {openPhase === 2 && (
              <div className="p-4 sm:p-5 border-t border-[#243118] bg-[#141b0e] text-xs">
                <p className="text-xs text-[#a9b49c] mb-3 leading-relaxed">
                  Deconstruct complex tree traversals and graph algorithms into reusable recursive and iterative mental models.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    Tree DFS &amp; Path Sum
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    Connected Components (Flood Fill)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    Topological Sort (Kahn's Algorithm)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    Dijkstra &amp; Shortest Path
                  </span>
                </div>
                <div className="text-[11px] text-[#a9b49c]">
                  <strong className="text-white">Key Benchmarks:</strong> Lowest Common Ancestor (LC 236) • Course Schedule (LC 207) • Number of Islands (LC 200) • Word Ladder (LC 127)
                </div>
              </div>
            )}
          </div>

          {/* Phase 3 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-2xl overflow-hidden transition-all">
            <div
              onClick={() => toggleAccordion(3)}
              className="p-4 sm:p-4.5 flex items-center justify-between cursor-pointer select-none hover:bg-[#202b17] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#2e3e1e] text-[#c2d6a4] border border-[#4d5d2c]">
                  Weeks 11-15
                </span>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-white">
                    Dynamic Programming &amp; Memoization
                  </div>
                  <div className="text-[11px] text-[#a9b49c]">1D/2D DP, Subsequences, Knapsack &amp; State Transitions</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-[#a9b49c] font-mono">65 problems</span>
                <svg
                  className={`size-4 text-[#a9b49c] transition-transform duration-300 ${
                    openPhase === 3 ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            {openPhase === 3 && (
              <div className="p-4 sm:p-5 border-t border-[#243118] bg-[#141b0e] text-xs">
                <p className="text-xs text-[#a9b49c] mb-3 leading-relaxed">
                  Demystify DP by learning state definitions and recurrence transitions rather than memorizing solutions.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    0/1 Knapsack &amp; Unbounded
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    Longest Common Subsequence (LCS)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    State Machine DP
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    Interval DP
                  </span>
                </div>
                <div className="text-[11px] text-[#a9b49c]">
                  <strong className="text-white">Key Benchmarks:</strong> Coin Change (LC 322) • Longest Increasing Subsequence (LC 300) • Edit Distance (LC 72) • Target Sum (LC 494)
                </div>
              </div>
            )}
          </div>

          {/* Phase 4 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-2xl overflow-hidden transition-all">
            <div
              onClick={() => toggleAccordion(4)}
              className="p-4 sm:p-4.5 flex items-center justify-between cursor-pointer select-none hover:bg-[#202b17] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#2e3e1e] text-[#c2d6a4] border border-[#4d5d2c]">
                  Weeks 16-18
                </span>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-white">
                    Architecture &amp; System Design Foundations
                  </div>
                  <div className="text-[11px] text-[#a9b49c]">Distributed Caching, Rate Limiting, Partitioning &amp; Resiliency</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-[#a9b49c] font-mono">28 problems</span>
                <svg
                  className={`size-4 text-[#a9b49c] transition-transform duration-300 ${
                    openPhase === 4 ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            {openPhase === 4 && (
              <div className="p-4 sm:p-5 border-t border-[#243118] bg-[#141b0e] text-xs">
                <p className="text-xs text-[#a9b49c] mb-3 leading-relaxed">
                  Bridge algorithmic thinking with high-throughput distributed system design evaluated in senior loops.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    Token Bucket &amp; Leaky Bucket
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    Consistent Hashing &amp; Rings
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1f2b16] border border-[#354823] text-[#dbe6cf]">
                    Cache-Aside &amp; Write-Through
                  </span>
                </div>
                <div className="text-[11px] text-[#a9b49c]">
                  <strong className="text-white">Key Benchmarks:</strong> TinyURL • Distributed Rate Limiter • Key-Value Store with LSM
                </div>
              </div>
            )}
          </div>

          {/* Phase 5 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-2xl overflow-hidden transition-all">
            <div
              onClick={() => toggleAccordion(5)}
              className="p-4 sm:p-4.5 flex items-center justify-between cursor-pointer select-none hover:bg-[#202b17] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#2e3e1e] text-[#c2d6a4] border border-[#4d5d2c]">
                  Weeks 19-20
                </span>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-white">
                    Offer Sprint &amp; Timed Mock Pressure
                  </div>
                  <div className="text-[11px] text-[#a9b49c]">High-Frequency Speedruns, Top 150 Benchmarks &amp; Mock Interviews</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-[#a9b49c] font-mono">74 problems</span>
                <svg
                  className={`size-4 text-[#a9b49c] transition-transform duration-300 ${
                    openPhase === 5 ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            {openPhase === 5 && (
              <div className="p-4 sm:p-5 border-t border-[#243118] bg-[#141b0e] text-xs">
                <p className="text-xs text-[#a9b49c] mb-3 leading-relaxed">
                  Simulate live interview pressure under strict 45-minute constraints. Focuses exclusively on top company-tagged variants.
                </p>
                <div className="text-[11px] text-[#a9b49c]">
                  <strong className="text-white">Key Benchmarks:</strong> LRU Cache (LC 146) • Median of Two Sorted Arrays (LC 4) • Merge k Sorted Lists (LC 23) • Alien Dictionary (LC 269)
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (FAQ)                                       */}
      {/* ========================================================================= */}
      <section id="faq" className="max-w-4xl mx-auto px-5 pb-24">
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono uppercase font-bold text-[#a3b384] tracking-wider block mb-1">
            Common Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* FAQ 1 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-xl overflow-hidden transition-all">
            <div
              onClick={() => toggleFaq(1)}
              className="p-4 flex items-center justify-between cursor-pointer font-semibold text-xs sm:text-sm text-white hover:bg-[#202b17] transition-colors"
            >
              <span>Why are there two different interfaces (Retro OS vs Modern Web)?</span>
              <svg
                className={`size-4 text-[#a9b49c] transition-transform duration-300 ${
                  openFaq === 1 ? 'rotate-180' : ''
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {openFaq === 1 && (
              <div className="px-4 pb-4 pt-1 text-xs text-[#a9b49c] leading-relaxed">
                Feedback showed users were passionately divided: some love the deep immersion of a 90s retro CRT window manager with chiptune audio, while others prefer the clean, minimalist modern web dashboard. We give you both running seamlessly on the exact same engine.
              </div>
            )}
          </div>

          {/* FAQ 2 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-xl overflow-hidden transition-all">
            <div
              onClick={() => toggleFaq(2)}
              className="p-4 flex items-center justify-between cursor-pointer font-semibold text-xs sm:text-sm text-white hover:bg-[#202b17] transition-colors"
            >
              <span>Does my progress transfer when I switch between interfaces?</span>
              <svg
                className={`size-4 text-[#a9b49c] transition-transform duration-300 ${
                  openFaq === 2 ? 'rotate-180' : ''
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {openFaq === 2 && (
              <div className="px-4 pb-4 pt-1 text-xs text-[#a9b49c] leading-relaxed">
                Yes, 100%. Both interfaces read and write from the exact same Supabase cloud database. When you mark a problem solved or update a note in Modern Web, it is immediately reflected when you launch Retro OS, and vice versa — in real-time.
              </div>
            )}
          </div>

          {/* FAQ 3 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-xl overflow-hidden transition-all">
            <div
              onClick={() => toggleFaq(3)}
              className="p-4 flex items-center justify-between cursor-pointer font-semibold text-xs sm:text-sm text-white hover:bg-[#202b17] transition-colors"
            >
              <span>How is my progress stored and synchronized across devices?</span>
              <svg
                className={`size-4 text-[#a9b49c] transition-transform duration-300 ${
                  openFaq === 3 ? 'rotate-180' : ''
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {openFaq === 3 && (
              <div className="px-4 pb-4 pt-1 text-xs text-[#a9b49c] leading-relaxed">
                GrindOS uses direct cloud synchronization backed by Supabase. Your solved problems, notes, streaks, and interview pipelines are securely synchronized across any device in real-time, with one-click full JSON export available anytime.
              </div>
            )}
          </div>

          {/* FAQ 4 */}
          <div className="bg-[#1a2312] border border-[#354823] rounded-xl overflow-hidden transition-all">
            <div
              onClick={() => toggleFaq(4)}
              className="p-4 flex items-center justify-between cursor-pointer font-semibold text-xs sm:text-sm text-white hover:bg-[#202b17] transition-colors"
            >
              <span>How does the Placement Readiness algorithm work?</span>
              <svg
                className={`size-4 text-[#a9b49c] transition-transform duration-300 ${
                  openFaq === 4 ? 'rotate-180' : ''
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {openFaq === 4 && (
              <div className="px-4 pb-4 pt-1 text-xs text-[#a9b49c] leading-relaxed">
                Your readiness percentage is calculated from 4 transparent factors: Problem Coverage (40%), Streak Consistency (25%), Pace vs Target Deadline (25%), and Topic Breadth (10%).
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. EXACT MEADOW RISE INTERACTIVE FOOTER                                    */}
      {/* ========================================================================= */}
      <MeadowRiseFooterExact
        onStartFree={() => setIsAuthModalOpen(true)}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onOpenDemoChoice={() => setIsDemoModalOpen(true)}
        onNavigate={(path) => navigate(path)}
        authUser={authUser}
        operatorName={userProfile.name}
        seed={7}
      />

      {/* ========================================================================= */}
      {/* 10. MODALS (AUTHENTICATION, PRICING, WORKSTATION DEMO CHOICE)             */}
      {/* ========================================================================= */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab="signin"
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />

      <DemoChoiceModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
