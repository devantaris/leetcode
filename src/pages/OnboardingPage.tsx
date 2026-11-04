import React, { useState, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';
import type { UserProfile } from '../context/ProgressContext';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_CONFIG } from '../config/appConfig';
import { CURRICULUM } from '../data/curriculumStats';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

const SECONDARY_SKILL_OPTIONS = [
  { id: 'project', label: 'Personal Project', desc: 'Full-stack / systems build' },
  { id: 'research', label: 'Research Paper', desc: 'Thesis / ML research' },
  { id: 'competitive', label: 'Competitive Programming', desc: 'Codeforces / contests' },
  { id: 'systemdesign', label: 'System Design Reading', desc: 'DDIA / distributed systems' },
  { id: 'openSource', label: 'Open Source', desc: 'GitHub contributions' },
  { id: 'other', label: 'Rest & Recharge', desc: 'Break from screens' },
];

const REST_DAY_OPTIONS = [
  { id: 'sunday', label: 'Sunday', desc: 'Mon–Sat grind, Sunday rest' },
  { id: 'saturday', label: 'Saturday', desc: 'Mon–Fri grind, Saturday rest' },
  { id: 'none', label: 'Flexible', desc: 'Rest when needed' },
];

const TOTAL_STEPS = 3;

export const OnboardingPage: React.FC = () => {
  const { updateProfile } = useProgress();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [targetDate, setTargetDate] = useState(format(addDays(new Date(), APP_CONFIG.defaults.targetDateOffsetDays), 'yyyy-MM-dd'));
  const [restDay, setRestDay] = useState('sunday');
  const [secondarySkill, setSecondarySkill] = useState('project');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (startDate) {
      setTargetDate(format(addDays(new Date(startDate), APP_CONFIG.defaults.targetDateOffsetDays), 'yyyy-MM-dd'));
    }
  }, [startDate]);

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => s - 1);

  const handleFinish = () => {
    const profile: UserProfile = {
      name: name.trim(),
      tagline: tagline.trim() || APP_CONFIG.defaults.defaultTagline,
      startDate: startDate || today,
      targetDate: targetDate || format(addDays(new Date(), APP_CONFIG.defaults.targetDateOffsetDays), 'yyyy-MM-dd'),
      restDay: restDay,
      secondarySkill: secondarySkill,
    };
    sounds.playVictorySound();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    updateProfile(profile);
  };

  const variants = {
    enter: { opacity: 0, y: 10 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'var(--bg-app)'
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-mono)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.45)'
          }}>
            {APP_CONFIG.shortName}
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {APP_CONFIG.name}
          </span>
        </div>

        {/* Step dots */}
        {step > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 3, width: i < step ? 24 : 12, borderRadius: 99,
                  background: i < step ? 'var(--text-primary)' : 'var(--border-strong)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 0: Welcome / Mission */}
          {step === 0 && (
            <motion.div key="s0" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xl)', padding: '28px', display: 'flex', flexDirection: 'column', gap: 18,
                boxShadow: 'var(--shadow-md)'
              }}>
                <div>
                  <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                    Placement Readiness System
                  </h1>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                    A structured {CURRICULUM.totalWeeks}-week, {CURRICULUM.totalDays}-day curriculum covering {CURRICULUM.totalProblems} curated interview problems and patterns.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Structured Daily Cadence', desc: `${CURRICULUM.dailyTarget} curated problems per practice day with built-in rest.` },
                    { label: 'Local-First Architecture', desc: 'Runs in your browser. Complete control over your progress data.' },
                    { label: 'Placement Pipeline Tracker', desc: 'Log applications, interviews, OA results and track conversion.' },
                  ].map((feat) => (
                    <div key={feat.label} style={{
                      padding: '10px 12px', background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)'
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{feat.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{feat.desc}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={goNext}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px 16px', fontSize: 13 }}
                >
                  Get Started <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Name & Tagline */}
          {step === 1 && (
            <motion.div key="s1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xl)', padding: '28px', display: 'flex', flexDirection: 'column', gap: 18,
                boxShadow: 'var(--shadow-md)'
              }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    What should we call you?
                  </h2>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Your name will be used across greetings and reports.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setNameError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && name.trim() && goNext()}
                      placeholder="e.g. Alex"
                      autoFocus
                      className="input"
                    />
                    {nameError && (
                      <div style={{ fontSize: 11, color: 'var(--color-danger-text)', marginTop: 4 }}>{nameError}</div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                      Tagline / Target Role <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && name.trim() && goNext()}
                      placeholder="e.g. CS Student • Target: SDE-1"
                      className="input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={goBack} className="btn btn-default" style={{ flex: 1 }}>Back</button>
                  <button
                    onClick={() => {
                      if (!name.trim()) { setNameError('Please enter your name.'); return; }
                      goNext();
                    }}
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                  >
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Rest & Focus */}
          {step === 2 && (
            <motion.div key="s2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xl)', padding: '28px', display: 'flex', flexDirection: 'column', gap: 18,
                boxShadow: 'var(--shadow-md)'
              }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Schedule & Cadence
                  </h2>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Choose your weekly rest day to prevent burnout.
                  </p>
                </div>

                <div>
                  <div className="section-label" style={{ marginBottom: 6 }}>Rest Day</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {REST_DAY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setRestDay(opt.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: 'var(--radius-md)',
                          border: `1px solid ${restDay === opt.id ? 'var(--text-primary)' : 'var(--border-default)'}`,
                          background: restDay === opt.id ? 'var(--bg-elevated)' : 'transparent',
                          cursor: 'pointer', textAlign: 'left'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{opt.desc}</div>
                        </div>
                        {restDay === opt.id && <Check size={13} style={{ color: 'var(--text-primary)' }} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="section-label" style={{ marginBottom: 6 }}>Rest Day Secondary Skill</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {SECONDARY_SKILL_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSecondarySkill(opt.id)}
                        style={{
                          padding: '8px 10px', borderRadius: 'var(--radius-md)',
                          border: `1px solid ${secondarySkill === opt.id ? 'var(--text-primary)' : 'var(--border-default)'}`,
                          background: secondarySkill === opt.id ? 'var(--bg-elevated)' : 'transparent',
                          cursor: 'pointer', textAlign: 'left'
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={goBack} className="btn btn-default" style={{ flex: 1 }}>Back</button>
                  <button onClick={goNext} className="btn btn-primary" style={{ flex: 2 }}>
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Timeline & Launch */}
          {step === 3 && (
            <motion.div key="s3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xl)', padding: '28px', display: 'flex', flexDirection: 'column', gap: 18,
                boxShadow: 'var(--shadow-md)'
              }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Set your timeline
                  </h2>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Start date determines your Day 1. Target date drives your countdown.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                      Target Interview Date
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div style={{
                  padding: '12px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
                  fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
                  <div>Rest: {REST_DAY_OPTIONS.find(r => r.id === restDay)?.label} ({SECONDARY_SKILL_OPTIONS.find(s => s.id === secondarySkill)?.label})</div>
                  <div>Start: {startDate} → Target: {targetDate}</div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={goBack} className="btn btn-default" style={{ flex: 1 }}>Back</button>
                  <button onClick={handleFinish} className="btn btn-primary" style={{ flex: 2 }}>
                    Launch Operating System
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 16 }}>
          100% local storage in your browser · No external accounts required
        </p>
      </div>
    </div>
  );
};
