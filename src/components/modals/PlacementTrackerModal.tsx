import React, { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useProgress } from '../../context/ProgressContext';
import { Briefcase, Plus, Trash2, Award } from 'lucide-react';
import type { PlacementStage } from '../../types';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@/components/ui/table';

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

export const PlacementTrackerModal: React.FC<PlacementTrackerModalProps> = ({ isOpen, onClose }) => {
  const { placements, addPlacement, updatePlacement, deletePlacement } = useProgress();

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('SDE 1');
  const [stage, setStage] = useState<PlacementStage>('Applied');
  const [compensation, setCompensation] = useState('');
  const [notes, setNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;

    addPlacement({
      company: company.trim(),
      role: role.trim() || 'Software Engineer',
      stage,
      appliedDate: new Date().toISOString().split('T')[0],
      compensation: compensation.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setCompany('');
    setCompensation('');
    setNotes('');
    setShowAddForm(false);
    toast.success(`Added ${company.trim()} to pipeline!`);
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
      toast.success('🎉 Congratulations on your offer!');
    }
  };

  const offersCount = placements.filter(p => p.stage === 'Offer Received 🎉').length;
  const inProgressCount = placements.filter(p => p.stage !== 'Offer Received 🎉' && p.stage !== 'Rejected').length;

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
              <h2 className="text-base font-serif font-bold tracking-tight text-foreground">
                Placement Pipeline
              </h2>
              <p className="text-xs text-muted-foreground">
                Track applications, technical rounds, and offer conversions
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
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-lg border border-border/50 bg-muted/20 text-center">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Applied</span>
            <div className="text-lg font-mono font-bold text-foreground mt-0.5">{placements.length}</div>
          </div>
          <div className="p-3 rounded-lg border border-border/50 bg-muted/20 text-center">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">In Progress</span>
            <div className="text-lg font-mono font-bold text-amber-500 mt-0.5">{inProgressCount}</div>
          </div>
          <div className="p-3 rounded-lg border border-border/50 bg-muted/20 text-center">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Offers</span>
            <div className="text-lg font-mono font-bold text-emerald-500 mt-0.5">{offersCount}</div>
          </div>
        </div>

        {/* Add Company Collapsible Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-primary/30 bg-muted/20 flex flex-col gap-3">
            <div className="text-xs font-semibold text-foreground">New Placement Application</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                placeholder="Company Name (e.g. Google)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="text-xs h-8.5"
                required
              />
              <Input
                placeholder="Role (e.g. SDE 1)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="text-xs h-8.5"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                placeholder="Compensation / CTC (optional)"
                value={compensation}
                onChange={(e) => setCompensation(e.target.value)}
                className="text-xs h-8.5"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="xs" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" size="xs">
                Save Application
              </Button>
            </div>
          </form>
        )}

        {/* Placements Table */}
        {placements.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
            No applications in your pipeline yet. Click &quot;Add Company&quot; above to track your interviews.
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {placements.map((p) => {
                  const isOffer = p.stage === 'Offer Received 🎉';
                  const isRejected = p.stage === 'Rejected';

                  return (
                    <TableRow key={p.id} className="text-xs">
                      <TableCell className="font-semibold text-foreground">
                        <div className="flex items-center gap-1.5">
                          {isOffer && <Award className="size-3.5 text-emerald-500 shrink-0" />}
                          <span>{p.company}</span>
                        </div>
                        {p.compensation && (
                          <div className="text-[10px] text-muted-foreground font-mono">{p.compensation}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.role}</TableCell>
                      <TableCell>
                        <select
                          value={p.stage}
                          onChange={(e) => handleStageChange(p.id, e.target.value as PlacementStage)}
                          className={`text-xs py-1 px-2 rounded-md border font-medium bg-background outline-none ${
                            isOffer ? 'border-emerald-500/40 text-emerald-500' :
                            isRejected ? 'border-destructive/40 text-destructive' :
                            'border-border/60 text-foreground'
                          }`}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => deletePlacement(p.id)}
                          className="text-muted-foreground hover:text-destructive size-7"
                          title="Delete entry"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};
