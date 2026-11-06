import React, { useState, useEffect } from 'react';
import { AdminService } from '../services/adminService';
import { useProgress } from '../../context/ProgressContext';
import type { SystemAnnouncement } from '../../types';
import {
  Radio, Plus, Trash2, Eye, Bell
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export const AdminBroadcastPage: React.FC = () => {
  const { authUser } = useProgress();
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'update' | 'pricing' | 'maintenance' | 'feature'>('update');
  const [targetTier, setTargetTier] = useState<'all' | 'free' | 'pro'>('all');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAnnouncements = async () => {
    const data = await AdminService.fetchAnnouncements();
    setAnnouncements(data);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required.');
      return;
    }

    setIsSubmitting(true);
    const success = await AdminService.createAnnouncement({
      title: title.trim(),
      message: message.trim(),
      type: 'banner',
      category,
      targetTier,
      ctaLabel: ctaLabel.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
      isActive: true,
      startsAt: new Date().toISOString(),
      createdBy: authUser?.email || 'admin'
    });

    setIsSubmitting(false);

    if (success) {
      toast.success('Live broadcast published successfully! 🚀');
      setTitle('');
      setMessage('');
      setCtaLabel('');
      setCtaUrl('');
      loadAnnouncements();
    } else {
      toast.error('Failed to create broadcast.');
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    const success = await AdminService.toggleAnnouncement(id, !current);
    if (success) {
      toast.success(`Broadcast ${!current ? 'activated' : 'paused'}.`);
      loadAnnouncements();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this broadcast?')) return;
    const success = await AdminService.deleteAnnouncement(id);
    if (success) {
      toast.success('Broadcast deleted.');
      loadAnnouncements();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight m-0">
          Live Broadcasts &amp; User Notifications
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
          Push real-time banners, price updates, and release changelogs to all active candidates without redeployment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Creator Form (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="border-border shadow-xs bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Plus className="size-4 text-primary" />
                <span>Publish New Broadcast</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-foreground">Headline Title</label>
                  <Input
                    placeholder="e.g. Pro Beta Launch or Black Friday Special"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xs h-8.5"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-foreground">Broadcast Message</label>
                  <textarea
                    placeholder="Short notice displayed in the top banner across all views..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-background border border-border resize-y min-h-[70px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-foreground">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="h-8.5 rounded-md border border-input bg-background px-2.5 text-xs text-foreground outline-none focus:border-ring"
                    >
                      <option value="update">Platform Update</option>
                      <option value="pricing">Pricing &amp; Promo</option>
                      <option value="feature">New Feature</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-foreground">Target Tier</label>
                    <select
                      value={targetTier}
                      onChange={(e) => setTargetTier(e.target.value as any)}
                      className="h-8.5 rounded-md border border-input bg-background px-2.5 text-xs text-foreground outline-none focus:border-ring"
                    >
                      <option value="all">All Users</option>
                      <option value="free">Free Tier Only</option>
                      <option value="pro">Pro Members Only</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-foreground">CTA Button Label</label>
                    <Input
                      placeholder="e.g. Upgrade Now"
                      value={ctaLabel}
                      onChange={(e) => setCtaLabel(e.target.value)}
                      className="text-xs h-8.5"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-foreground">CTA URL / Action</label>
                    <Input
                      placeholder="e.g. /dashboard or URL"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      className="text-xs h-8.5"
                    />
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-1 mt-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold flex items-center gap-1">
                    <Eye className="size-3" />
                    <span>Live Banner Preview</span>
                  </div>
                  <div className="text-xs font-semibold text-foreground">{title || 'Your Headline Title'}</div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">
                    {message || 'Your broadcast message preview will render here.'}
                  </div>
                  {ctaLabel && (
                    <span className="text-[10px] text-primary font-bold underline mt-1">
                      {ctaLabel} →
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-xs h-8.5 font-semibold mt-1"
                >
                  <Radio className="size-3.5 mr-1.5" />
                  <span>Publish Broadcast to Live Users</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Announcements History (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <Card className="border-border shadow-xs bg-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                <span>Broadcast History ({announcements.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 pt-0">
              {announcements.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
                  No broadcasts created yet. Fill out the form to publish your first announcement.
                </div>
              ) : (
                announcements.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      a.isActive
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border/60 bg-muted/20 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-foreground">{a.title}</span>
                          <Badge
                            variant={a.isActive ? 'default' : 'secondary'}
                            className="text-[9px] font-mono py-0 px-1.5 uppercase"
                          >
                            {a.isActive ? 'Active' : 'Paused'}
                          </Badge>
                          <Badge variant="outline" className="text-[9px] font-mono py-0 px-1 capitalize">
                            {a.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed m-0">
                          {a.message}
                        </p>
                        {a.ctaLabel && (
                          <div className="text-[11px] text-primary font-medium flex items-center gap-1 mt-0.5">
                            <span>CTA: {a.ctaLabel}</span>
                            {a.ctaUrl && <span className="font-mono text-[10px] text-muted-foreground">({a.ctaUrl})</span>}
                          </div>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono mt-1">
                          Created {new Date(a.createdAt).toLocaleDateString()} by {a.createdBy}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleToggle(a.id, a.isActive)}
                          className="text-xs h-7"
                        >
                          {a.isActive ? 'Pause' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(a.id)}
                          className="size-7 text-muted-foreground hover:text-destructive"
                          title="Delete Broadcast"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
