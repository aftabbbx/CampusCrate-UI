/**
 * CampusCrate — Homepage  (Solidroad-Inspired Light Design)
 *
 * Visual: Solidroad.com reference — illustrated hero, bright natural feel,
 * white navbar, green CTAs, forest-dark text, nature palette
 * Typography: Inter (standing in for Matter)
 * Palette: Off-White / White / Amber Yellow / Leaf Green / Forest Dark
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

/* ─── Solidroad Design Tokens ──────────────────────────────────────────────── */
const T = {
  bg: "#f9f9f9",
  surface: "#ffffff",
  surfaceAlt: "#f9f9f9",
  primary: "#0e220e",
  accent: "#f6d045",
  accentLt: "#f8dc6a",
  accentDk: "#d4b030",
  green: "#47c163",
  greenDk: "#3aad54",
  greenLt: "#5fd878",
  text: "#0e220e",
  textSub: "#4a5e4a",
  textMuted: "#8a9a8a",
  border: "#d3ddd3",
  borderLt: "#e8f0e8",
  danger: "#e05c3a",
  paleMint: "#cbeed3",
  paleTeal: "#bfe7e6",
  paleYellow: "#fcf2cb",
  white: "#ffffff",
  black: "#000000",
};

const EASE = [0.22, 1, 0.36, 1];

