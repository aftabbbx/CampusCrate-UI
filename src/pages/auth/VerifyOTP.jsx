import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, BookOpen, RotateCw, ArrowLeft } from 'lucide-react';
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
  const [countdown, setCountdown] = useState(60);
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
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); resetOtp(); }
    finally { setIsLoading(false); }
  };

  const resend = async () => {
    if (!canResend) return;
    setIsResending(true);
    try {
      const d = await resendOTP(email);
      if (d.success) { toast.success('New OTP sent! ✉️'); setCountdown(60); resetOtp(); }
      else toast.error(d.message || 'Failed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setIsResending(false); }
  };

  const allFilled = otp.every((d) => d !== '');

  return (
    <div className="auth-bg">
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Back */}
        <Link to="/signup" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          color: 'var(--color-text-sub)', fontSize: '0.85rem', marginBottom: '1.5rem', textDecoration: 'none',
        }}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back
        </Link>

        {/* Card */}
        <div className="card-lg" style={{ padding: '2.25rem 1.75rem', textAlign: 'center' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem',
            background: 'var(--color-brand)', boxShadow: '0 4px 12px rgba(79,70,229,0.2)',
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

            <button type="submit" disabled={isLoading || !allFilled} className="btn btn-brand">
              {isLoading ? <div className="spinner" /> : <><ShieldCheck style={{ width: '16px', height: '16px' }} /> Verify Email</>}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem' }}>
            {canResend ? (
              <button onClick={resend} disabled={isResending}
                style={{ background: 'none', border: 'none', color: 'var(--color-brand)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'var(--font-body)' }}>
                <RotateCw style={{ width: '14px', height: '14px', animation: isResending ? 'spin 0.6s linear infinite' : 'none' }} /> Resend OTP
              </button>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                Resend in <span style={{ color: 'var(--color-brand)', fontWeight: 600 }}>{countdown}s</span>
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginTop: '1.5rem' }}>
          <BookOpen style={{ width: '14px', height: '14px', color: 'var(--color-text-muted)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>CampusCrate</span>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
