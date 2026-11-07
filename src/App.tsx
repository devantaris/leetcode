import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import { GrindOSDesktop } from './components/os/GrindOSDesktop';
import { Layout } from './Layout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CurriculumPage } from './pages/CurriculumPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { TrackerPage } from './pages/TrackerPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthGuard } from './components/AuthGuard';
import { Loader2 } from 'lucide-react';

// Stealth Admin Dashboard
import { AdminGuard } from './admin/AdminGuard';
import { AdminLayout } from './admin/AdminLayout';
import { AdminOverviewPage } from './admin/pages/AdminOverviewPage';
import { AdminBroadcastPage } from './admin/pages/AdminBroadcastPage';
import { AdminUsersPage } from './admin/pages/AdminUsersPage';
import { AdminCohortsPage } from './admin/pages/AdminCohortsPage';

function RootRoute({ onSelectMode }: { onSelectMode: (mode: 'os' | 'web') => void }) {
  const { authUser, isAuthLoading } = useProgress();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-mono">Loading GrindOS...</p>
      </div>
    );
  }

  // If user is already authenticated, take them directly into their chosen workstation
  if (authUser) {
    const savedMode = localStorage.getItem('grindos_ui_mode');
    return <Navigate to={savedMode === 'os' ? '/os' : '/dashboard'} replace />;
  }

  // Unauthenticated guests see the marketing landing page
  return <LandingPage onSelectMode={onSelectMode} />;
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  // Track and synchronize os-mode class on body
  useEffect(() => {
    if (location.pathname.startsWith('/os')) {
      document.body.classList.add('os-mode');
    } else {
      document.body.classList.remove('os-mode');
    }
  }, [location.pathname]);

  const handleSelectMode = (mode: 'os' | 'web') => {
    try {
      localStorage.setItem('grindos_ui_mode', mode);
    } catch {
      // ignore
    }
    if (mode === 'os') {
      navigate('/os');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Routes>
      {/* Root Route: Landing page for guests, direct app entry for authenticated users */}
      <Route path="/" element={<RootRoute onSelectMode={handleSelectMode} />} />

      {/* Explicit Landing Route: Always viewable */}
      <Route path="/landing" element={<LandingPage onSelectMode={handleSelectMode} />} />

      {/* Shell with Public Legal/Policy Pages and Protected App Pages */}
      <Route
        element={
          <Layout
            onSwitchToOS={() => handleSelectMode('os')}
            onGoToHome={() => navigate('/')}
          />
        }
      >
        {/* Public Legal / Info Routes */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Protected SaaS App Routes (Gated by AuthGuard) */}
        <Route element={<AuthGuard />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/curriculum" element={<CurriculumPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
        </Route>
      </Route>

      {/* Protected Retro Terminal OS (Gated by AuthGuard) */}
      <Route element={<AuthGuard />}>
        <Route
          path="/os"
          element={
            <GrindOSDesktop
              onSwitchToWeb={() => handleSelectMode('web')}
              onGoToHome={() => navigate('/')}
            />
          }
        />
      </Route>

      {/* Stealth Ops Console (Guarded: renders 404 for unauthenticated / non-admin users) */}
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/_ops" element={<AdminOverviewPage />} />
          <Route path="/_ops/broadcasts" element={<AdminBroadcastPage />} />
          <Route path="/_ops/users" element={<AdminUsersPage />} />
          <Route path="/_ops/cohorts" element={<AdminCohortsPage />} />
          <Route path="/admin" element={<Navigate to="/_ops" replace />} />
        </Route>
      </Route>

      {/* Catch-all 404 page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ProgressProvider>
          <AppRoutes />
        </ProgressProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
