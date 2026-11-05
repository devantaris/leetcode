import React, { useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { Mail, Lock, User, LogIn, UserPlus, Cloud, Shield, RefreshCw, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = 'login' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    login,
    signup,
    authUser,
    logout,
    cloudSyncStatus,
    lastCloudSync,
    triggerCloudSync,
    signInWithMagicLink,
    signInWithOAuth,
  } = useProgress();

  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await login(email.trim(), password);
        if (!res.success) {
          setError(res.error || 'Login failed. Check your email & password.');
        } else {
          setSuccess('Signed in! Your progress is now synced to the cloud. ☁️');
          toast.success('Welcome back!');
          setTimeout(onClose, 1200);
        }
      } else {
        if (!name.trim()) {
          setError('Display name is required.');
          setLoading(false);
          return;
        }
        const res = await signup(email.trim(), password, name.trim());
        if (!res.success) {
          setError(res.error || 'Sign up failed. Please try again.');
        } else {
          setSuccess('Account created! Your local progress is safely synced to the cloud. 🚀');
          toast.success('Account created successfully!');
          setTimeout(onClose, 1500);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await signInWithOAuth('google');
      if (res.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Google sign-in could not be initiated.');
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setError('Enter your email address above to receive a magic sign-in link.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await signInWithMagicLink(email.trim());
    setLoading(false);
    if (res.success) {
      setSuccess('✨ Magic sign-in link sent! Check your inbox to login instantly.');
      toast.success('Check your email inbox!');
    } else {
      setError(res.error || 'Failed to send magic link.');
    }
  };

  const handleManualSync = async () => {
    setLoading(true);
    const ok = await triggerCloudSync();
    setLoading(false);
    if (ok) {
      toast.success('Progress pushed to cloud! ☁️');
    } else {
      toast.error('Sync failed. Check your network connection.');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out.');
    onClose();
  };

  const syncLabel = {
    synced: 'Synced to Supabase Cloud',
    syncing: 'Syncing with Supabase…',
    offline: 'Local Storage / Offline',
    error: 'Cloud Sync Warning',
  }[cloudSyncStatus];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md p-6 gap-5">
        <DialogHeader className="gap-1.5 text-left">
          <div className="flex items-center gap-2 text-primary">
            <Cloud className="size-5" />
            <DialogTitle className="text-lg font-serif font-bold tracking-tight text-foreground">
              {authUser ? 'Your Account' : 'Account & Cloud Sync'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {authUser ? syncLabel : 'Sign in with Google or Email to synchronize your GrindOS progress across all your devices.'}
          </DialogDescription>
        </DialogHeader>

        {authUser ? (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl border border-border/50 bg-muted/30 flex items-center gap-3">
              {authUser.avatarUrl ? (
                <img
                  src={authUser.avatarUrl}
                  alt={authUser.displayName}
                  className="size-11 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="size-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base">
                  {authUser.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {authUser.displayName}
                </div>
                <div className="text-xs text-muted-foreground truncate font-mono">
                  {authUser.email}
                </div>
                {lastCloudSync && (
                  <div className="text-[10px] text-muted-foreground font-mono mt-1">
                    Last sync: {lastCloudSync.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-500">
              <Shield className="size-4 shrink-0" />
              <span>Real-time database persistence is active on every problem check.</span>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSync}
                disabled={loading}
                className="flex-1 text-xs h-9 gap-1.5"
              >
                <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Syncing...' : 'Sync Now'}</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="flex-1 text-xs h-9"
              >
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full text-xs h-10 font-medium flex items-center justify-center gap-2.5 border-border hover:bg-muted/80 shadow-xs transition-all"
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

            {/* Visual Divider */}
            <div className="flex items-center gap-3 my-0.5">
              <div className="h-px bg-border/60 flex-1" />
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">or with email</span>
              <div className="h-px bg-border/60 flex-1" />
            </div>

            {/* Tab Switcher */}
            <Tabs value={tab} onValueChange={(v) => { setTab(v as AuthTab); setError(null); setSuccess(null); }} className="w-full">
              <TabsList className="grid grid-cols-2 w-full h-9 bg-muted/60 p-1">
                <TabsTrigger value="login" className="text-xs font-semibold">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-xs font-semibold">
                  Create Account
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              {tab === 'signup' && (
                <div className="relative">
                  <User className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Your Name (e.g. Alex Chen)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 text-xs h-9.5"
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-xs h-9.5"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password (minimum 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 text-xs h-9.5"
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <Alert className="border-destructive/30 bg-destructive/10 text-destructive text-xs py-2 px-3">
                  <AlertDescription className="text-xs font-medium m-0">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs py-2 px-3 flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  <AlertDescription className="text-xs font-medium m-0">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-xs h-9.5 font-semibold mt-1"
              >
                {loading ? (
                  'Processing…'
                ) : tab === 'login' ? (
                  <><LogIn className="size-3.5 mr-1.5" /> Sign In</>
                ) : (
                  <><UserPlus className="size-3.5 mr-1.5" /> Create Free Account</>
                )}
              </Button>

              <div className="flex items-center gap-3 my-0.5">
                <div className="h-px bg-border/60 flex-1" />
                <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">or passwordless</span>
                <div className="h-px bg-border/60 flex-1" />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleMagicLink}
                disabled={loading}
                className="w-full text-xs h-9 text-muted-foreground hover:text-foreground"
              >
                <Mail className="size-3.5 mr-1.5" /> Send Magic Sign-In Link
              </Button>
            </form>

            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              Guest solves are safely preserved and automatically merged into your cloud account upon sign-in.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
