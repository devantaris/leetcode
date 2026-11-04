import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import { ExternalLink, Check, Coffee, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TOP_150_LC_NUMBERS } from '../data/top150List';
import { COMPANY_LABELS } from '../data/companyMappings';
import { CURRICULUM } from '../data/curriculumStats';

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
    <div className="modern-card" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px' }}>
      {/* ── HEADER ── */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10, flexWrap: 'wrap', gap: 8
        }}>
          <div style={{
            fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--bg-elevated)', padding: '3px 10px',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ color: 'var(--text-accent)', fontWeight: 700 }}>Day {todayDayPlan.day}</span>
            <span>of {CURRICULUM.totalDays}</span>
            <span>·</span>
            <span>Week {currentWeekPlan.week}</span>
            <span>·</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{todayDayPlan.weekday}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {stats.streak > 0 && (
              <span style={{
                fontSize: 12, fontFamily: 'var(--font-mono)',
                color: 'var(--color-warning-text)', fontWeight: 700,
                background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)',
                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.2)'
              }}>
                🔥 {stats.streak} day streak
              </span>
            )}
            {isComplete && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: 'var(--color-success-text)',
                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)'
              }}>
                ✓ Day Complete
              </span>
            )}
          </div>
        </div>

        <h1 style={{
          fontSize: 26, fontWeight: 800, color: 'var(--text-primary)',
          letterSpacing: '-0.02em', margin: '0 0 8px', lineHeight: 1.2
        }}>
          {todayDayPlan.topic}
        </h1>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {todayDayPlan.type === 'rest'
            ? `Rest day — dedicated to ${restActivity}. Recharge your mental focus.`
            : `Completed ${solvedToday} of ${totalToday} problem${totalToday !== 1 ? 's' : ''} today to maintain your algorithmic velocity.`}
        </p>
      </div>

      {/* ── TODAY'S PROBLEMS LIST ── */}
      {todayDayPlan.type === 'rest' ? (
        <div style={{
          padding: '24px 20px', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)', background: 'var(--bg-elevated)',
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <Coffee size={24} style={{ color: 'var(--color-warning-text)' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Scheduled Rest & Recovery</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Spend today on {restActivity}. Deliberate recovery builds enduring technical problem-solving stamina.
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-elevated)',
          overflow: 'hidden'
        }}>
          {todayDayPlan.problems.map((p, idx) => {
            const isChecked = !!progress[p.id];
            const diffClass = p.difficulty === 'Easy'
              ? 'diff-easy'
              : p.difficulty === 'Hard'
              ? 'diff-hard'
              : 'diff-medium';

            return (
              <div
                key={p.id}
                onClick={() => toggleProblem(p.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 18px',
                  borderBottom: idx < todayDayPlan.problems.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: isChecked ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                  cursor: 'pointer', transition: 'all var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  if (!isChecked) e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseOut={(e) => {
                  if (!isChecked) e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Checkbox */}
                <div style={{ marginTop: 2 }}>
                  <div className={`checkbox-minimal ${isChecked ? 'checked' : ''}`}>
                    {isChecked && <Check size={12} strokeWidth={3} />}
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
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          transition: 'color var(--transition-fast)'
                        }}
                      >
                        {p.name}
                        <ExternalLink size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      </a>

                      {p.lcNumber > 0 && (
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          #{p.lcNumber}
                        </span>
                      )}
                    </div>

                    {/* Metadata tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span className={diffClass}>
                        {p.difficulty}
                      </span>

                      {TOP_150_LC_NUMBERS.has(p.lcNumber) && !p.isReview && (
                        <span className="badge-top150">
                          Top 150
                        </span>
                      )}

                      {p.companyTags?.slice(0, 3).map((tag) => {
                        const meta = COMPANY_LABELS[tag];
                        return meta ? (
                          <span key={tag} className="badge-company">
                            {meta.badge}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {p.note && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '5px 0 0', lineHeight: 1.4, fontStyle: 'italic' }}>
                      💡 {p.note}
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
        paddingTop: 16, borderTop: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Curriculum Progress: <strong style={{ color: 'var(--text-primary)' }}>{stats.solvedCount}</strong> / {stats.totalProblems} solved <span style={{ color: 'var(--color-success-text)', fontWeight: 700 }}>({pct}%)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {todayDayPlan.type !== 'rest' && !isComplete && (
              <button
                onClick={() => markDayComplete(currentWeekPlan.week, todayDayPlan.day)}
                className="btn btn-default"
                style={{
                  fontSize: 12, padding: '6px 12px',
                  background: 'var(--color-success-bg)',
                  color: 'var(--color-success-text)',
                  borderColor: 'var(--color-success-border)'
                }}
              >
                Mark Day Complete
              </button>
            )}

            <Link
              to="/curriculum"
              onClick={() => setActiveWeek(currentWeekPlan.week)}
              className="btn btn-ghost"
              style={{ fontSize: 12, padding: '6px 12px' }}
            >
              All Weeks <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Hairline progress bar */}
        <div className="progress-track" style={{ height: 6 }}>
          <div
            className="progress-fill-gradient"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
