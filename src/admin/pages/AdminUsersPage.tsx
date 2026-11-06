import React, { useState, useEffect } from 'react';
import { AdminService } from '../services/adminService';
import type { AdminUserRecord } from '../../types';
import {
  Users, Search, Edit2, Check, Sparkles, Building2, Flame
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [moderatedName, setModeratedName] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    const data = await AdminService.fetchUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleTogglePro = async (userId: string, current: boolean) => {
    const success = await AdminService.toggleUserPro(userId, !current);
    if (success) {
      toast.success(`User Pro status ${!current ? 'granted' : 'revoked'}!`);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, isPro: !current } : u));
    } else {
      toast.error('Failed to update Pro status.');
    }
  };

  const handleModerate = async (userId: string) => {
    if (!moderatedName.trim()) return;
    const success = await AdminService.moderateUser(userId, moderatedName.trim());
    if (success) {
      toast.success('Display name moderated successfully.');
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, displayName: moderatedName.trim() } : u));
      setModeratingId(null);
      setModeratedName('');
    } else {
      toast.error('Failed to moderate user name.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      (u.targetCompany || '').toLowerCase().includes(q) ||
      (u.tagline || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight m-0">
            User Directory &amp; Moderation
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            Inspect individual candidate profiles, manage Pro licenses, and sanitize public leaderboard entries.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search candidate or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Users Table / Cards */}
      <Card className="border-border shadow-xs bg-card overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <span>Registered Candidates ({filteredUsers.length})</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              {loading ? 'Loading user directory...' : 'No users match your search query.'}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filteredUsers.map((u) => {
                const isModerating = moderatingId === u.userId;

                return (
                  <div key={u.userId} className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors flex-wrap sm:flex-nowrap">
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 rounded-xl bg-muted border border-border flex items-center justify-center font-bold text-xs text-foreground shrink-0 font-mono">
                        {u.displayName.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        {isModerating ? (
                          <div className="flex items-center gap-2 my-1">
                            <Input
                              value={moderatedName}
                              onChange={(e) => setModeratedName(e.target.value)}
                              className="text-xs h-7 w-48"
                              autoFocus
                            />
                            <Button size="icon-xs" onClick={() => handleModerate(u.userId)} className="size-7">
                              <Check className="size-3" />
                            </Button>
                            <Button size="xs" variant="ghost" onClick={() => setModeratingId(null)} className="h-7 text-xs">
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs text-foreground truncate">{u.displayName}</span>
                            {u.isPro && (
                              <Badge className="bg-primary/10 border-primary/30 text-primary text-[9px] font-mono py-0 px-1.5 uppercase font-bold">
                                Pro
                              </Badge>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setModeratingId(u.userId);
                                setModeratedName(u.displayName);
                              }}
                              className="text-muted-foreground hover:text-foreground p-0.5"
                              title="Moderate Display Name"
                            >
                              <Edit2 className="size-3" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
                          {u.targetCompany && (
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              <Building2 className="size-3 text-primary" />
                              <span>{u.targetCompany}</span>
                            </span>
                          )}
                          <span>•</span>
                          <span className="font-mono">{u.solvedCount} solved</span>
                          <span>•</span>
                          <span className="font-mono flex items-center gap-0.5 text-amber-500">
                            <Flame className="size-3 fill-amber-500/20" />
                            <span>{u.streak}d streak</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Pro Status Toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant={u.isPro ? 'outline' : 'default'}
                        size="xs"
                        onClick={() => handleTogglePro(u.userId, u.isPro)}
                        className={`text-xs h-7 gap-1 font-medium ${
                          u.isPro ? 'border-primary/40 text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40' : ''
                        }`}
                      >
                        <Sparkles className="size-3" />
                        <span>{u.isPro ? 'Revoke Pro' : 'Grant Pro'}</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
