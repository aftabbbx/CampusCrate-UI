import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


// Pages
import AuthPage from './pages/auth/AuthPage';
import VerifyOTP from './pages/auth/VerifyOTP';
import Dashboard from './pages/Dashboard';
import Homepage from './pages/Homepage';
import ExploreResources from './pages/resources/ExploreResources';
import AddResource from './pages/resources/AddResource';
import ResourceDetail from './pages/resources/ResourceDetail';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Wishlist from './pages/Wishlist';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f9f9f9', flexDirection: 'column', gap: '0.75rem',
      }}>
        <div className="spinner" style={{ borderColor: '#d3ddd3', borderTopColor: '#47c163', width: 28, height: 28 }} />
        <p style={{ color: '#8a9a8a', fontSize: '0.85rem', fontFamily: 'Inter, system-ui, sans-serif' }}>Loading CampusCrate...</p>
      </div>
    );
  }

  return (
    <>

      <Routes>
      {/* Auth */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/verify-otp" element={isAuthenticated ? <Navigate to="/" replace /> : <VerifyOTP />} />

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
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

      {/* Homepage */}
      <Route path="/" element={isAuthenticated ? <ProtectedRoute><Homepage /></ProtectedRoute> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
