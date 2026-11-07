import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { Layout } from './Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy-loaded route views for optimal bundle splitting without cyclic vendor chunks
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CurriculumPage = lazy(() => import('./pages/CurriculumPage').then(m => ({ default: m.CurriculumPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const TrackerPage = lazy(() => import('./pages/TrackerPage').then(m => ({ default: m.TrackerPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const GrindOSDesktop = lazy(() => import('./components/os/GrindOSDesktop').then(m => ({ default: m.GrindOSDesktop })));

// Stealth Admin Dashboard
const AdminGuard = lazy(() => import('./admin/AdminGuard').then(m => ({ default: m.AdminGuard })));
const AdminLayout = lazy(() => import('./admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminOverviewPage = lazy(() => import('./admin/pages/AdminOverviewPage').then(m => ({ default: m.AdminOverviewPage })));
const AdminBroadcastPage = lazy(() => import('./admin/pages/AdminBroadcastPage').then(m => ({ default: m.AdminBroadcastPage })));
const AdminUsersPage = lazy(() => import('./admin/pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminCohortsPage = lazy(() => import('./admin/pages/AdminCohortsPage').then(m => ({ default: m.AdminCohortsPage })));

function RouteLoadingFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#020403] text-emerald-400 font-mono text-xs">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
        <span className="tracking-widest uppercase text-muted-foreground animate-pulse">Initializing GrindOS...</span>
      </div>
    </div>
  );
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
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
      {/* Default to the modern Bento dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/landing" element={<LandingPage onSelectMode={handleSelectMode} />} />

      {/* Retro Terminal OS */}
      <Route
        path="/os"
        element={
          <GrindOSDesktop
            onSwitchToWeb={() => handleSelectMode('web')}
            onGoToHome={() => navigate('/')}
          />
        }
      />

      {/* Modern Minimalist Web App */}
      <Route
        element={
          <Layout
            onSwitchToOS={() => handleSelectMode('os')}
            onGoToHome={() => navigate('/')}
          />
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/curriculum" element={<CurriculumPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/tracker" element={<TrackerPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
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
    </Suspense>
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
