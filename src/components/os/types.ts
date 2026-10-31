export type AppId = 
  | 'missions'
  | 'syllabus'
  | 'stats'
  | 'oracle'
  | 'pomo'
  | 'review'
  | 'cohort'
  | 'pipeline'
  | 'log'
  | 'config'
  | 'readme'
  | 'setup'
  | 'auth';

export interface WindowState {
  id: AppId;
  title: string;
  glyph: string;
  isOpen: boolean;
  isFocused: boolean;
  x: number;
  y: number;
  w: number;
  h?: number;
  zIndex: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'ok' | 'warn' | 'dim';
}
