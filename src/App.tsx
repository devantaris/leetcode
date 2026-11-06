import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { GrindOSDesktop } from './components/os/GrindOSDesktop';
import { Layout } from './Layout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CurriculumPage } from './pages/CurriculumPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/ErrorBoundary';

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
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
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
