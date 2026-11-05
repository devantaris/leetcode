import React, { useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import type { UserProfile } from '../../context/ProgressContext';
import { ModalWrapper } from './ModalWrapper';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { APP_CONFIG } from '../../config/appConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const [editRestDay, setEditRestDay] = useState<string>(userProfile.restDay || 'sunday');
  const [editSecondarySkill, setEditSecondarySkill] = useState<string>(userProfile.secondarySkill || 'project');

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
    toast.success("Profile saved!");
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-serif font-bold tracking-tight text-foreground">
            User Profile & Goals
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure your candidate identity, timeline dates, and study preferences.
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Candidate Name / Callsign
            </label>
            <Input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Tagline / Focus
            </label>
            <Input
              type="text"
              value={editTagline}
              onChange={(e) => setEditTagline(e.target.value)}
              placeholder="e.g. SDE Candidate"
              className="text-xs h-9"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Grind Start Date
              </label>
              <Input
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Target Placement Date
              </label>
              <Input
                type="date"
                value={editTargetDate}
                onChange={(e) => setEditTargetDate(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Rest & Recovery Day
              </label>
              <select
                value={editRestDay}
                onChange={(e) => setEditRestDay(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring"
              >
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Secondary Domain Skill
              </label>
              <select
                value={editSecondarySkill}
                onChange={(e) => setEditSecondarySkill(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring"
              >
                <option value="project">Personal Project</option>
                <option value="research">Research Paper / Thesis</option>
                <option value="competitive">Competitive Programming</option>
                <option value="systemdesign">System Design</option>
                <option value="openSource">Open Source Contributions</option>
                <option value="other">Rest & Recharge</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-border/50">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveProfile} className="text-xs">
            Save Changes
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
