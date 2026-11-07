import React from 'react';
import { ModalWrapper } from './ModalWrapper';
import { Terminal, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';
import { sounds } from '../../utils/audio';
import toast from 'react-hot-toast';

interface DemoChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode?: (mode: 'os' | 'web') => void;
}

export const DemoChoiceModal: React.FC<DemoChoiceModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
}) => {
  const navigate = useNavigate();
  const { loadDemoData } = useProgress();

  const handleLaunchDemo = (mode: 'os' | 'web') => {
    sounds.playTickSound();
    loadDemoData();
    try {
      localStorage.setItem('grindos_ui_mode', mode);
    } catch {
      // ignore
    }

    toast.success(
      mode === 'os'
        ? 'Booting Retro Terminal OS Demo! 👾'
        : 'Loaded Modern Bento Sandbox! 🚀'
    );

    onClose();

    if (onSelectMode) {
      onSelectMode(mode);
    } else {
      navigate(mode === 'os' ? '/os' : '/dashboard');
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Choose Your Interactive Demo">
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            <Zap className="size-3.5" />
            <span>Interactive Guest Sandbox</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Choose Your Test Drive Experience
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
            Test drive GrindOS with pre-loaded solve history, streaks, and telemetry. No account or credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Modern Bento Dashboard */}
          <div className="p-5 rounded-2xl border-2 border-border/80 bg-card hover:border-primary/50 transition-all flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-muted">
                  Modern Dashboard
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono">Linear Fidelity</span>
              </div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span>Cadence Pro Web</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Sleek midnight obsidian layout with 25-week progress telemetry, company tracks, and structured Kanban interview board.
              </p>
            </div>

            <Button
              onClick={() => handleLaunchDemo('web')}
              className="w-full mt-5 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Launch Modern Demo</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>

          {/* Card 2: Retro Terminal OS */}
          <div className="p-5 rounded-2xl border-2 border-emerald-900/60 bg-[#020403] hover:border-emerald-500/50 transition-all flex flex-col justify-between shadow-xs text-left">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded">
                  90s Terminal OS
                </span>
                <span className="text-[10px] text-emerald-600 font-mono">VT220 • Synth</span>
              </div>
              <h3 className="text-base font-bold text-emerald-400 font-mono flex items-center gap-2">
                <Terminal className="size-4 text-emerald-400" />
                <span>GrindOS 95 Shell</span>
              </h3>
              <p className="text-xs text-emerald-600/90 font-mono mt-2 leading-relaxed">
                Draggable multi-window desktop manager with VT220 terminal CLI, CRT phosphor effects, and chiptune audio feedback.
              </p>
            </div>

            <Button
              onClick={() => handleLaunchDemo('os')}
              className="w-full mt-5 text-xs font-mono font-bold gap-1.5 cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-black border border-emerald-400"
            >
              <Terminal className="size-3.5" />
              <span>Launch Retro OS Demo</span>
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t border-border/60 flex items-center justify-center gap-2 text-[11px] text-muted-foreground text-center">
          <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
          <span>Guest session is safe. Create a free account anytime to sync to the cloud.</span>
        </div>
      </div>
    </ModalWrapper>
  );
};
