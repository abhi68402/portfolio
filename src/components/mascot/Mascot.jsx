import { useCallback, useEffect, useRef, useState } from "react";
import { mascot, sections } from "../../data/content";
import { safeGet, safeSet } from "../../hooks/storage";
import { useActiveSection } from "../../hooks/useActiveSection";
import { createBrain } from "./brain";
import { drawPup, SPRITE_H, SPRITE_W } from "./sprite";

const ids = sections.map((s) => s.id);
const FLOOR = 6; // px from the bottom of the screen to Nova's paws

// Nova lives in a thin layer along the bottom of the screen.
// Only Nova herself (a real <button>) and her speech bubble take clicks;
// everything else in the layer lets clicks pass through to the page.
export default function Mascot({ onSendHome }) {
  const btnRef = useRef(null);
  const canvasRef = useRef(null);
  const bubbleRef = useRef(null);
  const ballRef = useRef(null);
  const rocketRef = useRef(null);
  const brainRef = useRef(null);
  const ball = useRef(null); // { x, y, vx, vy, rest }
  const pending = useRef([]);
  const clicks = useRef([]);
  const spoken = useRef(new Set());
  const lastSpoke = useRef(0);
  const [bubble, setBubble] = useState(null); // { text, home?: bool }
  const [hearts, setHearts] = useState([]);
  const bubbleTimer = useRef(0);
  const reduce = useRef(matchMedia("(prefers-reduced-motion: reduce)").matches);
  const active = useActiveSection(ids);

  const scale = typeof window !== "undefined" && window.innerWidth < 640 ? 1.75 : 2.5;
  const W = SPRITE_W * scale, H = SPRITE_H * scale;

  // ── speech ──
  const say = useCallback((text, { force = false, home = false, ms = 4800 } = {}) => {
    const now = Date.now();
    if (!force && now - lastSpoke.current < 3500) return false;
    lastSpoke.current = now;
    setBubble({ text, home });
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), home ? ms + 3000 : ms);
    return true;
  }, []);

  // ── set up the brain + animation loop once ──
  useEffect(() => {
    const firstVisit = !safeGet("nova-landed") && !reduce.current;
    safeSet("nova-landed", "1");
    const brain = createBrain({ startX: Math.min(90, window.innerWidth * 0.15), landing: firstVisit });
    brainRef.current = brain;
    const b = brain.state;
    const ctx = canvasRef.current.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasRef.current.width = W * dpr;
    canvasRef.current.height = H * dpr;

    let raf = 0, last = performance.now(), lastScroll = window.scrollY, rocketT = firstVisit ? 0 : 99;
    setTimeout(() => say(mascot.greeting, { force: true, ms: 6000 }), firstVisit ? 1700 : 900);

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // hide while a dialog (project, game, terminal) has locked the page
      const covered = document.body.style.overflow === "hidden";
      btnRef.current.parentElement.style.visibility = covered ? "hidden" : "visible";
      if (covered) return;
      if (pending.current.length) pending.current.shift()();

      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (Math.abs(dy) > 1 && !reduce.current) brain.scrollNudge(dy);

      updateBall(dt);
      brain.update(dt, { width: window.innerWidth, reduce: reduce.current });

      // position Nova
      const x = b.x, y = b.y;
      btnRef.current.style.transform = `translate3d(${x - W / 2}px, ${y}px, 0)`;
      // draw
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (b.flip) {
        ctx.translate(W / 2, H / 2);
        ctx.rotate(-b.flip * b.dir);
        ctx.translate(-W / 2, -H / 2);
      }
      drawPup(ctx, brain.pose(), W / 2, H, scale, b.dir < 0);

      // bubble follows Nova, kept on screen
      if (bubbleRef.current) {
        const bw = bubbleRef.current.offsetWidth;
        const left = Math.max(8, Math.min(window.innerWidth - bw - 8, x - bw / 2));
        bubbleRef.current.style.transform = `translate3d(${left}px, ${y - H - 14}px, 0)`;
        bubbleRef.current.style.setProperty("--tail", `${Math.max(12, Math.min(bw - 12, x - left))}px`);
      }

      // rocket on the first visit
      if (rocketRef.current) {
        rocketT += dt;
        let ry;
        if (rocketT < 0.9) ry = -window.innerHeight + (window.innerHeight - 70) * easeOut(rocketT / 0.9);
        else if (rocketT < 1.3) ry = -70;
        else ry = -70 - (rocketT - 1.3) ** 2 * 3000;
        rocketRef.current.style.transform = `translate3d(${x - 18}px, ${ry - 40}px, 0)`;
        rocketRef.current.style.display = rocketT > 2.2 ? "none" : "block";
      }
    };

    // ball physics: drops to the floor, bounces, rolls, then Nova fetches it
    function updateBall(dt) {
      const bl = ball.current, el = ballRef.current;
      if (!bl || !el) return;
      if (!bl.rest) {
        bl.vy += 1800 * dt;
        bl.y += bl.vy * dt;
        bl.x += bl.vx * dt;
        bl.vx *= 1 - 1.5 * dt;
        bl.x = Math.max(12, Math.min(window.innerWidth - 12, bl.x));
        if (bl.y >= 0) {
          bl.y = 0;
          bl.vy *= -0.45;
          if (Math.abs(bl.vy) < 120) {
            bl.vy = 0; bl.rest = true;
            brain.runTo(bl.x, () => {
              ball.current = null;
              el.style.display = "none";
              brain.setCarrying(true);
              brain.bark();
              // trot back toward the middle-left, drop it, ask for more
              const home = Math.max(70, Math.min(window.innerWidth - 70, window.innerWidth * 0.3));
              brain.runTo(home, () => {
                brain.setCarrying(false);
                brain.poke();
                say("Again! Click anywhere to throw it.", { force: true });
              });
            });
          }
        }
      }
      el.style.display = "block";
      el.style.transform = `translate3d(${bl.x - 7}px, ${bl.y}px, 0)`;
    }

    // click on empty page space → throw a ball there
    const onDocClick = (e) => {
      if (reduce.current || e.defaultPrevented || e.button !== 0) return;
      if (e.target.closest("a, button, input, textarea, select, label, summary, canvas, [role='dialog'], [tabindex], img, picture, figure, kbd, pre, code, p, h1, h2, h3, li, dd, dt")) return;
      if (window.getSelection()?.toString()) return;
      const floorY = window.innerHeight - FLOOR;
      ball.current = { x: e.clientX, y: e.clientY - floorY, vx: (Math.random() - 0.5) * 300, vy: -200, rest: false };
      brain.setCarrying(false);
      brain.bark();
    };

    const onMove = (e) => {
      const near = e.clientY > window.innerHeight - 220 && Math.abs(e.clientX - b.x) < 160;
      brain.look(near ? e.clientX : null);
    };

    // other parts of the site talk to Nova with: window.dispatchEvent(new CustomEvent("mascot", { detail: {...} }))
    const onMascot = (e) => {
      const { type, x } = e.detail || {};
      const run = () => {
        if (type === "call") {
          brain.runTo(x ?? window.innerWidth / 2, () => { brain.poke(); say("You called? Woof!", { force: true }); });
        } else if (type === "pet") {
          brain.backflip(); popHearts(); say("Best. Human. Ever.", { force: true });
        } else if (type === "fetch") {
          ball.current = { x: Math.random() * window.innerWidth * 0.8 + 40, y: -window.innerHeight * 0.7, vx: 0, vy: 0, rest: false };
        } else if (type === "hello") {
          brain.poke(); say(mascot.greeting, { force: true });
        }
      };
      pending.current.push(run);
    };

    const onVisibility = () => { if (document.hidden) cancelAnimationFrame(raf); else { last = performance.now(); raf = requestAnimationFrame(frame); } };

    document.addEventListener("click", onDocClick);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mascot", onMascot);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(bubbleTimer.current);
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
    const id = setTimeout(() => { if (say(line)) spoken.current.add(active); }, 600);
    return () => clearTimeout(id);
  }, [active, say]);

  function popHearts() {
    const id = Date.now();
    setHearts((h) => [...h, ...[0, 1, 2].map((i) => ({ id: id + i, dx: (i - 1) * 16 }))]);
    setTimeout(() => setHearts((h) => h.filter((x) => x.id < id)), 1300);
  }

  // clicking Nova: jump + a random fact; three quick clicks = backflip + hearts
  function onPupClick(e) {
    e.preventDefault();
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
    // skip keyboard tips on touch screens
    const touch = matchMedia("(pointer: coarse)").matches;
    const facts = touch ? mascot.facts.filter((f) => !f.includes("`")) : mascot.facts;
    const fact = facts[Math.floor(Math.random() * facts.length)];
    say(fact, { force: true, home: true });
  }

  function sendHome() {
    say("Okay! Call me back from the footer anytime.", { force: true });
    brainRef.current.leave(() => onSendHome());
  }

  const b = brainRef.current?.state;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-0" style={{ bottom: FLOOR }}>
      {/* rocket (first visit only) */}
      <svg ref={rocketRef} width="36" height="56" viewBox="0 0 36 56" aria-hidden="true" className="absolute bottom-0 left-0" style={{ display: "none" }}>
        <path d="M18 2c8 8 10 18 10 30H8C8 20 10 10 18 2z" fill="#eef1f5" stroke="#1a120b" strokeWidth="2" />
        <circle cx="18" cy="20" r="4" fill="#9fd3ff" stroke="#1a120b" strokeWidth="2" />
        <path d="M8 26l-6 10h6zM28 26l6 10h-6z" fill="#ffb224" stroke="#1a120b" strokeWidth="2" />
        <path d="M12 34h12l-6 18z" fill="#ffb224" opacity="0.9" />
      </svg>

      {/* ball */}
      <span ref={ballRef} aria-hidden="true" className="absolute bottom-0 left-0 hidden h-3.5 w-3.5 rounded-full border-2 border-[#1a120b] bg-accent-fill" />

      {/* hearts */}
      {hearts.map((h) => (
        <span key={h.id} aria-hidden="true" className="nova-heart absolute bottom-0 text-lg" style={{ left: (b?.x ?? 0) + h.dx - 8 }}>
          ♥
        </span>
      ))}

      {/* speech bubble */}
      <div
        ref={bubbleRef}
        role="status"
        aria-live="polite"
        className={`nova-bubble absolute bottom-0 left-0 max-w-[min(260px,80vw)] rounded-lg border border-line-strong bg-panel px-3 py-2 text-sm shadow-lg transition-opacity duration-200 ${bubble ? "pointer-events-auto opacity-100" : "opacity-0"}`}
      >
        {bubble && (
          <>
            <span className="hud-label mb-0.5 block text-[0.58rem] text-accent">{mascot.name}</span>
            {bubble.text}
            {bubble.home && (
              <button type="button" onClick={sendHome} className="mt-1.5 block font-mono text-[0.62rem] uppercase tracking-widest text-muted underline-offset-2 hover:text-accent hover:underline">
                Send {mascot.name} home
              </button>
            )}
          </>
        )}
      </div>

      {/* Nova */}
      <button
        ref={btnRef}
        type="button"
        onClick={onPupClick}
        aria-label={`${mascot.name} the astro-pup. Press to say hi`}
        className="pointer-events-auto absolute bottom-0 left-0 cursor-pointer rounded-md focus-visible:outline-offset-2"
        style={{ width: W, height: H }}
      >
        <canvas ref={canvasRef} style={{ width: W, height: H, imageRendering: "pixelated" }} />
      </button>
    </div>
  );
}

const easeOut = (t) => 1 - (1 - Math.min(1, t)) ** 3;
