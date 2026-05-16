import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, LayoutDashboard, Package, MessageSquare, Bell, User,
  LogOut, Search, Plus, TrendingUp, Users, ShoppingBag, Handshake,
  ChevronRight, MoreHorizontal, Menu, X,
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resources', label: 'Resources', icon: Package },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const stats = [
    { label: 'Total Resources', value: '24', icon: Package, color: '#4f46e5', bg: '#eef2ff' },
    { label: 'Active Deals', value: '8', icon: Handshake, color: '#10b981', bg: '#d1fae5' },
    { label: 'Messages', value: '12', icon: MessageSquare, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Views', value: '156', icon: TrendingUp, color: '#3b82f6', bg: '#dbeafe' },
  ];

  const [recentResources, setRecentResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await API.get('/resource/user/my');
        if (response.data.success) {
          setRecentResources(response.data.resources.slice(0, 5)); // Get top 5 of my resources
        }
      } catch (error) {
        console.error('Failed to fetch resources', error);
      } finally {
        setLoadingResources(false);
      }
    };
    fetchResources();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* ─── Sidebar (Desktop) ─────────────────────────────────────── */}
      <aside className="sidebar" style={{ position: 'fixed', top: 0, left: 0, flexShrink: 0 }}>
        <div style={{ padding: '1.25rem 1.25rem 2rem' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-brand)' }}>
              <BookOpen style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>CampusCrate</span>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-link ${item.id === 'dashboard' ? 'sidebar-link-active' : ''}`}
                onClick={() => window.location.href = `/${item.id}`}
              >
                <item.icon style={{ width: '18px', height: '18px' }} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User + Logout */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-brand-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brand)' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Student'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button onClick={logout} className="btn btn-danger" style={{ width: '100%', fontSize: '0.8rem' }}>
            <LogOut style={{ width: '15px', height: '15px' }} /> Sign out
          </button>
        </div>
      </aside>

      {/* ─── Mobile Overlay ────────────────────────────────────────── */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'relative', width: '260px', background: 'var(--color-card)', borderRight: '1px solid var(--color-border)', padding: '1.25rem', zIndex: 41 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen style={{ width: '16px', height: '16px', color: 'white' }} />
                </div>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>CampusCrate</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {navItems.map((item) => (
                <button key={item.id} className={`sidebar-link ${activeTab === item.id ? 'sidebar-link-active' : ''}`}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
                  <item.icon style={{ width: '18px', height: '18px' }} /> {item.label}
                </button>
              ))}
            </nav>
            <button onClick={logout} className="btn btn-danger" style={{ width: '100%', fontSize: '0.8rem', marginTop: '1.5rem' }}>
              <LogOut style={{ width: '15px', height: '15px' }} /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* ─── Main Content ──────────────────────────────────────────── */}
      <main style={{ flex: 1, marginLeft: '260px', minHeight: '100vh' }}>
        {/* Top Bar */}
        <header className="navbar" style={{ marginLeft: '260px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}>
              <Menu style={{ width: '22px', height: '22px' }} />
            </button>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--color-text-muted)' }} />
              <input placeholder="Search resources..." style={{
                padding: '0.5rem 0.75rem 0.5rem 2.25rem', background: 'var(--color-input)',
                border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.8125rem',
                outline: 'none', width: '280px', fontFamily: 'var(--font-body)', color: 'var(--color-text)',
              }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => window.location.href = '/add-resource'} className="btn btn-brand" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
              <Plus style={{ width: '16px', height: '16px' }} /> Add Resource
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '5rem 1.5rem 2rem' }}>
          {/* Welcome */}
          <div className="anim-up" style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p style={{ color: 'var(--color-text-sub)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Here's what's happening on your campus today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="anim-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', animationDelay: '0.08s' }}>
            {stats.map((s, i) => (
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

          {/* Recent Resources Table */}
          <div className="card anim-up" style={{ animationDelay: '0.16s' }}>
            <div style={{ padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>My Resources</h3>
              <button onClick={() => window.location.href = '/resources'} style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: 'var(--color-brand)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View all <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {['Title', 'Category', 'Type', 'Price', 'Status'].map((h) => (
                      <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 500, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingResources ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)', margin: '0 auto 0.5rem' }} />
                        Loading resources...
                      </td>
                    </tr>
                  ) : recentResources.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No resources found. Be the first to add one!
                      </td>
                    </tr>
                  ) : (
                    recentResources.map((r, i) => (
                      <tr key={i} 
                        onClick={() => window.location.href = `/resource/${r._id}`}
                        style={{ borderBottom: i < recentResources.length - 1 ? '1px solid var(--color-border-light)' : 'none', transition: 'background 0.15s', cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '0.75rem 1.25rem', fontWeight: 500, color: 'var(--color-text)' }}>{r.title}</td>
                        <td style={{ padding: '0.75rem 1.25rem', color: 'var(--color-text-sub)' }}>{r.category}</td>
                        <td style={{ padding: '0.75rem 1.25rem' }}>
                          <span style={{
                            padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                            background: r.type === 'Paid' ? '#eef2ff' : r.type === 'Exchange' ? '#fef3c7' : '#d1fae5',
                            color: r.type === 'Paid' ? '#4f46e5' : r.type === 'Exchange' ? '#d97706' : '#059669',
                          }}>{r.type}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1.25rem', color: 'var(--color-text-sub)', fontWeight: 500 }}>{r.price > 0 ? `₹${r.price}` : 'Free'}</td>
                        <td style={{ padding: '0.75rem 1.25rem' }}>
                          <span style={{
                            padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                            background: r.status === 'Available' ? '#d1fae5' : r.status === 'Pending' ? '#fef3c7' : '#e2e8f0',
                            color: r.status === 'Available' ? '#059669' : r.status === 'Pending' ? '#d97706' : '#64748b',
                          }}>{r.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
    </div>
  );
};

export default Dashboard;
