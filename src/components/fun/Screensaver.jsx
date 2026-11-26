import { useEffect, useRef, useState } from "react";

// After 30 s with no input, an arcade screensaver takes over: a neon "HA"
// logo bounces around DVD-style, changing colour on every wall hit.
// Any mouse move, key, scroll or touch ends it.
const COLORS = ["#ff2bd6", "#22e6ff", "#ffd23f", "#39ff88", "#a970ff", "#ff6b3d"];

export default function Screensaver({ enabled }) {
  const [on, setOn] = useState(false);
  const logo = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    let idle = 0;
    const tick = setInterval(() => {
      idle += 1;
      if (idle >= 30 && !document.body.style.overflow && !document.documentElement.dataset.blitz) setOn(true);
    }, 1000);
    const wake = () => { idle = 0; setOn(false); };
    const events = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart", "wheel"];
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    return () => { clearInterval(tick); events.forEach((e) => window.removeEventListener(e, wake)); };
  }, [enabled]);

  useEffect(() => {
    if (!on) return;
    let x = Math.random() * (window.innerWidth - 220), y = Math.random() * (window.innerHeight - 120);
    let vx = 160, vy = 120, c = 0, raf = 0, last = performance.now();
    const step = (now) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const el = logo.current; if (!el) return;
      const w = el.offsetWidth, h = el.offsetHeight;
      x += vx * dt; y += vy * dt;
      let hit = false;
      if (x < 0 || x > window.innerWidth - w) { vx *= -1; x = Math.max(0, Math.min(window.innerWidth - w, x)); hit = true; }
      if (y < 0 || y > window.innerHeight - h) { vy *= -1; y = Math.max(0, Math.min(window.innerHeight - h, y)); hit = true; }
      if (hit) { c = (c + 1) % COLORS.length; el.style.color = COLORS[c]; el.style.textShadow = `0 0 24px ${COLORS[c]}`; }
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [on]);

  if (!on) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] bg-black/80">
      <div ref={logo} className="absolute left-0 top-0 font-display text-7xl" style={{ color: COLORS[0], textShadow: `0 0 24px ${COLORS[0]}` }}>
        HA
        <div className="mt-1 text-center font-mono text-xs tracking-[0.3em] text-white/70">press any key</div>
      </div>
    </div>
  );
}
