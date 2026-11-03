import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { GrindOSDesktop } from './components/os/GrindOSDesktop';
import { Layout } from './Layout';
import { DashboardPage } from './pages/DashboardPage';
import { CurriculumPage } from './pages/CurriculumPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';

export default function App() {
  const [uiMode, setUiMode] = useState<'os' | 'web'>(() => {
    try {
      return (localStorage.getItem('grindos_ui_mode') as 'os' | 'web') || 'os';
    } catch {
      return 'os';
    }
  });

  const toggleUiMode = (mode?: 'os' | 'web') => {
    const next = mode || (uiMode === 'os' ? 'web' : 'os');
    setUiMode(next);
    try {
      localStorage.setItem('grindos_ui_mode', next);
    } catch {
      // ignore
    }
  };

  return (
    <BrowserRouter>
      <ProgressProvider>
        {uiMode === 'os' ? (
          <Routes>
            <Route path="/" element={<GrindOSDesktop onSwitchToWeb={() => toggleUiMode('web')} />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/curriculum" element={<Navigate to="/" replace />} />
            <Route path="/analytics" element={<Navigate to="/" replace />} />
            <Route path="/leaderboard" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Layout onSwitchToOS={() => toggleUiMode('os')} />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="curriculum" element={<CurriculumPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        )}
      </ProgressProvider>
    </BrowserRouter>
  );
}
