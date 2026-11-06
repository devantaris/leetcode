import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import {
  Activity, Radio, Users, Award, ShieldAlert,
  ArrowLeft, LogOut, Terminal
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const AdminLayout: React.FC = () => {
  const { authUser, logout } = useProgress();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Ops Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground" title="Exit to App">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-mono text-xs font-bold">
              <Terminal className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold tracking-tight text-foreground">
                  GrindOS // Ops Console
                </span>
                <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-wider text-emerald-500 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0">
                  Stealth Superadmin
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono">
                System telemetry, community research &amp; live broadcasts
              </p>
            </div>
          </div>
        </div>

        {/* Right user info & logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-foreground truncate max-w-[150px]">
              {authUser?.displayName || 'Administrator'}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">
              {authUser?.email}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="text-xs h-8 gap-1.5 border-border/80 text-muted-foreground hover:text-destructive"
            title="Sign out of Admin Session"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Ops Navigation Bar */}
      <div className="border-b border-border bg-card/50 px-4 sm:px-6">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2">
          <NavLink
            to="/_ops"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`
            }
          >
            <Activity className="size-3.5" />
            <span>Overview &amp; Pulse</span>
          </NavLink>

          <NavLink
            to="/_ops/broadcasts"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`
            }
          >
            <Radio className="size-3.5" />
            <span>Broadcasts &amp; Banners</span>
          </NavLink>

          <NavLink
            to="/_ops/users"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`
            }
          >
            <Users className="size-3.5" />
            <span>Users &amp; Moderation</span>
          </NavLink>

          <NavLink
            to="/_ops/cohorts"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`
            }
          >
            <Award className="size-3.5" />
            <span>Cohorts</span>
          </NavLink>
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Ops Footer */}
      <footer className="border-t border-border/60 py-3 px-6 text-center text-[11px] text-muted-foreground font-mono flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="size-3.5 text-primary" />
          <span>Internal Restricted Area • Strictly Confidential</span>
        </div>
        <div>GrindOS Ops Engine v2.4</div>
      </footer>
    </div>
  );
};
