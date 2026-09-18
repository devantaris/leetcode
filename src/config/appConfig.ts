// GrindOS — Centralized App Configuration
// Single source of truth for all branding, naming, and product constants.

export const APP_CONFIG = {
  // Brand Identity
  name: 'GrindOS',
  tagline: 'The operating system for interview prep.',
  shortName: 'GO',
  description: 'A structured DSA interview prep system with spaced repetition, streak tracking, and a 20-week phased curriculum.',

  // Favicon config (used in index.html SVG)
  favicon: {
    text: 'GO',
    bg: '#0a0a0f',
    color: '#ff4444',
  },

  // Track naming (avoids "LeetCode" trademark)
  tracks: {
    primary: 'Interview 150 Essentials',
    full: 'Full Curriculum',
  },

  // Smart defaults
  defaults: {
    targetDateOffsetDays: 140, // days from start date
    dailyProblems: 3,
    restDay: 'sunday' as const,
    secondarySkill: 'project' as const,
    defaultTagline: 'Interview Prep',
  },

  // Export config
  exports: {
    filenamePrefix: 'grindos_backup',
    fileExtension: '.json',
  },

  // External links
  links: {
    github: 'https://github.com/devantaris/leetcode',
    landing: '/',
    app: '/dashboard',
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
