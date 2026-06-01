/**
 * CampusCrate — Redesigned Premium Homepage
 * Warm Editorial × Soft 3D Bento × Awwwards-Grade
 * General Sans / Plus Jakarta Sans · Warm Ivory Palette
 * Single-file: React + Framer Motion + inline CSS-in-JS
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
  useSpring, useMotionValue, useInView, animate,
} from "framer-motion";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useWishlist } from "../context/WishlistContext";
import {
  Search, ArrowRight, Users, Package, MessageSquare, Bell,
  TrendingUp, GraduationCap, ShoppingBag, ChevronRight,
  Menu, X, User, LogOut, MapPin, IndianRupee, AlertTriangle,
  LayoutDashboard, Heart, Star, Sparkles, Shield, Zap, Handshake,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg: "#F6F7FB",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF1F6",
  primary: "#242B3D",
  primarySub: "#4A4C62",
  terra: "#FF5C5C",
  terraLt: "#FF7A7A",
  terraDk: "#E04848",
  olive: "#7A8B63",
  oliveLt: "#9BAD84",
  champ: "#D6C2A1",
  champLt: "#E8DCC8",
  champDk: "#B8A07A",
  text: "#242B3D",
  textSub: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E6E9EF",
  borderDk: "#D4D9E2",
  success: "#4A7C59",
  danger: "#B94040",
  warn: "#B87333",
};

// ─── Global Styles Injected Once ──────────────────────────────────────────────
const GlobalStyle = () => {
  useEffect(() => {
    const id = "cc-global-style";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        --bg: ${T.bg};
        --surface: ${T.surface};
        --surface-alt: ${T.surfaceAlt};
        --primary: ${T.primary};
        --terra: ${T.terra};
        --terra-lt: ${T.terraLt};
        --olive: ${T.olive};
        --champ: ${T.champ};
        --champ-lt: ${T.champLt};
        --text: ${T.text};
        --text-sub: ${T.textSub};
        --text-muted: ${T.textMuted};
        --border: ${T.border};
        --border-dk: ${T.borderDk};
        --font: 'Poppins', 'Plus Jakarta Sans', system-ui, sans-serif;
        --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
      }

      html { scroll-behavior: smooth; }

      body {
        font-family: var(--font);
        background: var(--bg);
        color: var(--text);
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
      }

      * { cursor: none !important; }
      @media (max-width: 768px) { * { cursor: auto !important; } }

      ::selection { background: ${T.terra}22; color: ${T.terra}; }

      /* Scrollbar */
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: var(--bg); }
      ::-webkit-scrollbar-thumb { background: var(--champ); border-radius: 999px; }

      /* Spinner */
      @keyframes cc-spin { to { transform: rotate(360deg); } }
      .cc-spinner {
        width: 28px; height: 28px;
        border: 2.5px solid ${T.border};
        border-top-color: ${T.terra};
        border-radius: 50%;
        animation: cc-spin 0.8s linear infinite;
      }

      /* Mag cursor effect */
      .cc-mag { transform-origin: center; }

      /* Noise overlay texture */
      @keyframes grain { 0%,100%{transform:translate(0,0)} 10%{transform:translate(-2%,-3%)} 20%{transform:translate(-4%,2%)} 30%{transform:translate(3%,-4%)} 40%{transform:translate(-1%,3%)} 50%{transform:translate(4%,2%)} 60%{transform:translate(-3%,-2%)} 70%{transform:translate(2%,4%)} 80%{transform:translate(-4%,-1%)} 90%{transform:translate(3%,3%)} }
      .cc-grain::after {
        content: '';
        position: fixed;
        inset: -200%;
        width: 400%; height: 400%;
        opacity: 0.025;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        pointer-events: none;
        z-index: 9999;
        animation: grain 8s steps(10) infinite;
      }

      /* Prevent link text decoration globally in cards */
      a { text-decoration: none; color: inherit; }
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
  const [label, setLabel] = useState("");

  const springConfig = { stiffness: 500, damping: 35, mass: 0.5 };
  const trailConfig = { stiffness: 160, damping: 28, mass: 1 };
  const dotX = useSpring(cursorX, springConfig);
  const dotY = useSpring(cursorY, springConfig);
  const trailX = useSpring(cursorX, trailConfig);
  const trailY = useSpring(cursorY, trailConfig);

  useEffect(() => {
    const move = (e) => { cursorX.set(e.clientX); cursorY.set(e.clientY); };
    const down = () => setClicking(true);
    const up = () => setClicking(false);

    const enter = (e) => {
      const el = e.target.closest("button, a, [data-cursor]");
      if (el) {
        setHovered(true);
        setLabel(el.dataset.cursorLabel || "");
      }
    };
    const leave = (e) => {
      if (!e.target.closest("button, a, [data-cursor]")) {
        setHovered(false);
        setLabel("");
      }
    };

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
      {/* Trail ring */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 99999,
          pointerEvents: "none", borderRadius: "50%",
          border: `1.5px solid ${T.primary}`,
          x: trailX, y: trailY,
          translateX: "-50%", translateY: "-50%",
        }}
        animate={{
          width: hovered ? 42 : clicking ? 16 : 28,
          height: hovered ? 42 : clicking ? 16 : 28,
          borderColor: hovered ? T.terra : T.primary,
          opacity: 0.5,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />
      {/* Dot */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 99999,
          pointerEvents: "none", borderRadius: "50%",
          background: hovered ? T.terra : T.primary,
          x: dotX, y: dotY,
          translateX: "-50%", translateY: "-50%",
        }}
        animate={{
          width: clicking ? 3 : 6,
          height: clicking ? 3 : 6,
          background: hovered ? T.terra : T.primary,
        }}
        transition={{ duration: 0.15 }}
      />
      {/* Label */}
      <AnimatePresence>
        {label && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 4 }}
            style={{
              position: "fixed", top: 0, left: 0, zIndex: 99998,
              pointerEvents: "none", x: trailX, y: trailY,
              translateX: "12px", translateY: "12px",
              background: T.primary, color: T.surface,
              fontSize: 11, fontWeight: 600, fontFamily: "var(--font)",
              padding: "4px 10px", borderRadius: 999,
              letterSpacing: "0.04em", whiteSpace: "nowrap",
            }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
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
      if (p < 1) requestAnimationFrame(tick);
      else setVal(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration, decimals]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
};

// ─── Organic Background Shapes ────────────────────────────────────────────────
const OrganicBg = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
    {[
      { size: 700, top: "-15%", left: "-8%", color: `${T.champ}18`, dur: 40 },
      { size: 500, top: "55%", right: "-10%", color: `${T.terra}0E`, dur: 35 },
      { size: 400, top: "30%", left: "40%", color: `${T.olive}0C`, dur: 50 },
      { size: 300, top: "80%", left: "20%", color: `${T.champ}12`, dur: 45 },
    ].map((b, i) => (
      <motion.div key={i}
        animate={{
          borderRadius: [
            "60% 40% 70% 30% / 50% 60% 40% 70%",
            "40% 70% 30% 60% / 70% 30% 60% 50%",
            "60% 40% 70% 30% / 50% 60% 40% 70%",
          ],
          x: [0, 30, -15, 0],
          y: [0, -20, 10, 0],
        }}
        transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: b.size, height: b.size,
          top: b.top, left: b.left, right: b.right,
          background: b.color,
          filter: "blur(60px)",
        }}
      />
    ))}
    {/* Subtle grid lines */}
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: `linear-gradient(${T.borderDk}20 1px, transparent 1px), linear-gradient(90deg, ${T.borderDk}20 1px, transparent 1px)`,
      backgroundSize: "80px 80px",
    }} />
  </div>
);

