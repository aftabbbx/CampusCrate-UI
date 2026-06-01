import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  BookOpen, MessageSquare, Bell, User, Heart,
  LogOut, Search, Menu, X, LayoutDashboard,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const CS = {
  primary: '#FF5C5C',
  primaryHover: '#FF4242',
  primaryPale: '#FFECEC',
  dark: '#242B3D',
  darkHover: '#1A2030',
  bg: '#F6F7FB',
  border: 'rgba(36,43,61,0.07)',
  text: '#242B3D',
  textSub: '#8A94A6',
  danger: '#BA1A1A',
  dangerPale: '#FFDAD6',
};

const UserLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { totalUnreadMessages, unreadNotifications } = useSocket();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const navLinks = [
    { to: '/resources', label: 'Browse' },
    { to: '/add-resource', label: 'Sell' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: CS.bg, fontFamily: "'Poppins', system-ui, sans-serif" }}>

      {/* ═══ NAVBAR — identical to Homepage ════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${CS.border}`,
        boxShadow: scrolled ? '0 4px 20px rgba(15,23,42,0.06)' : '0 1px 3px rgba(15,23,42,0.04)',
        height: 64, transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>

          {/* Left: Logo + Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <img src="/uploads/campuscrate-logo.png" alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain' }} />
              <span style={{ fontWeight: 800, fontSize: 17, color: CS.text, letterSpacing: '-0.01em' }}>CampusCrate</span>
            </Link>

            {/* Desktop nav links */}
            <div style={{ display: 'flex', gap: '1.5rem' }} className="ul-desktop-links">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to}
                  style={{
                    color: window.location.pathname === to ? CS.primary : CS.textSub,
                    fontWeight: window.location.pathname === to ? 700 : 500,
                    fontSize: 15, textDecoration: 'none', transition: 'color 0.2s',
                    borderBottom: window.location.pathname === to ? `2px solid ${CS.primary}` : '2px solid transparent',
                    paddingBottom: 2,
                  }}
                  onMouseEnter={e => { if (window.location.pathname !== to) e.currentTarget.style.color = CS.primary; }}
                  onMouseLeave={e => { if (window.location.pathname !== to) e.currentTarget.style.color = CS.textSub; }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Search + Icons + Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

            {/* Search bar */}
            <div style={{ position: 'relative', display: 'flex' }} className="ul-search">
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <Search style={{ width: 16, height: 16, color: '#777585' }} />
              </span>
              <input
                type="text"
                placeholder="Search campus items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') navigate('/resources'); }}
                style={{
                  background: CS.bg, border: `1px solid ${CS.border}`,
                  borderRadius: 9999, paddingLeft: 38, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                  fontSize: 14, width: 240, outline: 'none', color: CS.text,
                  transition: 'all 0.2s', fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.border = `1px solid ${CS.primary}`; e.target.style.boxShadow = `0 0 0 3px ${CS.primaryPale}`; }}
                onBlur={e => { e.target.style.border = `1px solid ${CS.border}`; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Messages */}
            <Link to="/messages"
              style={{ position: 'relative', display: 'flex', padding: 8, borderRadius: '50%', transition: 'background 0.2s', color: CS.textSub, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = CS.primaryPale}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <MessageSquare style={{ width: 20, height: 20 }} />
              {totalUnreadMessages > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  minWidth: 20, height: 20, borderRadius: 9999,
                  background: '#FF3040', color: '#fff',
                  fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 5px', border: '2.5px solid #fff',
                  lineHeight: 1, fontFamily: 'inherit',
                  boxShadow: '0 1px 4px rgba(255,48,64,0.4)',
                }}>
                  {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <Link to="/notifications"
              style={{ position: 'relative', display: 'flex', padding: 8, borderRadius: '50%', transition: 'background 0.2s', color: CS.textSub, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = CS.primaryPale}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Bell style={{ width: 20, height: 20 }} />
              {unreadNotifications > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  minWidth: 20, height: 20, borderRadius: 9999,
                  background: '#FF3040', color: '#fff',
                  fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 5px', border: '2.5px solid #fff',
                  lineHeight: 1, fontFamily: 'inherit',
                  boxShadow: '0 1px 4px rgba(255,48,64,0.4)',
                }}>
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </Link>

            {/* Avatar dropdown */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ width: 36, height: 36, borderRadius: '50%', background: CS.dark, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                {user?.profile_image
                  ? <img src={user.profile_image} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                  : user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </button>
              {userMenuOpen && (
                <div style={{ position: 'absolute', right: 0, top: 44, background: '#fff', border: '1px solid #E4E1EC', borderRadius: 16, boxShadow: '0 10px 40px rgba(15,23,42,0.12)', padding: '0.5rem', minWidth: 200, zIndex: 100 }}>
                  <div style={{ padding: '0.75rem 1rem 0.5rem', borderBottom: '1px solid #E4E1EC', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: CS.text }}>{user?.name || 'Student'}</div>
                    <div style={{ fontSize: 12, color: CS.textSub, marginTop: 2 }}>{user?.email}</div>
                  </div>
                  {[
                    { to: '/profile', label: 'My Profile', icon: User },
                    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { to: '/wishlist', label: 'Wishlist', icon: Heart },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 1rem', borderRadius: 10, color: CS.text, fontSize: 14, textDecoration: 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = CS.primaryPale}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <item.icon style={{ width: 15, height: 15, color: CS.textSub }} />
                      {item.label}
                    </Link>
                  ))}
                  <button onClick={logout}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 1rem', borderRadius: 10, color: '#BA1A1A', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', width: '100%', transition: 'background 0.15s', fontFamily: 'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFDAD6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <LogOut style={{ width: 15, height: 15 }} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button className="ul-hamburger" onClick={() => setMobileOpen(!mobileOpen)}
              style={{ display: 'none', padding: 8, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: CS.text }}>
              {mobileOpen ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #E4E1EC', padding: '1rem 1.5rem' }}>
            {[
              { to: '/resources', label: 'Browse' },
              { to: '/add-resource', label: 'Sell' },
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/messages', label: 'Messages' },
              { to: '/notifications', label: 'Notifications' },
              { to: '/profile', label: 'Profile' },
            ].map(item => (
              <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '0.75rem 0', color: CS.text, textDecoration: 'none', fontSize: 15, fontWeight: 500, borderBottom: '1px solid #F5F2FD' }}>
                {item.label}
              </Link>
            ))}
            <button onClick={logout}
              style={{ display: 'block', padding: '0.75rem 0', color: '#BA1A1A', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 500, fontFamily: 'inherit', width: '100%', textAlign: 'left', marginTop: 4 }}>
              Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* ═══ PAGE CONTENT ══════════════════════════════════════════════ */}
      <main style={{ paddingTop: 64, minHeight: '100vh' }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .ul-desktop-links { display: none !important; }
          .ul-search { display: none !important; }
          .ul-hamburger { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default UserLayout;
