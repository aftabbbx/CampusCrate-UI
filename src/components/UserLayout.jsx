import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  BookOpen, MessageSquare, Bell, User, Heart,
  LogOut, Search, Menu, X, LayoutDashboard,
  Package, ArrowUpRight, ChevronDown, Shield
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════════════
   Design Tokens — Solidroad Green palette matching Homepage
   ═══════════════════════════════════════════════════════════════════════ */
const DS = {
  primary:     '#215E61',
  primaryHover:'#194A4D',
  primaryPale: '#E6EEEE',
  dark:        '#1D2128',
  darkHover:   'rgba(29,33,40,0.85)',
  bg:          '#F4F2F2',
  card:        '#FFFFFF',
  border:      'rgba(29,33,40,0.09)',
  borderLight: 'rgba(29,33,40,0.06)',
  text:        '#1D2128',
  textSub:     'rgba(29,33,40,0.72)',
  textMuted:   'rgba(29,33,40,0.68)',
  danger:      '#D98212',
  dangerPale:  '#FEE2E2',
  accent:      '#FF9E20',
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

      {/* ═══ NAVBAR — Floating Pill ═══════════════════════════════════════ */}
      <motion.nav
        className="cc-nav-frame"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000,
          padding: scrolled ? "12px 24px" : "18px 24px",
          transition: "padding 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="cc-nav-shell" style={{
          maxWidth: 1260, margin: "0 auto",
          background: "rgba(255,255,255,0.94)",
          borderRadius: 9999,
          border: `1px solid ${DS.border}`,
          backdropFilter: "blur(18px)",
          boxShadow: scrolled
            ? "0 18px 50px rgba(29,33,40,0.12)"
            : "0 10px 32px rgba(29,33,40,0.08)",
          padding: "10px 12px 10px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1), background 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          minHeight: 62,
        }}>

          {/* ── Left: Logo ── */}
          <Link to="/" style={{
            display: "flex", alignItems: "center", gap: 10,
            textDecoration: "none", flexShrink: 0,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 14,
              background: DS.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17,
              boxShadow: "0 10px 24px rgba(255,158,32,0.22)",
            }}>🎓</div>
            <span style={{
              fontFamily: FONT, color: DS.dark, fontWeight: 800,
              fontSize: 19, letterSpacing: 0,
            }}>CampusCrate</span>
          </Link>

          {/* Desktop nav links */}
          <div className="cc-desk-only ul-desktop-links" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[
              { to: "/resources", label: "Browse" },
              { to: "/add-resource", label: "Sell" },
              { to: "/dashboard", label: "Dashboard" },
              { to: "/wishlist", label: "Wishlist" },
            ].map(link => {
              const isActiveLocal = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}>
                  <span style={{
                    fontFamily: FONT, fontSize: 14, fontWeight: isActiveLocal ? 600 : 450,
                    color: isActiveLocal ? DS.dark : DS.textMuted,
                    letterSpacing: 0,
                    padding: "9px 16px",
                    borderRadius: 9999,
                    background: isActiveLocal ? 'rgba(255,158,32,0.12)' : "transparent",
                    display: "inline-block",
                    transition: "all 0.3s ease",
                  }}
                    onMouseEnter={e => { if (!isActiveLocal) { e.target.style.color = DS.dark; e.target.style.background = "rgba(29,33,40,0.04)"; } }}
                    onMouseLeave={e => { if (!isActiveLocal) { e.target.style.color = DS.textMuted; e.target.style.background = "transparent"; } }}
                  >{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* ── Right: Search + Icons + Avatar ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

            {/* Search bar */}
            <div className="ul-search cc-desk-only" style={{ position: 'relative', display: 'flex', marginRight: 8 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <Search style={{ width: 14, height: 14, color: DS.textMuted }} />
              </span>
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') navigate('/resources'); }}
                style={{
                  background: DS.bg, border: `1px solid ${DS.border}`,
                  borderRadius: 9999, paddingLeft: 34, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                  fontSize: 13, width: 180, outline: 'none', color: DS.text,
                  transition: 'all 0.2s', fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.border = `1px solid ${DS.primary}`; e.target.style.boxShadow = `0 0 0 3px ${DS.primaryPale}`; }}
                onBlur={e => { e.target.style.border = `1px solid ${DS.border}`; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Notification icons */}
            <div className="cc-desk-only ul-desktop-links" style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {[
                { to: "/messages", Icon: MessageSquare, count: totalUnreadMessages },
                { to: "/notifications", Icon: Bell, count: unreadNotifications },
              ].map(({ to, Icon, count }) => (
                <Link key={to} to={to}>
                  <div style={{
                    position: "relative", width: 38, height: 38, borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.25s ease",
                    border: `1px solid ${DS.borderLight}`,
                    background: "rgba(255,255,255,0.68)",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = DS.primaryPale; e.currentTarget.style.borderColor = DS.border; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.68)"; e.currentTarget.style.borderColor = DS.borderLight; }}
                  >
                    <Icon size={18} color={DS.textMuted} strokeWidth={1.6} />
                    {count > 0 && (
                      <span style={{
                        position: "absolute", top: 6, right: 6,
                        width: 8, height: 8, borderRadius: "50%",
                        background: DS.accent,
                        border: `2px solid #fff`,
                      }} />
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="cc-desk-only ul-desktop-links" style={{ width: 1, height: 28, background: DS.border, margin: "0 4px" }} />

            {/* Avatar dropdown */}
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="cc-desk-only ul-desktop-links"
                style={{
                  background: userMenuOpen ? "rgba(29,33,40,0.04)" : "transparent",
                  border: `1px solid ${userMenuOpen ? DS.border : "transparent"}`,
                  cursor: "pointer",
                  fontFamily: FONT, fontSize: 13, fontWeight: 500,
                  color: DS.textMuted, padding: "5px 12px 5px 5px",
                  transition: "all 0.25s ease",
                  display: "flex", alignItems: "center", gap: 9,
                  borderRadius: 9999,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(29,33,40,0.04)"; e.currentTarget.style.borderColor = DS.border; }}
                onMouseLeave={e => { if (!userMenuOpen) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
              >
                {user?.profile_image
                  ? <img src={user.profile_image} alt="" style={{
                    width: 30, height: 30, borderRadius: 9999, objectFit: "cover",
                  }} />
                  : <div style={{
                    width: 30, height: 30, borderRadius: 9999,
                    background: DS.primaryPale, color: DS.primary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                  }}>{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
                }
                {user?.name?.split(" ")[0] || "Account"}
                <ChevronDown size={13} color={DS.textMuted} style={{ transition: "transform 0.25s", transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
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
                    ...(user?.role === 'admin' ? [{ to: '/admin/dashboard', label: 'Admin Panel', icon: Shield }] : []),
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
              style={{ display: 'none', padding: 8, borderRadius: 12, background: 'transparent', border: `1px solid ${DS.border}`, cursor: 'pointer', color: DS.text }}>
              {mobileOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ═══ MOBILE MENU OVERLAY ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              position: "fixed", inset: 0, zIndex: 2000,
              background: '#fff',
              display: "flex", flexDirection: "column",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "24px 24px", borderBottom: `1px solid ${DS.border}`,
            }}>
              <span style={{ fontFamily: FONT, color: DS.dark, fontWeight: 800, fontSize: 18 }}>🎓 CampusCrate</span>
              <button onClick={() => setMobileOpen(false)}
                style={{ background: DS.bg, border: "none", color: DS.textMuted, padding: 10, borderRadius: 12, cursor: "pointer" }}
              ><X size={20} /></button>
            </div>
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center", gap: 8,
            }}>
              {[
                { to: "/resources", label: "Browse" },
                { to: "/add-resource", label: "Sell" },
                { to: "/dashboard", label: "Dashboard" },
                { to: "/wishlist", label: "Wishlist" },
                { to: "/messages", label: "Messages" },
                { to: "/notifications", label: "Alerts" },
                { to: "/profile", label: "Profile" },
              ].map((link, i) => (
                <motion.div key={link.to}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 + 0.1 }}
                >
                  <Link to={link.to} onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                    <span style={{
                      fontFamily: FONT, color: DS.textMuted,
                      fontSize: "clamp(24px, 7vw, 36px)", fontWeight: 600,
                      letterSpacing: 0, display: "block",
                      padding: "8px 0", textAlign: "center", transition: "color 0.2s",
                    }}
                      onMouseEnter={e => e.target.style.color = DS.dark}
                      onMouseLeave={e => e.target.style.color = DS.textMuted}
                    >{link.label}</span>
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.5 }} style={{ marginTop: 28 }}>
                <Link to="/add-resource" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: DS.accent, color: '#fff',
                    padding: "14px 36px", borderRadius: 9999,
                    fontSize: 15, fontWeight: 600, fontFamily: FONT,
                  }}>List Item <ArrowUpRight size={14} /></div>
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  style={{ marginTop: 16, background: "none", border: "none", color: DS.textMuted, fontSize: 14, fontFamily: FONT, fontWeight: 500, cursor: "pointer" }}
                >Sign Out</button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
