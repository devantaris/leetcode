import React, { useState, useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import {
  Briefcase, Plus, Trash2, ChevronDown, ChevronUp, Search, Building2
} from 'lucide-react';
import type { PlacementStage } from '../types';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { NotificationService } from '../services/notificationService';

const STAGES: PlacementStage[] = [
  'Wishlist',
  'Applied',
  'OA Pending',
  'OA Cleared',
  'Technical Round 1',
  'Technical Round 2',
  'Managerial / HR',
  'Offer Received 🎉',
  'Offer Accepted 🏆',
  'Offer Declined',
  'Rejected'
];

type FilterTab = 'all' | 'active' | 'offers' | 'rejected';

export const TrackerPage: React.FC = () => {
  const { placements, addPlacement, updatePlacement, deletePlacement, authUser, userProfile } = useProgress();

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [stage, setStage] = useState<PlacementStage>('Applied');
  const [compensation, setCompensation] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;

    addPlacement({
      company: company.trim(),
      role: role.trim() || 'Software Engineer',
      stage,
      appliedDate: new Date().toISOString().split('T')[0],
      interviewDate: interviewDate ? interviewDate : undefined,
      contactInfo: contactInfo.trim() || undefined,
      compensation: compensation.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setCompany('');
    setRole('Software Engineer');
    setCompensation('');
    setInterviewDate('');
    setContactInfo('');
    setNotes('');
    setShowAddForm(false);
    toast.success(`Added ${company.trim()} to interview pipeline! 🚀`);
  };

  const handleStageChange = (id: string, newStage: PlacementStage) => {
    updatePlacement(id, { stage: newStage });
    if (newStage === 'Offer Received 🎉' || newStage === 'Offer Accepted 🏆') {
      sounds.playVictorySound();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.55 } });
      toast.success(newStage === 'Offer Accepted 🏆' ? 'Massive congratulations on accepting your offer! 🎉🏆' : 'Huge congratulations! Placement offer logged! 🎉');
      const targetPlacement = placements.find(p => p.id === id);
      if (authUser?.email && targetPlacement) {
        NotificationService.sendOfferCelebration(authUser.email, userProfile.name, targetPlacement.company, targetPlacement.role);
      }
    }
  };

  const offersCount = placements.filter(p => p.stage === 'Offer Received 🎉' || p.stage === 'Offer Accepted 🏆').length;
  const inProgressCount = placements.filter(p =>
    !['Offer Received 🎉', 'Offer Accepted 🏆', 'Offer Declined', 'Rejected', 'Wishlist'].includes(p.stage)
  ).length;
  const conversionRate = placements.length > 0 ? Math.round((offersCount / placements.length) * 100) : 0;

  const filteredPlacements = useMemo(() => {
    return placements.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = p.company.toLowerCase().includes(q) ||
                      p.role.toLowerCase().includes(q) ||
                      (p.notes || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filterTab === 'active') {
        return !['Offer Received 🎉', 'Offer Accepted 🏆', 'Offer Declined', 'Rejected'].includes(p.stage);
      }
      if (filterTab === 'offers') {
        return p.stage === 'Offer Received 🎉' || p.stage === 'Offer Accepted 🏆' || p.stage === 'Offer Declined';
      }
      if (filterTab === 'rejected') {
        return p.stage === 'Rejected';
      }
      return true;
    });
  }, [placements, filterTab, searchQuery]);

  const getStageBadgeVariant = (s: PlacementStage) => {
    if (s.includes('Offer')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (s === 'Rejected') return 'bg-destructive/10 text-destructive border-destructive/20';
    if (s.includes('Round') || s.includes('OA')) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    return 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* ── Title & Quick Telemetry Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Briefcase className="size-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
              Placement Pipeline &amp; Offer Tracker
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track active recruitment loops, technical interview rounds, compensation packages, and job offers.
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(prev => !prev)}
          size="sm"
          className="text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Plus className="size-3.5" />
          <span>{showAddForm ? 'Close Form' : 'Log New Application'}</span>
        </Button>
      </div>

      {/* ── Telemetry Bento Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/60 bg-card p-4">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Pipeline</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">{placements.length}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Tracked companies</div>
        </Card>

        <Card className="border-border/60 bg-card p-4">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Active Loops</div>
          <div className="text-2xl font-bold font-mono text-primary mt-1">{inProgressCount}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">OA &amp; Technical rounds</div>
        </Card>

        <Card className="border-border/60 bg-card p-4">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Offers Received</div>
          <div className="text-2xl font-bold font-mono text-emerald-500 mt-1">{offersCount}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Converted offers</div>
        </Card>

        <Card className="border-border/60 bg-card p-4">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Conversion Rate</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">{conversionRate}%</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Application to offer</div>
        </Card>
      </div>

      {/* Add Company Collapsible Form */}
      {showAddForm && (
        <Card className="border border-primary/30 bg-card shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Plus className="size-4 text-primary" />
              <span>Log New Interview Pipeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Company Name *</label>
                  <Input
                    placeholder="e.g. Google, Stripe, Flipkart"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="text-xs h-9"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Role Title</label>
                  <Input
                    placeholder="e.g. Software Engineer, SDE-1"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Current Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as PlacementStage)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Next Interview Date</label>
                  <Input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Recruiter / Contact</label>
                  <Input
                    placeholder="e.g. recruiter@company.com"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Target Compensation / CTC</label>
                  <Input
                    placeholder="e.g. $165k base / 32 LPA"
                    value={compensation}
                    onChange={(e) => setCompensation(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Interview Prep Notes &amp; JD</label>
                  <Input
                    placeholder="Focus: System Design, DP, Graph problems..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)} className="text-xs h-8">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs h-8 font-semibold">
                  Save Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Filters & Search Controls ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/40">
          {(['all', 'active', 'offers', 'rejected'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                filterTab === tab
                  ? 'bg-background shadow-xs text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {tab === 'all' ? `All (${placements.length})` :
               tab === 'active' ? `Active (${inProgressCount})` :
               tab === 'offers' ? `Offers (${offersCount})` :
               `Rejected (${placements.filter(p => p.stage === 'Rejected').length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-8.5 bg-background"
          />
        </div>
      </div>

      {/* ── Placements List ── */}
      {filteredPlacements.length === 0 ? (
        <Card className="border border-dashed border-border/80 bg-card p-12 text-center">
          <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-3">
            <Building2 className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No interview records found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchQuery.trim()
              ? `No companies match your search for "${searchQuery}".`
              : 'Add your target companies and active interview rounds to track your conversion rate.'}
          </p>
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              className="text-xs font-semibold gap-1 mt-4"
            >
              <Plus className="size-3" />
              <span>Log First Application</span>
            </Button>
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredPlacements.map((p) => {
            const isExpanded = expandedId === p.id;
            return (
              <Card
                key={p.id}
                className="border border-border/80 bg-card shadow-xs transition-colors hover:border-border overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-muted border border-border flex items-center justify-center font-bold text-xs text-foreground shrink-0 font-mono">
                      {p.company.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{p.company}</span>
                        <Badge variant="outline" className={`text-[10px] font-mono px-2 py-0.5 border ${getStageBadgeVariant(p.stage)}`}>
                          {p.stage}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 flex-wrap">
                        <span>{p.role}</span>
                        <span>•</span>
                        <span>Applied: {p.appliedDate}</span>
                        {p.compensation && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{p.compensation}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={p.stage}
                      onChange={(e) => handleStageChange(p.id, e.target.value as PlacementStage)}
                      className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground outline-none focus:border-ring font-medium"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    >
                      {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10"
                      onClick={() => deletePlacement(p.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-border/40 bg-muted/20 flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <div>
                        <span className="text-[11px] font-semibold text-foreground block mb-1">Interview Date:</span>
                        <Input
                          type="date"
                          value={p.interviewDate || ''}
                          onChange={(e) => updatePlacement(p.id, { interviewDate: e.target.value })}
                          className="text-xs h-8 bg-background"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-foreground block mb-1">Recruiter / Contact:</span>
                        <Input
                          value={p.contactInfo || ''}
                          onChange={(e) => updatePlacement(p.id, { contactInfo: e.target.value })}
                          placeholder="Email or phone"
                          className="text-xs h-8 bg-background"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-foreground block mb-1">Interview Notes:</span>
                      <Input
                        value={p.notes || ''}
                        onChange={(e) => updatePlacement(p.id, { notes: e.target.value })}
                        placeholder="Round details, coding challenges asked, or follow-ups..."
                        className="text-xs h-8 bg-background"
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
