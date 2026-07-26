import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { X, Sparkles, BookOpen, AlertTriangle, Download, Upload, Copy, Database, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ModalsProps {
  activeModal: 'rules' | 'strategy' | 'reset' | 'backup' | null;
  onClose: () => void;
  onTriggerImportFile?: () => void;
}

export const Modals: React.FC<ModalsProps> = ({ activeModal, onClose, onTriggerImportFile }) => {
  const { resetAll, stats, exportJSON, exportJSONString, importJSON } = useProgress();
  const [resetInput, setResetInput] = useState<string>('');
  const [pasteString, setPasteString] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

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

        {/* BACKUP & SYNC MODAL */}
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

        {/* RULES MODAL */}
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
                <p className="text-gray-400">Sundays are strictly for your DIP Research Paper or SkillSync/Biome project work. Zero DSA. Recharge your brain.</p>
              </div>
            </div>
          </div>
        )}

        {/* STRATEGY MODAL */}
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

        {/* RESET MODAL */}
        {activeModal === 'reset' && (
          <div>
            <div className="flex items-center gap-2 text-red-500 font-extrabold text-lg mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>NUCLEAR RESET OPTION</span>
            </div>

            <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300 mb-4">
              <strong>Warning:</strong> You are about to erase <strong className="text-white font-mono">{stats.solvedCount} solved problems</strong> and your <strong className="text-white font-mono">{stats.streak}-day streak</strong> stored in this browser.
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
