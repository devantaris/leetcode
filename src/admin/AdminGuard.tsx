import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { AdminService } from './services/adminService';
import { Shield, Lock, ArrowLeft, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export const AdminGuard: React.FC = () => {
  const { authUser, signInWithOAuth, login, logout } = useProgress();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!authUser) {
        if (isMounted) setIsAdmin(false);
        return;
      }

      const result = await AdminService.checkIsAdmin(authUser);
      if (isMounted) setIsAdmin(result);
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [authUser]);

  // While verifying initial auth state
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-6 text-primary animate-spin" />
      </div>
    );
  }

  // Case 1: Unauthenticated -> Dedicated Ops Access Screen
  if (!authUser) {
    const handleGoogle = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await signInWithOAuth('google');
        if (res?.error) setError(res.error);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) return;
      setLoading(true);
      setError(null);
      const res = await login(email.trim(), password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Authentication failed');
      }
    };

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Shield className="size-6" />
            </div>
            <h1 className="text-xl font-bold font-serif tracking-tight">GrindOS Operations Gateway</h1>
            <p className="text-xs text-muted-foreground">
              Sign in with your authorized administrator account to access the stealth operations dashboard.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs">
              {error}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-11 text-xs font-semibold flex items-center justify-center gap-2.5 border-border hover:bg-muted"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-border flex-1" />
            <span className="text-[10px] uppercase font-mono text-muted-foreground">or email</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="admin@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs h-9"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-xs h-9"
              required
            />
            <Button type="submit" size="sm" disabled={loading} className="w-full text-xs h-9 font-semibold">
              {loading ? 'Authenticating...' : 'Sign In to Ops Console'}
            </Button>
          </form>

          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground pt-1 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Candidate Mission</span>
          </Link>
        </div>
      </div>
    );
  }

  // Case 2: Authenticated but not authorized
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl border border-destructive/30 bg-card text-card-foreground shadow-2xl flex flex-col items-center text-center gap-4">
          <div className="size-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
            <Lock className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif tracking-tight">Access Restricted</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Signed in as <span className="font-mono text-foreground font-semibold">{authUser.email}</span>.
              This account does not have operator privileges.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                toast.success('Signed out.');
              }}
              className="flex-1 text-xs h-9 gap-1.5"
            >
              <LogOut className="size-3.5" />
              <span>Switch Account</span>
            </Button>
            <Button asChild size="sm" className="flex-1 text-xs h-9">
              <Link to="/dashboard">Back to App</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Authenticated and Authorized
  return <Outlet />;
};
