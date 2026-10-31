import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Timer, ArrowRight, 
  ChevronDown, ChevronUp,
  Check, Bot, Building2, Briefcase, Users, Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { APP_CONFIG } from '../config/appConfig';
import { useProgress } from '../context/ProgressContext';
import { sounds } from '../utils/audio';

const PHASES = [
  {
    id: 1,
    weeks: 'Weeks 1–4',
    title: 'Linear Foundations',
    subtitle: 'Arrays, Two Pointers, Sliding Window & Hash Maps',
    problems: 56,
    description: 'Master core patterns tested in 70% of technical phone screens. Eliminates brute-force O(N²) habits.',
    keyPatterns: ['Two Pointers (Opposite & Fast/Slow)', 'Variable & Fixed Sliding Window', 'Prefix Sums & Hash Map Lookups', 'Monotonic Stack / Queue'],
    sampleProblems: ['3Sum (LC 15)', 'Longest Substring Without Repeating (LC 3)', 'Daily Temperatures (LC 739)', 'Trapping Rain Water (LC 42)']
  },
  {
    id: 2,
    weeks: 'Weeks 5–9',
    title: 'Hierarchical & Graphs',
    subtitle: 'Binary Trees, BSTs, BFS/DFS & Matrix Traversals',
    problems: 70,
    description: 'Deconstruct complex tree traversals and graph algorithms into reusable recursive mental models.',
    keyPatterns: ['Tree DFS & Path Sum', 'Tree Level-Order BFS', 'Graph Connected Components', 'Topological Sort (Kahn\'s Algorithm)', 'Dijkstra & Shortest Path'],
    sampleProblems: ['Lowest Common Ancestor (LC 236)', 'Course Schedule (LC 207)', 'Number of Islands (LC 200)', 'Word Ladder (LC 127)']
  },
  {
    id: 3,
    weeks: 'Weeks 10–13',
    title: 'Dynamic Programming',
    subtitle: '1D/2D DP, Memoization, Tabulation & Subsequences',
    problems: 56,
    description: 'Demystify DP by learning state definitions and transition formulas rather than memorizing solutions.',
    keyPatterns: ['0/1 Knapsack & Unbounded Knapsack', 'Longest Common Subsequence (LCS)', 'State Machine DP (Stock Buy/Sell)', 'Interval DP'],
    sampleProblems: ['Coin Change (LC 322)', 'Longest Increasing Subsequence (LC 300)', 'Edit Distance (LC 72)', 'Best Time to Buy and Sell Stock IV (LC 188)']
  },
  {
    id: 4,
    weeks: 'Week 14',
    title: 'Architecture & System Design',
    subtitle: 'Distributed Systems, Caching, Sharding & Rate Limiting',
    problems: 14,
    description: 'Bridge the gap between algorithmic code and large-scale distributed architectures for senior evaluations.',
    keyPatterns: ['Token Bucket Rate Limiters', 'Consistent Hashing & Partitioning', 'Cache-Aside Strategies', 'Distributed Unique IDs'],
    sampleProblems: ['Design URL Shortener (TinyURL)', 'Design Distributed Rate Limiter', 'Design Key-Value Store', 'Design Notification System']
  },
  {
    id: 5,
    weeks: 'Weeks 15–20',
    title: 'Offer Sprint & Timed Mocks',
    subtitle: 'High-Frequency Speedruns & Timed Pressure Mocks',
    problems: 84,
    description: 'Simulate live interview pressure under strict 45-minute constraints. Focuses exclusively on top company-tagged variants.',
    keyPatterns: ['45-Minute Timed Mock Interviews', 'Cross-Topic Pattern Blending', 'Complexity Verbalization', 'Edge-Case Analysis'],
    sampleProblems: ['LRU Cache (LC 146)', 'Median of Two Sorted Arrays (LC 4)', 'Merge k Sorted Lists (LC 23)', 'Alien Dictionary (LC 269)']
  }
];

