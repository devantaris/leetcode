import React, { useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { Mail, Lock, User, LogIn, UserPlus, Cloud, Shield, RefreshCw } from 'lucide-react';
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
  const { login, signup, authUser, logout, cloudSyncStatus, lastCloudSync, triggerCloudSync, signInWithMagicLink } = useProgress();
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
          setSuccess('Account created! Your local solves have been synced to the cloud. 🚀');
          toast.success('Account created successfully!');
          setTimeout(onClose, 1500);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setError('Enter your email address above to receive a login link.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await signInWithMagicLink(email.trim());
    setLoading(false);
    if (res.success) {
      setSuccess('✨ Magic link sent! Check your email inbox to sign in instantly.');
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
    synced: 'Synced to Master Cloud',
    syncing: 'Syncing in progress…',
    offline: 'Local Cache / Offline',
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
            {authUser ? syncLabel : 'Save and synchronize your DSA progress across all devices.'}
          </DialogDescription>
        </DialogHeader>

        {authUser ? (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl border border-border/50 bg-muted/30 flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                {authUser.displayName.charAt(0).toUpperCase()}
              </div>
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
              <span>Automatic real-time sync is active for all solved missions.</span>
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
          <div className="flex flex-col gap-4">
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {tab === 'signup' && (
                <div className="relative">
                  <User className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Display Name (or Callsign)"
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
                <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs py-2 px-3">
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

              <div className="flex items-center gap-3 my-1">
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
              Guest mode works offline — your progress is safely cached until you sign in.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