/* ─── Global Styles (no custom cursor) ───────────────────────────────────── */
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
        background: ${T.bg};
        color: ${T.text};
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
        margin: 0;
      }

      ::selection { background: ${T.green}30; color: ${T.primary}; }

      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: ${T.bg}; }
      ::-webkit-scrollbar-thumb { background: ${T.green}60; border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: ${T.green}; }

      @keyframes cc-spin { to { transform: rotate(360deg); } }
      .cc-spinner {
        width: 28px; height: 28px;
        border: 2.5px solid ${T.border};
        border-top-color: ${T.green};
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
        .cc-trust-layout { grid-template-columns: 1fr !important; }
        .cc-cat-layout { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 600px) {
        .cc-grid-4 { grid-template-columns: 1fr !important; }
        .cc-hero-heading { font-size: 2rem !important; line-height: 1.15 !important; letter-spacing: -0.8px !important; }
        .cc-cat-pills { flex-wrap: wrap !important; }
        .cc-hero-input { width: 100% !important; flex-direction: column !important; }
        .cc-hero-input input { border-radius: 12px !important; }
        .cc-hero-input button { border-radius: 12px !important; width: 100% !important; }
        .cc-trust-cards { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
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
  if (type === "Free") return { bg: T.paleMint, color: "#2d7a3e", label: "Free" };
  if (type === "Exchange") return { bg: T.paleTeal, color: "#2a7a7a", label: "Exchange" };
  return { bg: T.paleYellow, color: "#8a7020", label: type || "Sell" };
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

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <>
      <GlobalStyle />

      {/* ═══ NAVBAR — Dark Forest Glass Theme ═══════════════════════════════ */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000,
          padding: "0 clamp(20px, 3vw, 48px)",
          background: scrolled
            ? "rgba(10, 26, 10, 0.92)"
            : "rgba(10, 26, 10, 0.35)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: scrolled
            ? "1px solid rgba(71,193,99,0.15)"
            : "1px solid rgba(255,255,255,0.08)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(71,193,99,0.1)"
            : "none",
          transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div style={{
          maxWidth: 1360, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: scrolled ? 60 : 68,
          transition: "height 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>

          {/* ── Left: Logo + Nav Links ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <Link to="/" style={{
              display: "flex", alignItems: "center", gap: 10,
              textDecoration: "none", flexShrink: 0,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `linear-gradient(135deg, ${T.accent}, ${T.accentDk})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17,
                boxShadow: `0 2px 12px rgba(246,208,69,0.3)`,
                border: "1px solid rgba(255,255,255,0.15)",
              }}>🎓</div>
              <span style={{
                fontFamily: FONT, color: "#fff", fontWeight: 800,
                fontSize: 19, letterSpacing: "-0.5px",
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
                      color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                      letterSpacing: "-0.1px",
                      padding: "8px 16px",
                      borderRadius: 10,
                      background: isActive ? "rgba(71,193,99,0.18)" : "transparent",
                      border: isActive ? "1px solid rgba(71,193,99,0.25)" : "1px solid transparent",
                      display: "inline-block",
                      transition: "all 0.3s ease",
                    }}
                      onMouseEnter={e => { if (!isActive) { e.target.style.color = "#fff"; e.target.style.background = "rgba(255,255,255,0.08)"; e.target.style.borderColor = "rgba(255,255,255,0.1)"; } }}
                      onMouseLeave={e => { if (!isActive) { e.target.style.color = "rgba(255,255,255,0.6)"; e.target.style.background = "transparent"; e.target.style.borderColor = "transparent"; } }}
                    >{link.label}</span>
                  </Link>
                );
              })}
            </div>
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
                    border: "1px solid transparent",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <Icon size={18} color="rgba(255,255,255,0.65)" strokeWidth={1.6} />
                    {count > 0 && (
                      <span style={{
                        position: "absolute", top: 6, right: 6,
                        width: 8, height: 8, borderRadius: "50%",
                        background: T.accent,
                        border: "2px solid rgba(10,26,10,0.8)",
                        boxShadow: `0 0 8px ${T.accent}60`,
                      }} />
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="cc-desk-only" style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />

            {/* Avatar dropdown */}
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="cc-desk-only"
                style={{
                  background: userMenuOpen ? "rgba(255,255,255,0.12)" : "transparent",
                  border: `1px solid ${userMenuOpen ? "rgba(255,255,255,0.15)" : "transparent"}`,
                  cursor: "pointer",
                  fontFamily: FONT, fontSize: 13, fontWeight: 500,
                  color: "rgba(255,255,255,0.8)", padding: "5px 12px 5px 5px",
                  transition: "all 0.25s ease",
                  display: "flex", alignItems: "center", gap: 9,
                  borderRadius: 12,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { if (!userMenuOpen) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
              >
                {user?.profile_image
                  ? <img src={user.profile_image} alt="" style={{
                    width: 30, height: 30, borderRadius: 8, objectFit: "cover",
                    border: "2px solid rgba(71,193,99,0.3)",
                  }} />
                  : <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: `linear-gradient(135deg, rgba(71,193,99,0.3), rgba(71,193,99,0.15))`,
                    color: T.greenLt,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    border: "1px solid rgba(71,193,99,0.25)",
                  }}>{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
                }
                {user?.name?.split(" ")[0] || "Account"}
                <ChevronDown size={13} color="rgba(255,255,255,0.45)" style={{ transition: "transform 0.25s", transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
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
                      background: "rgba(14,28,14,0.95)",
                      backdropFilter: "blur(24px)",
                      border: "1px solid rgba(71,193,99,0.15)",
                      borderRadius: 16, overflow: "hidden",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                      minWidth: 240, zIndex: 100,
                    }}
                  >
                    <div style={{
                      padding: "16px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(71,193,99,0.06)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12,
                          background: `linear-gradient(135deg, rgba(71,193,99,0.25), rgba(71,193,99,0.1))`,
                          border: `1.5px solid rgba(71,193,99,0.3)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 15, fontWeight: 700, color: T.greenLt, fontFamily: FONT,
                          overflow: "hidden", flexShrink: 0,
                        }}>
                          {user?.profile_image
                            ? <img src={user.profile_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{user?.name || "Student"}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{user?.email}</div>
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
                            color: "rgba(255,255,255,0.65)", transition: "all 0.2s",
                            borderRadius: 10,
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(71,193,99,0.1)"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
                          ><item.Icon size={16} strokeWidth={1.5} color={T.green} />{item.label}</div>
                        </Link>
                      ))}
                    </div>
                    <div style={{ padding: "4px 6px 6px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <button onClick={logout} style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 14px", fontSize: 14, fontWeight: 500,
                        color: "#e05c3a", background: "none", border: "none",
                        cursor: "pointer", transition: "all 0.2s",
                        borderRadius: 10, fontFamily: FONT,
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(224,92,58,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      ><LogOut size={16} strokeWidth={1.5} /> Sign Out</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Golden CTA */}
            <Link to="/add-resource" className="cc-desk-only">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: `linear-gradient(135deg, ${T.accent}, ${T.accentDk})`,
                color: T.primary,
                padding: "10px 22px", borderRadius: 12,
                fontSize: 13, fontWeight: 700, fontFamily: FONT,
                transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                boxShadow: `0 2px 12px rgba(246,208,69,0.25), inset 0 1px 0 rgba(255,255,255,0.3)`,
                letterSpacing: "-0.1px",
                border: "1px solid rgba(246,208,69,0.4)",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(246,208,69,0.35), inset 0 1px 0 rgba(255,255,255,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(246,208,69,0.25), inset 0 1px 0 rgba(255,255,255,0.3)"; }}
              >
                List Item <ArrowRight size={14} />
              </div>
            </Link>

            {/* Hamburger */}
            <button
              className="cc-mob-only"
              onClick={() => setMobileOpen(true)}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: 10, borderRadius: 10,
                display: "flex", flexDirection: "column", gap: 4,
                cursor: "pointer", transition: "all 0.25s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            >
              <div style={{ width: 18, height: 2, background: "#fff", borderRadius: 1 }} />
              <div style={{ width: 18, height: 2, background: "#fff", borderRadius: 1 }} />
              <div style={{ width: 12, height: 2, background: "rgba(255,255,255,0.5)", borderRadius: 1 }} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ═══ HERO — Full illustrated image bg + centered text ═══════════════ */}
      <section style={{
        position: "relative", width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <img
          src={HERO_IMAGE}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", pointerEvents: "none",
          }}
        />

        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(14,34,14,0.25) 60%, rgba(14,34,14,0.6) 100%)",
          pointerEvents: "none",
        }} />

        <div style={{
          position: "relative", zIndex: 10,
          textAlign: "center",
          padding: "100px clamp(24px, 6vw, 80px) 0",
          maxWidth: 800,
        }}>
          <motion.h1
            className="cc-hero-heading"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            style={{
              fontFamily: FONT,
              fontSize: "clamp(36px, 6vw, 60px)",
              lineHeight: 1.1,
              letterSpacing: "-1.8px",
              fontWeight: 500,
              color: "#fff",
              marginBottom: 20,
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
              color: "rgba(255,255,255,0.85)",
              fontSize: "clamp(16px, 2vw, 19px)",
              lineHeight: 1.5, maxWidth: 550,
              margin: "0 auto 32px",
              fontWeight: 400,
              letterSpacing: "-0.38px",
            }}
          >
            Make every campus exchange better, faster, and more
            trusted with the student marketplace you can rely on.
          </motion.p>

          {!isProfileComplete && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                marginBottom: 20, display: "inline-flex", alignItems: "center",
                gap: 8, padding: "10px 18px", borderRadius: 12,
                background: "rgba(224,92,58,0.15)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(224,92,58,0.25)",
                fontSize: 13, color: "#fff", fontWeight: 500,
              }}
            >
              <AlertTriangle size={14} />
              Complete your profile
              <Link to="/profile" style={{ color: T.accent, fontWeight: 700 }}>Go →</Link>
            </motion.div>
          )}

          {/* Search / CTA Input Bar — Solidroad style */}
          <motion.div
            className="cc-hero-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            style={{
              display: "inline-flex", alignItems: "center",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: 16, padding: 6,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
              maxWidth: 520, width: "100%",
              border: `1px solid ${T.border}`,
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
                  letterSpacing: "-0.15px",
                }}
              />
            </div>
            <button
              onClick={() => navigate("/resources")}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: T.green, color: "#fff",
                padding: "12px 24px", borderRadius: 12,
                fontSize: 14, fontWeight: 600, fontFamily: FONT,
                border: "none", cursor: "pointer",
                transition: "all 0.25s",
                whiteSpace: "nowrap",
                boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.15)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.greenDk}
              onMouseLeave={e => e.currentTarget.style.background = T.green}
            >
              Explore <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>

        {/* Stats Strip at bottom of hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            zIndex: 10,
            background: "linear-gradient(180deg, rgba(14,34,14,0.0) 0%, rgba(14,34,14,0.85) 100%)",
            backdropFilter: "blur(12px)",
            padding: "48px clamp(20px, 4vw, 60px) 28px",
          }}
        >
          <div style={{
            maxWidth: 1100, margin: "0 auto",
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
          }} className="cc-grid-4">
            {[
              { value: "2,400+", label: "Students Active", icon: GraduationCap },
              { value: `${allResources.length || 850}+`, label: "Resources Listed", icon: Package },
              { value: "1,200+", label: "Successful Trades", icon: Handshake },
              { value: "15+", label: "Campuses", icon: MapPin },
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <motion.div key={i}
                  whileHover={{ y: -3, background: "rgba(255,255,255,0.12)" }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 20px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.3s ease",
                    cursor: "default",
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${T.accent}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    border: `1px solid ${T.accent}20`,
                  }}>
                    <Icon size={20} color={T.accent} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{
                      fontFamily: FONT, fontSize: 20, fontWeight: 800,
                      color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.2,
                    }}>{st.value}</div>
                    <div style={{
                      fontSize: 12, color: "rgba(255,255,255,0.55)",
                      fontWeight: 500, letterSpacing: "0.2px", marginTop: 2,
                    }}>{st.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ═══ PROFILE BANNER (if incomplete) ════════════════════════════════ */}
      {user && !isProfileComplete && (
        <section style={{ padding: "0 clamp(20px, 3vw, 40px)", marginTop: "-2rem" }}>
          <div style={{
            maxWidth: 1440, margin: "0 auto",
            background: T.white, border: `1px solid ${T.borderLt}`,
            borderRadius: 16, padding: "1.25rem 1.5rem",
            display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: T.paleMint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={20} color={T.green} />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: T.text, fontFamily: FONT }}>Complete Your Profile</div>
              <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>Fill in your details to unlock messaging & listings.</div>
            </div>
            <button onClick={() => navigate("/profile")} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: T.green, color: "#fff", border: "none",
              padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              fontFamily: FONT, cursor: "pointer",
            }}>Complete Profile <ArrowRight size={14} /></button>
          </div>
        </section>
      )}


      {/* ═══ MAIN CONTENT ════════════════════════════════════════════════ */}
      <main style={{ background: T.bg }}>

        {/* ── CATEGORIES ─────────────────────── */}
        <section style={{ padding: "clamp(4rem, 8vw, 7rem) clamp(20px, 3vw, 40px) clamp(2rem, 4vw, 4rem)" }}>
          <div className="cc-cat-layout" style={{
            maxWidth: 1440, margin: "0 auto",
            display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "clamp(2rem, 4vw, 4rem)", alignItems: "center",
          }}>
            <Reveal>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 36, background: T.paleMint, marginBottom: 20 }}>
                  <BookOpen size={14} color={T.green} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.green, letterSpacing: "0.5px", textTransform: "uppercase" }}>Categories</span>
                </div>
                <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 600, color: T.primary, lineHeight: 1.1, letterSpacing: "-1.44px" }}>
                  Browse by<br />Category
                </h2>
                <p style={{ fontFamily: FONT, fontSize: 16, color: T.textMuted, lineHeight: 1.6, marginTop: 16, maxWidth: 340 }}>
                  Everything your campus life needs — from textbooks to project materials, all in one place.
                </p>
                <button onClick={() => navigate("/resources")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, fontSize: 14, fontWeight: 600, color: T.green, cursor: "pointer", background: "none", border: "none", fontFamily: FONT, transition: "gap 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.gap = "12px"}
                  onMouseLeave={e => e.currentTarget.style.gap = "8px"}
                >View all <ArrowRight size={15} /></button>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="cc-cat-pills" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {categories.map(cat => {
                  const isActive = activeCat === cat.name;
                  return (
                    <motion.button key={cat.name}
                      onClick={() => { setActiveCat(isActive ? "All" : cat.name); document.getElementById("listings-section")?.scrollIntoView({ behavior: "smooth" }); }}
                      whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 10,
                        padding: "14px 24px", borderRadius: 14,
                        background: isActive ? T.green : T.white,
                        border: `1.5px solid ${isActive ? T.green : T.border}`,
                        color: isActive ? "#fff" : T.textSub,
                        fontFamily: FONT, fontSize: 14, fontWeight: 500,
                        cursor: "pointer", transition: "all 0.3s",
                        boxShadow: isActive ? `0 6px 20px ${T.green}30` : "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── LISTINGS ─────────────────────────── */}
        <section id="listings-section" style={{ padding: "clamp(2rem, 4vw, 4rem) clamp(20px, 3vw, 40px) clamp(5rem, 8vw, 7rem)" }}>
          <div style={{ maxWidth: 1440, margin: "0 auto" }}>
            <Reveal>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(2rem, 3vw, 3rem)", flexWrap: "wrap", gap: 16 }}>
                <h2 style={{ fontFamily: FONT, fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 600, color: T.primary, letterSpacing: "-1.44px" }}>
                  {activeCat === "All" ? "Featured Listings" : activeCat}
                </h2>
                <div style={{ display: "flex", gap: 4, alignItems: "center", background: T.white, borderRadius: 12, padding: 4, border: `1px solid ${T.borderLt}` }}>
                  {["All", ...categories.map(c => c.name)].map(cat => {
                    const isA = activeCat === cat;
                    return (
                      <button key={cat} onClick={() => setActiveCat(cat)}
                        style={{ padding: "8px 16px", fontSize: 13, fontWeight: isA ? 600 : 500, fontFamily: FONT, background: isA ? T.green : "transparent", color: isA ? "#fff" : T.textMuted, border: "none", borderRadius: 8, transition: "all 0.25s ease", cursor: "pointer" }}
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
                    <button onClick={() => navigate("/add-resource")} style={{ background: T.green, color: "#fff", border: "none", padding: "14px 32px", borderRadius: 14, fontSize: 14, fontWeight: 600, fontFamily: FONT, cursor: "pointer", boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.15)" }}>Post First Listing</button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "clamp(14px, 2vw, 20px)" }}>
                    {filtered.map((r, idx) => {
                      const tb = typeBadge(r.type);
                      const wishlisted = isWishlisted(r._id);
                      const isSold = r.status === "Sold";
                      return (
                        <Reveal key={r._id} delay={idx * 0.04} y={16}>
                          <motion.div
                            onClick={() => !isSold && navigate(`/resource/${r._id}`)}
                            whileHover={!isSold ? { y: -6 } : {}}
                            style={{ cursor: isSold ? "not-allowed" : "pointer", overflow: "hidden", background: T.white, border: `1px solid ${T.borderLt}`, borderRadius: 20, opacity: isSold ? 0.6 : 1, transition: "all 0.35s ease", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                          >
                            <div style={{ position: "relative", height: 220, background: T.surfaceAlt, overflow: "hidden" }}>
                              {r.image_url
                                ? <img src={r.image_url} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                                  onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                                  onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${T.paleMint}, ${T.paleTeal})` }}><Package size={32} color={T.textMuted} strokeWidth={1} /></div>
                              }
                              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)", pointerEvents: "none" }} />
                              <div style={{ position: "absolute", bottom: 14, left: 16, zIndex: 2 }}>
                                <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: FONT, letterSpacing: "-0.5px", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                                  {r.price > 0 ? <span style={{ display: "flex", alignItems: "center", gap: 2 }}><IndianRupee size={16} strokeWidth={2.5} />{r.price}</span> : "Free"}
                                </span>
                              </div>
                              {isSold && (
                                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)" }}>
                                  <span style={{ padding: "8px 24px", background: T.danger, color: "#fff", fontSize: 12, fontWeight: 700, borderRadius: 8, letterSpacing: "0.5px", textTransform: "uppercase" }}>Sold</span>
                                </div>
                              )}
                              <span style={{ position: "absolute", top: 14, left: 14, padding: "5px 12px", fontSize: 12, fontWeight: 600, background: tb.bg, color: tb.color, borderRadius: 8, fontFamily: FONT }}>{tb.label}</span>
                              {!isSold && (
                                <motion.button onClick={e => toggleWishlist(r._id, e)} whileTap={{ scale: 0.8 }}
                                  style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                                ><Heart size={15} color={wishlisted ? T.danger : T.textMuted} fill={wishlisted ? T.danger : "none"} strokeWidth={1.8} /></motion.button>
                              )}
                            </div>
                            <div style={{ padding: "16px 18px 18px" }}>
                              <h3 style={{ fontSize: 16, fontWeight: 600, color: T.primary, lineHeight: 1.4, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: FONT, letterSpacing: "-0.3px" }}>{r.title}</h3>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ width: 24, height: 24, borderRadius: 8, background: T.paleMint, color: T.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{r.seller?.name?.charAt(0)?.toUpperCase() || "S"}</div>
                                  <span style={{ fontSize: 13, color: T.textMuted }}>{(typeof r.seller === "string" ? r.seller : r.seller?.name) || "Seller"}</span>
                                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: T.border, display: "inline-block" }} />
                                  <span style={{ fontSize: 13, color: T.textMuted, display: "flex", alignItems: "center", gap: 3 }}><MapPin size={11} strokeWidth={1.5} />{r.location || "Campus"}</span>
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: isSold ? T.danger : T.green }}>{isSold ? "Sold" : "View →"}</span>
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
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, background: T.primary, color: T.white, padding: "15px 40px", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 600, fontFamily: FONT, transition: "all 0.3s", cursor: "pointer", boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.15)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.green; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = T.primary; e.currentTarget.style.transform = "translateY(0)"; }}
                >View All Listings <ArrowRight size={15} /></button>
              </Reveal>
            )}
          </div>
        </section>

        {/* ── WHY CAMPUSCRATE ─────────────────── */}
        <section style={{ padding: "clamp(5rem, 9vw, 8rem) clamp(20px, 3vw, 40px)", background: T.white, overflow: "hidden" }}>
          <div style={{ maxWidth: 1440, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "clamp(3rem, 5vw, 6rem)", alignItems: "start" }} className="cc-trust-layout">
            <Reveal>
              <div style={{ position: "sticky", top: 120 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 36, background: T.paleYellow, marginBottom: 20 }}>
                  <Sparkles size={14} color={T.accentDk} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.accentDk, letterSpacing: "0.5px", textTransform: "uppercase" }}>Why Us</span>
                </div>
                <h2 style={{ fontFamily: FONT, fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 600, color: T.primary, lineHeight: 1.05, letterSpacing: "-1.56px", marginBottom: 20 }}>
                  More than<br />a marketplace
                </h2>
                <p style={{ fontFamily: FONT, fontSize: 16, color: T.textMuted, lineHeight: 1.65, maxWidth: 320 }}>
                  A verified student ecosystem built for safety, speed, and trust — not just another listing board.
                </p>
                <div style={{ width: 48, height: 3, background: T.green, marginTop: 28, borderRadius: 2 }} />
              </div>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {trustFeatures.map((f, i) => {
                const Icon = f.icon;
                const decorBgs = [T.paleMint, T.paleYellow, T.paleTeal, T.surfaceAlt];
                const iconColors = [T.green, T.accentDk, "#e05c3a", T.primary];
                const topColors = [T.green, T.accent, T.danger, T.primary];
                return (
                  <Reveal key={i} delay={i * 0.1}>
                    <motion.div
                      whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
                      style={{ padding: "clamp(24px, 2.5vw, 32px)", background: T.white, border: `1px solid ${T.borderLt}`, borderRadius: 20, transition: "all 0.35s ease", cursor: "default", borderTop: `3px solid ${topColors[i]}`, boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}
                    >
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: decorBgs[i], display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                        <Icon size={22} color={iconColors[i]} strokeWidth={1.8} />
                      </div>
                      <h4 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, color: T.primary, marginBottom: 10, letterSpacing: "-0.5px", lineHeight: 1.2 }}>{f.title}</h4>
                      <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.6, fontFamily: FONT }}>{f.desc}</p>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────── */}
        <section style={{
          padding: "clamp(5rem, 10vw, 8rem) clamp(20px, 3vw, 40px)",
          background: "linear-gradient(135deg, #1a5c2e 0%, #2d8a4e 30%, #47c163 60%, #3aad54 100%)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative floating shapes */}
          <div style={{ position: "absolute", top: -80, right: -40, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 60, right: 120, width: 120, height: 120, borderRadius: "50%", background: "rgba(246,208,69,0.12)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -30, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 40, left: "40%", width: 80, height: 80, borderRadius: 20, transform: "rotate(45deg)", background: "rgba(246,208,69,0.1)", pointerEvents: "none" }} />
          {/* Noise texture */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", pointerEvents: "none" }} />

          <Reveal>
            <div style={{
              maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1,
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(16px)",
              borderRadius: 28, padding: "clamp(40px, 6vw, 64px) clamp(24px, 4vw, 48px)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 36, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", marginBottom: 28 }}>
                <Zap size={14} color="#fff" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase" }}>Get Started</span>
              </div>
              <h2 style={{ fontFamily: FONT, fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1.5px", color: "#fff", marginBottom: 18, textShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
                Your campus,<br />your market
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.65, maxWidth: 440, margin: "0 auto 36px", fontFamily: FONT }}>
                Post your first listing in under 2 minutes and start earning — or find your next great campus deal.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                <button onClick={() => navigate("/add-resource")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: "#fff", color: T.primary,
                    padding: "15px 34px", border: "none", borderRadius: 14,
                    fontSize: 15, fontWeight: 700, fontFamily: FONT,
                    transition: "all 0.3s ease", cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    letterSpacing: "-0.2px",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.18)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; }}
                >Start Selling <ArrowUpRight size={15} /></button>
                <button onClick={() => navigate("/resources")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: "transparent", color: "#fff",
                    border: "2px solid rgba(255,255,255,0.4)",
                    padding: "15px 34px", borderRadius: 14,
                    fontSize: 15, fontWeight: 600, fontFamily: FONT,
                    transition: "all 0.3s ease", cursor: "pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}
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
              background: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)",
              display: "flex", flexDirection: "column",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "24px 24px", borderBottom: `1px solid ${T.borderLt}`,
            }}>
              <span style={{ fontFamily: FONT, color: T.primary, fontWeight: 800, fontSize: 18 }}>🎓 CampusCrate</span>
              <button onClick={() => setMobileOpen(false)}
                style={{ background: T.surfaceAlt, border: "none", color: T.textMuted, padding: 10, borderRadius: 12, cursor: "pointer" }}
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
                      fontFamily: FONT, color: T.textSub,
                      fontSize: "clamp(24px, 7vw, 36px)", fontWeight: 600,
                      letterSpacing: "-0.84px", display: "block",
                      padding: "8px 0", textAlign: "center", transition: "color 0.2s",
                    }}
                      onMouseEnter={e => e.target.style.color = T.primary}
                      onMouseLeave={e => e.target.style.color = T.textSub}
                    >{link.label}</span>
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.5 }} style={{ marginTop: 28 }}>
                <Link to="/add-resource" onClick={() => setMobileOpen(false)}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: T.green, color: "#fff",
                    padding: "14px 36px", borderRadius: 14,
                    fontSize: 15, fontWeight: 600, fontFamily: FONT,
                    boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.15)",
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
                <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>🎓 CampusCrate</span>
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
                <h5 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255,255,255,0.35)", marginBottom: "1.2rem", fontFamily: FONT }}>{col.heading}</h5>
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