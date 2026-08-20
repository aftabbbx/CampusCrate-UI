import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  User, LogIn, UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AuthPage = () => {
  const location = useLocation();
  const initialTab = location.pathname === '/signup' ? 'signup' : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();

  // ─── Login State ────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [suspendedMsg, setSuspendedMsg] = useState('');

  // ─── Signup State ───────────────────────────────────────────────────
  const [signupForm, setSignupForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const { login, signup } = useAuth();

  // ─── Refs for slide animation & dynamic height ────────────────────
  const formInnerRef = useRef(null);
  const titleRef = useRef(null);
  const loginFormRef = useRef(null);
  const signupFormRef = useRef(null);
  const [formHeight, setFormHeight] = useState('auto');

  // Update dynamic height
  useEffect(() => {
    // Small timeout to allow DOM to render errors/state before measuring
    const timer = setTimeout(() => {
      if (activeTab === 'login' && loginFormRef.current) {
        setFormHeight(`${loginFormRef.current.offsetHeight}px`);
      } else if (activeTab === 'signup' && signupFormRef.current) {
        setFormHeight(`${signupFormRef.current.offsetHeight}px`);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeTab, suspendedMsg, signupForm.password, signupForm.confirmPassword]);

  // Update URL without full navigation
  useEffect(() => {
    const targetPath = activeTab === 'signup' ? '/signup' : '/login';
    if (location.pathname !== targetPath) {
      window.history.replaceState(null, '', targetPath);
    }
  }, [activeTab, location.pathname]);

  // ─── Tab Switching ──────────────────────────────────────────────────
  const switchTab = (tab) => {
    setActiveTab(tab);
    setSuspendedMsg('');
  };

  // ─── Login Submit ───────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setSuspendedMsg('');
    if (!loginEmail || !loginPassword) { toast.error('Email aur password required hain'); return; }
    setLoginLoading(true);
    try {
      const data = await login(loginEmail, loginPassword);
      if (data.success) { toast.success('Login successful! 🎉'); navigate('/dashboard'); }
      else toast.error(data.message || 'Login failed');
    } catch (err) {
      const res = err.response?.data;
      if (res?.suspended) {
        setSuspendedMsg(res.message);
      } else {
        toast.error(res?.message || 'Something went wrong');
      }
    }
    finally { setLoginLoading(false); }
  };

  // ─── Signup Helpers ─────────────────────────────────────────────────
  const setField = (e) => setSignupForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.password) { toast.error('All fields are required'); return; }
    if (signupForm.password.length < 6) { toast.error('Password must be 6+ characters'); return; }
    if (signupForm.password !== signupForm.confirmPassword) { toast.error("Passwords don't match"); return; }
    setSignupLoading(true);
    try {
      const { confirmPassword, ...d } = signupForm;
      const res = await signup(d);
      if (res.success) { toast.success('OTP sent! ✉️'); navigate('/verify-otp', { state: { email: signupForm.email } }); }
      else toast.error(res.message || 'Failed');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSignupLoading(false); }
  };

  // Password strength
  const pw = signupForm.password;
  const str = pw.length >= 8 ? 'strong' : pw.length >= 6 ? 'good' : 'weak';
  const strColor = { strong: 'var(--color-success)', good: 'var(--color-warning)', weak: 'var(--color-danger)' }[str];
  const strW = { strong: '100%', good: '66%', weak: '33%' }[str];
  const mismatch = signupForm.confirmPassword.length > 0 && signupForm.password !== signupForm.confirmPassword;

  return (
    <div className="auth-bg">
      {/* Floating decorative elements */}
      <div className="auth-floating-orb auth-orb-1" />
      <div className="auth-floating-orb auth-orb-2" />
      <div className="auth-floating-orb auth-orb-3" />

      <div className="auth-page-wrapper">
        {/* ─── Branding ────────────────────────────────────────────── */}
        <div className="anim-up" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <img
            src="/campuscrate-logo.png"
            alt="CampusCrate"
            style={{ width: '64px', height: '64px', marginBottom: '0.75rem', borderRadius: '16px' }}
          />
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)',
            color: 'var(--color-text)',
            background: 'linear-gradient(135deg, var(--color-text), var(--color-brand))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            CampusCrate
          </h1>
          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Your campus marketplace & community
          </p>
        </div>

        {/* ─── Auth Card ───────────────────────────────────────────── */}
        <div className="auth-card anim-up" style={{ animationDelay: '0.08s' }}>
          {/* ─── Title Row ───────────────────────────────────────── */}
          <div className="auth-title-row" ref={titleRef}>
            <div className="auth-title-inner" style={{
              transform: activeTab === 'signup' ? 'translateX(-50%)' : 'translateX(0)',
            }}>
              <div className="auth-title-item">Login Form</div>
              <div className="auth-title-item">Signup Form</div>
            </div>
          </div>

          {/* ─── Slide Tabs ──────────────────────────────────────── */}
          <div className="auth-slide-controls">
            <div
              className="auth-slider-tab"
              style={{ left: activeTab === 'signup' ? '50%' : '0' }}
            />
            <button
              type="button"
              className={`auth-slide-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
            >
              <LogIn style={{ width: '15px', height: '15px' }} />
              Login
            </button>
            <button
              type="button"
              className={`auth-slide-btn ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => switchTab('signup')}
            >
              <UserPlus style={{ width: '15px', height: '15px' }} />
              Signup
            </button>
          </div>

          {/* ─── Forms Container ─────────────────────────────────── */}
          <div className="auth-forms-container" style={{ height: formHeight, transition: 'height 0.4s ease' }}>
            <div
              className="auth-forms-inner"
              ref={formInnerRef}
              style={{ transform: activeTab === 'signup' ? 'translateX(-50%)' : 'translateX(0)' }}
            >
              {/* ═══ LOGIN FORM ═══ */}
              <form className="auth-form" onSubmit={handleLogin} ref={loginFormRef}>
                {/* Suspended Alert */}
                {suspendedMsg && (
                  <div style={{
                    background: 'var(--color-danger-pale)', border: '1px solid #fecaca', borderRadius: '0.75rem',
                    padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                  }}>
                    <span style={{ fontSize: '1rem' }}>🚫</span>
                    <p style={{ color: 'var(--color-danger)', fontSize: '0.8125rem', lineHeight: 1.5, margin: 0 }}>{suspendedMsg}</p>
                  </div>
                )}

                {/* Email */}
                <div className="auth-field">
                  <label htmlFor="login-email" className="form-label">Email Address</label>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <Mail className="form-icon" />
                    <input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@college.edu"
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
                      type={showLoginPw ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="form-input form-input-pad-right"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw(!showLoginPw)}
                      className="auth-pw-toggle"
                    >
                      {showLoginPw ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div style={{ textAlign: 'right', marginTop: '-0.25rem', marginBottom: '0.5rem' }}>
                  <a href="#" style={{ fontSize: '0.8rem', color: 'var(--color-brand)', fontWeight: 500 }}>
                    Forgot password?
                  </a>
                </div>

                {/* Submit */}
                <button id="login-submit" type="submit" disabled={loginLoading} className="auth-submit-btn">
                  <div className="auth-btn-layer" />
                  <span className="auth-btn-text">
                    {loginLoading ? <div className="spinner" /> : <>Sign In <ArrowRight style={{ width: '16px', height: '16px' }} /></>}
                  </span>
                </button>

                {/* Signup Link */}
                <p className="auth-switch-text">
                  Not a member?{' '}
                  <button type="button" onClick={() => switchTab('signup')} className="auth-switch-link">
                    Signup now
                  </button>
                </p>
              </form>

              {/* ═══ SIGNUP FORM ═══ */}
              <form className="auth-form" onSubmit={handleSignup} autoComplete="off" ref={signupFormRef}>
                {/* Name */}
                <div className="auth-field">
                  <label className="form-label">Full Name</label>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <User className="form-icon" />
                    <input name="name" value={signupForm.name} onChange={setField} placeholder="Your full name" className="form-input" autoComplete="off" required />
                  </div>
                </div>

                {/* Email */}
                <div className="auth-field">
                  <label className="form-label">Email Address</label>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <Mail className="form-icon" />
                    <input name="email" type="email" value={signupForm.email} onChange={setField} placeholder="you@college.edu" className="form-input" autoComplete="off" required />
                  </div>
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label className="form-label">Password</label>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <Lock className="form-icon" />
                    <input name="password" type={showSignupPw ? 'text' : 'password'} value={signupForm.password} onChange={setField} placeholder="Min 6 characters" className="form-input form-input-pad-right" autoComplete="new-password" required />
                    <button type="button" onClick={() => setShowSignupPw(!showSignupPw)} className="auth-pw-toggle">
                      {showSignupPw ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                    </button>
                  </div>
                  {pw && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <div style={{ flex: 1, height: '3px', borderRadius: '3px', background: 'var(--color-border)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: strW, background: strColor, borderRadius: '3px', transition: 'all 0.4s' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: strColor, textTransform: 'capitalize' }}>{str}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="auth-field">
                  <label className="form-label">Confirm Password</label>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <Lock className="form-icon" />
                    <input name="confirmPassword" type="password" value={signupForm.confirmPassword} onChange={setField} placeholder="Re-enter password" className="form-input" autoComplete="new-password" required />
                  </div>
                </div>
                {mismatch && (
                  <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem', marginTop: '-0.5rem' }}>Passwords don't match</p>
                )}

                {/* Submit */}
                <button type="submit" disabled={signupLoading} className="auth-submit-btn">
                  <div className="auth-btn-layer" />
                  <span className="auth-btn-text">
                    {signupLoading ? <div className="spinner" /> : <>Create Account <ArrowRight style={{ width: '16px', height: '16px' }} /></>}
                  </span>
                </button>

                {/* Login Link */}
                <p className="auth-switch-text">
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchTab('login')} className="auth-switch-link">
                    Login
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* ─── Footer ──────────────────────────────────────────────── */}
        <div className="anim-fade" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginTop: '1.5rem', animationDelay: '0.16s' }}>
          <img src="/campuscrate-logo.png" alt="" style={{ width: '14px', height: '14px' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>CampusCrate</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
