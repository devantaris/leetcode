import React, { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { Check, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { useProgress } from '../../context/ProgressContext';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { isPro, upgradeToPro, authUser } = useProgress();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleSelectPlan = async (tier: string) => {
    if (tier === 'free') {
      toast.success('You are currently enjoying the Free Community Plan! 🚀');
      onClose();
      return;
    }

    if (isPro) {
      toast.success('You are already an active Lifetime Pro member! 🌟');
      onClose();
      return;
    }

    if (!authUser) {
      toast.error('Please sign in or create an account first to link your Pro license.');
      return;
    }

    const stripeUrl = import.meta.env.VITE_STRIPE_PAYMENT_URL as string | undefined;
    if (stripeUrl) {
      toast.success('Redirecting to secure Stripe Checkout... 💳');
      window.open(stripeUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Direct Sandbox / Beta Pro License activation
    setIsUpgrading(true);
    const success = await upgradeToPro();
    setIsUpgrading(false);

    if (success) {
      sounds.playVictorySound();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      toast.success('🎉 Lifetime Pro activated! All advanced capabilities unlocked.');
      onClose();
    } else {
      toast.error('Could not activate Pro license. Please check your cloud connection.');
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Plans & Licensing">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center max-w-sm mx-auto flex flex-col gap-1.5">
          <Badge variant="outline" className="w-fit mx-auto text-[10px] font-mono text-primary border-primary/30 bg-primary/10">
            Transparent Pricing
          </Badge>
          <h2 className="text-xl font-serif font-bold text-foreground tracking-tight m-0">
            Built for Engineers Landing Tier-1 Roles
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Production cloud-synced software. Keep your data, study in cohorts, and maximize interview velocity.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Free Community */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card flex flex-col justify-between gap-5 shadow-xs">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">Community</span>
                <Badge variant="secondary" className="text-[10px] font-mono">{isPro ? 'Included' : 'Current'}</Badge>
              </div>

              <div>
                <div className="text-2xl font-bold font-mono text-foreground">$0</div>
                <div className="text-[11px] text-muted-foreground">Free forever • No credit card</div>
              </div>

              <div className="h-px bg-border/40 my-1" />

              <div className="flex flex-col gap-2 text-xs">
                {[
                  'Complete 140-day curriculum (332 problems)',
                  'Live Supabase cloud persistence & multi-device sync',
                  'Daily streaks & catch-up backlog queue',
                  'Global leaderboard access',
                  'Pomodoro deep work timer & tactile sounds',
                  'JSON backup & restore anytime',
                ].map((feat) => (
                  <div key={feat} className="flex items-start gap-2">
                    <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-[11px] leading-relaxed">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={!isPro}
              onClick={() => handleSelectPlan('free')}
              className="w-full text-xs h-9"
            >
              {isPro ? 'Included' : 'Current Plan'}
            </Button>
          </div>

          {/* Card 2: Pro Lifetime (Featured) */}
          <div className="p-5 rounded-2xl border-2 border-primary bg-primary/5 flex flex-col justify-between gap-5 relative shadow-md">
            <div className="absolute -top-2.5 right-4">
              <Badge className={`font-mono font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 shadow-xs ${isPro ? 'bg-emerald-600 text-white' : 'bg-primary text-primary-foreground'}`}>
                {isPro ? 'Active License' : 'Beta Access'}
              </Badge>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Pro Member</span>
                </span>
                <span className="font-mono text-xs text-primary font-bold">Lifetime</span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-foreground">$29</span>
                  <span className="text-xs text-muted-foreground">one-time</span>
                </div>
                <div className="text-[11px] text-muted-foreground">Pay once • Lifetime updates</div>
              </div>

              <div className="h-px bg-primary/20 my-1" />

              <div className="flex flex-col gap-2 text-xs">
                {[
                  'Everything in Community tier',
                  'Top 150 benchmark & company-tagged questions',
                  'Private study cohort creation & code invites',
                  'Transparent 4-factor placement readiness scoring',
                  'Candidate velocity badge & social card sharing',
                  'Interview pipeline tracker with round notes',
                  'Cloud sync across unlimited browsers & devices',
                ].map((feat) => (
                  <div key={feat} className="flex items-start gap-2">
                    <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground text-[11px] font-medium leading-relaxed">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {isPro ? (
              <Button
                size="sm"
                disabled
                className="w-full text-xs h-9 font-semibold gap-1.5 bg-emerald-600 text-white opacity-100 cursor-default"
              >
                <Check className="size-3.5" />
                <span>Active Lifetime Pro Plan</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleSelectPlan('pro')}
                disabled={isUpgrading}
                className="w-full text-xs h-9 font-semibold gap-1.5"
              >
                <span>{isUpgrading ? 'Activating Pro License...' : 'Activate Pro Access ($29)'}</span>
                <ArrowRight className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 flex items-center gap-3 text-xs text-muted-foreground">
          <Shield className="size-5 text-primary shrink-0" />
          <span>
            100% money-back guarantee for 14 days. Zero vendor lock-in with one-click full data export.
          </span>
        </div>
      </div>
    </ModalWrapper>
  );
};
