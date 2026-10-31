import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { GrindOSDesktop } from './components/os/GrindOSDesktop';

export default function App() {
  return (
    <BrowserRouter>
      <ProgressProvider>
        <Routes>
          <Route path="/" element={<GrindOSDesktop />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/curriculum" element={<Navigate to="/" replace />} />
          <Route path="/analytics" element={<Navigate to="/" replace />} />
          <Route path="/leaderboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProgressProvider>
    </BrowserRouter>
  );
}
