import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '../config/appConfig';

export const TermsPage: React.FC = () => {
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
            <FileText className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight m-0">
              Terms of Service
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Last updated: November 2026 • Effective immediately
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-sm dark:prose-invert max-w-none flex flex-col gap-6 text-foreground/90 leading-relaxed text-sm">
        <section className="p-5 rounded-2xl bg-card border border-border/70 flex flex-col gap-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 m-0">
            <CheckCircle2 className="size-4 text-primary" />
            <span>1. Acceptance of Terms</span>
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed m-0">
            By accessing or using {APP_CONFIG.name} (&quot;the Platform&quot;), whether via our Web workstation or Retro Terminal OS interface, you agree to be bound by these Terms of Service. If you do not agree to all terms, please discontinue use of the platform immediately.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-card border border-border/70 flex flex-col gap-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 m-0">
            <CheckCircle2 className="size-4 text-primary" />
            <span>2. Intellectual Property &amp; LeetCode Disclaimer</span>
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed m-0">
            {APP_CONFIG.name} is an independent curriculum tracker, productivity workspace, and interview preparation operating system. {APP_CONFIG.name} is not affiliated with, endorsed by, or sponsored by LeetCode LLC or any of its subsidiaries. All company trademarks, problem titles, and external URLs remain the property of their respective owners.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-card border border-border/70 flex flex-col gap-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 m-0">
            <CheckCircle2 className="size-4 text-primary" />
            <span>3. Local-First Data Ownership &amp; User Content</span>
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed m-0">
            You retain 100% ownership of all solve history, notes, code snippets, and placement records entered into {APP_CONFIG.name}. By default, all data is stored locally in your browser storage. When utilizing optional Supabase Cloud Sync, your progress data is encrypted and transferred solely to synchronize state across your authorized devices.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-card border border-border/70 flex flex-col gap-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 m-0">
            <CheckCircle2 className="size-4 text-primary" />
            <span>4. Community Cohorts &amp; Leaderboard Conduct</span>
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed m-0">
            When participating in public or cohort leaderboards, you agree not to submit offensive usernames or engage in automated abuse intended to distort study statistics. We reserve the right to remove spam or defamatory leaderboard entries to maintain a positive study environment.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-card border border-border/70 flex flex-col gap-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 m-0">
            <CheckCircle2 className="size-4 text-primary" />
            <span>5. Warranty Disclaimer &amp; Placement Outcomes</span>
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed m-0">
            While {APP_CONFIG.name} provides rigorous curriculum structures and readiness scoring to accelerate technical interview mastery, no guarantee of employment or specific offer compensation is made or implied. The software is provided &quot;as is&quot; without warranties of any kind.
          </p>
        </section>

        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3 text-xs text-muted-foreground">
          <Shield className="size-5 text-primary shrink-0" />
          <span>
            Questions regarding these Terms? Contact us at support@grindos.dev or inspect our open-source codebase on GitHub.
          </span>
        </div>
      </div>
    </div>
  );
};
