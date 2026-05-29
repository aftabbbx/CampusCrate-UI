import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  BookOpen, Search, Plus, ArrowRight, Users, Shield, Zap,
  Package, MessageSquare, Bell, TrendingUp, Handshake,
  GraduationCap, Globe, MessageCircle, ShoppingBag,
  ChevronRight, Menu, X, User, LogOut,
  MapPin, IndianRupee, AlertTriangle,
  LayoutDashboard, Heart,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Animated Counter ──────────────────────────────────────────────── */
const AnimatedCounter = ({ target, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - t0) / duration, 1);
          setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ── Fade-in on Scroll ─────────────────────────────────────────────── */
const FadeIn = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.06 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`hp-fade ${vis ? 'hp-fade-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   HOMEPAGE COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
const Homepage = () => {
  const { user, isProfileComplete, logout } = useAuth();
  const { totalUnreadMessages, unreadNotifications } = useSocket();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState(new Set());
  const userMenuRef = useRef(null);

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* close user dropdown */
  useEffect(() => {
    const fn = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  /* fetch resources */
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/resource/all');
        if (res.data.success) setAllResources(res.data.resources);
      } catch (err) {
        console.error('Failed to fetch resources', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';

  const categories = [
    { name: 'Book',       icon: '📚', color: '#5B5BD6' },
    { name: 'Notes',      icon: '📝', color: '#5B5BD6' },
    { name: 'Stationery', icon: '✏️', color: '#5B5BD6' },
    { name: 'Project',    icon: '🗂️', color: '#5B5BD6' },
    { name: 'Other',      icon: '📦', color: '#5B5BD6' },
  ];

  const filtered = (() => {
    let items = allResources;
    if (activeCategory !== 'All') {
      items = items.filter(r => r.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(r => r.title?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q));
    }
    return items.slice(0, 8);
  })();

  const toggleWishlist = (id, e) => {
    e.preventDefault();
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const trustFeatures = [
    { icon: 'verified_user', title: 'Verified Users',  desc: 'Trade with confidence. All members are verified using university credentials.', bg: '#FFDCC3', color: '#804300' },
    { icon: 'forum',         title: 'Secure Chat',     desc: 'Communicate safely through our integrated, encrypted messaging system.',        bg: '#E2DFFF', color: '#3533B0' },
    { icon: 'bolt',          title: 'Fast Deals',      desc: 'Find local items and meet on campus for instant, hassle-free exchanges.',        bg: '#DAE2FD', color: '#3F465C' },
    { icon: 'groups',        title: 'Trusted Circle',  desc: 'Join a supportive ecosystem designed specifically for student needs.',            bg: '#E4E1EC', color: '#5B5BD6' },
  ];

  const stats = [
    { label: 'Active Students',   value: 2400,                          suffix: '+', icon: GraduationCap },
    { label: 'Resources Listed',  value: allResources.length || 850,    suffix: '+', icon: Package },
    { label: 'Successful Trades', value: 1200,                          suffix: '+', icon: Handshake },
    { label: 'Campuses',          value: 15,                            suffix: '+', icon: Globe },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif", background: '#F8FAFC', color: '#0F172A', minHeight: '100vh' }}>

      {/* ═══ NAVBAR ════════════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(199,196,214,0.3)',
        boxShadow: scrolled ? '0 4px 20px rgba(15,23,42,0.06)' : '0 1px 3px rgba(15,23,42,0.04)',
        height: 64, transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>

          {/* Left: Logo + Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #5B5BD6, #4338CA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen style={{ width: 16, height: 16, color: '#fff' }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 17, color: '#0F172A', letterSpacing: '-0.01em' }}>CampusCrate</span>
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem' }} className="nav-desktop-links">
              <Link to="/resources" style={{ color: '#5B5BD6', fontWeight: 700, fontSize: 15, borderBottom: '2px solid #5B5BD6', paddingBottom: 2, textDecoration: 'none' }}>Browse</Link>
              <Link to="/add-resource" style={{ color: '#64748B', fontWeight: 500, fontSize: 15, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#5B5BD6'}
                onMouseLeave={e => e.target.style.color = '#64748B'}>Sell</Link>
              <Link to="/dashboard" style={{ color: '#64748B', fontWeight: 500, fontSize: 15, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#5B5BD6'}
                onMouseLeave={e => e.target.style.color = '#64748B'}>Dashboard</Link>
            </div>
          </div>

          {/* Right: Search + Icons + Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', display: 'flex' }} className="nav-search">
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
                  background: '#F5F2FD', border: '1px solid rgba(199,196,214,0.3)',
                  borderRadius: 9999, paddingLeft: 38, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                  fontSize: 14, width: 280, outline: 'none', color: '#0F172A',
                  transition: 'all 0.2s', fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.border = '1px solid #5B5BD6'; e.target.style.boxShadow = '0 0 0 3px rgba(91,91,214,0.15)'; }}
                onBlur={e => { e.target.style.border = '1px solid rgba(199,196,214,0.3)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Messages */}
            <Link to="/messages" style={{ position: 'relative', display: 'flex', padding: 8, borderRadius: '50%', transition: 'background 0.2s', color: '#64748B', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F0ECF7'}
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
            <Link to="/notifications" style={{ position: 'relative', display: 'flex', padding: 8, borderRadius: '50%', transition: 'background 0.2s', color: '#64748B', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F0ECF7'}
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

            {/* Avatar Dropdown */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #5B5BD6, #4338CA)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </button>
              {userMenuOpen && (
                <div style={{ position: 'absolute', right: 0, top: 44, background: '#fff', border: '1px solid #E4E1EC', borderRadius: 16, boxShadow: '0 10px 40px rgba(15,23,42,0.12)', padding: '0.5rem', minWidth: 200, zIndex: 100 }}>
                  <div style={{ padding: '0.75rem 1rem 0.5rem', borderBottom: '1px solid #E4E1EC', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{user?.name || 'Student'}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{user?.email}</div>
                  </div>
                  {[
                    { to: '/profile', label: 'My Profile', icon: User },
                    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { to: '/messages', label: 'Messages', icon: MessageSquare },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 1rem', borderRadius: 10, color: '#0F172A', fontSize: 14, textDecoration: 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F5F2FD'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <item.icon style={{ width: 15, height: 15, color: '#64748B' }} />
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
            <button className="hp-nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)}
              style={{ display: 'none', padding: 8, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#0F172A' }}>
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
                style={{ display: 'block', padding: '0.75rem 0', color: '#0F172A', textDecoration: 'none', fontSize: 15, fontWeight: 500, borderBottom: '1px solid #F5F2FD' }}>
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

      <main style={{ paddingTop: 64 }}>

        {/* ═══ HERO ══════════════════════════════════════════════════════════ */}
        <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #F8F7FF 0%, #EEF2FF 60%, #F0F9FF 100%)', paddingTop: '3.5rem', paddingBottom: '5rem' }}>
          {/* Background decorative orbs */}
          <div style={{ position: 'absolute', top: -96, right: -96, width: 384, height: 384, background: 'rgba(91,91,214,0.05)', borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -96, left: -96, width: 256, height: 256, background: 'rgba(100,116,139,0.05)', borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }} className="hero-grid">
            {/* Text */}
            <div style={{ zIndex: 1 }}>
              <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 9999, background: 'rgba(91,91,214,0.1)', color: '#5B5BD6', fontSize: 13, fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '0.01em' }}>
                University-Exclusive Marketplace
              </span>
              <h1 style={{ fontSize: 'clamp(36px, 4vw, 52px)', lineHeight: 1.1, fontWeight: 800, color: '#0F172A', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                Buy, Sell &amp; Rent <br />
                <span style={{ color: '#5B5BD6' }}>Anything</span> Around You
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: '#64748B', marginBottom: '2rem', maxWidth: 480 }}>
                Discover great deals, connect with trusted people, and find what you need faster.
                The smartest way to trade within your academic community.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/resources')}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#5B5BD6', color: '#fff', padding: '0 1.75rem', height: 48, borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#4338CA'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(91,91,214,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#5B5BD6'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                  Browse Marketplace <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
                <button onClick={() => navigate('/add-resource')}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#0F172A', padding: '0 1.75rem', height: 48, borderRadius: 12, fontSize: 14, fontWeight: 600, border: '1.5px solid #777585', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F5F2FD'; e.currentTarget.style.borderColor = '#5B5BD6'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#777585'; }}>
                  Post Listing
                </button>
              </div>

              {/* Mini stats */}
              {!isProfileComplete && (
                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A', maxWidth: 'fit-content' }}>
                  <AlertTriangle style={{ width: 16, height: 16, color: '#D97706' }} />
                  <span style={{ fontSize: 13, color: '#92400E', fontWeight: 500 }}>Complete your profile to unlock all features.</span>
                  <Link to="/profile" style={{ color: '#5B5BD6', fontWeight: 700, fontSize: 13, textDecoration: 'none', marginLeft: 4 }}>Go →</Link>
                </div>
              )}
            </div>

            {/* Visual — Activity Cards Stack */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
                {/* Big floating card */}
                <div style={{ background: '#fff', borderRadius: 24, padding: '2rem', boxShadow: '0 20px 60px rgba(91,91,214,0.12), 0 4px 16px rgba(15,23,42,0.06)', border: '1px solid rgba(199,196,214,0.4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EEEEFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp style={{ width: 20, height: 20, color: '#5B5BD6' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>Trending Today</div>
                      <div style={{ fontSize: 13, color: '#64748B' }}>{allResources.length || 24} active listings</div>
                    </div>
                    <span style={{ marginLeft: 'auto', padding: '4px 10px', background: '#ECFDF5', color: '#059669', borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>+12%</span>
                  </div>
                  {/* Mini listing previews */}
                  {(allResources.slice(0, 3)).map((r, i) => (
                    <div key={r._id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 0', borderBottom: i < 2 ? '1px solid #F5F2FD' : 'none' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F5F2FD', overflow: 'hidden', flexShrink: 0 }}>
                        {r.image_url ? <img src={r.image_url} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package style={{ width: 18, height: 18, color: '#C1C1FF', margin: '11px auto', display: 'block' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{r.category}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#5B5BD6', whiteSpace: 'nowrap' }}>
                        {r.price > 0 ? `₹${r.price}` : 'Free'}
                      </div>
                    </div>
                  ))}
                  {allResources.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '1rem 0', color: '#64748B', fontSize: 13 }}>Be the first to list something!</div>
                  )}
                </div>

                {/* Small floating badge — community */}
                <div style={{ position: 'absolute', bottom: -16, right: -16, background: '#fff', borderRadius: 16, padding: '0.75rem 1rem', boxShadow: '0 8px 24px rgba(91,91,214,0.15)', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(199,196,214,0.3)' }}>
                  <Users style={{ width: 16, height: 16, color: '#5B5BD6' }} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}><AnimatedCounter target={2400} suffix="+" /></span>
                  <span style={{ fontSize: 12, color: '#64748B' }}>Students</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CATEGORY GRID ═════════════════════════════════════════════════ */}
        <FadeIn>
          <section style={{ padding: '4rem 0', background: '#FCFBFF' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: 30, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.015em' }}>Explore by Category</h2>
                  <p style={{ fontSize: 15, color: '#64748B', marginTop: 4 }}>Find resources shared by your fellow students</p>
                </div>
                <button onClick={() => navigate('/resources')}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5B5BD6', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  View all <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }} className="cat-grid">
                {categories.map((cat, i) => (
                  <FadeIn key={i} delay={i * 60}>
                    <div onClick={() => { setActiveCategory(cat.name); document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                      style={{ background: '#fff', padding: '1.5rem 1rem', borderRadius: 20, boxShadow: '0 2px 8px rgba(15,23,42,0.04)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)', border: activeCategory === cat.name ? '1.5px solid #5B5BD6' : '1.5px solid transparent' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(91,91,214,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.04)'; e.currentTarget.style.transform = 'none'; }}>
                      <div style={{ width: 48, height: 48, background: activeCategory === cat.name ? '#5B5BD6' : '#F5F2FD', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', transition: 'all 0.25s', fontSize: 22 }}>
                        {cat.icon}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{cat.name}</span>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* ═══ FEATURED LISTINGS ══════════════════════════════════════════════ */}
        <FadeIn>
          <section id="listings-section" style={{ padding: '4rem 0', background: '#F8FAFC' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: 30, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.015em' }}>
                  {activeCategory === 'All' ? 'Featured Listings' : activeCategory}
                </h2>
                <p style={{ fontSize: 15, color: '#64748B', marginTop: 4 }}>Top-rated items from verified sellers today</p>
              </div>

              {/* Category filter pills */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {['All', ...categories.map(c => c.name)].map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    style={{ padding: '6px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', border: 'none',
                      background: activeCategory === cat ? '#5B5BD6' : '#F0ECF7',
                      color: activeCategory === cat ? '#fff' : '#64748B' }}
                    onMouseEnter={e => { if (activeCategory !== cat) { e.currentTarget.style.background = '#E2DFFF'; e.currentTarget.style.color = '#5B5BD6'; } }}
                    onMouseLeave={e => { if (activeCategory !== cat) { e.currentTarget.style.background = '#F0ECF7'; e.currentTarget.style.color = '#64748B'; } }}>
                    {cat}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <div style={{ width: 40, height: 40, border: '3px solid #E2DFFF', borderTopColor: '#5B5BD6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <Package style={{ width: 40, height: 40, color: '#C1C1FF', margin: '0 auto 1rem' }} />
                  <p style={{ color: '#64748B', fontSize: 15 }}>No listings in this category yet.</p>
                  <button onClick={() => navigate('/add-resource')}
                    style={{ marginTop: '1rem', padding: '0.625rem 1.5rem', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Post First Listing
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }} className="listings-grid">
                  {filtered.map((r, idx) => (
                    <FadeIn key={r._id} delay={idx * 60}>
                      <Link to={`/resource/${r._id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', border: '1px solid rgba(199,196,214,0.2)' }}
                          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(15,23,42,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.04)'; e.currentTarget.style.transform = 'none'; }}>

                          {/* Image */}
                          <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#F5F2FD' }}>
                            {r.image_url ? (
                              <img src={r.image_url} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                                onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Package style={{ width: 36, height: 36, color: '#C1C1FF' }} />
                              </div>
                            )}
                            {/* Wishlist button */}
                            <button onClick={e => toggleWishlist(r._id, e)}
                              style={{ position: 'absolute', top: 10, right: 10, width: 36, height: 36, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                              <Heart style={{ width: 16, height: 16, color: wishlist.has(r._id) ? '#ef4444' : '#64748B', fill: wishlist.has(r._id) ? '#ef4444' : 'none' }} />
                            </button>
                            {/* Type badge */}
                            <span style={{ position: 'absolute', bottom: 10, left: 10, padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: 'rgba(91,91,214,0.9)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                              {r.type || 'Sell'}
                            </span>
                          </div>

                          {/* Body */}
                          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                              <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', flex: 1, marginRight: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</h3>
                              <span style={{ fontWeight: 700, fontSize: 15, color: '#5B5BD6', whiteSpace: 'nowrap' }}>
                                {r.price > 0 ? <><IndianRupee style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle' }} />{r.price}</> : 'Free'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748B', marginBottom: '0.875rem' }}>
                              <MapPin style={{ width: 13, height: 13 }} />
                              <span style={{ fontSize: 12 }}>{r.location || 'Campus'}</span>
                            </div>

                            {/* Seller row */}
                            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(199,196,214,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #E2DFFF, #C1C1FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#3533B0', flexShrink: 0 }}>
                                  {r.seller?.name?.charAt(0)?.toUpperCase() || r.seller?.charAt(0)?.toUpperCase() || 'S'}
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{(typeof r.seller === 'string' ? r.seller : r.seller?.name) || 'Seller'}</span>
                              </div>
                              <span style={{ padding: '5px 12px', background: 'rgba(91,91,214,0.08)', color: '#5B5BD6', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#5B5BD6'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(91,91,214,0.08)'; e.currentTarget.style.color = '#5B5BD6'; }}>
                                Contact
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </FadeIn>
                  ))}
                </div>
              )}

              {filtered.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                  <button onClick={() => navigate('/resources')}
                    style={{ padding: '0.75rem 2.5rem', border: '1.5px solid #5B5BD6', color: '#5B5BD6', background: 'transparent', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#5B5BD6'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5B5BD6'; }}>
                    View All Listings →
                  </button>
                </div>
              )}
            </div>
          </section>
        </FadeIn>

        {/* ═══ TRUST / FEATURES SECTION ════════════════════════════════════ */}
        <FadeIn>
          <section style={{ padding: '5rem 0', background: 'rgba(245,242,253,0.5)' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: 30, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.015em' }}>Safe &amp; Seamless Marketplace</h2>
                <p style={{ fontSize: 15, color: '#64748B', marginTop: 8, maxWidth: 560, margin: '8px auto 0' }}>
                  We prioritize your security and convenience, ensuring every transaction is as smooth as possible within your trusted community.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }} className="trust-grid">
                {trustFeatures.map((f, i) => (
                  <FadeIn key={i} delay={i * 80}>
                    <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 20, boxShadow: '0 2px 8px rgba(15,23,42,0.04)', transition: 'all 0.25s', border: '1px solid rgba(199,196,214,0.2)' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(91,91,214,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.04)'; e.currentTarget.style.transform = 'none'; }}>
                      <div style={{ width: 48, height: 48, background: f.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                        <span className="material-symbols-outlined" style={{ color: f.color, fontSize: 22 }}>{f.icon}</span>
                      </div>
                      <h4 style={{ fontWeight: 700, fontSize: 16, color: '#0F172A', marginBottom: 8 }}>{f.title}</h4>
                      <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>{f.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* ═══ STATS STRIP ══════════════════════════════════════════════════ */}
        <FadeIn>
          <section style={{ padding: '3rem 0', background: '#FCFBFF', borderTop: '1px solid rgba(199,196,214,0.2)', borderBottom: '1px solid rgba(199,196,214,0.2)' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }} className="stats-grid">
              {stats.map((s, i) => (
                <FadeIn key={i} delay={i * 80}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#5B5BD6', letterSpacing: '-0.02em' }}>
                      <AnimatedCounter target={s.value} suffix={s.suffix} />
                    </div>
                    <div style={{ fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* ═══ CTA BANNER ═══════════════════════════════════════════════════ */}
        <FadeIn>
          <section style={{ padding: '4rem 0' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
              <div style={{ position: 'relative', background: '#5B5BD6', borderRadius: 28, padding: '3.5rem', overflow: 'hidden', boxShadow: '0 24px 64px rgba(91,91,214,0.25)' }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', transform: 'translate(50%, -50%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 192, height: 192, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', transform: 'translate(-50%, 50%)' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ maxWidth: 520 }}>
                    <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                      Ready to de-clutter<br />your dorm?
                    </h2>
                    <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: '2rem' }}>
                      Post your first listing in under 2 minutes and start earning or find your next great campus deal.
                    </p>
                    <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                      <button onClick={() => navigate('/add-resource')}
                        style={{ padding: '0 2rem', height: 52, background: '#fff', color: '#5B5BD6', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                        Start Selling
                      </button>
                      <button onClick={() => navigate('/resources')}
                        style={{ padding: '0 2rem', height: 52, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', backdropFilter: 'blur(8px)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>
                        Explore Listings
                      </button>
                    </div>
                  </div>
                  {/* Decorative icon */}
                  <div style={{ color: 'rgba(255,255,255,0.08)', display: 'flex' }}>
                    <ShoppingBag style={{ width: 160, height: 160 }} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

      </main>

      {/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#1E1B2E', color: '#A0A0BC', padding: '3rem 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #5B5BD6, #C1C1FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen style={{ width: 14, height: 14, color: '#fff' }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>CampusCrate</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 340, marginBottom: '1.5rem' }}>
                The premium student-to-student marketplace designed for trust, safety, and local efficiency.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['public', 'share', 'mail'].map(icon => (
                  <a key={icon} href="#" onClick={e => e.preventDefault()}
                    style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0A0BC', transition: 'all 0.2s', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#5B5BD6'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#A0A0BC'; }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h5 style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: '1.25rem', letterSpacing: '0.02em' }}>Marketplace</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[{ to: '/resources', label: 'Browse All' }, { to: '/resources', label: 'Categories' }, { to: '/resources', label: 'Best Deals' }, { to: '/', label: 'Safety Guide' }].map(item => (
                  <li key={item.label}>
                    <Link to={item.to} style={{ color: '#A0A0BC', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = '#A0A0BC'}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: '1.25rem', letterSpacing: '0.02em' }}>Account</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[{ to: '/profile', label: 'Profile' }, { to: '/dashboard', label: 'Dashboard' }, { to: '/messages', label: 'Messages' }, { to: '/notifications', label: 'Notifications' }].map(item => (
                  <li key={item.label}>
                    <Link to={item.to} style={{ color: '#A0A0BC', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = '#A0A0BC'}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ paddingTop: '1.75rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ fontSize: 13, opacity: 0.5 }}>© {new Date().getFullYear()} CampusCrate. Built for the academic community.</p>
            <p style={{ fontSize: 13, opacity: 0.5 }}>Made with ❤️ for students, by students.</p>
          </div>
        </div>
      </footer>

      {/* Material Symbols for icons in trust section */}
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .hp-fade { opacity: 0; transform: translateY(16px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .hp-fade.hp-fade-in { opacity: 1; transform: translateY(0); }

        @media (max-width: 1024px) {
          .listings-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .trust-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cat-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-grid > div:last-child { display: none; }
          .nav-desktop-links { display: none !important; }
          .nav-search { display: none !important; }
          .hp-nav-hamburger { display: flex !important; }
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .listings-grid { grid-template-columns: 1fr !important; }
          .trust-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .trust-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Homepage;
