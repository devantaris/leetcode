import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { ExternalLink, Check, ChevronDown, ChevronUp, AlertTriangle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const CatchUpQueueCard: React.FC = () => {
  const { catchUpQueue, progress, toggleProblem, setActiveWeek } = useProgress();
  const [expanded, setExpanded] = useState(false);

  if (!catchUpQueue || catchUpQueue.length === 0) return null;

  const totalMissed = catchUpQueue.reduce((s, item) => s + (item.totalCount - item.solvedCount), 0);
  const visibleItems = expanded ? catchUpQueue : catchUpQueue.slice(0, 3);

  return (
    <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <AlertTriangle className="size-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              Catch-Up Queue
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 font-mono text-[10px] px-1.5 py-0">
                {totalMissed} pending
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalMissed} unsolved problem{totalMissed !== 1 ? 's' : ''} across {catchUpQueue.length} missed day{catchUpQueue.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <Link
          to="/curriculum"
          onClick={() => setActiveWeek(catchUpQueue[0]?.week || 1)}
        >
          <Button variant="outline" size="xs" className="h-7 gap-1 text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
            <BookOpen className="size-3" />
            <span>View All</span>
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 pt-0">
        <div className="flex flex-col gap-1.5">
          {visibleItems.map((item) =>
            item.problems
              .filter(p => !progress[p.id])
              .slice(0, expanded ? undefined : 2)
              .map(p => {
                const isChecked = !!progress[p.id];
                const diffVariant =
                  p.difficulty === 'Easy' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' :
                  p.difficulty === 'Hard' ? 'border-destructive/30 text-destructive bg-destructive/10' :
                  'border-amber-500/30 text-amber-500 bg-amber-500/10';

                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProblem(p.id)}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/40 bg-card/60 hover:bg-card hover:border-border transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`size-4.5 rounded flex items-center justify-center border transition-all ${
                          isChecked
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border/80 group-hover:border-foreground/50'
                        }`}
                      >
                        {isChecked && <Check className="size-3 stroke-[3]" />}
                      </div>

                      <div className="flex items-center gap-2 truncate">
                        <span className={`text-xs font-medium truncate ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {p.name}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Day {item.day} · {item.topic}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border ${diffVariant}`}>
                        {p.difficulty}
                      </span>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        title="Open on LeetCode"
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {catchUpQueue.length > 3 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setExpanded(prev => !prev)}
            className="w-full text-xs text-muted-foreground hover:text-foreground h-7 gap-1 mt-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="size-3.5" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5" /> Show {catchUpQueue.length - 3} more days
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
