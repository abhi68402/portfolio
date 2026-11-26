import { useCallback, useEffect, useRef, useState } from "react";
import { mascot, sections } from "../../data/content";
import { safeGet, safeSet } from "../../hooks/storage";
import { useActiveSection } from "../../hooks/useActiveSection";
import { createBrain } from "./brain";
import { attachReactions } from "./reactions";
import { drawPup, SPRITE_H, SPRITE_W } from "./sprite";

const ids = sections.map((s) => s.id);
const FLOOR = 6;          // px from the bottom of the screen to the floor
const SPACE_LEVELS = ["experience", "certifications", "contact"];

// Nova lives in a full-screen layer that lets clicks pass through; only Nova
// herself (a real <button>) and her speech bubble take clicks.
// Each frame: read the platforms on the page → update the brain → draw.
export default function Mascot({ onSendHome }) {
  const btnRef = useRef(null);
  const canvasRef = useRef(null);
  const bubbleRef = useRef(null);
  const ballRef = useRef(null);
  const rocketRef = useRef(null);
  const laserRef = useRef(null);
  const zzzRef = useRef(null);
  const brainRef = useRef(null);
  const ball = useRef(null);       // { x, y, vx, vy, on }
  const laser = useRef(null);      // { x, y, until, auto }
  const flags = useRef({ paperUntil: 0, party: false, fetching: false, hopCooldown: 0, howled: false });
  const pending = useRef([]);
  const clicks = useRef([]);
  const spoken = useRef(new Set());
  const lastSpoke = useRef(0);
  const activeRef = useRef("hero");
  const [bubble, setBubble] = useState(null);
  const [hearts, setHearts] = useState([]);
  const bubbleTimer = useRef(0);
  const reduce = useRef(matchMedia("(prefers-reduced-motion: reduce)").matches);
  const active = useActiveSection(ids);
  activeRef.current = active;

  const scale = typeof window !== "undefined" && window.innerWidth < 640 ? 1.75 : 2.25;
  const W = SPRITE_W * scale, H = SPRITE_H * scale;

  const say = useCallback((text, { force = false, home = false, ms = 4800 } = {}) => {
    const now = Date.now();
    if (!force && now - lastSpoke.current < 3500) return false;
    lastSpoke.current = now;
    setBubble({ text, home });
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), home ? ms + 3000 : ms);
    return true;
  }, []);

  const popHearts = useCallback(() => {
    const b = brainRef.current?.state;
    if (!b) return;
    const id = Date.now();
    setHearts((h) => [...h, ...[0, 1, 2].map((i) => ({ id: id + i, x: b.x + (i - 1) * 18, y: b.y - H }))]);
    setTimeout(() => setHearts((h) => h.filter((x) => x.id < id)), 1300);
  }, [H]);

  useEffect(() => {
    const firstVisit = !safeGet("nova-landed") && !reduce.current;
    safeSet("nova-landed", "1");
    const brain = createBrain({ startX: Math.max(60, Math.min(120, window.innerWidth * 0.12)), landing: firstVisit });
    brainRef.current = brain;
    const b = brain.state;
    const ctx = canvasRef.current.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasRef.current.width = W * dpr;
    canvasRef.current.height = H * dpr;

    // ── platforms: top edges of [data-perch] panels ──
    let perchEls = [];
    const keys = new WeakMap();
    let nextKey = 1;
    const collect = () => { perchEls = [...document.querySelectorAll("[data-perch]")]; };
    collect();
    const mo = new MutationObserver(collect);
    mo.observe(document.getElementById("main") || document.body, { childList: true, subtree: true });
    const keyOf = (el) => { if (!keys.has(el)) keys.set(el, `p${nextKey++}`); return keys.get(el); };
    const readPlats = () => {
      const out = [];
      const vh = window.innerHeight;
      for (const el of perchEls) {
        const r = el.getBoundingClientRect();
        if (r.width < 70 || r.bottom < 0 || r.top > vh) continue;
        out.push({ key: keyOf(el), el, l: r.left + 8, r: r.right - 8, top: r.top - 3 });
      }
      return out;
    };
    const platFor = (el) => { const r = el.getBoundingClientRect(); return { key: keyOf(el), l: r.left + 8, r: r.right - 8, top: r.top - 3 }; };

    let raf = 0, last = performance.now(), lastScroll = window.scrollY, rocketT = firstVisit ? 0 : 99;
    setTimeout(() => say(mascot.greeting, { force: true, ms: 6000 }), firstVisit ? 1900 : 1100);

    // ── API used by reactions.js and other events ──
    const api = {
      say,
      brain,
      get busy() { return ["leave", "landing"].includes(b.mode); },
      hopToElement(el, then) {
        const p = platFor(el);
        if (p.top < 80 || p.top > window.innerHeight - 30) return false;
        if (b.on === p.key) { brain.runTo(Math.max(p.l + 20, Math.min(p.r - 20, b.x)), then); return true; }
        const tx = Math.max(p.l + 24, Math.min(p.r - 24, b.x < p.l ? p.l + 40 : b.x > p.r ? p.r - 40 : b.x));
        brain.hopTo(tx, p.top, then);
        return true;
      },
      carryPaper(secs = 4) { flags.current.paperUntil = performance.now() + secs * 1000; brain.zoomies(); },
      happy(text) { brain.spin(0.8); brain.bark(); popHearts(); if (text) say(text, { force: true }); },
      laserAt(x, y) { laser.current = { x, y, until: performance.now() + 1400 }; },
      laserOff() { laser.current = null; },
      zoomies() { brain.zoomies(); },
    };
    const detach = attachReactions(api);
    // development only: lets automated tests drive Nova (stripped from the production build)
    if (import.meta.env.DEV) window.__nova = { brain, api, ball, laser, flags };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const covered = document.body.style.overflow === "hidden";
      btnRef.current.parentElement.style.visibility = covered ? "hidden" : "visible";
      if (covered) return;
      if (pending.current.length) pending.current.shift()();

      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (Math.abs(dy) > 1 && !reduce.current) brain.scrollNudge(dy);

      flags.current.hopCooldown -= dt;
      const plats = readPlats();
      const floorY = window.innerHeight - FLOOR;
      updateBall(dt, plats, floorY);
      updateLaser(now);
      brain.update(dt, { width: window.innerWidth, floorY, plats, reduce: reduce.current });
      moodChecks(now);

      // accessories
      const light = document.documentElement.dataset.theme === "light";
      const acc = [];
      if (light) acc.push("shades");
      else if (b.mode === "sleep" || b.mode === "sit") acc.push("nightcap");
      if (now < flags.current.paperUntil) acc.push("paper");
      if (flags.current.party) acc.push("party");
      const pose = brain.pose(acc);
      if (b.carrying) pose.mouth = true;

      // draw Nova
      btnRef.current.style.transform = `translate3d(${b.x - W / 2}px, ${b.y - H}px, 0)`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (b.flip) { ctx.translate(W / 2, H / 2); ctx.rotate(-b.flip * b.dir); ctx.translate(-W / 2, -H / 2); }
      drawPup(ctx, pose, W / 2, H, scale, b.dir < 0);

      // Zzz while sleeping
      if (zzzRef.current) {
        zzzRef.current.style.display = b.mode === "sleep" ? "block" : "none";
        zzzRef.current.style.transform = `translate3d(${b.x + (b.dir > 0 ? 10 : -30)}px, ${b.y - H * 0.75}px, 0)`;
      }

      // bubble above Nova (below her if she's near the top of the screen)
      if (bubbleRef.current) {
        const bw = bubbleRef.current.offsetWidth, bh = bubbleRef.current.offsetHeight;
        const left = Math.max(8, Math.min(window.innerWidth - bw - 8, b.x - bw / 2));
        let top = b.y - H - bh - 12;
        if (top < 70) top = b.y + 10;
        bubbleRef.current.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        bubbleRef.current.style.setProperty("--tail", `${Math.max(12, Math.min(bw - 12, b.x - left))}px`);
      }

      // rocket (first visit)
      if (rocketRef.current) {
        rocketT += dt;
        let ry;
        if (rocketT < 0.9) ry = (floorY - 80) * easeOut(rocketT / 0.9) - 120;
        else if (rocketT < 1.3) ry = floorY - 80;
        else ry = floorY - 80 - (rocketT - 1.3) ** 2 * 3000;
        rocketRef.current.style.transform = `translate3d(${b.x - 18}px, ${ry - 56}px, 0)`;
        rocketRef.current.style.display = rocketT > 2.4 ? "none" : "block";
      }
    };

    // ── ball: falls, bounces, lands on panels too; Nova fetches it ──
    function updateBall(dt, plats, floorY) {
      const bl = ball.current, el = ballRef.current;
      if (!el) return;
      if (!bl) { el.style.display = "none"; return; }
      if (bl.on) {
        const p = bl.on === "floor" ? { top: floorY, l: -1e4, r: 1e4 } : plats.find((q) => q.key === bl.on);
        if (!p || bl.x < p.l || bl.x > p.r) bl.on = null; else bl.y = p.top;
      }
      if (!bl.on) {
        const prev = bl.y;
        bl.vy += 1800 * dt; bl.y += bl.vy * dt; bl.x += bl.vx * dt; bl.vx *= 1 - 1.2 * dt;
        bl.x = Math.max(10, Math.min(window.innerWidth - 10, bl.x));
        if (bl.vy > 0) {
          let land = plats.find((p) => bl.x > p.l && bl.x < p.r && prev <= p.top + 3 && bl.y >= p.top);
          if (!land && bl.y >= floorY) land = { key: "floor", top: floorY };
          if (land) {
            bl.y = land.top; bl.vy *= -0.45;
            if (Math.abs(bl.vy) < 140) { bl.vy = 0; bl.on = land.key; }
          }
        }
      }
      // fetch logic
      if (bl.on && b.on && b.mode !== "air") {
        if (Math.abs(bl.x - b.x) < 16 && bl.on === b.on) {
          ball.current = null; b.carrying = true; brain.bark();
          setTimeout(() => { b.carrying = false; brain.poke(); say("Again! Click any empty space to throw it.", { force: true }); }, 1400);
        } else if (bl.on === b.on) {
          if (b.target == null) brain.runTo(bl.x);
        } else if (flags.current.hopCooldown <= 0) {
          flags.current.hopCooldown = 0.9;
          const top = bl.on === "floor" ? floorY : bl.y;
          brain.hopTo(bl.x, top);
        }
      }
      el.style.display = "block";
      el.style.transform = `translate3d(${bl.x - 7}px, ${bl.y - 14}px, 0)`;
    }

    // ── laser pointer: Nova chases it, leaps when it's just above her ──
    function updateLaser(now) {
      const L = laser.current, el = laserRef.current;
      if (L?.auto) { const k = (now - L.start) / 1000; L.x = window.innerWidth * (0.5 + 0.38 * Math.sin(k * 1.3)); L.y = window.innerHeight * (0.72 + 0.12 * Math.sin(k * 2.1)); }
      if (!L || now > L.until) { laser.current = null; if (el) el.style.display = "none"; return; }
      el.style.display = "block";
      el.style.transform = `translate3d(${L.x - 5}px, ${L.y - 5}px, 0)`;
      if (!b.on || b.mode === "leave") return;
      const dx = L.x - b.x, above = b.y - L.y;
      if (above > 30 && above < 200 && Math.abs(dx) < 120 && flags.current.hopCooldown <= 0) {
        flags.current.hopCooldown = 0.8;
        brain.hopTo(L.x, L.y);
      } else if (Math.abs(dx) > 18) brain.runTo(L.x);
    }

    // ── moods that depend on where we are ──
    function moodChecks() {
      const light = document.documentElement.dataset.theme === "light";
      if (!flags.current.howled && !light && SPACE_LEVELS.includes(activeRef.current) && b.idleFor > 8 && b.mode === "idle" && b.on) {
        flags.current.howled = true;
        brain.howl(2.6);
        say("Awoooooo! 🌕", { force: true });
      }
    }

    // click on empty space → throw a ball
    const onDocClick = (e) => {
      if (reduce.current || e.button !== 0) return;
      if (e.target.closest("a, button, input, textarea, select, label, summary, canvas, [role='dialog'], [tabindex], img, picture, figure, kbd, pre, code, p, h1, h2, h3, li, dd, dt, nav, [data-perch]")) return;
      if (window.getSelection()?.toString()) return;
      laser.current = null;
      ball.current = { x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 260, vy: -260, on: null };
      b.carrying = false;
      brain.bark();
      brain.touch();
    };

    const onMove = (e) => {
      const near = Math.abs(e.clientY - (b.y - H / 2)) < 140 && Math.abs(e.clientX - b.x) < 160;
      brain.look(near ? e.clientX : null);
      if (near) brain.touch();
    };

    // messages from the rest of the site
    const onMascot = (e) => {
      const { type, x } = e.detail || {};
      pending.current.push(() => {
        if (type === "call") brain.hopTo(x ?? window.innerWidth / 2, window.innerHeight - FLOOR, () => { brain.poke(); say("You called? Woof!", { force: true }); });
        else if (type === "pet") { brain.backflip(); popHearts(); say("Best. Human. Ever.", { force: true }); }
        else if (type === "fetch") ball.current = { x: window.innerWidth * (0.2 + Math.random() * 0.6), y: 80, vx: 0, vy: 0, on: null };
        else if (type === "hello") { brain.poke(); say(mascot.greeting, { force: true }); }
        else if (type === "laser") laser.current = { auto: true, start: performance.now(), until: performance.now() + 7000, x: 0, y: 0 };
        else if (type === "party") { flags.current.party = true; }
      });
    };

    const onVisibility = () => { if (document.hidden) cancelAnimationFrame(raf); else { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame); } };

    document.addEventListener("click", onDocClick);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mascot", onMascot);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(bubbleTimer.current);
      mo.disconnect();
      detach();
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mascot", onMascot);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // one line per section, once per visit
  useEffect(() => {
    const line = mascot.lines[active];
    if (!line || spoken.current.has(active)) return;
    const id = setTimeout(() => { if (say(line)) spoken.current.add(active); }, 700);
    return () => clearTimeout(id);
  }, [active, say]);

  function onPupClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const brain = brainRef.current;
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 700), now];
    if (clicks.current.length >= 3) {
      clicks.current = [];
      brain.backflip();
      popHearts();
      say("Wheee! 🐾", { force: true });
      return;
    }
    brain.poke();
    const touch = matchMedia("(pointer: coarse)").matches;
    const facts = touch ? mascot.facts.filter((f) => !f.includes("`")) : mascot.facts;
    say(facts[Math.floor(Math.random() * facts.length)], { force: true, home: true });
  }

  function sendHome() {
    say("Okay! Call me back from the footer anytime.", { force: true });
    brainRef.current.leave(() => onSendHome());
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      <svg ref={rocketRef} width="36" height="56" viewBox="0 0 36 56" aria-hidden="true" className="absolute left-0 top-0" style={{ display: "none" }}>
        <path d="M18 2c8 8 10 18 10 30H8C8 20 10 10 18 2z" fill="#eef1f5" stroke="#1a120b" strokeWidth="2" />
        <circle cx="18" cy="20" r="4" fill="#9fd3ff" stroke="#1a120b" strokeWidth="2" />
        <path d="M8 26l-6 10h6zM28 26l6 10h-6z" fill="#ffb224" stroke="#1a120b" strokeWidth="2" />
        <path d="M12 34h12l-6 18z" fill="#ffb224" opacity="0.9" />
      </svg>

      <span ref={ballRef} aria-hidden="true" className="absolute left-0 top-0 hidden h-3.5 w-3.5 border-2 border-[#1a120b] bg-accent-fill" />
      <span ref={laserRef} aria-hidden="true" className="absolute left-0 top-0 hidden h-2.5 w-2.5 rounded-full bg-[#ff2d4a] shadow-[0_0_10px_4px_rgba(255,45,74,0.6)]" />
      <span ref={zzzRef} aria-hidden="true" className="absolute left-0 top-0 hidden font-pixel text-sm text-white">
        <span className="nova-zzz inline-block">z</span><span className="nova-zzz inline-block [animation-delay:0.6s]">Z</span>
      </span>

      {hearts.map((h) => (
        <span key={h.id} aria-hidden="true" className="nova-heart absolute text-lg" style={{ left: h.x - 8, top: h.y }}>♥</span>
      ))}

      <div
        ref={bubbleRef}
        role="status"
        aria-live="polite"
        className={`nova-bubble px-panel absolute left-0 top-0 max-w-[min(270px,80vw)] px-3 py-2 text-sm transition-opacity duration-200 ${bubble ? "pointer-events-auto opacity-100" : "opacity-0"}`}
      >
        {bubble && (
          <>
            <span className="mb-0.5 block font-pixel text-xs uppercase text-accent">{mascot.name}</span>
            {bubble.text}
            {bubble.home && (
              <button type="button" onClick={sendHome} className="mt-1.5 block font-pixel text-xs uppercase text-muted underline-offset-2 hover:text-accent hover:underline">
                Send {mascot.name} home
              </button>
            )}
          </>
        )}
      </div>

      <button
        ref={btnRef}
        type="button"
        onClick={onPupClick}
        aria-label={`${mascot.name} the astro-pup. Press to say hi`}
        className="pointer-events-auto absolute left-0 top-0 cursor-pointer"
        style={{ width: W, height: H }}
      >
        <canvas ref={canvasRef} style={{ width: W, height: H, imageRendering: "pixelated" }} />
      </button>
    </div>
  );
}

const easeOut = (t) => 1 - (1 - Math.min(1, t)) ** 3;
