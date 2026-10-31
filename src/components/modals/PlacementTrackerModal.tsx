import React, { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useProgress } from '../../context/ProgressContext';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import type { PlacementStage } from '../../types';

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
  };

  const offersCount = placements.filter(p => p.stage === 'Offer Received 🎉').length;
  const inProgressCount = placements.filter(p => p.stage !== 'Offer Received 🎉' && p.stage !== 'Rejected').length;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Placement Tracker">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)'
            }}>
              <Briefcase size={16} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Placement Pipeline
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Track applications, OA stages, and offer outcomes
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
            style={{ fontSize: 12, padding: '5px 10px' }}
          >
            <Plus size={12} /> Add Company
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
          <div style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <div className="section-label">Applied</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{placements.length}</div>
          </div>
          <div style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <div className="section-label">In Pipeline</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-warning-text)', marginTop: 2 }}>{inProgressCount}</div>
          </div>
          <div style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <div className="section-label">Offers</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-success-text)', marginTop: 2 }}>{offersCount}</div>
          </div>
        </div>

        {/* Add form */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '14px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)',
              display: 'flex', flexDirection: 'column', gap: 10
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Log New Application</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Company *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon, Google"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="input"
                  style={{ fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Role</label>
                <input
                  type="text"
                  placeholder="e.g. SDE 1"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="input"
                  style={{ fontSize: 12 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Stage</label>
                <select
                  value={stage}
                  onChange={e => setStage(e.target.value as PlacementStage)}
                  className="input"
                  style={{ fontSize: 12 }}
                >
                  {STAGES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>CTC / Compensation</label>
                <input
                  type="text"
                  placeholder="e.g. 24 LPA"
                  value={compensation}
                  onChange={e => setCompensation(e.target.value)}
                  className="input"
                  style={{ fontSize: 12 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Notes</label>
              <textarea
                rows={2}
                placeholder="Interview questions, round feedback, recruiters..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="input"
                style={{ fontSize: 12, resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-ghost"
                style={{ fontSize: 12 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ fontSize: 12 }}
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Placements list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '42vh', overflowY: 'auto' }}>
          {placements.length === 0 ? (
            <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              No companies in pipeline yet. Click "+ Add Company" above to start logging.
            </div>
          ) : (
            placements.map((p) => {
              const isOffer = p.stage === 'Offer Received 🎉';
              const isRejected = p.stage === 'Rejected';

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', borderRadius: 'var(--radius-md)',
                    background: isOffer ? 'var(--color-success-bg)' : 'var(--bg-elevated)',
                    border: `1px solid ${isOffer ? 'var(--color-success-border)' : 'var(--border-default)'}`,
                    opacity: isRejected ? 0.6 : 1,
                    gap: 10
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.company}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.role}</span>
                      {p.compensation && (
                        <span className="badge badge-success" style={{ fontSize: 10, padding: '1px 5px' }}>
                          {p.compensation}
                        </span>
                      )}
                    </div>
                    {p.notes && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}>
                        {p.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <select
                      value={p.stage}
                      onChange={(e) => updatePlacement(p.id, { stage: e.target.value as PlacementStage })}
                      style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
                        padding: '4px 6px', fontSize: 11, cursor: 'pointer', outline: 'none'
                      }}
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => deletePlacement(p.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: 4, display: 'flex'
                      }}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
