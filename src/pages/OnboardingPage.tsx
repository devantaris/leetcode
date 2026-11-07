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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

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

const TARGET_COMPANIES = [
  'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Uber', 'Netflix', 'Top Tech / FAANG', 'High-Growth Startup'
];

const TOTAL_STEPS = 3;

export const OnboardingPage: React.FC = () => {
  const { updateProfile } = useProgress();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [targetCompany, setTargetCompany] = useState('Top Tech / FAANG');
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
      name: name.trim() || APP_CONFIG.defaults.userName,
      tagline: tagline.trim() || APP_CONFIG.defaults.defaultTagline,
      startDate: startDate || today,
      targetDate: targetDate || format(addDays(new Date(), APP_CONFIG.defaults.targetDateOffsetDays), 'yyyy-MM-dd'),
      restDay: restDay,
      secondarySkill: secondarySkill,
      targetCompany: targetCompany,
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs font-mono shadow-xs">
            {APP_CONFIG.shortName}
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            {APP_CONFIG.name}
          </span>
        </div>

        {/* Step dots */}
        {step > 0 && (
          <div className="flex justify-center gap-1.5 mb-5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i < step ? 'w-6 bg-primary' : 'w-3 bg-muted'
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 0: Welcome / Mission */}
          {step === 0 && (
            <motion.div key="s0" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
              <Card className="border border-border/80 bg-card shadow-xs">
                <CardContent className="p-6 sm:p-7 flex flex-col gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-foreground tracking-tight m-0">
                      Placement Readiness System
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      A structured {CURRICULUM.totalWeeks}-week, {CURRICULUM.totalDays}-day curriculum covering {CURRICULUM.totalProblems} curated interview problems and patterns.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {[
                      { label: 'Structured Daily Cadence', desc: `${CURRICULUM.dailyTarget} curated problems per practice day with built-in rest.` },
                      { label: 'Cloud-First Persistence', desc: 'Syncs automatically to Supabase with instantaneous multi-device updates.' },
                      { label: 'Placement Pipeline Tracker', desc: 'Log applications, interviews, OA results and track conversion.' },
                    ].map((feat) => (
                      <div key={feat.label} className="p-3 bg-muted/40 border border-border/60 rounded-xl">
                        <div className="text-xs font-semibold text-foreground">{feat.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{feat.desc}</div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={goNext}
                    className="w-full text-xs h-10 font-semibold gap-1.5 mt-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 1: Name & Tagline */}
          {step === 1 && (
            <motion.div key="s1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
              <Card className="border border-border/80 bg-card shadow-xs">
                <CardContent className="p-6 sm:p-7 flex flex-col gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground m-0">
                      What should we call you?
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your name will be used across greetings and reports.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">
                        Your Name *
                      </label>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setNameError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && name.trim() && goNext()}
                        placeholder="e.g. Alex Chen"
                        autoFocus
                        className="text-xs h-9.5"
                      />
                      {nameError && (
                        <div className="text-[11px] text-destructive mt-1">{nameError}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">
                        Tagline / Target Role <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <Input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && name.trim() && goNext()}
                        placeholder="e.g. CS Student • Target: SDE-1"
                        className="text-xs h-9.5"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">
                        Target Company / Tier
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {TARGET_COMPANIES.map((comp) => (
                          <button
                            key={comp}
                            type="button"
                            onClick={() => setTargetCompany(comp)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                              targetCompany === comp
                                ? 'bg-primary text-primary-foreground border-primary font-semibold'
                                : 'bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground'
                            }`}
                          >
                            {comp}
                          </button>
                        ))}
                      </div>
                      <Input
                        type="text"
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        placeholder="Or type custom company..."
                        className="text-xs h-9"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <Button variant="outline" onClick={goBack} className="flex-1 text-xs h-9.5">
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        if (!name.trim()) { setNameError('Please enter your name.'); return; }
                        goNext();
                      }}
                      className="flex-2 text-xs h-9.5 font-semibold gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: Rest & Focus */}
          {step === 2 && (
            <motion.div key="s2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
              <Card className="border border-border/80 bg-card shadow-xs">
                <CardContent className="p-6 sm:p-7 flex flex-col gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground m-0">
                      Schedule & Cadence
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose your weekly rest day to prevent burnout.
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Rest Day</div>
                    <div className="flex flex-col gap-1.5">
                      {REST_DAY_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setRestDay(opt.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                            restDay === opt.id
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border/60 bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-semibold text-foreground">{opt.label}</div>
                            <div className="text-[11px] text-muted-foreground">{opt.desc}</div>
                          </div>
                          {restDay === opt.id && <Check className="size-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Rest Day Secondary Skill</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SECONDARY_SKILL_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSecondarySkill(opt.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            secondarySkill === opt.id
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border/60 bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                          }`}
                        >
                          <div className="text-xs font-semibold text-foreground">{opt.label}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <Button variant="outline" onClick={goBack} className="flex-1 text-xs h-9.5">
                      Back
                    </Button>
                    <Button onClick={goNext} className="flex-2 text-xs h-9.5 font-semibold gap-1">
                      <span>Next</span>
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: Timeline & Launch */}
          {step === 3 && (
            <motion.div key="s3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
              <Card className="border border-border/80 bg-card shadow-xs">
                <CardContent className="p-6 sm:p-7 flex flex-col gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground m-0">
                      Set your timeline
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start date determines your Day 1. Target date drives your countdown.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-xs h-9.5"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">
                        Target Interview Date
                      </label>
                      <Input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="text-xs h-9.5"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-muted/40 border border-border/60 rounded-xl text-xs flex flex-col gap-1">
                    <div className="font-semibold text-foreground flex items-center justify-between">
                      <span>{name || 'Operator'}</span>
                      <span className="text-[11px] font-mono text-primary">{targetCompany}</span>
                    </div>
                    <div className="text-muted-foreground text-[11px]">Rest: {REST_DAY_OPTIONS.find(r => r.id === restDay)?.label} ({SECONDARY_SKILL_OPTIONS.find(s => s.id === secondarySkill)?.label})</div>
                    <div className="text-muted-foreground text-[11px]">Start: {startDate} → Target: {targetDate}</div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <Button variant="outline" onClick={goBack} className="flex-1 text-xs h-9.5">
                      Back
                    </Button>
                    <Button onClick={handleFinish} className="flex-2 text-xs h-9.5 font-semibold">
                      Launch Operating System
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-[11px] text-muted-foreground mt-4">
          100% cloud sync across devices · Zero data silos
        </p>
      </div>
    </div>
  );
};
