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
      {/* Floating decorative elements */}
      <div className="auth-floating-orb auth-orb-1" />
      <div className="auth-floating-orb auth-orb-2" />
      <div className="auth-floating-orb auth-orb-3" />

      <div className="auth-page-wrapper">
        {/* ─── Branding ────────────────────────────────────────────── */}
        <div className="anim-up" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
            background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-light))',
            boxShadow: '0 8px 24px rgba(79,70,229,0.3)',
          }}>
            <ShieldAlert style={{ width: '26px', height: '26px', color: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)',
            color: 'var(--color-text)',
            background: 'linear-gradient(135deg, var(--color-text), var(--color-brand))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Admin Portal
          </h1>
          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Secure access for CampusCrate administrators
          </p>
        </div>

        {/* ─── Auth Card ───────────────────────────────────────────── */}
        <div className="auth-card anim-up" style={{ animationDelay: '0.08s' }}>
          <form className="auth-form" onSubmit={handleSubmit} style={{ width: '100%', padding: 0 }}>
            {/* Email */}
            <div className="auth-field">
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
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
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
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-pw-toggle"
                >
                  {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="auth-submit-btn" style={{ marginTop: '0.5rem' }}>
              <div className="auth-btn-layer" />
              <span className="auth-btn-text">
                {isLoading ? <div className="spinner" /> : <>Sign In <ArrowRight style={{ width: '16px', height: '16px' }} /></>}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
