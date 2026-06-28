import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  BookOpen, MessageSquare, Bell, User, Heart,
  LogOut, Search, Menu, X, LayoutDashboard,
  Package, ArrowUpRight,
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════════════
   Design Tokens — Solidroad Green palette matching Homepage
   ═══════════════════════════════════════════════════════════════════════ */
const DS = {
  primary:     '#47c163',
  primaryHover:'#3aad54',
  primaryPale: '#cbeed3',
  dark:        '#0e220e',
  darkHover:   '#1a3a1a',
  bg:          '#f9f9f9',
  card:        '#FFFFFF',
  border:      '#d3ddd3',
  borderLight: '#e8f0e8',
  text:        '#0e220e',
  textSub:     '#4a5e4a',
  textMuted:   '#8a9a8a',
  danger:      '#e05c3a',
  dangerPale:  '#FEE2E2',
  accent:      '#f6d045',
};

const FONT = "'Inter', system-ui, -apple-system, sans-serif";

const UserLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { totalUnreadMessages, unreadNotifications } = useSocket();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navLinks = [
    { to: '/resources', label: 'Browse', icon: Package },
    { to: '/add-resource', label: 'Sell', icon: ArrowUpRight },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: FONT }}>

      {/* ═══ NAVBAR ════════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${scrolled ? DS.border : 'transparent'}`,
        boxShadow: scrolled ? '0 1px 12px rgba(14,34,14,0.06)' : 'none',
        height: 64, transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>

          {/* Left: Logo + Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: `linear-gradient(135deg, ${DS.accent}, #d4b030)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(246,208,69,0.3)',
                fontSize: 16,
              }}>
                🎓
              </div>
              <span style={{ fontWeight: 800, fontSize: 17, color: DS.text, letterSpacing: '-0.02em' }}>CampusCrate</span>
            </Link>

            {/* Desktop nav links */}
            <div style={{ display: 'flex', gap: '0.25rem' }} className="ul-desktop-links">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to}
                  style={{
                    color: isActive(to) ? DS.primary : DS.textSub,
                    fontWeight: isActive(to) ? 600 : 500,
                    fontSize: 14, textDecoration: 'none', transition: 'all 0.2s',
                    padding: '6px 14px',
                    borderRadius: 8,
                    background: isActive(to) ? DS.primaryPale : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isActive(to)) { e.currentTarget.style.color = DS.primary; e.currentTarget.style.background = DS.primaryPale; } }}
                  onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.color = DS.textSub; e.currentTarget.style.background = 'transparent'; } }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Search + Icons + Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

            {/* Search bar */}
            <div style={{ position: 'relative', display: 'flex' }} className="ul-search">
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <Search style={{ width: 15, height: 15, color: DS.textMuted }} />
              </span>
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') navigate('/resources'); }}
                style={{
                  background: DS.bg, border: `1px solid ${DS.border}`,
                  borderRadius: 9999, paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                  fontSize: 13, width: 220, outline: 'none', color: DS.text,
                  transition: 'all 0.2s', fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.border = `1px solid ${DS.primary}`; e.target.style.boxShadow = `0 0 0 3px ${DS.primaryPale}`; }}
                onBlur={e => { e.target.style.border = `1px solid ${DS.border}`; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Messages */}
            <Link to="/messages"
              style={{ position: 'relative', display: 'flex', padding: 8, borderRadius: '50%', transition: 'all 0.15s', color: DS.textSub, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = DS.primaryPale; e.currentTarget.style.color = DS.primary; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = DS.textSub; }}>
              <MessageSquare style={{ width: 19, height: 19 }} />
              {totalUnreadMessages > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  minWidth: 18, height: 18, borderRadius: 9999,
                  background: DS.danger, color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', border: '2px solid #fff',
                  lineHeight: 1, fontFamily: 'inherit',
                }}>
                  {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <Link to="/notifications"
              style={{ position: 'relative', display: 'flex', padding: 8, borderRadius: '50%', transition: 'all 0.15s', color: DS.textSub, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = DS.primaryPale; e.currentTarget.style.color = DS.primary; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = DS.textSub; }}>
              <Bell style={{ width: 19, height: 19 }} />
              {unreadNotifications > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  minWidth: 18, height: 18, borderRadius: 9999,
                  background: DS.danger, color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', border: '2px solid #fff',
                  lineHeight: 1, fontFamily: 'inherit',
                }}>
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </Link>

            {/* Avatar dropdown */}
            <div ref={userMenuRef} style={{ position: 'relative', marginLeft: 4 }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${DS.primary}, #5fd878)`,
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  transition: 'box-shadow 0.2s',
                  boxShadow: userMenuOpen ? `0 0 0 3px ${DS.primaryPale}` : 'none',
                  overflow: 'hidden',
                }}>
                {user?.profile_image
                  ? <img src={user.profile_image} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                  : user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 46,
                  background: '#fff', border: `1px solid ${DS.border}`,
                  borderRadius: 14, boxShadow: '0 12px 40px rgba(14,34,14,0.12), 0 2px 8px rgba(14,34,14,0.06)',
                  padding: '0.375rem', minWidth: 220, zIndex: 100,
                  animation: 'fadeUp 0.2s ease-out',
                }}>
                  <div style={{ padding: '0.75rem 1rem 0.625rem', borderBottom: `1px solid ${DS.borderLight}`, marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: DS.text }}>{user?.name || 'Student'}</div>
                    <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                  </div>
                  {[
                    { to: '/profile', label: 'My Profile', icon: User },
                    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { to: '/wishlist', label: 'Wishlist', icon: Heart },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 1rem', borderRadius: 10, color: DS.text, fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = DS.primaryPale}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <item.icon style={{ width: 15, height: 15, color: DS.textSub }} />
                      {item.label}
                    </Link>
                  ))}
                  <button onClick={logout}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 1rem', borderRadius: 10, color: DS.danger, fontSize: 14, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', width: '100%', transition: 'background 0.12s', fontFamily: 'inherit', borderTop: `1px solid ${DS.borderLight}`, marginTop: 4, paddingTop: 12 }}
                    onMouseEnter={e => e.currentTarget.style.background = DS.dangerPale}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <LogOut style={{ width: 15, height: 15 }} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button className="ul-hamburger" onClick={() => setMobileOpen(!mobileOpen)}
              style={{ display: 'none', padding: 8, borderRadius: 8, background: 'none', border: `1px solid ${DS.border}`, cursor: 'pointer', color: DS.text }}>
              {mobileOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: '#fff', borderTop: `1px solid ${DS.border}`, padding: '0.75rem 1.5rem 1rem', animation: 'fadeUp 0.25s ease-out' }}>
            {[
              { to: '/resources', label: 'Browse' },
              { to: '/add-resource', label: 'Sell' },
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/messages', label: 'Messages' },
              { to: '/notifications', label: 'Notifications' },
              { to: '/profile', label: 'Profile' },
              { to: '/wishlist', label: 'Wishlist' },
            ].map(item => (
              <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block', padding: '0.75rem 0', color: isActive(item.to) ? DS.primary : DS.text,
                  textDecoration: 'none', fontSize: 15, fontWeight: isActive(item.to) ? 600 : 500,
                  borderBottom: `1px solid ${DS.borderLight}`,
                }}>
                {item.label}
              </Link>
            ))}
            <button onClick={logout}
              style={{ display: 'block', padding: '0.75rem 0', color: DS.danger, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 500, fontFamily: 'inherit', width: '100%', textAlign: 'left', marginTop: 4 }}>
              Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* ═══ PAGE CONTENT ════════════════════════════════════════════════ */}
      <main style={{ paddingTop: 64, minHeight: 'calc(100vh - 320px)' }}>
        {children}
      </main>

      {/* ═══ FOOTER ══════════════════════════════════════════════════════ */}
      <footer style={{
        background: DS.dark, padding: '3.5rem 0 1.5rem', color: 'rgba(255,255,255,0.7)', fontFamily: FONT,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
          {/* Footer grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2.5rem',
            paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
          }} className="ul-footer-grid">
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '-0.02em' }}>🎓 CampusCrate</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', maxWidth: 260 }}>
                The trusted campus marketplace for students. Buy, sell, and exchange textbooks, notes, and more.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Links</h4>
              {[
                { label: 'Browse Resources', to: '/resources' },
                { label: 'Sell an Item', to: '/add-resource' },
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Messages', to: '/messages' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Account */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Account</h4>
              {[
                { label: 'My Profile', to: '/profile' },
                { label: 'Wishlist', to: '/wishlist' },
                { label: 'Notifications', to: '/notifications' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Support */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Support</h4>
              {['Help Center', 'Safety Tips', 'Community Guidelines', 'Contact Us'].map(label => (
                <span key={label} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8, cursor: 'default' }}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', fontSize: 12, color: 'rgba(255,255,255,0.3)' }} className="ul-footer-bottom">
            <span>© {new Date().getFullYear()} CampusCrate. All rights reserved.</span>
            <span>Made with ♥ for students</span>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .ul-desktop-links { display: none !important; }
          .ul-search { display: none !important; }
          .ul-hamburger { display: flex !important; }
          .ul-footer-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .ul-footer-bottom { flex-direction: column !important; gap: 0.5rem !important; text-align: center !important; }
        }
      `}</style>
    </div>
  );
};

export default UserLayout;
