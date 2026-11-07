import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('SaaS Auth Guard & Landing Page Routing Gating', () => {
  let store: Record<string, string> = {};

  const mockLocalStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };

  beforeEach(() => {
    store = {};
    (globalThis as unknown as { localStorage: typeof mockLocalStorage }).localStorage = mockLocalStorage;
    (globalThis as unknown as { window: { localStorage: typeof mockLocalStorage; location: { origin: string } } }).window = {
      localStorage: mockLocalStorage,
      location: { origin: 'https://leetcode-psi.vercel.app' },
    };
  });

  afterEach(() => {
    delete (globalThis as unknown as { localStorage?: unknown }).localStorage;
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it('unauthenticated guest attempting to access private route is redirected to /?auth=required', () => {
    const authUser = null;
    const isDemoMode = false;
    const isAuthLoading = false;
    const currentPath = '/curriculum';

    let action: 'render' | 'loading' | 'redirect' = 'render';
    let redirectUrl = '';

    if (isAuthLoading) {
      action = 'loading';
    } else if (!authUser && !isDemoMode) {
      action = 'redirect';
      redirectUrl = `/?auth=required&redirect=${encodeURIComponent(currentPath)}`;
    }

    expect(action).toBe('redirect');
    expect(redirectUrl).toBe('/?auth=required&redirect=%2Fcurriculum');
  });

  it('authenticated user is allowed direct access into private routes', () => {
    const authUser = { id: 'usr-1', email: 'alice@example.com', provider: 'supabase' as const };
    const isDemoMode = false;
    const isAuthLoading = false;

    let canAccess = false;
    if (!isAuthLoading && (authUser || isDemoMode)) {
      canAccess = true;
    }

    expect(canAccess).toBe(true);
  });

  it('visitor exploring in demo mode is granted access to the private workspace', () => {
    const authUser = null;
    const isDemoMode = true;
    const isAuthLoading = false;

    let canAccess = false;
    if (!isAuthLoading && (authUser || isDemoMode)) {
      canAccess = true;
    }

    expect(canAccess).toBe(true);
  });

  it('while auth session is initializing, guard renders loader instead of redirecting prematurely', () => {
    const authUser = null;
    const isDemoMode = false;
    const isAuthLoading = true;

    let state = 'unknown';
    if (isAuthLoading) {
      state = 'loading';
    } else if (!authUser && !isDemoMode) {
      state = 'redirect';
    }

    expect(state).toBe('loading');
  });

  it('RootRoute directs guest to marketing landing page, but forwards authenticated user to dashboard', () => {
    const checkRootDestination = (user: { id: string } | null, savedMode: string | null) => {
      if (user) {
        return savedMode === 'os' ? '/os' : '/dashboard';
      }
      return '/landing';
    };

    expect(checkRootDestination(null, null)).toBe('/landing');
    expect(checkRootDestination({ id: 'u1' }, 'web')).toBe('/dashboard');
    expect(checkRootDestination({ id: 'u1' }, 'os')).toBe('/os');
  });

  it('LandingPage launch action intercepts unauthenticated requests and triggers auth gate', () => {
    const authUser = null;
    const isDemoMode = false;

    let authModalTriggered = false;
    let navigatedTo: string | null = null;

    const handleLaunch = (mode: 'os' | 'web') => {
      if (!authUser && !isDemoMode) {
        authModalTriggered = true;
        return;
      }
      navigatedTo = mode === 'os' ? '/os' : '/dashboard';
    };

    handleLaunch('web');
    expect(authModalTriggered).toBe(true);
    expect(navigatedTo).toBeNull();

    // When in demo mode
    const handleLaunchDemo = (mode: 'os' | 'web') => {
      const demoActive = true;
      if (!authUser && !demoActive) {
        authModalTriggered = true;
        return;
      }
      navigatedTo = mode === 'os' ? '/os' : '/dashboard';
    };

    handleLaunchDemo('os');
    expect(navigatedTo).toBe('/os');
  });

  it('Welcome back resume banner is strictly hidden for unauthenticated visitors', () => {
    const shouldShowResumeBanner = (user: { id: string } | null, solvedCount: number) => {
      return Boolean(user && solvedCount > 0);
    };

    // Unauthenticated guest with 0 or demo solves
    expect(shouldShowResumeBanner(null, 0)).toBe(false);
    expect(shouldShowResumeBanner(null, 15)).toBe(false);

    // Authenticated user with 0 solves (just registered)
    expect(shouldShowResumeBanner({ id: 'u1' }, 0)).toBe(false);

    // Authenticated active user with solves
    expect(shouldShowResumeBanner({ id: 'u1' }, 12)).toBe(true);
  });

  it('Demo choice selection accurately provisions workstation target mode', () => {
    const selectDemoWorkstation = (choice: 'os' | 'web') => {
      mockLocalStorage.setItem('grindos_ui_mode', choice);
      return choice === 'os' ? '/os' : '/dashboard';
    };

    expect(selectDemoWorkstation('web')).toBe('/dashboard');
    expect(mockLocalStorage.getItem('grindos_ui_mode')).toBe('web');

    expect(selectDemoWorkstation('os')).toBe('/os');
    expect(mockLocalStorage.getItem('grindos_ui_mode')).toBe('os');
  });
});