export const LandingPage: React.FC = () => {
  const { isOnboarded, userProfile } = useProgress();

  const [demoSolved, setDemoSolved] = useState<Record<string, boolean>>({
    'p1': true,
    'p2': false,
    'p3': false
  });

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [openPhase, setOpenPhase] = useState<number | null>(1);

  const toggleDemoProblem = (id: string) => {
    setDemoSolved(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (!prev[id]) {
        sounds.playTickSound();
        const allDone = Object.values(next).every(Boolean);
        if (allDone) {
          sounds.playVictorySound();
          confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
        }
      }
      return next;
    });
  };

  const solvedDemoCount = Object.values(demoSolved).filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {/* ── TOP NAV ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--bg-app)', borderBottom: '1px solid var(--border-default)',
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--text-primary)', color: 'var(--text-inverse)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 12, fontFamily: 'var(--font-mono)'
          }}>
            {APP_CONFIG.shortName}
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em' }}>
            {APP_CONFIG.name}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="#curriculum" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>Curriculum</a>
          <a href="#features" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a>
          <a href="#faq" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>FAQ</a>
          <Link
            to={isOnboarded ? "/dashboard" : "/dashboard"}
            className="btn btn-primary"
            style={{ fontSize: 12, padding: '6px 12px' }}
          >
            {isOnboarded ? 'Open App' : 'Launch Free'} <ArrowRight size={12} />
          </Link>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section style={{ maxWidth: 840, margin: '0 auto', padding: '72px 20px 48px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 99,
          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20
        }}>
          <span>v2.0 Placement Operating System</span>
          <span style={{ color: 'var(--border-strong)' }}>•</span>
          <span style={{ color: 'var(--color-success-text)', fontWeight: 600 }}>100% Local First</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 16px',
          color: 'var(--text-primary)'
        }}>
          Master technical interviews with disciplined consistency.
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--text-secondary)',
          lineHeight: 1.6, maxWidth: 620, margin: '0 auto 28px'
        }}>
          A structured 20-week daily syllabus covering 280+ curated algorithmic problems, Top 150 benchmarks, company tags, and placement pipeline tracking.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link
            to="/dashboard"
            className="btn btn-primary"
            style={{ fontSize: 14, padding: '10px 20px' }}
          >
            {isOnboarded ? `Continue as ${userProfile.name}` : 'Start Your Journey Free'}
            <ArrowRight size={14} />
          </Link>

          <a
            href="#demo"
            className="btn btn-default"
            style={{ fontSize: 14, padding: '10px 18px' }}
          >
            Interactive Demo
          </a>
        </div>

        {/* Quick metrics bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
          marginTop: 48, paddingTop: 28, borderTop: '1px solid var(--border-default)',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>140</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Curated Days</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>280+</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Problems</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>150</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>LeetCode Benchmark</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>0 ms</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Offline Latency</div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO CARD ── */}
      <section id="demo" style={{ maxWidth: 840, margin: '0 auto', padding: '24px 20px 64px' }}>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 2 }}>Live Experience</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Day 14: Sliding Window & Two Pointers
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
                      <span key={t} style={{
                        fontSize: 10, fontFamily: 'var(--font-mono)', padding: '1px 5px',
                        borderRadius: 3, background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                        color: 'var(--text-secondary)'
                      }}>
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

      {/* ── BENTO FEATURES ── */}
      <section id="features" style={{ maxWidth: 840, margin: '0 auto', padding: '0 20px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="section-label" style={{ marginBottom: 4 }}>System Architecture</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Engineered for Placement Conversion
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {/* Card 1: AI Placement Coach */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <Bot size={20} style={{ color: 'var(--text-primary)' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Placement Diagnostic Coach</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Generates daily briefings, tracks pace vs deadline, and breaks down your readiness score into coverage, streak, and topic breadth.
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
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Campus & Squad Cohorts</h3>
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
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>100% Offline & Private</h3>
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
          <div className="section-label" style={{ marginBottom: 4 }}>5 Phases · 20 Weeks</div>
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
                    <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {phase.keyPatterns.map(pattern => (
                        <span key={pattern} style={{
                          fontSize: 11, padding: '3px 8px', borderRadius: 4,
                          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                          color: 'var(--text-secondary)'
                        }}>
                          {pattern}
                        </span>
                      ))}
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
            { q: 'Is GrindOS really free?', a: 'Yes. GrindOS is 100% open, local-first software. Your data stays in your browser and there are no paywalls or required subscriptions.' },
            { q: 'Can I change my start date or target deadline?', a: 'Yes. In the Settings menu, you can adjust your start date, target interview date, and weekly rest day at any time.' },
            { q: 'How does the Placement Readiness algorithm work?', a: 'Your readiness percentage is calculated from 4 transparent factors: Problem Coverage (40%), Streak Consistency (25%), Pace vs Target Deadline (25%), and Topic Breadth (10%).' },
            { q: 'How do I sync progress between devices?', a: 'Click Settings → Export JSON to download a backup file, then import it on any other computer or browser to restore your full history.' }
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
        borderTop: '1px solid var(--border-default)', padding: '24px 20px',
        textAlign: 'center', fontSize: 12, color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
          <Link to="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/curriculum" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Curriculum</Link>
          <Link to="/analytics" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Analytics</Link>
          <Link to="/leaderboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Leaderboard</Link>
        </div>
        <div>
          {APP_CONFIG.name} · Minimalist Placement Operating System · Local-First Architecture
        </div>
      </footer>
    </div>
  );
};
