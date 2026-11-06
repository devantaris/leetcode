import React, { useState, useEffect } from 'react';
import { AdminService } from '../admin/services/adminService';
import type { SystemAnnouncement } from '../types';
import { X, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<SystemAnnouncement | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      const active = await AdminService.fetchPublicActiveAnnouncement();
      if (!isMounted || !active) return;

      const lastDismissedId = localStorage.getItem('grindos_dismissed_announcement');
      if (lastDismissedId === active.id) {
        return;
      }

      setAnnouncement(active);
      setDismissed(false);
    };

    check();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      localStorage.setItem('grindos_dismissed_announcement', announcement.id);
    }
    setDismissed(true);
  };

  if (dismissed || !announcement) return null;

  const isPricing = announcement.category === 'pricing';

  return (
    <div className={`w-full px-4 py-2 text-xs flex items-center justify-between gap-3 border-b transition-colors z-40 ${
      isPricing
        ? 'bg-primary/10 border-primary/30 text-foreground'
        : 'bg-muted/80 border-border text-foreground'
    }`}>
      <div className="flex items-center gap-2.5 truncate max-w-4xl mx-auto flex-1 justify-center">
        {isPricing ? (
          <Sparkles className="size-3.5 text-primary shrink-0" />
        ) : (
          <Tag className="size-3.5 text-muted-foreground shrink-0" />
        )}
        <span className="font-semibold text-foreground shrink-0">{announcement.title}:</span>
        <span className="text-muted-foreground truncate">{announcement.message}</span>

        {announcement.ctaLabel && (
          announcement.ctaUrl?.startsWith('http') ? (
            <a
              href={announcement.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-bold hover:underline shrink-0 inline-flex items-center gap-0.5"
            >
              <span>{announcement.ctaLabel}</span>
              <ArrowRight className="size-3" />
            </a>
          ) : (
            <Link
              to={announcement.ctaUrl || '/dashboard'}
              className="text-primary font-bold hover:underline shrink-0 inline-flex items-center gap-0.5"
            >
              <span>{announcement.ctaLabel}</span>
              <ArrowRight className="size-3" />
            </Link>
          )
        )}
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="p-1 rounded-md text-muted-foreground hover:text-foreground shrink-0"
        title="Dismiss notice"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
};
