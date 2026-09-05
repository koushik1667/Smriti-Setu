import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppLayout } from './components/AppLayout';
import { api } from './services/api';

// Auth pages
import { Login }    from './pages/Login';
import { Register } from './pages/Register';

// App pages
import { Dashboard }      from './pages/Dashboard';
import { Scanner }        from './pages/Scanner';
import { ReportAnalyzer } from './pages/ReportAnalyzer';
import { Cabinet }        from './pages/Cabinet';
import { History }        from './pages/History';
import { ScanDetail }     from './pages/ScanDetail';
import { Profile }        from './pages/Profile';
import { CognitiveGamePage }    from './pages/CognitiveGamePage';
import { MemoryAssistancePage } from './pages/MemoryAssistancePage';
import { CaregiverDashboard }  from './pages/CaregiverDashboard';
import { PrivacyPolicy }  from './pages/PrivacyPolicy';
import { TermsOfService }  from './pages/TermsOfService';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '0.875rem' }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
};

export function App() {
  // Silent Render backend warm-up & keep-alive ping
  useEffect(() => {
    // 1. Initial warm-up ping on mount
    api.warmUpBackend();

    // 2. Periodic keep-alive ping every 8 minutes while user has tab open
    const interval = setInterval(() => {
      api.warmUpBackend();
    }, 8 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>

            {/* Auth — no sidebar */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public Legal Policies */}
            <Route path="/privacy" element={<AppLayout><PrivacyPolicy /></AppLayout>} />
            <Route path="/terms"   element={<AppLayout><TermsOfService /></AppLayout>} />

            {/* Protected — with sidebar */}
            <Route path="/dashboard"            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/cognitive-game"       element={<ProtectedRoute><CognitiveGamePage /></ProtectedRoute>} />
            <Route path="/memory-assistance"    element={<ProtectedRoute><MemoryAssistancePage /></ProtectedRoute>} />
            <Route path="/caregiver-dashboard"  element={<ProtectedRoute><CaregiverDashboard /></ProtectedRoute>} />
            <Route path="/scanner"              element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
            <Route path="/report-analyzer"      element={<ProtectedRoute><ReportAnalyzer /></ProtectedRoute>} />
            <Route path="/cabinet"              element={<ProtectedRoute><Cabinet /></ProtectedRoute>} />
            <Route path="/history"              element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/scan/:id"             element={<ProtectedRoute><ScanDetail /></ProtectedRoute>} />
            <Route path="/profile"              element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Default */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
