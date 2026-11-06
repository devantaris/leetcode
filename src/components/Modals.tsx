import React from 'react';
import { BackupModal } from './modals/BackupModal';
import { ProfileModal } from './modals/ProfileModal';
import { ResumeModal } from './modals/ResumeModal';
import { RulesModal } from './modals/RulesModal';
import { StrategyModal } from './modals/StrategyModal';
import { ResetModal } from './modals/ResetModal';
import { PlacementTrackerModal } from './modals/PlacementTrackerModal';
import { ShareBadgeModal } from './modals/ShareBadgeModal';
import { PricingModal } from './modals/PricingModal';

interface ModalsProps {
  activeModal: 'rules' | 'strategy' | 'reset' | 'backup' | 'resume' | 'profile' | 'placements' | 'share' | 'pricing' | null;
  onClose: () => void;
  onTriggerImportFile?: () => void;
}

export const Modals: React.FC<ModalsProps> = ({ activeModal, onClose, onTriggerImportFile }) => {
  return (
    <>
      <BackupModal isOpen={activeModal === 'backup'} onClose={onClose} onTriggerImportFile={onTriggerImportFile} />
      <ProfileModal isOpen={activeModal === 'profile'} onClose={onClose} />
      <ResumeModal isOpen={activeModal === 'resume'} onClose={onClose} />
      <RulesModal isOpen={activeModal === 'rules'} onClose={onClose} />
      <StrategyModal isOpen={activeModal === 'strategy'} onClose={onClose} />
      <ResetModal isOpen={activeModal === 'reset'} onClose={onClose} />
      <PlacementTrackerModal isOpen={activeModal === 'placements'} onClose={onClose} />
      <ShareBadgeModal isOpen={activeModal === 'share'} onClose={onClose} />
      <PricingModal isOpen={activeModal === 'pricing'} onClose={onClose} />
    </>
  );
};
