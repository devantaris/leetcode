import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { authUser, isDemoMode, isAuthLoading } = useProgress();
  const location = useLocation();

  // While checking initial Supabase session, render a sleek loader to prevent flash/redirect
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-mono">Initializing GrindOS session...</p>
      </div>
    );
  }

  // Allow access only if authenticated or exploring in guest demo mode
  if (!authUser && !isDemoMode) {
    const redirectUrl = `/?auth=required&redirect=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectUrl} replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
};
