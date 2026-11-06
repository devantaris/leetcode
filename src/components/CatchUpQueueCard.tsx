import React, { useState, useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { ExternalLink, Check, ChevronDown, ChevronUp, AlertTriangle, Bookmark, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MERGED_PLAN_DATA } from '../data/mergedPlanData';
import type { Problem } from '../types';

export const CatchUpQueueCard: React.FC = () => {
  const { catchUpQueue, progress, flaggedProblems, toggleProblem, toggleProblemFlag, setActiveWeek } = useProgress();
  const [activeTab, setActiveTab] = useState<'backlog' | 'flagged'>('backlog');
  const [expanded, setExpanded] = useState(false);

  // Map all problems by ID for quick metadata lookup
  const allProblemsMap = useMemo(() => {
    const map = new Map<string, { problem: Problem; day: number; week: number; topic: string }>();
    for (const week of MERGED_PLAN_DATA) {
      for (const day of week.days) {
        for (const p of day.problems) {
          if (!map.has(p.id)) {
            map.set(p.id, { problem: p, day: day.day, week: week.week, topic: week.topic });
          }
        }
      }
    }
    return map;
  }, []);

  const flaggedList = useMemo(() => {
    return Object.keys(flaggedProblems)
      .filter(id => flaggedProblems[id])
      .map(id => allProblemsMap.get(id))
      .filter((item): item is { problem: Problem; day: number; week: number; topic: string } => !!item);
  }, [flaggedProblems, allProblemsMap]);

  const totalMissed = (catchUpQueue || []).reduce((s, item) => s + (item.totalCount - item.solvedCount), 0);

  // If no backlog and no flagged items, hide card
  if (totalMissed === 0 && flaggedList.length === 0) return null;

  const currentTab = (totalMissed === 0 && activeTab === 'backlog') ? 'flagged' : activeTab;
  const visibleBacklogItems = expanded ? (catchUpQueue || []) : (catchUpQueue || []).slice(0, 3);
  const visibleFlaggedItems = expanded ? flaggedList : flaggedList.slice(0, 4);

  return (
    <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            {currentTab === 'backlog' ? <AlertTriangle className="size-4" /> : <Bookmark className="size-4" />}
          </div>
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              <span>{currentTab === 'backlog' ? 'Catch-Up Backlog' : 'Spaced Repetition Queue'}</span>
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 font-mono text-[10px] px-1.5 py-0">
                {currentTab === 'backlog' ? `${totalMissed} pending` : `${flaggedList.length} flagged`}
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentTab === 'backlog'
                ? `${totalMissed} unsolved problem${totalMissed !== 1 ? 's' : ''} across ${catchUpQueue.length} missed day${catchUpQueue.length !== 1 ? 's' : ''}`
                : `${flaggedList.length} problem${flaggedList.length !== 1 ? 's' : ''} saved for pattern reinforcement`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {totalMissed > 0 && flaggedList.length > 0 && (
            <div className="flex items-center rounded-lg border border-amber-500/20 bg-background p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab('backlog')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  currentTab === 'backlog'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Backlog ({totalMissed})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('flagged')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  currentTab === 'flagged'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Flagged ({flaggedList.length})
              </button>
            </div>
          )}

          <Link
            to="/curriculum"
            onClick={() => {
              if (catchUpQueue && catchUpQueue[0]?.week) {
                setActiveWeek(catchUpQueue[0].week);
              }
            }}
          >
            <Button variant="outline" size="xs" className="h-7 gap-1 text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
              <BookOpen className="size-3" />
              <span>Curriculum</span>
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 pt-1">
        <div className="flex flex-col gap-1.5">
          {currentTab === 'backlog' ? (
            visibleBacklogItems.map((item) =>
              item.problems
                .filter(p => !progress[p.id])
                .slice(0, expanded ? undefined : 2)
                .map(p => {
                  const isChecked = !!progress[p.id];
                  const isFlagged = !!flaggedProblems[p.id];
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProblemFlag(p.id);
                          }}
                          className={`p-1 rounded hover:bg-muted/80 transition-colors ${
                            isFlagged ? 'text-amber-500' : 'text-muted-foreground/40 hover:text-muted-foreground'
                          }`}
                          title={isFlagged ? 'Unflag problem' : 'Flag for review'}
                        >
                          <Bookmark className={`size-3.5 ${isFlagged ? 'fill-current' : ''}`} />
                        </button>
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
            )
          ) : (
            visibleFlaggedItems.map(({ problem: p, day, topic }) => {
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
                        Day {day} · {topic}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProblemFlag(p.id);
                      }}
                      className="p-1 rounded text-amber-500 hover:bg-muted/80 transition-colors"
                      title="Unflag problem"
                    >
                      <Bookmark className="size-3.5 fill-current" />
                    </button>
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

        {((currentTab === 'backlog' && (catchUpQueue || []).length > 3) ||
          (currentTab === 'flagged' && flaggedList.length > 4)) && (
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
                <ChevronDown className="size-3.5" /> Show more items
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
