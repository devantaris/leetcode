import React, { useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { ModalWrapper } from './ModalWrapper';
import toast from 'react-hot-toast';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose }) => {
  const { stats, resetAll } = useProgress();
  const [resetInput, setResetInput] = useState<string>('');

  const handleConfirmReset = () => {
    if (resetInput.trim() === 'RESET') {
      resetAll();
      setResetInput('');
      onClose();
    } else {
      toast.error("Type RESET to confirm.");
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Reset All Data">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: 'var(--color-danger-text)' }}>
            Reset All Data
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            This action permanently erases your locally stored progress.
          </p>
        </div>

        <div style={{
          padding: '12px', background: 'var(--color-danger-bg)',
          border: '1px solid var(--color-danger-border)', borderRadius: 'var(--radius-md)',
          fontSize: 12, color: 'var(--color-danger-text)', lineHeight: 1.5
        }}>
          Warning: Erasing <strong style={{ color: 'var(--text-primary)' }}>{stats.solvedCount} solved problems</strong>, your <strong style={{ color: 'var(--text-primary)' }}>{stats.streak}-day streak</strong>, and all placement tracking records.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Type <strong style={{ color: 'var(--color-danger-text)' }}>RESET</strong> to confirm:
            </label>
            <input
              type="text"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
              placeholder="RESET"
              className="input"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button onClick={onClose} className="btn btn-default">
              Cancel
            </button>
            <button onClick={handleConfirmReset} className="btn btn-danger">
              Erase Everything
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
