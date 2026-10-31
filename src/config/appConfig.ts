// Cadence — Centralized App Configuration
// Single source of truth for all branding, naming, and product constants.

export const APP_CONFIG = {
  // Brand Identity
  name: 'Cadence',
  tagline: 'Rhythmic interview preparation.',
  shortName: 'CD',
  description: 'A minimal, distraction-free 140-day algorithmic preparation system for technical interviews.',

  // Favicon config (used in index.html SVG)
  favicon: {
    text: 'CD',
    bg: '#000000',
    color: '#ffffff',
  },

  // Track naming
  tracks: {
    primary: 'Interview 150',
    full: '20-Week Curriculum',
  },

  // Smart defaults
  defaults: {
    targetDateOffsetDays: 140,
    dailyProblems: 3,
    restDay: 'sunday' as const,
    secondarySkill: 'project' as const,
    defaultTagline: 'Software Engineer',
  },

  // Export config
  exports: {
    filenamePrefix: 'cadence_backup',
    fileExtension: '.json',
  },

  // External links
  links: {
    github: 'https://github.com/devantaris/leetcode',
    landing: '/dashboard',
    app: '/dashboard',
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
