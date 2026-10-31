import React, { useState } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { sounds } from '../../../utils/audio';
import type { PlacementStage } from '../../../types';

interface PipelineWindowProps {
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
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
  'Rejected',
];

export const PipelineWindow: React.FC<PipelineWindowProps> = ({ onLog }) => {
  const { placements, addPlacement, updatePlacement, deletePlacement } = useProgress();

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('SDE-1');
  const [stage, setStage] = useState<PlacementStage>('Applied');
  const [compensation, setCompensation] = useState('₹28 LPA');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;

    addPlacement({
      company: company.trim(),
      role: role.trim() || 'Software Engineer',
      stage,
      appliedDate: new Date().toISOString(),
      compensation: compensation.trim(),
    });

    sounds.playVictorySound();
    onLog(`pipeline: added ${company.trim()} [${stage}]`, 'ok');
    setCompany('');
    setIsAdding(false);
  };

  const advanceStage = (id: string, currentStage: PlacementStage) => {
    const currentIndex = STAGES.indexOf(currentStage);
    if (currentIndex < STAGES.length - 2) {
      const nextStage = STAGES[currentIndex + 1];
      updatePlacement(id, { stage: nextStage });
      sounds.playCheckSound();
      onLog(`pipeline: advanced application to [${nextStage}]`, 'ok');
    }
  };

  const handleDelete = (id: string, compName: string) => {
    deletePlacement(id);
    sounds.playUncheckSound();
    onLog(`pipeline: removed application for ${compName}`, 'warn');
  };

  const offersCount = placements.filter((p) => p.stage === 'Offer Received 🎉').length;
  const interviewingCount = placements.filter((p) =>
    ['OA Pending', 'OA Cleared', 'Technical Round 1', 'Technical Round 2', 'Managerial / HR'].includes(p.stage)
  ).length;

  return (
    <div className="wbody" style={{ width: 560, maxWidth: '90vw' }}>
      {/* Header metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--dim)' }}>
          APPLICATIONS: <b style={{ color: 'var(--fg)' }}>{placements.length}</b> · INTERVIEWING:{' '}
          <b style={{ color: 'var(--amb)' }}>{interviewingCount}</b> · OFFERS:{' '}
          <b style={{ color: 'var(--fg)' }}>{offersCount} 🎉</b>
        </div>
        <button
          className="k small"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? 'CANCEL' : '+ ADD APPLICATION'}
        </button>
      </div>

      {/* Add application form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid var(--line)',
            padding: 10,
            marginBottom: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              className="retro-input"
              placeholder="COMPANY (e.g. Google, Atlassian)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
            <input
              type="text"
              className="retro-input"
              placeholder="ROLE (e.g. SDE-1)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: 140 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <select
              className="retro-select"
              value={stage}
              onChange={(e) => setStage(e.target.value as PlacementStage)}
              style={{ flex: 1 }}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="retro-input"
              placeholder="CTC / PACKAGE"
              value={compensation}
              onChange={(e) => setCompensation(e.target.value)}
              style={{ width: 140 }}
            />
            <button type="submit" className="k small">
              SAVE
            </button>
          </div>
        </form>
      )}

      {/* Pipeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: '42vh', overflowY: 'auto' }}>
        {placements.length === 0 ? (
          <div className="dimtxt" style={{ padding: '16px 0', textAlign: 'center' }}>
            — NO APPLICATIONS TRACKED YET. CLICK [+ ADD APPLICATION] —
          </div>
        ) : (
          placements.map((p) => {
            const isOffer = p.stage === 'Offer Received 🎉';
            const isRejected = p.stage === 'Rejected';

            return (
              <div
                key={p.id}
                className="row"
                style={{
                  border: '1px solid var(--line)',
                  padding: '6px 8px',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--fg)', fontWeight: 700 }}>{p.company}</span>
                    <span className="dimtxt" style={{ fontSize: 11 }}>{p.role}</span>
                    {p.compensation && (
                      <span className="ambtxt" style={{ fontSize: 11 }}>
                        [{p.compensation}]
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>
                    STAGE:{' '}
                    <span style={{ color: isOffer ? 'var(--fg)' : isRejected ? 'var(--red)' : 'var(--amb)' }}>
                      {p.stage}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  {!isOffer && !isRejected && (
                    <button
                      className="k ghost small"
                      onClick={() => advanceStage(p.id, p.stage)}
                      title="Advance to next interview round"
                    >
                      ADVANCE &gt;
                    </button>
                  )}
                  <button
                    className="k danger small"
                    onClick={() => handleDelete(p.id, p.company)}
                    title="Remove application"
                  >
                    X
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <hr />
      <div className="dimtxt" style={{ fontSize: 10 }}>
        PLACEMENT PIPELINE MAINTAINED IN LOCAL ENCRYPTED BROWSER STORAGE.
      </div>
    </div>
  );
};
