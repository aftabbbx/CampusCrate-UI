/**
 * CampusCrate — Homepage (VANGUARD Dark Hero Design)
 *
 * Visual: Fullscreen video hero · PODIUM Sharp display font · Dark overlay
 * Typography: PODIUM Sharp 4.11 (display) + Inter (body)
 * Palette: Black hero with white text · Clean sections below
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
  Crown, Award,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Fonts ─────────────────────────────────────────────────────────────────────
const FONT_DISPLAY = "'FSP DEMO - PODIUM Sharp 4.11', 'Impact', 'Arial Black', sans-serif";
const FONT_BODY = "'Inter', system-ui, -apple-system, sans-serif";

// ─── Video ─────────────────────────────────────────────────────────────────────
const HERO_VIDEO = "/uploads/Firefly Cinematic premium brand film for a modern student marketplace platform.__Opening shot- Extre.mp4";

// ─── Design Tokens (Clean + Warm Gold Accent) ────────────────────────────────
const T = {
  bg:        "#FAFAFA",
  surface:   "#FFFFFF",
  surfaceAlt:"#F5F5F0",
  primary:   "#141414",
  primarySub:"#2D2D2D",
  accent:    "#C08B2D",
  accentLt:  "#D4A84B",
  accentDk:  "#956B1C",
  olive:     "#6B7F5E",
  oliveLt:   "#8A9E7C",
  text:      "#141414",
  textSub:   "#555555",
  textMuted: "#999999",
  border:    "#E8E8E8",
  borderDk:  "#D4D4D4",
  success:   "#4A7C59",
  danger:    "#B94040",
  warn:      "#C08B2D",
};

const EASE = [0.22, 1, 0.36, 1];

// ─── Global Styles ────────────────────────────────────────────────────────────
const GlobalStyle = () => {
  useEffect(() => {
    const id = "cc-global-style";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      @font-face {
        font-family: 'FSP DEMO - PODIUM Sharp 4.11';
        src: url('https://db.onlinewebfonts.com/t/8b75d9dcff6a48c35a46656192adf019.woff2') format('woff2'),
             url('https://db.onlinewebfonts.com/t/8b75d9dcff6a48c35a46656192adf019.woff') format('woff');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body {
        font-family: ${FONT_BODY};
        background: ${T.bg};
        color: ${T.text};
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
      }

      * { cursor: none !important; }
      @media (max-width: 768px) { * { cursor: auto !important; } }

      ::selection { background: ${T.accent}40; color: ${T.primary}; }

      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: ${T.bg}; }
      ::-webkit-scrollbar-thumb { background: ${T.accent}80; border-radius: 999px; }

      @keyframes cc-spin { to { transform: rotate(360deg); } }
      .cc-spinner {
        width: 28px; height: 28px;
        border: 2.5px solid ${T.border};
        border-top-color: ${T.accent};
        border-radius: 50%;
        animation: cc-spin 0.8s linear infinite;
      }

      a { text-decoration: none; color: inherit; }

      @media (min-width: 769px) { .cc-mob-only { display: none !important; } }
      @media (max-width: 768px) { .cc-desk-only { display: none !important; } }

      @media (max-width: 900px) {
        .cc-grid-2 { grid-template-columns: 1fr !important; }
        .cc-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
        .cc-footer-grid { grid-template-columns: 1fr !important; }
        .cc-cta-grid { grid-template-columns: 1fr !important; text-align: center !important; }
        .cc-cta-icon { display: none !important; }
      }
      @media (max-width: 600px) {
        .cc-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
      }
    `;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
};

// ─── Custom Cursor ─────────────────────────────────────────────────────────────
const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [hovered, setHovered] = useState(false);
  const [clicking, setClicking] = useState(false);

  const springCfg = { stiffness: 500, damping: 35, mass: 0.5 };
  const trailCfg = { stiffness: 160, damping: 28, mass: 1 };
  const dotX = useSpring(cursorX, springCfg);
  const dotY = useSpring(cursorY, springCfg);
  const trailX = useSpring(cursorX, trailCfg);
  const trailY = useSpring(cursorY, trailCfg);

  useEffect(() => {
    const move = (e) => { cursorX.set(e.clientX); cursorY.set(e.clientY); };
    const down = () => setClicking(true);
    const up = () => setClicking(false);
    const enter = (e) => { if (e.target.closest("button, a, [data-cursor]")) setHovered(true); };
    const leave = (e) => { if (!e.target.closest("button, a, [data-cursor]")) setHovered(false); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseover", enter);
    document.addEventListener("mouseout", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseover", enter);
      document.removeEventListener("mouseout", leave);
    };
  }, []);

  return (
    <>
      <motion.div style={{
        position: "fixed", top: 0, left: 0, zIndex: 99999, pointerEvents: "none",
        borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.5)",
        x: trailX, y: trailY, translateX: "-50%", translateY: "-50%",
        mixBlendMode: "difference",
      }} animate={{
        width: hovered ? 48 : clicking ? 14 : 28,
        height: hovered ? 48 : clicking ? 14 : 28,
        borderColor: hovered ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)",
      }} transition={{ duration: 0.25 }} />
      <motion.div style={{
        position: "fixed", top: 0, left: 0, zIndex: 99999, pointerEvents: "none",
        borderRadius: "50%", background: "#fff", mixBlendMode: "difference",
        x: dotX, y: dotY, translateX: "-50%", translateY: "-50%",
      }} animate={{ width: clicking ? 3 : 6, height: clicking ? 3 : 6 }}
        transition={{ duration: 0.15 }} />
    </>
  );
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
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

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
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

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card = ({ children, style, hover = true, className }) => {
  const ref = useRef(null);
  const rx = useMotionValue(0); const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 20 });
  const sry = useSpring(ry, { stiffness: 180, damping: 20 });
  const onMove = (e) => {
    if (!ref.current || !hover) return;
    const r = ref.current.getBoundingClientRect();
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 5);
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 5);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ perspective: 1200 }} className={className}>
      <motion.div style={{
        rotateX: srx, rotateY: sry, transformStyle: "preserve-3d",
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 16, ...style,
      }} whileHover={hover ? { boxShadow: "0 20px 60px -15px rgba(0,0,0,0.1)", y: -4 } : {}}
        transition={{ duration: 0.35, ease: EASE }}
      >{children}</motion.div>
    </div>
  );
};

// ─── Type Badge ───────────────────────────────────────────────────────────────
const typeBadge = (type) => {
  if (type === "Free") return { bg: `${T.success}15`, color: T.success, label: "Free" };
  if (type === "Exchange") return { bg: `${T.warn}15`, color: T.warn, label: "Exchange" };
  return { bg: `${T.accent}12`, color: T.accentDk, label: type || "Sell" };
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOMEPAGE
// ═══════════════════════════════════════════════════════════════════════════════
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
    { icon: Shield, title: "Verified Users", desc: "All members verified with university credentials.", color: T.success },
    { icon: MessageSquare, title: "Secure Chat", desc: "Encrypted messaging built into the platform.", color: T.accent },
    { icon: Zap, title: "Fast Deals", desc: "Meet on campus for instant, hassle-free exchanges.", color: T.warn },
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <GlobalStyle />
      <CustomCursor />

      {/* ═══ FULLSCREEN HERO ═══════════════════════════════════════════════ */}
      <section style={{
        position: "relative", width: "100%", height: "100vh",
        overflow: "hidden", background: "#000",
      }}>
        {/* Background Video */}
        <video
          autoPlay loop muted playsInline preload="auto"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", pointerEvents: "none",
          }}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(15,15,15,0.45) 40%, rgba(10,10,10,0.65) 100%)",
        }} />

        {/* Foreground content */}
        <div style={{
          position: "relative", zIndex: 10,
          height: "100%", display: "flex", flexDirection: "column",
        }}>

          {/* ── NAVBAR ──────────────────────────────────────────────── */}
          <nav style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px",
          }}>
            {/* Brand */}
            <Link to="/">
              <span style={{
                fontFamily: FONT_DISPLAY, color: "#fff", fontWeight: 700,
                fontSize: "clamp(20px, 3vw, 28px)", letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}>
                CAMPUSCRATE
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="cc-desk-only" style={{
              display: "flex", gap: 32, alignItems: "center",
            }}>
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}>
                  <span style={{
                    fontFamily: FONT_BODY, fontSize: 12, color: "rgba(255,255,255,0.7)",
                    letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500,
                    transition: "color 0.3s",
                  }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.7)"}
                  >{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Desktop right */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Notification dots */}
              <div className="cc-desk-only" style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[
                  { to: "/messages", Icon: MessageSquare, count: totalUnreadMessages },
                  { to: "/notifications", Icon: Bell, count: unreadNotifications },
                ].map(({ to, Icon, count }) => (
                  <Link key={to} to={to}>
                    <div style={{
                      position: "relative", width: 36, height: 36, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.2s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <Icon size={16} color="rgba(255,255,255,0.7)" />
                      {count > 0 && (
                        <span style={{
                          position: "absolute", top: 5, right: 5,
                          width: 7, height: 7, borderRadius: "50%",
                          background: T.accent, border: "1.5px solid #000",
                        }} />
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Avatar / user menu */}
              <div ref={userMenuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "rgba(255,255,255,0.15)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 12, border: "1px solid rgba(255,255,255,0.2)",
                    overflow: "hidden", fontFamily: FONT_BODY,
                  }}
                >
                  {user?.profile_image
                    ? <img src={user.profile_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : user?.name?.charAt(0)?.toUpperCase() || "U"}
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: "absolute", top: "calc(100% + 10px)", right: 0,
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderRadius: 14, overflow: "hidden",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        minWidth: 200, zIndex: 100,
                      }}
                    >
                      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{user?.name || "Student"}</div>
                        <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>{user?.email}</div>
                      </div>
                      {[
                        { to: "/profile", label: "My Profile", Icon: User },
                        { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
                        { to: "/wishlist", label: "Wishlist", Icon: Heart },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "11px 16px", fontSize: 13, fontWeight: 600, color: T.textSub,
                            transition: "background 0.15s",
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          ><item.Icon size={14} />{item.label}</div>
                        </Link>
                      ))}
                      <button onClick={logout} style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "11px 16px", fontSize: 13, fontWeight: 600,
                        color: T.danger, background: "none", border: "none",
                        borderTop: `1px solid ${T.border}`, fontFamily: FONT_BODY,
                      }}><LogOut size={14} /> Sign Out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop CTA */}
              <Link to="/add-resource" className="cc-desk-only">
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  border: "1px solid rgba(255,255,255,0.3)",
                  padding: "12px 24px", fontSize: 11, fontWeight: 500,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "#fff", fontFamily: FONT_BODY,
                  transition: "all 0.3s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
                >
                  START SELLING <ArrowUpRight size={14} />
                </div>
              </Link>

              {/* Hamburger */}
              <button
                className="cc-mob-only"
                onClick={() => setMobileOpen(true)}
                style={{
                  background: "none", border: "none", padding: 8,
                  display: "flex", flexDirection: "column", gap: 5,
                }}
              >
                <div style={{ width: 24, height: 2, background: "#fff", borderRadius: 1 }} />
                <div style={{ width: 24, height: 2, background: "#fff", borderRadius: 1 }} />
                <div style={{ width: 16, height: 2, background: "#fff", borderRadius: 1 }} />
              </button>
            </div>
          </nav>

          {/* ── HERO CONTENT (left-aligned, vertically centered) ──── */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            justifyContent: "center",
            padding: "0 24px 60px",
            maxWidth: 900,
          }}>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}
            >
              <Crown size={16} color="rgba(255,255,255,0.6)" />
              <span style={{
                fontFamily: FONT_BODY, fontSize: "clamp(10px, 2vw, 13px)",
                color: "rgba(255,255,255,0.6)", letterSpacing: "0.3em",
                textTransform: "uppercase", fontWeight: 500,
              }}>
                University-Exclusive Marketplace
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              style={{
                fontFamily: FONT_DISPLAY,
                color: "#FFFFFF",
                textTransform: "uppercase",
                fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
                fontWeight: 700,
                textShadow: "0 2px 20px rgba(0,0,0,0.4), 0 4px 40px rgba(0,0,0,0.2)",
              }}
            >
              Buy.<br />
              Sell.<br />
              Rent.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              style={{
                fontFamily: FONT_BODY,
                color: "rgba(255,255,255,0.78)",
                fontSize: "clamp(13px, 2.5vw, 15px)",
                lineHeight: 1.7, maxWidth: 420,
                marginTop: 24,
                textShadow: "0 1px 8px rgba(0,0,0,0.3)",
              }}
            >
              Discover great deals, connect with trusted peers{" "}
              and find what you need faster —{" "}
              <strong style={{ color: "#fff" }}>your campus, your market.</strong>
            </motion.p>

            {/* Profile warning */}
            {!isProfileComplete && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  marginTop: 16, display: "inline-flex", alignItems: "center",
                  gap: 8, padding: "8px 16px",
                  background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500,
                  fontFamily: FONT_BODY,
                }}
              >
                <AlertTriangle size={13} />
                Complete your profile
                <Link to="/profile" style={{ color: T.accent, fontWeight: 700 }}>Go →</Link>
              </motion.div>
            )}

            {/* CTA Row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              style={{
                marginTop: 36, display: "flex", flexWrap: "wrap",
                alignItems: "center", gap: 20,
              }}
            >
              <button
                onClick={() => navigate("/resources")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "#000", color: "#fff",
                  padding: "14px 28px", border: "none",
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.2em",
                  textTransform: "uppercase", fontFamily: FONT_BODY,
                  transition: "background 0.3s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#1a1a1a"}
                onMouseLeave={e => e.currentTarget.style.background = "#000"}
              >
                BROWSE MARKETPLACE
                <ArrowUpRight size={14} />
              </button>

              {/* Award badge - desktop only */}
              <div className="cc-desk-only" style={{
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <Award size={28} color="rgba(255,255,255,0.4)" />
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, fontFamily: FONT_BODY }}>
                    Top-Rated
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: FONT_BODY }}>
                    Student Platform
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              style={{ marginTop: 48, display: "flex", flexWrap: "wrap", gap: "clamp(24px, 4vw, 64px)" }}
            >
              {heroStats.map((st, i) => (
                <div key={i}>
                  <div style={{
                    fontFamily: FONT_BODY, color: "#fff",
                    fontSize: "clamp(1.5rem, 4vw, 3rem)",
                    fontWeight: 700, letterSpacing: "-0.03em",
                  }}>{st.value}</div>
                  <div style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "clamp(9px, 1.5vw, 12px)",
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    marginTop: 4, fontFamily: FONT_BODY, fontWeight: 500,
                  }}>{st.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ MOBILE MENU OVERLAY ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed", inset: 0, zIndex: 50,
              background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "20px 24px",
            }}>
              <span style={{
                fontFamily: FONT_DISPLAY, color: "#fff", fontWeight: 700,
                fontSize: 22, letterSpacing: "0.15em", textTransform: "uppercase",
              }}>CAMPUSCRATE</span>
              <button onClick={() => setMobileOpen(false)}
                style={{ background: "none", border: "none", color: "#fff", padding: 8 }}
              ><X size={24} /></button>
            </div>

            {/* Menu items */}
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center", gap: 8,
            }}>
              {[...navLinks,
                { to: "/messages", label: "Messages" },
                { to: "/notifications", label: "Alerts" },
                { to: "/profile", label: "Profile" },
              ].map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 + 0.1 }}
                >
                  <Link to={link.to} onClick={() => setMobileOpen(false)}>
                    <span style={{
                      fontFamily: FONT_DISPLAY, color: "#fff",
                      fontSize: "clamp(28px, 8vw, 48px)",
                      textTransform: "uppercase", fontWeight: 700,
                      letterSpacing: "0.05em", display: "block",
                      padding: "8px 0", textAlign: "center",
                    }}>{link.label}</span>
                  </Link>
                </motion.div>
              ))}

              {/* Mobile CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                style={{ marginTop: 24 }}
              >
                <Link to="/add-resource" onClick={() => setMobileOpen(false)}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    border: "1px solid rgba(255,255,255,0.3)",
                    padding: "14px 28px", fontSize: 12, fontWeight: 500,
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    color: "#fff", fontFamily: FONT_BODY,
                  }}>
                    START SELLING <ArrowUpRight size={14} />
                  </div>
                </Link>
              </motion.div>

              {/* Sign out */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  style={{
                    marginTop: 16, background: "none", border: "none",
                    color: "rgba(255,255,255,0.4)", fontSize: 13,
                    fontFamily: FONT_BODY, fontWeight: 500,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                  }}
                >Sign Out</button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CONTENT — Dark Glassmorphism ══════════════════════════════ */}
      <main style={{ background: "#0D0D0D" }}>

        {/* ── CATEGORIES ──────────────────────────────────────────── */}
        <section style={{ padding: "5rem 24px 3rem" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <Reveal>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3em", color: T.accent, marginBottom: 10, fontFamily: FONT_BODY }}>Explore</div>
                  <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff" }}>
                    Browse by Category
                  </h2>
                </div>
                <button onClick={() => navigate("/resources")}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 11, fontWeight: 600, color: T.accent,
                    background: "none", border: `1px solid ${T.accent}40`,
                    padding: "8px 18px", fontFamily: FONT_BODY,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${T.accent}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  View all <ArrowUpRight size={13} />
                </button>
              </div>
            </Reveal>

            {/* Bento grid categories */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {categories.map((cat, i) => {
                const isActive = activeCat === cat.name;
                return (
                  <Reveal key={cat.name} delay={i * 0.07}>
                    <motion.button
                      onClick={() => {
                        setActiveCat(isActive ? "All" : cat.name);
                        document.getElementById("listings-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      style={{
                        width: "100%", display: "flex", flexDirection: "column", alignItems: "center",
                        gap: 10, padding: "1.5rem 1rem",
                        background: isActive
                          ? `linear-gradient(135deg, ${T.accent}30, ${T.accentLt}15)`
                          : "rgba(255,255,255,0.04)",
                        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                        border: `1px solid ${isActive ? T.accent + "60" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 16, color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                        fontFamily: FONT_BODY, cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: isActive ? `0 8px 32px ${T.accent}25` : "none",
                      }}
                    >
                      <span style={{ fontSize: 30 }}>{cat.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: isActive ? T.accentLt : "rgba(255,255,255,0.5)" }}>{cat.name}</span>
                    </motion.button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── LISTINGS ──────────────────────────────────────────── */}
        <section id="listings-section" style={{ padding: "2rem 24px 4rem" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem" }}>
              <Reveal>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3em", color: T.accent, marginBottom: 10, fontFamily: FONT_BODY }}>Marketplace</div>
                <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff" }}>
                  {activeCat === "All" ? "Featured Listings" : activeCat}
                </h2>
              </Reveal>
            </div>

            {/* Filter pills */}
            <Reveal style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["All", ...categories.map(c => c.name)].map(cat => {
                  const isA = activeCat === cat;
                  return (
                    <button key={cat} onClick={() => setActiveCat(cat)}
                      style={{
                        padding: "6px 18px", borderRadius: 999,
                        fontSize: 11, fontWeight: 600, fontFamily: FONT_BODY,
                        background: isA ? T.accent : "rgba(255,255,255,0.06)",
                        color: isA ? "#fff" : "rgba(255,255,255,0.5)",
                        border: `1px solid ${isA ? T.accent : "rgba(255,255,255,0.1)"}`,
                        backdropFilter: "blur(8px)",
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        transition: "all 0.2s ease",
                      }}
                    >{cat}</button>
                  );
                })}
              </div>
            </Reveal>

            <AnimatePresence mode="wait">
              <motion.div key={activeCat}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}
              >
                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                    <div className="cc-spinner" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "5rem 0" }}>
                    <Package size={40} color="rgba(255,255,255,0.2)" style={{ margin: "0 auto 1rem" }} />
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: "1.25rem", fontFamily: FONT_BODY }}>
                      No listings in this category yet.
                    </p>
                    <button onClick={() => navigate("/add-resource")}
                      style={{
                        background: T.accent, color: "#fff", border: "none",
                        padding: "12px 28px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: FONT_BODY,
                      }}
                    >Post First Listing</button>
                  </div>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "1rem",
                  }}>
                    {filtered.map((r, idx) => {
                      const tb = typeBadge(r.type);
                      const wishlisted = isWishlisted(r._id);
                      const isSold = r.status === "Sold";
                      return (
                        <Reveal key={r._id} delay={idx * 0.04} y={20}>
                          <motion.div
                            onClick={() => !isSold && navigate(`/resource/${r._id}`)}
                            whileHover={!isSold ? { y: -4, boxShadow: `0 20px 60px rgba(0,0,0,0.4)` } : {}}
                            style={{
                              cursor: isSold ? "not-allowed" : "pointer",
                              borderRadius: 16, overflow: "hidden",
                              background: "rgba(255,255,255,0.05)",
                              backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                              border: `1px solid ${isSold ? "rgba(185,64,64,0.3)" : "rgba(255,255,255,0.08)"}`,
                              opacity: isSold ? 0.6 : 1,
                              transition: "all 0.3s ease",
                            }}
                          >
                            <div style={{ position: "relative", height: 180, background: "rgba(255,255,255,0.03)", overflow: "hidden" }}>
                              {r.image_url
                                ? <img src={r.image_url} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={36} color="rgba(255,255,255,0.15)" /></div>}
                              {isSold && (
                                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(153,27,27,0.2)" }}>
                                  <span style={{ padding: "6px 20px", borderRadius: 4, background: "#991B1B", color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em" }}>SOLD</span>
                                </div>
                              )}
                              <span style={{
                                position: "absolute", top: 12, left: 12,
                                padding: "4px 10px", fontSize: 10, fontWeight: 700,
                                background: tb.bg, color: tb.color, borderRadius: 4,
                                letterSpacing: "0.05em", textTransform: "uppercase",
                                backdropFilter: "blur(8px)",
                              }}>{tb.label}</span>
                              {!isSold && (
                                <motion.button
                                  onClick={e => toggleWishlist(r._id, e)}
                                  whileTap={{ scale: 0.8 }}
                                  style={{
                                    position: "absolute", top: 10, right: 10,
                                    width: 32, height: 32, borderRadius: "50%",
                                    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                  }}
                                >
                                  <Heart size={14} color={wishlisted ? "#ef4444" : "rgba(255,255,255,0.6)"} fill={wishlisted ? "#ef4444" : "none"} />
                                </motion.button>
                              )}
                            </div>
                            <div style={{ padding: "1rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                <h3 style={{
                                  fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)",
                                  lineHeight: 1.3, flex: 1, paddingRight: 8,
                                  display: "-webkit-box", WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical", overflow: "hidden",
                                  fontFamily: FONT_BODY,
                                }}>{r.title}</h3>
                                <span style={{ fontSize: 14, fontWeight: 800, color: isSold ? "rgba(255,255,255,0.3)" : T.accentLt, flexShrink: 0 }}>
                                  {r.price > 0
                                    ? <span style={{ display: "flex", alignItems: "center", gap: 1 }}><IndianRupee size={11} />{r.price}</span>
                                    : "Free"}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: "0.75rem" }}>
                                <MapPin size={11} /> {r.location || "Campus"}
                              </div>
                              <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)",
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                  <div style={{
                                    width: 24, height: 24, borderRadius: "50%",
                                    background: `${T.accent}30`, color: T.accentLt,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 10, fontWeight: 700, border: `1px solid ${T.accent}40`,
                                  }}>{r.seller?.name?.charAt(0)?.toUpperCase() || "S"}</div>
                                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, fontFamily: FONT_BODY }}>
                                    {(typeof r.seller === "string" ? r.seller : r.seller?.name) || "Seller"}
                                  </span>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: isSold ? "#991B1B" : T.accentLt }}>{isSold ? "Sold" : "Contact"}</span>
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
              <Reveal style={{ textAlign: "center", marginTop: "2.5rem" }}>
                <button onClick={() => navigate("/resources")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(12px)",
                    color: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.12)", padding: "14px 32px",
                    borderRadius: 8, fontSize: 11, fontWeight: 600, letterSpacing: "0.15em",
                    textTransform: "uppercase", fontFamily: FONT_BODY,
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = T.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                >
                  View All Listings <ArrowUpRight size={14} />
                </button>
              </Reveal>
            )}
          </div>
        </section>

        {/* ── TRUST FEATURES (Glass cards on dark) ─────────────── */}
        <section style={{ padding: "4rem 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <Reveal style={{ marginBottom: "2.5rem" }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3em", color: T.accent, marginBottom: 10, fontFamily: FONT_BODY }}>Why CampusCrate</div>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff" }}>
                Safe & Seamless
              </h2>
            </Reveal>
            <div className="cc-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
              {trustFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={i} delay={i * 0.08}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      style={{
                        padding: "1.75rem",
                        background: "rgba(255,255,255,0.04)",
                        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 16, transition: "all 0.3s",
                      }}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: `${f.color}15`, border: `1px solid ${f.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: "1rem",
                      }}><Icon size={20} color={f.color} /></div>
                      <h4 style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.02em" }}>{f.title}</h4>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, fontFamily: FONT_BODY }}>{f.desc}</p>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ─────────────────────────────────────── */}
        <section style={{ padding: "5rem 24px", position: "relative", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: FONT_DISPLAY, fontSize: "clamp(80px, 14vw, 200px)", fontWeight: 700,
            color: "rgba(255,255,255,0.02)", whiteSpace: "nowrap",
            textTransform: "uppercase", userSelect: "none", pointerEvents: "none",
          }}>CAMPUSCRATE</div>
          <div className="cc-grid-4" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px",
            maxWidth: 1100, margin: "0 auto", position: "relative",
            background: "rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden",
          }}>
            {[
              { label: "Active Students", value: 2400, suffix: "+", icon: GraduationCap },
              { label: "Resources Listed", value: allResources.length || 850, suffix: "+", icon: Package },
              { label: "Successful Trades", value: 1200, suffix: "+", icon: Handshake },
              { label: "Campuses Covered", value: 15, suffix: "+", icon: MapPin },
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <Reveal key={i} delay={i * 0.06}>
                  <div style={{
                    textAlign: "center", padding: "2.5rem 1.5rem",
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(16px)",
                  }}>
                    <Icon size={22} color={T.accent} style={{ marginBottom: 16 }} />
                    <div style={{
                      fontFamily: FONT_BODY, fontSize: "clamp(2rem, 4vw, 3rem)",
                      fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1,
                    }}><Counter target={st.value} suffix={st.suffix} /></div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 8, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: FONT_BODY }}>
                      {st.label}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section style={{ padding: "4rem 24px 5rem" }}>
          <Reveal>
            <div style={{
              maxWidth: 1280, margin: "0 auto",
              background: `linear-gradient(135deg, ${T.accent}20 0%, rgba(255,255,255,0.04) 100%)`,
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              border: `1px solid ${T.accent}30`,
              borderRadius: 24, padding: "3.5rem",
              display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem",
              alignItems: "center", position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -60, right: -60, width: 300, height: 300,
                borderRadius: "50%", background: `${T.accent}10`,
                filter: "blur(60px)", pointerEvents: "none",
              }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3em", color: T.accentLt, marginBottom: 12, fontFamily: FONT_BODY }}>Ready to Start?</div>
                <h2 style={{
                  fontFamily: FONT_DISPLAY, fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  fontWeight: 700, color: "#fff", textTransform: "uppercase",
                  letterSpacing: "-0.01em", lineHeight: 1.0, marginBottom: 12,
                }}>
                  De-clutter<br />your dorm.
                </h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 420, marginBottom: 28, fontFamily: FONT_BODY }}>
                  Post your first listing in under 2 minutes and start earning — or find your next great campus deal.
                </p>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <button onClick={() => navigate("/add-resource")}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: T.accent, color: "#fff", border: "none",
                      padding: "14px 28px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                      letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: FONT_BODY,
                      boxShadow: `0 8px 32px ${T.accent}40`,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.accentLt; }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.accent; }}
                  >Start Selling <ArrowUpRight size={14} /></button>
                  <button onClick={() => navigate("/resources")}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(12px)",
                      color: "rgba(255,255,255,0.8)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      padding: "14px 28px", borderRadius: 10, fontSize: 11, fontWeight: 600,
                      letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: FONT_BODY,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                  >Explore</button>
                </div>
              </div>
              <motion.div className="cc-cta-icon"
                animate={{ y: [0, -14, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              ><ShoppingBag size={140} color={`${T.accent}15`} /></motion.div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ══ FOOTER ══════════════════════════════════════════════════════ */}
      <footer style={{
        background: T.primary, color: "rgba(255,255,255,0.5)",
        padding: "4rem 0 2rem",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div className="cc-footer-grid" style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
            gap: "3rem", paddingBottom: "3rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                <span style={{
                  fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700,
                  color: "#fff", letterSpacing: "0.12em", textTransform: "uppercase",
                }}>CAMPUSCRATE</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 300, fontFamily: FONT_BODY }}>
                The premium student-to-student marketplace designed for trust, safety, and local efficiency.
              </p>
            </div>
            {[
              { heading: "Marketplace", links: [
                { to: "/resources", label: "Browse All" },
                { to: "/resources", label: "Categories" },
                { to: "/resources", label: "Best Deals" },
              ]},
              { heading: "Account", links: [
                { to: "/profile", label: "Profile" },
                { to: "/dashboard", label: "Dashboard" },
                { to: "/wishlist", label: "Wishlist" },
                { to: "/notifications", label: "Notifications" },
              ]},
            ].map(col => (
              <div key={col.heading}>
                <h5 style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: "1rem", fontFamily: FONT_BODY }}>{col.heading}</h5>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {col.links.map(item => (
                    <li key={item.label}>
                      <Link to={item.to}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: FONT_BODY, transition: "color 0.2s" }}
                          onMouseEnter={e => e.target.style.color = "#fff"}
                          onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
                        >{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingTop: "1.5rem", flexWrap: "wrap", gap: "0.5rem",
          }}>
            <p style={{ fontSize: 12, fontFamily: FONT_BODY }}>© {new Date().getFullYear()} CampusCrate. Built for the academic community.</p>
            <p style={{ fontSize: 12, fontFamily: FONT_BODY }}>Made with ❤️ by StrawHats.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Homepage;