import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { CURRICULUM } from '../data/curriculumStats';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export const HeatmapGrid: React.FC = () => {
  const { isDayComplete, setActiveWeek, stats } = useProgress();
  const navigate = useNavigate();

  const handleWeekClick = (weekNum: number) => {
    setActiveWeek(weekNum);
    navigate('/curriculum');
  };

  return (
    <Card className="border border-border/80 bg-card text-card-foreground shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            {CURRICULUM.totalDays}-Day Algorithmic Matrix
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click any week column to navigate directly into its syllabus
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-xs bg-primary shadow-xs" />
            <span className="text-[11px]">Solved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-xs bg-foreground shadow-xs" />
            <span className="text-[11px]">Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-xs bg-rose-500/80" />
            <span className="text-[11px]">Backlog</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-xs bg-amber-500/50" />
            <span className="text-[11px]">Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-xs bg-muted/60 border border-border/60" />
            <span className="text-[11px]">Pending</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 overflow-x-auto pb-4">
        <div className="grid gap-1.5 min-w-[760px]" style={{ gridTemplateColumns: `repeat(${PLAN_DATA.length}, minmax(30px, 1fr))` }}>
          {PLAN_DATA.map((w) => {
            const isCurrentWeek = w.week === stats.currentWeek;

            return (
              <div
                key={w.week}
                onClick={() => handleWeekClick(w.week)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isCurrentWeek
                    ? 'border-primary/50 bg-primary/5 shadow-xs'
                    : 'border-border/30 hover:border-border hover:bg-muted/40'
                }`}
              >
                <span className={`font-mono text-[9px] font-bold ${isCurrentWeek ? 'text-primary' : 'text-muted-foreground'}`}>
                  W{w.week}
                </span>

                <div className="flex flex-col gap-1 w-full items-center">
                  {w.days.map((d) => {
                    const complete = isDayComplete(w.week, d.day);
                    const isActive = d.day === stats.currentDay;
                    const isBacklog = d.day < stats.currentDay && !complete && d.type !== 'rest';

                    let cellColor = 'bg-muted/40 border border-border/40';
                    let statusLabel = 'Pending';

                    if (complete) {
                      cellColor = 'bg-emerald-500 border border-emerald-400 text-white shadow-xs';
                      statusLabel = 'Completed';
                    } else if (isActive) {
                      cellColor = 'bg-primary border border-primary/80 ring-2 ring-primary/30';
                      statusLabel = 'Active Target';
                    } else if (isBacklog) {
                      cellColor = 'bg-rose-500/30 border border-rose-500/60';
                      statusLabel = 'Backlog';
                    } else if (d.type === 'review') {
                      cellColor = 'bg-amber-500/25 border border-amber-500/40';
                      statusLabel = 'Review Day';
                    } else if (d.type === 'contest') {
                      cellColor = 'bg-purple-500/25 border border-purple-500/40';
                      statusLabel = 'Contest Simulation';
                    }

                    return (
                      <Tooltip key={d.day}>
                        <TooltipTrigger render={<div className={`size-4 sm:size-4.5 rounded-xs transition-transform hover:scale-115 ${cellColor}`} />}>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-semibold text-foreground">Day {d.day} ({d.weekday}) · {statusLabel}</p>
                          <p className="text-[10px] text-muted-foreground">{d.topic}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
