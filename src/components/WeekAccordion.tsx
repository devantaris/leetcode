import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { ChevronDown, ExternalLink, Check, Coffee, Bookmark, FileText } from 'lucide-react';
import type { Problem } from '../types';
import { TOP_150_LC_NUMBERS } from '../data/top150List';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const WeekAccordion: React.FC = () => {
  const {
    progress,
    toggleProblem,
    markDayComplete,
    isDayComplete,
    activeWeek,
    searchQuery,
    selectedDifficulty,
    statusFilter,
    companyFilter,
    flaggedProblems,
    problemNotes,
    toggleProblemFlag,
    setProblemNote,
  } = useProgress();

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const [openWeeks, setOpenWeeks] = useState<{ [weekNum: number]: boolean }>({
    [activeWeek]: true,
  });

  const toggleWeek = (weekNum: number) => {
    setOpenWeeks(prev => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  const matchesFilter = (p: Problem): boolean => {
    if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
    if (statusFilter === 'solved' && !progress[p.id]) return false;
    if (statusFilter === 'unsolved' && progress[p.id]) return false;
    if (statusFilter === 'top150' && !TOP_150_LC_NUMBERS.has(p.lcNumber)) return false;
    if (statusFilter === 'flagged' && !flaggedProblems[p.id]) return false;
    if (companyFilter !== 'all' && !p.companyTags?.includes(companyFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.lcNumber.toString().includes(q) ||
        (p.companyTags && p.companyTags.some(t => t.includes(q))) ||
        (p.note && p.note.toLowerCase().includes(q))
      );
    }
    return true;
  };

  return (
    <div className="flex flex-col gap-3">
      {PLAN_DATA.map((w) => {
        let totalProblems = 0;
        let solvedProblems = 0;

        w.days.forEach((d) => {
          d.problems.forEach((p) => {
            totalProblems++;
            if (progress[p.id]) solvedProblems++;
          });
        });

        const isWeekComplete = totalProblems > 0 && solvedProblems === totalProblems;
        const isOpen = openWeeks[w.week] ?? (w.week === activeWeek || searchQuery.trim().length > 0);

        return (
          <Card
            key={w.week}
            id={`week-anchor-${w.week}`}
            className="overflow-hidden border-border/50 shadow-xs"
          >
            {/* Week Row Header */}
            <div
              onClick={() => toggleWeek(w.week)}
              className={`flex items-center justify-between p-3.5 sm:p-4 cursor-pointer select-none transition-colors ${
                isOpen ? 'bg-muted/30 border-b border-border/40' : 'hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant={isWeekComplete ? 'default' : 'outline'}
                  className={`font-mono text-xs px-2 py-0.5 ${
                    isWeekComplete ? 'bg-emerald-500 text-white' : 'border-border/60 text-foreground'
                  }`}
                >
                  W{w.week}
                </Badge>
                <span className="text-sm sm:text-base font-semibold text-foreground">
                  {w.topic}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">
                  <strong className={isWeekComplete ? 'text-emerald-500' : 'text-foreground'}>
                    {solvedProblems}
                  </strong>{' '}
                  / {totalProblems}
                </span>

                <ChevronDown
                  className={`size-4 text-muted-foreground transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Week Content */}
            {isOpen && (
              <div className="divide-y divide-border/30">
                {w.days.map((d) => {
                  const complete = isDayComplete(w.week, d.day);
                  const filteredProblems = d.problems.filter(matchesFilter);

                  if (searchQuery.trim() && filteredProblems.length === 0) return null;

                  return (
                    <div key={d.day} className="p-3.5 sm:p-4 bg-card/40 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground">
                            Day {d.day} ({d.weekday})
                          </span>
                          <span className="text-muted-foreground text-xs">·</span>
                          <span className="text-xs text-muted-foreground font-medium">
                            {d.topic}
                          </span>
                        </div>

                        {d.type !== 'rest' && !complete && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => markDayComplete(w.week, d.day)}
                            className="text-xs h-6.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                          >
                            <Check className="size-3 mr-1" />
                            Mark Day Solved
                          </Button>
                        )}
                      </div>

                      {d.type === 'rest' ? (
                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground p-2 rounded-lg bg-muted/20">
                          <Coffee className="size-4 text-amber-500 shrink-0" />
                          <span>Scheduled Recovery Day</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {filteredProblems.map((p) => {
                            const isChecked = !!progress[p.id];
                            const diffVariant =
                              p.difficulty === 'Easy' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' :
                              p.difficulty === 'Hard' ? 'border-destructive/30 text-destructive bg-destructive/10' :
                              'border-amber-500/30 text-amber-500 bg-amber-500/10';

                            const isFlagged = !!flaggedProblems[p.id];
                            const userNote = problemNotes[p.id] || '';
                            const isNoteOpen = activeNoteId === p.id;

                            return (
                              <div
                                key={p.id}
                                className={`flex flex-col p-2.5 rounded-lg border border-border/40 transition-colors ${
                                  isChecked ? 'bg-muted/20' : 'hover:bg-muted/40'
                                }`}
                              >
                                <div
                                  onClick={() => toggleProblem(p.id)}
                                  className="flex items-center justify-between gap-3 cursor-pointer"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`size-4.5 rounded flex items-center justify-center border transition-all ${
                                        isChecked
                                          ? 'bg-primary border-primary text-primary-foreground'
                                          : 'border-border/80 group-hover:border-foreground/50 bg-background'
                                      }`}
                                    >
                                      {isChecked && <Check className="size-3 stroke-[3]" />}
                                    </div>

                                    <div className="flex items-center gap-2 truncate">
                                      <span className={`text-xs sm:text-sm font-medium truncate ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                        {p.name}
                                      </span>
                                      {p.lcNumber > 0 && (
                                        <span className="font-mono text-[10px] text-muted-foreground">
                                          #{p.lcNumber}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border ${diffVariant}`}>
                                      {p.difficulty}
                                    </span>

                                    {TOP_150_LC_NUMBERS.has(p.lcNumber) && (
                                      <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded border border-purple-500/30 text-purple-400 bg-purple-500/10 hidden sm:inline">
                                        Top 150
                                      </span>
                                    )}

                                    <button
                                      type="button"
                                      title={isFlagged ? 'Flagged for review' : 'Flag for review'}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleProblemFlag(p.id);
                                      }}
                                      className={`p-1 rounded transition-colors ${
                                        isFlagged ? 'text-amber-500 bg-amber-500/15' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                      }`}
                                    >
                                      <Bookmark className={`size-3.5 ${isFlagged ? 'fill-amber-500' : ''}`} />
                                    </button>

                                    <button
                                      type="button"
                                      title={userNote ? 'View/edit approach note' : 'Add approach note'}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveNoteId(isNoteOpen ? null : p.id);
                                      }}
                                      className={`p-1 rounded transition-colors ${
                                        userNote ? 'text-primary bg-primary/15' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                      }`}
                                    >
                                      <FileText className="size-3.5" />
                                    </button>

                                    <a
                                      href={p.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={e => e.stopPropagation()}
                                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                      title="Open on LeetCode"
                                    >
                                      <ExternalLink className="size-3.5" />
                                    </a>
                                  </div>
                                </div>

                                {isNoteOpen && (
                                  <div className="mt-2 pt-2 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                                    <textarea
                                      value={userNote}
                                      onChange={(e) => setProblemNote(p.id, e.target.value)}
                                      placeholder="Approach notes, complexity, key invariant..."
                                      className="w-full text-xs p-2 rounded-lg bg-background border border-border resize-y min-h-[50px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                                    />
                                  </div>
                                )}

                                {!isNoteOpen && userNote && (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveNoteId(p.id);
                                    }}
                                    className="mt-1 text-[11px] text-muted-foreground italic truncate cursor-pointer hover:text-foreground"
                                  >
                                    📝 {userNote}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
