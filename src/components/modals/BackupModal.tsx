import React, { useState } from 'react';
import { Database, Download, Upload, Copy, Check } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { ModalWrapper } from './ModalWrapper';
import toast from 'react-hot-toast';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerImportFile?: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onTriggerImportFile }) => {
  const { exportJSON, exportJSONString, importJSON } = useProgress();
  const [pasteString, setPasteString] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

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
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Backup & Sync">
      <div>
        <div className="flex items-center gap-2 text-green-400 font-extrabold text-lg mb-2">
          <Database className="w-5 h-5" />
          <span>BACKUP & SYNC PROGRESS</span>
        </div>

        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Your progress is saved locally in browser <strong className="text-white">localStorage</strong>. You can backup your progress data as a file or text string to sync between devices.
        </p>

        <div className="space-y-4">
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
    </ModalWrapper>
  );
};
