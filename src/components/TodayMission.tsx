import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { ExternalLink, Check, Coffee, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TOP_150_LC_NUMBERS } from '../data/top150List';
import { COMPANY_LABELS } from '../data/companyMappings';

export const TodayMission: React.FC = () => {
  const { stats, progress, toggleProblem, markDayComplete, isDayComplete, setActiveWeek, userProfile } = useProgress();

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* ── HEADER ── */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 8, flexWrap: 'wrap', gap: 8
        }}>
          <div style={{
            fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <span>Day {todayDayPlan.day} of 140</span>
            <span>·</span>
            <span>Week {currentWeekPlan.week}</span>
            <span>·</span>
            <span>{todayDayPlan.weekday}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {stats.streak > 0 && (
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-warning-text)', fontWeight: 600 }}>
                🔥 {stats.streak} day streak
              </span>
            )}
            {isComplete && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: 'var(--color-success-text)',
                padding: '2px 8px', borderRadius: 'var(--radius-xs)',
                background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)'
              }}>
                Day Complete
              </span>
            )}
          </div>
        </div>

        <h1 style={{
          fontSize: 24, fontWeight: 700, color: 'var(--text-primary)',
          letterSpacing: '-0.02em', margin: '0 0 6px', lineHeight: 1.2
        }}>
          {todayDayPlan.topic}
        </h1>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          {todayDayPlan.type === 'rest'
            ? `Rest day — dedicated to ${restActivity}. Recharge your mental focus.`
            : `Completed ${solvedToday} of ${totalToday} problem${totalToday !== 1 ? 's' : ''} today to maintain your daily cadence.`}
        </p>
      </div>

      {/* ── TODAY'S PROBLEMS LIST ── */}
      {todayDayPlan.type === 'rest' ? (
        <div style={{
          padding: '24px 20px', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)', background: 'var(--bg-card)',
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <Coffee size={22} style={{ color: 'var(--text-muted)' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Scheduled Rest Day</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Spend today on {restActivity}. Deliberate recovery builds long-term endurance.
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          overflow: 'hidden'
        }}>
          {todayDayPlan.problems.map((p, idx) => {
            const isChecked = !!progress[p.id];
            const diffColor = p.difficulty === 'Easy'
              ? 'var(--color-success-text)'
              : p.difficulty === 'Hard'
              ? 'var(--color-danger-text)'
              : 'var(--color-warning-text)';

            return (
              <div
                key={p.id}
                onClick={() => toggleProblem(p.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '14px 16px',
                  borderBottom: idx < todayDayPlan.problems.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: isChecked ? 'var(--color-success-bg)' : 'transparent',
                  cursor: 'pointer', transition: 'background var(--transition-fast)'
                }}
              >
                {/* Checkbox */}
                <div style={{ marginTop: 2 }}>
                  <div className={`checkbox-minimal ${isChecked ? 'checked' : ''}`}>
                    {isChecked && <Check size={11} />}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: 14, fontWeight: 600,
                          color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          display: 'inline-flex', alignItems: 'center', gap: 5
                        }}
                      >
                        {p.name}
                        <ExternalLink size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      </a>

                      {p.lcNumber > 0 && (
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          #{p.lcNumber}
                        </span>
                      )}
                    </div>

                    {/* Metadata tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: diffColor }}>
                        {p.difficulty}
                      </span>

                      {TOP_150_LC_NUMBERS.has(p.lcNumber) && !p.isReview && (
                        <span className="badge-mono" style={{ color: 'var(--color-info-text)' }}>
                          Top 150
                        </span>
                      )}

                      {p.companyTags?.slice(0, 2).map((tag) => {
                        const meta = COMPANY_LABELS[tag];
                        return meta ? (
                          <span key={tag} className="badge-mono">
                            {meta.badge}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {p.note && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.4, fontStyle: 'italic' }}>
                      {p.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ACTIONS & OVERALL PROGRESS BAR ── */}
      <div style={{
        paddingTop: 16, borderTop: '1px solid var(--border-default)',
        display: 'flex', flexDirection: 'column', gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Curriculum Progress: <strong style={{ color: 'var(--text-primary)' }}>{stats.solvedCount}</strong> / {stats.totalProblems} solved ({pct}%)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {todayDayPlan.type !== 'rest' && !isComplete && (
              <button
                onClick={() => markDayComplete(currentWeekPlan.week, todayDayPlan.day)}
                className="btn btn-default"
                style={{ fontSize: 12 }}
              >
                Mark Day Complete
              </button>
            )}

            <Link
              to="/curriculum"
              onClick={() => setActiveWeek(currentWeekPlan.week)}
              className="btn btn-ghost"
              style={{ fontSize: 12 }}
            >
              All Weeks <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        {/* Minimal progress hairline bar */}
        <div style={{
          height: 2, background: 'var(--border-subtle)',
          borderRadius: 99, overflow: 'hidden'
        }}>
          <div
            style={{
              height: '100%', width: `${pct}%`,
              background: 'var(--text-primary)', transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
};
