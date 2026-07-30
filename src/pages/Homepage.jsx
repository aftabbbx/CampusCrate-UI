/**
 * CampusCrate — Homepage  (Premium Editorial Redesign)
 *
 * Visual: Premium YC-funded startup aesthetic. Minimal, warm, editorial.
 * Typography: Inter
 * Palette: Color Hunt #FF9E20 / #215E61 / #1D2128 / #F4F2F2
 *
 * STRICT: No functionality changed. All APIs, routing, auth,
 * state, contexts preserved 1:1. Only visual layer redesigned.
 */

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  motion, AnimatePresence, useScroll, useTransform,
  useSpring, useMotionValue, useInView,
} from "framer-motion";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useWishlist } from "../context/WishlistContext";
import {
  Search, ArrowRight, ArrowUpRight, Users, Package, MessageSquare, Bell,
  TrendingUp, GraduationCap, ShoppingBag, ChevronRight,
  ChevronDown, Menu, X, User, LogOut, MapPin, IndianRupee, AlertTriangle,
  LayoutDashboard, Heart, Star, Sparkles, Shield, Zap, Handshake,
  Crown, Award, Mail, BookOpen, PenTool, Briefcase,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Typography ────────────────────────────────────────────────────────────── */
const FONT = "'Inter', system-ui, -apple-system, sans-serif";

/* ─── Hero Background ──────────────────────────────────────────────────────── */
const HERO_IMAGE = "/uploads/gC984JO2A2ifns4lUyrBlRxl6w.jpg";
const HERO_VIDEO = "/uploads/Firefly Cinematic premium brand film for a modern student marketplace platform.__Opening shot- Extre.mp4";

/* ─── Official Design Tokens ──────────────────────────────────────────────── */
const T = {
  bg: "#F4F2F2",
  surface: "#FFFFFF",
  surfaceAlt: "#E6EEEE",
  primary: "#1D2128",
  accent: "#FF9E20",
  accentLt: "rgba(255,158,32,0.14)",
  accentDk: "#D98212",
  green: "#215E61",
  greenDk: "#194A4D",
  greenLt: "rgba(33,94,97,0.18)",
  text: "#1D2128",
  textSub: "rgba(29,33,40,0.72)",
  textMuted: "rgba(29,33,40,0.68)",
  border: "rgba(29,33,40,0.09)",
  borderLt: "rgba(29,33,40,0.06)",
  danger: "#D98212",
  paleMint: "#E6EEEE",
  paleTeal: "#DDEAEA",
  paleYellow: "rgba(255,158,32,0.12)",
  white: "#FFFFFF",
  black: "#1D2128",
};

const EASE = [0.22, 1, 0.36, 1];

/* ─── Global Styles ────────────────────────────────────────────────────────── */
const GlobalStyle = () => {
  useEffect(() => {
    const id = "cc-global-style";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body {
        font-family: ${FONT};
        background: #F4F2F2;
        color: #1D2128;
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
        margin: 0;
      }

      ::selection { background: rgba(255,158,32,0.28); color: #1D2128; }

      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: #F4F2F2; }
      ::-webkit-scrollbar-thumb { background: rgba(33,94,97,0.46); border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: #215E61; }

      @keyframes cc-spin { to { transform: rotate(360deg); } }
      .cc-spinner {
        width: 28px; height: 28px;
        border: 2.5px solid rgba(29,33,40,0.08);
        border-top-color: #215E61;
        border-radius: 50%;
        animation: cc-spin 0.8s linear infinite;
      }

      @keyframes hero-zoom {
        0% { transform: scale(1); }
        100% { transform: scale(1.06); }
      }

      a { text-decoration: none; color: inherit; }
      button, input { font-family: ${FONT}; }
      button { -webkit-tap-highlight-color: transparent; }
      img, video { max-width: 100%; }

      @media (min-width: 769px) { .cc-mob-only { display: none !important; } }
      @media (max-width: 768px) { .cc-desk-only { display: none !important; } }

      @media (max-width: 1180px) {
        .cc-hero-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      }

      @media (max-width: 900px) {
        .cc-grid-2 { grid-template-columns: 1fr !important; }
        .cc-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
        .cc-footer-grid { grid-template-columns: 1fr !important; }
        .cc-trust-layout { grid-template-columns: 1fr !important; }
        .cc-cat-layout { grid-template-columns: 1fr !important; }
        .cc-how-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .cc-test-grid { grid-template-columns: 1fr !important; }
        .cc-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .cc-nav-shell { padding: 8px 14px !important; }
        .cc-hero-section { min-height: auto !important; padding: 116px 0 40px !important; }
        .cc-hero-copy { padding-top: 0 !important; }
        .cc-hero-stats-shell {
          position: relative !important;
          padding: 34px 20px 0 !important;
        }
        .cc-listing-filters {
          width: 100% !important;
          overflow-x: auto !important;
          justify-content: flex-start !important;
          scrollbar-width: none;
        }
        .cc-listing-filters::-webkit-scrollbar { display: none; }
        .cc-trust-cards { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 600px) {
        .cc-nav-frame { padding: 10px 14px !important; }
        .cc-grid-4 { grid-template-columns: 1fr !important; }
        .cc-hero-stats-grid { grid-template-columns: 1fr !important; }
        .cc-cat-pills { flex-wrap: wrap !important; }
        .cc-hero-input { width: 100% !important; flex-direction: column !important; }
        .cc-hero-input > div { width: 100% !important; }
        .cc-hero-input input { border-radius: 12px !important; }
        .cc-hero-input button { border-radius: 12px !important; width: 100% !important; }
        .cc-trust-cards { grid-template-columns: 1fr !important; }
        .cc-how-grid { grid-template-columns: 1fr !important; }
        .cc-stats-grid { grid-template-columns: 1fr !important; }
        .cc-hero-heading { font-size: 2.35rem !important; line-height: 1.08 !important; letter-spacing: 0 !important; }
      }
    `;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
};

/* ─── Animated Counter ────────────────────────────────────────────────────── */
const Counter = ({ target, suffix = "", decimals = 0, duration = 2 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(+(eased * target).toFixed(decimals));
      if (p < 1) requestAnimationFrame(tick); else setVal(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration, decimals]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
};

/* ─── Scroll Reveal ─────────────────────────────────────────────────────────── */
const Reveal = ({ children, delay = 0, y = 30, style, className }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} style={style} className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >{children}</motion.div>
  );
};

/* ─── Type Badge ────────────────────────────────────────────────────────────── */
const typeBadge = (type) => {
  if (type === "Free") return { bg: T.paleMint, color: T.greenDk, label: "Free" };
  if (type === "Exchange") return { bg: T.paleTeal, color: T.green, label: "Exchange" };
  return { bg: T.paleYellow, color: T.accentDk, label: type || "Sell" };
};

/* ═══════════════════════════════════════════════════════════════════════════════
   HOMEPAGE
   ═══════════════════════════════════════════════════════════════════════════════ */
const Homepage = () => {
  const { user, isProfileComplete, logout } = useAuth();
  const { totalUnreadMessages, unreadNotifications } = useSocket();
  const { isWishlisted, toggleWishlist: ctxToggle } = useWishlist();
  const navigate = useNavigate();

  const [activeCat, setActiveCat] = useState("All");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const userMenuRef = useRef(null);

  const { scrollY } = useScroll();
  useEffect(() => scrollY.on("change", v => setScrolled(v > 20)), [scrollY]);

  useEffect(() => {
    const fn = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/resource/all");
        if (res.data.success) setAllResources(res.data.resources);
      } catch (err) { console.error("Failed to fetch resources", err); }
      finally { setLoading(false); }
    })();
  }, []);

  const categories = [
    { name: "Book", icon: "📚" },
    { name: "Notes", icon: "📝" },
    { name: "Stationery", icon: "✏️" },
    { name: "Project", icon: "🗂️" },
    { name: "Other", icon: "📦" },
  ];

  const filtered = useMemo(() => {
    let items = allResources;
    if (activeCat !== "All") items = items.filter(r => r.category === activeCat);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      items = items.filter(r =>
        r.title?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q)
      );
    }
    return items.slice(0, 8);
  }, [allResources, activeCat, searchQ]);

  const toggleWishlist = (id, e) => { e.preventDefault(); e.stopPropagation(); ctxToggle(id); };

  const trustFeatures = [
    { icon: Shield, title: "Verified Users", desc: "All members verified with university credentials.", color: T.green },
    { icon: MessageSquare, title: "Secure Chat", desc: "Encrypted messaging built into the platform.", color: T.accent },
    { icon: Zap, title: "Fast Deals", desc: "Meet on campus for instant, hassle-free exchanges.", color: T.danger },
    { icon: Handshake, title: "Trusted Circle", desc: "A student ecosystem built on mutual trust.", color: T.primary },
  ];

  const heroStats = [
    { value: "2,400+", label: "Students Active" },
    { value: `${allResources.length || 850}+`, label: "Resources Listed" },
    { value: "15+", label: "Campuses Covered" },
  ];

  const navLinks = [
    { to: "/resources", label: "Browse" },
    { to: "/add-resource", label: "Sell" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/wishlist", label: "Wishlist" },
  ];

  const howItWorks = [
    { step: "01", title: "Sign Up", desc: "Create your free student account with your university email.", icon: User },
    { step: "02", title: "List or Browse", desc: "Post items you want to sell or discover amazing deals.", icon: Package },
    { step: "03", title: "Connect", desc: "Message sellers securely and arrange meetups on campus.", icon: MessageSquare },
    { step: "04", title: "Exchange", desc: "Meet up and complete your trade safely and easily.", icon: Handshake },
  ];

  const testimonials = [
    { name: "Aisha Patel", uni: "Delhi University", quote: "CampusCrate helped me save over ₹3,000 on textbooks this semester. The verified student community makes everything feel safe.", rating: 5, avatar: "AP" },
    { name: "Rohan Sharma", uni: "IIT Bombay", quote: "I sold my old engineering notes in under 24 hours. The messaging system is super smooth and the community is amazing.", rating: 5, avatar: "RS" },
    { name: "Priya Nair", uni: "Christ University", quote: "Best campus marketplace I've ever used. The category filters and wishlist feature make browsing so convenient.", rating: 5, avatar: "PN" },
  ];

  const statsData = [
    { value: 2400, suffix: "+", label: "Students", icon: Users },
    { value: 1200, suffix: "+", label: "Books", icon: BookOpen },
    { value: allResources.length || 850, suffix: "+", label: "Listings", icon: Package },
    { value: 3400, suffix: "+", label: "Transactions", icon: TrendingUp },
    { value: 15, suffix: "+", label: "Universities", icon: GraduationCap },
  ];

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <>
      <GlobalStyle />

      {/* ═══ NAVBAR — Floating Pill ═══════════════════════════════════════ */}
      <motion.nav
        className="cc-nav-frame"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
          border: `1px solid ${T.border}`,
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
              background: T.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17,
              boxShadow: "0 10px 24px rgba(255,158,32,0.22)",
            }}>🎓</div>
            <span style={{
              fontFamily: FONT, color: T.primary, fontWeight: 800,
              fontSize: 19, letterSpacing: 0,
            }}>CampusCrate</span>
          </Link>

          {/* Desktop nav links */}
          <div className="cc-desk-only" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {navLinks.map(link => {
              const isActive = window.location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}>
                  <span style={{
                    fontFamily: FONT, fontSize: 14, fontWeight: isActive ? 600 : 450,
                    color: isActive ? T.primary : T.textMuted,
                    letterSpacing: 0,
                    padding: "9px 16px",
                    borderRadius: 9999,
                    background: isActive ? T.paleYellow : "transparent",
                    display: "inline-block",
                    transition: "all 0.3s ease",
                  }}
                    onMouseEnter={e => { if (!isActive) { e.target.style.color = T.primary; e.target.style.background = "rgba(29,33,40,0.04)"; } }}
                    onMouseLeave={e => { if (!isActive) { e.target.style.color = T.textMuted; e.target.style.background = "transparent"; } }}
                  >{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* ── Right: Icons + Avatar + CTA ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

            {/* Notification icons */}
            <div className="cc-desk-only" style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {[
                { to: "/messages", Icon: MessageSquare, count: totalUnreadMessages },
                { to: "/notifications", Icon: Bell, count: unreadNotifications },
              ].map(({ to, Icon, count }) => (
                <Link key={to} to={to}>
                  <div style={{
                    position: "relative", width: 38, height: 38, borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.25s ease",
                    border: `1px solid ${T.borderLt}`,
                    background: "rgba(255,255,255,0.68)",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.paleMint; e.currentTarget.style.borderColor = T.border; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.68)"; e.currentTarget.style.borderColor = T.borderLt; }}
                  >
                    <Icon size={18} color={T.textMuted} strokeWidth={1.6} />
                    {count > 0 && (
                      <span style={{
                        position: "absolute", top: 6, right: 6,
                        width: 8, height: 8, borderRadius: "50%",
                        background: T.accent,
                        border: `2px solid ${T.white}`,
                      }} />
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="cc-desk-only" style={{ width: 1, height: 28, background: T.border, margin: "0 8px" }} />

            {/* Avatar dropdown */}
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="cc-desk-only"
                style={{
                  background: userMenuOpen ? "rgba(29,33,40,0.04)" : "transparent",
                  border: `1px solid ${userMenuOpen ? T.border : "transparent"}`,
                  cursor: "pointer",
                  fontFamily: FONT, fontSize: 13, fontWeight: 500,
                  color: T.textMuted, padding: "5px 12px 5px 5px",
                  transition: "all 0.25s ease",
                  display: "flex", alignItems: "center", gap: 9,
                  borderRadius: 9999,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(29,33,40,0.04)"; e.currentTarget.style.borderColor = T.border; }}
                onMouseLeave={e => { if (!userMenuOpen) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
              >
                {user?.profile_image
                  ? <img src={user.profile_image} alt="" style={{
                    width: 30, height: 30, borderRadius: 9999, objectFit: "cover",
                  }} />
                  : <div style={{
                    width: 30, height: 30, borderRadius: 9999,
                    background: T.paleMint, color: T.green,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                  }}>{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
                }
                {user?.name?.split(" ")[0] || "Account"}
                <ChevronDown size={13} color={T.textMuted} style={{ transition: "transform 0.25s", transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: "absolute", top: "calc(100% + 12px)", right: 0,
                      background: T.white,
                      border: `1px solid ${T.border}`,
                      borderRadius: 16, overflow: "hidden",
                      boxShadow: "0 20px 60px rgba(29,33,40,0.14)",
                      minWidth: 240, zIndex: 100,
                    }}
                  >
                    <div style={{
                      padding: "16px 18px",
                      borderBottom: `1px solid ${T.borderLt}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12,
                          background: T.paleMint,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 15, fontWeight: 700, color: T.green, fontFamily: FONT,
                          overflow: "hidden", flexShrink: 0,
                        }}>
                          {user?.profile_image
                            ? <img src={user.profile_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: T.primary }}>{user?.name || "Student"}</div>
                          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{user?.email}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: "6px" }}>
                      {[
                        { to: "/profile", label: "My Profile", Icon: User },
                        { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
                        { to: "/wishlist", label: "Wishlist", Icon: Heart },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "10px 14px", fontSize: 14, fontWeight: 500,
                            color: T.textMuted, transition: "all 0.2s",
                            borderRadius: 10,
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.paleMint; e.currentTarget.style.color = T.primary; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}
                          ><item.Icon size={16} strokeWidth={1.5} color={T.green} />{item.label}</div>
                        </Link>
                      ))}
                    </div>
                    <div style={{ padding: "4px 6px 6px", borderTop: `1px solid ${T.borderLt}` }}>
                      <button onClick={logout} style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 14px", fontSize: 14, fontWeight: 500,
                        color: T.danger, background: "none", border: "none",
                        cursor: "pointer", transition: "all 0.2s",
                        borderRadius: 10, fontFamily: FONT,
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(217,130,18,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      ><LogOut size={16} strokeWidth={1.5} /> Sign Out</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Orange CTA */}
            <Link to="/add-resource" className="cc-desk-only">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: T.accent,
                color: T.white,
                padding: "12px 24px", borderRadius: 9999,
                fontSize: 13, fontWeight: 700, fontFamily: FONT,
                transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                letterSpacing: 0,
                border: "none",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = T.accentDk; e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,158,32,0.28)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = T.accent; e.currentTarget.style.boxShadow = "none"; }}
              >
                List Item <ArrowRight size={14} />
              </div>
            </Link>

            {/* Hamburger */}
            <button
              className="cc-mob-only"
              onClick={() => setMobileOpen(true)}
              style={{
                background: "rgba(29,33,40,0.04)",
                border: `1px solid ${T.border}`,
                padding: 10, borderRadius: 10,
                display: "flex", flexDirection: "column", gap: 4,
                cursor: "pointer", transition: "all 0.25s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(29,33,40,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(29,33,40,0.04)"}
            >
              <div style={{ width: 18, height: 2, background: T.primary, borderRadius: 1 }} />
              <div style={{ width: 18, height: 2, background: T.primary, borderRadius: 1 }} />
              <div style={{ width: 12, height: 2, background: T.textMuted, borderRadius: 1 }} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ═══ HERO — Cinematic image bg + editorial text ═══════════════════ */}
      <section className="cc-hero-section" style={{
        position: "relative", width: "100%",
        minHeight: "100svh",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "112px 0 190px",
        background: T.bg,
      }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={HERO_IMAGE}
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", pointerEvents: "none",
            filter: "saturate(1.05) contrast(1.02) brightness(0.96)",
          }}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <img
          src={HERO_IMAGE}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", pointerEvents: "none",
            opacity: 0.06,
            animation: "hero-zoom 28s ease-in-out infinite alternate",
          }}
        />

        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(120deg, rgba(244,242,242,0.70) 0%, rgba(244,242,242,0.38) 46%, rgba(33,94,97,0.18) 100%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(244,242,242,0.04) 0%, rgba(244,242,242,0.16) 58%, rgba(244,242,242,0.94) 100%)",
          pointerEvents: "none",
        }} />

        <div className="cc-hero-copy" style={{
          position: "relative", zIndex: 10,
          textAlign: "center",
          padding: "36px clamp(24px, 6vw, 80px) 0",
          maxWidth: 1000,
        }}>
          <motion.h1
            className="cc-hero-heading"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            style={{
              fontFamily: FONT,
              fontSize: "clamp(46px, 8vw, 88px)",
              lineHeight: 0.98,
              letterSpacing: 0,
              fontWeight: 800,
              color: T.primary,
              marginBottom: 24,
              textWrap: "balance",
            }}
          >
            Buy, sell & exchange{"\n"}campus resources
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
            style={{
              fontFamily: FONT,
              color: T.textMuted,
              fontSize: "clamp(17px, 2vw, 21px)",
              lineHeight: 1.65, maxWidth: 620,
              margin: "0 auto 34px",
              fontWeight: 400,
              letterSpacing: 0,
              textWrap: "balance",
            }}
          >
            Join thousands of verified students trading textbooks, notes, and essentials on the most trusted campus marketplace.
          </motion.p>

          {!isProfileComplete && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                marginBottom: 20, display: "inline-flex", alignItems: "center",
                gap: 8, padding: "10px 18px", borderRadius: 9999,
                background: "rgba(255,255,255,0.84)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,158,32,0.24)",
                fontSize: 13, color: T.primary, fontWeight: 500,
                boxShadow: "0 12px 36px rgba(29,33,40,0.08)",
              }}
            >
              <AlertTriangle size={14} color={T.accent} />
              Complete your profile
              <Link to="/profile" style={{ color: T.accent, fontWeight: 700 }}>Go →</Link>
            </motion.div>
          )}

          {/* Search / CTA Input Bar */}
          <motion.div
            className="cc-hero-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            style={{
              display: "inline-flex", alignItems: "center",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: 9999, padding: 7,
              boxShadow: searchFocused
                ? "0 20px 60px rgba(29,33,40,0.14), 0 0 0 5px rgba(33,94,97,0.18)"
                : "0 18px 56px rgba(29,33,40,0.12), 0 2px 10px rgba(29,33,40,0.05)",
              maxWidth: 590, width: "100%",
              border: `1px solid ${searchFocused ? T.green : T.border}`,
              transition: "all 0.28s ease",
            }}
          >
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 10,
              padding: "0 16px",
            }}>
              <Search size={18} color={T.textMuted} strokeWidth={1.8} />
              <input
                type="text"
                placeholder="Search textbooks, notes, projects..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={e => { if (e.key === "Enter") navigate("/resources"); }}
                style={{
                  border: "none", outline: "none", background: "transparent",
                  flex: 1, fontFamily: FONT, fontSize: 15, fontWeight: 400,
                  color: T.primary, padding: "12px 0",
                  letterSpacing: 0,
                }}
              />
            </div>
            <button
              onClick={() => navigate("/resources")}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: T.accent, color: T.white,
                padding: "14px 28px", borderRadius: 9999,
                fontSize: 14, fontWeight: 600, fontFamily: FONT,
                border: "none", cursor: "pointer",
                transition: "all 0.25s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.accentDk}
              onMouseLeave={e => e.currentTarget.style.background = T.accent}
            >
              Explore <ArrowRight size={14} />
            </button>
          </motion.div>

          {/* Primary & Secondary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginTop: 30 }}
          >
            <button onClick={() => navigate("/resources")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: T.accent, color: T.white,
                padding: "14px 32px", borderRadius: 9999,
                fontSize: 15, fontWeight: 700, fontFamily: FONT,
                border: "none", cursor: "pointer",
                transition: "all 0.3s ease",
                letterSpacing: 0,
                boxShadow: "0 16px 34px rgba(255,158,32,0.22)",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; e.currentTarget.style.background = T.accentDk; e.currentTarget.style.boxShadow = "0 18px 38px rgba(255,158,32,0.28)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.background = T.accent; e.currentTarget.style.boxShadow = "0 16px 34px rgba(255,158,32,0.22)"; }}
            >Explore Marketplace <ArrowRight size={15} /></button>
            <button onClick={() => navigate("/add-resource")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: T.white, color: T.primary,
                border: `1.5px solid ${T.border}`,
                padding: "14px 32px", borderRadius: 9999,
                fontSize: 15, fontWeight: 600, fontFamily: FONT,
                transition: "all 0.3s ease", cursor: "pointer",
                boxShadow: "0 12px 34px rgba(29,33,40,0.08)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.paleMint; e.currentTarget.style.borderColor = T.green; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.white; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
            >Sell Your Item <ArrowUpRight size={15} /></button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 32 }}
          >
            {[
              { icon: Shield, text: "Verified Students" },
              { icon: MessageSquare, text: "Secure Messaging" },
              { icon: Users, text: "Campus Community" },
            ].map((badge, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.72)",
                border: `1px solid ${T.border}`,
                borderRadius: 9999,
                padding: "8px 13px",
                boxShadow: "0 10px 28px rgba(29,33,40,0.07)",
              }}>
                <badge.icon size={16} color={T.green} strokeWidth={1.8} />
                <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 500 }}>{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating Stats at bottom of hero */}
        <motion.div
          className="cc-hero-stats-shell"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            zIndex: 10,
            padding: "48px clamp(20px, 4vw, 60px) 30px",
          }}
        >
          <div style={{
            maxWidth: 1120, margin: "0 auto",
            display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14,
          }} className="cc-grid-4 cc-hero-stats-grid">
            {[
              { value: "2,400+", label: "Students Active", icon: GraduationCap },
              { value: `${allResources.length || 850}+`, label: "Resources Listed", icon: Package },
              { value: "1,200+", label: "Successful Trades", icon: Handshake },
              { value: "15+", label: "Campuses", icon: MapPin },
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <motion.div key={i}
                  whileHover={{ y: -4 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "20px 22px",
                    borderRadius: 22,
                    background: "rgba(255,255,255,0.9)",
                    border: `1px solid ${T.border}`,
                    backdropFilter: "blur(18px)",
                    boxShadow: "0 18px 48px rgba(29,33,40,0.10)",
                    transition: "all 0.3s ease",
                    cursor: "default",
                  }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: 14,
                    background: T.paleMint,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={20} color={T.green} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{
                      fontFamily: FONT, fontSize: 22, fontWeight: 800,
                      color: T.primary, letterSpacing: 0, lineHeight: 1.2,
                    }}>{st.value}</div>
                    <div style={{
                      fontSize: 13, color: T.textMuted,
                      fontWeight: 500, marginTop: 2,
                    }}>{st.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ═══ PROFILE BANNER (if incomplete) ══════════════════════════════ */}
      {user && !isProfileComplete && (
        <section style={{ padding: "0 clamp(20px, 3vw, 40px)", marginTop: "-2rem", position: "relative", zIndex: 20 }}>
          <div style={{
            maxWidth: 1180, margin: "0 auto",
            background: "rgba(255,255,255,0.96)", border: `1px solid ${T.border}`, borderRadius: 22, padding: "1.25rem 1.5rem",
            display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            boxShadow: "0 18px 48px rgba(48,56,65,0.10)",
            backdropFilter: "blur(16px)",
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: T.paleMint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={20} color={T.green} />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: T.primary, fontFamily: FONT }}>Complete Your Profile</div>
              <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>Fill in your details to unlock messaging & listings.</div>
            </div>
            <button onClick={() => navigate("/profile")} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: T.accent, color: T.white, border: "none",
              padding: "10px 24px", borderRadius: 9999, fontSize: 13, fontWeight: 600,
              fontFamily: FONT, cursor: "pointer", transition: "all 0.25s",
            }}>Complete Profile <ArrowRight size={14} /></button>
          </div>
        </section>
      )}


      {/* ═══ MAIN CONTENT ════════════════════════════════════════════════ */}
      <main style={{ background: T.bg }}>

        {/* ── CATEGORIES ─────────────────────── */}
        <section style={{ padding: "clamp(5rem, 9vw, 8rem) clamp(20px, 3vw, 40px) clamp(3rem, 5vw, 5rem)" }}>
          <div className="cc-cat-layout" style={{
            maxWidth: 1240, margin: "0 auto",
            display: "grid", gridTemplateColumns: "0.85fr 1.35fr", gap: "clamp(2rem, 5vw, 5rem)", alignItems: "center",
          }}>
            <Reveal>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 36, background: T.paleMint, marginBottom: 20 }}>
                  <BookOpen size={14} color={T.green} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.green, letterSpacing: 0, textTransform: "uppercase" }}>Categories</span>
                </div>
                <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: T.primary, lineHeight: 1.1, letterSpacing: 0 }}>
                  Browse by<br />Category
                </h2>
                <p style={{ fontFamily: FONT, fontSize: 16, color: T.textMuted, lineHeight: 1.7, marginTop: 18, maxWidth: 360 }}>
                  Everything your campus life needs — from textbooks to project materials, all in one place.
                </p>
                <button onClick={() => navigate("/resources")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, fontSize: 14, fontWeight: 600, color: T.accent, cursor: "pointer", background: "none", border: "none", fontFamily: FONT, transition: "gap 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.gap = "12px"}
                  onMouseLeave={e => e.currentTarget.style.gap = "8px"}
                >View all <ArrowRight size={15} /></button>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
                {categories.map(cat => {
                  const isActive = activeCat === cat.name;
                  return (
                    <motion.button key={cat.name}
                      onClick={() => { setActiveCat(isActive ? "All" : cat.name); document.getElementById("listings-section")?.scrollIntoView({ behavior: "smooth" }); }}
                      whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}
                      style={{
                        minHeight: 174,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
                        padding: "30px 18px", borderRadius: 24,
                        background: isActive ? T.accent : T.white,
                        border: `1.5px solid ${isActive ? T.accent : T.border}`,
                        color: isActive ? T.white : T.primary,
                        fontFamily: FONT, fontSize: 14, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.3s",
                        boxShadow: isActive ? "0 18px 38px rgba(255,87,34,0.18)" : "0 18px 42px rgba(48,56,65,0.06)",
                        textAlign: "center",
                      }}
                    >
                      <span style={{
                        width: 64, height: 64, borderRadius: 18,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isActive ? "rgba(255,255,255,0.18)" : T.paleMint,
                        fontSize: 34,
                      }}>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── LISTINGS ─────────────────────────── */}
        <section id="listings-section" style={{ padding: "clamp(3rem, 5vw, 5rem) clamp(20px, 3vw, 40px) clamp(6rem, 9vw, 8rem)" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto" }}>
            <Reveal>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(2rem, 3vw, 3rem)", flexWrap: "wrap", gap: 16 }}>
                <h2 style={{ fontFamily: FONT, fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, color: T.primary, letterSpacing: 0 }}>
                  {activeCat === "All" ? "Featured Listings" : activeCat}
                </h2>
                <div className="cc-listing-filters" style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end", background: T.white, borderRadius: 9999, padding: 6, border: `1px solid ${T.borderLt}`, boxShadow: "0 12px 36px rgba(48,56,65,0.06)" }}>
                  {["All", ...categories.map(c => c.name)].map(cat => {
                    const isA = activeCat === cat;
                    return (
                      <button key={cat} onClick={() => setActiveCat(cat)}
                        style={{ padding: "9px 16px", fontSize: 13, fontWeight: isA ? 600 : 500, fontFamily: FONT, background: isA ? T.accent : "transparent", color: isA ? T.white : T.textMuted, border: "none", borderRadius: 9999, transition: "all 0.25s ease", cursor: "pointer", whiteSpace: "nowrap" }}
                      >{cat}</button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            <AnimatePresence mode="wait">
              <motion.div key={activeCat} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }}>
                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}><div className="cc-spinner" /></div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "5rem 0" }}>
                    <div style={{ width: 72, height: 72, borderRadius: 20, background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                      <Package size={32} color={T.textMuted} strokeWidth={1.2} />
                    </div>
                    <p style={{ color: T.textMuted, fontSize: 16, marginBottom: "1.25rem" }}>No listings in this category yet.</p>
                    <button onClick={() => navigate("/add-resource")} style={{ background: T.accent, color: T.white, border: "none", padding: "14px 32px", borderRadius: 9999, fontSize: 14, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}>Post First Listing</button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))", gap: "clamp(18px, 2.4vw, 26px)" }}>
                    {filtered.map((r, idx) => {
                      const tb = typeBadge(r.type);
                      const wishlisted = isWishlisted(r._id);
                      const isSold = r.status === "Sold";
                      return (
                        <Reveal key={r._id} delay={idx * 0.04} y={16}>
                          <motion.div
                            onClick={() => !isSold && navigate(`/resource/${r._id}`)}
                            whileHover={!isSold ? { y: -6 } : {}}
                            style={{ cursor: isSold ? "not-allowed" : "pointer", overflow: "hidden", background: T.white, border: `1px solid ${T.border}`, borderRadius: 26, opacity: isSold ? 0.6 : 1, transition: "all 0.35s ease", boxShadow: "0 20px 52px rgba(48,56,65,0.08)" }}
                          >
                            <div style={{ position: "relative", aspectRatio: "1/1", background: T.surfaceAlt, overflow: "hidden" }}>
                              {r.image_url
                                ? <img src={r.image_url} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                                  onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                                  onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: T.paleMint }}><Package size={32} color={T.textMuted} strokeWidth={1} /></div>
                              }
                              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "46%", background: "linear-gradient(to top, rgba(48,56,65,0.54), rgba(48,56,65,0))", pointerEvents: "none" }} />
                              <div style={{ position: "absolute", bottom: 14, left: 16, zIndex: 2 }}>
                                <span style={{ display: "inline-flex", alignItems: "center", padding: "8px 12px", borderRadius: 9999, background: "rgba(255,255,255,0.92)", fontSize: 20, fontWeight: 800, color: T.primary, fontFamily: FONT, letterSpacing: 0, boxShadow: "0 12px 28px rgba(48,56,65,0.16)" }}>
                                  {r.price > 0 ? <span style={{ display: "flex", alignItems: "center", gap: 2 }}><IndianRupee size={16} strokeWidth={2.5} />{r.price}</span> : "Free"}
                                </span>
                              </div>
                              {isSold && (
                                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(48,56,65,0.54)" }}>
                                  <span style={{ padding: "8px 24px", background: T.danger, color: T.white, fontSize: 12, fontWeight: 700, borderRadius: 9999, letterSpacing: 0, textTransform: "uppercase" }}>Sold</span>
                                </div>
                              )}
                              <span style={{ position: "absolute", top: 14, left: 14, padding: "7px 14px", fontSize: 12, fontWeight: 700, background: tb.bg, color: tb.color, borderRadius: 9999, fontFamily: FONT, border: "1px solid rgba(255,255,255,0.74)", boxShadow: "0 10px 26px rgba(48,56,65,0.12)" }}>{tb.label}</span>
                              {!isSold && (
                                <motion.button onClick={e => toggleWishlist(r._id, e)} whileTap={{ scale: 0.8 }}
                                  style={{ position: "absolute", top: 14, right: 14, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.96)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", boxShadow: "0 12px 28px rgba(48,56,65,0.12)", cursor: "pointer" }}
                                ><Heart size={15} color={wishlisted ? T.accent : T.textMuted} fill={wishlisted ? T.accent : "none"} strokeWidth={1.8} /></motion.button>
                              )}
                            </div>
                            <div style={{ padding: "18px 18px 20px" }}>
                              <h3 style={{ fontSize: 17, fontWeight: 700, color: T.primary, lineHeight: 1.35, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: FONT, letterSpacing: 0 }}>{r.title}</h3>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexWrap: "wrap" }}>
                                  <div style={{ width: 30, height: 30, borderRadius: 9999, background: T.paleMint, color: T.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, border: `1px solid ${T.border}` }}>{r.seller?.name?.charAt(0)?.toUpperCase() || "S"}</div>
                                  <span style={{ fontSize: 13, color: T.textMuted, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(typeof r.seller === "string" ? r.seller : r.seller?.name) || "Seller"}</span>
                                  <Shield size={13} color={T.green} strokeWidth={1.8} />
                                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: T.border, display: "inline-block" }} />
                                  <span style={{ fontSize: 12, fontWeight: 600, color: T.green, display: "flex", alignItems: "center", gap: 3, padding: "4px 9px", background: T.paleMint, borderRadius: 9999, border: `1px solid ${T.borderLt}` }}><MapPin size={11} strokeWidth={1.5} />{r.location || "Campus"}</span>
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: isSold ? T.danger : T.accent, flexShrink: 0 }}>{isSold ? "Sold" : "View →"}</span>
                              </div>
                            </div>
                          </motion.div>
                        </Reveal>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {filtered.length > 0 && (
              <Reveal style={{ textAlign: "center", marginTop: "clamp(2rem, 4vw, 3.5rem)" }}>
                <button onClick={() => navigate("/resources")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, background: T.primary, color: T.white, padding: "15px 40px", border: "none", borderRadius: 9999, fontSize: 15, fontWeight: 600, fontFamily: FONT, transition: "all 0.3s", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = T.primary; e.currentTarget.style.transform = "translateY(0)"; }}
                >View All Listings <ArrowRight size={15} /></button>
              </Reveal>
            )}
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────── */}
        <section style={{ padding: "clamp(6rem, 10vw, 9rem) clamp(20px, 3vw, 40px)", background: T.surface }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: "clamp(3rem, 5vw, 4rem)" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 36, background: T.paleYellow, marginBottom: 20 }}>
                  <Zap size={14} color={T.accentDk} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.accentDk, letterSpacing: 0, textTransform: "uppercase" }}>How It Works</span>
                </div>
                <h2 style={{ fontFamily: FONT, fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 700, color: T.primary, lineHeight: 1.05, letterSpacing: 0 }}>Simple as it gets</h2>
              </div>
            </Reveal>
            <div className="cc-how-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, position: "relative" }}>
              <div className="cc-desk-only" style={{ position: "absolute", top: 28, left: "12.5%", right: "12.5%", height: 1, background: T.border, zIndex: 0 }} />
              {howItWorks.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Reveal key={i} delay={i * 0.1}>
                    <div style={{
                      position: "relative", zIndex: 1, textAlign: "left",
                      background: T.white, border: `1px solid ${T.border}`,
                      borderRadius: 24, padding: "28px 24px 30px",
                      minHeight: 246,
                      boxShadow: "0 18px 44px rgba(48,56,65,0.06)",
                    }}>
                      <div style={{ width: 56, height: 56, borderRadius: 18, background: T.paleYellow, border: `1px solid ${T.borderLt}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                        <Icon size={24} color={T.accent} strokeWidth={1.6} />
                      </div>
                      <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: T.accent, letterSpacing: 0, marginBottom: 8, textTransform: "uppercase" }}>Step {step.step}</div>
                      <h4 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, color: T.primary, marginBottom: 10, letterSpacing: 0 }}>{step.title}</h4>
                      <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.65, fontFamily: FONT }}>{step.desc}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── WHY CAMPUSCRATE ─────────────────── */}
        <section style={{ padding: "clamp(6rem, 10vw, 9rem) clamp(20px, 3vw, 40px)", background: T.bg, overflow: "hidden" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "0.85fr 1.45fr", gap: "clamp(3rem, 5vw, 6rem)", alignItems: "start" }} className="cc-trust-layout">
            <Reveal>
              <div style={{ position: "sticky", top: 120 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 36, background: T.paleYellow, marginBottom: 20 }}>
                  <Sparkles size={14} color={T.accentDk} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.accentDk, letterSpacing: 0, textTransform: "uppercase" }}>Why Us</span>
                </div>
                <h2 style={{ fontFamily: FONT, fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 700, color: T.primary, lineHeight: 1.05, letterSpacing: 0, marginBottom: 20 }}>
                  More than<br />a marketplace
                </h2>
                <p style={{ fontFamily: FONT, fontSize: 16, color: T.textMuted, lineHeight: 1.7, maxWidth: 340 }}>
                  A verified student ecosystem built for safety, speed, and trust — not just another listing board.
                </p>
                <div style={{ width: 48, height: 3, background: T.accent, marginTop: 28, borderRadius: 2 }} />
              </div>
            </Reveal>
            <div className="cc-trust-cards" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {trustFeatures.map((f, i) => {
                const Icon = f.icon;
                const decorBgs = [T.paleMint, T.paleYellow, T.paleTeal, T.surfaceAlt];
                const iconColors = [T.green, T.accentDk, T.danger, T.primary];
                const topColors = [T.green, T.accent, T.danger, T.primary];
                return (
                  <Reveal key={i} delay={i * 0.1}>
                    <motion.div
                      whileHover={{ y: -6, boxShadow: "0 24px 58px rgba(48,56,65,0.09)" }}
                      style={{ minHeight: 224, padding: "clamp(26px, 2.8vw, 34px)", background: T.white, border: `1px solid ${T.border}`, borderRadius: 24, transition: "all 0.35s ease", cursor: "default", borderTop: `3px solid ${topColors[i]}`, boxShadow: "0 18px 44px rgba(48,56,65,0.06)" }}
                    >
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: decorBgs[i], display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
                        <Icon size={22} color={iconColors[i]} strokeWidth={1.8} />
                      </div>
                      <h4 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, color: T.primary, marginBottom: 10, letterSpacing: 0, lineHeight: 1.2 }}>{f.title}</h4>
                      <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.65, fontFamily: FONT }}>{f.desc}</p>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ───────────────────── */}
        <section style={{ padding: "clamp(6rem, 10vw, 9rem) clamp(20px, 3vw, 40px)", background: T.white }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: "clamp(3rem, 5vw, 4rem)" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 36, background: T.paleMint, marginBottom: 20 }}>
                  <Star size={14} color={T.green} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.green, letterSpacing: 0, textTransform: "uppercase" }}>Testimonials</span>
                </div>
                <h2 style={{ fontFamily: FONT, fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 700, color: T.primary, lineHeight: 1.05, letterSpacing: 0 }}>Loved by students</h2>
              </div>
            </Reveal>
            <div className="cc-test-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
              {testimonials.map((t, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <motion.div whileHover={{ y: -4 }} style={{ minHeight: 286, padding: "clamp(26px, 2.8vw, 34px)", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 24, transition: "all 0.35s ease", boxShadow: "0 18px 44px rgba(48,56,65,0.06)", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                      {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} color={T.accent} fill={T.accent} strokeWidth={1.5} />)}
                    </div>
                    <p style={{ fontSize: 16, color: T.primary, lineHeight: 1.75, fontFamily: FONT, marginBottom: 26, fontStyle: "italic" }}>"{t.quote}"</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 9999, background: T.paleMint, color: T.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, border: `1px solid ${T.border}` }}>{t.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: T.primary, fontFamily: FONT }}>{t.name}</div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: T.textMuted, marginTop: 5, padding: "4px 9px", background: T.white, border: `1px solid ${T.border}`, borderRadius: 9999 }}><GraduationCap size={12} color={T.green} strokeWidth={1.8} />{t.uni}</div>
                      </div>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── MARKETPLACE STATS ──────────────── */}
        <section style={{ padding: "clamp(6rem, 10vw, 9rem) clamp(20px, 3vw, 40px)", background: T.paleMint }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: "clamp(3rem, 5vw, 4rem)" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 36, background: T.white, marginBottom: 20, border: `1px solid ${T.border}` }}>
                  <TrendingUp size={14} color={T.green} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.green, letterSpacing: 0, textTransform: "uppercase" }}>Marketplace Stats</span>
                </div>
                <h2 style={{ fontFamily: FONT, fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 700, color: T.primary, lineHeight: 1.05, letterSpacing: 0 }}>Growing every day</h2>
              </div>
            </Reveal>
            <div className="cc-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
              {statsData.map((st, i) => {
                const Icon = st.icon;
                return (
                  <Reveal key={i} delay={i * 0.08}>
                    <motion.div whileHover={{ y: -4 }} style={{ padding: "30px 24px", background: T.white, border: `1px solid ${T.border}`, borderRadius: 24, textAlign: "center", transition: "all 0.35s ease", boxShadow: "0 18px 44px rgba(48,56,65,0.06)" }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: T.paleMint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                        <Icon size={24} color={T.green} strokeWidth={1.8} />
                      </div>
                      <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 800, color: T.primary, letterSpacing: 0, lineHeight: 1.2 }}>
                        <Counter target={st.value} suffix={st.suffix} />
                      </div>
                      <div style={{ fontSize: 13, color: T.textMuted, fontWeight: 500, marginTop: 6 }}>{st.label}</div>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────── */}
        <section style={{
          padding: "clamp(6rem, 10vw, 9rem) clamp(20px, 3vw, 40px)",
          background: T.bg,
          position: "relative", overflow: "hidden",
        }}>
          <Reveal>
            <div style={{
              maxWidth: 1120, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1,
              background: T.paleMint,
              borderRadius: 30, padding: "clamp(44px, 7vw, 76px) clamp(24px, 5vw, 72px)",
              border: `1px solid ${T.border}`,
              boxShadow: "0 24px 70px rgba(48,56,65,0.08)",
            }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 36, background: T.white, marginBottom: 28, border: `1px solid ${T.border}` }}>
                <Zap size={14} color={T.green} />
                <span style={{ fontSize: 12, fontWeight: 700, color: T.green, letterSpacing: 0, textTransform: "uppercase" }}>Get Started</span>
              </div>
              <h2 style={{ fontFamily: FONT, fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: 0, color: T.primary, marginBottom: 18 }}>
                Your campus,<br />your market
              </h2>
              <p style={{ fontSize: 16, color: T.textMuted, lineHeight: 1.7, maxWidth: 500, margin: "0 auto 36px", fontFamily: FONT }}>
                Post your first listing in under 2 minutes and start earning — or find your next great campus deal.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                <button onClick={() => navigate("/add-resource")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: T.accent, color: T.white,
                    padding: "15px 34px", border: "none", borderRadius: 9999,
                    fontSize: 15, fontWeight: 700, fontFamily: FONT,
                    transition: "all 0.3s ease", cursor: "pointer",
                    letterSpacing: 0,
                    boxShadow: "0 16px 34px rgba(255,87,34,0.18)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; e.currentTarget.style.background = T.accentDk; e.currentTarget.style.boxShadow = "0 18px 38px rgba(255,87,34,0.22)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.background = T.accent; e.currentTarget.style.boxShadow = "0 16px 34px rgba(255,87,34,0.18)"; }}
                >Start Selling <ArrowUpRight size={15} /></button>
                <button onClick={() => navigate("/resources")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: T.white, color: T.primary,
                    border: `1.5px solid ${T.border}`,
                    padding: "15px 34px", borderRadius: 9999,
                    fontSize: 15, fontWeight: 600, fontFamily: FONT,
                    transition: "all 0.3s ease", cursor: "pointer",
                    boxShadow: "0 12px 30px rgba(48,56,65,0.06)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.borderColor = T.green; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = T.white; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
                >Explore Listings</button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

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
              background: T.white,
              display: "flex", flexDirection: "column",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "24px 24px", borderBottom: `1px solid ${T.border}`,
            }}>
              <span style={{ fontFamily: FONT, color: T.primary, fontWeight: 800, fontSize: 18 }}>🎓 CampusCrate</span>
              <button onClick={() => setMobileOpen(false)}
                style={{ background: T.bg, border: "none", color: T.textMuted, padding: 10, borderRadius: 12, cursor: "pointer" }}
              ><X size={20} /></button>
            </div>
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center", gap: 8,
            }}>
              {[...navLinks,
              { to: "/messages", label: "Messages" },
              { to: "/notifications", label: "Alerts" },
              { to: "/profile", label: "Profile" },
              ].map((link, i) => (
                <motion.div key={link.to}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 + 0.1 }}
                >
                  <Link to={link.to} onClick={() => setMobileOpen(false)}>
                    <span style={{
                      fontFamily: FONT, color: T.textMuted,
                      fontSize: "clamp(24px, 7vw, 36px)", fontWeight: 600,
                      letterSpacing: 0, display: "block",
                      padding: "8px 0", textAlign: "center", transition: "color 0.2s",
                    }}
                      onMouseEnter={e => e.target.style.color = T.primary}
                      onMouseLeave={e => e.target.style.color = T.textMuted}
                    >{link.label}</span>
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.5 }} style={{ marginTop: 28 }}>
                <Link to="/add-resource" onClick={() => setMobileOpen(false)}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: T.accent, color: T.white,
                    padding: "14px 36px", borderRadius: 9999,
                    fontSize: 15, fontWeight: 600, fontFamily: FONT,
                  }}>List Item <ArrowUpRight size={14} /></div>
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  style={{ marginTop: 16, background: "none", border: "none", color: T.textMuted, fontSize: 14, fontFamily: FONT, fontWeight: 500, cursor: "pointer" }}
                >Sign Out</button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ FOOTER ══════════════════════════════════════════════════════ */}
      <footer style={{ background: T.primary, color: "rgba(255,255,255,0.7)", padding: "clamp(3rem, 6vw, 5rem) 0 2rem" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 clamp(20px, 3vw, 40px)" }}>
          <div className="cc-footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "3rem", paddingBottom: "3rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.2rem" }}>
                <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: T.white, letterSpacing: 0 }}>🎓 CampusCrate</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 300, color: "rgba(255,255,255,0.45)" }}>
                The premium student-to-student marketplace designed for trust, safety, and local efficiency.
              </p>
            </div>
            {[
              { heading: "Marketplace", links: [{ to: "/resources", label: "Browse All" }, { to: "/resources", label: "Categories" }, { to: "/resources", label: "Best Deals" }] },
              { heading: "Account", links: [{ to: "/profile", label: "Profile" }, { to: "/dashboard", label: "Dashboard" }, { to: "/wishlist", label: "Wishlist" }, { to: "/notifications", label: "Notifications" }] },
            ].map(col => (
              <div key={col.heading}>
                <h5 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0, color: "rgba(255,255,255,0.35)", marginBottom: "1.2rem", fontFamily: FONT }}>{col.heading}</h5>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                  {col.links.map(item => (
                    <li key={item.label}>
                      <Link to={item.to}>
                        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: FONT, transition: "color 0.2s" }}
                          onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.9)"}
                          onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
                        >{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© {new Date().getFullYear()} CampusCrate. Built for the academic community.</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Made with ❤️ by StrawHats.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Homepage;
