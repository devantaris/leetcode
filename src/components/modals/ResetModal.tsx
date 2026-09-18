import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
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
      toast.error("Incorrect keyword. Type RESET to confirm.");
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Reset All Data">
      <div>
        <div className="flex items-center gap-2 text-red-500 font-extrabold text-lg mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span>DATA RESET</span>
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
    </ModalWrapper>
  );
};