// ─── Scroll Reveal Wrapper ────────────────────────────────────────────────────
const Reveal = ({ children, delay = 0, y = 30, style, className }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} style={style} className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// ─── Magnetic Button ──────────────────────────────────────────────────────────
const MagBtn = ({
  children, onClick, href,
  variant = "primary", // "primary" | "outline" | "terra" | "ghost"
  style, disabled,
}) => {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 400, damping: 30 });
  const sy = useSpring(my, { stiffness: 400, damping: 30 });

  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width / 2) * 0.3);
    my.set((e.clientY - r.top - r.height / 2) * 0.3);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  const variants = {
    primary: {
      background: T.primary, color: T.surface,
      border: `1.5px solid ${T.primary}`,
    },
    terra: {
      background: T.terra, color: T.surface,
      border: `1.5px solid ${T.terra}`,
    },
    outline: {
      background: "transparent", color: T.primary,
      border: `1.5px solid ${T.border}`,
    },
    ghost: {
      background: `${T.surface}80`, color: T.primary,
      border: `1.5px solid ${T.border}`,
      backdropFilter: "blur(12px)",
    },
  };
  const v = variants[variant] || variants.primary;

  const baseStyle = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "0 1.5rem", height: 46, borderRadius: 12,
    fontSize: 14, fontWeight: 700, fontFamily: "var(--font)",
    letterSpacing: "0.01em", whiteSpace: "nowrap",
    ...v, ...style,
    position: "relative", overflow: "hidden",
  };

  const El = href ? "a" : "button";
  return (
    <motion.button
      as={El}
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      disabled={disabled}
      style={{ ...baseStyle, x: sx, y: sy }}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.button>
  );
};

// ─── Premium Card Shell ───────────────────────────────────────────────────────
const Card = ({ children, style, hover = true, className }) => {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 20 });
  const sry = useSpring(ry, { stiffness: 180, damping: 20 });

  const onMove = (e) => {
    if (!ref.current || !hover) return;
    const r = ref.current.getBoundingClientRect();
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 6);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ perspective: 1200 }} className={className}>
      <motion.div
        style={{
          rotateX: srx, rotateY: sry, transformStyle: "preserve-3d",
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          ...style,
        }}
        whileHover={hover ? {
          boxShadow: `0 20px 60px -15px ${T.primary}18, 0 4px 16px -4px ${T.primary}10`,
          y: -4,
        } : {}}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// ─── Type Badge ───────────────────────────────────────────────────────────────
