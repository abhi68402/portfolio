import { useEffect, useRef } from "react";
import { sections } from "../../data/content";
import { PALETTES_DARK, PALETTES_LIGHT, mixPalette, rainbowPalette } from "./palettes";

// ─────────────────────────────────────────────────────────────────────────────
//  The living synthwave backdrop behind the whole page:
//  striped neon sun, wireframe mountains, stars, and a perspective grid floor.
//   - scrolling drives the grid speed (fast scroll = "warp" speed lines)
//   - the cursor dents the grid; clicks send a ripple across it
//   - every section has its own colour palette, blended as you scroll
//  ~30 fps, paused when the tab is hidden, a still frame with reduced motion.
// ─────────────────────────────────────────────────────────────────────────────
export default function NeonGrid() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const g = cv.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, last = 0, t = 0;
    let travel = 0, speed = 0.4, lastScroll = window.scrollY, warpShown = false;
    let pointer = null;
    const ripples = [];
    let tops = [];
    const stars = Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random() * 0.55, p: Math.random() * 6 }));
    const mountains = [makeRidge(17), makeRidge(53)];

    const measure = () => {
      tops = sections.map((s) => { const el = document.getElementById(s.id); return el ? el.getBoundingClientRect().top + window.scrollY : 0; });
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth; h = window.innerHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      measure();
      draw();
    };

    function palette() {
      const light = document.documentElement.dataset.theme === "light";
      if (document.documentElement.dataset.rainbow) return rainbowPalette(t, light);
      const list = light ? PALETTES_LIGHT : PALETTES_DARK;
      const mid = window.scrollY + h * 0.5;
      let i = 0;
      while (i < tops.length - 1 && mid >= tops[i + 1]) i++;
      const end = tops[i + 1] ?? document.documentElement.scrollHeight;
      const frac = Math.max(0, Math.min(1, (mid - tops[i]) / Math.max(1, end - tops[i])));
      const blend = Math.max(0, (frac - 0.6) / 0.4);
      return mixPalette(list[i % list.length], list[(i + 1) % list.length], blend);
    }

    function draw() {
      const P = palette();
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const horizon = h * 0.58;

      // sky
      const sky = g.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, P.skyTop); sky.addColorStop(1, P.skyBottom);
      g.fillStyle = sky; g.fillRect(0, 0, w, horizon + 1);

      // stars
      for (const s of stars) {
        const a = P.stars * (0.4 + 0.6 * Math.sin(t * 1.6 + s.p));
        if (a < 0.05) continue;
        g.fillStyle = `rgba(255,255,255,${a})`;
        g.fillRect(s.x * w, s.y * h, 1.5, 1.5);
      }

      // striped sun sinking into the horizon
      const r = Math.min(w, h) * 0.22, cx = w / 2, cy = horizon - r * 0.45;
      const sun = g.createLinearGradient(0, cy - r, 0, cy + r);
      sun.addColorStop(0, P.sun1); sun.addColorStop(1, P.sun2);
      g.save();
      g.shadowColor = P.sun2; g.shadowBlur = P.glow ? 60 : 0;
      g.fillStyle = sun;
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
      g.restore();
      g.fillStyle = P.skyBottom;
      for (let i = 0; i < 7; i++) {
        const y = cy + r * (0.05 + i * 0.14), th = 2 + i * 1.6;
        g.fillRect(cx - r, y + ((t * 6) % (r * 0.14)), r * 2, th);
      }

      // wireframe mountains
      mountains.forEach((ridge, k) => drawRidge(g, ridge, w, horizon, k === 0 ? -1 : 1, P));

      // floor
      g.fillStyle = P.floor; g.fillRect(0, horizon, w, h - horizon);
      const glowLine = g.createLinearGradient(0, horizon - 2, 0, horizon + 6);
      glowLine.addColorStop(0, "transparent"); glowLine.addColorStop(0.5, P.grid); glowLine.addColorStop(1, "transparent");
      g.fillStyle = glowLine; g.fillRect(0, horizon - 2, w, 8);

      g.strokeStyle = P.grid;
      g.lineWidth = 1.2;
      g.shadowColor = P.grid; g.shadowBlur = P.glow ? 8 : 0;
      const depth = h - horizon;
      const dent = (x, y) => {
        let d = 0;
        if (pointer && pointer.y > horizon) {
          const dx = x - pointer.x, dy = y - pointer.y;
          d += 26 * Math.exp(-(dx * dx + dy * dy) / 9000) * ((y - horizon) / depth);
        }
        for (const rp of ripples) {
          const dist = Math.hypot(x - rp.x, (y - rp.y) * 1.6);
          const front = rp.age * 700;
          const k = Math.exp(-((dist - front) ** 2) / 1800) * Math.max(0, 1 - rp.age / 1.4);
          d += 16 * k * ((y - horizon) / depth);
        }
        return d;
      };
      // horizontal lines rushing toward you (z goes 1 → 0)
      const N = 16;
      for (let i = 0; i < N; i++) {
        const z = 1 - (((i + travel) % N) / N);
        const y = horizon + depth * Math.pow(1 - z, 2.4);
        if (y < horizon + 1) continue;
        g.beginPath();
        for (let sx = 0; sx <= 24; sx++) {
          const x = (sx / 24) * w;
          const yy = y + dent(x, y);
          sx ? g.lineTo(x, yy) : g.moveTo(x, yy);
        }
        g.stroke();
      }
      // lines converging on the vanishing point
      for (let i = -14; i <= 14; i++) {
        g.beginPath();
        for (let s = 0; s <= 12; s++) {
          const k = s / 12;
          const y = horizon + depth * k;
          const x = cx + i * (w / 11) * k;
          const yy = y + dent(x, y);
          s ? g.lineTo(x, yy) : g.moveTo(x, yy);
        }
        g.stroke();
      }
      g.shadowBlur = 0;

      // warp speed lines
      if (speed > 3) {
        const n = Math.min(40, (speed - 3) * 10);
        g.strokeStyle = P.grid;
        g.globalAlpha = Math.min(0.7, (speed - 3) / 6);
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, r0 = 60 + Math.random() * w * 0.3, len = 40 + Math.random() * 140;
          g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, horizon + Math.sin(a) * r0 * 0.6);
          g.lineTo(cx + Math.cos(a) * (r0 + len), horizon + Math.sin(a) * (r0 + len) * 0.6); g.stroke();
        }
        g.globalAlpha = 1;
      }
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      const target = 0.4 + Math.min(12, Math.abs(dy) / 12);
      speed += (target - speed) * Math.min(1, dt * 4);
      if (speed > 6 && !warpShown) {
        warpShown = true;
        window.dispatchEvent(new CustomEvent("toast-once", { detail: { id: "warp", icon: "⚡", text: "Speedrunner detected. Warp drive engaged." } }));
      }
      travel = (travel + dt * speed * (dy < 0 ? -1 : 1)) % 16;
      if (travel < 0) travel += 16;
      for (const rp of ripples) rp.age += dt;
      while (ripples.length && ripples[0].age > 1.4) ripples.shift();
      draw();
    }

    const onMove = (e) => { pointer = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { pointer = null; };
    const onClick = (e) => { if (!reduce) ripples.push({ x: e.clientX, y: e.clientY, age: 0 }); };
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const onScrollStill = () => { if (reduce) draw(); };
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    resize();
    cv.style.opacity = "1";
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("click", onClick);
    window.addEventListener("scroll", onScrollStill, { passive: true });
    window.addEventListener("themechange", draw);
    document.addEventListener("visibilitychange", onVis);
    if (!reduce) raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScrollStill);
      window.removeEventListener("themechange", draw);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-0 transition-opacity duration-700" />;
}

// A mountain ridge as a list of peaks (0..1 across half the screen)
function makeRidge(seed) {
  let s = seed;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  return Array.from({ length: 9 }, (_, i) => ({ x: i / 8, y: 0.25 + rnd() * 0.75 }));
}
function drawRidge(g, ridge, w, horizon, side, P) {
  const half = w * 0.42, base = horizon, peakH = horizon * 0.32;
  const pts = ridge.map((p) => [side < 0 ? p.x * half : w - p.x * half, base - p.y * peakH * (1 - p.x * 0.5)]);
  g.beginPath();
  g.moveTo(side < 0 ? 0 : w, base);
  pts.forEach(([x, y]) => g.lineTo(x, y));
  g.lineTo(side < 0 ? half : w - half, base);
  g.closePath();
  g.fillStyle = P.mount; g.fill();
  g.strokeStyle = P.grid; g.globalAlpha = 0.55; g.lineWidth = 1; g.stroke();
  // inner wireframe lines from each peak to the base
  pts.forEach(([x, y]) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + (side < 0 ? 18 : -18), base); g.stroke(); });
  g.globalAlpha = 1;
}
