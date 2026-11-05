import React, { useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { ModalWrapper } from './ModalWrapper';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      toast.success('All progress successfully reset.');
      onClose();
    } else {
      toast.error('Type RESET to confirm.');
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Reset All Data">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0">
            <AlertTriangle className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold tracking-tight text-destructive">
              Danger Zone: Reset All Data
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              This action permanently clears all stored progress, streaks, and placement logs.
            </p>
          </div>
        </div>

        <Alert className="border-destructive/30 bg-destructive/10 text-destructive text-xs py-3">
          <AlertDescription className="text-xs leading-relaxed m-0">
            You are about to erase <strong className="font-semibold text-foreground">{stats.solvedCount} solved problems</strong>, your <strong className="font-semibold text-foreground">{stats.streak}-day streak</strong>, and all company interview pipeline records.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Type <span className="font-mono font-bold text-destructive">RESET</span> to confirm:
            </label>
            <Input
              type="text"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
              placeholder="RESET"
              className="text-xs h-9 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-border/50">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmReset}
              disabled={resetInput.trim() !== 'RESET'}
              className="text-xs"
            >
              Permanently Erase
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
