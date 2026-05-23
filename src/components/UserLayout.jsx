import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  BookOpen, LayoutDashboard, Package, MessageSquare, Bell, User,
  LogOut, Search, Plus, Menu, X, CheckCheck, MessageCircle, Handshake, ShieldCheck,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';

const UserLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { totalUnreadMessages, unreadNotifications, clearNotificationCount, setUnreadNotifications } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'resources', label: 'Resources', icon: Package, path: '/resources' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages', badge: totalUnreadMessages },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications', badge: unreadNotifications },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  // Fetch notifications for dropdown
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await API.get('/notification/all');
      if (res.data.success) {
        setNotifications(res.data.notifications.slice(0, 8));
        const unreadRes = await API.get('/notification/unread-count');
        if (unreadRes.data.success) {
          setUnreadNotifications(unreadRes.data.unreadCount);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  };

  // Toggle notification dropdown
  const toggleNotifDropdown = () => {
    if (!notifOpen) fetchNotifications();
    setNotifOpen(!notifOpen);
  };

  // Mark all notifications as read
  const markAllRead = async () => {
    try {
      await API.put('/notification/read-all');
      clearNotificationCount();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Get notification icon and color
  const getNotifStyle = (type) => {
    switch (type) {
      case 'message': return { bg: '#eef2ff', color: '#4f46e5', Icon: MessageCircle };
      case 'request': return { bg: '#fef3c7', color: '#d97706', Icon: Handshake };
      case 'deal': return { bg: '#d1fae5', color: '#059669', Icon: CheckCheck };
      default: return { bg: '#f1f5f9', color: '#64748b', Icon: Bell };
    }
  };

  // Time ago helper
  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const SidebarContent = ({ isMobile = false }) => (
    <>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-brand)' }}>
          <BookOpen style={{ width: '18px', height: '18px', color: 'white' }} />
        </div>
        <span style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>CampusCrate</span>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        )}
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
            {item.badge > 0 && <span className="sidebar-badge">{item.badge > 99 ? '99+' : item.badge}</span>}
          </button>
        ))}
      </nav>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* ─── Sidebar (Desktop) ─────────────────────────────────────── */}
      <aside className="sidebar" style={{ position: 'fixed', top: 0, left: 0, flexShrink: 0, width: '260px', height: '100vh', background: 'var(--color-card)', borderRight: '1px solid var(--color-border)', zIndex: 30 }}>
        <div style={{ padding: '1.25rem 1.25rem 2rem' }}>
          <SidebarContent />
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
            <SidebarContent isMobile />
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
            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={toggleNotifDropdown} className="chat-action-btn" style={{ position: 'relative' }}>
                <Bell style={{ width: '20px', height: '20px' }} />
                {unreadNotifications > 0 && (
                  <span className="notif-bell-badge">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>
                )}
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div className="notif-dropdown">
                  <div style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '0.9375rem' }}>Notifications</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {unreadNotifications > 0 && (
                        <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--color-brand)', fontWeight: 600, cursor: 'pointer' }}>
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => { setNotifOpen(false); navigate('/notifications'); }} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--color-text-sub)', fontWeight: 500, cursor: 'pointer' }}>
                        View all
                      </button>
                    </div>
                  </div>
                  <div style={{ overflowY: 'auto', maxHeight: '380px' }}>
                    {notifLoading ? (
                      <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)', margin: '0 auto' }} />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const { bg, color, Icon } = getNotifStyle(n.type);
                        return (
                          <div key={n._id} className={`notif-item ${!n.is_read ? 'notif-item-unread' : ''}`}>
                            <div className="notif-icon" style={{ background: bg }}>
                              <Icon style={{ width: '16px', height: '16px', color }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)' }}>{n.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-sub)', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{timeAgo(n.createdAt)}</div>
                            </div>
                            {!n.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-brand)', flexShrink: 0, marginTop: '0.25rem' }} />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

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
          .topbar-search input { width: 200px !important; }
        }
        @media (max-width: 480px) {
          .topbar-search { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default UserLayout;
