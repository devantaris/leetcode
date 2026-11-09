import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { sounds } from '../../utils/audio';
import { BootScreen } from './BootScreen';
import { MissionsWindow } from './windows/MissionsWindow';
import { SyllabusWindow } from './windows/SyllabusWindow';
import { StatsWindow } from './windows/StatsWindow';
import { OracleWindow } from './windows/OracleWindow';
import { PomodoroWindow } from './windows/PomodoroWindow';
import { ReviewWindow } from './windows/ReviewWindow';
import { CohortWindow } from './windows/CohortWindow';
import { PipelineWindow } from './windows/PipelineWindow';
import { LogWindow } from './windows/LogWindow';
import { ConfigWindow } from './windows/ConfigWindow';
import { ReadmeWindow } from './windows/ReadmeWindow';
import { SetupWindow } from './windows/SetupWindow';
import { AuthWindow } from './windows/AuthWindow';
import type { AppId, WindowState, LogEntry } from './types';
import { CURRICULUM } from '../../data/curriculumStats';
import { MERGED_PLAN_DATA } from '../../data/mergedPlanData';

const INITIAL_WINDOWS: Record<AppId, Omit<WindowState, 'zIndex'>> = {
  missions: {
    id: 'missions',
    title: 'MISSIONS.EXE — DAILY OPS',
    glyph: '▚',
    isOpen: true,
    isFocused: true,
    x: 140,
    y: 36,
    w: 500,
  },
  syllabus: {
    id: 'syllabus',
    title: 'SYLLABUS.EXE — CURRICULUM DB',
    glyph: '⟳',
    isOpen: false,
    isFocused: false,
    x: 180,
    y: 50,
    w: 640,
  },
  stats: {
    id: 'stats',
    title: 'STATS.EXE — PLACEMENT METRICS',
    glyph: '📊',
    isOpen: false,
    isFocused: false,
    x: 210,
    y: 45,
    w: 560,
  },
  oracle: {
    id: 'oracle',
    title: 'ORACLE.EXE — PATTERN HINTS',
    glyph: '🔮',
    isOpen: false,
    isFocused: false,
    x: 230,
    y: 55,
    w: 560,
  },
  pomo: {
    id: 'pomo',
    title: 'POMODORO.EXE — FOCUS TIMER',
    glyph: '◔',
    isOpen: false,
    isFocused: false,
    x: 640,
    y: 40,
    w: 380,
  },
  review: {
    id: 'review',
    title: 'REVIEW.EXE — SPACED REPETITION',
    glyph: '⟲',
    isOpen: false,
    isFocused: false,
    x: 200,
    y: 80,
    w: 480,
  },
  cohort: {
    id: 'cohort',
    title: 'COHORT.EXE — PEER NETWORK',
    glyph: '☰',
    isOpen: false,
    isFocused: false,
    x: 660,
    y: 120,
    w: 460,
  },
  pipeline: {
    id: 'pipeline',
    title: 'PIPELINE.EXE — PLACEMENTS',
    glyph: '💼',
    isOpen: false,
    isFocused: false,
    x: 240,
    y: 60,
    w: 560,
  },
  log: {
    id: 'log',
    title: 'SYSTEM.LOG — KERNEL TAIL',
    glyph: '≡',
    isOpen: false,
    isFocused: false,
    x: 520,
    y: 180,
    w: 440,
  },
  config: {
    id: 'config',
    title: 'CONFIG.EXE — SETTINGS',
    glyph: '⚙',
    isOpen: false,
    isFocused: false,
    x: 220,
    y: 70,
    w: 480,
  },
  readme: {
    id: 'readme',
    title: 'README.TXT — SYSTEM MANUAL',
    glyph: '?',
    isOpen: false,
    isFocused: false,
    x: 280,
    y: 100,
    w: 480,
  },
  setup: {
    id: 'setup',
    title: 'SETUP.EXE — CALIBRATION',
    glyph: '⚡',
    isOpen: false,
    isFocused: false,
    x: 260,
    y: 75,
    w: 480,
  },
  auth: {
    id: 'auth',
    title: 'AUTH.EXE — GATEWAY & CLOUD',
    glyph: '🔑',
    isOpen: false,
    isFocused: false,
    x: 230,
    y: 65,
    w: 490,
  },
};

