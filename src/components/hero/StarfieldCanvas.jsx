import { useEffect, useRef } from "react";

// Quiet animated background for the hero: drifting stars plus two orbit
// ellipses with a "satellite" tracing each one.
// - Stops drawing when the hero is off screen (saves battery).
// - With prefers-reduced-motion it draws a single still frame.
export default function StarfieldCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, t = 0;
    let stars = [];
    let colors = readColors();

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      return { star: cs.getPropertyValue("--star").trim(), accent: cs.getPropertyValue("--accent").trim(), line: cs.getPropertyValue("--line-strong").trim() };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 9000); // density scales with area
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.6 + 0.15,
        v: Math.random() * 0.15 + 0.03,
      }));
      draw();
    }

    function orbit(cx, cy, rx, ry, rot, speed, phase) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.setLineDash([2, 6]);
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      const a = t * speed + phase;
      const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      // faint trail
      for (let i = 1; i < 14; i++) {
        const b = a - i * 0.02;
        ctx.globalAlpha = 0.35 * (1 - i / 14);
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(Math.cos(b) * rx, Math.sin(b) * ry, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        ctx.fillStyle = `rgb(${colors.star} / ${s.a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      const cx = w * (w > 1024 ? 0.72 : 0.6), cy = h * 0.48;
      const R = Math.min(w, h);
      orbit(cx, cy, R * 0.62, R * 0.2, -0.32, 0.25, 0);
      orbit(cx, cy, R * 0.45, R * 0.34, 0.5, -0.18, 2);
    }

    function step() {
      raf = 0;
      if (!visible) return;
      t += 1 / 60;
      for (const s of stars) {
        s.x -= s.v;
        if (s.x < 0) s.x = w;
      }
      draw();
      raf = requestAnimationFrame(step);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reduce && !raf) raf = requestAnimationFrame(step);
    });
    io.observe(canvas);

    const onTheme = () => { colors = readColors(); draw(); };
    window.addEventListener("themechange", onTheme);
    if (!reduce) raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("themechange", onTheme);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />;
}
