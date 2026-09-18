import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { Layout } from './Layout';

const LandingPage = React.lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CurriculumPage = React.lazy(() => import('./pages/CurriculumPage').then(m => ({ default: m.CurriculumPage })));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));

export default function App() {
  return (
    <BrowserRouter>
      <ProgressProvider>
        <Suspense fallback={<div className='flex items-center justify-center min-h-screen bg-[#060609] text-gray-400'>Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route element={<Layout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="curriculum" element={<CurriculumPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </Suspense>
      </ProgressProvider>
    </BrowserRouter>
  );
}
