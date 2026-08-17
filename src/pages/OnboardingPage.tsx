import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import type { UserProfile } from '../context/ProgressContext';
import { Flame, Sparkles, ArrowRight, User, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';

export const OnboardingPage: React.FC = () => {
  const { updateProfile } = useProgress();

  const today = format(new Date(), 'yyyy-MM-dd');

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [step, setStep] = useState<1 | 2>(1);
  const [nameError, setNameError] = useState('');

  const handleNext = () => {
    if (!name.trim()) {
      setNameError('Please enter your name to continue.');
      return;
    }
    setNameError('');
    setStep(2);
  };

  const handleStart = () => {
    const profile: UserProfile = {
      name: name.trim(),
      tagline: tagline.trim() || 'LeetCode Planner',
      startDate: startDate || today,
    };
    updateProfile(profile);
  };

  return (
    <div className="min-h-screen bg-[#060609] flex items-center justify-center p-4 selection:bg-orange-500 selection:text-black">
      {/* Background ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center font-black text-black shadow-2xl shadow-orange-500/30 text-xl tracking-wider font-mono">
            LC
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-1 w-12 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-orange-500' : 'bg-gray-800'}`} />
          <div className={`h-1 w-12 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-800'}`} />
        </div>

        <div className="bg-[#101018] border border-gray-800 rounded-2xl p-8 shadow-2xl">

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1 flex items-center gap-2">
                  Welcome to the Planner
                  <Flame className="w-6 h-6 text-orange-400 fill-orange-500" />
                </h1>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Your personal DSA grinding companion. Let's set it up for <strong className="text-white">you</strong>.
                </p>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-400" />
                  Your Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder="e.g. Rahul, Priya, Alex..."
                  autoFocus
                  className={`w-full bg-[#0c0c14] border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition ${
                    nameError ? 'border-red-500 focus:border-red-400' : 'border-gray-800 focus:border-orange-500'
                  }`}
                />
                {nameError && <p className="text-xs text-red-400">{nameError}</p>}
              </div>

              {/* Tagline */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  Your Tagline <span className="text-gray-600 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder="e.g. IIT Delhi CSE, BITS Pilani, SDE @ startup..."
                  className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-sm transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1 flex items-center gap-2">
                  When do you start?
                  <Calendar className="w-6 h-6 text-orange-400" />
                </h1>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Hey <strong className="text-white">{name}</strong>! Set your program start date. All weekly and daily progress will be counted from this day.
                </p>
              </div>

              {/* Date picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-400" />
                  Program Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition [color-scheme:dark]"
                />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Starting today? Leave it as is. Resuming from a past day? Pick that date so your week counter is accurate.
                </p>
              </div>

              {/* Info box */}
              <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-500/20 text-xs text-orange-300 leading-relaxed">
                <strong className="text-orange-400">⚡ Tip:</strong> You can always adjust this date later from Settings if you take a break or travel.
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 font-bold text-sm transition"
                >
                  Back
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-sm transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Start Grinding!</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-600 mt-4 font-mono">
          LeetCode 150 • 20-Week DSA Planner • All data stored locally in your browser
        </p>
      </div>
    </div>
  );
};