const ICONS_CONFIG: Array<{ id: AppId; name: string; glyph: string }> = [
  { id: 'missions', name: 'MISSIONS.EXE', glyph: '▚' },
  { id: 'syllabus', name: 'SYLLABUS.EXE', glyph: '⟳' },
  { id: 'stats', name: 'STATS.EXE', glyph: '📊' },
  { id: 'oracle', name: 'ORACLE.EXE', glyph: '🔮' },
  { id: 'pomo', name: 'POMODORO.EXE', glyph: '◔' },
  { id: 'review', name: 'REVIEW.EXE', glyph: '⟲' },
  { id: 'cohort', name: 'COHORT.EXE', glyph: '☰' },
  { id: 'pipeline', name: 'PIPELINE.EXE', glyph: '💼' },
  { id: 'log', name: 'SYSTEM.LOG', glyph: '≡' },
  { id: 'config', name: 'CONFIG.EXE', glyph: '⚙' },
  { id: 'setup', name: 'SETUP.EXE', glyph: '⚡' },
  { id: 'auth', name: 'AUTH.EXE', glyph: '🔑' },
  { id: 'readme', name: 'README.TXT', glyph: '?' },
];

interface GrindOSDesktopProps {
  onSwitchToWeb?: () => void;
  onGoToHome?: () => void;
}

