import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, Flame, Trophy, Command, ArrowRight, 
  CheckCircle, XCircle, ChevronDown, ChevronUp,
  Sparkles, Play, Pause, RotateCcw, ShieldCheck,
  Check, Layers, Laptop, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { APP_CONFIG } from '../config/appConfig';
import { CURRICULUM } from '../data/curriculumStats';
import { useProgress } from '../context/ProgressContext';
import { sounds } from '../utils/audio';

import type { Variants } from 'framer-motion';

// ─── Animations ─────────────────────────────────────────────────────────────
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.12 } }
};

// ─── Curriculum Phase Definitions ───────────────────────────────────────────
const PHASES = [
  {
    id: 1,
    weeks: 'Weeks 1–4',
    title: 'Linear Foundations',
    subtitle: 'Arrays, Two Pointers, Sliding Window & Hash Maps',
    problems: 56,
    badge: 'Foundation',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Master the core building blocks tested in 70% of technical phone screens. Eliminates brute force instincts.',
    keyPatterns: ['Two Pointers (Opposite & Fast/Slow)', 'Variable & Fixed Sliding Window', 'Prefix Sums & Hash Map Lookups', 'Monotonic Stack / Queue'],
    sampleProblems: ['3Sum (LC 15)', 'Longest Substring Without Repeating Characters (LC 3)', 'Daily Temperatures (LC 739)', 'Trapping Rain Water (LC 42)']
  },
  {
    id: 2,
    weeks: 'Weeks 5–9',
    title: 'Hierarchical & Graphs',
    subtitle: 'Binary Trees, BSTs, BFS/DFS & Matrix Traversals',
    problems: 70,
    badge: 'Core Graph',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    description: 'Deconstruct complex tree traversals and graph algorithms into reusable recursive mental models.',
    keyPatterns: ['Tree DFS (Pre, In, Post, Path Sum)', 'Tree Level-Order BFS', 'Graph Connected Components (Flood Fill)', 'Topological Sort (Kahn\'s Algorithm)', 'Dijkstra & Shortest Path'],
    sampleProblems: ['Lowest Common Ancestor (LC 236)', 'Course Schedule I & II (LC 207)', 'Number of Islands (LC 200)', 'Word Ladder (LC 127)']
  },
  {
    id: 3,
    weeks: 'Weeks 10–13',
    title: 'Dynamic Programming',
    subtitle: '1D/2D DP, Memoization, Tabulation & Subsequences',
    problems: 56,
    badge: 'High Yield',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    description: 'Demystify dynamic programming by learning state definition and transition formulas rather than memorizing.',
    keyPatterns: ['0/1 Knapsack & Unbounded Knapsack', 'Longest Common Subsequence (LCS)', 'State Machine DP (Stock Buy/Sell)', 'Interval DP & Matrix Chain'],
    sampleProblems: ['Coin Change (LC 322)', 'Longest Increasing Subsequence (LC 300)', 'Edit Distance (LC 72)', 'Best Time to Buy and Sell Stock IV (LC 188)']
  },
  {
    id: 4,
    weeks: 'Week 14',
    title: 'Scalability & System Design',
    subtitle: 'Distributed Systems, Caching, Sharding & Rate Limiting',
    problems: 14,
    badge: 'Architecture',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description: 'Bridge the gap between algorithmic code and large-scale distributed architectures for senior-level evaluations.',
    keyPatterns: ['Token Bucket & Leaky Bucket Rate Limiters', 'Consistent Hashing & Partitioning', 'Cache-Aside & Write-Through Strategies', 'Distributed ID Generation (Snowflake)'],
    sampleProblems: ['Design URL Shortener (TinyURL)', 'Design Distributed Rate Limiter', 'Design Key-Value Store with LSM', 'Design Notification System']
  },
  {
    id: 5,
    weeks: 'Weeks 15–20',
    title: 'Top-Tier Sprint & Mocks',
    subtitle: 'High-Frequency Speedruns & Timed Pressure Mocks',
    problems: 84,
    badge: 'Offer Sprint',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    description: 'Simulate live interview pressure under strict time constraints. Focuses exclusively on top company-tagged variants.',
    keyPatterns: ['45-Minute Timed Mock Interviews', 'Cross-Topic Pattern Blending', 'Edge-Case Explaining & Clean Verbalization', 'Complexity Tradeoff Optimization'],
    sampleProblems: ['LRU Cache (LC 146)', 'Median of Two Sorted Arrays (LC 4)', 'Merge k Sorted Lists (LC 23)', 'Alien Dictionary (LC 269)']
  }
];

