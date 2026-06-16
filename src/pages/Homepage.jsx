/**
 * CampusCrate — Homepage  (Dark Premium Redesign)
 *
 * Visual: Fullscreen video hero · Barlow Condensed bold · Dark premium palette
 * Typography: Barlow Condensed (display) + Inter (body)
 * Palette: Near-Black / Dark Surface / Burnished Gold / White
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
const FONT_DISPLAY = "'Barlow Condensed', 'Impact', 'Arial Narrow', sans-serif";
const FONT_BODY = "'Inter', 'DM Sans', system-ui, -apple-system, sans-serif";

/* ─── Video ─────────────────────────────────────────────────────────────────── */
const HERO_VIDEO = "/uploads/Firefly Cinematic premium brand film for a modern student marketplace platform.__Opening shot- Extre.mp4";

/* ─── Design Tokens — Dark Premium Palette ──────────────────────────────────── */
const T = {
  bg:        "#0D0D0D",   // near-black
  surface:   "#161616",   // dark surface
  surfaceAlt:"#1E1E1E",   // slightly lighter
  primary:   "#FFFFFF",   // white
  primarySub:"#E0E0E0",   // off-white
  accent:    "#D4AF37",   // burnished gold
  accentLt:  "#E8C84A",   // light gold
  accentDk:  "#B8960B",   // dark gold
  olive:     "#5B634E",   // olive
  oliveLt:   "#7A8B6C",   // light olive
  terra:     "#C4613A",   // terracotta
  text:      "#FFFFFF",   // white
  textSub:   "#A0A0A0",   // medium gray
  textMuted: "#666666",   // muted gray
  border:    "#2A2A2A",   // dark border
  borderDk:  "#3A3A3A",   // medium border
  success:   "#5B634E",   // olive
  danger:    "#C4613A",   // terracotta
  warn:      "#D4AF37",   // gold
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
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body {
        font-family: ${FONT_BODY};
        background: ${T.bg};
        color: ${T.text};
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
        margin: 0;
      }

      * { cursor: none !important; }
      @media (max-width: 768px) { * { cursor: auto !important; } }

      ::selection { background: ${T.accent}40; color: #fff; }

      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: ${T.bg}; }
      ::-webkit-scrollbar-thumb { background: ${T.accent}40; border-radius: 10px; }

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
        .cc-trust-strip { grid-template-columns: repeat(2, 1fr) !important; }
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
        overflow: "hidden", background: "#000",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* Background Video — PRESERVED */}
        <video
          autoPlay loop muted playsInline preload="auto"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", opacity: 0.6, pointerEvents: "none",
          }}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)",
        }} />

        {/* ── FIXED NAVBAR ─────────────────────────────────────────── */}
        <nav style={{
          position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000,
          padding: scrolled ? "14px clamp(20px, 3vw, 32px)" : "24px clamp(20px, 3vw, 32px)",
          background: scrolled ? "rgba(5,5,5,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          transition: "all 0.4s ease",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Brand */}
          <Link to="/">
            <span style={{
              fontFamily: FONT_DISPLAY, color: "#fff", fontWeight: 900,
              fontSize: "clamp(15px, 1.8vw, 19px)", letterSpacing: "0.14em",
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
                  fontFamily: FONT_BODY, fontSize: 10, color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600,
                  transition: "color 0.25s",
                }}
                  onMouseEnter={e => e.target.style.color = "#fff"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
                >{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right side — notification → CTA → divider → avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

            {/* Notification icons */}
            <div className="cc-desk-only" style={{ display: "flex", gap: 2, alignItems: "center" }}>
              {[
                { to: "/messages", Icon: MessageSquare, count: totalUnreadMessages },
                { to: "/notifications", Icon: Bell, count: unreadNotifications },
              ].map(({ to, Icon, count }) => (
                <Link key={to} to={to}>
                  <div style={{
                    position: "relative", width: 34, height: 34, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <Icon size={14} color="rgba(255,255,255,0.45)" strokeWidth={1.6} />
                    {count > 0 && (
                      <span style={{
                        position: "absolute", top: 7, right: 7,
                        width: 5, height: 5, borderRadius: "50%",
                        background: T.accent,
                      }} />
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* CTA */}
            <Link to="/add-resource" className="cc-desk-only">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: T.accent,
                padding: "9px 20px", borderRadius: 999,
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: "#000", fontFamily: FONT_BODY,
                transition: "all 0.3s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = T.accentLt; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                List Item <ArrowUpRight size={11} />
              </div>
            </Link>

            {/* Divider */}
            <div className="cc-desk-only" style={{
              width: 1, height: 22,
              background: "rgba(255,255,255,0.12)",
              margin: "0 6px",
            }} />

            {/* Avatar — far right corner */}
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 13,
                  border: userMenuOpen
                    ? `2px solid ${T.accent}`
                    : "2px solid rgba(255,255,255,0.15)",
                  overflow: "hidden", fontFamily: FONT_BODY,
                  transition: "all 0.25s",
                  cursor: "pointer",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
                onMouseLeave={e => { if (!userMenuOpen) e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                {user?.profile_image
                  ? <img src={user.profile_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : user?.name?.charAt(0)?.toUpperCase() || "U"}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      position: "absolute", top: "calc(100% + 14px)", right: 0,
                      background: "#111", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12, overflow: "hidden",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                      minWidth: 230, zIndex: 100,
                    }}
                  >
                    {/* User info header */}
                    <div style={{
                      padding: "16px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                      background: "rgba(255,255,255,0.03)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%",
                          background: `${T.accent}22`, border: `1.5px solid ${T.accent}60`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, color: T.accent, fontFamily: FONT_BODY,
                          overflow: "hidden", flexShrink: 0,
                        }}>
                          {user?.profile_image
                            ? <img src={user.profile_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", fontFamily: FONT_BODY }}>{user?.name || "Student"}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, fontFamily: FONT_BODY }}>{user?.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    {[
                      { to: "/profile", label: "My Profile", Icon: User },
                      { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
                      { to: "/wishlist", label: "Wishlist", Icon: Heart },
                    ].map(item => (
                      <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 11,
                          padding: "11px 18px", fontSize: 13, fontWeight: 500,
                          color: "rgba(255,255,255,0.6)",
                          transition: "all 0.15s", fontFamily: FONT_BODY,
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                        ><item.Icon size={14} strokeWidth={1.5} color={T.accent} />{item.label}</div>
                      </Link>
                    ))}
                    <button onClick={logout} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 11,
                      padding: "11px 18px", fontSize: 13, fontWeight: 500,
                      color: "rgba(255,80,80,0.75)", background: "none", border: "none",
                      borderTop: "1px solid rgba(255,255,255,0.06)", fontFamily: FONT_BODY,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,80,80,0.06)"; e.currentTarget.style.color = "#ff5050"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,80,80,0.75)"; }}
                    ><LogOut size={14} strokeWidth={1.5} /> Sign Out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hamburger */}
            <button
              className="cc-mob-only"
              onClick={() => setMobileOpen(true)}
              style={{
                background: "none", border: "none", padding: 8,
                display: "flex", flexDirection: "column", gap: 5,
                cursor: "pointer",
              }}
            >
              <div style={{ width: 22, height: 1.5, background: "rgba(255,255,255,0.8)", borderRadius: 1 }} />
              <div style={{ width: 22, height: 1.5, background: "rgba(255,255,255,0.8)", borderRadius: 1 }} />
              <div style={{ width: 14, height: 1.5, background: "rgba(255,255,255,0.5)", borderRadius: 1 }} />
            </button>
          </div>
        </nav>

        {/* ── HERO CONTENT — Centered ──────────────────────────────── */}
        <div style={{
          position: "relative", zIndex: 10,
          textAlign: "center",
          padding: "0 clamp(24px, 6vw, 80px)",
          maxWidth: 1000,
        }}>

          {/* Est. Tagline */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{
              display: "block",
              fontFamily: FONT_BODY, fontSize: 11, fontWeight: 700,
              color: "#D4AF37", letterSpacing: "0.5em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Est. 2024 • Verified Student Marketplace
          </motion.span>

          {/* Main heading */}
          <motion.h1
            className="cc-hero-heading"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(56px, 11vw, 140px)",
              lineHeight: 0.9,
              letterSpacing: "-0.01em",
              fontWeight: 900,
              textTransform: "uppercase",
              marginBottom: 32,
            }}
          >
            <span style={{ color: "#fff", display: "block" }}>The Student</span>
            <span style={{
              display: "block",
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(255,255,255,0.55)",
            }}>Standard</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
            style={{
              fontFamily: FONT_BODY,
              color: "rgba(255,255,255,0.75)",
              fontSize: "clamp(15px, 2vw, 18px)",
              lineHeight: 1.6, maxWidth: 580,
              margin: "0 auto 40px",
              fontWeight: 300,
            }}
          >
            A premium trading ecosystem crafted for university peers. Find
            precisely what you need, within the circle you trust.
          </motion.p>

          {/* Profile warning */}
          {!isProfileComplete && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                marginBottom: 24, display: "inline-flex", alignItems: "center",
                gap: 8, padding: "8px 16px", borderRadius: 8,
                background: "rgba(196,97,58,0.12)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(196,97,58,0.2)",
                fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500,
                fontFamily: FONT_BODY,
              }}
            >
              <AlertTriangle size={13} />
              Complete your profile
              <Link to="/profile" style={{ color: "#D4AF37", fontWeight: 700 }}>Go →</Link>
            </motion.div>
          )}

          {/* CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }}
            style={{
              display: "flex", flexWrap: "wrap",
              alignItems: "center", justifyContent: "center", gap: 20,
            }}
          >
            <button
              onClick={() => navigate("/resources")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "#fff", color: "#000",
                padding: "14px 32px", border: "none", borderRadius: 0,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                textTransform: "uppercase", fontFamily: FONT_BODY,
                transition: "all 0.3s",
                minWidth: 200, cursor: "pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.85)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
            >
              Enter Marketplace
            </button>

            <button
              onClick={() => navigate("/add-resource")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "transparent",
                color: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "14px 32px", borderRadius: 0,
                fontSize: 11, fontWeight: 600, letterSpacing: "0.2em",
                textTransform: "uppercase", fontFamily: FONT_BODY,
                transition: "all 0.3s", cursor: "pointer",
                minWidth: 200,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
            >
              Start Selling
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          <div style={{
            width: 1, height: 60,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.8))",
          }} />
        </motion.div>
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
              position: "fixed", inset: 0, zIndex: 2000,
              background: "rgba(10,10,10,0.97)", backdropFilter: "blur(12px)",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "28px 24px",
            }}>
              <span style={{
                fontFamily: FONT_DISPLAY, color: "#fff", fontWeight: 900,
                fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase",
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
                      fontWeight: 700, textTransform: "uppercase",
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

      {/* ═══ MAIN CONTENT ════════════════════════════════════════════════ */}
      <main style={{ background: T.bg }}>

        {/* ── CATEGORIES — Asymmetric Layout ─────────────────────── */}
        <section style={{ padding: "clamp(4rem, 8vw, 7rem) clamp(20px, 3vw, 32px) clamp(2rem, 4vw, 4rem)" }}>
          <div className="cc-cat-layout" style={{
            maxWidth: 1440, margin: "0 auto",
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
                  fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                  fontWeight: 800, color: T.primary, lineHeight: 1.05,
                  textTransform: "uppercase",
                }}>
                  Browse by<br />Category
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
                    marginTop: 20, fontSize: 11, fontWeight: 700, color: T.accent, cursor: "pointer",
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

        {/* ── LISTINGS — Editorial Grid ─────────────────────────── */}
        <section id="listings-section" style={{
          padding: "clamp(2rem, 4vw, 4rem) clamp(20px, 3vw, 32px) clamp(5rem, 8vw, 7rem)",
        }}>
          <div style={{ maxWidth: 1440, margin: "0 auto" }}>

            {/* Header row — title + inline filters */}
            <Reveal>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "clamp(2rem, 4vw, 3rem)",
                flexWrap: "wrap", gap: 20,
                borderBottom: `1px solid ${T.border}`,
                paddingBottom: 20,
              }}>
                {/* Left: section heading */}
                <h2 style={{
                  fontFamily: FONT_DISPLAY, fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                  fontWeight: 800, color: T.primary, textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}>
                  {activeCat === "All" ? "Featured Listings" : activeCat}
                </h2>

                {/* Right: inline tab filters */}
                <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
                  {["All", ...categories.map(c => c.name)].map((cat, i, arr) => {
                    const isA = activeCat === cat;
                    return (
                      <button key={cat} onClick={() => setActiveCat(cat)}
                        style={{
                          padding: "8px 16px",
                          fontSize: 10, fontWeight: 600, fontFamily: FONT_BODY,
                          background: "transparent",
                          color: isA ? T.accent : T.textMuted,
                          border: "none",
                          borderBottom: isA ? `2px solid ${T.accent}` : "2px solid transparent",
                          letterSpacing: "0.15em", textTransform: "uppercase",
                          transition: "all 0.25s ease",
                          cursor: "pointer",
                          marginBottom: -21,
                        }}
                      >{cat}</button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            <AnimatePresence mode="wait">
              <motion.div key={activeCat}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }}
              >
                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
                    <div className="cc-spinner" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "5rem 0" }}>
                    <Package size={36} color={T.textMuted} style={{ margin: "0 auto 1rem" }} />
                    <p style={{ color: T.textMuted, fontSize: 14, marginBottom: "1.25rem", fontFamily: FONT_BODY }}>
                      No listings in this category yet.
                    </p>
                    <button onClick={() => navigate("/add-resource")}
                      style={{
                        background: "#fff", color: "#000", border: "none",
                        padding: "13px 32px", borderRadius: 0, fontSize: 11, fontWeight: 700,
                        letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: FONT_BODY,
                        cursor: "pointer",
                      }}
                    >Post First Listing</button>
                  </div>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "clamp(12px, 2vw, 20px)",
                  }}>
                    {filtered.map((r, idx) => {
                      const tb = typeBadge(r.type);
                      const wishlisted = isWishlisted(r._id);
                      const isSold = r.status === "Sold";
                      return (
                        <Reveal key={r._id} delay={idx * 0.04} y={16}>
                          <motion.div
                            onClick={() => !isSold && navigate(`/resource/${r._id}`)}
                            whileHover={!isSold ? { y: -4 } : {}}
                            style={{
                              cursor: isSold ? "not-allowed" : "pointer",
                              overflow: "hidden",
                              background: T.surface,
                              border: `1px solid ${T.border}`,
                              borderRadius: 6,
                              opacity: isSold ? 0.6 : 1,
                              transition: "all 0.35s ease",
                            }}
                          >
                            {/* Image with gradient overlay */}
                            <div style={{
                              position: "relative", height: 220,
                              background: T.surfaceAlt, overflow: "hidden",
                            }}>
                              {r.image_url
                                ? <img src={r.image_url} alt={r.title} style={{
                                    width: "100%", height: "100%", objectFit: "cover",
                                    transition: "transform 0.6s ease",
                                  }}
                                    onMouseEnter={e => e.target.style.transform = "scale(1.08)"}
                                    onMouseLeave={e => e.target.style.transform = "scale(1)"}
                                  />
                                : <div style={{
                                    width: "100%", height: "100%",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    background: `linear-gradient(135deg, ${T.surface}, ${T.surfaceAlt})`,
                                  }}><Package size={32} color={T.textMuted} strokeWidth={1} /></div>
                              }

                              {/* Bottom gradient for text readability */}
                              <div style={{
                                position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
                                background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                                pointerEvents: "none",
                              }} />

                              {/* Price tag — bottom left over image */}
                              <div style={{
                                position: "absolute", bottom: 12, left: 14, zIndex: 2,
                              }}>
                                <span style={{
                                  fontSize: 18, fontWeight: 800, color: "#fff",
                                  fontFamily: FONT_DISPLAY,
                                  textShadow: "0 1px 6px rgba(0,0,0,0.4)",
                                }}>
                                  {r.price > 0
                                    ? <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <IndianRupee size={14} strokeWidth={2.5} />{r.price}
                                      </span>
                                    : "Free"}
                                </span>
                              </div>

                              {/* Sold overlay */}
                              {isSold && (
                                <div style={{
                                  position: "absolute", inset: 0,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  background: "rgba(0,0,0,0.45)",
                                }}>
                                  <span style={{
                                    padding: "6px 28px",
                                    background: T.danger, color: "#fff",
                                    fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
                                    textTransform: "uppercase", fontFamily: FONT_BODY,
                                  }}>Sold</span>
                                </div>
                              )}

                              {/* Type badge — top left */}
                              <span style={{
                                position: "absolute", top: 12, left: 12,
                                padding: "4px 10px", fontSize: 9, fontWeight: 700,
                                background: tb.color === T.accent ? T.accent : T.accent,
                                color: "#000",
                                borderRadius: 2,
                                letterSpacing: "0.1em", textTransform: "uppercase",
                                fontFamily: FONT_BODY,
                              }}>{tb.label}</span>

                              {/* Wishlist — top right */}
                              {!isSold && (
                                <motion.button
                                  onClick={e => toggleWishlist(r._id, e)}
                                  whileTap={{ scale: 0.8 }}
                                  style={{
                                    position: "absolute", top: 12, right: 12,
                                    width: 32, height: 32, borderRadius: "50%",
                                    background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all 0.2s",
                                  }}
                                >
                                  <Heart size={13} color={wishlisted ? T.danger : "rgba(255,255,255,0.7)"} fill={wishlisted ? T.danger : "none"} strokeWidth={1.8} />
                                </motion.button>
                              )}
                            </div>

                            {/* Content area — minimal */}
                            <div style={{ padding: "14px 14px 16px" }}>
                              <h3 style={{
                                fontSize: 14, fontWeight: 600, color: "#fff",
                                lineHeight: 1.4, marginBottom: 8,
                                display: "-webkit-box", WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical", overflow: "hidden",
                                fontFamily: FONT_BODY,
                              }}>{r.title}</h3>

                              <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                              }}>
                                {/* Seller + location */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{
                                    width: 22, height: 22, borderRadius: "50%",
                                    background: `${T.accent}20`, color: T.accent,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 9, fontWeight: 700, fontFamily: FONT_BODY,
                                  }}>{r.seller?.name?.charAt(0)?.toUpperCase() || "S"}</div>
                                  <span style={{
                                    fontSize: 11, color: T.textMuted, fontFamily: FONT_BODY,
                                  }}>
                                    {(typeof r.seller === "string" ? r.seller : r.seller?.name) || "Seller"}
                                  </span>
                                  <span style={{
                                    width: 3, height: 3, borderRadius: "50%", background: T.textMuted,
                                    display: "inline-block",
                                  }} />
                                  <span style={{
                                    fontSize: 11, color: T.textMuted, fontFamily: FONT_BODY,
                                    display: "flex", alignItems: "center", gap: 3,
                                  }}>
                                    <MapPin size={10} strokeWidth={1.5} />{r.location || "Campus"}
                                  </span>
                                </div>

                                {/* Action */}
                                <span style={{
                                  fontSize: 9, fontWeight: 700, letterSpacing: "0.15em",
                                  textTransform: "uppercase",
                                  color: isSold ? T.danger : T.accent, fontFamily: FONT_BODY,
                                }}>{isSold ? "Sold" : "View →"}</span>
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

            {/* View All — minimal text link */}
            {filtered.length > 0 && (
              <Reveal style={{ textAlign: "center", marginTop: "clamp(2rem, 4vw, 3.5rem)" }}>
                <button onClick={() => navigate("/resources")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: "#fff", color: "#000",
                    padding: "14px 36px", border: "none", borderRadius: 0,
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                    textTransform: "uppercase", fontFamily: FONT_BODY,
                    transition: "all 0.3s", cursor: "pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}
                >
                  View All Listings <ArrowRight size={14} />
                </button>
              </Reveal>
            )}
          </div>
        </section>

        {/* ── WHY CAMPUSCRATE — Bold Split Layout ─────────────────── */}
        <section style={{
          padding: "clamp(5rem, 9vw, 8rem) clamp(20px, 3vw, 32px)",
          background: "#0D0D0D",
          overflow: "hidden",
        }}>
          <div style={{
            maxWidth: 1440, margin: "0 auto",
            display: "grid", gridTemplateColumns: "1fr 1.6fr",
            gap: "clamp(3rem, 5vw, 6rem)", alignItems: "start",
          }} className="cc-trust-layout">

            {/* Left — sticky heading */}
            <Reveal>
              <div style={{ position: "sticky", top: 120 }}>
                <span style={{
                  fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700,
                  color: T.accent, letterSpacing: "0.4em",
                  textTransform: "uppercase", display: "block", marginBottom: 20,
                }}>
                  Why CampusCrate
                </span>
                <h2 style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: "clamp(2.6rem, 5.5vw, 5rem)",
                  fontWeight: 900, color: "#fff", lineHeight: 0.95,
                  textTransform: "uppercase", marginBottom: 28,
                }}>
                  More<br />Than A<br />
                  <span style={{
                    color: "transparent",
                    WebkitTextStroke: "2px rgba(255,255,255,0.3)",
                  }}>Market</span>
                </h2>
                <p style={{
                  fontFamily: FONT_BODY, fontSize: 14,
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.75, maxWidth: 300,
                }}>
                  A verified student ecosystem built for safety, speed, and trust — not just another listing board.
                </p>
                <div style={{ width: 40, height: 2, background: T.accent, marginTop: 28 }} />
              </div>
            </Reveal>

            {/* Right — 2×2 card grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}>
              {trustFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={i} delay={i * 0.1}>
                    <motion.div
                      whileHover={{ y: -6, borderColor: T.accent }}
                      style={{
                        padding: "clamp(1.5rem, 2.5vw, 2rem)",
                        background: "#161616",
                        border: "1px solid #252525",
                        borderRadius: 8,
                        transition: "all 0.35s ease",
                        cursor: "default",
                        borderTop: `3px solid ${T.accent}`,
                      }}
                    >
                      {/* Icon in gold pill */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 10,
                        background: `${T.accent}18`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 20,
                      }}>
                        <Icon size={20} color={T.accent} strokeWidth={1.8} />
                      </div>

                      <h4 style={{
                        fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 800,
                        color: "#fff", marginBottom: 10,
                        textTransform: "uppercase", letterSpacing: "0.04em",
                        lineHeight: 1.1,
                      }}>{f.title}</h4>

                      <p style={{
                        fontSize: 13, color: "rgba(255,255,255,0.5)",
                        lineHeight: 1.65, fontFamily: FONT_BODY,
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
          padding: "clamp(4rem, 8vw, 6rem) clamp(20px, 3vw, 32px)",
          background: T.bg,
        }}>
          <div className="cc-grid-4" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
            maxWidth: 1200, margin: "0 auto",
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
                      fontFamily: FONT_DISPLAY, fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
                      fontWeight: 900, color: T.accent, letterSpacing: "-0.03em", lineHeight: 1,
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

        {/* ── CTA — Full-Width Editorial ────────────────────────── */}
        <section style={{
          padding: "clamp(5rem, 10vw, 8rem) clamp(20px, 3vw, 32px)",
          background: "#111111",
          position: "relative",
        }}>
          {/* Subtle grain texture overlay */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            opacity: 0.02,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }} />

          <Reveal>
            <div style={{
              maxWidth: 1000, margin: "0 auto",
              textAlign: "center", position: "relative", zIndex: 1,
            }}>
              {/* Overline */}
              <span style={{
                fontFamily: FONT_BODY, fontSize: 10, fontWeight: 600,
                color: T.accent, letterSpacing: "0.4em",
                textTransform: "uppercase", display: "block", marginBottom: 24,
              }}>
                Get Started Today
              </span>

              {/* Headline */}
              <h2 style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
                fontWeight: 900, lineHeight: 0.95,
                textTransform: "uppercase",
                marginBottom: 12,
              }}>
                <span style={{ color: "#fff", display: "block" }}>Your campus</span>
                <span style={{
                  display: "block",
                  color: "transparent",
                  WebkitTextStroke: "1.5px rgba(255,255,255,0.25)",
                }}>Your market</span>
              </h2>

              {/* Gold divider */}
              <div style={{
                width: 60, height: 2, background: T.accent,
                margin: "32px auto",
              }} />

              <p style={{
                fontSize: "clamp(14px, 1.6vw, 16px)", color: "rgba(255,255,255,0.4)",
                lineHeight: 1.7, maxWidth: 480, margin: "0 auto 40px",
                fontFamily: FONT_BODY, fontWeight: 300,
              }}>
                Post your first listing in under 2 minutes and start earning
                — or find your next great campus deal.
              </p>

              {/* Buttons */}
              <div style={{
                display: "flex", justifyContent: "center",
                gap: 16, flexWrap: "wrap",
              }}>
                <button onClick={() => navigate("/add-resource")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: "#fff", color: "#000",
                    padding: "15px 36px", border: "none", borderRadius: 0,
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                    textTransform: "uppercase", fontFamily: FONT_BODY,
                    transition: "all 0.3s", cursor: "pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}
                >
                  Start Selling <ArrowUpRight size={14} />
                </button>
                <button onClick={() => navigate("/resources")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: "transparent", color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    padding: "15px 36px", borderRadius: 0,
                    fontSize: 11, fontWeight: 600, letterSpacing: "0.2em",
                    textTransform: "uppercase", fontFamily: FONT_BODY,
                    transition: "all 0.3s", cursor: "pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                >
                  Explore Listings
                </button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ══ FOOTER ══════════════════════════════════════════════════════ */}
      <footer style={{
        background: "#0A0A0A", color: "rgba(255,255,255,0.45)",
        padding: "clamp(3rem, 6vw, 5rem) 0 2rem",
      }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 clamp(20px, 3vw, 32px)" }}>
          <div className="cc-footer-grid" style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
            gap: "3rem", paddingBottom: "3rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.2rem" }}>
                <span style={{
                  fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 900,
                  color: "rgba(255,255,255,0.8)", letterSpacing: "0.12em", textTransform: "uppercase",
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