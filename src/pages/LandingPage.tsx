import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Timer, ArrowRight, ChevronDown, ChevronUp,
  Check, Target, Building2, Briefcase, Users, Shield,
  Terminal, Sparkles, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { APP_CONFIG } from '../config/appConfig';
import { useProgress } from '../context/ProgressContext';
import { CURRICULUM } from '../data/curriculumStats';
import { sounds } from '../utils/audio';

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
  const { isOnboarded, userProfile, stats } = useProgress();

  const [demoSolved, setDemoSolved] = useState<Record<string, boolean>>({
    'p1': true,
    'p2': false,
    'p3': false
  });

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [openPhase, setOpenPhase] = useState<number | null>(1);

  const handleLaunch = (mode: 'os' | 'web') => {
    sounds.playTickSound();
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {/* ── TOP NAV ── */}
      <header className="site-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 'var(--radius-xs)',
            background: 'var(--text-primary)', color: 'var(--text-inverse)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 12, fontFamily: 'var(--font-mono)'
          }}>
            {APP_CONFIG.shortName}
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em', display: 'block' }}>
              {APP_CONFIG.name}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Dual-Engine Workstation
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="#curriculum" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }} className="hidden sm:inline">
            Curriculum
          </a>
          <a href="#compare" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }} className="hidden sm:inline">
            Compare
          </a>
          <a href="#features" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }} className="hidden sm:inline">
            Features
          </a>
          <a href="#faq" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }} className="hidden sm:inline">
            FAQ
          </a>

          {/* Direct interface launching triggers */}
          <button
            onClick={() => handleLaunch('os')}
            className="btn btn-default"
            style={{ fontSize: 12, padding: '5px 10px', fontFamily: 'var(--font-mono)' }}
            title="Launch in Retro Terminal OS format"
          >
            <Terminal size={12} /> OS Mode
          </button>

          <button
            onClick={() => handleLaunch('web')}
            className="btn btn-primary"
            style={{ fontSize: 12, padding: '5px 12px' }}
            title="Launch in Modern Web format"
          >
            <Sparkles size={12} /> Modern App
          </button>
        </div>
      </header>

      {/* ── HERO SECTION: DUAL FORK ── */}
      <section style={{ maxWidth: 1040, margin: '0 auto', padding: '60px 20px 40px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '4px 12px', borderRadius: 99,
          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20
        }}>
          <span style={{ color: 'var(--color-success-text)', fontWeight: 600 }}>● 100% Shared Database</span>
          <span style={{ color: 'var(--border-strong)' }}>•</span>
          <span>Two Complementary Interfaces</span>
          <span style={{ color: 'var(--border-strong)' }}>•</span>
          <span>Zero Data Silos</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5.2vw, 54px)', fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 auto 16px',
          maxWidth: 880, color: 'var(--text-primary)'
        }}>
          One Structured Syllabus.<br />Two Distinct Realities.
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--text-secondary)',
          lineHeight: 1.6, maxWidth: 680, margin: '0 auto 28px'
        }}>
          Master {CURRICULUM.totalProblems} curated algorithmic problems across {CURRICULUM.totalWeeks} disciplined weeks.
          Choose between the deep retro immersion of a 90s terminal OS, or the crisp efficiency of a modern engineering dashboard.
        </p>

        {/* User state resume banner if already has data */}
        {(stats.solvedCount > 0 || isOnboarded) && (
          <div style={{
            maxWidth: 720, margin: '0 auto 36px',
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', padding: '14px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12, textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
              }}>
                🔥
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Welcome back, {userProfile.name}!
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Day {stats.currentDay} / {CURRICULUM.totalDays} • {stats.solvedCount} of {stats.totalProblems} solved ({progressPct}%) {stats.streak > 0 && `• ${stats.streak}d streak`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => handleLaunch('os')}
                className="btn btn-default"
                style={{ fontSize: 12, padding: '6px 12px', fontFamily: 'var(--font-mono)' }}
              >
                <Terminal size={12} /> Resume in OS
              </button>
              <button
                onClick={() => handleLaunch('web')}
                className="btn btn-primary"
                style={{ fontSize: 12, padding: '6px 14px' }}
              >
                Resume in Modern <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ── THE EXPERIENCE FORK: DUAL INTERFACE CARDS ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24, textAlign: 'left', marginTop: 16
        }}>
          {/* OPTION 1: RETRO TERMINAL OS */}
          <div style={{
            background: '#040805',
            border: '2px solid #1a6b42',
            borderRadius: 'var(--radius-xl)',
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
                <div style={{ color: '#e8c35a' }}>[OK] 25 WEEKS / 178 DAYS INITIALIZED</div>
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

            <button
              onClick={() => handleLaunch('os')}
              style={{
                background: '#3ddc84', color: '#000',
                border: '1px solid #3ddc84',
                borderRadius: 6, padding: '12px 18px',
                fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <Terminal size={14} /> Launch Retro Terminal OS
            </button>
          </div>

          {/* OPTION 2: MODERN MINIMALIST WEB */}
          <div style={{
            background: 'var(--bg-card)',
            border: '2px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Modern Badge */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16
              }}>
                <span style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
                  padding: '2px 8px', borderRadius: 4,
                  background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                  border: '1px solid var(--border-strong)'
                }}>
                  MODERN DASHBOARD
                </span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  LINEAR • HIGH DENSITY
                </span>
              </div>

              <h2 style={{
                fontSize: 22, fontWeight: 800, color: 'var(--text-primary)',
                margin: '0 0 8px', letterSpacing: '-0.02em'
              }}>
                Cadence Pro Web
              </h2>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 20px' }}>
                For engineers who prefer a sleek executive developer dashboard, luminous telemetry charts, GitHub-style heatmaps, and structured Kanban tracking.
              </p>

              {/* Modern Card Graphic */}
              <div style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                borderRadius: 6, padding: '12px 14px', marginBottom: 20,
                fontSize: 11, color: 'var(--text-primary)', lineHeight: 1.6
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6, marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>Day 14: Sliding Window &amp; Two Pointers</span>
                  <span style={{ color: 'var(--color-warning-text)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>🔥 4d</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--color-success-text)' }}>✓</span>
                  <span>Longest Substring Without Repeating</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--color-warning-text)', fontWeight: 600 }}>Med</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                  <span style={{ opacity: 0.4 }}>○</span>
                  <span>Minimum Window Substring</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--color-danger-text)', fontWeight: 600 }}>Hard</span>
                </div>
              </div>

              {/* Feature Points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  'Luminous midnight obsidian interface with Linear/Vercel fidelity',
                  'Recharts analytics & 25-week activity heatmaps',
                  'Placement pipeline Kanban board & interview tracker',
                  'Quick command palette (Ctrl+K) & company track filtering'
                ].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>•</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleLaunch('web')}
              className="btn btn-primary"
              style={{
                borderRadius: 6, padding: '12px 18px',
                fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, cursor: 'pointer'
              }}
            >
              <Sparkles size={14} /> Launch Modern Web App
            </button>
          </div>
        </div>

        {/* ── 100% SHARED STATE CALLOUT ── */}
        <div style={{
          marginTop: 28, padding: '16px 20px', borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 14, textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <RefreshCw size={20} style={{ color: 'var(--color-success-text)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                100% Synchronized Progress &amp; Zero Lock-in
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Every problem solved, daily streak, and note taken in one interface is immediately reflected in the other. Switch back and forth anytime with 1 click.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            <span>Dual View</span>
            <span>·</span>
            <span>Single Store</span>
            <span>·</span>
            <span style={{ color: 'var(--color-success-text)' }}>Local-First</span>
          </div>
        </div>

        {/* Quick metrics bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
          marginTop: 48, paddingTop: 28, borderTop: '1px solid var(--border-default)',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {CURRICULUM.totalDays}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Curated Days</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {CURRICULUM.totalProblems}+
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Problems</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {CURRICULUM.top150Count}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>LeetCode Benchmark</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              0 ms
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Offline Latency</div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO CARD ── */}
      <section id="demo" style={{ maxWidth: 840, margin: '0 auto', padding: '16px 20px 64px' }}>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 2 }}>Live Experience Demo</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Day 14: Sliding Window &amp; Two Pointers
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {solvedDemoCount} / 3 complete
              </span>
              <div className="progress-track" style={{ width: 80 }}>
                <div
                  className="progress-fill progress-fill-success"
                  style={{ width: `${(solvedDemoCount / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { id: 'p1', name: 'Longest Substring Without Repeating Characters', diff: 'Medium', tags: ['Google', 'Meta'], diffColor: 'var(--color-warning-text)' },
              { id: 'p2', name: 'Minimum Window Substring', diff: 'Hard', tags: ['Amazon', 'Uber'], diffColor: 'var(--color-danger-text)' },
              { id: 'p3', name: 'Container With Most Water', diff: 'Medium', tags: ['Apple', 'Microsoft'], diffColor: 'var(--color-warning-text)' },
            ].map((p) => {
              const isChecked = !!demoSolved[p.id];
              return (
                <div
                  key={p.id}
                  onClick={() => toggleDemoProblem(p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 'var(--radius-md)',
                    background: isChecked ? 'var(--color-success-bg)' : 'var(--bg-elevated)',
                    border: `1px solid ${isChecked ? 'var(--color-success-border)' : 'var(--border-default)'}`,
                    cursor: 'pointer', transition: 'all var(--transition-fast)'
                  }}
                >
                  <div className={`checkbox-done ${isChecked ? 'checked' : ''}`}>
                    {isChecked && <Check size={11} style={{ color: '#fff' }} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: isChecked ? 'line-through' : 'none'
                    }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: p.diffColor }}>{p.diff}</span>
                    {p.tags.map(t => (
                      <span key={t} className="badge-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SIDE-BY-SIDE INTERFACE COMPARISON MATRIX ── */}
      <section id="compare" style={{ maxWidth: 840, margin: '0 auto', padding: '0 20px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="section-label" style={{ marginBottom: 4 }}>Compare Workstations</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Choose The Mode That Fits Your Workflow
          </h2>
        </div>

        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Feature</th>
                <th style={{ padding: '12px 16px', color: '#3ddc84', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  🖥️ Retro Terminal OS
                </th>
                <th style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 700 }}>
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
                { feature: 'Offline & Cloud Sync', os: 'Local-First + Supabase Sync', web: 'Local-First + Supabase Sync' }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.feature}</td>
                  <td style={{ padding: '12px 16px', color: '#9bb8a5', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.os}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: 12 }}>{row.web}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section id="features" style={{ maxWidth: 840, margin: '0 auto', padding: '0 20px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="section-label" style={{ marginBottom: 4 }}>System Capabilities</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Engineered for Placement Conversion
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {/* Card 1: Placement Readiness Engine */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <Target size={20} style={{ color: 'var(--text-primary)' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Placement Readiness Engine</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Calculates your interview odds formula, tracks pace against your target offer deadline, and benchmarks topic mastery across all 25 curriculum categories.
            </p>
          </div>

          {/* Card 2: Placement Pipeline */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <Briefcase size={20} style={{ color: 'var(--text-primary)' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Placement Pipeline Tracker</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Track applications across Wishlist, OA, Technical Rounds, and Offers with compensation metrics and notes.
            </p>
          </div>

          {/* Card 3: Company Tagging */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <Building2 size={20} style={{ color: 'var(--text-primary)' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Company-Specific Tracks</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Filter curriculum problems directly by target companies: Google, Amazon, Microsoft, Meta, Uber, and Apple.
            </p>
          </div>

          {/* Card 4: Cohort Competition */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <Users size={20} style={{ color: 'var(--text-primary)' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Campus &amp; Squad Cohorts</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Create or join private 6-character code cohorts to compare streaks and progress with your college batch or friends.
            </p>
          </div>

          {/* Card 5: Local First */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <Shield size={20} style={{ color: 'var(--text-primary)' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>100% Offline &amp; Private</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              All progress is stored directly in your browser. Single-click JSON export and import for seamless backup and device sync.
            </p>
          </div>

          {/* Card 6: Focus Stopwatch */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <Timer size={20} style={{ color: 'var(--text-primary)' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Deep-Work Practice Timer</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Built-in 25m, 45m, and 60m focus blocks that persist across page navigation to enforce timed problem-solving discipline.
            </p>
          </div>
        </div>
      </section>

      {/* ── CURRICULUM ACCORDION ── */}
      <section id="curriculum" style={{ maxWidth: 840, margin: '0 auto', padding: '0 20px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="section-label" style={{ marginBottom: 4 }}>
            {CURRICULUM.totalWeeks} Weeks · {CURRICULUM.totalDays} Days · {CURRICULUM.totalProblems} Problems
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Structured Algorithmic Syllabus
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PHASES.map((phase) => {
            const isOpen = openPhase === phase.id;
            return (
              <div
                key={phase.id}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden'
                }}
              >
                <div
                  onClick={() => setOpenPhase(isOpen ? null : phase.id)}
                  style={{
                    padding: '14px 18px', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
                      {phase.weeks}
                    </span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {phase.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{phase.subtitle}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {phase.problems} problems
                    </span>
                    {isOpen ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: '12px 18px 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.5 }}>
                      {phase.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {phase.keyPatterns.map(pattern => (
                        <span key={pattern} className="badge-mono">
                          {pattern}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      <strong>Key Benchmarks:</strong> {phase.sampleProblems.join(' • ')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ maxWidth: 840, margin: '0 auto', padding: '0 20px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="section-label" style={{ marginBottom: 4 }}>Common Questions</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            {
              q: 'Why are there two different interfaces (Retro OS vs Modern Web)?',
              a: 'Feedback showed users were passionately divided: some love the deep immersion of a 90s retro CRT window manager with chiptune audio, while others prefer the clean, minimalist modern web dashboard. We give you both running seamlessly on the exact same engine.'
            },
            {
              q: 'Does my progress transfer when I switch between interfaces?',
              a: 'Yes, 100%. Both interfaces read and write from the exact same local state and cloud sync engine. When you mark a problem solved or update a note in Modern Web, it is immediately reflected when you launch Retro OS, and vice versa.'
            },
            {
              q: 'How do I switch between Retro OS and Modern Web after choosing?',
              a: 'In Retro OS, click the "MODERN UI" button in the taskbar or Start Menu. In Modern Web, click the "OS Shell" button in the top navigation bar. You can also return to this landing page at any time.'
            },
            {
              q: 'Is GrindOS completely free and offline-friendly?',
              a: 'Yes. GrindOS is 100% open, local-first software. Your data stays in your browser, works completely offline, and includes one-click JSON backup and restore.'
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
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)', overflow: 'hidden'
                }}
              >
                <div
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  style={{
                    padding: '12px 16px', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', cursor: 'pointer', fontSize: 13, fontWeight: 600
                  }}
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp size={13} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />}
                </div>
                {isOpen && (
                  <div style={{ padding: '0 16px 14px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border-default)', padding: '28px 20px',
        textAlign: 'center', fontSize: 12, color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
          <button onClick={() => handleLaunch('os')} className="btn btn-ghost" style={{ fontSize: 12 }}>
            <Terminal size={12} /> Retro Terminal OS
          </button>
          <button onClick={() => handleLaunch('web')} className="btn btn-ghost" style={{ fontSize: 12 }}>
            <Sparkles size={12} /> Modern Web App
          </button>
          <Link to="/curriculum" style={{ color: 'var(--text-secondary)', textDecoration: 'none', alignSelf: 'center' }}>
            Curriculum
          </Link>
          <Link to="/analytics" style={{ color: 'var(--text-secondary)', textDecoration: 'none', alignSelf: 'center' }}>
            Analytics
          </Link>
          <Link to="/leaderboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', alignSelf: 'center' }}>
            Leaderboard
          </Link>
        </div>
        <div>
          {APP_CONFIG.name} • Minimalist Placement Operating System • Dual-Engine Architecture
        </div>
      </footer>
    </div>
  );
};
