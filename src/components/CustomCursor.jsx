import { useState, useEffect, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

/* ─── Theme Colors ───────────────────────────────────────────────────── */
const PRIMARY = "#14213D";
const SECONDARY = "#2563EB";
const ACCENT = "#0F766E";

/* ═══════════════════════════════════════════════════════════════════════
   Custom Premium Cursor
   Renders a dot + ring + glow following the mouse.
   Mounts once at App level → visible on every page.
   Theme: Navy dot, Blue ring, Teal glow
   ═══════════════════════════════════════════════════════════════════════ */
const CustomCursor = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const trailX = useSpring(x, { stiffness: 220, damping: 24 });
  const trailY = useSpring(y, { stiffness: 220, damping: 24 });
  const glowX = useSpring(x, { stiffness: 90, damping: 20 });
  const glowY = useSpring(y, { stiffness: 90, damping: 20 });

  const [hovered, setHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const visibleRef = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover:none)").matches || "ontouchstart" in window) {
      setIsTouch(true);
      return;
    }

    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
    };

    const onOver = (e) => {
      setHovered(
        !!e.target.closest("button, a, [role=button], input, select, textarea, .mag")
      );
    };

    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isTouch) return null;

  const dotSize = hovered ? 20 : 8;
  const ringBorder = hovered
    ? `2px solid rgba(37,99,235,0.55)`
    : `1.5px solid rgba(37,99,235,0.22)`;

  return (
    <>
      {/* Hide native cursor globally on desktop */}
      <style>{`@media(hover:hover){*,*::before,*::after{cursor:none!important}}`}</style>

      {/* Soft teal glow */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 99997,
          width: 52, height: 52, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(15,118,110,0.14) 0%, transparent 70%)",
          x: glowX, y: glowY,
          translateX: "-50%", translateY: "-50%",
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Blue ring */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 99998,
          width: 34, height: 34, borderRadius: "50%",
          border: ringBorder,
          x: trailX, y: trailY,
          translateX: "-50%", translateY: "-50%",
          opacity: visible ? 1 : 0,
        }}
        animate={{ scale: hovered ? 1.55 : 1 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Navy dot */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 99999,
          borderRadius: "50%", background: PRIMARY,
          x, y,
          translateX: "-50%", translateY: "-50%",
          opacity: visible ? 0.9 : 0,
          width: dotSize, height: dotSize,
        }}
        animate={{ width: dotSize, height: dotSize }}
        transition={{ duration: 0.18 }}
      />
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   Cursor Trail — small particles left behind as the mouse moves.
   ═══════════════════════════════════════════════════════════════════════ */
export const CursorTrail = () => {
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    if (window.matchMedia("(hover:none)").matches || "ontouchstart" in window) return;

    let id = 0;
    const onMove = (e) => {
      const pt = { id: id++, x: e.clientX, y: e.clientY };
      setTrail((prev) => [...prev.slice(-6), pt]);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (trail.length === 0) return null;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99996 }}>
      {trail.map((pt, i) => (
        <motion.div
          key={pt.id}
          initial={{ opacity: 0.3, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.45 + i * 0.03 }}
          style={{
            position: "fixed",
            left: pt.x - 2.5, top: pt.y - 2.5,
            width: 5, height: 5, borderRadius: "50%",
            background: SECONDARY,
            opacity: ((i + 1) / trail.length) * 0.25,
          }}
        />
      ))}
    </div>
  );
};

export default CustomCursor;
