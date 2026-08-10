import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Lazy-loaded pages — each gets its own JS chunk
const AuthPage        = lazy(() => import('./pages/auth/AuthPage'));
const VerifyOTP       = lazy(() => import('./pages/auth/VerifyOTP'));
const Homepage        = lazy(() => import('./pages/Homepage'));
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const ExploreResources = lazy(() => import('./pages/resources/ExploreResources'));
const AddResource     = lazy(() => import('./pages/resources/AddResource'));
const ResourceDetail  = lazy(() => import('./pages/resources/ResourceDetail'));
const Messages        = lazy(() => import('./pages/Messages'));
const Notifications   = lazy(() => import('./pages/Notifications'));
const Profile         = lazy(() => import('./pages/Profile'));
const PublicProfile   = lazy(() => import('./pages/PublicProfile'));
const Wishlist        = lazy(() => import('./pages/Wishlist'));
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));

// Minimal fallback shown while a page chunk is loading
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F4F2F2', flexDirection: 'column', gap: '0.75rem',
    }}>
      <div className="spinner" style={{ borderColor: 'rgba(29,33,40,0.09)', borderTopColor: '#215E61', width: 28, height: 28 }} />
      <p style={{ color: '#8a9a8a', fontSize: '0.85rem', fontFamily: 'Inter, system-ui, sans-serif' }}>Loading...</p>
    </div>
  );
}

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth */}
        <Route path="/login"      element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/signup"     element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/verify-otp" element={isAuthenticated ? <Navigate to="/" replace /> : <VerifyOTP />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />

        {/* Public Profile (no auth needed) */}
        <Route path="/profile/:rollNumber" element={<PublicProfile />} />

        {/* Protected */}
        <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/resources"    element={<ProtectedRoute><ExploreResources /></ProtectedRoute>} />
        <Route path="/add-resource" element={<ProtectedRoute><AddResource /></ProtectedRoute>} />
        <Route path="/resource/:id" element={<ProtectedRoute><ResourceDetail /></ProtectedRoute>} />
        <Route path="/messages"     element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/wishlist"     element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

        {/* Homepage */}
        <Route path="/" element={isAuthenticated ? <ProtectedRoute><Homepage /></ProtectedRoute> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
