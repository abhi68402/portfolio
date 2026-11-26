import { useEffect, useRef, useState } from "react";
import { spring } from "./physics";

// Your name, where every letter is a little physics body:
// - letters lean away when the cursor comes close
// - grab one and fling it: it flies, falls, bounces off the screen edges
// - after a few seconds (or "Reassemble") they spring back home
// Screen readers get the plain name; the letters are decoration.
export default function KineticName({ lines, className = "", lineClassNames = [] }) {
  const h1Ref = useRef(null);
  const letterRefs = useRef([]);
  const [scattered, setScattered] = useState(false);
  const api = useRef({ reassemble: () => {} });
  const text = lines.join(" ");

  useEffect(() => {
    const els = letterRefs.current.filter(Boolean);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    // per-letter state: offset from home (x, y), velocity, rotation
    const L = els.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, free: 0, held: false }));
    let raf = 0, last = performance.now(), pointer = null, grab = null, running = false;

    const homeOf = (i) => {
      const h = h1Ref.current.getBoundingClientRect();
      const el = els[i];
      return { x: h.left + el.offsetLeft + el.offsetWidth / 2, y: h.top + el.offsetTop + el.offsetHeight / 2, w: el.offsetWidth, h: el.offsetHeight };
    };

    function wake() { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); } }

    function tick(now) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      let active = false;
      for (let i = 0; i < els.length; i++) {
        const s = L[i];
        const home = homeOf(i);
        if (s.held && grab) {
          // follow the pointer
          const nx = grab.px - home.x - grab.offX, ny = grab.py - home.y - grab.offY;
          s.vx = (nx - s.x) / Math.max(dt, 0.001); s.vy = (ny - s.y) / Math.max(dt, 0.001);
          s.x = nx; s.y = ny; s.rot += (s.vx * 0.0004 - s.rot * 0.2);
          active = true;
        } else if (s.free > 0) {
          // flying: gravity + bounce on the viewport edges
          s.free -= dt;
          s.vy += 1800 * dt;
          s.x += s.vx * dt; s.y += s.vy * dt; s.rot += s.vr * dt;
          const cx = home.x + s.x, cy = home.y + s.y;
          if (cx < home.w / 2) { s.x = home.w / 2 - home.x; s.vx = Math.abs(s.vx) * 0.6; s.vr *= -0.8; }
          if (cx > window.innerWidth - home.w / 2) { s.x = window.innerWidth - home.w / 2 - home.x; s.vx = -Math.abs(s.vx) * 0.6; s.vr *= -0.8; }
          if (cy > window.innerHeight - home.h / 2) { s.y = window.innerHeight - home.h / 2 - home.y; s.vy = -Math.abs(s.vy) * 0.55; s.vx *= 0.85; s.vr *= 0.7; }
          if (cy < home.h / 2) { s.y = home.h / 2 - home.y; s.vy = Math.abs(s.vy) * 0.5; }
          active = true;
        } else {
          // spring home, leaning away from a nearby cursor
          let fx = 0, fy = 0;
          if (pointer) {
            const dx = home.x + s.x - pointer.x, dy = home.y + s.y - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < 130 && d > 0.1) { const f = (1 - d / 130) * 32; fx = (dx / d) * f; fy = (dy / d) * f; }
          }
          [s.x, s.vx] = spring(s.x - fx, s.vx, dt, 200, 15); s.x += fx;
          [s.y, s.vy] = spring(s.y - fy, s.vy, dt, 200, 15); s.y += fy;
          [s.rot, s.vr] = spring(s.rot, s.vr, dt, 160, 12);
          if (Math.abs(s.x) + Math.abs(s.y) + Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.rot) > 0.05) active = true;
        }
        els[i].style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) rotate(${s.rot.toFixed(3)}rad)`;
      }
      const anyFree = L.some((s) => s.free > 0 || s.held);
      setScattered((v) => (v !== anyFree ? anyFree : v));
      if (active || pointer) raf = requestAnimationFrame(tick);
      else running = false;
    }

    const onMove = (e) => {
      if (grab) { grab.px = e.clientX; grab.py = e.clientY; }
      const r = h1Ref.current.getBoundingClientRect();
      const near = e.clientY > r.top - 160 && e.clientY < r.bottom + 160;
      pointer = near ? { x: e.clientX, y: e.clientY } : null;
      if (near) wake();
    };
    const onDown = (e) => {
      const i = els.indexOf(e.currentTarget);
      if (i < 0) return;
      e.preventDefault();
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
      const home = homeOf(i);
      L[i].held = true; L[i].free = 0;
      grab = { i, px: e.clientX, py: e.clientY, offX: e.clientX - (home.x + L[i].x), offY: e.clientY - (home.y + L[i].y) };
      wake();
    };
    const onUp = () => {
      if (!grab) return;
      const s = L[grab.i];
      s.held = false;
      const speed = Math.hypot(s.vx, s.vy);
      s.vx = Math.max(-2600, Math.min(2600, s.vx)); s.vy = Math.max(-2600, Math.min(2600, s.vy));
      s.vr = s.vx * 0.01;
      s.free = speed > 200 ? 4 : 0; // a real fling flies for 4 s, a gentle drop springs straight back
      grab = null;
      window.dispatchEvent(new CustomEvent("toast-once", { detail: { id: "fling", text: "You broke my name! (It heals in a few seconds.)", icon: "🔤" } }));
      wake();
    };
    // other parts of the site can scatter the letters (Glitch does this)
    const onKick = () => {
      L.forEach((s) => { s.free = 3; s.vx = (Math.random() - 0.5) * 1400; s.vy = -600 - Math.random() * 700; s.vr = (Math.random() - 0.5) * 20; });
      wake();
    };
    api.current.reassemble = () => { L.forEach((s) => { s.free = 0; }); wake(); };

    els.forEach((el) => el.addEventListener("pointerdown", onDown));
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("kick-letters", onKick);
    return () => {
      cancelAnimationFrame(raf);
      els.forEach((el) => el.removeEventListener("pointerdown", onDown));
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("kick-letters", onKick);
    };
  }, []);

  let n = 0;
  return (
    <div className="relative">
      <h1 ref={h1Ref} className={`relative ${className}`} aria-label={text}>
        {lines.map((line, li) => (
          <span key={li} className={`block whitespace-nowrap ${lineClassNames[li] || ""}`} aria-hidden="true">
            {[...line].map((ch, ci) => {
              const idx = n++;
              return (
                <span key={ci} ref={(el) => (letterRefs.current[idx] = el)} className="kinetic-letter">
                  {ch}
                </span>
              );
            })}
          </span>
        ))}
      </h1>
      {scattered && (
        <button type="button" onClick={() => api.current.reassemble()} className="neon-btn neon-btn-ghost absolute -bottom-12 left-0 !px-3 !py-1.5 !text-xs">
          ↺ Reassemble
        </button>
      )}
    </div>
  );
}