export const GrindOSDesktop: React.FC<GrindOSDesktopProps> = ({ onSwitchToWeb, onGoToHome }) => {
  const { stats, streak, userProfile, soundEnabled, toggleSound, authUser, cloudSyncStatus, progress, solveHistory } = useProgress();

  // Boot state: check if already booted in session
  const [isBooted, setIsBooted] = useState<boolean>(() => {
    return sessionStorage.getItem('grindos_booted') === 'true';
  });

  // Color theme
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('grindos_theme') || 'green';
  });

  useEffect(() => {
    localStorage.setItem('grindos_theme', theme);
    if (theme === 'green') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Bonus XP from Pomodoros and Reviews
  const [bonusXP, setBonusXP] = useState<number>(() => {
    const saved = localStorage.getItem('grindos_bonus_xp');
    return saved ? Number(saved) : 0;
  });

  const addBonusXP = useCallback((amount: number) => {
    setBonusXP((prev) => {
      const next = prev + amount;
      localStorage.setItem('grindos_bonus_xp', String(next));
      return next;
    });
  }, []);

  const totalXP = (stats.solvedCount * 15) + (streak * 20) + bonusXP;

  // Window states
  const [windows, setWindows] = useState<Record<AppId, WindowState>>(() => {
    const initial: any = {};
    let z = 10;
    (Object.keys(INITIAL_WINDOWS) as AppId[]).forEach((key) => {
      initial[key] = {
        ...INITIAL_WINDOWS[key],
        zIndex: key === 'missions' ? ++z : z,
      };
    });
    return initial;
  });

  const highestZRef = useRef(20);

  // Selected icon on desktop
  const [selectedIcon, setSelectedIcon] = useState<AppId | null>('missions');

  // Start menu open
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  // Live ticking clock
  const [currentTime, setCurrentTime] = useState<string>(() => {
    return new Date().toTimeString().slice(0, 8);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toTimeString().slice(0, 8));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // System Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'boot-1',
      timestamp: new Date().toTimeString().slice(0, 8),
      message: 'kernel: grindos v2.4 boot sequence complete',
      type: 'ok',
    },
    {
      id: 'boot-2',
      timestamp: new Date().toTimeString().slice(0, 8),
      message: `user: operator ident verified [${userProfile.name}]`,
      type: 'ok',
    },
    {
      id: 'boot-3',
      timestamp: new Date().toTimeString().slice(0, 8),
      message: 'sr: spaced repetition ring buffer initialized (D3/7/21)',
      type: 'dim',
    },
    {
      id: 'boot-4',
      timestamp: new Date().toTimeString().slice(0, 8),
      message: 'desktop shell loaded — system operational',
      type: 'ok',
    },
  ]);

  const addSysLog = useCallback((message: string, type: 'ok' | 'warn' | 'dim' = 'ok') => {
    setLogs((prev) => [
      {
        id: Math.random().toString(36).slice(2, 9),
        timestamp: new Date().toTimeString().slice(0, 8),
        message,
        type,
      },
      ...prev.slice(0, 80),
    ]);
  }, []);

  // Window Focus
  const focusWindow = useCallback((id: AppId) => {
    highestZRef.current += 1;
    const currentZ = highestZRef.current;

    setWindows((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        const k = key as AppId;
        next[k] = {
          ...next[k],
          isFocused: k === id,
          ...(k === id ? { zIndex: currentZ } : {}),
        };
      });
      return next;
    });
  }, []);

  // Open App
  const openApp = useCallback((id: AppId) => {
    highestZRef.current += 1;
    const currentZ = highestZRef.current;

    setWindows((prev) => {
      const target = prev[id];
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        const k = key as AppId;
        next[k] = { ...next[k], isFocused: k === id };
      });
      next[id] = {
        ...target,
        isOpen: true,
        isFocused: true,
        zIndex: currentZ,
      };
      return next;
    });

    sounds.playOpenWindowSound();
    addSysLog(`exec: ${windows[id]?.title || id}`, 'ok');
  }, [addSysLog, windows]);

  // Close App
  const closeApp = useCallback((id: AppId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: false,
        isFocused: false,
      },
    }));
    sounds.playCloseWindowSound();
    addSysLog(`exit: ${windows[id]?.title.split(' —')[0] || id}`, 'dim');
  }, [addSysLog, windows]);

  // Dragging mechanics with clamping
  const draggingRef = useRef<{
    id: AppId | null;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({
    id: null,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  const handlePointerDown = (id: AppId, e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.x')) return;

    focusWindow(id);
    const win = windows[id];
    draggingRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: win.x,
      origY: win.y,
    };

    const handlePointerMove = (ev: PointerEvent) => {
      if (!draggingRef.current.id) return;
      const dx = ev.clientX - draggingRef.current.startX;
      const dy = ev.clientY - draggingRef.current.startY;
      const targetId = draggingRef.current.id;
      const targetWin = windows[targetId];

      const maxX = Math.max(0, window.innerWidth - (targetWin?.w || 320));
      const maxY = Math.max(0, window.innerHeight - 120);

      setWindows((prev) => ({
        ...prev,
        [targetId]: {
          ...prev[targetId],
          x: Math.min(maxX, Math.max(0, draggingRef.current.origX + dx)),
          y: Math.min(maxY, Math.max(0, draggingRef.current.origY + dy)),
        },
      }));
    };

    const handlePointerUp = () => {
      draggingRef.current.id = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const openList = Object.values(windows).filter((w) => w.isOpen);
        if (openList.length > 0) {
          const topWin = openList.sort((a, b) => b.zIndex - a.zIndex)[0];
          closeApp(topWin.id);
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openApp('missions');
      } else if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        openApp('pomo');
      } else if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        openApp('syllabus');
      } else if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleSound();
      } else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'w') || (e.altKey && e.key.toLowerCase() === 'o')) {
        if (onSwitchToWeb) {
          e.preventDefault();
          sounds.playTickSound();
          onSwitchToWeb();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        if (onGoToHome) {
          e.preventDefault();
          sounds.playTickSound();
          onGoToHome();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeApp, openApp, toggleSound, windows, onSwitchToWeb, onGoToHome]);

  // Handle Boot Complete
  const handleBootComplete = useCallback(() => {
    try {
      sessionStorage.setItem('grindos_booted', 'true');
    } catch {}
    setIsBooted(true);
    addSysLog('desktop shell loaded — system ready', 'ok');

    // If default user, open setup window
    if (userProfile.name === 'User') {
      setTimeout(() => openApp('setup'), 300);
    }
  }, [userProfile.name, openApp, addSysLog]);

  const currentDayNum = Math.min(Math.max(stats.currentDay || 1, 1), CURRICULUM.totalDays);
  const operatorHandle = userProfile.name.toLowerCase().replace(/\s+/g, '_');

  // Compute live active missions due count
  const todayDayPlan = React.useMemo(() => {
    for (const w of MERGED_PLAN_DATA) {
      for (const d of w.days) {
        if (d.day === currentDayNum) return d;
      }
    }
    return MERGED_PLAN_DATA[0].days[0];
  }, [currentDayNum]);

  const todayUnsolvedCount = React.useMemo(() => {
    return todayDayPlan.problems.filter((p) => !progress[p.id]).length;
  }, [todayDayPlan, progress]);

  // Compute live review queue due count
  const reviewsDueCount = React.useMemo(() => {
    let doneMap: Record<string, boolean> = {};
    try {
      const saved = localStorage.getItem('go_reviews_done');
      if (saved) doneMap = JSON.parse(saved);
    } catch {
      // ignore
    }
    const solvedKeys = Object.keys(solveHistory);
    if (solvedKeys.length === 0) {
      return 3 - (['LC-001', 'LC-121', 'LC-056'].filter((k) => doneMap[k]).length);
    }
    const queue = solvedKeys.slice(0, 8);
    return queue.filter((k) => !doneMap[k]).length;
  }, [solveHistory]);

  if (!isBooted) {
    return <BootScreen onComplete={handleBootComplete} />;
  }

  return (
    <div className="os-desktop" onClick={() => setIsStartMenuOpen(false)}>
      {/* Background Matrix Grid */}
      <div className="desktop-grid" />

      {/* Desktop Icons */}
      <div className="icons" onClick={(e) => e.stopPropagation()}>
        {ICONS_CONFIG.map((ic) => (
          <button
            key={ic.id}
            className={`icon ${selectedIcon === ic.id ? 'sel' : ''}`}
            onClick={() => {
              setSelectedIcon(ic.id);
              sounds.playSelectIconSound();
            }}
            onDoubleClick={() => openApp(ic.id)}
            title="Double click to launch"
          >
            <span className="glyph">{ic.glyph}</span>
            <span>{ic.name}</span>
          </button>
        ))}
      </div>

      {/* Windows Manager */}
      <div id="wins">
        {/* MISSIONS.EXE */}
        {windows.missions.isOpen && (
          <div
            className={`win ${windows.missions.isFocused ? 'focused' : ''}`}
            style={{
              width: windows.missions.w,
              left: windows.missions.x,
              top: windows.missions.y,
              zIndex: windows.missions.zIndex,
            }}
            onPointerDown={() => focusWindow('missions')}
          >
            <div
              className="tbar"
              onPointerDown={(e) => handlePointerDown('missions', e)}
            >
              <span>{windows.missions.glyph}</span>
              <span className="ttl">{windows.missions.title} — DAY {currentDayNum}</span>
              <button
                className="x"
                onClick={(e) => {
                  e.stopPropagation();
                  closeApp('missions');
                }}
              >
                X
              </button>
            </div>
            <MissionsWindow onLog={addSysLog} />
          </div>
        )}

        {/* SYLLABUS.EXE */}
        {windows.syllabus.isOpen && (
          <div
            className={`win ${windows.syllabus.isFocused ? 'focused' : ''}`}
            style={{
              width: windows.syllabus.w,
              left: windows.syllabus.x,
              top: windows.syllabus.y,
              zIndex: windows.syllabus.zIndex,
            }}
            onPointerDown={() => focusWindow('syllabus')}
          >
            <div
              className="tbar"
              onPointerDown={(e) => handlePointerDown('syllabus', e)}
            >
              <span>{windows.syllabus.glyph}</span>
              <span className="ttl">{windows.syllabus.title}</span>
              <button
                className="x"
                onClick={(e) => {
                  e.stopPropagation();
                  closeApp('syllabus');
                }}
              >
                X
              </button>
            </div>
            <SyllabusWindow onLog={addSysLog} />
          </div>
        )}

        {/* STATS.EXE */}
        {windows.stats.isOpen && (
          <div
            className={`win ${windows.stats.isFocused ? 'focused' : ''}`}
            style={{
              width: windows.stats.w,
              left: windows.stats.x,
              top: windows.stats.y,
              zIndex: windows.stats.zIndex,
            }}
            onPointerDown={() => focusWindow('stats')}
          >
            <div
              className="tbar"
              onPointerDown={(e) => handlePointerDown('stats', e)}
            >
              <span>{windows.stats.glyph}</span>
              <span className="ttl">{windows.stats.title}</span>
              <button
                className="x"
                onClick={(e) => {
                  e.stopPropagation();
                  closeApp('stats');
                }}
              >
                X
              </button>
            </div>
            <StatsWindow onLog={addSysLog} />
          </div>
        )}

        {/* ORACLE.EXE */}
        {windows.oracle.isOpen && (
          <div
            className={`win ${windows.oracle.isFocused ? 'focused' : ''}`}
            style={{
              width: windows.oracle.w,
              left: windows.oracle.x,
              top: windows.oracle.y,
              zIndex: windows.oracle.zIndex,
            }}
            onPointerDown={() => focusWindow('oracle')}
          >
            <div
              className="tbar"
              onPointerDown={(e) => handlePointerDown('oracle', e)}
            >
              <span>{windows.oracle.glyph}</span>
              <span className="ttl">{windows.oracle.title}</span>
              <button
                className="x"
                onClick={(e) => {
                  e.stopPropagation();
                  closeApp('oracle');
                }}
              >
                X
              </button>
            </div>
            <OracleWindow onLog={addSysLog} />
          </div>
        )}

        {/* POMODORO.EXE */}
        {windows.pomo.isOpen && (
          <div
            className={`win ${windows.pomo.isFocused ? 'focused' : ''}`}
            style={{
              width: windows.pomo.w,
              left: windows.pomo.x,
              top: windows.pomo.y,
              zIndex: windows.pomo.zIndex,
            }}
            onPointerDown={() => focusWindow('pomo')}
          >
            <div
              className="tbar"
              onPointerDown={(e) => handlePointerDown('pomo', e)}
            >
              <span>{windows.pomo.glyph}</span>
              <span className="ttl">{windows.pomo.title}</span>
              <button
                className="x"
                onClick={(e) => {
                  e.stopPropagation();
                  closeApp('pomo');
                }}
              >
                X
              </button>
            </div>
            <PomodoroWindow onLog={addSysLog} onAwardXP={addBonusXP} />
          </div>
        )}

        {/* REVIEW.EXE */}
        {windows.review.isOpen && (
          <div
            className={`win ${windows.review.isFocused ? 'focused' : ''}`}
            style={{
              width: windows.review.w,
              left: windows.review.x,
              top: windows.review.y,
              zIndex: windows.review.zIndex,
            }}
            onPointerDown={() => focusWindow('review')}
          >
            <div
              className="tbar"
              onPointerDown={(e) => handlePointerDown('review', e)}
            >
              <span>{windows.review.glyph}</span>
              <span className="ttl">{windows.review.title}</span>
              <button
                className="x"
                onClick={(e) => {
                  e.stopPropagation();
                  closeApp('review');
                }}
              >
                X
              </button>
            </div>
            <ReviewWindow onLog={addSysLog} onAwardXP={addBonusXP} />
          </div>
        )}

        {/* COHORT.EXE */}
        {windows.cohort.isOpen && (
          <div
            className={`win ${windows.cohort.isFocused ? 'focused' : ''}`}
            style={{
              width: windows.cohort.w,
              left: windows.cohort.x,
              top: windows.cohort.y,
              zIndex: windows.cohort.zIndex,
            }}
            onPointerDown={() => focusWindow('cohort')}
          >
            <div
              className="tbar"
              onPointerDown={(e) => handlePointerDown('cohort', e)}
            >
              <span>{windows.cohort.glyph}</span>
              <span className="ttl">{windows.cohort.title}</span>
              <button
                className="x"
                onClick={(e) => {
                  e.stopPropagation();
                  closeApp('cohort');
                }}
              >
                X
              </button>
            </div>
            <CohortWindow onLog={addSysLog} userXP={totalXP} />
          </div>
        )}

        {/* PIPELINE.EXE */}
        {windows.pipeline.isOpen && (
          <div
            className={`win ${windows.pipeline.isFocused ? 'focused' : ''}`}
            style={{
              width: windows.pipeline.w,
              left: windows.pipeline.x,
              top: windows.pipeline.y,
              zIndex: windows.pipeline.zIndex,
            }}
            onPointerDown={() => focusWindow('pipeline')}
          >
            <div
              className="tbar"
              onPointerDown={(e) => handlePointerDown('pipeline', e)}
            >
              <span>{windows.pipeline.glyph}</span>
              <span className="ttl">{windows.pipeline.title}</span>
              <button
                className="x"
                onClick={(e) => {
                  e.stopPropagation();
                  closeApp('pipeline');
                }}
              >
                X
              </button>
            </div>
            <PipelineWindow onLog={addSysLog} />
          </div>
        )}

        {/* SYSTEM.LOG */}
        {windows.log.isOpen && (
          <div
            className={`win ${windows.log.isFocused ? 'focused' : ''}`}
            style={{
              width: windows.log.w,
              left: windows.log.x,
              top: windows.log.y,
              zIndex: windows.log.zIndex,
            }}
            onPointerDown={() => focusWindow('log')}
          >
            <div
              className="tbar"
              onPointerDown={(e) => handlePointerDown('log', e)}
            >
              <span>{windows.log.glyph}</span>
              <span className="ttl">{windows.log.title}</span>
              <button
                className="x"
                onClick={(e) => {
                  e.stopPropagation();
                  closeApp('log');
                }}
              >
                X
              </button>
            </div>
            <LogWindow
              logs={logs}
              onClear={() => {
                setLogs([]);
                addSysLog('log buffer cleared', 'dim');
              }}
            />
          </div>
        )}

        {/* CONFIG.EXE */}
        {windows.config.isOpen && (
          <div
            className={`win ${windows.config.isFocused ? 'focused' : ''}`}
            style={{
              width: windows.config.w,
              left: windows.config.x,
              top: windows.config.y,
              zIndex: windows.config.zIndex,
            }}
            onPointerDown={() => focusWindow('config')}
          >
            <div
              className="tbar"
              onPointerDown={(e) => handlePointerDown('config', e)}
            >
              <span>{windows.config.glyph}</span>
              <span className="ttl">{windows.config.title}</span>
              <button
                className="x"
                onClick={(e) => {
                  e.stopPropagation();
                  closeApp('config');
                }}
              >
                X
              </button>
            </div>
            <ConfigWindow
              currentTheme={theme}
              onThemeChange={setTheme}
              onLog={addSysLog}
              onOpenAuth={() => openApp('auth')}
              onSwitchToWeb={onSwitchToWeb}
              onGoToHome={onGoToHome}
            />
          </div>
        )}

        {/* SETUP.EXE */}
        {windows.setup.isOpen && (
          <div
            className={`win ${windows.setup.isFocused ? 'focused' : ''}`}
            style={{
              width: windows.setup.w,
              left: windows.setup.x,
              top: windows.setup.y,
              zIndex: windows.setup.zIndex,
            }}
            onPointerDown={() => focusWindow('setup')}
          >
            <div
              className="tbar"
              onPointerDown={(e) => handlePointerDown('setup', e)}
            >
              <span>{windows.setup.glyph}</span>
              <span className="ttl">{windows.setup.title}</span>
              <button
                className="x"
                onClick={(e) => {
                  e.stopPropagation();
                  closeApp('setup');
                }}
              >
                X
              </button>
            </div>
            <SetupWindow
              currentTheme={theme}
              onThemeChange={setTheme}
              onLog={addSysLog}
              onClose={() => closeApp('setup')}
            />
          </div>
        )}

        {/* AUTH.EXE */}
        {windows.auth.isOpen && (
          <div
            className={`win ${windows.auth.isFocused ? 'focused' : ''}`}
            style={{
              width: windows.auth.w,
              left: windows.auth.x,
              top: windows.auth.y,
              zIndex: windows.auth.zIndex,
            }}
            onPointerDown={() => focusWindow('auth')}
          >
            <div
              className="tbar"
              onPointerDown={(e) => handlePointerDown('auth', e)}
            >
              <span>{windows.auth.glyph}</span>
              <span className="ttl">{windows.auth.title}</span>
              <button
                className="x"
                onClick={(e) => {
                  e.stopPropagation();
                  closeApp('auth');
                }}
              >
                X
              </button>
            </div>
            <AuthWindow onLog={addSysLog} onClose={() => closeApp('auth')} />
          </div>
        )}

        {/* README.TXT */}
        {windows.readme.isOpen && (
          <div
            className={`win ${windows.readme.isFocused ? 'focused' : ''}`}
            style={{
              width: windows.readme.w,
              left: windows.readme.x,
              top: windows.readme.y,
              zIndex: windows.readme.zIndex,
            }}
            onPointerDown={() => focusWindow('readme')}
          >
            <div
              className="tbar"
              onPointerDown={(e) => handlePointerDown('readme', e)}
            >
              <span>{windows.readme.glyph}</span>
              <span className="ttl">{windows.readme.title}</span>
              <button
                className="x"
                onClick={(e) => {
                  e.stopPropagation();
                  closeApp('readme');
                }}
              >
                X
              </button>
            </div>
            <ReadmeWindow />
          </div>
        )}
      </div>

      {/* Hint Bar */}
      <div id="hintbar">
        <span>ESC CLOSE ACTIVE WINDOW</span>
        <span>CTRL+K MISSIONS</span>
        <span>CTRL+P TIMER</span>
        <span>CTRL+S SYLLABUS</span>
        <span>CTRL+M MUTE/UNMUTE</span>
        <span>CLICK TITLEBAR TO DRAG</span>
        <span>DOUBLE-CLICK ICONS</span>
        <span>ALL DATA LOCAL (OFFLINE READY)</span>
      </div>

      {/* Taskbar */}
      <div id="taskbar" onClick={(e) => e.stopPropagation()}>
        <button
          className={`start ${isStartMenuOpen ? 'active' : ''}`}
          onClick={() => {
            setIsStartMenuOpen(!isStartMenuOpen);
            sounds.playStartMenuSound();
          }}
        >
          G//
        </button>

        {/* Open Windows Buttons */}
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto', maxWidth: '38vw' }}>
          {(Object.keys(windows) as AppId[])
            .filter((id) => windows[id].isOpen)
            .map((id) => {
              const w = windows[id];
              return (
                <button
                  key={id}
                  className={`task ${w.isOpen ? 'on' : ''} ${w.isFocused ? 'focused' : ''}`}
                  onClick={() => {
                    if (w.isFocused) {
                      closeApp(id);
                    } else {
                      focusWindow(id);
                      sounds.playTickSound();
                    }
                  }}
                  title={w.title}
                >
                  {w.glyph} {w.title.split(' —')[0]}
                </button>
              );
            })}
        </div>

        {/* System Tray */}
        <div id="tray">
          {onSwitchToWeb && (
            <button
              onClick={() => {
                sounds.playTickSound();
                onSwitchToWeb();
              }}
              style={{
                fontSize: 11,
                cursor: 'pointer',
                color: 'var(--amb)',
                border: '1px solid var(--amb)',
                padding: '1px 7px',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
              title="Switch to Modern Web Interface"
            >
              🌐 MODERN UI
            </button>
          )}
          <button
            onClick={() => openApp('auth')}
            style={{
              fontSize: 11,
              cursor: 'pointer',
              color: cloudSyncStatus === 'synced' ? 'var(--fg)' : cloudSyncStatus === 'syncing' ? 'var(--amb)' : 'var(--dim)',
              border: '1px solid var(--line)',
              padding: '1px 6px',
            }}
            title="Click to manage live cloud authentication and device sync"
          >
            ☁ {cloudSyncStatus === 'synced' ? 'SYNCED' : cloudSyncStatus === 'syncing' ? 'SYNCING...' : 'LOCAL'}
          </button>
          <button
            onClick={toggleSound}
            style={{ fontSize: 13, padding: '0 4px', cursor: 'pointer' }}
            title={soundEnabled ? 'Click to Mute Audio (Ctrl+M)' : 'Click to Unmute Audio (Ctrl+M)'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={() => openApp('auth')}
            style={{ cursor: 'pointer' }}
            title="Click to view operator identity"
          >
            OPERATOR: <b style={{ color: 'var(--fg)' }}>{operatorHandle}</b>
          </button>
          <span>
            DAY <b>{currentDayNum}</b>/{CURRICULUM.totalDays}
          </span>
          <span>
            XP <b>{totalXP.toLocaleString()}</b>
          </span>
          <span>
            STREAK <b>{streak}</b>🔥
          </span>
          <span className="tray-mem">
            MEM <b>640K</b> OK
          </span>
          <span style={{ color: 'var(--fg)' }}>{currentTime}</span>
        </div>
      </div>

      {/* Start Menu Popup */}
      {isStartMenuOpen && (
        <div id="startmenu" onClick={(e) => e.stopPropagation()}>
          <div className="sm-h">
            GRINDOS v2.4 — {userProfile.name.toUpperCase()}'S WORKSTATION
          </div>
          {ICONS_CONFIG.map((ic) => (
            <button
              key={ic.id}
              onClick={() => {
                openApp(ic.id);
                setIsStartMenuOpen(false);
              }}
            >
              <span>{ic.glyph} {ic.name}</span>
              {ic.id === 'missions' && (
                <span className="k2">{todayUnsolvedCount > 0 ? `${todayUnsolvedCount} DUE` : 'DONE ✓'}</span>
              )}
              {ic.id === 'review' && (
                <span className="k2">{reviewsDueCount > 0 ? `${reviewsDueCount} DUE` : 'CLEAR ✓'}</span>
              )}
              {ic.id === 'setup' && <span className="k2">CONFIG</span>}
              {ic.id === 'auth' && <span className="k2">{authUser ? 'ONLINE' : 'GATEWAY'}</span>}
            </button>
          ))}
          {onSwitchToWeb && (
            <button
              onClick={() => {
                sounds.playTickSound();
                setIsStartMenuOpen(false);
                onSwitchToWeb();
              }}
              style={{ borderTop: '1px solid var(--line)', color: 'var(--amb)' }}
            >
              <span>🌐 SWITCH TO MODERN WEB UI</span>
              <span className="k2">WEB</span>
            </button>
          )}
          {onGoToHome && (
            <button
              onClick={() => {
                sounds.playTickSound();
                setIsStartMenuOpen(false);
                onGoToHome();
              }}
              style={{ borderTop: '1px dashed var(--line)', color: 'var(--fg)' }}
            >
              <span>🏠 RETURN TO PORTAL / LANDING</span>
              <span className="k2">PORTAL</span>
            </button>
          )}
          <div className="sm-h" style={{ borderTop: '1px solid var(--line)' }}>
            NODE: {userProfile.tagline.toUpperCase()} · 100% OFFLINE
          </div>
        </div>
      )}
    </div>
  );
};
