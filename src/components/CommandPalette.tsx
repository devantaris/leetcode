import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { MERGED_PLAN_DATA as PLAN_DATA } from '../data/mergedPlanData';
import {
  Compass, BookOpen, BarChart2, Award, Terminal, Cloud,
  Briefcase, User, CalendarClock, RotateCcw, ExternalLink,
  Share2, Sparkles, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal?: (modal: 'rules' | 'strategy' | 'reset' | 'backup' | 'resume' | 'profile' | 'placements' | 'share' | 'pricing' | 'auth') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onOpenModal }) => {
  const { progress, setActiveWeek } = useProgress();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Search problems across all weeks
  const matchedProblems = React.useMemo(() => {
    if (!search.trim() || search.length < 2) return [];
    const q = search.toLowerCase();
    const results: Array<{ id: string; name: string; week: number; day: number; topic: string; difficulty: string; url: string; lcNumber: number }> = [];

    for (const week of PLAN_DATA) {
      for (const day of week.days) {
        for (const p of day.problems) {
          if (
            p.name.toLowerCase().includes(q) ||
            p.lcNumber.toString().includes(q) ||
            day.topic.toLowerCase().includes(q)
          ) {
            results.push({
              id: p.id,
              name: p.name,
              week: week.week,
              day: day.day,
              topic: day.topic,
              difficulty: p.difficulty,
              url: p.url,
              lcNumber: p.lcNumber,
            });
            if (results.length >= 8) return results;
          }
        }
      }
    }
    return results;
  }, [search]);

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSearch('');
          onClose();
        }
      }}
      title="GrindOS Command Search"
      description="Quickly navigate pages, toggle modal dialogs, or search DSA problems."
    >
      <CommandInput
        placeholder="Type a command, page name, or LeetCode problem..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-96">
        <CommandEmpty>No matching commands or problems found.</CommandEmpty>

        {/* Matched Problems */}
        {matchedProblems.length > 0 && (
          <CommandGroup heading="Curriculum Problems">
            {matchedProblems.map((p) => {
              const isChecked = !!progress[p.id];
              return (
                <CommandItem
                  key={p.id}
                  onSelect={() => {
                    setActiveWeek(p.week);
                    navigate('/curriculum');
                    onClose();
                  }}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={isChecked ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}>
                      {p.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      #{p.lcNumber} · Day {p.day}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                      {p.difficulty}
                    </Badge>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => {
              navigate('/dashboard');
              onClose();
            }}
          >
            <Compass className="size-4 mr-2 text-primary" />
            <span>Today&apos;s Mission Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              navigate('/curriculum');
              onClose();
            }}
          >
            <BookOpen className="size-4 mr-2 text-primary" />
            <span>Full Syllabus & Problem Explorer</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              navigate('/analytics');
              onClose();
            }}
          >
            <BarChart2 className="size-4 mr-2 text-primary" />
            <span>Readiness Metrics & Progress Analytics</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              navigate('/leaderboard');
              onClose();
            }}
          >
            <Award className="size-4 mr-2 text-primary" />
            <span>Live Leaderboard & Ranks</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              navigate('/os');
              onClose();
            }}
          >
            <Terminal className="size-4 mr-2 text-emerald-500" />
            <span>Switch to Retro Terminal OS</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              navigate('/terms');
              onClose();
            }}
          >
            <Shield className="size-4 mr-2 text-muted-foreground" />
            <span>Terms of Service & Privacy</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {onOpenModal && (
          <CommandGroup heading="Actions & Settings">
            <CommandItem
              onSelect={() => {
                onOpenModal('share');
                onClose();
              }}
            >
              <Share2 className="size-4 mr-2 text-primary" />
              <span>Share Candidate Velocity Badge</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onOpenModal('pricing');
                onClose();
              }}
            >
              <Sparkles className="size-4 mr-2 text-primary" />
              <span>Plans & Pro Licensing Matrix</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onOpenModal('auth');
                onClose();
              }}
            >
              <Cloud className="size-4 mr-2 text-emerald-500" />
              <span>Cloud Sync & Account Setup</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onOpenModal('placements');
                onClose();
              }}
            >
              <Briefcase className="size-4 mr-2 text-amber-500" />
              <span>Placement Pipeline Tracker</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onOpenModal('profile');
                onClose();
              }}
            >
              <User className="size-4 mr-2 text-foreground" />
              <span>Candidate Profile Settings</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onOpenModal('resume');
                onClose();
              }}
            >
              <CalendarClock className="size-4 mr-2 text-foreground" />
              <span>Adjust Target Timeline</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onOpenModal('backup');
                onClose();
              }}
            >
              <Cloud className="size-4 mr-2 text-foreground" />
              <span>Import / Export Backups</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onOpenModal('rules');
                onClose();
              }}
            >
              <BookOpen className="size-4 mr-2 text-foreground" />
              <span>View Grind Rules & Hotkeys</span>
            </CommandItem>
            <CommandItem
              variant="destructive"
              onSelect={() => {
                onOpenModal('reset');
                onClose();
              }}
            >
              <RotateCcw className="size-4 mr-2" />
              <span>Reset All Data</span>
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};
