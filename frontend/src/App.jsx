import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppLayout } from './components/AppLayout';

// Auth pages
import { Login }    from './pages/Login';
import { Register } from './pages/Register';

// App pages
import { Dashboard }      from './pages/Dashboard';
import { Scanner }        from './pages/Scanner';
import { ReportAnalyzer } from './pages/ReportAnalyzer';
import { History }        from './pages/History';
import { ScanDetail }     from './pages/ScanDetail';
import { Profile }        from './pages/Profile';

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
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth — no sidebar */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected — with sidebar */}
            <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/scanner"         element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
            <Route path="/report-analyzer" element={<ProtectedRoute><ReportAnalyzer /></ProtectedRoute>} />
            <Route path="/history"         element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/scan/:id"        element={<ProtectedRoute><ScanDetail /></ProtectedRoute>} />
            <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Default */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
