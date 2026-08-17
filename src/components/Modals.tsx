import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import type { UserProfile } from '../context/ProgressContext';
import { X, Sparkles, BookOpen, AlertTriangle, Download, Upload, Copy, Database, Check, User, Tag, Calendar, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, addDays, parseISO } from 'date-fns';

interface ModalsProps {
  activeModal: 'rules' | 'strategy' | 'reset' | 'backup' | 'resume' | 'profile' | null;
  onClose: () => void;
  onTriggerImportFile?: () => void;
}

export const Modals: React.FC<ModalsProps> = ({ activeModal, onClose, onTriggerImportFile }) => {
  const { resetAll, stats, exportJSON, exportJSONString, importJSON, userProfile, updateProfile, resumeFromDay } = useProgress();
  const [resetInput, setResetInput] = useState<string>('');
  const [pasteString, setPasteString] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Profile edit state
  const [editName, setEditName] = useState<string>(userProfile.name);
  const [editTagline, setEditTagline] = useState<string>(userProfile.tagline);
  const [editStartDate, setEditStartDate] = useState<string>(userProfile.startDate);
  const [editTargetDate, setEditTargetDate] = useState<string>(userProfile.targetDate || '2027-01-15');
  const [editRestDay, setEditRestDay] = useState<string>(userProfile.restDay || 'sunday');
  const [editSecondarySkill, setEditSecondarySkill] = useState<string>(userProfile.secondarySkill || 'project');

  // Resume state — shift start date to "resume from where you left off"
  const [resumeDate, setResumeDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  if (!activeModal) return null;

  const handleConfirmReset = () => {
    if (resetInput.trim() === 'RESET') {
      resetAll();
      setResetInput('');
      onClose();
    } else {
      toast.error("Incorrect keyword. Type RESET to confirm.");
    }
  };

  const handleCopyJSON = () => {
    const jsonStr = exportJSONString();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    toast.success("Progress copied to clipboard! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasteImport = () => {
    if (!pasteString.trim()) {
      toast.error("Please paste your JSON string first.");
      return;
    }
    const success = importJSON(pasteString.trim());
    if (success) {
      setPasteString('');
      onClose();
    }
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    const profile: UserProfile = {
      name: editName.trim(),
      tagline: editTagline.trim() || 'LeetCode Planner',
      startDate: editStartDate,
      targetDate: editTargetDate || '2027-01-15',
      restDay: editRestDay,
      secondarySkill: editSecondarySkill,
    };
    updateProfile(profile);
    onClose();
  };

  const handleResume = () => {
    if (!resumeDate) {
      toast.error("Please pick a new start date.");
      return;
    }
    resumeFromDay(resumeDate);
    onClose();
  };

  // Helper: given today and a desired "left-off" day number, compute what start date we need
  const computeStartDateForDay = (targetDay: number): string => {
    const today = new Date();
    const daysBack = targetDay - 1;
    return format(addDays(today, -daysBack), 'yyyy-MM-dd');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#101018] border border-gray-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[85vh]">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition p-1.5 rounded-xl hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── BACKUP & SYNC MODAL ──────────────────────────────────────────────── */}
        {activeModal === 'backup' && (
          <div>
            <div className="flex items-center gap-2 text-green-400 font-extrabold text-lg mb-2">
              <Database className="w-5 h-5" />
              <span>BACKUP & SYNC PROGRESS</span>
            </div>

            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Your progress is saved locally in browser <strong className="text-white">localStorage</strong> (<code className="text-orange-400 font-mono">dsa_progress_v2</code>). You can backup your progress as a file or text string to sync between devices.
            </p>

            <div className="space-y-4">
              {/* FILE BACKUP & RESTORE */}
              <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white text-xs">JSON Backup File</h4>
                  <p className="text-[11px] text-gray-400">Download or restore a standalone <code className="text-green-400 font-mono">.json</code> file</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={exportJSON}
                    className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 font-mono text-xs font-bold transition flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onTriggerImportFile?.();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 font-mono text-xs font-bold transition flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                </div>
              </div>

              {/* COPY / PASTE CODE BACKUP */}
              <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">Copy/Paste Code String</h4>
                    <p className="text-[11px] text-gray-400">Quickly sync across devices without downloading files</p>
                  </div>
                  <button
                    onClick={handleCopyJSON}
                    className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 font-mono text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-gray-800/80">
                  <textarea
                    value={pasteString}
                    onChange={(e) => setPasteString(e.target.value)}
                    placeholder="Paste your JSON backup string here..."
                    rows={3}
                    className="w-full bg-[#141420] border border-gray-800 rounded-xl p-3 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={handlePasteImport}
                    disabled={!pasteString.trim()}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 disabled:opacity-40 text-white font-bold text-xs transition"
                  >
                    Import Text Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILE MODAL ────────────────────────────────────────────────────── */}
        {activeModal === 'profile' && (
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-extrabold text-lg mb-2">
              <User className="w-5 h-5" />
              <span>EDIT PROFILE</span>
            </div>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Update your display name, tagline, or program start date.
            </p>

            <div className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-400" />
                  Your Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              {/* Tagline */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  Tagline
                </label>
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  placeholder="e.g. IIT Delhi CSE"
                  className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              {/* Target Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                  Placement / Goal Deadline
                </label>
                <input
                  type="date"
                  value={editTargetDate}
                  onChange={(e) => setEditTargetDate(e.target.value)}
                  className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition [color-scheme:dark]"
                />
                <p className="text-[11px] text-gray-500">
                  Your interview / placement deadline. Drives the countdown on the dashboard.
                </p>
              </div>

              {/* Start Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-400" />
                  Program Start Date
                </label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition [color-scheme:dark]"
                />
                <p className="text-[11px] text-gray-500">
                  Changing this shifts your day/week counters. Use "Resume Progress" for gap recovery.
                </p>
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-sm transition shadow-lg shadow-orange-500/20 mt-1"
              >
                Save Profile
              </button>
            </div>
          </div>
        )}

        {/* ── RESUME PROGRESS MODAL ────────────────────────────────────────────── */}
        {activeModal === 'resume' && (
          <div>
            <div className="flex items-center gap-2 text-yellow-400 font-extrabold text-lg mb-2">
              <RotateCcw className="w-5 h-5" />
              <span>RESUME PROGRESS</span>
            </div>

            <div className="p-3.5 rounded-xl bg-yellow-950/20 border border-yellow-500/20 text-xs text-yellow-200 leading-relaxed mb-5">
              <strong className="text-yellow-400">Were you away?</strong> If you missed days due to travel, exams, or anything else — don't go backwards. Instead, shift your program's start date forward so <em>today</em> aligns with the day you left off. <strong className="text-white">Your solved problems stay intact.</strong>
            </div>

            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-300 mb-4 space-y-1">
              <p>Current program start: <strong className="text-white font-mono">{userProfile.startDate}</strong></p>
              <p>You're currently on: <strong className="text-orange-400 font-mono">Week {stats.currentWeek}, Day {stats.currentDay}</strong></p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                  New Start Date
                </label>
                <input
                  type="date"
                  value={resumeDate}
                  onChange={(e) => setResumeDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition [color-scheme:dark]"
                />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Set this to a date that makes <em>today = the day you last left off</em>. For example, if you were on Day 22 and took a 4-week break, set this to{' '}
                  <strong className="text-gray-300 font-mono">{computeStartDateForDay(22)}</strong>{' '}
                  so today reads as Day 22.
                </p>
              </div>

              {resumeDate && (
                <div className="p-3 rounded-xl bg-green-950/20 border border-green-500/20 text-xs text-green-300">
                  With this start date, today will be{' '}
                  <strong className="text-green-400">
                    Day {Math.min(140, Math.max(1, Math.round((new Date().getTime() - parseISO(resumeDate).getTime()) / (1000 * 60 * 60 * 24)) + 1))}
                  </strong>
                  {' '}of your program.
                </div>
              )}

              <button
                onClick={handleResume}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-sm transition shadow-lg shadow-yellow-500/20"
              >
                Adjust & Resume ✈️
              </button>
            </div>
          </div>
        )}

        {/* ── RULES MODAL ──────────────────────────────────────────────────────── */}
        {activeModal === 'rules' && (
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-extrabold text-lg mb-4">
              <BookOpen className="w-5 h-5" />
              <span>THE 4 CORE RULES OF THE PLANNER</span>
            </div>

            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800">
                <h4 className="font-bold text-white mb-1">1. Mon-Fri Daily Grinding (45-60 min)</h4>
                <p className="text-gray-400">Exactly 3 LeetCode problems every day. Set the built-in timer, eliminate phone distractions, and solve.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-yellow-950/20 border border-yellow-500/30">
                <h4 className="font-bold text-yellow-300 mb-1">2. Thursday Blind Review Rule</h4>
                <p className="text-gray-400">Thursdays are Review Days. Re-solve 2 previous problems BLIND without looking at past code. Finish with 1 new Medium.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30">
                <h4 className="font-bold text-blue-300 mb-1">3. Saturday Live Contest Rule</h4>
                <p className="text-gray-400">Saturday is LeetCode Weekly/Biweekly contest day. Target: Solve 2-3 problems under real-time pressure.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800">
                <h4 className="font-bold text-gray-200 mb-1">4. Sunday Guilt-Free Rest</h4>
                <p className="text-gray-400">Sundays are strictly for your projects or rest. Zero DSA. Recharge your brain.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── STRATEGY MODAL ───────────────────────────────────────────────────── */}
        {activeModal === 'strategy' && (
          <div>
            <div className="flex items-center gap-2 text-yellow-400 font-extrabold text-lg mb-4">
              <Sparkles className="w-5 h-5" />
              <span>TOPIC PROGRESSION ROADMAP</span>
            </div>

            <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                <strong className="text-orange-400">Phase 1 (Weeks 1-4): Linear Foundations & Search</strong> — Arrays, Two Pointers, Sliding Window, LL, Stack, Binary Search & Matrix.
              </div>
              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                <strong className="text-blue-400">Phase 2 (Weeks 5-9): Tree & Graph Hierarchies</strong> — Trees, Heaps, Tries, Backtracking, BFS/DFS, Union Find, Dijkstra.
              </div>
              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                <strong className="text-red-400">Phase 3 (Weeks 10-13): Dynamic Programming & Bits</strong> — 1D & 2D DP, Knapsack, String DP, Greedy Intervals & Bitwise tricks.
              </div>
              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                <strong className="text-purple-400">Phase 4 (Week 14): System Design Shift</strong> — Reading DDIA, designing TinyURL, Rate Limiters with Redis.
              </div>
              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                <strong className="text-green-400">Phase 5 (Weeks 15-20): FAANG & FinTech Sprint</strong> — Company-specific grinding (Razorpay, PhonePe, Google) & Mock Interviews.
              </div>
            </div>
          </div>
        )}

        {/* ── RESET MODAL ──────────────────────────────────────────────────────── */}
        {activeModal === 'reset' && (
          <div>
            <div className="flex items-center gap-2 text-red-500 font-extrabold text-lg mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>NUCLEAR RESET OPTION</span>
            </div>

            <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300 mb-4">
              <strong>Warning:</strong> You are about to erase <strong className="text-white font-mono">{stats.solvedCount} solved problems</strong>, your <strong className="text-white font-mono">{stats.streak}-day streak</strong>, and your <strong className="text-white font-mono">profile</strong> stored in this browser.
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-mono text-gray-300">
                Type <strong className="text-red-400">RESET</strong> to confirm:
              </label>
              <input
                type="text"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="RESET"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-500"
              />

              <button
                onClick={handleConfirmReset}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-lg shadow-red-600/30"
              >
                ERASE ALL PROGRESS
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
