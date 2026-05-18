import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, LayoutDashboard, Package, MessageSquare, Bell, User,
  LogOut, Search, Plus, Menu, X,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const UserLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'resources', label: 'Resources', icon: Package, path: '/resources' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '#' },
    { id: 'profile', label: 'Profile', icon: User, path: '#' },
  ];

  // Helper to check active route
  const isActive = (path) => {
    if (path === '#') return false;
    return location.pathname === path;
  };

  const handleNav = (path) => {
    if (path !== '#') {
      navigate(path);
    }
    setSidebarOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* ─── Sidebar (Desktop) ─────────────────────────────────────── */}
      <aside className="sidebar" style={{ position: 'fixed', top: 0, left: 0, flexShrink: 0, width: '260px', height: '100vh', background: 'var(--color-card)', borderRight: '1px solid var(--color-border)', zIndex: 30 }}>
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
                className={`sidebar-link ${isActive(item.path) ? 'sidebar-link-active' : ''}`}
                onClick={() => handleNav(item.path)}
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
                <button key={item.id} className={`sidebar-link ${isActive(item.path) ? 'sidebar-link-active' : ''}`}
                  onClick={() => handleNav(item.path)}>
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
      <main style={{ flex: 1, marginLeft: '260px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <header className="navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '60px', background: 'var(--color-card)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}>
              <Menu style={{ width: '22px', height: '22px' }} />
            </button>
            <div style={{ position: 'relative' }} className="topbar-search">
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--color-text-muted)' }} />
              <input placeholder="Search everywhere..." style={{
                padding: '0.5rem 0.75rem 0.5rem 2.25rem', background: 'var(--color-input)',
                border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.8125rem',
                outline: 'none', width: '280px', fontFamily: 'var(--font-body)', color: 'var(--color-text)',
              }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => navigate('/add-resource')} className="btn btn-brand" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
              <Plus style={{ width: '16px', height: '16px' }} /> Add Resource
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          main { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
          .topbar-search input { width: '200px' !important; }
        }
        @media (max-width: 480px) {
          .topbar-search { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default UserLayout;
