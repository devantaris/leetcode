import React, { useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Modals } from './components/Modals';
import { CommandPalette } from './components/CommandPalette';
import { useProgress } from './context/ProgressContext';
import { Toaster } from 'react-hot-toast';

export const Layout: React.FC = () => {
  const { importJSON } = useProgress();
  const [activeModal, setActiveModal] = useState<'rules' | 'strategy' | 'reset' | 'backup' | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importJSON(content);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#060609] text-gray-100 flex flex-col justify-between selection:bg-orange-500 selection:text-black">
      
      <div>
        {/* STICKY NAVBAR */}
        <Navbar
          onOpenRules={() => setActiveModal('rules')}
          onOpenStrategy={() => setActiveModal('strategy')}
          onOpenReset={() => setActiveModal('reset')}
          onOpenBackup={() => setActiveModal('backup')}
          onTriggerImport={handleTriggerImport}
        />

        {/* HIDDEN JSON FILE INPUT */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        {/* PAGE CONTENT OUTLET */}
        <main>
          <Outlet />
        </main>
      </div>

      {/* FOOTER */}
      <footer className="w-full text-center py-6 text-xs text-gray-500 font-mono border-t border-gray-800/40 bg-[#08080c]">
        DSA ULTIMATUM PRO • Devansh Kumar • Bennett University CSE (CGPA 8.75) • Target: Jan 2027 Placements
      </footer>

      {/* MODALS */}
      <Modals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onTriggerImportFile={handleTriggerImport}
      />

      {/* COMMAND PALETTE (CTRL+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* TOAST NOTIFICATIONS CONTAINER */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#101018',
            color: '#fff',
            border: '1px solid #2e2e46',
            borderRadius: '12px',
            fontSize: '12px',
            fontFamily: 'JetBrains Mono, monospace'
          }
        }}
      />

    </div>
  );
};
