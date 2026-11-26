import { useEffect, useRef } from "react";
import { skillGroups } from "../../data/content";
import { stepCircles } from "./physics";

const COLORS = ["#ff2bd6", "#22e6ff", "#a970ff", "#ffb224", "#39ff88", "#ff6b6b"];

// Every skill is a neon ball (bigger = stronger) in a box with gravity.
// Grab and throw them, stir them with the cursor, tap to kick on phones.
// It only runs while it's on screen. The readable skill list sits beside it.
export default function BallPit() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current, cv = canvasRef.current;
    const ctx = cv.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let box = { w: 0, h: 0 }, bodies = [], raf = 0, running = false, last = 0, visible = false;
    let pointer = null, held = null, history = [];
    const light = () => document.documentElement.dataset.theme === "light";

    function build() {
      const scale = Math.min(1, box.w / 620);
      bodies = [];
      skillGroups.forEach((g, gi) => g.skills.forEach((s) => {
        const r = (16 + (s.level / 100) * 22) * (0.7 + 0.3 * scale);
        bodies.push({ label: s.name, r, color: COLORS[gi % COLORS.length], x: r + Math.random() * (box.w - 2 * r), y: -Math.random() * box.h * 1.5 - r, vx: (Math.random() - 0.5) * 200, vy: 0 });
      }));
      if (reduce) { for (let i = 0; i < 600; i++) stepCircles(bodies, box, 1 / 60); }
    }

    function resize() {
      const r = wrap.getBoundingClientRect();
      const first = !box.w;
      box = { w: r.width, h: r.height };
      cv.width = box.w * dpr; cv.height = box.h * dpr;
      cv.style.width = `${box.w}px`; cv.style.height = `${box.h}px`;
      if (first) build();
      draw();
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, box.w, box.h);
      const glow = !light();
      for (const b of bodies) {
        ctx.save();
        ctx.translate(b.x, b.y);
        if (glow) { ctx.shadowColor = b.color; ctx.shadowBlur = 16; }
        ctx.fillStyle = glow ? "#12082a" : "#ffffff";
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b === held ? 4 : 2.5;
        ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = glow ? "#f4efff" : "#170b2b";
        const size = Math.max(9, Math.min(13, b.r * 0.42));
        ctx.font = `600 ${size}px "JetBrains Mono Variable", monospace`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const label = ctx.measureText(b.label).width > b.r * 1.8 ? b.label.split(/[ /]/)[0] : b.label;
        ctx.fillText(label, 0, 1);
        ctx.restore();
      }
    }

    function tick(now) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (held && pointer) {
        held.vx = (pointer.x - held.x) / Math.max(dt, 0.001);
        held.vy = (pointer.y - held.y) / Math.max(dt, 0.001);
        held.x = pointer.x; held.y = pointer.y;
      } else if (pointer) {
        // stir: balls near the cursor get pushed away
        for (const b of bodies) {
          const dx = b.x - pointer.x, dy = b.y - pointer.y, d = Math.hypot(dx, dy);
          if (d < b.r + 40 && d > 0.1) { b.vx += (dx / d) * 60; b.vy += (dy / d) * 60; }
        }
      }
      stepCircles(bodies, box, dt);
      draw();
      if (visible) raf = requestAnimationFrame(tick); else running = false;
    }
    const start = () => { if (!running && !reduce) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); } };

    const local = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const hit = (p) => bodies.find((b) => Math.hypot(b.x - p.x, b.y - p.y) < b.r);
    const onDown = (e) => {
      const p = local(e);
      const b = hit(p);
      if (!b) return;
      if (e.pointerType === "touch") { b.vy -= 900; b.vx += (Math.random() - 0.5) * 500; start(); return; } // tap to kick
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
      held = b; b.held = true; pointer = p; history = [];
      cv.style.cursor = "grabbing";
      start();
    };
    const onMove = (e) => {
      if (e.pointerType === "touch" && !held) return;
      pointer = local(e);
      history.push([performance.now(), pointer.x, pointer.y]);
      history = history.slice(-5);
      cv.style.cursor = held ? "grabbing" : hit(pointer) ? "grab" : "default";
      start();
    };
    const onUp = () => {
      if (held) {
        held.held = false;
        if (history.length > 1) {
          const [t0, x0, y0] = history[0], [t1, x1, y1] = history[history.length - 1];
          const dt = Math.max(0.016, (t1 - t0) / 1000);
          held.vx = (x1 - x0) / dt; held.vy = (y1 - y0) / dt;
        }
        held = null;
        window.dispatchEvent(new CustomEvent("toast-once", { detail: { id: "ballpit", text: "Skill thrown! (He still has it, don't worry.)", icon: "🎱" } }));
      }
      cv.style.cursor = "default";
    };
    const onLeave = () => { if (!held) pointer = null; };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: 0.15 });
    io.observe(wrap);
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("themechange", draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("themechange", draw);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[380px] w-full overflow-hidden rounded-[15px] sm:h-[440px]">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Ball pit of skills: each ball is a skill, bigger balls are stronger skills. The full list is next to it."
        className="absolute inset-0 touch-pan-y"
      />
      <p className="pointer-events-none absolute left-4 top-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted">Grab · throw · stir</p>
    </div>
  );
}
