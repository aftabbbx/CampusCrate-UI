/**
 * CampusCrate — Homepage  (THE ATELIER — Warm Luxury Redesign)
 *
 * Visual: Fullscreen video hero · Playfair Display serif · Warm editorial palette
 * Typography: Playfair Display (display) + DM Sans (body)
 * Palette: Ivory / Cream / Sand / Charcoal / Bronze / Olive
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

/* ─── Typography ────────────────────────────────────────────────────────────── */
const FONT_DISPLAY = "'Playfair Display', 'Georgia', 'Times New Roman', serif";
const FONT_BODY = "'DM Sans', 'Inter', system-ui, -apple-system, sans-serif";

/* ─── Video ─────────────────────────────────────────────────────────────────── */
const HERO_VIDEO = "/uploads/Firefly Cinematic premium brand film for a modern student marketplace platform.__Opening shot- Extre.mp4";

/* ─── Design Tokens — The Atelier Palette ───────────────────────────────────── */
const T = {
  bg:        "#F4F0E8",   // warm ivory
  surface:   "#EDE8DC",   // cream
  surfaceAlt:"#E5DFD2",   // deeper cream
  primary:   "#1E1C19",   // charcoal
  primarySub:"#3D3A36",   // graphite
  accent:    "#96704C",   // bronze
  accentLt:  "#B8845A",   // copper
  accentDk:  "#7A5B3D",   // dark bronze
  olive:     "#5C6B4F",   // olive
  oliveLt:   "#7A8B6C",   // light olive
  terra:     "#C4613A",   // terracotta
  text:      "#1E1C19",   // charcoal
  textSub:   "#6B645A",   // warm gray
  textMuted: "#A69E91",   // stone
  border:    "#D9D0C1",   // sand
  borderDk:  "#C4BAA9",   // dark sand
  success:   "#5C6B4F",   // olive
  danger:    "#C4613A",   // terracotta
  warn:      "#96704C",   // bronze
};

const EASE = [0.22, 1, 0.36, 1];

