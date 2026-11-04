import { useContext } from 'react';
import { ProgressContext } from './ProgressContext';

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider');
  return ctx;
};
