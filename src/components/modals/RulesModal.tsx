import React from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useProgress } from '../../context/ProgressContext';
import { CURRICULUM } from '../../data/curriculumStats';
import { CheckCircle2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REST_DAY_LABELS: Record<string, string> = {
  sunday: 'Sundays',
  saturday: 'Saturdays',
  none: 'No scheduled rest day',
};

const SKILL_LABELS: Record<string, string> = {
  project: 'personal projects',
  research: 'research papers',
  competitive: 'competitive programming',
  'system-design': 'system design',
  'open-source': 'open source contributions',
  other: 'other interests',
};

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const { userProfile } = useProgress();
  const restLabel = REST_DAY_LABELS[userProfile.restDay] || 'Sundays';
  const skillLabel = SKILL_LABELS[userProfile.secondarySkill] || 'personal projects';
  const hasRestDay = userProfile.restDay !== 'none';

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Core Rules">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Shield className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold tracking-tight text-foreground">
              Rules of Engagement
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Standard operating procedures for interview retention and speed.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 flex flex-col gap-1">
            <div className="text-xs font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-primary" />
              <span>1. Daily High-Focus Practice (45–60 min)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-5.5">
              Solve {CURRICULUM.dailyTarget} curated problems every practice day. Set the built-in focus stopwatch and solve without distraction or early peek at solutions.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 flex flex-col gap-1">
            <div className="text-xs font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-primary" />
              <span>2. Weekly Blind Re-solve</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-5.5">
              Dedicate one day per week to re-solving 2 previous problems completely from scratch without checking prior notes or solution code.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 flex flex-col gap-1">
            <div className="text-xs font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-primary" />
              <span>3. Live Weekly Contest</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-5.5">
              Join regular contests to test unseen problems under time constraints, edge cases, and strict test-case evaluation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 flex flex-col gap-1">
            <div className="text-xs font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-primary" />
              <span>4. Scheduled Recovery Day</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-5.5">
              {hasRestDay
                ? `Take ${restLabel} completely off from DSA. Spend it on ${skillLabel} or rest to avoid cognitive burnout.`
                : 'Take regular rest days when needed to prevent burnout.'}
            </p>
          </div>
        </div>

        {/* Global Keyboard Shortcuts */}
        <div className="p-3 rounded-xl border border-border/50 bg-card flex flex-col gap-2">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-primary">
            ⚡ Global Hotkeys
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Command Search:</span>
              <kbd className="px-1.5 py-0.5 rounded border border-border/60 bg-muted text-foreground text-[10px]">
                ⌘K / Ctrl+K
              </kbd>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Toggle Audio:</span>
              <kbd className="px-1.5 py-0.5 rounded border border-border/60 bg-muted text-foreground text-[10px]">
                Ctrl+M
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border/50">
          <Button size="sm" onClick={onClose} className="text-xs">
            Understood
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
