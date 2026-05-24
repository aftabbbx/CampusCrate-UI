import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import UserLayout from '../components/UserLayout';
import toast from 'react-hot-toast';
import {
  User, Mail, Phone, GraduationCap, Calendar, Shield, Star,
  Users, Package, Edit3, Save, X, Copy, Check, Link as LinkIcon,
  Clock, ChevronRight, Hash, Layers, BookOpen, Camera, AlertTriangle,
} from 'lucide-react';

const COURSES = ['BCA', 'BBA', 'BCom', 'BSc', 'BA', 'BTech', 'MBA', 'MCA', 'MCom', 'MSc', 'Other'];
const BATCHES = ['2023-2027', '2024-2028', '2025-2029', '2026-2030'];

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

const Profile = () => {
  const { user, refreshProfile, updateUser, isProfileComplete } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentResources, setRecentResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/user/profile');
      if (res.data.success) {
        setProfile(res.data.user);
        setRecentResources(res.data.recentResources || []);
        updateUser(res.data.user); // Sync Context
      }
    } catch (err) {
      toast.error('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-open edit mode when profile is incomplete
  useEffect(() => {
    if (profile && !isProfileComplete && !editing) {
      startEdit();
    }
  }, [profile, isProfileComplete]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await API.post('/user/upload-profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        toast.success('Profile picture updated!');
        setProfile(p => ({ ...p, profile_image: res.data.profile_image }));
        updateUser({ ...profile, profile_image: res.data.profile_image });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const startEdit = () => {
    setEditForm({
      name: profile?.name || '',
      roll_number: profile?.roll_number || '',
      phone_number: profile?.phone_number || '',
      course: profile?.course || '',
      batch: profile?.batch || '',
      semester: profile?.semester || '',
      bio: profile?.bio || '',
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditForm({});
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await API.put(`/user/update/${profile._id}`, editForm);
      if (res.data.success) {
        toast.success('Profile updated!');
        updateUser(res.data.user);
        setEditing(false);
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const copyProfileLink = () => {
    const link = `${window.location.origin}/profile/${profile?.roll_number}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Profile link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const isActiveNow = (lastActive) => {
    if (!lastActive) return false;
    const diff = Date.now() - new Date(lastActive).getTime();
    return diff < 5 * 60 * 1000; // 5 minutes
  };

  if (loading) {
    return (
      <UserLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)' }} />
        </div>
      </UserLayout>
    );
  }

  if (!profile) {
    return (
      <UserLayout>
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Failed to load profile. Please refresh.
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
                position: 'relative', overflow: 'hidden',
              }}>
                {uploadingImage ? (
                  <div className="spinner" style={{ borderColor: 'white', borderTopColor: 'transparent', width: '24px', height: '24px' }} />
                ) : profile.profile_image ? (
                  <img src={profile.profile_image} alt={profile.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>
                    {profile.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
                
                {/* Upload Overlay */}
                <label style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, cursor: 'pointer', transition: 'opacity 0.2s',
                  borderRadius: '50%',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                >
                  <Camera style={{ width: '20px', height: '20px', color: 'white' }} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>

              {isActiveNow(profile.last_active) && !uploadingImage && (
                <div style={{
                  position: 'absolute', bottom: '2px', right: '2px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: '#10b981', border: '2px solid var(--color-card)',
                }} />
              )}
            </div>

            {/* Name + Badges */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                  {profile.name}
                </h1>
                {!editing && (
                  <button onClick={startEdit} style={{
                    background: 'var(--color-brand-pale)', border: 'none', borderRadius: '8px',
                    padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-brand)',
                    fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                  }}>
                    <Edit3 style={{ width: '12px', height: '12px' }} /> Edit
                  </button>
                )}
              </div>

              <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', marginBottom: '0.625rem' }}>
                <Hash style={{ width: '13px', height: '13px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                {profile.roll_number}
              </p>

              {/* Badges Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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

              {/* Trust Score */}
              <div style={{ marginTop: '0.875rem', maxWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>
                    <Star style={{ width: '12px', height: '12px', display: 'inline', verticalAlign: 'middle', marginRight: '3px', color: 'var(--color-accent)' }} />
                    Trust Score
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                    {profile.trust_score}/100
                  </span>
                </div>
                <div className="trust-score-bar">
                  <div className="trust-score-fill" style={{ width: `${profile.trust_score}%` }} />
                </div>
              </div>
            </div>

            {/* Completion Ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <CompletionRing percent={profile.profile_completion || 0} />
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Complete</span>
            </div>
          </div>
        </div>

        {/* ─── Stats Row ───────────────────────────────────────────── */}
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

        {/* ─── Edit Form OR Info Display ───────────────────────────── */}
        {editing ? (
          <div className="card anim-fade" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '1.25rem', color: 'var(--color-text)' }}>
              Edit Profile
            </h3>

            {/* Incomplete profile alert */}
            {!isProfileComplete && (
              <div style={{
                marginBottom: '1.25rem', padding: '0.875rem 1rem', borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a22)', border: '1px solid #fde68a',
                display: 'flex', alignItems: 'center', gap: '0.625rem',
              }}>
                <AlertTriangle style={{ width: '18px', height: '18px', color: '#d97706', flexShrink: 0 }} />
                <p style={{ fontSize: '0.8125rem', color: '#92400e', lineHeight: 1.4 }}>
                  <strong>Complete these fields</strong> to unlock messaging, resource listing, and more.
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Name */}
              <div>
                <label className="form-label">Full Name</label>
                <input value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="form-input" style={{ paddingLeft: '0.875rem' }} />
              </div>
              {/* Roll Number */}
              <div>
                <label className="form-label">
                  Roll Number {!profile?.roll_number && <span style={{ color: '#dc2626', fontSize: '0.7rem' }}>Required</span>}
                </label>
                <input
                  value={editForm.roll_number}
                  onChange={(e) => setEditForm(p => ({ ...p, roll_number: e.target.value }))}
                  className="form-input"
                  style={{
                    paddingLeft: '0.875rem',
                    ...(profile?.roll_number ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
                  }}
                  placeholder="e.g. 2024BCA001"
                  readOnly={!!profile?.roll_number}
                  title={profile?.roll_number ? 'Roll number cannot be changed once set' : ''}
                />
              </div>
              {/* Phone */}
              <div>
                <label className="form-label">Phone Number</label>
                <input value={editForm.phone_number} onChange={(e) => setEditForm(p => ({ ...p, phone_number: e.target.value }))}
                  className="form-input" style={{ paddingLeft: '0.875rem' }} />
              </div>
              {/* Course */}
              <div>
                <label className="form-label">Course</label>
                <select value={editForm.course} onChange={(e) => setEditForm(p => ({ ...p, course: e.target.value }))}
                  className="form-input" style={{ paddingLeft: '0.875rem', cursor: 'pointer', appearance: 'none' }}>
                  <option value="">Select course</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Batch */}
              <div>
                <label className="form-label">Batch</label>
                <select value={editForm.batch} onChange={(e) => setEditForm(p => ({ ...p, batch: e.target.value }))}
                  className="form-input" style={{ paddingLeft: '0.875rem', cursor: 'pointer', appearance: 'none' }}>
                  <option value="">Select batch</option>
                  {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {/* Semester */}
              <div>
                <label className="form-label">Semester</label>
                <select value={editForm.semester} onChange={(e) => setEditForm(p => ({ ...p, semester: e.target.value }))}
                  className="form-input" style={{ paddingLeft: '0.875rem', cursor: 'pointer', appearance: 'none' }}>
                  <option value="">Select semester</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={`Semester ${s}`}>Semester {s}</option>)}
                </select>
              </div>
            </div>
            {/* Bio */}
            <div style={{ marginTop: '1rem' }}>
              <label className="form-label">Bio / About</label>
              <textarea value={editForm.bio} onChange={(e) => setEditForm(p => ({ ...p, bio: e.target.value }))}
                maxLength={500} rows={3} placeholder="Tell others about yourself..."
                style={{
                  width: '100%', padding: '0.75rem', background: 'var(--color-input)',
                  border: '1.5px solid transparent', borderRadius: '0.625rem',
                  color: 'var(--color-text)', fontSize: '0.875rem', fontFamily: 'var(--font-body)',
                  outline: 'none', resize: 'vertical', transition: 'all 0.2s',
                }} />
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'right', marginTop: '0.25rem' }}>
                {editForm.bio?.length || 0}/500
              </p>
            </div>
            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.75rem' }}>
              <button onClick={cancelEdit} className="btn btn-ghost">
                <X style={{ width: '14px', height: '14px' }} /> Cancel
              </button>
              <button onClick={saveEdit} disabled={saving} className="btn btn-brand" style={{ flex: 1, width: 'auto' }}>
                {saving ? <div className="spinner" /> : <><Save style={{ width: '14px', height: '14px' }} /> Save Changes</>}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Bio Section */}
            <div className="profile-card anim-up" style={{ marginBottom: '1.25rem', animationDelay: '0.12s' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen style={{ width: '16px', height: '16px', color: 'var(--color-brand)' }} /> About
              </h3>
              <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                {profile.bio || 'No bio added yet. Click Edit to add one!'}
              </p>
            </div>

            {/* Info Cards */}
            <div className="anim-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', animationDelay: '0.16s' }}>
              <div className="profile-card">
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.875rem' }}>
                  Academic Info
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  <div className="info-row">
                    <GraduationCap style={{ width: '15px', height: '15px', color: 'var(--color-brand)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-sub)' }}>
                      {profile.course || 'Course not set'}
                    </span>
                  </div>
                  <div className="info-row">
                    <Layers style={{ width: '15px', height: '15px', color: 'var(--color-brand)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-sub)' }}>
                      Batch {profile.batch || 'not set'}
                    </span>
                  </div>
                  <div className="info-row">
                    <BookOpen style={{ width: '15px', height: '15px', color: 'var(--color-brand)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-sub)' }}>
                      {profile.semester || 'Semester not set'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-card">
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.875rem' }}>
                  Contact & Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  <div className="info-row">
                    <Mail style={{ width: '15px', height: '15px', color: 'var(--color-brand)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-sub)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {profile.email}
                    </span>
                  </div>
                  <div className="info-row">
                    <Phone style={{ width: '15px', height: '15px', color: 'var(--color-brand)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-sub)' }}>
                      {profile.phone_number || 'Not added'}
                    </span>
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
          </>
        )}

        {/* ─── Public Profile Link ─────────────────────────────────── */}
        <div className="profile-card anim-up" style={{ marginBottom: '1.25rem', animationDelay: '0.2s' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LinkIcon style={{ width: '16px', height: '16px', color: 'var(--color-brand)' }} /> Public Profile Link
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="share-link-box" style={{ flex: 1 }} onClick={copyProfileLink}>
              <LinkIcon style={{ width: '14px', height: '14px', color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {window.location.origin}/profile/{profile.roll_number}
              </span>
            </div>
            <button onClick={copyProfileLink} className="btn" style={{
              padding: '0.5rem 1rem', background: copied ? 'var(--color-success)' : 'var(--color-brand)',
              color: 'white', borderRadius: '0.625rem', fontSize: '0.8rem', transition: 'all 0.2s',
            }}>
              {copied ? <><Check style={{ width: '14px', height: '14px' }} /> Copied!</> : <><Copy style={{ width: '14px', height: '14px' }} /> Copy</>}
            </button>
          </div>
        </div>

        {/* ─── Recent Activity ─────────────────────────────────────── */}
        <div className="card anim-up" style={{ animationDelay: '0.24s' }}>
          <div style={{ padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
              Recent Activity
            </h3>
            <button onClick={() => window.location.href = '/resources'} style={{
              background: 'none', border: 'none', fontSize: '0.8125rem', color: 'var(--color-brand)',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
            }}>
              View all <ChevronRight style={{ width: '14px', height: '14px' }} />
            </button>
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
                  onClick={() => window.location.href = `/resource/${r._id}`}
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
                        {r.category} · {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                      background: r.status === 'Available' ? '#d1fae5' : '#e2e8f0',
                      color: r.status === 'Available' ? '#059669' : '#64748b',
                    }}>{r.status}</span>
                    <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--color-text-muted)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default Profile;
