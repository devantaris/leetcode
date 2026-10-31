import React, { useState } from 'react';
import { Download, Upload, Copy, Check } from 'lucide-react';
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            Backup & Sync Hub
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            Your data is stored locally. Export or import JSON files to sync across devices.
          </p>
        </div>

        {/* Actions grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{
            padding: '12px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Export Data</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Download full progress file</div>
            <button onClick={exportJSON} className="btn btn-default" style={{ fontSize: 12, width: '100%', marginTop: 'auto' }}>
              <Download size={13} /> Download JSON
            </button>
          </div>

          <div style={{
            padding: '12px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Import File</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Restore from previous JSON</div>
            <button
              onClick={() => {
                onTriggerImportFile?.();
                onClose();
              }}
              className="btn btn-default"
              style={{ fontSize: 12, width: '100%', marginTop: 'auto' }}
            >
              <Upload size={13} /> Select File
            </button>
          </div>
        </div>

        {/* Copy / Paste quick sync */}
        <div style={{
          padding: '12px', background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
          display: 'flex', flexDirection: 'column', gap: 8
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Quick Clipboard Sync</span>
            <button onClick={handleCopyJSON} className="btn btn-ghost" style={{ fontSize: 11, padding: '3px 8px' }}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy Data'}
            </button>
          </div>

          <textarea
            rows={2}
            value={pasteString}
            onChange={(e) => setPasteString(e.target.value)}
            placeholder="Paste exported JSON text here to restore..."
            className="input"
            style={{ fontSize: 11, fontFamily: 'var(--font-mono)', resize: 'none' }}
          />

          {pasteString.trim() && (
            <button onClick={handlePasteImport} className="btn btn-primary" style={{ fontSize: 12 }}>
              Apply Pasted Data
            </button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
