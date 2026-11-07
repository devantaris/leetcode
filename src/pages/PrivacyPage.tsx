import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowLeft, ShieldCheck, Database, KeyRound, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '../config/appConfig';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/80 pb-6">
        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Lock className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight m-0">
              Privacy Policy
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Last updated: November 2026 • Privacy-by-design &amp; Cloud Security
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-sm dark:prose-invert max-w-none flex flex-col gap-6 text-foreground/90 leading-relaxed text-sm">
        <section className="p-5 rounded-2xl bg-card border border-border/70 flex flex-col gap-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 m-0">
            <EyeOff className="size-4 text-primary" />
            <span>1. Zero Third-Party Advertising &amp; No Telemetry</span>
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed m-0">
            {APP_CONFIG.name} does not run third-party advertising scripts, behavioral tracking cookies, or commercial telemetry beacons. We do not sell, rent, or trade your data to third parties under any circumstances.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-card border border-border/70 flex flex-col gap-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 m-0">
            <Database className="size-4 text-primary" />
            <span>2. Cloud Persistence &amp; Row Level Security</span>
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed m-0">
            All your solve records, problem approach notes, flagged review queues, and interview applications are stored directly in your secure Supabase PostgreSQL database. PostgreSQL Row-Level Security (RLS) policies ensure that only your authenticated account can ever read or modify your private preparation records.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-card border border-border/70 flex flex-col gap-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 m-0">
            <KeyRound className="size-4 text-primary" />
            <span>3. Multi-Device Real-Time Synchronization</span>
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed m-0">
            When you sign in to sync progress across laptops and browsers:
          </p>
          <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1.5 m-0">
            <li><strong>Authentication:</strong> We use Supabase Auth with industry-standard secure token hashing. Passwords are never stored in plaintext.</li>
            <li><strong>Data Protection:</strong> TLS encryption in transit protects all cloud queries between your device and the cloud database.</li>
            <li><strong>Leaderboard Visibility:</strong> Your display name, streak, and solved count are only shared to public or cohort rankings if you join the leaderboard.</li>
          </ul>
        </section>

        <section className="p-5 rounded-2xl bg-card border border-border/70 flex flex-col gap-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 m-0">
            <ShieldCheck className="size-4 text-primary" />
            <span>4. Your Rights: Export &amp; Deletion</span>
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed m-0">
            You hold total sovereignty over your preparation data. You can download an unencrypted JSON export of your entire history at any time from the settings menu. You can also trigger an instantaneous local and cloud wipe to purge all your records permanently.
          </p>
        </section>

        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3 text-xs text-muted-foreground">
          <Lock className="size-5 text-primary shrink-0" />
          <span>
            For privacy inquiries or account data purge requests, contact privacy@grindos.dev.
          </span>
        </div>
      </div>
    </div>
  );
};
