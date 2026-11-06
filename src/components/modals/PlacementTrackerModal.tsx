import React, { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useProgress } from '../../context/ProgressContext';
import {
  Briefcase, Plus, Trash2, Award, Calendar,
  UserCheck, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import type { PlacementStage } from '../../types';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PlacementTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STAGES: PlacementStage[] = [
  'Wishlist',
  'Applied',
  'OA Pending',
  'OA Cleared',
  'Technical Round 1',
  'Technical Round 2',
  'Managerial / HR',
  'Offer Received 🎉',
  'Rejected'
];

type FilterTab = 'all' | 'active' | 'offers' | 'rejected';

export const PlacementTrackerModal: React.FC<PlacementTrackerModalProps> = ({ isOpen, onClose }) => {
  const { placements, addPlacement, updatePlacement, deletePlacement } = useProgress();

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
    if (newStage === 'Offer Received 🎉') {
      sounds.playVictorySound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success('🎉 Congratulations on securing an offer!');
    }
  };

  const offersCount = placements.filter(p => p.stage === 'Offer Received 🎉').length;
  const inProgressCount = placements.filter(p => p.stage !== 'Offer Received 🎉' && p.stage !== 'Rejected').length;
  const conversionRate = placements.length > 0 ? Math.round((offersCount / placements.length) * 100) : 0;

  const filteredPlacements = placements.filter(p => {
    if (filterTab === 'active') return p.stage !== 'Offer Received 🎉' && p.stage !== 'Rejected';
    if (filterTab === 'offers') return p.stage === 'Offer Received 🎉';
    if (filterTab === 'rejected') return p.stage === 'Rejected';
    return true;
  });

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Placement Tracker">
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Briefcase className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold tracking-tight text-foreground m-0">
                Placement Pipeline
              </h2>
              <p className="text-xs text-muted-foreground m-0">
                Track job applications, technical interview rounds, and offers
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs h-8 gap-1"
          >
            <Plus className="size-3.5" />
            <span>Add Company</span>
          </Button>
        </div>

        {/* Pipeline Summary Cards */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2.5 rounded-xl border border-border/60 bg-muted/20 text-center">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Total</span>
            <div className="text-base font-mono font-bold text-foreground mt-0.5">{placements.length}</div>
          </div>
          <div className="p-2.5 rounded-xl border border-border/60 bg-muted/20 text-center">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Active</span>
            <div className="text-base font-mono font-bold text-amber-500 mt-0.5">{inProgressCount}</div>
          </div>
          <div className="p-2.5 rounded-xl border border-border/60 bg-muted/20 text-center">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Offers</span>
            <div className="text-base font-mono font-bold text-emerald-500 mt-0.5">{offersCount}</div>
          </div>
          <div className="p-2.5 rounded-xl border border-border/60 bg-muted/20 text-center">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Win Rate</span>
            <div className="text-base font-mono font-bold text-primary mt-0.5">{conversionRate}%</div>
          </div>
        </div>

        {/* Add Company Collapsible Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-primary/30 bg-card flex flex-col gap-3 shadow-xs">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Plus className="size-3.5 text-primary" />
              <span>Log New Interview Pipeline</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                placeholder="Company Name (e.g. Google, Stripe)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="text-xs h-8.5"
                required
              />
              <Input
                placeholder="Role (e.g. Software Engineer, SDE 2)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="text-xs h-8.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as PlacementStage)}
                className="h-8.5 rounded-md border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <Input
                type="date"
                placeholder="Interview Date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="text-xs h-8.5"
                title="Next Interview Date"
              />

              <Input
                placeholder="Recruiter / Contact"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="text-xs h-8.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                placeholder="Target Compensation / CTC (e.g. $165k base)"
                value={compensation}
                onChange={(e) => setCompensation(e.target.value)}
                className="text-xs h-8.5"
              />
              <Input
                placeholder="Round notes, recruiter email, or JD link"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs h-8.5"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="xs" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" size="xs" className="font-semibold">
                Add to Pipeline
              </Button>
            </div>
          </form>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 border-b border-border/60 pb-2">
          {(['all', 'active', 'offers', 'rejected'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize transition-colors ${
                filterTab === tab
                  ? 'bg-primary/10 text-primary font-semibold'
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

        {/* Placements List */}
        {filteredPlacements.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
            {placements.length === 0
              ? 'No applications in your pipeline yet. Click "Add Company" above to track your interviews.'
              : 'No applications match this filter tab.'}
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredPlacements.map((p) => {
              const isOffer = p.stage === 'Offer Received 🎉';
              const isRejected = p.stage === 'Rejected';
              const isExpanded = expandedId === p.id;

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isOffer
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : isRejected
                      ? 'border-destructive/30 bg-destructive/5'
                      : 'border-border/70 bg-card hover:border-foreground/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isOffer ? (
                        <div className="size-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                          <Award className="size-4" />
                        </div>
                      ) : (
                        <div className="size-7 rounded-lg bg-muted border border-border/80 flex items-center justify-center text-foreground font-mono text-xs font-bold shrink-0">
                          {p.company.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground truncate">{p.company}</span>
                          <span className="text-[11px] text-muted-foreground truncate">• {p.role}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-0.5">
                          <span>Applied {p.appliedDate}</span>
                          {p.interviewDate && (
                            <span className="text-primary font-semibold flex items-center gap-1">
                              <Calendar className="size-3" /> {p.interviewDate}
                            </span>
                          )}
                          {p.compensation && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                              {p.compensation}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={p.stage}
                        onChange={(e) => handleStageChange(p.id, e.target.value as PlacementStage)}
                        className={`text-[11px] py-1 px-2 rounded-md border font-medium bg-background outline-none ${
                          isOffer ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-bold' :
                          isRejected ? 'border-destructive/40 text-destructive' :
                          'border-border text-foreground'
                        }`}
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        title="Toggle Details"
                      >
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </button>

                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => deletePlacement(p.id)}
                        className="text-muted-foreground hover:text-destructive size-7"
                        title="Delete entry"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-2 text-xs">
                      {p.contactInfo && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <UserCheck className="size-3.5 text-primary shrink-0" />
                          <span>Contact / Recruiter: <strong className="text-foreground">{p.contactInfo}</strong></span>
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                          <FileText className="size-3 text-muted-foreground" />
                          <span>Interview Notes &amp; Feedback:</span>
                        </div>
                        <Input
                          defaultValue={p.notes || ''}
                          placeholder="Add feedback, topics asked, or next steps..."
                          onBlur={(e) => updatePlacement(p.id, { notes: e.target.value })}
                          className="text-xs h-7.5 bg-background"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};
