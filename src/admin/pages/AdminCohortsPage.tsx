import React, { useState, useEffect } from 'react';
import { AdminService } from '../services/adminService';
import type { CohortInfo } from '../../types';
import { Users, Copy, Check, RefreshCw, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export const AdminCohortsPage: React.FC = () => {
  const [cohorts, setCohorts] = useState<CohortInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadCohorts = async () => {
    setLoading(true);
    const data = await AdminService.fetchCohorts();
    setCohorts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCohorts();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied invite code: ${code}`);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleDissolve = async (code: string, name: string) => {
    if (!window.confirm(`Are you sure you want to dissolve cohort "${name}" (${code})? This will remove all members from the squad.`)) {
      return;
    }
    const success = await AdminService.dissolveCohort(code);
    if (success) {
      toast.success(`Cohort "${name}" dissolved.`);
      setCohorts(prev => prev.filter(c => c.code !== code));
    } else {
      toast.error('Failed to dissolve cohort.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight m-0">
            Study Cohorts Monitor
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            Track private student study squads, university clubs, and corporate peer cohorts.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadCohorts}
          className="text-xs h-8 gap-1.5"
        >
          <RefreshCw className="size-3.5" />
          <span>Refresh Cohorts</span>
        </Button>
      </div>

      {/* Cohorts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cohorts.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 p-12 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl bg-card">
            {loading ? 'Polling active cohorts...' : 'No active cohorts found in database.'}
          </div>
        ) : (
          cohorts.map((c) => (
            <Card key={c.code} className="border-border shadow-xs bg-card p-4 flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground truncate">{c.name}</span>
                  <Badge variant="outline" className="font-mono text-xs gap-1 border-primary/30 text-primary bg-primary/10">
                    <Users className="size-3" />
                    <span>{c.memberCount} members</span>
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Invite Code:</span>
                    <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border/80">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCode(c.code)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Copy Invite Code"
                    >
                      {copiedCode === c.code ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>

                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleDissolve(c.code, c.name)}
                    className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2 gap-1"
                    title="Dissolve Cohort"
                  >
                    <Trash2 className="size-3" />
                    <span>Dissolve</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
