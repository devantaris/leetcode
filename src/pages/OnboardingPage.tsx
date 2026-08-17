import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import type { UserProfile } from '../context/ProgressContext';
import { Flame, Sparkles, ArrowRight, User, Calendar, Tag, CheckCircle2, Database, Zap, BookOpen, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const SECONDARY_SKILL_OPTIONS = [
  { id: 'project', label: 'Personal / Side Project', emoji: '🚀' },
  { id: 'research', label: 'Research Paper / Thesis', emoji: '📄' },
  { id: 'competitive', label: 'Competitive Programming', emoji: '🏆' },
  { id: 'systemdesign', label: 'System Design Reading', emoji: '📐' },
  { id: 'openSource', label: 'Open Source Contributions', emoji: '🌐' },
  { id: 'other', label: 'Something else / Rest only', emoji: '☕' },
];

const REST_DAY_OPTIONS = [
  { id: 'sunday', label: 'Sunday', desc: 'Most common — Mon–Sat grind' },
  { id: 'saturday', label: 'Saturday', desc: 'Weekend grind — Mon–Fri + rest Sat' },
  { id: 'none', label: 'No fixed rest day', desc: 'I\'ll decide as I go' },
];

const TOTAL_STEPS = 4;

export const OnboardingPage: React.FC = () => {
  const { updateProfile } = useProgress();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [targetDate, setTargetDate] = useState('2027-01-15');
  const [restDay, setRestDay] = useState('sunday');
  const [secondarySkill, setSecondarySkill] = useState('project');
  const [nameError, setNameError] = useState('');

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => s - 1);

  const handleFinish = () => {
    const profile: UserProfile = {
      name: name.trim(),
      tagline: tagline.trim() || 'LeetCode Planner',
      startDate: startDate || today,
      targetDate: targetDate || '2027-01-15',
      restDay: restDay,
      secondarySkill: secondarySkill,
    };
    updateProfile(profile);
  };

  const variants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="min-h-screen bg-[#060609] flex flex-col items-center justify-center p-4 selection:bg-orange-500 selection:text-black">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center font-black text-black shadow-2xl shadow-orange-500/30 text-lg tracking-wider font-mono">
            LC
          </div>
        </div>

        {/* Progress dots — only shown after landing */}
        {step > 0 && (
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i < step ? 'w-5 h-1.5 bg-orange-500' : i === step - 1 ? 'w-5 h-1.5 bg-orange-500' : 'w-1.5 h-1.5 bg-gray-700'
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── STEP 0: Landing / What is this app ── */}
          {step === 0 && (
            <motion.div key="step0" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex flex-col gap-0">
              <div className="bg-[#101018] border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1 flex items-center gap-2">
                    DSA Planner <Flame className="w-6 h-6 text-orange-400 fill-orange-500" />
                  </h1>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    A structured <strong className="text-white">20-week, 140-day</strong> LeetCode grinding tracker built around the <strong className="text-white">Top 150 Interview Problems</strong>. Made for anyone targeting placements, internships, or just getting good.
                  </p>
                </div>

                {/* Feature cards */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/15">
                    <Flame className="w-4 h-4 text-orange-400 shrink-0 mt-0.5 fill-orange-500" />
                    <div>
                      <p className="text-xs font-bold text-white">Streak Tracking</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Solves 3 problems/day Mon–Sat. Sunday is rest. Miss a day → streak resets. Consecutive days build momentum.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-800/50 border border-gray-800">
                    <Database className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">100% Local — Your Browser</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">All progress is stored in your browser's localStorage. Nothing is sent to any server. Export/import JSON to back up or sync across devices.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-800/50 border border-gray-800">
                    <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">Fully Personalized</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Set your own start date, rest day, placement deadline, and secondary skill. Works for anyone — not just one person.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-800/50 border border-gray-800">
                    <BookOpen className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">Structured Curriculum</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Arrays → Trees → Graphs → DP → System Design. 5 phases, 20 weeks, 247 curated problems + LeetCode Top 150 overlap.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={goNext}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-sm transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                >
                  <span>Let's Set It Up For You</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 1: Name & Tagline ── */}
          {step === 1 && (
            <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <div className="bg-[#101018] border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white mb-1">Who are you?</h2>
                  <p className="text-sm text-gray-400">Your name appears in the greeting and navbar.</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-orange-400" /> Your Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setNameError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && name.trim() && goNext()}
                      placeholder="e.g. Rahul, Priya, Alex..."
                      autoFocus
                      className={`w-full bg-[#0c0c14] border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition ${nameError ? 'border-red-500' : 'border-gray-800 focus:border-orange-500'}`}
                    />
                    {nameError && <p className="text-xs text-red-400">{nameError}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-gray-400" /> Tagline <span className="text-gray-600 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && name.trim() && goNext()}
                      placeholder="e.g. IIT Delhi CSE • SDE Intern • BITS Pilani"
                      className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={goBack} className="px-4 py-3 rounded-xl border border-gray-800 text-gray-400 hover:text-white font-bold text-sm transition">Back</button>
                  <button
                    onClick={() => {
                      if (!name.trim()) { setNameError('Please enter your name.'); return; }
                      goNext();
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-sm transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Rest Day + Secondary Skill ── */}
          {step === 2 && (
            <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <div className="bg-[#101018] border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white mb-1">Your schedule</h2>
                  <p className="text-sm text-gray-400">Pick your rest day and what you do on it.</p>
                </div>

                {/* Rest day */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-300">Rest Day</label>
                  {REST_DAY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setRestDay(opt.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition ${
                        restDay === opt.id
                          ? 'bg-orange-500/10 border-orange-500/50 text-white'
                          : 'bg-[#0c0c14] border-gray-800 text-gray-300 hover:border-gray-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">{opt.label}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</p>
                      </div>
                      {restDay === opt.id && <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />}
                    </button>
                  ))}
                </div>

                {/* Secondary skill */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-300">What do you focus on during rest?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SECONDARY_SKILL_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSecondarySkill(opt.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition ${
                          secondarySkill === opt.id
                            ? 'bg-orange-500/10 border-orange-500/50 text-white'
                            : 'bg-[#0c0c14] border-gray-800 text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        <span className="text-base">{opt.emoji}</span>
                        <span className="text-[11px] font-semibold leading-tight">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={goBack} className="px-4 py-3 rounded-xl border border-gray-800 text-gray-400 hover:text-white font-bold text-sm transition">Back</button>
                  <button onClick={goNext} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-sm transition flex items-center justify-center gap-2">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Dates ── */}
          {step === 3 && (
            <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <div className="bg-[#101018] border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white mb-1">Set your timeline</h2>
                  <p className="text-sm text-gray-400">
                    Hey <strong className="text-white">{name}</strong>! When do you start, and what's your goal deadline?
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-400" /> Program Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition [color-scheme:dark]"
                    />
                    <p className="text-[11px] text-gray-500">Starting today? Leave it. Coming back after a break? Pick the date you first started.</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-yellow-400" /> Placement / Interview Deadline
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition [color-scheme:dark]"
                    />
                    <p className="text-[11px] text-gray-500">This drives the countdown clock on your dashboard.</p>
                  </div>
                </div>

                {/* Summary card */}
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-300 space-y-1.5">
                  <p className="font-bold text-white mb-2">Your Setup Summary</p>
                  <p>👤 <strong>{name}</strong>{tagline ? ` · ${tagline}` : ''}</p>
                  <p>🗓️ Rest day: <strong className="text-orange-400">{REST_DAY_OPTIONS.find(r => r.id === restDay)?.label}</strong></p>
                  <p>💡 Rest activity: <strong className="text-orange-400">{SECONDARY_SKILL_OPTIONS.find(s => s.id === secondarySkill)?.label}</strong></p>
                  <p>📅 Start: <strong>{startDate}</strong> → Target: <strong>{targetDate}</strong></p>
                </div>

                <div className="flex gap-3">
                  <button onClick={goBack} className="px-4 py-3 rounded-xl border border-gray-800 text-gray-400 hover:text-white font-bold text-sm transition">Back</button>
                  <button
                    onClick={handleFinish}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-sm transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    Start Grinding!
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        <p className="text-center text-[11px] text-gray-600 mt-4 font-mono">
          All data stored locally in your browser · No account needed
        </p>
      </div>
    </div>
  );
};
