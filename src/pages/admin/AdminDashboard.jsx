import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  BookOpen, LayoutDashboard, Users, Package, ShoppingBag,
  LogOut, Search, Bell, ChevronRight, MoreHorizontal, Menu, X,
  ShieldAlert, Eye, Ban, UserCheck, Trash2, ArrowLeft, Mail, Calendar,
  Shield, ShieldCheck, Hash, GraduationCap, Layers,
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState(null);

  const adminUser = JSON.parse(localStorage.getItem('campuscrate_admin') || '{}');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'resources', label: 'Resources', icon: Package },
    { id: 'deals', label: 'Deals', icon: ShoppingBag },
  ];

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/dashboard');
      if (res.data.success) setStats(res.data.stats);
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await API.get('/admin/users');
      if (res.data.success) setUsers(res.data.users);
    } catch { toast.error('Failed to load users'); }
    finally { setUsersLoading(false); }
  };

  const viewProfile = async (userId) => {
    setProfileLoading(true);
    setSelectedUser(userId);
    try {
      const res = await API.get(`/admin/users/${userId}`);
      if (res.data.success) setUserProfile(res.data);
    } catch { toast.error('Failed to load profile'); }
    finally { setProfileLoading(false); }
  };

  const handleSuspend = (userId) => {
    setConfirmModal({
      title: 'Suspend User',
      message: 'This will block the user from logging in and send them a suspension email. Continue?',
      icon: 'suspend',
      btnLabel: 'Suspend',
      onConfirm: async () => {
        try {
          const res = await API.patch(`/admin/users/${userId}/suspend`);
          if (res.data.success) {
            toast.success(res.data.message);
            fetchUsers();
            if (selectedUser === userId) viewProfile(userId);
          }
        } catch { toast.error('Failed to suspend user'); }
        setConfirmModal(null);
      },
    });
  };

  const handleUnsuspend = (userId) => {
    setConfirmModal({
      title: 'Reactivate User',
      message: 'This will restore the user\'s access and send them a reactivation email. Continue?',
      icon: 'reactivate',
      btnLabel: 'Reactivate',
      onConfirm: async () => {
        try {
          const res = await API.patch(`/admin/users/${userId}/unsuspend`);
          if (res.data.success) {
            toast.success(res.data.message);
            fetchUsers();
            if (selectedUser === userId) viewProfile(userId);
          }
        } catch { toast.error('Failed to unsuspend user'); }
        setConfirmModal(null);
      },
    });
  };

  const handleVerify = (userId) => {
    setConfirmModal({
      title: 'Verify College Student',
      message: 'This will mark the user as a verified college student. A verified badge will appear on their profile.',
      icon: 'reactivate',
      btnLabel: 'Verify',
      onConfirm: async () => {
        try {
          const res = await API.patch(`/admin/users/${userId}/verify`);
          if (res.data.success) {
            toast.success(res.data.message);
            fetchUsers();
            if (selectedUser === userId) viewProfile(userId);
          }
        } catch { toast.error('Failed to verify user'); }
        setConfirmModal(null);
      },
    });
  };

  const handleUnverify = (userId) => {
    setConfirmModal({
      title: 'Remove Verification',
      message: 'This will remove the college student verification badge from this user. Continue?',
      icon: 'suspend',
      btnLabel: 'Remove',
      onConfirm: async () => {
        try {
          const res = await API.patch(`/admin/users/${userId}/unverify`);
          if (res.data.success) {
            toast.success(res.data.message);
            fetchUsers();
            if (selectedUser === userId) viewProfile(userId);
          }
        } catch { toast.error('Failed to unverify user'); }
        setConfirmModal(null);
      },
    });
  };

  const fetchResources = async () => {
    setResourcesLoading(true);
    try {
      const res = await API.get('/admin/resources');
      if (res.data.success) setResources(res.data.resources);
    } catch { toast.error('Failed to load resources'); }
    finally { setResourcesLoading(false); }
  };

  const fetchDeals = async () => {
    setDealsLoading(true);
    try {
      const res = await API.get('/admin/deals');
      if (res.data.success) setDeals(res.data.deals);
    } catch { toast.error('Failed to load deals'); }
    finally { setDealsLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'resources') fetchResources();
    if (activeTab === 'deals') fetchDeals();
  }, [activeTab]);

  const handleDeleteResource = (id) => {
    setConfirmModal({
      title: 'Delete Resource',
      message: 'Are you sure you want to delete this resource? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const res = await API.delete(`/admin/resources/${id}`);
          if (res.data.success) { toast.success('Resource deleted'); fetchResources(); fetchStats(); }
        } catch { toast.error('Failed to delete resource'); }
        setConfirmModal(null);
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('campuscrate_admin_token');
    localStorage.removeItem('campuscrate_admin');
    navigate('/admin/login');
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: '#4f46e5', bg: '#eef2ff' },
    { label: 'Resources', value: stats?.totalResources || 0, icon: Package, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Deals', value: stats?.totalDeals || 0, icon: ShoppingBag, color: '#10b981', bg: '#d1fae5' },
    { label: 'Pending', value: stats?.pendingRequests || 0, icon: Bell, color: '#3b82f6', bg: '#dbeafe' },
  ];

  // ─── Render Helpers ─────────────────────────────────────────────────
  const renderDashboard = () => (
    <>
      <div className="anim-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
          Platform Overview
        </h1>
        <p style={{ color: 'var(--color-text-sub)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Monitor the health and activity of CampusCrate.
        </p>
      </div>
      <div className="anim-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', animationDelay: '0.08s' }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.bg }}>
                <s.icon style={{ width: '18px', height: '18px', color: s.color }} />
              </div>
              <MoreHorizontal style={{ width: '16px', height: '16px', color: 'var(--color-text-muted)' }} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-sub)', marginTop: '0.125rem' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </>
  );

  const renderUserProfile = () => {
    if (!userProfile) return null;
    const u = userProfile.user;
    return (
      <div className="anim-up">
        <button onClick={() => { setSelectedUser(null); setUserProfile(null); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1.25rem', fontFamily: 'var(--font-body)' }}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Users
        </button>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-brand-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand)' }}>{u.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{u.name}</h2>
              <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Hash style={{ width: '13px', height: '13px' }} /> {u.roll_number || '—'}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'flex-end' }}>
              {u.is_suspended ? (
                <span className="chip" style={{ background: 'var(--color-danger-pale)', color: 'var(--color-danger)' }}>Suspended</span>
              ) : (
                <span className="chip" style={{ background: 'var(--color-success-pale)', color: 'var(--color-success)' }}>Active</span>
              )}
              {u.is_college_verified ? (
                <span className="badge-verified"><ShieldCheck style={{ width: '12px', height: '12px' }} /> Verified</span>
              ) : (
                <span className="badge-unverified"><Shield style={{ width: '12px', height: '12px' }} /> Unverified</span>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-sub)', fontSize: '0.85rem' }}>
              <Mail style={{ width: '15px', height: '15px' }} /> {u.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-sub)', fontSize: '0.85rem' }}>
              <Calendar style={{ width: '15px', height: '15px' }} /> Joined {new Date(u.createdAt).toLocaleDateString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-sub)', fontSize: '0.85rem' }}>
              <GraduationCap style={{ width: '15px', height: '15px' }} /> {u.course || 'Course not set'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-sub)', fontSize: '0.85rem' }}>
              <Layers style={{ width: '15px', height: '15px' }} /> Batch {u.batch || 'not set'}
            </div>
          </div>
          {u.bio && <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: '0.5rem' }}>{u.bio}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Resources', value: userProfile.resourcesCount },
              { label: 'Requests', value: userProfile.requestsCount },
              { label: 'Semester', value: u.semester || 'N/A' },
              { label: 'Trust Score', value: u.trust_score ?? 50 },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: '0.625rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {u.is_college_verified ? (
              <button onClick={() => handleUnverify(u._id)} className="btn" style={{ padding: '0.625rem 1rem', background: 'var(--color-warning-pale)', color: '#d97706', borderRadius: '0.625rem' }}>
                <Shield style={{ width: '16px', height: '16px' }} /> Remove Verification
              </button>
            ) : (
              <button onClick={() => handleVerify(u._id)} className="btn" style={{ padding: '0.625rem 1rem', background: '#d1fae5', color: '#059669', borderRadius: '0.625rem' }}>
                <ShieldCheck style={{ width: '16px', height: '16px' }} /> Verify Student
              </button>
            )}
            {u.is_suspended ? (
              <button onClick={() => handleUnsuspend(u._id)} className="btn" style={{ padding: '0.625rem 1rem', background: 'var(--color-success-pale)', color: 'var(--color-success)' }}>
                <UserCheck style={{ width: '16px', height: '16px' }} /> Reactivate
              </button>
            ) : (
              <button onClick={() => handleSuspend(u._id)} className="btn btn-danger">
                <Ban style={{ width: '16px', height: '16px' }} /> Suspend
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    if (selectedUser && userProfile) return renderUserProfile();
    if (profileLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)' }} /></div>;

    return (
      <>
        <div className="anim-up" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Manage Users</h1>
          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.875rem', marginTop: '0.25rem' }}>View, suspend, or manage platform users.</p>
        </div>
        <div className="card anim-up" style={{ animationDelay: '0.08s' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Name', 'Roll No.', 'Course', 'Status', 'Verified', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 500, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}><div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)', margin: '0 auto 0.5rem' }} />Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No users found.</td></tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={u._id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--color-border-light)' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.75rem 1.25rem', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-brand-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-brand)', flexShrink: 0 }}>{u.name?.charAt(0)?.toUpperCase()}</div>
                          {u.name}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1.25rem', color: 'var(--color-text-sub)', fontSize: '0.75rem' }}>{u.roll_number || '—'}</td>
                      <td style={{ padding: '0.75rem 1.25rem', color: 'var(--color-text-sub)' }}>{u.course || '—'}</td>
                      <td style={{ padding: '0.75rem 1.25rem' }}>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                          background: u.is_suspended ? '#fee2e2' : !u.is_verified ? '#fef3c7' : '#d1fae5',
                          color: u.is_suspended ? '#ef4444' : !u.is_verified ? '#d97706' : '#059669',
                        }}>{u.is_suspended ? 'Suspended' : !u.is_verified ? 'Unverified' : 'Active'}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1.25rem' }}>
                        {u.is_college_verified ? (
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, background: '#d1fae5', color: '#059669' }}>✓ Verified</span>
                        ) : (
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, background: '#fef3c7', color: '#d97706' }}>Pending</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button onClick={() => viewProfile(u._id)} title="View" style={{ background: 'var(--color-brand-pale)', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: 'var(--color-brand)', display: 'flex' }}><Eye style={{ width: '14px', height: '14px' }} /></button>
                          {u.is_college_verified ? (
                            <button onClick={() => handleUnverify(u._id)} title="Unverify" style={{ background: '#fef3c7', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#d97706', display: 'flex' }}><Shield style={{ width: '14px', height: '14px' }} /></button>
                          ) : (
                            <button onClick={() => handleVerify(u._id)} title="Verify" style={{ background: '#d1fae5', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#059669', display: 'flex' }}><ShieldCheck style={{ width: '14px', height: '14px' }} /></button>
                          )}
                          {u.is_suspended ? (
                            <button onClick={() => handleUnsuspend(u._id)} title="Unsuspend" style={{ background: '#d1fae5', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#059669', display: 'flex' }}><UserCheck style={{ width: '14px', height: '14px' }} /></button>
                          ) : (
                            <button onClick={() => handleSuspend(u._id)} title="Suspend" style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Ban style={{ width: '14px', height: '14px' }} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  const renderResourceDetail = () => {
    const r = selectedResource;
    return (
      <div className="anim-up">
        <button onClick={() => setSelectedResource(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1.25rem', fontFamily: 'var(--font-body)' }}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Resources
        </button>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {r.image_url && <img src={r.image_url} alt={r.title} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }} />}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>{r.title}</h2>
              <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{r.description || 'No description provided.'}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, background: '#eef2ff', color: '#4f46e5' }}>{r.category}</span>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, background: r.type === 'Paid' ? '#fef3c7' : '#d1fae5', color: r.type === 'Paid' ? '#d97706' : '#059669' }}>{r.type}</span>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, background: r.status === 'Available' ? '#d1fae5' : '#e2e8f0', color: r.status === 'Available' ? '#059669' : '#64748b' }}>{r.status}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Price', value: r.price > 0 ? `₹${r.price}` : 'Free' },
              { label: 'Condition', value: r.condition || 'N/A' },
              { label: 'Owner', value: r.owner_id?.name || '—' },
              { label: 'Listed', value: new Date(r.createdAt).toLocaleDateString() },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: '0.625rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => handleDeleteResource(r._id)} className="btn btn-danger">
            <Trash2 style={{ width: '16px', height: '16px' }} /> Delete Resource
          </button>
        </div>
      </div>
    );
  };

  const renderResources = () => {
    if (selectedResource) return renderResourceDetail();
    return (
    <>
      <div className="anim-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>All Resources</h1>
        <p style={{ color: 'var(--color-text-sub)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage all resources posted on the platform.</p>
      </div>
      <div className="card anim-up" style={{ animationDelay: '0.08s' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Title', 'Category', 'Type', 'Price', 'Owner', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 500, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resourcesLoading ? (
                <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}><div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)', margin: '0 auto 0.5rem' }} />Loading...</td></tr>
              ) : resources.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No resources found.</td></tr>
              ) : (
                resources.map((r, i) => (
                  <tr key={r._id} style={{ borderBottom: i < resources.length - 1 ? '1px solid var(--color-border-light)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.75rem 1.25rem', fontWeight: 500 }}>{r.title}</td>
                    <td style={{ padding: '0.75rem 1.25rem', color: 'var(--color-text-sub)' }}>{r.category}</td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                        background: r.type === 'Paid' ? '#eef2ff' : r.type === 'Exchange' ? '#fef3c7' : '#d1fae5',
                        color: r.type === 'Paid' ? '#4f46e5' : r.type === 'Exchange' ? '#d97706' : '#059669',
                      }}>{r.type}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', color: 'var(--color-text-sub)', fontWeight: 500 }}>{r.price > 0 ? `₹${r.price}` : 'Free'}</td>
                    <td style={{ padding: '0.75rem 1.25rem', color: 'var(--color-text-sub)' }}>{r.owner_id?.name || '—'}</td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                        background: r.status === 'Available' ? '#d1fae5' : r.status === 'Pending' ? '#fef3c7' : '#e2e8f0',
                        color: r.status === 'Available' ? '#059669' : r.status === 'Pending' ? '#d97706' : '#64748b',
                      }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button onClick={() => setSelectedResource(r)} title="View" style={{ background: 'var(--color-brand-pale)', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: 'var(--color-brand)', display: 'flex' }}><Eye style={{ width: '14px', height: '14px' }} /></button>
                        <button onClick={() => handleDeleteResource(r._id)} title="Delete" style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Trash2 style={{ width: '14px', height: '14px' }} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
    );
  };

  const renderDeals = () => (
    <>
      <div className="anim-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Completed Deals</h1>
        <p style={{ color: 'var(--color-text-sub)', fontSize: '0.875rem', marginTop: '0.25rem' }}>All completed exchanges on the platform.</p>
      </div>
      <div className="card anim-up" style={{ animationDelay: '0.08s' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Resource', 'Category', 'Sender', 'Receiver', 'Completed'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 500, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dealsLoading ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}><div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)', margin: '0 auto 0.5rem' }} />Loading...</td></tr>
              ) : deals.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No completed deals yet.</td></tr>
              ) : (
                deals.map((d, i) => (
                  <tr key={d._id} style={{ borderBottom: i < deals.length - 1 ? '1px solid var(--color-border-light)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.75rem 1.25rem', fontWeight: 500 }}>{d.resource_id?.title || '—'}</td>
                    <td style={{ padding: '0.75rem 1.25rem', color: 'var(--color-text-sub)' }}>{d.resource_id?.category || '—'}</td>
                    <td style={{ padding: '0.75rem 1.25rem', color: 'var(--color-text-sub)' }}>{d.sender_id?.name || '—'}</td>
                    <td style={{ padding: '0.75rem 1.25rem', color: 'var(--color-text-sub)' }}>{d.receiver_id?.name || '—'}</td>
                    <td style={{ padding: '0.75rem 1.25rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{new Date(d.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)' }} /></div>;
    if (activeTab === 'dashboard') return renderDashboard();
    if (activeTab === 'users') return renderUsers();
    if (activeTab === 'resources') return renderResources();
    if (activeTab === 'deals') return renderDeals();
    return null;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ position: 'fixed', top: 0, left: 0, flexShrink: 0 }}>
        <div style={{ padding: '1.25rem 1.25rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-brand)' }}>
              <ShieldAlert style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>CampusCrate</span>
              <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 600, color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Panel</span>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map(item => (
              <button key={item.id} className={`sidebar-link ${activeTab === item.id ? 'sidebar-link-active' : ''}`}
                onClick={() => { setActiveTab(item.id); setSelectedUser(null); setUserProfile(null); }}>
                <item.icon style={{ width: '18px', height: '18px' }} /> {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-brand-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brand)' }}>{adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)' }}>{adminUser?.name || 'Admin'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Super Admin</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%', fontSize: '0.8rem' }}>
            <LogOut style={{ width: '15px', height: '15px' }} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'relative', width: '260px', background: 'var(--color-card)', borderRight: '1px solid var(--color-border)', padding: '1.25rem', zIndex: 41 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert style={{ width: '16px', height: '16px', color: 'white' }} />
                </div>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X style={{ width: '20px', height: '20px' }} /></button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {navItems.map(item => (
                <button key={item.id} className={`sidebar-link ${activeTab === item.id ? 'sidebar-link-active' : ''}`}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); setSelectedUser(null); setUserProfile(null); }}>
                  <item.icon style={{ width: '18px', height: '18px' }} /> {item.label}
                </button>
              ))}
            </nav>
            <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%', fontSize: '0.8rem', marginTop: '1.5rem' }}>
              <LogOut style={{ width: '15px', height: '15px' }} /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1, marginLeft: '260px', minHeight: '100vh' }}>
        <header className="navbar" style={{ marginLeft: '260px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}>
              <Menu style={{ width: '22px', height: '22px' }} />
            </button>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--color-text-muted)' }} />
              <input placeholder="Search..." style={{ padding: '0.5rem 0.75rem 0.5rem 2.25rem', background: 'var(--color-input)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.8125rem', outline: 'none', width: '280px', fontFamily: 'var(--font-body)', color: 'var(--color-text)' }} />
            </div>
          </div>
        </header>
        <div style={{ padding: '5rem 1.5rem 2rem' }}>
          {renderContent()}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          main { margin-left: 0 !important; }
          header.navbar { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {/* Confirm Modal */}
      {confirmModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }} onClick={() => setConfirmModal(null)} />
          <div className="card-lg anim-up" style={{ position: 'relative', width: '100%', maxWidth: '400px', padding: '1.75rem', margin: '1rem', zIndex: 101 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: confirmModal.icon === 'reactivate' ? '#d1fae5' : 'var(--color-danger-pale)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                {confirmModal.icon === 'suspend' ? <Ban style={{ width: '22px', height: '22px', color: 'var(--color-danger)' }} /> : confirmModal.icon === 'reactivate' ? <UserCheck style={{ width: '22px', height: '22px', color: '#059669' }} /> : <Trash2 style={{ width: '22px', height: '22px', color: 'var(--color-danger)' }} />}
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>{confirmModal.title}</h3>
              <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.5 }}>{confirmModal.message}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setConfirmModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={confirmModal.onConfirm} className="btn" style={{ flex: 1, padding: '0.625rem 1rem', background: confirmModal.icon === 'reactivate' ? '#059669' : 'var(--color-danger)', color: 'white', borderRadius: '0.625rem' }}>{confirmModal.btnLabel || 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
