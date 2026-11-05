import React, { useState } from 'react';
import { Download, Upload, Copy, Check, Cloud, RefreshCw } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { ModalWrapper } from './ModalWrapper';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerImportFile?: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onTriggerImportFile }) => {
  const { exportJSON, exportJSONString, importJSON, authUser, cloudSyncStatus, lastCloudSync, triggerCloudSync } = useProgress();
  const [pasteString, setPasteString] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    const ok = await triggerCloudSync();
    setIsSyncing(false);
    if (ok) {
      toast.success("Progress pushed to cloud! ☁️");
    } else {
      toast.error("Cloud sync failed. Check database connection.");
    }
  };

  const handleCopyJSON = () => {
    const jsonStr = exportJSONString();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    toast.success("Progress copied to clipboard.");
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
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Backup & Sync">
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-serif font-bold tracking-tight text-foreground">
            Data Portability & Backup Hub
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your solves are safely preserved. Export or restore JSON backups to synchronize across devices.
          </p>
        </div>

        {/* Cloud Sync Status Card */}
        <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Cloud className="size-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">
                {authUser ? `Cloud Connected: ${authUser.displayName}` : 'Local Offline Mode'}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                {authUser
                  ? `Status: ${cloudSyncStatus.toUpperCase()} ${lastCloudSync ? `· Last: ${lastCloudSync.toLocaleTimeString()}` : ''}`
                  : 'Progress saved in browser storage only'}
              </div>
            </div>
          </div>
          {authUser && (
            <Button
              variant="outline"
              size="xs"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="text-xs h-7 gap-1"
            >
              <RefreshCw className={`size-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
            </Button>
          )}
        </div>

        {/* Actions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-border/50 bg-card flex flex-col gap-2">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Download className="size-3.5 text-primary" />
              <span>Export Solves</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Download your complete solve map, notes, and milestones as a JSON file.
            </p>
            <div className="flex gap-2 mt-auto pt-2">
              <Button size="xs" onClick={exportJSON} className="flex-1 text-xs h-7.5">
                Download .json
              </Button>
              <Button variant="outline" size="xs" onClick={handleCopyJSON} className="text-xs h-7.5">
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              </Button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/50 bg-card flex flex-col gap-2">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Upload className="size-3.5 text-primary" />
              <span>Restore Backup</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Upload a previously downloaded JSON backup file to restore your progress.
            </p>
            <div className="mt-auto pt-2">
              {onTriggerImportFile && (
                <Button variant="outline" size="xs" onClick={onTriggerImportFile} className="w-full text-xs h-7.5">
                  Select File (.json)
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Paste JSON Raw Import */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
          <label className="text-xs font-medium text-foreground">
            Or Paste Raw JSON String
          </label>
          <textarea
            value={pasteString}
            onChange={(e) => setPasteString(e.target.value)}
            placeholder="Paste your JSON backup data here..."
            className="w-full h-18 rounded-md border border-input bg-background p-2.5 text-xs font-mono text-foreground outline-none focus:border-ring resize-none"
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="xs" onClick={onClose}>
              Close
            </Button>
            <Button size="xs" onClick={handlePasteImport} disabled={!pasteString.trim()}>
              Import String
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
