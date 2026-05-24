import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import AuthPage from './pages/auth/AuthPage';
import VerifyOTP from './pages/auth/VerifyOTP';
import Dashboard from './pages/Dashboard';
import ExploreResources from './pages/resources/ExploreResources';
import AddResource from './pages/resources/AddResource';
import ResourceDetail from './pages/resources/ResourceDetail';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)', flexDirection: 'column', gap: '0.75rem',
      }}>
        <div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)' }} />
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Loading CampusCrate...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/verify-otp" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <VerifyOTP />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />

      {/* Public Profile (no auth needed) */}
      <Route path="/profile/:rollNumber" element={<PublicProfile />} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute><ExploreResources /></ProtectedRoute>} />
      <Route path="/add-resource" element={<ProtectedRoute><AddResource /></ProtectedRoute>} />
      <Route path="/resource/:id" element={<ProtectedRoute><ResourceDetail /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Redirects */}
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
