// Cadence — Centralized App Configuration
// Single source of truth for all branding, naming, and product constants.

export const APP_CONFIG = {
  // Brand Identity
  name: 'GrindOS',
  tagline: '140-Day Algorithmic Placement Operating System (332 Curated Problems)',
  shortName: 'G//',
  description: 'A structured 140-day, 332-problem algorithmic placement operating system with Top 150 benchmark tracking.',

  // Favicon config (used in index.html SVG)
  favicon: {
    text: 'G//',
    bg: '#020403',
    color: '#3ddc84',
  },

  // Track naming
  tracks: {
    primary: 'Top 150 Benchmark Track',
    full: '140-Day Master Curriculum (332 Problems)',
  },

  // Smart defaults
  defaults: {
    userName: 'Operator',
    targetDateOffsetDays: 140,
    dailyProblems: 3,
    restDay: 'sunday' as const,
    secondarySkill: 'project' as const,
    defaultTagline: 'Software Engineer',
  },

  // Export config
  exports: {
    filenamePrefix: 'grindos_backup',
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