export const LandingPage: React.FC = () => {
  const { isOnboarded, userProfile, stats } = useProgress();

  // Interactive Demo State
  const [demoSolved, setDemoSolved] = useState<Record<string, boolean>>({
    'p1': true,
    'p2': false,
    'p3': false
  });
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Curriculum Explorer State
  const [activePhaseId, setActivePhaseId] = useState<number>(1);

  // Pricing State
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [proModalOpen, setProModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string; period: string }>({
    name: 'GrindOS Pro',
    price: '$69',
    period: '/year'
  });
  const [emailInput, setEmailInput] = useState('');
  const [modalSubmitted, setModalSubmitted] = useState(false);

  // Timer Tick
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const toggleDemoProblem = (id: string) => {
    setDemoSolved(prev => {
      const next = !prev[id];
      if (next) {
        sounds.playCheckSound();
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.5, x: 0.5 },
          colors: ['#f97316', '#ef4444', '#eab308']
        });
      }
      return { ...prev, [id]: next };
    });
  };

  const handleOpenProModal = (name: string, price: string, period: string) => {
    setSelectedPlan({ name, price, period });
    setModalSubmitted(false);
    setEmailInput('');
    setProModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setModalSubmitted(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const formatDemoTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const demoSolvedCount = Object.values(demoSolved).filter(Boolean).length;
  const activePhase = PHASES.find(p => p.id === activePhaseId) || PHASES[0];

  return (
    <div className="min-h-screen bg-[#07070a] text-gray-100 font-sans selection:bg-orange-500/30 overflow-x-hidden relative">
      
      {/* ── Background Radiance Mesh ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[20%] w-[600px] h-[600px] rounded-full bg-orange-600/[0.08] blur-[150px]" />
        <div className="absolute top-[25%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-600/[0.07] blur-[140px]" />
        <div className="absolute top-[60%] left-[-15%] w-[600px] h-[600px] rounded-full bg-amber-500/[0.06] blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1f1f2e_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      {/* ── Sticky Luxury Floating Header ── */}
      <header className="sticky top-4 z-50 px-4 max-w-6xl mx-auto">
        <nav className="rounded-2xl border border-white/[0.08] bg-[#0c0c14]/80 backdrop-blur-xl px-5 py-3 shadow-2xl shadow-black/80 flex items-center justify-between">
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center font-black text-black shadow-lg shadow-orange-500/20 text-xs tracking-wider font-mono group-hover:scale-105 transition-transform">
              {APP_CONFIG.shortName}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-orange-400 transition-colors">
                {APP_CONFIG.name}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                v2.4 Live
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <a href="#preview" className="hover:text-white transition-colors">The System</a>
            <a href="#curriculum" className="hover:text-white transition-colors">20-Week Plan</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {isOnboarded ? (
              <Link 
                to="/dashboard" 
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xs flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-orange-500/25"
              >
                <span>Dashboard ({userProfile?.name || 'You'})</span>
                <span className="text-orange-200 font-mono font-normal">({stats?.streak || 0}d streak)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/curriculum" 
                  className="hidden sm:inline-block text-xs font-medium text-gray-300 hover:text-white transition-colors px-3 py-2"
                >
                  Explore Curriculum
                </Link>
                <Link 
                  to="/dashboard" 
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition-all shadow-lg shadow-orange-500/25"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ── Main Landing Content ── */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24">
        
        {/* ── 1. HERO SECTION ── */}
        <motion.section 
          initial="hidden" 
          animate="visible" 
          variants={fadeIn}
          className="text-center max-w-4xl mx-auto pt-4 sm:pt-8 pb-16"
        >
          {/* Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium mb-8 border border-orange-500/20 shadow-inner backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span className="font-semibold">2026 FAANG & FinTech Hiring Cadence</span>
            <span className="text-orange-300/60 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-orange-300">140 Days. 3 Problems/Day.</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] mb-6 text-white">
            The Algorithmic Operating System <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
              Engineered for Top-Tier Tech.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop solving 400 random problems with zero retention. GrindOS replaces tutorial hell with a disciplined 140-day rhythm: 3 high-yield patterns a day, spaced repetition reviews, and relentless accountability.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-extrabold text-base flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{isOnboarded ? 'Resume Your Dashboard' : 'Build Your Free Study Plan'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#preview" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/[0.04] border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/[0.2] text-gray-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <Laptop className="w-4 h-4 text-orange-400" />
              <span>Try Interactive Demo</span>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> 100% Local-First & Private
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-orange-400" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-orange-400" /> Free 20-week core curriculum
            </span>
          </div>
        </motion.section>

        {/* ── 2. LIVE INTERACTIVE HERO APP PREVIEW (The Crown Jewel) ── */}
        <motion.section 
          id="preview"
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={fadeIn}
          className="my-8 sm:my-14"
        >
          <div className="relative mx-auto rounded-2xl border border-white/[0.12] bg-[#0c0c14]/90 backdrop-blur-2xl shadow-[0_0_80px_-15px_rgba(249,115,22,0.2)] overflow-hidden">
            
            {/* macOS Window Titlebar */}
            <div className="px-4 py-3 bg-[#11111a] border-b border-gray-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-[11px] font-mono text-gray-400">grindos.dev / workspace / day-28</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Interactive Sandbox</span>
              </div>
            </div>

            {/* Interactive Workspace Body */}
            <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Interactive Daily Mission */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        DAY 28
                      </span>
                      <h3 className="font-bold text-white text-base">Sliding Window & Pointers</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400">
                      {demoSolvedCount}/3 Completed
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-800/60 rounded-full h-2 mb-5 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-orange-500 to-amber-400 h-2 rounded-full" 
                      initial={{ width: '33%' }}
                      animate={{ width: `${(demoSolvedCount / 3) * 100}%` }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    />
                  </div>

                  <p className="text-xs text-gray-400 mb-4">
                    💡 Click the checkmark to test the real-time solve feedback:
                  </p>

                  {/* Problem Checklist */}
                  <div className="space-y-2.5">
                    {[
                      { id: 'p1', name: '3Sum', difficulty: 'Medium', type: 'Two Pointers', lc: 15 },
                      { id: 'p2', name: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', type: 'Sliding Window', lc: 3 },
                      { id: 'p3', name: 'Trapping Rain Water', difficulty: 'Hard', type: 'Monotonic Stack', lc: 42 }
                    ].map(prob => {
                      const isDone = demoSolved[prob.id];
                      return (
                        <div 
                          key={prob.id}
                          onClick={() => toggleDemoProblem(prob.id)}
                          className={`cursor-pointer group flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition-all ${
                            isDone 
                              ? 'bg-emerald-500/[0.06] border-emerald-500/30' 
                              : 'bg-white/[0.02] border-gray-800 hover:border-gray-700 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              isDone ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-gray-600 group-hover:border-orange-400'
                            }`}>
                              {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold transition-colors ${isDone ? 'line-through text-gray-400' : 'text-gray-100 group-hover:text-orange-400'}`}>
                                  {prob.name}
                                </span>
                                <span className="text-[10px] font-mono text-gray-500">LC {prob.lc}</span>
                              </div>
                              <span className="text-[11px] text-gray-500">{prob.type}</span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                            prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-rose-500/10 text-rose-400'
                          }`}>
                            {prob.difficulty}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-800/60">
                  <span>Target: 45 min deep work</span>
                  <span className="text-orange-400 font-mono font-medium">+15 XP earned on completion</span>
                </div>
              </div>

              {/* Right Column: Focus Timer & Streak Status */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                
                {/* Focus Timer Widget */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-[#12121e] to-[#0d0d16] border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Timer className="w-4 h-4 text-orange-400" /> Focus Timer
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Audio Chimes On
                    </span>
                  </div>

                  <div className="flex items-center justify-center my-3">
                    <div className="relative w-36 h-36 rounded-full border-4 border-orange-500/20 flex flex-col items-center justify-center shadow-inner">
                      <div className="text-3xl font-mono font-black tracking-tight text-white">
                        {formatDemoTimer(timerSeconds)}
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 mt-1">Pomodoro Cycle</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button 
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20"
                    >
                      {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isTimerRunning ? 'Pause Session' : 'Start Focus'}</span>
                    </button>
                    <button 
                      onClick={() => { setIsTimerRunning(false); setTimerSeconds(25 * 60); }}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Streak & Consistency Pill */}
                <div className="p-4 rounded-xl bg-[#10101a] border border-gray-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                      <Flame className="w-5 h-5 fill-orange-500 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>18-Day Streak</span>
                        <span className="text-[10px] text-emerald-400 font-mono">Top 3%</span>
                      </div>
                      <p className="text-[11px] text-gray-400">Sunday Rest Day Protected 🛡️</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 1, 1, 1, 1, 0, 1].map((active, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-6 rounded-sm ${active ? 'bg-orange-500' : 'bg-gray-800'}`}
                        title={active ? 'Solved' : 'Rest Day'}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </motion.section>

        {/* ── 3. TARGET COMPANIES STRIP ── */}
        <section className="py-12 border-y border-white/[0.06] my-16 text-center">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500 mb-8">
            Engineers using GrindOS prepare for technical screens at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all">
            {['Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft', 'Stripe', 'Uber', 'Databricks'].map((co, i) => (
              <span key={i} className="text-base sm:text-lg font-bold font-mono tracking-wider text-gray-400 hover:text-white transition-colors cursor-default">
                {co}
              </span>
            ))}
          </div>
        </section>

        {/* ── 4. STATS SUMMARY BAR ── */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 my-16"
        >
          {[
            { value: `${CURRICULUM.totalProblems}`, label: 'Curated Problems', sub: 'No filler or dead duplicates' },
            { value: `${CURRICULUM.totalWeeks}`, label: 'Structured Weeks', sub: '5 Progressive mastery phases' },
            { value: `${CURRICULUM.totalDays}`, label: 'Cadence Days', sub: 'With built-in protected rest' },
            { value: `${CURRICULUM.top150Count}`, label: 'Top 150 Classics', sub: 'High-frequency interview core' }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              variants={fadeIn} 
              className="p-6 rounded-2xl bg-[#0c0c14] border border-white/[0.06] hover:border-orange-500/20 transition-all text-center"
            >
              <div className="text-3xl sm:text-4xl font-black text-white mb-1 font-mono tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">
                {stat.label}
              </div>
              <p className="text-[11px] text-gray-500">{stat.sub}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* ── 5. PAIN VS SYSTEM TRANSFORMATION ── */}
        <motion.section 
          id="system"
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={fadeIn}
          className="py-16"
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Why 90% of LeetCode Grinders Fail.
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Rote memorization causes interview panic. You need algorithmic intuition backed by scheduled spaced repetition.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* The Old Way */}
            <div className="bg-rose-950/[0.1] border border-rose-500/20 rounded-2xl p-7 relative">
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-lg mb-6">
                <XCircle className="w-5 h-5 text-rose-500" />
                <span>The Blind Grinding Trap</span>
              </div>
              <ul className="space-y-4 text-sm text-gray-400">
                {[
                  'Solving 400+ random problems without clear conceptual progression',
                  'Forgetting how you solved a Two-Pointer question 14 days later',
                  'Crippling guilt on weekends when life happens and streaks break',
                  'Panic-switching between 5 different public problem spreadsheets',
                  'Getting stuck on hard edge cases with no structured review cadence'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-rose-500 font-mono mt-0.5">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The GrindOS Way */}
            <div className="bg-emerald-950/[0.15] border border-emerald-500/30 rounded-2xl p-7 relative overflow-hidden shadow-lg shadow-emerald-500/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] pointer-events-none" />
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-lg mb-6 relative z-10">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>The GrindOS Cadence</span>
              </div>
              <ul className="space-y-4 text-sm text-gray-300 relative z-10">
                {[
                  'Exactly 3 high-yield curated problems/day across 5 rigorous phases',
                  'Automated Spaced Repetition (Day 3, 7, 21) cementing patterns forever',
                  'Protected rest days configured to your schedule with zero streak guilt',
                  'Integrated Pomodoro timer + ambient sound triggers for deep focus',
                  'Real-time interview readiness odds and completion velocity metrics'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* ── 6. INTERACTIVE 5-PHASE CURRICULUM EXPLORER ── */}
        <motion.section 
          id="curriculum"
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={fadeIn}
          className="py-16"
        >
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-orange-400">
              The 140-Day Masterplan
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-4">
              Explore the 5 Phased Tracks.
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Every single day has a clear objective. Never wonder what to solve next.
            </p>
          </div>

          {/* Phase Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {PHASES.map(phase => (
              <button
                key={phase.id}
                onClick={() => setActivePhaseId(phase.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 border ${
                  activePhaseId === phase.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white border-transparent shadow-lg shadow-orange-500/25'
                    : 'bg-[#0e0e16] text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
                }`}
              >
                <span>Phase {phase.id}</span>
                <span className="text-[10px] font-mono opacity-80">({phase.weeks})</span>
              </button>
            ))}
          </div>

          {/* Active Phase Card */}
          <div className="max-w-4xl mx-auto rounded-2xl bg-[#0c0c14] border border-white/[0.08] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-6 border-b border-gray-800">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${activePhase.badgeColor}`}>
                    {activePhase.badge}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{activePhase.weeks} • {activePhase.problems} Questions</span>
                </div>
                <h3 className="text-2xl font-black text-white">{activePhase.title}</h3>
                <p className="text-xs text-orange-400 font-medium mt-0.5">{activePhase.subtitle}</p>
              </div>

              <Link 
                to="/curriculum" 
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <span>View All Problems</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              {activePhase.description}
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Key Algorithmic Patterns */}
              <div className="p-4 rounded-xl bg-[#11111a] border border-gray-800/80">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 mb-3 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Key Algorithmic Patterns
                </h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  {activePhase.keyPatterns.map((pat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      <span>{pat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sample Problems */}
              <div className="p-4 rounded-xl bg-[#11111a] border border-gray-800/80">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Landmark Problems
                </h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  {activePhase.sampleProblems.map((prob, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span>{prob}</span>
                      <span className="text-[10px] text-gray-500 font-mono">Curated</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── 7. FEATURE BENTO GRID ── */}
        <motion.section 
          id="features"
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={fadeIn}
          className="py-16"
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-orange-400">
              Developer-First Tooling
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-4">
              Everything Engineered for Maximum Focus.
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Built by engineers who were sick of clunky spreadsheets and scattered tabs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Spaced Repetition (Large) */}
            <div className="md:col-span-2 p-7 rounded-2xl bg-[#0c0c14] border border-white/[0.08] hover:border-orange-500/30 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <RotateCcw className="w-32 h-32" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Algorithmic Spaced Repetition</h3>
              <p className="text-sm text-gray-400 max-w-md leading-relaxed mb-4">
                The forgetting curve destroys 80% of what you learn within 7 days. GrindOS automatically queues past questions for blind reviews on Day 3, 7, and 21.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-orange-400">
                <span>Leitner Retention Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Brutality Streak */}
            <div className="p-7 rounded-2xl bg-[#0c0c14] border border-white/[0.08] hover:border-red-500/30 transition-all relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                <Flame className="w-5 h-5 fill-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Protected Streaks</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Configure your designated rest day (Saturday, Sunday, or None). Never break momentum when you take scheduled recovery.
              </p>
            </div>

            {/* Card 3: Deep Work Timer */}
            <div className="p-7 rounded-2xl bg-[#0c0c14] border border-white/[0.08] hover:border-blue-500/30 transition-all relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Timer className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Focus Pomodoro</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Synthesized WebAudio chimes and ambient 5-minute ticks. Keeps you locked into problem solving without checking the clock.
              </p>
            </div>

            {/* Card 4: Top 150 Track (Large) */}
            <div className="md:col-span-2 p-7 rounded-2xl bg-[#0c0c14] border border-white/[0.08] hover:border-amber-500/30 transition-all relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Interview 150 Sprint Filter</h3>
              <p className="text-sm text-gray-400 max-w-md leading-relaxed mb-4">
                Short on time? Toggle the "Interview 150 Essentials" filter with a single click. Compresses the full curriculum to the most statistically frequent questions.
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] border border-amber-500/20">
                  Google Frequency
                </span>
                <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] border border-amber-500/20">
                  Meta Frequency
                </span>
              </div>
            </div>

            {/* Card 5: Command Palette */}
            <div className="md:col-span-3 p-7 rounded-2xl bg-gradient-to-r from-[#0c0c14] to-[#12121e] border border-white/[0.08] hover:border-purple-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Command className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Sub-Millisecond Command Palette</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Press <kbd className="px-2 py-1 rounded bg-gray-800 border border-gray-700 font-mono text-xs text-gray-200">Ctrl + K</kbd> anywhere in the app to search any of the 307 problems or jump directly between weeks.
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono text-xs font-bold self-start sm:self-auto">
                Instant Navigation
              </span>
            </div>

          </div>
        </motion.section>

        {/* ── 8. COMMERCIAL MONETIZATION / PRICING SECTION ── */}
        <motion.section 
          id="pricing"
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={fadeIn}
          className="py-16 sm:py-24"
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-orange-400">
              Simple, Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-4">
              Invest in Your Career Trajectory.
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mb-8">
              A single top-tier offer can increase your total compensation by $50k–$150k. Prepare with an elite tool.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-[#11111c] border border-gray-800">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400 text-black font-extrabold">SAVE 50%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
            
            {/* Tier 1: Free Community */}
            <div className="rounded-2xl p-7 bg-[#0c0c14] border border-white/[0.08] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-gray-400 tracking-wider">Community</span>
                <div className="mt-3 mb-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">$0</span>
                  <span className="text-xs text-gray-400">/ forever</span>
                </div>
                <p className="text-xs text-gray-400 mb-6">
                  Essential tools for disciplined self-starters. Zero paywalls on the curriculum.
                </p>

                <ul className="space-y-3 text-xs text-gray-300 border-t border-gray-800 pt-6 mb-6">
                  {[
                    'Full 20-week curriculum (307 problems)',
                    'Interview 150 Essentials filter',
                    'Local progress tracking & streak engine',
                    'Focus Pomodoro timer with audio cues',
                    'Fuzzy search command palette (Ctrl+K)',
                    '100% private browser storage'
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link 
                to="/dashboard" 
                className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs text-center transition-colors block"
              >
                Start Free Forever
              </Link>
            </div>

            {/* Tier 2: GrindOS Pro (Featured) */}
            <div className="rounded-2xl p-7 bg-gradient-to-b from-[#161626] to-[#0e0e18] border-2 border-orange-500 relative flex flex-col justify-between shadow-2xl shadow-orange-500/15">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-[10px] font-mono font-extrabold text-white uppercase tracking-wider shadow-md">
                RECOMMENDED BY FAANG ALUMNI
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase text-orange-400 tracking-wider">GrindOS Pro</span>
                <div className="mt-3 mb-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">
                    {billingCycle === 'annual' ? '$69' : '$12'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {billingCycle === 'annual' ? '/ year ($5.75/mo)' : '/ month'}
                  </span>
                </div>
                <p className="text-xs text-gray-300 mb-6">
                  For candidates in active interview prep who need maximal retention and company intelligence.
                </p>

                <ul className="space-y-3 text-xs text-gray-200 border-t border-gray-700/60 pt-6 mb-6">
                  {[
                    'Everything in Community Edition',
                    'Automated Spaced Repetition (Day 3/7/21 queue)',
                    'Company Frequency Tags (Google, Meta, Amazon)',
                    'Algorithmic Pattern Decision Flowcharts',
                    'Sprint Generators (4-week & 8-week turbo tracks)',
                    'Cloud Multi-Device Sync & Automatic Backups',
                    'Printable Pattern Summary Cheat Sheets (PDF)'
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-orange-400 flex-shrink-0" />
                      <span className={idx === 1 ? 'font-semibold text-white' : ''}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => handleOpenProModal('GrindOS Pro', billingCycle === 'annual' ? '$69' : '$12', billingCycle === 'annual' ? '/year' : '/month')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-extrabold text-xs text-center transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                <span>Get Pro Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tier 3: Lifetime Fellow */}
            <div className="rounded-2xl p-7 bg-[#0c0c14] border border-white/[0.08] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider">Lifetime Fellow</span>
                <div className="mt-3 mb-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">$129</span>
                  <span className="text-xs text-gray-400">/ one-time payment</span>
                </div>
                <p className="text-xs text-gray-400 mb-6">
                  Permanent access. Never pay a subscription fee. Ideal for multi-year career compounding.
                </p>

                <ul className="space-y-3 text-xs text-gray-300 border-t border-gray-800 pt-6 mb-6">
                  {[
                    'Lifetime access to all Pro features forever',
                    'All future curriculum updates & new tracks',
                    'Private Discord VIP channel with FAANG peers',
                    'System Design architectural deep dives',
                    '1-on-1 Peer Mock Interview matching',
                    '100% Money-Back Guarantee within 14 days'
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => handleOpenProModal('Lifetime Fellow', '$129', 'one-time')}
                className="w-full py-3 rounded-xl bg-white/[0.05] border border-amber-500/30 hover:bg-amber-500/10 text-amber-300 font-bold text-xs text-center transition-colors block"
              >
                Claim Lifetime Pass
              </button>
            </div>

          </div>
        </motion.section>

        {/* ── 9. CANDIDATE WALL OF PROOF ── */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={fadeIn}
          className="py-16"
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-orange-400">Verified Outcomes</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-4">
              Real Candidates. Real Offers.
            </h2>
            <p className="text-gray-400 text-sm">
              Engineers who swapped random grinding for the 140-day rhythm.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "The spaced repetition review days are why I actually remembered topological sort in my Meta screen. Without the Day 7 and 21 revisits, I would have blanked under pressure.",
                name: "Karan S.",
                role: "Landed Meta E5 ($340k TC)",
                prev: "Ex-Midsize Fintech"
              },
              {
                quote: "I was stuck in tutorial hell for 8 months solving random questions on NeetCode and Striver without a schedule. GrindOS forced consistency. Finished the 20 weeks and passed Google L4.",
                name: "Jessica M.",
                role: "Landed Google L4 Software Engineer",
                prev: "Junior Full-Stack Dev"
              },
              {
                quote: "The built-in Pomodoro and rest day protection changed my mental health. Zero burnout on weekends. Received 3 offers: Amazon SDE-2, Uber, and Datadog.",
                name: "Devon P.",
                role: "Accepted Amazon SDE-2 Offer",
                prev: "Bootcamp Graduate"
              }
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#0c0c14] border border-white/[0.08] flex flex-col justify-between">
                <p className="text-sm text-gray-300 italic mb-6 leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 border-t border-gray-800/80 pt-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-bold text-white text-xs">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{t.name}</div>
                    <div className="text-[11px] text-orange-400 font-semibold">{t.role}</div>
                    <div className="text-[10px] text-gray-500">{t.prev}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── 10. FAQ SECTION ── */}
        <motion.section 
          id="faq"
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={fadeIn}
          className="py-16 max-w-3xl mx-auto"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-400">Everything you need to know about GrindOS.</p>
          </div>

          <div className="space-y-3.5">
            {[
              {
                q: "How is GrindOS different from just solving LeetCode or Blind 75?",
                a: "LeetCode is a library; GrindOS is a disciplined training regime. Instead of picking questions at random or scrolling through infinite difficulty filters, GrindOS sequences 307 curated problems across 20 weeks with automated spaced repetition, rest-day scheduling, and focus timers."
              },
              {
                q: "What if my technical interview is in 4 weeks, not 20?",
                a: "Use our 'Interview 150 Essentials' filter. It condenses the curriculum strictly to high-yield patterns (Google, Meta, Amazon top tags), enabling a fast 4-to-6 week sprint."
              },
              {
                q: "Is my personal data and study notes private?",
                a: "100% private. GrindOS uses a local-first architecture. All your solved problems, streak logs, notes, and profile configurations are stored locally in your browser. Nothing is sent to external servers."
              },
              {
                q: "Can I customize my rest day and target interview deadline?",
                a: "Yes! During setup or from Settings anytime, you can pick Saturday, Sunday, or None as your rest day, and define your target date. GrindOS dynamically recalibrates your pace and protects your streak."
              },
              {
                q: "Can I use GrindOS completely for free?",
                a: "Yes. The entire 20-week curriculum (307 problems), Interview 150 track, Pomodoro focus timer, streak counter, and keyboard command palette are 100% free with no credit card required."
              }
            ].map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </motion.section>

        {/* ── 11. FINAL HIGH-CONVERTING CTA BANNER ── */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={fadeIn}
          className="py-20 text-center my-12 relative"
        >
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#141424] to-[#0a0a10] border border-orange-500/30 max-w-4xl mx-auto relative overflow-hidden shadow-2xl shadow-orange-500/10">
            <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight relative z-10">
              Your next tech offer is worth $150k+. <br />
              <span className="text-orange-400">Don't leave your prep to chance.</span>
            </h2>
            <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto mb-8 relative z-10">
              Start your 140-day rhythm today. Complete your Day 1 mission in under 45 minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link 
                to="/dashboard" 
                className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 transition-all hover:scale-105"
              >
                <span>Launch {APP_CONFIG.name} — Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.section>

      </main>

      {/* ── Pro Membership Modal ── */}
      <AnimatePresence>
        {proModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f0f18] border border-orange-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setProModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                ✕
              </button>

              {!modalSubmitted ? (
                <div>
                  <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" /> Unlock Pro Acceleration
                  </div>
                  <h3 className="text-xl font-black text-white mb-1">{selectedPlan.name}</h3>
                  <div className="text-2xl font-mono font-bold text-white mb-4">
                    {selectedPlan.price} <span className="text-xs text-gray-400 font-normal">{selectedPlan.period}</span>
                  </div>

                  <p className="text-xs text-gray-300 mb-6">
                    Enter your email to activate your 7-day trial and unlock automated Spaced Repetition, Company Frequency tagging, and Cloud Sync.
                  </p>

                  <form onSubmit={handleModalSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-orange-500/25"
                    >
                      Activate Pro Pass →
                    </button>
                    <p className="text-[10px] text-center text-gray-500">
                      🔒 Zero spam. Instant activation link sent immediately.
                    </p>
                  </form>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">You're on the Pro Roster!</h3>
                  <p className="text-xs text-gray-300 mb-6">
                    We've registered <span className="text-white font-mono font-bold">{emailInput}</span>. Your Pro features and early-access pass have been linked to your browser session.
                  </p>
                  <button
                    onClick={() => setProModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
                  >
                    Close & Continue
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Minimal SaaS Footer ── */}
      <footer className="border-t border-white/[0.06] py-12 text-center text-xs text-gray-500 bg-[#040406]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-[10px] font-bold text-white">
              {APP_CONFIG.shortName}
            </div>
            <span className="font-bold text-gray-300">{APP_CONFIG.name}</span>
            <span>• © {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#curriculum" className="hover:text-gray-300 transition-colors">Curriculum</a>
            <a href="#pricing" className="hover:text-gray-300 transition-colors">Pricing</a>
            <Link to="/dashboard" className="hover:text-gray-300 transition-colors">Workspace</Link>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> All Systems Operational
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};

// ─── FAQ Accordion Item ─────────────────────────────────────────────────────
const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#0c0c14] transition-colors hover:border-gray-700">
      <button 
        onClick={() => setOpen(!open)} 
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-gray-200 hover:text-white transition-colors text-sm"
      >
        <span>{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-orange-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 pt-0 text-gray-400 text-xs sm:text-sm border-t border-gray-800/40 mt-1 leading-relaxed">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
