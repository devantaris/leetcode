import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { ExternalLink, Check, Coffee, ArrowRight, Flame, AlertCircle, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TOP_150_LC_NUMBERS } from '../data/top150List';
import { COMPANY_LABELS } from '../data/companyMappings';
import { CURRICULUM } from '../data/curriculumStats';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const TodayMission: React.FC = () => {
  const { stats, progress, toggleProblem, markDayComplete, isDayComplete, setActiveWeek, userProfile, catchUpQueue } = useProgress();

  const SKILL_LABELS: Record<string, string> = {
    project: 'personal project',
    research: 'research paper or thesis',
    competitive: 'competitive programming',
    systemdesign: 'system design reading',
    openSource: 'open source contributions',
    other: 'rest and recharge',
  };
  const restActivity = SKILL_LABELS[userProfile.secondarySkill] || 'secondary focus';

  const currentWeekPlan = PLAN_DATA.find((w) => w.week === stats.currentWeek) || PLAN_DATA[0];
  const todayDayPlan = currentWeekPlan.days.find((d) => d.day === stats.currentDay) || currentWeekPlan.days[0];
  const isComplete = isDayComplete(currentWeekPlan.week, todayDayPlan.day);
  const solvedToday = todayDayPlan.problems.filter(p => !!progress[p.id]).length;
  const totalToday = todayDayPlan.problems.length;
  const pct = Math.round((stats.solvedCount / Math.max(1, stats.totalProblems)) * 100);

  return (
    <Card className="border border-border/80 bg-card text-card-foreground shadow-xs">
      {/* ── HEADER ── */}
      <CardHeader className="gap-3 pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          {/* Day & Week tag */}
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 border border-border/50 px-2.5 py-1 text-xs font-mono text-muted-foreground">
            <span className="font-bold text-foreground">Day {todayDayPlan.day}</span>
            <span>of {CURRICULUM.totalDays}</span>
            <span className="opacity-40">/</span>
            <span>W{currentWeekPlan.week}</span>
            <span className="opacity-40">/</span>
            <span className="font-semibold text-foreground">{todayDayPlan.weekday}</span>
          </div>

          {/* Badges: Backlog, Streak, Completion */}
          <div className="flex items-center gap-2">
            {catchUpQueue && catchUpQueue.length > 0 && (
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 font-mono text-xs">
                <AlertCircle className="size-3 mr-1" />
                {catchUpQueue.length}d backlog
              </Badge>
            )}
            {stats.streak > 0 && (
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 font-mono text-xs">
                <Flame className="size-3 mr-1 fill-amber-500/20" />
                {stats.streak}d streak
              </Badge>
            )}
            {isComplete && (
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs">
                <Check className="size-3 mr-1 stroke-[3]" />
                Day Solved
              </Badge>
            )}
          </div>
        </div>

        <div>
          <CardTitle className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
            {todayDayPlan.topic}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
            {todayDayPlan.type === 'rest'
              ? `Scheduled focus day — dedicated to ${restActivity}. Active recovery builds enduring technical stamina.`
              : `Completed ${solvedToday} of ${totalToday} problem${totalToday !== 1 ? 's' : ''} to maintain algorithmic velocity.`}
          </CardDescription>
        </div>
      </CardHeader>

      {/* ── TODAY'S PROBLEMS LIST ── */}
      <CardContent className="flex flex-col gap-3 pt-2">
        {todayDayPlan.type === 'rest' ? (
          <div className="flex items-center gap-4 p-5 rounded-xl border border-border/60 bg-muted/30">
            <div className="size-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <Coffee className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Scheduled Rest & Deep Synthesis</div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Use today for {restActivity}. Deliberate recovery allows deep pattern consolidation.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border/70 divide-y divide-border/40 overflow-hidden bg-card/60 shadow-xs">
            {todayDayPlan.problems.map((p) => {
              const isChecked = !!progress[p.id];
              const diffVariant =
                p.difficulty === 'Easy' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                p.difficulty === 'Hard' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' :
                'border-amber-500/30 text-amber-400 bg-amber-500/10';

              return (
                <div
                  key={p.id}
                  onClick={() => toggleProblem(p.id)}
                  className={`flex items-start gap-3.5 p-3.5 sm:p-4 transition-all duration-150 cursor-pointer group ${
                    isChecked ? 'bg-muted/20 opacity-80' : 'hover:bg-muted/40'
                  }`}
                >
                  {/* Custom Checkbox */}
                  <div className="mt-0.5 shrink-0">
                    <div
                      className={`size-5 rounded-md flex items-center justify-center border transition-all duration-150 ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                          : 'border-border/80 group-hover:border-foreground/50 bg-background'
                      }`}
                    >
                      {isChecked && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Problem Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`text-sm sm:text-base font-medium inline-flex items-center gap-1.5 transition-colors hover:text-primary ${
                            isChecked ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          <span>{p.name}</span>
                          <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
                        </a>

                        {p.lcNumber > 0 && (
                          <span className="font-mono text-xs text-muted-foreground">
                            #{p.lcNumber}
                          </span>
                        )}
                      </div>

                      {/* Badges / Tags */}
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        <span className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md border ${diffVariant}`}>
                          {p.difficulty}
                        </span>

                        {TOP_150_LC_NUMBERS.has(p.lcNumber) && !p.isReview && (
                          <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded-md border border-purple-500/30 text-purple-400 bg-purple-500/10">
                            Top 150
                          </span>
                        )}

                        {p.companyTags?.slice(0, 3).map((tag) => {
                          const meta = COMPANY_LABELS[tag];
                          return meta ? (
                            <span key={tag} className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded border border-border/60 bg-muted/60 text-muted-foreground">
                              {meta.badge}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>

                    {p.note && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground/90 bg-muted/40 px-2.5 py-1 rounded-md border border-border/40 w-fit">
                        <Lightbulb className="size-3 text-amber-500 shrink-0" />
                        <span>{p.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* ── FOOTER & PROGRESS ── */}
      <CardFooter className="flex flex-col gap-3 pt-3">
        <div className="w-full flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="font-mono text-muted-foreground">
            Curriculum: <strong className="text-foreground">{stats.solvedCount}</strong> / {stats.totalProblems} solved{' '}
            <span className="font-semibold text-emerald-500">({pct}%)</span>
          </div>

          <div className="flex items-center gap-2">
            {todayDayPlan.type !== 'rest' && !isComplete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markDayComplete(currentWeekPlan.week, todayDayPlan.day)}
                className="h-8 text-xs border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
              >
                <Check className="size-3.5 mr-1" />
                Mark Day Complete
              </Button>
            )}

            <Link
              to="/curriculum"
              onClick={() => setActiveWeek(currentWeekPlan.week)}
            >
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                <span>All Weeks</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        <Progress value={pct} className="h-1.5 w-full bg-muted/60" />
      </CardFooter>
    </Card>
  );
};
