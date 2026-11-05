import React from 'react';
import { ModalWrapper } from './ModalWrapper';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrategyModal: React.FC<StrategyModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Curriculum Strategy">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <BookOpen className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold tracking-tight text-foreground">
              Topic Progression Roadmap
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Structured 5-phase algorithmic mastery designed for placement conversion.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {[
            { phase: 'Weeks 1–4', title: 'Phase 1: Linear Foundations', desc: 'Arrays, Two Pointers, Sliding Window, Linked Lists, Monotonic Stack, Binary Search.' },
            { phase: 'Weeks 5–9', title: 'Phase 2: Tree & Graph Hierarchies', desc: 'Binary Trees, Heaps, Tries, Backtracking, BFS/DFS, Union-Find, Shortest Paths.' },
            { phase: 'Weeks 10–13', title: 'Phase 3: Dynamic Programming', desc: '1D & 2D Memoization/Tabulation, Knapsack, Subsequence DP, Matrix Chains, Greedy Intervals.' },
            { phase: 'Week 14', title: 'Phase 4: Architecture & Design', desc: 'Distributed systems fundamentals: caching (Redis), rate limiting, database partitioning.' },
            { phase: 'Weeks 15–20', title: 'Phase 5: Timed Mocks & Speedruns', desc: 'High-frequency company tags, 40-minute timed mock speedruns under live interview pressure.' },
          ].map((item) => (
            <div
              key={item.phase}
              className="p-3.5 rounded-xl border border-border/50 bg-muted/20 flex flex-col gap-1"
            >
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs font-semibold text-foreground">{item.title}</span>
                <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 border-border/60 text-muted-foreground">
                  {item.phase}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-border/50">
          <Button size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
