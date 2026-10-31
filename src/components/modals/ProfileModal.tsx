import React, { useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import type { UserProfile } from '../../context/ProgressContext';
import { ModalWrapper } from './ModalWrapper';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { APP_CONFIG } from '../../config/appConfig';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateProfile } = useProgress();
  
  const [editName, setEditName] = useState<string>(userProfile.name);
  const [editTagline, setEditTagline] = useState<string>(userProfile.tagline);
  const [editStartDate, setEditStartDate] = useState<string>(userProfile.startDate);
  const [editTargetDate, setEditTargetDate] = useState<string>(userProfile.targetDate || format(addDays(new Date(), 140), 'yyyy-MM-dd'));
  const editRestDay = userProfile.restDay || 'sunday';
  const editSecondarySkill = userProfile.secondarySkill || 'project';

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    const profile: UserProfile = {
      name: editName.trim(),
      tagline: editTagline.trim() || APP_CONFIG.defaults.defaultTagline,
      startDate: editStartDate,
      targetDate: editTargetDate || format(addDays(new Date(), 140), 'yyyy-MM-dd'),
      restDay: editRestDay,
      secondarySkill: editSecondarySkill,
    };
    updateProfile(profile);
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            User Profile
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            Update your display identity, target dates, and rest preferences.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
              Your Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
              Tagline / Focus
            </label>
            <input
              type="text"
              value={editTagline}
              onChange={(e) => setEditTagline(e.target.value)}
              placeholder="e.g. SDE Candidate"
              className="input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                Start Date
              </label>
              <input
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                Target Deadline
              </label>
              <input
                type="date"
                value={editTargetDate}
                onChange={(e) => setEditTargetDate(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button onClick={onClose} className="btn btn-default">
            Cancel
          </button>
          <button onClick={handleSaveProfile} className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
