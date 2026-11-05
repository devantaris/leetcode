import React, { useState, useEffect, useCallback } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { AuthModal } from '../components/modals/AuthModal';
import { RefreshCw, Users, Globe, Copy, Check, Eye, EyeOff, LogIn, Cloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@/components/ui/table';

export const LeaderboardPage: React.FC = () => {
  const { stats, userProfile, activeCohort, joinCohort, leaveCohort, authUser } = useProgress();
  const [boardType, setBoardType] = useState<'global' | 'cohort'>('global');
  const [cohortInput, setCohortInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const {
    entries,
    myEntry,
    myRank,
    isOptedIn,
    isAnonymous,
    toggleOptIn,
    toggleAnonymous,
    syncStats,
    fetchEntries,
    isSyncing,
    isFetching,
    isEnabled,
  } = useLeaderboard();

  const handleSync = useCallback(async () => {
    await syncStats({
      solvedCount: stats.solvedCount,
      streak: stats.streak,
      daysLeft: stats.daysLeft,
      oddsPercentage: stats.oddsPercentage,
      displayName: userProfile.name,
      tagline: userProfile.tagline,
    });
  }, [syncStats, stats, userProfile]);

  useEffect(() => {
    if (isOptedIn) {
      handleSync();
    }
  }, [isOptedIn, handleSync]);

  const renderRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-amber-500 text-amber-950 font-mono font-bold text-xs">#1</Badge>;
    if (rank === 2) return <Badge variant="secondary" className="font-mono font-bold text-xs">#2</Badge>;
    if (rank === 3) return <Badge variant="outline" className="border-amber-600/40 text-amber-600 font-mono font-bold text-xs">#3</Badge>;
    return <span className="font-mono text-xs text-muted-foreground font-semibold">#{rank}</span>;
  };

  const handleJoinCohortSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortInput.trim()) return;
    setIsJoining(true);
    await joinCohort(cohortInput.trim().toUpperCase());
    setIsJoining(false);
    setCohortInput('');
    toast.success('Joined cohort!');
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* ── Title & Switcher Row ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
            Competitive Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Compare algorithmic velocity with engineers preparing for top tech roles.
          </p>
        </div>

        {/* Tab switcher: Global vs Cohort */}
        <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1 border border-border/40 text-xs font-medium">
          <Button
            variant={boardType === 'global' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setBoardType('global')}
            className="h-7 gap-1 text-xs"
          >
            <Globe className="size-3.5" />
            <span>Global</span>
          </Button>
          <Button
            variant={boardType === 'cohort' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setBoardType('cohort')}
            className="h-7 gap-1 text-xs"
          >
            <Users className="size-3.5" />
            <span>Cohort {activeCohort ? `(${activeCohort.code})` : ''}</span>
          </Button>
        </div>
      </div>

      {/* Guest Mode Banner */}
      {!authUser && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Cloud className="size-5 text-primary shrink-0" />
              <div>
                <div className="text-xs font-semibold text-foreground">Guest Mode Active</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Sign in to register your rank on the live cloud leaderboard and sync across browsers.
                </div>
              </div>
            </div>
            <Button size="xs" onClick={() => setIsAuthModalOpen(true)} className="text-xs h-7.5 gap-1.5">
              <LogIn className="size-3.5" />
              <span>Sign In / Create Account</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── User Status & Sync Bar ── */}
      <Card className="shadow-xs border-border/60">
        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-mono text-xs py-1">
              Rank #{myRank || '—'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              <strong className="text-foreground">{stats.solvedCount}</strong> solved ·{' '}
              <span className="text-amber-500 font-medium">🔥 {stats.streak}d streak</span> ·{' '}
              <span className="text-primary font-semibold">{stats.oddsPercentage}% readiness</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isOptedIn && (
              <Button
                variant="ghost"
                size="xs"
                onClick={toggleAnonymous}
                className="text-xs text-muted-foreground hover:text-foreground h-7 gap-1"
                title={isAnonymous ? "Currently Anonymous" : "Showing your name"}
              >
                {isAnonymous ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                <span>{isAnonymous ? 'Anon' : 'Public'}</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="xs"
              onClick={toggleOptIn}
              className="text-xs h-7"
            >
              {isOptedIn ? 'Opt Out' : 'Join Board'}
            </Button>

            <Button
              variant="outline"
              size="icon-xs"
              onClick={fetchEntries}
              disabled={isFetching}
              className="size-7"
              title="Refresh"
            >
              <RefreshCw className={`size-3.5 ${isFetching || isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── BOARD CONTENT ── */}
      {boardType === 'cohort' ? (
        activeCohort ? (
          <div className="flex flex-col gap-4">
            <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <span className="font-semibold text-foreground text-sm">{activeCohort.name}</span>
                <span className="font-mono text-xs text-muted-foreground ml-3">
                  Invite Code: <strong className="text-foreground">{activeCohort.code}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    navigator.clipboard.writeText(activeCohort.code);
                    setCopied(true);
                    toast.success(`Copied invite code: ${activeCohort.code}`);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs h-7 gap-1"
                >
                  {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  <span>{copied ? 'Copied' : 'Share Code'}</span>
                </Button>
                <Button
                  variant="destructive"
                  size="xs"
                  onClick={leaveCohort}
                  className="text-xs h-7"
                >
                  Leave
                </Button>
              </div>
            </div>

            {/* Members table */}
            <Card className="shadow-xs border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead className="text-right">Solves</TableHead>
                    <TableHead className="text-right">Streak</TableHead>
                    <TableHead className="text-right">Readiness</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-primary/5 font-semibold text-xs">
                    <TableCell>{renderRankBadge(1)}</TableCell>
                    <TableCell className="text-primary">{userProfile.name} (You)</TableCell>
                    <TableCell className="text-right font-mono text-emerald-500">{stats.solvedCount}</TableCell>
                    <TableCell className="text-right font-mono text-amber-500">🔥 {stats.streak}d</TableCell>
                    <TableCell className="text-right font-mono text-primary">{stats.oddsPercentage}%</TableCell>
                  </TableRow>

                  {isEnabled && entries.filter(e => e.user_id !== myEntry?.user_id).map((peer, idx) => (
                    <TableRow key={peer.id || peer.user_id} className="text-xs">
                      <TableCell>{renderRankBadge(idx + 2)}</TableCell>
                      <TableCell className="font-medium text-foreground">
                        {peer.is_anonymous ? 'Anonymous Grinder 🎭' : peer.display_name}
                        {peer.tagline && !peer.is_anonymous && (
                          <span className="text-muted-foreground text-[11px] ml-2 font-normal">
                            {peer.tagline}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-500">{peer.solved_count}</TableCell>
                      <TableCell className="text-right font-mono text-amber-500">🔥 {peer.streak}d</TableCell>
                      <TableCell className="text-right font-mono text-primary">{peer.readiness_pct}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        ) : (
          /* Join Cohort Form */
          <Card className="border-border/60">
            <CardContent className="p-8 flex flex-col items-center text-center max-w-md mx-auto gap-4">
              <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Users className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-foreground">Join a Study Cohort</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Compete with your university batchmates, campus study circle, or placement discord group.
                </p>
              </div>

              <form onSubmit={handleJoinCohortSubmit} className="flex gap-2 w-full mt-2">
                <Input
                  placeholder="Enter 6-char code (e.g. GRIND1)"
                  value={cohortInput}
                  onChange={(e) => setCohortInput(e.target.value.toUpperCase())}
                  className="text-xs h-9 font-mono"
                  maxLength={10}
                />
                <Button type="submit" disabled={isJoining || !cohortInput.trim()} className="text-xs h-9">
                  {isJoining ? 'Joining…' : 'Join'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )
      ) : (
        /* Global Leaderboard Table */
        <Card className="shadow-xs border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead className="text-right">Total Solves</TableHead>
                <TableHead className="text-right">Streak</TableHead>
                <TableHead className="text-right">Readiness</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-xs text-muted-foreground">
                    {isFetching ? 'Fetching live entries from cloud...' : 'No public leaderboard entries yet. Be the first to join above!'}
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry, idx) => {
                  const isMe = entry.user_id === myEntry?.user_id;

                  return (
                    <TableRow key={entry.id || entry.user_id} className={`text-xs ${isMe ? 'bg-primary/5 font-semibold' : ''}`}>
                      <TableCell>{renderRankBadge(idx + 1)}</TableCell>
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <span>{entry.is_anonymous ? 'Anonymous Grinder 🎭' : entry.display_name}</span>
                          {isMe && <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">You</Badge>}
                        </div>
                        {entry.tagline && !entry.is_anonymous && (
                          <div className="text-[11px] text-muted-foreground font-normal mt-0.5">
                            {entry.tagline}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-500 font-semibold">{entry.solved_count}</TableCell>
                      <TableCell className="text-right font-mono text-amber-500 font-medium">🔥 {entry.streak}d</TableCell>
                      <TableCell className="text-right font-mono text-primary font-semibold">{entry.readiness_pct}%</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};
