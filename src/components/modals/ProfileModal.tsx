import React, { useState } from 'react';
import { User, Tag, Calendar } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import type { UserProfile } from '../../context/ProgressContext';
import { ModalWrapper } from './ModalWrapper';
import toast from 'react-hot-toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateProfile } = useProgress();
  
  const [editName, setEditName] = useState<string>(userProfile.name);
  const [editTagline, setEditTagline] = useState<string>(userProfile.tagline);
  const [editStartDate, setEditStartDate] = useState<string>(userProfile.startDate);
  const [editTargetDate, setEditTargetDate] = useState<string>(userProfile.targetDate || '2027-01-15');
  const [editRestDay, setEditRestDay] = useState<string>(userProfile.restDay || 'Sunday');
  const [editSecondarySkill, setEditSecondarySkill] = useState<string>(userProfile.secondarySkill || 'Personal Project');

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    const profile: UserProfile = {
      name: editName.trim(),
      tagline: editTagline.trim() || 'LeetCode Planner',
      startDate: editStartDate,
      targetDate: editTargetDate || '2027-01-15',
      restDay: editRestDay,
      secondarySkill: editSecondarySkill,
    };
    updateProfile(profile);
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div>
        <div className="flex items-center gap-2 text-orange-400 font-extrabold text-lg mb-2">
          <User className="w-5 h-5" />
          <span>EDIT PROFILE</span>
        </div>
        <p className="text-xs text-gray-400 mb-5 leading-relaxed">
          Update your display name, tagline, or program start date.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-400" />
              Your Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              Tagline
            </label>
            <input
              type="text"
              value={editTagline}
              onChange={(e) => setEditTagline(e.target.value)}
              placeholder="e.g. IIT Delhi CSE"
              className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-yellow-400" />
              Placement / Goal Deadline
            </label>
            <input
              type="date"
              value={editTargetDate}
              onChange={(e) => setEditTargetDate(e.target.value)}
              className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition [color-scheme:dark]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              Program Start Date
            </label>
            <input
              type="date"
              value={editStartDate}
              onChange={(e) => setEditStartDate(e.target.value)}
              className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition [color-scheme:dark]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              Rest Day
            </label>
            <select
              value={editRestDay}
              onChange={(e) => setEditRestDay(e.target.value)}
              className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition"
            >
              <option value="Sunday">Sunday</option>
              <option value="Saturday">Saturday</option>
              <option value="None">None</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              Secondary Skill
            </label>
            <select
              value={editSecondarySkill}
              onChange={(e) => setEditSecondarySkill(e.target.value)}
              className="w-full bg-[#0c0c14] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition"
            >
              <option value="Personal Project">Personal Project</option>
              <option value="Research Paper">Research Paper</option>
              <option value="Competitive Programming">Competitive Programming</option>
              <option value="System Design">System Design</option>
              <option value="Open Source">Open Source</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-sm transition shadow-lg shadow-orange-500/20 mt-1"
          >
            Save Profile
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
