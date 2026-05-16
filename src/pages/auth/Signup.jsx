import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, BookOpen,
  User, Phone, GraduationCap, AtSign,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', username: '', email: '', password: '', confirmPassword: '', phone_number: '', semester: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const set = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const next = () => {
    if (!form.name || !form.username) { toast.error('Name and Username are required'); return; }
    setStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Email and Password required'); return; }
    if (form.password.length < 6) { toast.error('Password must be 6+ characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords don\'t match'); return; }
    setIsLoading(true);
    try {
      const { confirmPassword, ...d } = form;
      const res = await signup(d);
      if (res.success) { toast.success('OTP sent! ✉️'); navigate('/verify-otp', { state: { email: form.email } }); }
      else toast.error(res.message || 'Failed');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setIsLoading(false); }
  };

  const pw = form.password;
  const str = pw.length >= 8 ? 'strong' : pw.length >= 6 ? 'good' : 'weak';
  const strColor = { strong: 'var(--color-success)', good: 'var(--color-warning)', weak: 'var(--color-danger)' }[str];
  const strW = { strong: '100%', good: '66%', weak: '33%' }[str];

  const mismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  return (
    <div className="auth-bg">
      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* ─── Branding ──────────────────────────────────────────── */}
        <div className="anim-up" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
            background: 'var(--color-brand)', boxShadow: '0 4px 12px rgba(79,70,229,0.2)',
          }}>
            <BookOpen style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.875rem', marginTop: '0.375rem' }}>
            {step === 1 ? 'Start with your personal details' : 'Set up your login credentials'}
          </p>
        </div>

        {/* ─── Step Indicator ─────────────────────────────────────── */}
        <div className="anim-up" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', animationDelay: '0.05s' }}>
          {[1, 2].map((s) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700,
                  background: step >= s ? 'var(--color-brand)' : 'var(--color-input)',
                  color: step >= s ? 'white' : 'var(--color-text-muted)',
                  transition: 'all 0.3s ease',
                }}>{s}</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: step >= s ? 'var(--color-brand)' : 'var(--color-text-muted)', transition: 'color 0.3s' }}>
                  {s === 1 ? 'Details' : 'Credentials'}
                </span>
              </div>
              <div style={{ height: '3px', borderRadius: '3px', background: step >= s ? 'var(--color-brand)' : 'var(--color-border)', transition: 'background 0.4s' }} />
            </div>
          ))}
        </div>

        {/* ─── Card ──────────────────────────────────────────────── */}
        <div className="card-lg anim-up" style={{ padding: '1.75rem', animationDelay: '0.1s' }}>
          <form onSubmit={submit}>
            {/* Step 1 */}
            {step === 1 && (
              <div className="anim-fade">
                {/* Name */}
                <div style={{ marginBottom: '0.875rem' }}>
                  <label className="form-label">Full Name *</label>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <User className="form-icon" />
                    <input name="name" value={form.name} onChange={set} placeholder="Saif Ali" className="form-input" />
                  </div>
                </div>

                {/* Username */}
                <div style={{ marginBottom: '0.875rem' }}>
                  <label className="form-label">Username *</label>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <AtSign className="form-icon" />
                    <input name="username" value={form.username} onChange={set} placeholder="saifali" className="form-input" />
                  </div>
                </div>

                {/* Phone */}
                <div style={{ marginBottom: '0.875rem' }}>
                  <label className="form-label">Phone Number</label>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <Phone className="form-icon" />
                    <input name="phone_number" value={form.phone_number} onChange={set} placeholder="9876543210" className="form-input" />
                  </div>
                </div>

                {/* Semester */}
                <div style={{ marginBottom: '0.875rem' }}>
                  <label className="form-label">Semester</label>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <GraduationCap className="form-icon" />
                    <select name="semester" value={form.semester} onChange={set} className="form-input" style={{ cursor: 'pointer', appearance: 'none' }}>
                      <option value="">Select semester</option>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={`Semester ${s}`}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>

                <button type="button" onClick={next} className="btn btn-brand" style={{ marginTop: '0.5rem' }}>
                  Continue <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="anim-right">
                {/* Email */}
                <div style={{ marginBottom: '0.875rem' }}>
                  <label className="form-label">Email Address *</label>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <Mail className="form-icon" />
                    <input name="email" type="email" value={form.email} onChange={set} placeholder="you@college.edu" className="form-input" />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: '0.875rem' }}>
                  <label className="form-label">Password *</label>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <Lock className="form-icon" />
                    <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={set} placeholder="Min 6 characters" className="form-input form-input-pad-right" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--color-text-muted)', display: 'flex' }}>
                      {showPw ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
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
                <div style={{ marginBottom: mismatch ? '0.25rem' : '0.875rem' }}>
                  <label className="form-label">Confirm Password *</label>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <Lock className="form-icon" />
                    <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={set} placeholder="Re-enter password" className="form-input" />
                  </div>
                </div>
                {mismatch && (
                  <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.875rem' }}>Passwords don't match</p>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setStep(1)} className="btn btn-ghost">
                    <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back
                  </button>
                  <button type="submit" disabled={isLoading} className="btn btn-brand" style={{ flex: 1 }}>
                    {isLoading ? <div className="spinner" /> : <>Create Account <ArrowRight style={{ width: '16px', height: '16px' }} /></>}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="anim-fade" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-sub)', animationDelay: '0.18s' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-brand)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
