import React, { useEffect, useState } from 'react';
import { AdminService } from '../services/adminService';
import type { AdminTelemetry } from '../../types';
import {
  Users, Zap, Target, Award, Building2, Flame,
  RefreshCw, TrendingUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const AdminOverviewPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<AdminTelemetry | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await AdminService.fetchTelemetry();
    setTelemetry(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !telemetry) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground animate-pulse">
          <RefreshCw className="size-4 animate-spin text-primary" />
          <span>Polling aggregate community telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Refresh */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight m-0">
            Community Research &amp; Operations Pulse
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            Real-time candidate telemetry across registered user accounts &amp; study cohorts.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          className="text-xs h-8 gap-1.5"
        >
          <RefreshCw className="size-3.5" />
          <span>Refresh Metrics</span>
        </Button>
      </div>

      {/* Top 4 Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 bg-card border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Total Registered</span>
            <Users className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-mono font-bold text-foreground mt-1">
            {telemetry.totalRegisteredUsers}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Active candidate profiles
          </div>
        </Card>

        <Card className="p-4 bg-card border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Active Solvers (7d)</span>
            <Flame className="size-4 text-amber-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-500 mt-1">
            {telemetry.activeSolvers7d}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Logged solve in last 7 days
          </div>
        </Card>

        <Card className="p-4 bg-card border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Solves Today</span>
            <Zap className="size-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-500 mt-1">
            {telemetry.solvesToday}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {telemetry.totalSolvesCount} all-time solves
          </div>
        </Card>

        <Card className="p-4 bg-card border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Offer Conversion</span>
            <Award className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-mono font-bold text-foreground mt-1">
            {telemetry.offerConversionRate}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Reported offer wins
          </div>
        </Card>
      </div>

      {/* Community Intelligence & Research Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dream Company Distribution */}
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <span>Target Company Distribution (Community Research)</span>
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono">
                Top Targets
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Aggregated target employers selected during candidate onboarding.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-0">
            {telemetry.companyDistribution.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
                No company preferences recorded yet. They will appear here once candidates complete onboarding.
              </div>
            ) : (
              telemetry.companyDistribution.map((item) => (
                <div key={item.company} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{item.company}</span>
                    <span className="font-mono text-muted-foreground">
                      {item.count} users ({item.percentage}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-1.5 w-full bg-muted/60" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Tier Distribution & Cohorts Pulse */}
        <div className="flex flex-col gap-6">
          <Card className="border-border shadow-xs bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Target className="size-4 text-primary" />
                <span>Candidate Tier Breakdown</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Target seniority and market tier preferences.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 pt-0">
              {telemetry.tierDistribution.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
                  No tier distributions recorded yet.
                </div>
              ) : (
                telemetry.tierDistribution.map((item) => (
                  <div key={item.tier} className="p-2.5 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{item.tier}</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {item.count} candidates
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                <TrendingUp className="size-4.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground">Peer Study Cohorts</span>
                <p className="text-[11px] text-muted-foreground">Active private student &amp; coworker groups</p>
              </div>
            </div>
            <div className="text-xl font-mono font-bold text-foreground">
              {telemetry.totalCohorts}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
