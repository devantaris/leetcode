import React, { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useProgress } from '../../context/ProgressContext';
import { Share2, Copy, Check, Flame, Award, Target, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { APP_CONFIG } from '../../config/appConfig';

interface ShareBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareBadgeModal: React.FC<ShareBadgeModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, stats, authUser } = useProgress();
  const [copied, setCopied] = useState(false);

  const displayName = authUser?.displayName || userProfile.name || 'Operator';
  const targetCompany = userProfile.targetCompany || 'Top Tech Roles';

  const shareText = `🚀 GrindOS Placement Progress Update:
👤 ${displayName} (${userProfile.tagline || 'Software Engineer'})
🎯 Target: ${targetCompany}
📊 Solved: ${stats.solvedCount}/${stats.totalProblems} problems
🔥 Active Streak: ${stats.streak} days
📈 Placement Readiness: ${stats.oddsPercentage}% benchmark

Preparing for top tech hiring loops with GrindOS!
${window.location.origin}`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success('Progress summary copied to clipboard! 📋');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const handleShareTwitter = () => {
    const tweetText = `Just hit Day ${stats.currentDay} on GrindOS! 🚀
Solved: ${stats.solvedCount}/${stats.totalProblems} | 🔥 ${stats.streak}d streak
Readiness Index: ${stats.oddsPercentage}% | Target: ${targetCompany}
#LeetCode #DSA #CodingInterview`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent('https://leetcode-psi.vercel.app')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://leetcode-psi.vercel.app')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Share Placement Badge">
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Share2 className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold tracking-tight text-foreground">
                Candidate Velocity Badge
              </h2>
              <p className="text-xs text-muted-foreground">
                Share your interview readiness and algorithmic momentum
              </p>
            </div>
          </div>
        </div>

        {/* The Visual Candidate Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-primary/30 shadow-md flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-foreground font-sans">{displayName}</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono text-primary border-primary/30 bg-primary/10">
                  {APP_CONFIG.shortName} Verified
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {userProfile.tagline || 'Software Engineer'} • Target: <strong className="text-foreground">{targetCompany}</strong>
              </p>
            </div>

            <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-mono font-bold text-xs shadow-xs">
              {APP_CONFIG.shortName}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl border border-border/60 bg-background/80 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground uppercase font-mono">
                <Target className="size-3 text-primary" />
                <span>Solved</span>
              </div>
              <div className="text-lg font-mono font-bold text-foreground mt-0.5">
                {stats.solvedCount}
              </div>
              <div className="text-[9px] text-muted-foreground">of {stats.totalProblems}</div>
            </div>

            <div className="p-2.5 rounded-xl border border-border/60 bg-background/80 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground uppercase font-mono">
                <Flame className="size-3 text-amber-500" />
                <span>Streak</span>
              </div>
              <div className="text-lg font-mono font-bold text-amber-500 mt-0.5">
                {stats.streak}d
              </div>
              <div className="text-[9px] text-muted-foreground">consecutive</div>
            </div>

            <div className="p-2.5 rounded-xl border border-border/60 bg-background/80 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground uppercase font-mono">
                <Award className="size-3 text-emerald-500" />
                <span>Readiness</span>
              </div>
              <div className="text-lg font-mono font-bold text-emerald-500 mt-0.5">
                {stats.oddsPercentage}%
              </div>
              <div className="text-[9px] text-muted-foreground">benchmark</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40 font-mono">
            <span>Day {stats.currentDay} / {stats.totalProblems} target</span>
            <span>leetcode-psi.vercel.app</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <Button
            onClick={handleCopyText}
            className="w-full text-xs h-9.5 gap-2 font-semibold"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Summary Text'}</span>
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleShareTwitter}
              className="flex-1 text-xs h-9 gap-1.5"
            >
              <ExternalLink className="size-3.5" />
              <span>Share on X / Twitter</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleShareLinkedIn}
              className="flex-1 text-xs h-9 gap-1.5"
            >
              <ExternalLink className="size-3.5" />
              <span>Share on LinkedIn</span>
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
