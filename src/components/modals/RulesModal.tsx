import React from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useProgress } from '../../context/ProgressContext';
import { CURRICULUM } from '../../data/curriculumStats';

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            The 4 Discipline Rules
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            Standard operating procedure to build retention and speed.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            padding: '10px 12px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>1. Daily Practice (45–60 min)</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              Solve {CURRICULUM.dailyTarget} curated problems every practice day. Set the built-in focus stopwatch and solve without distraction.
            </div>
          </div>

          <div style={{
            padding: '10px 12px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>2. Weekly Blind Re-solve</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              Dedicate one day per week to re-solving 2 previous problems without checking prior notes or solution code.
            </div>
          </div>

          <div style={{
            padding: '10px 12px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>3. Live Weekly Contest</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              Join regular contests to test unseen problems under time constraints and strict test-case evaluation.
            </div>
          </div>

          <div style={{
            padding: '10px 12px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>4. Scheduled Recovery Day</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              {hasRestDay
                ? `Take ${restLabel} completely off from DSA. Spend it on ${skillLabel} or rest.`
                : 'Take regular rest days when needed to prevent burnout.'}
            </div>
          </div>
        </div>

        {/* Global Keyboard Shortcuts */}
        <div style={{
          marginTop: 6, padding: '12px', background: 'var(--bg-card)',
          border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-accent)', marginBottom: 8 }}>
            ⚡ Global Hotkeys
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Command Palette:</span>
              <kbd style={{ padding: '1px 5px', borderRadius: 3, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>⌘K / Ctrl+K</kbd>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Audio Mute / Play:</span>
              <kbd style={{ padding: '1px 5px', borderRadius: 3, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>Ctrl+M</kbd>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Rules &amp; Hotkeys:</span>
              <kbd style={{ padding: '1px 5px', borderRadius: 3, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>?</kbd>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Dismiss Modals:</span>
              <kbd style={{ padding: '1px 5px', borderRadius: 3, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>ESC</kbd>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button onClick={onClose} className="btn btn-default">
            Got It
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
