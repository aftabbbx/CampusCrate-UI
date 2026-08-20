import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, RotateCw, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  // Redirect immediately if no email — before any hooks that depend on it
  if (!email) {
    return <RedirectToSignup />;
  }

  return <OTPForm email={email} />;
};

// Tiny redirect component — avoids conditional hooks
const RedirectToSignup = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/signup', { replace: true }); }, [navigate]);
  return null;
};

const OTPForm = ({ email }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const refs = useRef([]);
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  const canResend = countdown === 0;

  // Countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown > 0]); // only re-run when transitioning between >0 and 0

  // Autofocus
  useEffect(() => { refs.current[0]?.focus(); }, []);

  const change = useCallback((i, v) => {
    if (!/^\d*$/.test(v)) return;
    setOtp((prev) => {
      const next = [...prev];
      next[i] = v.slice(-1);
      return next;
    });
    if (v && i < 5) refs.current[i + 1]?.focus();
  }, []);

  const keyDown = useCallback((i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  }, [otp]);

  const paste = useCallback((e) => {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (p.length === 6) { setOtp(p.split('')); refs.current[5]?.focus(); }
  }, []);

  const resetOtp = () => { setOtp(['','','','','','']); refs.current[0]?.focus(); };

  const submit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter complete 6-digit OTP'); return; }
    setIsLoading(true);
    try {
      const d = await verifyOTP(email, code);
      if (d.success) { toast.success('Verified! Welcome 🎉'); navigate('/dashboard', { replace: true }); }
      else { toast.error(d.message || 'Invalid OTP'); resetOtp(); }
    } catch (err) { toast.error(err.response?.data?.message || 'Verification failed'); resetOtp(); }
    finally { setIsLoading(false); }
  };

  const resend = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    try {
      const d = await resendOTP(email);
      if (d.success) {
        toast.success('New OTP sent! ✉️');
        setCountdown(30);
        resetOtp();
      } else {
        toast.error(d.message || 'Failed to resend OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  const allFilled = otp.every((d) => d !== '');

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

        {/* ─── OTP Card ────────────────────────────────────────────── */}
        <div className="auth-card anim-up" style={{ animationDelay: '0.08s', textAlign: 'center', padding: '2rem 1.75rem' }}>
          {/* Back link */}
          <Link to="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            color: 'var(--color-text-sub)', fontSize: '0.8rem', textDecoration: 'none',
            marginBottom: '1.25rem', float: 'left',
          }}>
            <ArrowLeft style={{ width: '15px', height: '15px' }} /> Back
          </Link>

          <div style={{ clear: 'both' }} />

          {/* Shield icon */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
            background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-hover))',
            boxShadow: '0 8px 24px rgba(33,94,97,0.25)',
          }}>
            <ShieldCheck style={{ width: '28px', height: '28px', color: 'white' }} />
          </div>

          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Verify your email
          </h2>
          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', marginTop: '0.375rem' }}>
            Enter the 6-digit code sent to
          </p>
          <p style={{ color: 'var(--color-brand)', fontWeight: 600, fontSize: '0.85rem', marginTop: '0.125rem' }}>{email}</p>

          <form onSubmit={submit}>
            <div onPaste={paste} style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: '1.75rem 0' }}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => change(i, e.target.value)}
                  onKeyDown={(e) => keyDown(i, e)}
                  className="otp-input"
                />
              ))}
            </div>

            {/* Verify Button — same style as auth submit */}
            <button type="submit" disabled={isLoading || !allFilled} className="auth-submit-btn">
              <div className="auth-btn-layer" />
              <span className="auth-btn-text">
                {isLoading ? <div className="spinner" /> : <><ShieldCheck style={{ width: '16px', height: '16px' }} /> Verify Email</>}
              </span>
            </button>
          </form>

          {/* Resend OTP section */}
          <div style={{ marginTop: '1.5rem' }}>
            {canResend ? (
              <button
                onClick={resend}
                disabled={isResending}
                style={{
                  background: 'none', border: 'none', color: 'var(--color-brand)',
                  fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  fontFamily: 'var(--font-body)', opacity: isResending ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <RotateCw style={{
                  width: '14px', height: '14px',
                  animation: isResending ? 'spin 0.6s linear infinite' : 'none',
                }} />
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--color-brand-pale)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-brand)',
                  fontFamily: 'var(--font-display)',
                }}>
                  {countdown}
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  seconds to resend
                </p>
              </div>
            )}
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

export default VerifyOTP;
