import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Flame, Volume2, VolumeX, Download, Upload, RotateCcw, Sparkles, LayoutDashboard, BookOpen, BarChart3, Settings, Database } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavbarProps {
  onOpenRules: () => void;
  onOpenStrategy: () => void;
  onOpenReset: () => void;
  onOpenBackup: () => void;
  onTriggerImport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRules,
  onOpenStrategy,
  onOpenReset,
  onOpenBackup,
  onTriggerImport
}) => {
  const { stats, exportJSON, soundEnabled, toggleSound } = useProgress();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  return (
    <nav className="glass-nav sticky top-0 z-50 px-4 py-3 border-b border-gray-800 bg-[#08080c]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* BRAND & USER PROFILE */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 flex items-center justify-center font-black text-black shadow-lg shadow-red-500/20 text-sm">
              DSA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  DSA ULTIMATUM
                </h1>
                <span className="text-[10px] font-mono font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium hidden sm:block">
                Devansh Kumar • Bennett University CSE • CGPA 8.75
              </p>
            </div>
          </div>

          {/* MOBILE CONTROLS */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenBackup}
              className="px-2.5 py-1 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-mono font-bold flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Sync</span>
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{stats.streak}d</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex items-center gap-1 bg-[#12121c] p-1 rounded-xl border border-gray-800">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/curriculum"
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curriculum</span>
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </NavLink>
        </div>

        {/* QUICK CONTROLS */}
        <div className="hidden md:flex items-center gap-2">
          
          {/* STREAK BADGE */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-xs font-bold">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{stats.streak} Days</span>
          </div>

          {/* BACKUP & SYNC BUTTON */}
          <button
            onClick={onOpenBackup}
            className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-xs font-semibold text-green-400 transition flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backup & Sync</span>
          </button>

          {/* RULES & STRATEGY */}
          <button
            onClick={onOpenRules}
            className="px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 text-xs font-semibold text-gray-200 transition"
          >
            📜 Rules
          </button>

          <button
            onClick={onOpenStrategy}
            className="px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 text-xs font-semibold text-gray-200 transition flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Strategy
          </button>

          {/* AUDIO TOGGLE */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mute Sound Effects" : "Enable Sound Effects"}
            className="p-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-300 hover:text-white transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
          </button>

          {/* SETTINGS DROPDOWN MENU */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-300 hover:text-white transition"
              title="Settings & Data Management"
            >
              <Settings className="w-4 h-4" />
            </button>

            {showSettingsMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#101018] border border-gray-800 rounded-xl p-2 shadow-2xl z-50 flex flex-col gap-1 text-xs">
                <button
                  onClick={() => {
                    onOpenBackup();
                    setShowSettingsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-200 flex items-center gap-2 transition"
                >
                  <Database className="w-3.5 h-3.5 text-green-400" />
                  <span>Backup & Sync Hub</span>
                </button>

                <button
                  onClick={() => {
                    exportJSON();
                    setShowSettingsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-200 flex items-center gap-2 transition"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download JSON</span>
                </button>

                <button
                  onClick={() => {
                    onTriggerImport();
                    setShowSettingsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-200 flex items-center gap-2 transition"
                >
                  <Upload className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Restore JSON File</span>
                </button>

                <button
                  onClick={() => {
                    onOpenReset();
                    setShowSettingsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 flex items-center gap-2 transition border-t border-gray-800/60 mt-1 pt-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                  <span>Nuclear Reset</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </nav>
  );
};
