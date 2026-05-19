import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
  User, Mail, GraduationCap, Calendar, Shield, Star, Users,
  Package, Clock, ChevronRight, Hash, Layers, BookOpen,
  UserPlus, UserMinus, ArrowLeft,
} from 'lucide-react';

const CompletionRing = ({ percent }) => {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="completion-ring">
      <svg width="52" height="52" viewBox="0 0 48 48">
        <circle className="completion-ring-bg" cx="24" cy="24" r={r} />
        <circle className="completion-ring-fill" cx="24" cy="24" r={r}
          strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <span className="completion-ring-text">{percent}%</span>
    </div>
  );
};

const PublicProfile = () => {
  const { rollNumber } = useParams();
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentResources, setRecentResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchPublicProfile();
  }, [rollNumber]);

  const fetchPublicProfile = async () => {
    try {
      const res = await API.get(`/user/public/${rollNumber}`);
      if (res.data.success) {
        setProfile(res.data.user);
        setRecentResources(res.data.recentResources || []);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('User not found');
      } else if (err.response?.status === 403) {
        toast.error('This account has been suspended');
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow');
      navigate('/login');
      return;
    }
    setFollowLoading(true);
    try {
      const endpoint = following ? `/user/unfollow/${profile._id}` : `/user/follow/${profile._id}`;
      const res = await API.post(endpoint);
      if (res.data.success) {
        setFollowing(!following);
        setProfile(p => ({
          ...p,
          followers_count: following ? (p.followers_count - 1) : (p.followers_count + 1),
        }));
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setFollowLoading(false);
    }
  };

  const isActiveNow = (lastActive) => {
    if (!lastActive) return false;
    const diff = Date.now() - new Date(lastActive).getTime();
    return diff < 5 * 60 * 1000;
  };

  const isOwnProfile = authUser && profile && (authUser._id === profile._id || authUser.roll_number === profile.roll_number);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)', flexDirection: 'column', gap: '0.75rem',
      }}>
        <div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)' }} />
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)', flexDirection: 'column', gap: '1rem',
      }}>
        <User style={{ width: '48px', height: '48px', color: 'var(--color-border)' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>Profile Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>This user doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/')} className="btn btn-brand" style={{ width: 'auto', padding: '0.625rem 1.5rem' }}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Go Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Top Nav */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', height: '60px', background: 'var(--color-card)',
        borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)',
            display: 'flex', alignItems: 'center',
          }}>
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen style={{ width: '16px', height: '16px', color: 'white' }} />
            </div>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>CampusCrate</span>
          </div>
        </div>
        {isAuthenticated && (
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
            Dashboard
          </button>
        )}
      </header>

      <div style={{ padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        {/* ─── Profile Header ──────────────────────────────────────── */}
        <div className="profile-header-glass anim-up">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)',
                border: '3px solid var(--color-card)',
              }}>
                {profile.profile_image ? (
                  <img src={profile.profile_image} alt={profile.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>
                    {profile.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              {isActiveNow(profile.last_active) && (
                <div style={{
                  position: 'absolute', bottom: '2px', right: '2px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: '#10b981', border: '2px solid var(--color-card)',
                }} />
              )}
            </div>

            {/* Name + Badges */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                {profile.name}
              </h1>
              <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', marginBottom: '0.625rem' }}>
                <Hash style={{ width: '13px', height: '13px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                {profile.roll_number}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {profile.is_college_verified ? (
                  <span className="badge-verified">
                    <Shield style={{ width: '12px', height: '12px' }} /> Verified College Student
                  </span>
                ) : (
                  <span className="badge-unverified">
                    <Clock style={{ width: '12px', height: '12px' }} /> Pending Verification
                  </span>
                )}
                {isActiveNow(profile.last_active) && (
                  <span className="badge-active">
                    <span className="badge-active-dot" /> Active now
                  </span>
                )}
              </div>

              {/* Follow Button */}
              {!isOwnProfile && isAuthenticated && (
                <button onClick={handleFollow} disabled={followLoading} className="btn" style={{
                  padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '0.625rem',
                  background: following ? 'var(--color-input)' : 'var(--color-brand)',
                  color: following ? 'var(--color-text-sub)' : 'white',
                  border: following ? '1px solid var(--color-border)' : 'none',
                }}>
                  {followLoading ? <div className="spinner" style={{ width: '14px', height: '14px' }} /> : (
                    following
                      ? <><UserMinus style={{ width: '14px', height: '14px' }} /> Unfollow</>
                      : <><UserPlus style={{ width: '14px', height: '14px' }} /> Follow</>
                  )}
                </button>
              )}

              {isOwnProfile && (
                <button onClick={() => navigate('/profile')} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
                  Go to My Profile
                </button>
              )}
            </div>

            {/* Trust Score + Completion */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <CompletionRing percent={profile.profile_completion || 0} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                  <Star style={{ width: '12px', height: '12px', color: 'var(--color-accent)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{profile.trust_score}/100</span>
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Trust Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Stats ───────────────────────────────────────────────── */}
        <div className="anim-up" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem',
          margin: '1.25rem 0', animationDelay: '0.08s',
        }}>
          {[
            { label: 'Followers', value: profile.followers_count || 0 },
            { label: 'Following', value: profile.following_count || 0 },
            { label: 'Resources', value: profile.resources_count || 0 },
            { label: 'Trust', value: `${profile.trust_score || 50}%` },
          ].map((s, i) => (
            <div key={i} className="profile-stat">
              <div className="profile-stat-value">{s.value}</div>
              <div className="profile-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="profile-card anim-up" style={{ marginBottom: '1.25rem', animationDelay: '0.12s' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen style={{ width: '16px', height: '16px', color: 'var(--color-brand)' }} /> About
            </h3>
            <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', lineHeight: 1.7 }}>{profile.bio}</p>
          </div>
        )}

        {/* Info Cards */}
        <div className="anim-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', animationDelay: '0.16s' }}>
          <div className="profile-card">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.875rem' }}>Academic Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              <div className="info-row">
                <GraduationCap style={{ width: '15px', height: '15px', color: 'var(--color-brand)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-sub)' }}>{profile.course || 'Not set'}</span>
              </div>
              <div className="info-row">
                <Layers style={{ width: '15px', height: '15px', color: 'var(--color-brand)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-sub)' }}>Batch {profile.batch || 'not set'}</span>
              </div>
              <div className="info-row">
                <BookOpen style={{ width: '15px', height: '15px', color: 'var(--color-brand)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-sub)' }}>{profile.semester || 'Semester not set'}</span>
              </div>
            </div>
          </div>
          <div className="profile-card">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.875rem' }}>Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              <div className="info-row">
                <Mail style={{ width: '15px', height: '15px', color: 'var(--color-brand)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-sub)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.email}</span>
              </div>
              <div className="info-row">
                <Calendar style={{ width: '15px', height: '15px', color: 'var(--color-brand)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-sub)' }}>
                  Member since {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Resources */}
        <div className="card anim-up" style={{ animationDelay: '0.2s' }}>
          <div style={{ padding: '1.125rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>Resources</h3>
          </div>
          {recentResources.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              <Package style={{ width: '32px', height: '32px', color: 'var(--color-border)', margin: '0 auto 0.5rem' }} />
              <p>No resources posted yet.</p>
            </div>
          ) : (
            <div>
              {recentResources.map((r, i) => (
                <div key={r._id || i}
                  onClick={() => isAuthenticated ? navigate(`/resource/${r._id}`) : navigate('/login')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.875rem 1.25rem', cursor: 'pointer', transition: 'background 0.15s',
                    borderBottom: i < recentResources.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: 'var(--color-brand-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Package style={{ width: '16px', height: '16px', color: 'var(--color-brand)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text)' }}>{r.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        {r.category} · {r.price > 0 ? `₹${r.price}` : 'Free'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--color-text-muted)' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
