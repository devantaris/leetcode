// GrindOS — AI Placement Coach
// Linear SaaS Minimalist Redesign

import React, { useState, useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Bot, Target, AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';

export const AICoachCard: React.FC = () => {
  const { stats, userProfile } = useProgress();
  const [activeTab, setActiveTab] = useState<'brief' | 'diagnostic' | 'strategy'>('brief');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentWeekPlan = PLAN_DATA.find((w) => w.week === stats.currentWeek) || PLAN_DATA[0];
  const todayDayPlan = currentWeekPlan.days.find((d) => d.day === stats.currentDay) || currentWeekPlan.days[0];

  const currentTopic = todayDayPlan.topic;
  const currentPhase = stats.currentWeek <= 4 ? 1 : stats.currentWeek <= 9 ? 2 : stats.currentWeek <= 13 ? 3 : stats.currentWeek <= 14 ? 4 : 5;

  const phaseIntel = useMemo(() => {
    switch (currentPhase) {
      case 1:
        return {
          title: 'Linear Foundations Phase',
          insight: 'Arrays, Two Pointers & HashMaps are tested in 75%+ of technical phone screens. Make sure you can solve Two Sum and 3Sum cleanly without hesitation.',
          priority: 'Eliminate brute force O(N²) habits.'
        };
      case 2:
        return {
          title: 'Hierarchical & Graphs Phase',
          insight: 'Tree BFS/DFS and Matrix traversals are high-frequency topics. Focus on recognizing whether a graph problem requires BFS (shortest path) or DFS (connected components).',
          priority: 'Master Level-Order BFS and recursive DFS path sums.'
        };
      case 3:
        return {
          title: 'Dynamic Programming Phase',
          insight: 'DP questions frequently filter candidates in OAs. Focus on state formulation: memoization (top-down) before attempting tabulation (bottom-up).',
          priority: 'Identify 0/1 Knapsack and Longest Common Subsequence templates.'
        };
      case 4:
        return {
          title: 'Architecture & System Design Phase',
          insight: 'Crucial for software engineering conversions. Focus on caching (Redis), rate limiting, and horizontal partitioning concepts.',
          priority: 'Understand high-level latency vs throughput trade-offs.'
        };
      default:
        return {
          title: 'Offer Sprint & Timed Mocks Phase',
          insight: 'Speed and verbalization under 40-minute constraints dictate offers. Practice explaining complexities upfront before writing code.',
          priority: 'Simulate high-pressure live coding environments.'
        };
    }
  }, [currentPhase]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 350);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-primary)'
          }}>
            <Bot size={15} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Placement Coach
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2, marginTop: 2 }}>
              Phase {currentPhase}: {phaseIntel.title}
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'var(--bg-elevated)', padding: 3,
          borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)'
        }}>
          {(['brief', 'diagnostic', 'strategy'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontSize: 11, fontWeight: 600,
                padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                border: 'none', cursor: 'pointer',
                background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab === 'brief' ? 'Brief' : tab === 'diagnostic' ? 'Diagnostic' : 'Phase'}
            </button>
          ))}
          <button
            onClick={handleRefresh}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '2px 4px', display: 'flex'
            }}
            title="Refresh brief"
          >
            <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'brief' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{userProfile.name}</span>, your mission today is{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{currentTopic}</strong>. With {stats.daysLeft} days to target,{' '}
            {stats.missedDaysCount > 0
              ? `recovering your ${stats.missedDaysCount} missed sessions will bring your readiness score back on track.`
              : `your ${stats.streak}-day streak is actively maintaining momentum.`}
          </p>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            fontSize: 12
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Projected Completion</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {stats.projectedCompletionDate}
            </span>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Action:</span>
            <span style={{ color: 'var(--text-secondary)' }}>{stats.readinessBreakdown.actionableAdvice}</span>
          </div>
        </div>
      )}

      {activeTab === 'diagnostic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{
            padding: '8px 10px', borderRadius: 'var(--radius-md)',
            background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)'
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-success-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={12} /> Asset
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {stats.streak >= 5 ? `${stats.streak}-day streak with consistent practice.` : `${stats.solvedCount} problems completed.`}
            </div>
          </div>

          <div style={{
            padding: '8px 10px', borderRadius: 'var(--radius-md)',
            background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)'
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-warning-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={12} /> Priority Gap
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {stats.missedDaysCount > 0 ? `${stats.missedDaysCount} missed practice days.` : 'Aim for 25m completion on Medium problems.'}
            </div>
          </div>

          <div style={{
            padding: '8px 10px', borderRadius: 'var(--radius-md)',
            background: 'var(--color-info-bg)', border: '1px solid var(--color-info-border)'
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-info-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Target size={12} /> Target
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {stats.oddsPercentage < 50 ? 'Reach 50% readiness score.' : stats.oddsPercentage < 75 ? 'Advance to 75% coverage.' : 'Target 90%+ with timed speedruns.'}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'strategy' && (
        <div style={{
          padding: '10px 12px', background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
          display: 'flex', flexDirection: 'column', gap: 6
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
            {phaseIntel.title} (Week {stats.currentWeek})
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {phaseIntel.insight}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 4, borderTop: '1px solid var(--border-subtle)' }}>
            Priority: {phaseIntel.priority}
          </div>
        </div>
      )}
    </div>
  );
};
