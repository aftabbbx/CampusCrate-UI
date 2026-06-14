import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import API from '../api/axios';
import UserLayout from '../components/UserLayout';
import toast from 'react-hot-toast';
import {
  User, Mail, GraduationCap, Calendar, Shield, Star, Users,
  Package, Clock, ChevronRight, Hash, Layers, BookOpen,
  UserPlus, UserMinus, ArrowLeft, MapPin, IndianRupee,
  X, MessageSquare, Eye,
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
  const { onlineUsers } = useSocket();
  const [profile, setProfile] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Followers/following modal
  const [modalType, setModalType] = useState(null); // 'followers' | 'following' | null
  const [modalUsers, setModalUsers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchPublicProfile();
  }, [rollNumber]);

  const fetchPublicProfile = async () => {
    try {
      const res = await API.get(`/user/public/${rollNumber}`);
      if (res.data.success) {
        setProfile(res.data.user);
        setResources(res.data.resources || []);
        setFollowing(res.data.user.isFollowing || false);
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

  // Open followers/following modal
  const openModal = async (type) => {
    if (!profile?._id) return;
    setModalType(type);
    setModalLoading(true);
    try {
      const res = await API.get(`/user/${type}/${profile._id}`);
      if (res.data.success) {
        setModalUsers(res.data.users);
      }
    } catch (err) {
      toast.error(`Failed to load ${type}`);
    } finally {
      setModalLoading(false);
    }
  };

  const isOnline = profile?._id && onlineUsers.has(profile._id);
  const isOwnProfile = authUser && profile && (authUser._id === profile._id || authUser.roll_number === profile.roll_number);

  // Helpers
  const timeAgo = (date) => {
    if (!date) return '';
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return new Date(date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Free': return { bg: '#d1fae5', color: '#059669' };
      case 'Paid': return { bg: '#eef2ff', color: '#4f46e5' };
      case 'Exchange': return { bg: '#fef3c7', color: '#d97706' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)' }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Loading profile...</p>
        </div>
      </UserLayout>
    );
  }

  if (!profile) {
    return (
      <UserLayout>
        <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
          <User style={{ width: '48px', height: '48px', color: 'var(--color-border)' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>Profile Not Found</h2>
          <button onClick={() => navigate('/resources')} className="btn btn-brand" style={{ width: 'auto', padding: '0.625rem 1.5rem' }}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} /> Go Back
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div style={{ padding: '2rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>

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
              {isOnline && (
                <div className="online-dot online-dot-pulse" style={{ width: '14px', height: '14px', border: '2.5px solid var(--color-card)' }} />
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
                    <Shield style={{ width: '12px', height: '12px' }} /> Verified Student
                  </span>
                ) : (
                  <span className="badge-unverified">
                    <Clock style={{ width: '12px', height: '12px' }} /> Pending Verification
                  </span>
                )}
                {isOnline && (
                  <span className="badge-active">
                    <span className="badge-active-dot" /> Online now
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                {!isOwnProfile && isAuthenticated && (
                  <button onClick={() => navigate('/messages')} className="btn btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                    <MessageSquare style={{ width: '14px', height: '14px' }} /> Message
                  </button>
                )}
                {isOwnProfile && (
                  <button onClick={() => navigate('/profile')} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
                    Go to My Profile
                  </button>
                )}
              </div>
            </div>

            {/* Trust Score */}
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

        {/* ─── Stats (Clickable Followers/Following) ───────────────── */}
        <div className="anim-up" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem',
          margin: '1.25rem 0', animationDelay: '0.08s',
        }}>
          {[
            { label: 'Followers', value: profile.followers_count || 0, clickable: true, type: 'followers' },
            { label: 'Following', value: profile.following_count || 0, clickable: true, type: 'following' },
            { label: 'Resources', value: profile.resources_count || 0, clickable: false },
            { label: 'Trust', value: `${profile.trust_score || 50}%`, clickable: false },
          ].map((s, i) => (
            <div key={i} className="profile-stat"
              style={{ cursor: s.clickable ? 'pointer' : 'default', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onClick={() => s.clickable && openModal(s.type)}
              onMouseEnter={(e) => { if (s.clickable) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; } }}
              onMouseLeave={(e) => { if (s.clickable) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; } }}
            >
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
        <div className="anim-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', animationDelay: '0.16s' }}>
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
              <div className="info-row">
                <Clock style={{ width: '15px', height: '15px', color: 'var(--color-brand)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8125rem', color: isOnline ? '#10b981' : 'var(--color-text-sub)' }}>
                  {isOnline ? '● Active now' : `Last seen ${timeAgo(profile.last_active)}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Resources Grid (OLX-style) ──────────────────────────── */}
        <div className="anim-up" style={{ animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
              <Package style={{ width: '18px', height: '18px', display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--color-brand)' }} />
              All Resources ({resources.length})
            </h2>
          </div>

          {resources.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <Package style={{ width: '40px', height: '40px', color: 'var(--color-border)', margin: '0 auto 0.75rem' }} />
              <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>No resources posted yet</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>When {profile.name} lists a resource, it'll show up here</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {resources.map((r) => {
                const typeColor = getTypeColor(r.type);
                const isSold = r.status === 'Sold';
                return (
                  <div key={r._id}
                    onClick={() => !isSold && (isAuthenticated ? navigate(`/resource/${r._id}`) : navigate('/login'))}
                    className="card"
                    style={{
                      padding: 0, overflow: 'hidden', cursor: isSold ? 'not-allowed' : 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      opacity: isSold ? 0.6 : 1,
                      filter: isSold ? 'grayscale(40%)' : 'none',
                      border: isSold ? '1px solid #FECACA' : undefined,
                    }}
                    onMouseEnter={(e) => { if (!isSold) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', paddingBottom: '65%', background: 'linear-gradient(135deg, var(--color-bg-alt), var(--color-border-light))' }}>
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package style={{ width: '32px', height: '32px', color: 'var(--color-text-muted)', opacity: 0.2 }} />
                        </div>
                      )}
                      {/* Sold overlay */}
                      {isSold && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(153,27,27,0.1)' }}>
                          <span style={{ padding: '4px 14px', borderRadius: 9999, background: '#991B1B', color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>SOLD</span>
                        </div>
                      )}
                      {/* Status badge */}
                      <div style={{
                        position: 'absolute', top: '0.5rem', right: '0.5rem',
                        padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 600,
                        background: r.status === 'Available' ? '#d1fae5' : isSold ? '#FEE2E2' : '#e2e8f0',
                        color: r.status === 'Available' ? '#059669' : isSold ? '#991B1B' : '#64748b',
                      }}>{r.status}</div>
                      {/* Type badge */}
                      <div style={{
                        position: 'absolute', top: '0.5rem', left: '0.5rem',
                        padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700,
                        background: typeColor.bg, color: typeColor.color,
                      }}>{r.type}</div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '0.875rem' }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: isSold ? '#64748b' : 'var(--color-brand)', fontFamily: 'var(--font-display)' }}>
                          {r.price > 0 ? `₹${r.price}` : 'Free'}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                          {timeAgo(r.createdAt)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 500, background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', color: 'var(--color-text-sub)' }}>
                          {r.category}
                        </span>
                        {r.condition && (
                          <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 500, background: r.condition === 'New' ? '#d1fae5' : '#fef3c7', color: r.condition === 'New' ? '#059669' : '#d97706' }}>
                            {r.condition}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── Followers / Following Modal ───────────────────────────── */}
      {modalType && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setModalType(null)} />
          <div style={{
            position: 'relative', width: '400px', maxHeight: '500px', background: 'var(--color-card)',
            borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid var(--color-border)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.15)', animation: 'fadeUp 0.2s ease-out',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', textTransform: 'capitalize' }}>
                {modalType}
              </h3>
              <button onClick={() => setModalType(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', maxHeight: '420px' }}>
              {modalLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)', margin: '0 auto' }} />
                </div>
              ) : modalUsers.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                  <Users style={{ width: '32px', height: '32px', color: 'var(--color-border)', margin: '0 auto 0.5rem' }} />
                  No {modalType} yet
                </div>
              ) : (
                modalUsers.map((u) => (
                  <div key={u._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--color-border-light)',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onClick={() => { setModalType(null); navigate(`/profile/${u.roll_number}`); }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-light))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
                    }}>
                      {u.profile_image ? (
                        <img src={u.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{u.name?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{u.roll_number}</div>
                    </div>
                    <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default PublicProfile;
