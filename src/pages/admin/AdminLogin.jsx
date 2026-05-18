import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../api/axios';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { 
      toast.error('Email aur password required hain'); 
      return; 
    }
    
    setIsLoading(true);
    try {
      const res = await API.post('/admin/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('campuscrate_admin_token', res.data.token);
        localStorage.setItem('campuscrate_admin', JSON.stringify(res.data.admin));
        toast.success('Admin Login successful! 🎉');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* ─── Branding ────────────────────────────────────────────── */}
        <div className="anim-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem',
            background: 'var(--color-brand)', boxShadow: '0 4px 12px rgba(79,70,229,0.2)',
          }}>
            <ShieldAlert style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            Admin Portal
          </h1>
          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.875rem', marginTop: '0.375rem' }}>
            Secure access for CampusCrate administrators
          </p>
        </div>

        {/* ─── Card ────────────────────────────────────────────────── */}
        <div className="card-lg anim-up" style={{ padding: '1.75rem', animationDelay: '0.08s' }}>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="login-email" className="form-label">Email</label>
              <div className="form-group" style={{ position: 'relative' }}>
                <Mail className="form-icon" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@campuscrate.com"
                  className="form-input"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="login-password" className="form-label">Password</label>
              <div className="form-group" style={{ position: 'relative' }}>
                <Lock className="form-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input form-input-pad-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                    color: 'var(--color-text-muted)', display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="btn btn-brand">
              {isLoading ? <div className="spinner" /> : <>Sign In <ArrowRight style={{ width: '16px', height: '16px' }} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