/* ─── Global Styles ─────────────────────────────────────────────────────────── */
const GlobalStyle = () => {
  useEffect(() => {
    const id = "cc-global-style";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap');

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
        border: 2px solid ${T.border};
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
        .cc-trust-layout { grid-template-columns: 1fr !important; }
        .cc-cat-layout { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 600px) {
        .cc-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
        .cc-hero-heading { font-size: 2.8rem !important; }
        .cc-cat-pills { flex-wrap: wrap !important; }
      }

      @keyframes cc-scroll-line {
        0% { transform: scaleY(0); transform-origin: top; }
        50% { transform: scaleY(1); transform-origin: top; }
        51% { transform-origin: bottom; }
        100% { transform: scaleY(0); transform-origin: bottom; }
      }
    `;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
};

/* ─── Custom Cursor ──────────────────────────────────────────────────────────── */
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
        borderRadius: "50%", border: `1.5px solid ${T.accent}90`,
        x: trailX, y: trailY, translateX: "-50%", translateY: "-50%",
        mixBlendMode: "difference",
      }} animate={{
        width: hovered ? 48 : clicking ? 14 : 28,
        height: hovered ? 48 : clicking ? 14 : 28,
        borderColor: hovered ? `${T.accent}` : `${T.accent}60`,
      }} transition={{ duration: 0.25 }} />
      <motion.div style={{
        position: "fixed", top: 0, left: 0, zIndex: 99999, pointerEvents: "none",
        borderRadius: "50%", background: T.accent, mixBlendMode: "difference",
        x: dotX, y: dotY, translateX: "-50%", translateY: "-50%",
      }} animate={{ width: clicking ? 3 : 5, height: clicking ? 3 : 5 }}
        transition={{ duration: 0.15 }} />
    </>
  );
};

/* ─── Animated Counter ──────────────────────────────────────────────────────── */
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
  if (type === "Free") return { bg: `${T.olive}18`, color: T.olive, label: "Free" };
  if (type === "Exchange") return { bg: `${T.accent}15`, color: T.accent, label: "Exchange" };
  return { bg: `${T.accent}12`, color: T.accentDk, label: type || "Sell" };
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
    { icon: Shield, title: "Verified Users", desc: "All members verified with university credentials.", color: T.olive },
    { icon: MessageSquare, title: "Secure Chat", desc: "Encrypted messaging built into the platform.", color: T.accent },
    { icon: Zap, title: "Fast Deals", desc: "Meet on campus for instant, hassle-free exchanges.", color: T.terra },
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

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <>
      <GlobalStyle />
      <CustomCursor />

      {/* ═══ FULLSCREEN HERO ═══════════════════════════════════════════════ */}
      <section style={{
        position: "relative", width: "100%", height: "100vh",
        overflow: "hidden", background: "#1E1C19",
      }}>
        {/* Background Video — PRESERVED */}
        <video
          autoPlay loop muted playsInline preload="auto"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", pointerEvents: "none",
          }}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

        {/* Warm overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(175deg, rgba(30,28,25,0.25) 0%, rgba(30,28,25,0.40) 35%, rgba(30,28,25,0.72) 100%)",
        }} />

        {/* Grain texture overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
          pointerEvents: "none",
        }} />

        {/* Foreground content */}
        <div style={{
          position: "relative", zIndex: 10,
          height: "100%", display: "flex", flexDirection: "column",
        }}>

          {/* ── NAVBAR ──────────────────────────────────────────────── */}
          <nav style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "28px clamp(20px, 4vw, 48px)",
          }}>
            {/* Brand */}
            <Link to="/">
              <span style={{
                fontFamily: FONT_BODY, color: "#fff", fontWeight: 600,
                fontSize: "clamp(14px, 2vw, 16px)", letterSpacing: "0.25em",
                textTransform: "uppercase",
              }}>
                CampusCrate
              </span>
            </Link>

            {/* Desktop nav — centered */}
            <div className="cc-desk-only" style={{
              position: "absolute", left: "50%", transform: "translateX(-50%)",
              display: "flex", gap: 36, alignItems: "center",
            }}>
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}>
                  <span style={{
                    fontFamily: FONT_BODY, fontSize: 11, color: "rgba(255,255,255,0.55)",
                    letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500,
                    transition: "color 0.3s",
                    position: "relative",
                  }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}
                  >{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Notification icons */}
              <div className="cc-desk-only" style={{ display: "flex", gap: 2, alignItems: "center" }}>
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
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <Icon size={15} color="rgba(255,255,255,0.55)" strokeWidth={1.5} />
                      {count > 0 && (
                        <span style={{
                          position: "absolute", top: 6, right: 6,
                          width: 6, height: 6, borderRadius: "50%",
                          background: T.accent, border: "1.5px solid rgba(30,28,25,0.8)",
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
                    background: "rgba(255,255,255,0.1)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 600, fontSize: 12, border: "1px solid rgba(255,255,255,0.15)",
                    overflow: "hidden", fontFamily: FONT_BODY,
                    transition: "all 0.3s",
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
                        position: "absolute", top: "calc(100% + 12px)", right: 0,
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderRadius: 12, overflow: "hidden",
                        boxShadow: "0 24px 80px rgba(30,28,25,0.25)",
                        minWidth: 220, zIndex: 100,
                      }}
                    >
                      <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: T.text, fontFamily: FONT_BODY }}>{user?.name || "Student"}</div>
                        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3, fontFamily: FONT_BODY }}>{user?.email}</div>
                      </div>
                      {[
                        { to: "/profile", label: "My Profile", Icon: User },
                        { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
                        { to: "/wishlist", label: "Wishlist", Icon: Heart },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "12px 18px", fontSize: 13, fontWeight: 500, color: T.textSub,
                            transition: "background 0.15s", fontFamily: FONT_BODY,
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          ><item.Icon size={14} strokeWidth={1.5} />{item.label}</div>
                        </Link>
                      ))}
                      <button onClick={logout} style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "12px 18px", fontSize: 13, fontWeight: 500,
                        color: T.danger, background: "none", border: "none",
                        borderTop: `1px solid ${T.border}`, fontFamily: FONT_BODY,
                      }}><LogOut size={14} strokeWidth={1.5} /> Sign Out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop CTA */}
              <Link to="/add-resource" className="cc-desk-only">
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: `${T.accent}`,
                  padding: "10px 22px", borderRadius: 999,
                  fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "#fff", fontFamily: FONT_BODY,
                  transition: "all 0.3s",
                  border: "none",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.accentLt; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  List Item <ArrowUpRight size={12} />
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
                <div style={{ width: 22, height: 1.5, background: "rgba(255,255,255,0.8)", borderRadius: 1 }} />
                <div style={{ width: 22, height: 1.5, background: "rgba(255,255,255,0.8)", borderRadius: 1 }} />
                <div style={{ width: 14, height: 1.5, background: "rgba(255,255,255,0.5)", borderRadius: 1 }} />
              </button>
            </div>
          </nav>

          {/* ── HERO CONTENT ────────────────────────────────────────── */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            justifyContent: "center",
            padding: "0 clamp(24px, 6vw, 80px) 80px",
            maxWidth: 860,
          }}>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}
            >
              <div style={{
                width: 32, height: 1, background: T.accent,
              }} />
              <span style={{
                fontFamily: FONT_BODY, fontSize: "clamp(10px, 1.5vw, 11px)",
                color: "rgba(255,255,255,0.5)", letterSpacing: "0.35em",
                textTransform: "uppercase", fontWeight: 500,
              }}>
                University-Exclusive Marketplace
              </span>
            </motion.div>

            {/* Main heading — editorial serif */}
            <motion.h1
              className="cc-hero-heading"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
              style={{
                fontFamily: FONT_DISPLAY,
                color: "#FFFFFF",
                fontSize: "clamp(2.6rem, 6.5vw, 5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                fontWeight: 700,
              }}
            >
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>Your</em> Campus,
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>Your</em> Market.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
              style={{
                fontFamily: FONT_BODY,
                color: "rgba(255,255,255,0.55)",
                fontSize: "clamp(13px, 2vw, 15px)",
                lineHeight: 1.8, maxWidth: 400,
                marginTop: 24, fontWeight: 400,
              }}
            >
              Discover trusted deals within your campus community —
              buy, sell, and exchange with verified peers.
            </motion.p>

            {/* Profile warning */}
            {!isProfileComplete && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  marginTop: 18, display: "inline-flex", alignItems: "center",
                  gap: 8, padding: "8px 16px", borderRadius: 8,
                  background: "rgba(196,97,58,0.12)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(196,97,58,0.2)",
                  fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500,
                  fontFamily: FONT_BODY,
                }}
              >
                <AlertTriangle size={13} />
                Complete your profile
                <Link to="/profile" style={{ color: T.accentLt, fontWeight: 700 }}>Go →</Link>
              </motion.div>
            )}

            {/* CTA Row */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease: "easeOut" }}
              style={{
                marginTop: 40, display: "flex", flexWrap: "wrap",
                alignItems: "center", gap: 16,
              }}
            >
              <button
                onClick={() => navigate("/resources")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: T.accent, color: "#fff",
                  padding: "14px 32px", border: "none", borderRadius: 999,
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.18em",
                  textTransform: "uppercase", fontFamily: FONT_BODY,
                  transition: "all 0.3s",
                  boxShadow: `0 8px 30px ${T.accent}35`,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = T.accentLt; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Explore Marketplace
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => navigate("/add-resource")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "transparent",
                  color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "13px 28px", borderRadius: 999,
                  fontSize: 11, fontWeight: 500, letterSpacing: "0.18em",
                  textTransform: "uppercase", fontFamily: FONT_BODY,
                  transition: "all 0.3s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              >
                Start Selling
              </button>
            </motion.div>

            {/* Stats Row — minimal with dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
              style={{ marginTop: 56, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(16px, 3vw, 36px)" }}
            >
              {heroStats.map((st, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 3vw, 36px)" }}>
                  <div>
                    <div style={{
                      fontFamily: FONT_DISPLAY, color: "rgba(255,255,255,0.85)",
                      fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                      fontWeight: 600, letterSpacing: "-0.02em",
                    }}>{st.value}</div>
                    <div style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "clamp(9px, 1.2vw, 10px)",
                      letterSpacing: "0.2em", textTransform: "uppercase",
                      marginTop: 4, fontFamily: FONT_BODY, fontWeight: 500,
                    }}>{st.label}</div>
                  </div>
                  {i < heroStats.length - 1 && (
                    <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                  )}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{
              position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}
          >
            <span style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontFamily: FONT_BODY }}>
              Scroll
            </span>
            <div style={{
              width: 1, height: 28, background: "rgba(255,255,255,0.1)", borderRadius: 1, overflow: "hidden",
            }}>
              <motion.div
                style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.4)" }}
                animate={{ scaleY: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
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
              background: "rgba(30,28,25,0.97)", backdropFilter: "blur(12px)",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "28px 24px",
            }}>
              <span style={{
                fontFamily: FONT_BODY, color: "#fff", fontWeight: 600,
                fontSize: 15, letterSpacing: "0.25em", textTransform: "uppercase",
              }}>CampusCrate</span>
              <button onClick={() => setMobileOpen(false)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", padding: 8 }}
              ><X size={22} /></button>
            </div>

            {/* Menu items — serif editorial style */}
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center", gap: 6,
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
                  transition={{ duration: 0.4, delay: i * 0.06 + 0.1 }}
                >
                  <Link to={link.to} onClick={() => setMobileOpen(false)}>
                    <span style={{
                      fontFamily: FONT_DISPLAY, color: "rgba(255,255,255,0.8)",
                      fontSize: "clamp(28px, 8vw, 42px)",
                      fontWeight: 400, fontStyle: "italic",
                      letterSpacing: "0.02em", display: "block",
                      padding: "6px 0", textAlign: "center",
                      transition: "color 0.2s",
                    }}
                      onMouseEnter={e => e.target.style.color = "#fff"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.8)"}
                    >{link.label}</span>
                  </Link>
                </motion.div>
              ))}

              {/* Mobile CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                style={{ marginTop: 28 }}
              >
                <Link to="/add-resource" onClick={() => setMobileOpen(false)}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: T.accent,
                    padding: "12px 28px", borderRadius: 999,
                    fontSize: 11, fontWeight: 600,
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    color: "#fff", fontFamily: FONT_BODY,
                  }}>
                    List Item <ArrowUpRight size={13} />
                  </div>
                </Link>
              </motion.div>

              {/* Sign out */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  style={{
                    marginTop: 16, background: "none", border: "none",
                    color: "rgba(255,255,255,0.3)", fontSize: 12,
                    fontFamily: FONT_BODY, fontWeight: 500,
                    letterSpacing: "0.15em", textTransform: "uppercase",
                  }}
                >Sign Out</button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CONTENT — Warm Ivory ════════════════════════════════════ */}
      <main style={{ background: T.bg }}>

        {/* ── CATEGORIES — Asymmetric Layout ─────────────────────── */}
        <section style={{ padding: "clamp(4rem, 8vw, 7rem) clamp(20px, 4vw, 48px) clamp(2rem, 4vw, 4rem)" }}>
          <div className="cc-cat-layout" style={{
            maxWidth: 1200, margin: "0 auto",
            display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "clamp(2rem, 4vw, 4rem)",
            alignItems: "center",
          }}>
            {/* Left — Section intro */}
            <Reveal>
              <div>
                <div style={{
                  width: 28, height: 2, background: T.accent, marginBottom: 20,
                }} />
                <h2 style={{
                  fontFamily: FONT_DISPLAY, fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                  fontWeight: 600, color: T.primary, lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}>
                  Browse by<br /><em style={{ fontStyle: "italic" }}>Category</em>
                </h2>
                <p style={{
                  fontFamily: FONT_BODY, fontSize: 14, color: T.textSub,
                  lineHeight: 1.7, marginTop: 16, maxWidth: 320,
                }}>
                  Everything your campus life needs — from textbooks to project materials, all in one place.
                </p>
                <button onClick={() => navigate("/resources")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    marginTop: 20, fontSize: 11, fontWeight: 600, color: T.accent,
                    background: "none", border: "none", fontFamily: FONT_BODY,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    transition: "gap 0.3s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.gap = "10px"}
                  onMouseLeave={e => e.currentTarget.style.gap = "6px"}
                >
                  View all <ArrowRight size={13} />
                </button>
              </div>
            </Reveal>

            {/* Right — Category pills */}
            <Reveal delay={0.1}>
              <div className="cc-cat-pills" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {categories.map((cat, i) => {
                  const isActive = activeCat === cat.name;
                  return (
                    <motion.button
                      key={cat.name}
                      onClick={() => {
                        setActiveCat(isActive ? "All" : cat.name);
                        document.getElementById("listings-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 10,
                        padding: "14px 24px", borderRadius: 999,
                        background: isActive ? T.accent : T.surface,
                        border: `1px solid ${isActive ? T.accent : T.border}`,
                        color: isActive ? "#fff" : T.textSub,
                        fontFamily: FONT_BODY, fontSize: 13, fontWeight: 500,
                        cursor: "pointer", transition: "all 0.3s",
                        boxShadow: isActive ? `0 6px 24px ${T.accent}30` : "none",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{cat.icon}</span>
                      <span style={{ letterSpacing: "0.02em" }}>{cat.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── LISTINGS ──────────────────────────────────────────── */}
        <section id="listings-section" style={{ padding: "2rem clamp(20px, 4vw, 48px) clamp(4rem, 6vw, 6rem)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem" }}>
              <Reveal>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 28, height: 2, background: T.accent }} />
                  <h2 style={{
                    fontFamily: FONT_DISPLAY, fontSize: "clamp(1.4rem, 3vw, 2rem)",
                    fontWeight: 600, color: T.primary, letterSpacing: "-0.01em",
                  }}>
                    {activeCat === "All" ? <><em style={{ fontStyle: "italic" }}>Featured</em> Listings</> : activeCat}
                  </h2>
                </div>
              </Reveal>
            </div>

            {/* Filter pills */}
            <Reveal style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["All", ...categories.map(c => c.name)].map(cat => {
                  const isA = activeCat === cat;
                  return (
                    <button key={cat} onClick={() => setActiveCat(cat)}
                      style={{
                        padding: "7px 18px", borderRadius: 999,
                        fontSize: 11, fontWeight: 600, fontFamily: FONT_BODY,
                        background: isA ? T.primary : "transparent",
                        color: isA ? "#fff" : T.textMuted,
                        border: `1px solid ${isA ? T.primary : T.border}`,
                        letterSpacing: "0.08em", textTransform: "uppercase",
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
                    <Package size={40} color={T.textMuted} style={{ margin: "0 auto 1rem" }} />
                    <p style={{ color: T.textMuted, fontSize: 14, marginBottom: "1.25rem", fontFamily: FONT_BODY }}>
                      No listings in this category yet.
                    </p>
                    <button onClick={() => navigate("/add-resource")}
                      style={{
                        background: T.accent, color: "#fff", border: "none",
                        padding: "12px 28px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                        letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: FONT_BODY,
                      }}
                    >Post First Listing</button>
                  </div>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "1.25rem",
                  }}>
                    {filtered.map((r, idx) => {
                      const tb = typeBadge(r.type);
                      const wishlisted = isWishlisted(r._id);
                      const isSold = r.status === "Sold";
                      return (
                        <Reveal key={r._id} delay={idx * 0.04} y={20}>
                          <motion.div
                            onClick={() => !isSold && navigate(`/resource/${r._id}`)}
                            whileHover={!isSold ? { y: -6, boxShadow: `0 20px 60px rgba(30,28,25,0.12)` } : {}}
                            style={{
                              cursor: isSold ? "not-allowed" : "pointer",
                              borderRadius: 12, overflow: "hidden",
                              background: T.surface,
                              border: `1px solid ${isSold ? `${T.danger}30` : T.border}`,
                              opacity: isSold ? 0.65 : 1,
                              transition: "all 0.35s ease",
                            }}
                          >
                            {/* Image */}
                            <div style={{ position: "relative", height: 200, background: T.surfaceAlt, overflow: "hidden" }}>
                              {r.image_url
                                ? <img src={r.image_url} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                                    onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                                    onMouseLeave={e => e.target.style.transform = "scale(1)"}
                                  />
                                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={32} color={T.textMuted} strokeWidth={1} /></div>}
                              {isSold && (
                                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(196,97,58,0.15)" }}>
                                  <span style={{
                                    padding: "6px 24px", borderRadius: 4,
                                    background: T.danger, color: "#fff",
                                    fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                                    fontFamily: FONT_BODY,
                                  }}>Sold</span>
                                </div>
                              )}
                              {/* Type badge */}
                              <span style={{
                                position: "absolute", top: 12, left: 12,
                                padding: "5px 12px", fontSize: 10, fontWeight: 600,
                                background: "rgba(244,240,232,0.92)", backdropFilter: "blur(8px)",
                                color: tb.color, borderRadius: 999,
                                letterSpacing: "0.06em", textTransform: "uppercase",
                                fontFamily: FONT_BODY,
                              }}>{tb.label}</span>
                              {/* Wishlist */}
                              {!isSold && (
                                <motion.button
                                  onClick={e => toggleWishlist(r._id, e)}
                                  whileTap={{ scale: 0.8 }}
                                  style={{
                                    position: "absolute", top: 12, right: 12,
                                    width: 34, height: 34, borderRadius: "50%",
                                    background: "rgba(244,240,232,0.85)", backdropFilter: "blur(8px)",
                                    border: "none",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "transform 0.2s",
                                  }}
                                >
                                  <Heart size={14} color={wishlisted ? T.danger : T.textMuted} fill={wishlisted ? T.danger : "none"} strokeWidth={1.5} />
                                </motion.button>
                              )}
                            </div>
                            {/* Content */}
                            <div style={{ padding: "1rem 1.1rem 1.2rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                <h3 style={{
                                  fontSize: 15, fontWeight: 600, color: T.primary,
                                  lineHeight: 1.35, flex: 1, paddingRight: 10,
                                  display: "-webkit-box", WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical", overflow: "hidden",
                                  fontFamily: FONT_DISPLAY,
                                }}>{r.title}</h3>
                                <span style={{
                                  fontSize: 15, fontWeight: 700,
                                  color: isSold ? T.textMuted : T.accent, flexShrink: 0,
                                  fontFamily: FONT_BODY,
                                }}>
                                  {r.price > 0
                                    ? <span style={{ display: "flex", alignItems: "center", gap: 1 }}><IndianRupee size={12} />{r.price}</span>
                                    : "Free"}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, color: T.textMuted, fontSize: 12, marginBottom: "0.75rem", fontFamily: FONT_BODY }}>
                                <MapPin size={11} strokeWidth={1.5} /> {r.location || "Campus"}
                              </div>
                              <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                paddingTop: "0.75rem", borderTop: `1px solid ${T.border}`,
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{
                                    width: 24, height: 24, borderRadius: "50%",
                                    background: `${T.accent}18`, color: T.accent,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 10, fontWeight: 700, fontFamily: FONT_BODY,
                                  }}>{r.seller?.name?.charAt(0)?.toUpperCase() || "S"}</div>
                                  <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, fontFamily: FONT_BODY }}>
                                    {(typeof r.seller === "string" ? r.seller : r.seller?.name) || "Seller"}
                                  </span>
                                </div>
                                <span style={{
                                  fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                                  color: isSold ? T.danger : T.accent, fontFamily: FONT_BODY,
                                }}>{isSold ? "Sold" : "Contact"}</span>
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
                    background: "transparent",
                    color: T.accent,
                    border: `1px solid ${T.accent}`,
                    padding: "13px 32px", borderRadius: 999,
                    fontSize: 11, fontWeight: 600, letterSpacing: "0.15em",
                    textTransform: "uppercase", fontFamily: FONT_BODY,
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.accent; }}
                >
                  View All Listings <ArrowRight size={14} />
                </button>
              </Reveal>
            )}
          </div>
        </section>

        {/* ── WHY CAMPUSCRATE — Charcoal contrast section ─────── */}
        <section style={{
          padding: "clamp(4rem, 8vw, 7rem) clamp(20px, 4vw, 48px)",
          background: T.primary,
        }}>
          <div className="cc-trust-layout" style={{
            maxWidth: 1200, margin: "0 auto",
            display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "clamp(3rem, 5vw, 5rem)",
            alignItems: "center",
          }}>
            {/* Left — editorial intro */}
            <Reveal>
              <div>
                <div style={{
                  width: 28, height: 2, background: T.accent, marginBottom: 20,
                }} />
                <h2 style={{
                  fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                  fontWeight: 600, color: "#fff", lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}>
                  Built on<br /><em style={{ fontStyle: "italic" }}>Trust</em>
                </h2>
                <p style={{
                  fontFamily: FONT_BODY, fontSize: 14, color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.8, marginTop: 20, maxWidth: 340,
                }}>
                  CampusCrate isn't just a marketplace — it's a verified student ecosystem designed for safety, speed, and community.
                </p>
              </div>
            </Reveal>

            {/* Right — 2×2 feature grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px",
              background: "rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden",
            }}>
              {trustFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={i} delay={i * 0.08}>
                    <motion.div
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                      style={{
                        padding: "clamp(1.5rem, 3vw, 2rem)",
                        background: "rgba(255,255,255,0.03)",
                        transition: "all 0.3s",
                        height: "100%",
                      }}
                    >
                      <Icon size={22} color={T.accentLt} strokeWidth={1.5} style={{ marginBottom: 16 }} />
                      <h4 style={{
                        fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 600,
                        color: "rgba(255,255,255,0.9)", marginBottom: 8,
                      }}>{f.title}</h4>
                      <p style={{
                        fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6,
                        fontFamily: FONT_BODY,
                      }}>{f.desc}</p>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── STATS ─────────────────────────────────────────────── */}
        <section style={{
          padding: "clamp(4rem, 8vw, 6rem) clamp(20px, 4vw, 48px)",
          background: T.bg,
        }}>
          <div className="cc-grid-4" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
            maxWidth: 1000, margin: "0 auto",
          }}>
            {[
              { label: "Active Students", value: 2400, suffix: "+", icon: GraduationCap },
              { label: "Resources Listed", value: allResources.length || 850, suffix: "+", icon: Package },
              { label: "Successful Trades", value: 1200, suffix: "+", icon: Handshake },
              { label: "Campuses Covered", value: 15, suffix: "+", icon: MapPin },
            ].map((st, i, arr) => {
              const Icon = st.icon;
              return (
                <Reveal key={i} delay={i * 0.08}>
                  <div style={{
                    textAlign: "center", padding: "2rem 1rem",
                    borderRight: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                  }}>
                    <div style={{
                      fontFamily: FONT_DISPLAY, fontSize: "clamp(2rem, 4.5vw, 3rem)",
                      fontWeight: 700, color: T.primary, letterSpacing: "-0.03em", lineHeight: 1,
                    }}><Counter target={st.value} suffix={st.suffix} /></div>
                    <div style={{
                      fontSize: 10, color: T.textMuted, marginTop: 10, fontWeight: 600,
                      letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: FONT_BODY,
                    }}>
                      {st.label}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section style={{ padding: "0 clamp(20px, 4vw, 48px) clamp(4rem, 8vw, 7rem)" }}>
          <Reveal>
            <div style={{
              maxWidth: 1200, margin: "0 auto",
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 20, padding: "clamp(2.5rem, 5vw, 4rem)",
              display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem",
              alignItems: "center", position: "relative", overflow: "hidden",
            }}>
              {/* Decorative circle */}
              <div style={{
                position: "absolute", top: -80, right: -80, width: 320, height: 320,
                borderRadius: "50%", border: `1px solid ${T.border}`,
                pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", top: -40, right: -40, width: 240, height: 240,
                borderRadius: "50%", border: `1px solid ${T.border}`,
                pointerEvents: "none",
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{
                  width: 28, height: 2, background: T.accent, marginBottom: 20,
                }} />
                <h2 style={{
                  fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 4.5vw, 3rem)",
                  fontWeight: 600, color: T.primary,
                  lineHeight: 1.1, marginBottom: 16,
                }}>
                  Ready to<br /><em style={{ fontStyle: "italic" }}>de-clutter?</em>
                </h2>
                <p style={{
                  fontSize: 14, color: T.textSub, lineHeight: 1.7, maxWidth: 400,
                  marginBottom: 28, fontFamily: FONT_BODY,
                }}>
                  Post your first listing in under 2 minutes and start earning — or find your next great campus deal.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={() => navigate("/add-resource")}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: T.accent, color: "#fff", border: "none",
                      padding: "14px 28px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                      letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: FONT_BODY,
                      boxShadow: `0 8px 28px ${T.accent}30`,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.accentLt; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = "translateY(0)"; }}
                  >Start Selling <ArrowUpRight size={14} /></button>
                  <button onClick={() => navigate("/resources")}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "transparent",
                      color: T.textSub,
                      border: `1px solid ${T.border}`,
                      padding: "13px 28px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                      letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: FONT_BODY,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSub; }}
                  >Explore</button>
                </div>
              </div>
              <motion.div className="cc-cta-icon"
                animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "relative", zIndex: 1 }}
              ><ShoppingBag size={120} color={T.border} strokeWidth={0.5} /></motion.div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ══ FOOTER ══════════════════════════════════════════════════════ */}
      <footer style={{
        background: T.primary, color: "rgba(255,255,255,0.45)",
        padding: "clamp(3rem, 6vw, 5rem) 0 2rem",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
          <div className="cc-footer-grid" style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
            gap: "3rem", paddingBottom: "3rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.2rem" }}>
                <span style={{
                  fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600,
                  color: "rgba(255,255,255,0.8)", letterSpacing: "0.2em", textTransform: "uppercase",
                }}>CampusCrate</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 280, fontFamily: FONT_BODY, color: "rgba(255,255,255,0.35)" }}>
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
                <h5 style={{
                  fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)",
                  marginBottom: "1.2rem", fontFamily: FONT_BODY,
                }}>{col.heading}</h5>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                  {col.links.map(item => (
                    <li key={item.label}>
                      <Link to={item.to}>
                        <span style={{
                          fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: FONT_BODY,
                          transition: "color 0.2s", fontWeight: 400,
                        }}
                          onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.8)"}
                          onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
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
            <p style={{ fontSize: 11, fontFamily: FONT_BODY, color: "rgba(255,255,255,0.25)" }}>© {new Date().getFullYear()} CampusCrate. Built for the academic community.</p>
            <p style={{ fontSize: 11, fontFamily: FONT_BODY, color: "rgba(255,255,255,0.25)" }}>Made with ❤️ by StrawHats.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Homepage;