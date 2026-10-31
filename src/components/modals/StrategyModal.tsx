import React from 'react';
import { ModalWrapper } from './ModalWrapper';

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrategyModal: React.FC<StrategyModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Curriculum Strategy">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            Topic Progression Strategy
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            Structured 5-phase algorithmic progression roadmap.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { phase: 'Phase 1 (Weeks 1–4)', title: 'Linear Foundations', desc: 'Arrays, Two Pointers, Sliding Window, Linked Lists, Stack, Binary Search.' },
            { phase: 'Phase 2 (Weeks 5–9)', title: 'Tree & Graph Hierarchies', desc: 'Trees, Heaps, Tries, Backtracking, BFS/DFS, Union-Find, Dijkstra.' },
            { phase: 'Phase 3 (Weeks 10–13)', title: 'Dynamic Programming', desc: '1D & 2D DP, Knapsack, Subsequence DP, Matrix Chains, Greedy Intervals.' },
            { phase: 'Phase 4 (Week 14)', title: 'System Design Shift', desc: 'Distributed systems fundamentals: caching, rate limiting, partitioning.' },
            { phase: 'Phase 5 (Weeks 15–20)', title: 'Offer Sprint & Mocks', desc: 'High-frequency company tags, 45-minute timed mock speedruns.' },
          ].map((item) => (
            <div
              key={item.phase}
              style={{
                padding: '10px 12px', background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</span>
                <span className="section-label" style={{ fontSize: 10 }}>{item.phase}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button onClick={onClose} className="btn btn-default">
            Close
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
