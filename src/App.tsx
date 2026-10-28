// ============================================================
// TypeMaster — Root Application & Routing
// ============================================================
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { Navigation } from '@/components/Navigation';
import { ToastContainer } from '@/components/ToastContainer';
import { Footer } from '@/components/Footer';

// Pages
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CoursesPage } from '@/pages/CoursesPage';
import { LevelPage } from '@/pages/LevelPage';
import { LessonPage } from '@/pages/LessonPage';
import { TestPage } from '@/pages/TestPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { AchievementsPage } from '@/pages/AchievementsPage';
import { CertificatesPage } from '@/pages/CertificatesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminPage } from '@/pages/AdminPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ScrollToTop />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navigation />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Home & Dashboard */}
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Courses & Lessons */}
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:levelId" element={<LevelPage />} />
              <Route path="/courses/:levelId/:lessonId" element={<LessonPage />} />
              <Route path="/lesson/:lessonId" element={<LessonPage />} />

              {/* Typing Tests & Analytics */}
              <Route path="/test" element={<TestPage />} />
              <Route path="/reports" element={<ReportsPage />} />

              {/* Gamification & Credentials */}
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/certificates" element={<CertificatesPage />} />

              {/* Settings & Admin */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