const typeBadge = (type) => {
  if (type === "Free") return { bg: `${T.olive}18`, color: T.olive, label: "Free" };
  if (type === "Exchange") return { bg: `${T.warn}15`, color: T.warn, label: "Exchange" };
  return { bg: `${T.terra}15`, color: T.terraDk, label: type || "Sell" };
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOMEPAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const Homepage = () => {
  // ── All original state & logic preserved ──────────────────────────────────
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
  const heroY = useTransform(scrollY, [0, 600], [0, -80]);
  const heroBlobY = useTransform(scrollY, [0, 600], [0, -40]);

  useEffect(() => scrollY.on("change", v => setScrolled(v > 20)), [scrollY]);

  useEffect(() => {
    const fn = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/resource/all");
        if (res.data.success) setAllResources(res.data.resources);
      } catch (err) {
        console.error("Failed to fetch resources", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Data (preserved) ──────────────────────────────────────────────────────
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

  const toggleWishlist = (id, e) => {
    e.preventDefault(); e.stopPropagation();
    ctxToggle(id);
  };

  const trustFeatures = [
    { icon: Shield, title: "Verified Users", desc: "All members verified with university credentials.", color: T.olive },
    { icon: MessageSquare, title: "Secure Chat", desc: "Encrypted messaging built into the platform.", color: T.terra },
    { icon: Zap, title: "Fast Deals", desc: "Meet on campus for instant, hassle-free exchanges.", color: T.warn },
    { icon: Handshake, title: "Trusted Circle", desc: "A student ecosystem built on mutual trust.", color: T.primary },
  ];

  const stats = [
    { label: "Active Students", value: 2400, suffix: "+", emoji: "🎓" },
    { label: "Resources Listed", value: allResources.length || 850, suffix: "+", emoji: "📦" },
    { label: "Successful Trades", value: 1200, suffix: "+", emoji: "🤝" },
    { label: "Campuses Covered", value: 15, suffix: "+", emoji: "🌍" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <GlobalStyle />
      {/* Noise grain effect */}
      <div className="cc-grain" style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "none" }} />
      {/* Custom cursor — desktop only */}
      <div style={{ display: "none" }} id="cc-cursor-desktop">
        {typeof window !== "undefined" && window.innerWidth > 768 && <CustomCursor />}
      </div>
      <CustomCursor />
      <OrganicBg />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>

        {/* ══ NAVBAR ═══════════════════════════════════════════════════════ */}
        <motion.nav
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
            transition: "all 0.4s ease",
          }}
          animate={{
            background: scrolled ? `${T.surface}F2` : `${T.surface}CC`,
            backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${scrolled ? T.border : T.border}`,
            boxShadow: scrolled ? `0 4px 24px ${T.primary}08` : `0 1px 0 ${T.border}`,
          }}
        >
          <div style={{
            maxWidth: 1280, margin: "0 auto", padding: "0 2rem",
            height: 68, display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            {/* Left */}
            <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
              <Link to="/">
                <motion.div whileHover={{ scale: 1.02 }}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: T.primary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                  }}>
                    <img src="/uploads/campuscrate-logo.png" alt=""
                      style={{
                        width: "100%", height: "100%", objectFit: "contain",
                      }} />
                  </div>
                  <span style={{
                    fontWeight: 800, fontSize: 17, color: T.primary,
                    letterSpacing: "-0.02em",
                  }}>CampusCrate</span>
                </motion.div>
              </Link>

              {/* Desktop Nav Links */}
              <div style={{ display: "flex", gap: "0.25rem" }}
                className="cc-desktop-links">
                {[
                  { to: "/resources", label: "Browse" },
                  { to: "/add-resource", label: "Sell" },
                  { to: "/dashboard", label: "Dashboard" },
                ].map(link => (
                  <Link key={link.to} to={link.to}
                    style={{ display: "block" }}>
                    <motion.div
                      whileHover={{ background: `${T.primary}08` }}
                      style={{
                        padding: "6px 14px", borderRadius: 8,
                        fontSize: 14, fontWeight: 600, color: T.text,
                        letterSpacing: "0.01em",
                      }}
                    >{link.label}</motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Search */}
              <motion.div
                animate={{
                  width: searchFocused ? 220 : 160,
                  background: searchFocused ? T.surface : `${T.primary}06`,
                  border: `1px solid ${searchFocused ? T.border : "transparent"}`,
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "0 12px", height: 38, borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <Search size={14} style={{ color: T.textMuted, flexShrink: 0 }} />
                <input
                  type="text" placeholder="Search..."
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onKeyDown={e => { if (e.key === "Enter") navigate("/resources"); }}
                  style={{
                    border: "none", outline: "none", background: "transparent",
                    fontSize: 13, fontFamily: "var(--font)", color: T.text,
                    width: "100%",
                  }}
                />
              </motion.div>

              {/* Icon buttons */}
              {[
                { to: "/messages", Icon: MessageSquare, count: totalUnreadMessages },
                { to: "/notifications", Icon: Bell, count: unreadNotifications },
              ].map(({ to, Icon, count }) => (
                <Link key={to} to={to}>
                  <motion.div
                    whileHover={{ background: `${T.primary}0A` }}
                    whileTap={{ scale: 0.93 }}
                    style={{
                      position: "relative", width: 38, height: 38, borderRadius: 10,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: T.textSub,
                    }}
                  >
                    <Icon size={18} />
                    {count > 0 && (
                      <span style={{
                        position: "absolute", top: 6, right: 6,
                        width: 8, height: 8, borderRadius: "50%",
                        background: T.terra, border: `1.5px solid ${T.surface}`,
                      }} />
                    )}
                  </motion.div>
                </Link>
              ))}

              {/* Avatar / User Menu */}
              <div ref={userMenuRef} style={{ position: "relative" }}>
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: T.primary, color: T.surface,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 13, border: "none",
                    overflow: "hidden",
                  }}
                >
                  {user?.profile_image
                    ? <img src={user.profile_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : user?.name?.charAt(0)?.toUpperCase() || "U"}
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        position: "absolute", top: "calc(100% + 10px)", right: 0,
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderRadius: 16, overflow: "hidden",
                        boxShadow: `0 20px 60px -10px ${T.primary}20`,
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
                        <Link key={item.to} to={item.to}
                          onClick={() => setUserMenuOpen(false)}>
                          <motion.div whileHover={{ background: `${T.primary}06` }}
                            style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "11px 16px", fontSize: 13, fontWeight: 600, color: T.textSub,
                            }}
                          >
                            <item.Icon size={14} />
                            {item.label}
                          </motion.div>
                        </Link>
                      ))}
                      <button onClick={logout} style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "11px 16px", fontSize: 13, fontWeight: 600,
                        color: T.danger, background: "none", border: "none",
                        borderTop: `1px solid ${T.border}`,
                        fontFamily: "var(--font)",
                      }}>
                        <LogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Hamburger */}
              <motion.button
                onClick={() => setMobileOpen(!mobileOpen)}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.border}`,
                  background: "transparent", display: "flex", alignItems: "center",
                  justifyContent: "center", color: T.text,
                  display: "none", // shown via media query
                }}
                className="cc-hamburger"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden", background: T.surface, borderTop: `1px solid ${T.border}` }}
              >
                <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: 4 }}>
                  {[
                    { to: "/resources", label: "Browse" },
                    { to: "/add-resource", label: "Sell" },
                    { to: "/dashboard", label: "Dashboard" },
                    { to: "/wishlist", label: "Wishlist" },
                    { to: "/messages", label: "Messages" },
                    { to: "/notifications", label: "Notifications" },
                    { to: "/profile", label: "Profile" },
                  ].map(item => (
                    <Link key={item.to} to={item.to}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        padding: "12px 14px", borderRadius: 10, fontSize: 15,
                        fontWeight: 600, color: T.text,
                      }}
                    >{item.label}</Link>
                  ))}
                  <button onClick={logout}
                    style={{
                      marginTop: 8, padding: "12px 14px", borderRadius: 10,
                      background: `${T.danger}10`, color: T.danger, border: "none",
                      fontSize: 15, fontWeight: 700, fontFamily: "var(--font)",
                      textAlign: "left",
                    }}
                  >Sign Out</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* ══ MAIN ══════════════════════════════════════════════════════════ */}
        <main style={{ paddingTop: 68 }}>

          {/* ── HERO ──────────────────────────────────────────────────────── */}
          <section style={{ padding: "3rem 0 2.5rem", position: "relative", overflow: "hidden", minHeight: "65vh", display: "flex", alignItems: "center" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", width: "100%" }}>

              {/* Asymmetric grid: 55/45 */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4rem",
                alignItems: "center",
              }}>
                {/* Left: editorial copy */}
                <motion.div style={{ y: heroY }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "6px 14px", borderRadius: 999,
                      background: `${T.terra}14`, border: `1px solid ${T.terra}30`,
                      fontSize: 12, fontWeight: 700, color: T.terra,
                      letterSpacing: "0.05em", textTransform: "uppercase",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <Sparkles size={12} />
                    University-Exclusive Marketplace
                  </motion.div>

                  {/* Giant editorial headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      fontSize: "clamp(2.4rem, 4vw, 4rem)",
                      fontWeight: 900,
                      lineHeight: 1.0,
                      letterSpacing: "-0.04em",
                      color: T.primary,
                      marginBottom: "0.2em",
                    }}
                  >
                    Buy, Sell
                    <span style={{
                      display: "block",
                      WebkitTextStroke: `2px ${T.terra}`,
                      color: "transparent",
                    }}>
                      & Rent
                    </span>
                    <span style={{ color: T.terra }}>Anything.</span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.18 }}
                    style={{
                      fontSize: 17, color: T.textSub, lineHeight: 1.65,
                      maxWidth: 400, marginTop: "1.25rem", marginBottom: "2rem",
                      fontWeight: 400,
                    }}
                  >
                    Discover great deals, connect with trusted peers, and find what you need faster.
                    The smartest way to trade within your academic community.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.26 }}
                    style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
                  >
                    <MagBtn variant="primary" onClick={() => navigate("/resources")}>
                      Browse Marketplace <ArrowRight size={15} />
                    </MagBtn>
                    <MagBtn variant="outline" onClick={() => navigate("/add-resource")}>
                      Post Listing
                    </MagBtn>
                  </motion.div>

                  {!isProfileComplete && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      style={{
                        marginTop: "1.25rem", display: "inline-flex", alignItems: "center",
                        gap: 8, padding: "8px 14px", borderRadius: 10,
                        background: `${T.warn}12`, border: `1px solid ${T.warn}25`,
                        fontSize: 13, color: T.warn, fontWeight: 600,
                      }}
                    >
                      <AlertTriangle size={13} />
                      Complete your profile to unlock all features.
                      <Link to="/profile" style={{ color: T.terra, fontWeight: 700 }}>Go →</Link>
                    </motion.div>
                  )}

                  {/* Social proof */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    style={{
                      marginTop: "2rem", display: "flex", alignItems: "center", gap: 12,
                    }}
                  >
                    <div style={{ display: "flex" }}>
                      {["A", "P", "R", "D", "S"].map((l, i) => (
                        <div key={i} style={{
                          width: 30, height: 30, borderRadius: "50%",
                          border: `2px solid ${T.surface}`,
                          background: [T.primary, T.terra, T.olive, T.champDk, T.primarySub][i],
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: T.surface, fontSize: 11, fontWeight: 700,
                          marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i,
                          position: "relative",
                        }}>{l}</div>
                      ))}
                    </div>
                    <div>
                      <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
                        {[1, 2, 3, 4, 5].map(n => <Star key={n} size={11} fill={T.champ} color={T.champ} />)}
                      </div>
                      <span style={{ fontSize: 12, color: T.textSub, fontWeight: 500 }}>
                        Trusted by <strong style={{ color: T.text }}>2,400+</strong> students
                      </span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Right: Bento cards cluster */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: "relative" }}
                >
                  {/* Main trending card */}
                  <Card style={{ padding: "1.5rem" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12,
                      marginBottom: "1.25rem",
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: `${T.terra}15`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <TrendingUp size={18} color={T.terra} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: T.primary }}>Trending Today</div>
                        <div style={{ fontSize: 12, color: T.textSub }}>
                          {allResources.length || "24"} active listings
                        </div>
                      </div>
                      <motion.span
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        style={{
                          padding: "4px 10px", borderRadius: 999,
                          background: `${T.olive}18`, color: T.olive,
                          fontSize: 12, fontWeight: 700,
                        }}
                      >+12%</motion.span>
                    </div>

                    {allResources.slice(0, 3).map((r, i) => (
                      <motion.div key={r._id || i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "10px 0",
                          borderBottom: i < 2 ? `1px solid ${T.border}` : "none",
                        }}
                      >
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: T.surfaceAlt, overflow: "hidden", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {r.image_url
                            ? <img src={r.image_url} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <Package size={16} color={T.textMuted} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{r.category}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: T.terra }}>
                          {r.price > 0 ? `₹${r.price}` : "Free"}
                        </div>
                      </motion.div>
                    ))}

                    {allResources.length === 0 && !loading && (
                      <p style={{ color: T.textMuted, fontSize: 13, textAlign: "center", padding: "1rem 0" }}>
                        Be the first to list something!
                      </p>
                    )}
                  </Card>

                  {/* Floating stat badges */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      position: "absolute", bottom: -20, right: -20,
                      background: T.primary, borderRadius: 14,
                      padding: "10px 16px",
                      display: "flex", alignItems: "center", gap: 8,
                      boxShadow: `0 8px 24px ${T.primary}30`,
                    }}
                  >
                    <Users size={14} color={T.champ} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: T.surface }}>
                      <Counter target={2400} suffix="+" />
                    </span>
                    <span style={{ fontSize: 11, color: `${T.surface}80` }}>Students</span>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 6, delay: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      position: "absolute", top: -14, left: -14,
                      background: T.surface, borderRadius: 12,
                      padding: "8px 14px",
                      display: "flex", alignItems: "center", gap: 6,
                      border: `1px solid ${T.border}`,
                      boxShadow: `0 4px 16px ${T.primary}12`,
                    }}
                  >
                    <Star size={12} fill={T.champ} color={T.champ} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.primary }}>Trusted</span>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── CATEGORIES ──────────────────────────────────────────────────── */}
          <section style={{ padding: "2.5rem 0", borderTop: `1px solid ${T.border}` }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem" }}>
                <Reveal>
                  <div style={{
                    display: "inline-block", fontSize: 11, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: T.textMuted, marginBottom: "0.5rem",
                  }}>Explore</div>
                  <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.03em", color: T.primary }}>
                    Browse by Category
                  </h2>
                  <p style={{ color: T.textSub, fontSize: 15, marginTop: 6 }}>
                    Find resources shared by your fellow students
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <button onClick={() => navigate("/resources")}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      fontSize: 13, fontWeight: 700, color: T.terra,
                      background: "none", border: "none", fontFamily: "var(--font)",
                    }}
                    data-cursor data-cursor-label="View all"
                  >
                    View all <ChevronRight size={15} />
                  </button>
                </Reveal>
              </div>

              {/* Horizontal scrolling category pills on mobile, grid on desktop */}
              <div style={{
                display: "flex", gap: "1rem", flexWrap: "wrap",
              }}>
                {categories.map((cat, i) => {
                  const isActive = activeCat === cat.name;
                  return (
                    <Reveal key={cat.name} delay={i * 0.06}>
                      <motion.button
                        onClick={() => {
                          setActiveCat(isActive ? "All" : cat.name);
                          document.getElementById("listings-section")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center",
                          gap: 8, padding: "0.9rem 1.25rem", borderRadius: 14,
                          background: isActive ? T.primary : T.surface,
                          border: `1px solid ${isActive ? T.primary : T.border}`,
                          color: isActive ? T.surface : T.text,
                          fontFamily: "var(--font)", minWidth: 110,
                          transition: "all 0.25s ease",
                          boxShadow: isActive ? `0 8px 24px ${T.primary}25` : "none",
                        }}
                        data-cursor
                      >
                        <span style={{ fontSize: 28 }}>{cat.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.01em" }}>
                          {cat.name}
                        </span>
                      </motion.button>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── LISTINGS ──────────────────────────────────────────────────── */}
          <section id="listings-section"
            style={{
              padding: "2.5rem 0 3rem",
              background: `linear-gradient(180deg, transparent 0%, ${T.champLt}20 100%)`,
            }}
          >
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem" }}>
                <Reveal>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.textMuted, marginBottom: "0.5rem" }}>
                    Marketplace
                  </div>
                  <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.03em", color: T.primary }}>
                    {activeCat === "All" ? "Featured Listings" : activeCat}
                  </h2>
                  <p style={{ color: T.textSub, fontSize: 15, marginTop: 6 }}>
                    Top items from verified sellers today
                  </p>
                </Reveal>
              </div>

              {/* Filter pills */}
              <Reveal style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {["All", ...categories.map(c => c.name)].map(cat => {
                    const isA = activeCat === cat;
                    return (
                      <button key={cat} onClick={() => setActiveCat(cat)}
                        style={{
                          padding: "6px 16px", borderRadius: 999,
                          fontSize: 13, fontWeight: 600, fontFamily: "var(--font)",
                          background: isA ? T.terra : "transparent",
                          color: isA ? T.surface : T.textSub,
                          border: `1px solid ${isA ? T.terra : T.border}`,
                          transition: "all 0.2s ease",
                        }}
                      >{cat}</button>
                    );
                  })}
                </div>
              </Reveal>

              <AnimatePresence mode="wait">
                <motion.div key={activeCat}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                      <div className="cc-spinner" />
                    </div>
                  ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "5rem 0" }}>
                      <Package size={40} color={T.textMuted} style={{ margin: "0 auto 1rem" }} />
                      <p style={{ color: T.textSub, fontSize: 14, marginBottom: "1.25rem" }}>
                        No listings in this category yet.
                      </p>
                      <MagBtn variant="terra" onClick={() => navigate("/add-resource")}>
                        Post First Listing
                      </MagBtn>
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
                        return (
                          <Reveal key={r._id} delay={idx * 0.04} y={20}>
                            <Link to={`/resource/${r._id}`}>
                              <Card hover style={{ overflow: "hidden", padding: 0 }}>
                                {/* Image */}
                                <div style={{ position: "relative", height: 180, background: T.surfaceAlt, overflow: "hidden" }}>
                                  {r.image_url
                                    ? <img src={r.image_url} alt={r.title}
                                      style={{
                                        width: "100%", height: "100%", objectFit: "cover",
                                        transition: "transform 0.5s ease"
                                      }} />
                                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <Package size={36} color={T.textMuted} />
                                    </div>
                                  }
                                  {/* Type badge */}
                                  <span style={{
                                    position: "absolute", top: 12, left: 12,
                                    padding: "4px 10px", borderRadius: 999,
                                    fontSize: 11, fontWeight: 700,
                                    background: tb.bg, color: tb.color,
                                  }}>{tb.label}</span>
                                  {/* Wishlist button */}
                                  <motion.button
                                    onClick={e => toggleWishlist(r._id, e)}
                                    whileTap={{ scale: 0.8 }}
                                    style={{
                                      position: "absolute", top: 10, right: 10,
                                      width: 32, height: 32, borderRadius: "50%",
                                      background: `${T.surface}CC`, backdropFilter: "blur(8px)",
                                      border: `1px solid ${T.border}`,
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                    }}
                                    data-cursor
                                  >
                                    <Heart size={14}
                                      color={wishlisted ? "#ef4444" : T.textMuted}
                                      fill={wishlisted ? "#ef4444" : "none"} />
                                  </motion.button>
                                </div>

                                {/* Body */}
                                <div style={{ padding: "1rem" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                    <h3 style={{
                                      fontSize: 14, fontWeight: 700, color: T.text,
                                      lineHeight: 1.3, flex: 1, paddingRight: 8,
                                      display: "-webkit-box", WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical", overflow: "hidden",
                                    }}>{r.title}</h3>
                                    <span style={{ fontSize: 15, fontWeight: 800, color: T.terra, flexShrink: 0 }}>
                                      {r.price > 0
                                        ? <span style={{ display: "flex", alignItems: "center", gap: 1 }}>
                                          <IndianRupee size={11} />{r.price}
                                        </span>
                                        : "Free"}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: T.textMuted, fontSize: 12, marginBottom: "0.75rem" }}>
                                    <MapPin size={11} /> {r.location || "Campus"}
                                  </div>
                                  <div style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    paddingTop: "0.75rem", borderTop: `1px solid ${T.border}`,
                                  }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                      <div style={{
                                        width: 24, height: 24, borderRadius: "50%",
                                        background: T.primary, color: T.surface,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 10, fontWeight: 700,
                                      }}>
                                        {r.seller?.name?.charAt(0)?.toUpperCase() || r.seller?.charAt?.(0)?.toUpperCase() || "S"}
                                      </div>
                                      <span style={{ fontSize: 12, color: T.textSub, fontWeight: 600 }}>
                                        {(typeof r.seller === "string" ? r.seller : r.seller?.name) || "Seller"}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: T.terra }}>Contact</span>
                                  </div>
                                </div>
                              </Card>
                            </Link>
                          </Reveal>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {filtered.length > 0 && (
                <Reveal style={{ textAlign: "center", marginTop: "2.5rem" }}>
                  <MagBtn variant="outline" onClick={() => navigate("/resources")} style={{ height: 46, padding: "0 2rem" }}>
                    View All Listings →
                  </MagBtn>
                </Reveal>
              )}
            </div>
          </section>

          {/* ── TRUST FEATURES — Bento Grid ──────────────────────────────── */}
          <section style={{ padding: "3rem 0", borderTop: `1px solid ${T.border}` }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
              <Reveal style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.textMuted, marginBottom: "0.5rem" }}>
                  Why CampusCrate
                </div>
                <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.03em", color: T.primary }}>
                  Safe &amp; Seamless
                </h2>
                <p style={{ color: T.textSub, fontSize: 15, marginTop: 6, maxWidth: 480 }}>
                  We prioritize your security and convenience, ensuring every transaction is smooth within your trusted community.
                </p>
              </Reveal>

              {/* Bento: 2 large + 2 tall asymmetric */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gridTemplateRows: "auto",
                gap: "1.25rem",
              }}>
                {trustFeatures.map((f, i) => {
                  const Icon = f.icon;
                  const accents = [
                    { bg: `${T.olive}10`, border: `${T.olive}25` },
                    { bg: `${T.terra}10`, border: `${T.terra}25` },
                    { bg: `${T.warn}10`, border: `${T.warn}25` },
                    { bg: `${T.primary}08`, border: `${T.primary}20` },
                  ][i];
                  return (
                    <Reveal key={i} delay={i * 0.08}>
                      <Card hover style={{
                        padding: "1.75rem",
                        gridColumn: i === 0 ? "span 1" : "span 1",
                        minHeight: 180,
                      }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 14,
                          background: accents.bg, border: `1px solid ${accents.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginBottom: "1rem",
                        }}>
                          <Icon size={20} color={f.color} />
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 800, color: T.primary, marginBottom: "0.4rem", letterSpacing: "-0.02em" }}>
                          {f.title}
                        </h4>
                        <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.6 }}>
                          {f.desc}
                        </p>
                      </Card>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── STATS — Wide editorial strip ────────────────────────────── */}
          <section style={{
            padding: "3rem 0",
            background: T.primary,
            position: "relative", overflow: "hidden",
          }}>
            {/* Decorative text watermark */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "clamp(80px, 12vw, 160px)", fontWeight: 900,
              color: "rgba(255,255,255,0.03)", whiteSpace: "nowrap",
              letterSpacing: "-0.04em", userSelect: "none",
              pointerEvents: "none",
            }}>
              CAMPUS CRATE
            </div>

            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", position: "relative" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "2rem",
              }}>
                {stats.map((st, i) => (
                  <Reveal key={i} delay={i * 0.06}>
                    <div style={{ textAlign: "center" }}>
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
                        style={{ fontSize: 36, marginBottom: "0.5rem" }}
                      >{st.emoji}</motion.div>
                      <div style={{
                        fontSize: "clamp(2rem, 4vw, 3.5rem)",
                        fontWeight: 900, color: T.surface,
                        letterSpacing: "-0.04em", lineHeight: 1,
                      }}>
                        <Counter target={st.value} suffix={st.suffix} />
                      </div>
                      <div style={{ fontSize: 13, color: `${T.surface}70`, marginTop: 6, fontWeight: 500 }}>
                        {st.label}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA BANNER — Split editorial ────────────────────────────── */}
          <section style={{ padding: "5rem 0" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
              <Reveal>
                <div style={{
                  borderRadius: 28, overflow: "hidden",
                  background: `linear-gradient(135deg, ${T.terra} 0%, ${T.terraDk} 100%)`,
                  padding: "4rem",
                  display: "grid", gridTemplateColumns: "1fr auto",
                  gap: "2rem", alignItems: "center",
                  position: "relative",
                }}>
                  {/* Background pattern */}
                  <div style={{
                    position: "absolute", inset: 0, opacity: 0.06,
                    backgroundImage: `radial-gradient(circle at 30% 50%, ${T.surface} 1px, transparent 1px), radial-gradient(circle at 70% 50%, ${T.surface} 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                    pointerEvents: "none",
                  }} />

                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.12em", color: `${T.surface}80`, marginBottom: "0.75rem",
                    }}>
                      Ready to Start?
                    </div>
                    <h2 style={{
                      fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 900,
                      color: T.surface, letterSpacing: "-0.04em", lineHeight: 1.05,
                      marginBottom: "0.75rem",
                    }}>
                      De-clutter your dorm.<br />Earn instantly.
                    </h2>
                    <p style={{ fontSize: 16, color: `${T.surface}85`, lineHeight: 1.6, maxWidth: 440, marginBottom: "2rem" }}>
                      Post your first listing in under 2 minutes and start earning — or find your next great campus deal today.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      <MagBtn variant="ghost" onClick={() => navigate("/add-resource")}
                        style={{ background: T.surface, color: T.terra, border: "none", fontWeight: 800 }}>
                        Start Selling
                      </MagBtn>
                      <MagBtn variant="ghost" onClick={() => navigate("/resources")}
                        style={{ background: `${T.surface}20`, color: T.surface, border: `1.5px solid ${T.surface}40` }}>
                        Explore Listings
                      </MagBtn>
                    </div>
                  </div>

                  <motion.div
                    animate={{ y: [0, -14, 0], rotate: [0, 3, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    <ShoppingBag size={140} color={`${T.surface}18`} />
                  </motion.div>
                </div>
              </Reveal>
            </div>
          </section>

        </main>

        {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
        <footer style={{
          background: T.primary, color: `${T.surface}80`,
          padding: "4rem 0 2rem", borderTop: `1px solid ${T.primarySub}`,
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gap: "3rem",
              paddingBottom: "3rem",
              borderBottom: `1px solid ${T.primarySub}`,
            }}>
              {/* Brand */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9,
                    background: `${T.surface}15`, border: `1px solid ${T.surface}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                  }}>
                    <img src="/uploads/campuscrate-logo.png" alt=""
                      style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: T.surface, letterSpacing: "-0.02em" }}>
                    CampusCrate
                  </span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.65, maxWidth: 300, color: `${T.surface}60` }}>
                  The premium student-to-student marketplace designed for trust, safety, and local efficiency.
                </p>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                  {["🐦", "📸", "✉️"].map((icon, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.1, y: -2 }}
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${T.surface}10`, border: `1px solid ${T.surface}15`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 15,
                      }}
                    >{icon}</motion.div>
                  ))}
                </div>
              </div>

              {[
                {
                  heading: "Marketplace",
                  links: [
                    { to: "/resources", label: "Browse All" },
                    { to: "/resources", label: "Categories" },
                    { to: "/resources", label: "Best Deals" },
                    { to: "/", label: "Safety Guide" },
                  ],
                },
                {
                  heading: "Account",
                  links: [
                    { to: "/profile", label: "Profile" },
                    { to: "/dashboard", label: "Dashboard" },
                    { to: "/wishlist", label: "Wishlist" },
                    { to: "/notifications", label: "Notifications" },
                  ],
                },
              ].map(col => (
                <div key={col.heading}>
                  <h5 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: `${T.surface}50`, marginBottom: "1rem" }}>
                    {col.heading}
                  </h5>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {col.links.map(item => (
                      <li key={item.label}>
                        <Link to={item.to}>
                          <motion.span
                            whileHover={{ color: T.surface, x: 3 }}
                            style={{ fontSize: 14, color: `${T.surface}60`, display: "inline-block" }}
                          >{item.label}</motion.span>
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
              <p style={{ fontSize: 13 }}>
                © {new Date().getFullYear()} CampusCrate. Built for the academic community.
              </p>
              <p style={{ fontSize: 13 }}>Made with ❤️ for students, by StrawHats.</p>
            </div>
          </div>
        </footer>

      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .cc-desktop-links { display: none !important; }
          .cc-hamburger { display: flex !important; }
        }

        @media (max-width: 768px) {
          * { cursor: auto !important; }
        }

        @media (max-width: 900px) {
          section [style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          section [style*="grid-template-columns: repeat(4, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          section [style*="grid-template-columns: 2fr 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          section [style*="grid-template-columns: repeat(2, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          section [style*="grid-template-columns: repeat(4, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          section [style*="padding: 5rem 0"],
          section [style*="padding: 4rem 0 5rem"],
          section [style*="padding: 4rem 0"] {
            padding: 2.5rem 0 !important;
          }
        }

        /* Make the 1fr 1fr in hero work on tablet */
        @media (max-width: 768px) {
          .cc-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};

export default Homepage;