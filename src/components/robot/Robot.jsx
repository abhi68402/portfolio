import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { robot, sections } from "../../data/content";
import { useActiveSection } from "../../hooks/useActiveSection";
import { safeGet, safeSet } from "../../hooks/storage";

const ids = sections.map((s) => s.id);
const STEPS = sections.filter((s) => robot.tour?.[s.id]);
const MARGIN = 16;
const NAV_H = 72; // sticky navbar height plus a little air
let handledTourRequest = 0; // survives Bolt being hidden and shown again

// ─────────────────────────────────────────────────────────────────────────────
//  Bolt, the tiny robot co-pilot. Normally it sits in the bottom-right corner:
//  - its eyes follow your cursor and it blinks
//  - waves hello when you arrive (and offers a tour), smiles when you hover it
//  - says one short line per section (once per visit)
//  - click it for a tip; it dozes off if you're idle for a minute
//  Guided tour: Bolt flies to each section's heading, explains it in a card
//  with Back / Next / End, then flies home. Start it from the hello bubble,
//  the footer, the terminal ("tour"), or window.dispatchEvent(new Event("bolt-tour")).
//  "×" hides Bolt.
// ─────────────────────────────────────────────────────────────────────────────
export default function Robot({ onHide, tourRequest = 0 }) {
  const ref = useRef(null);
  const wrap = useRef(null);
  const nextBtn = useRef(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [mood, setMood] = useState("wave"); // wave | idle | happy | wow | sleep
  const [bubble, setBubble] = useState(null);
  const [offer, setOffer] = useState(false); // hello bubble with "Give me a tour"
  const [hover, setHover] = useState(false);
  const [bounce, setBounce] = useState(0);
  const [lean, setLean] = useState(0); // tilts with scroll speed
  const [step, setStep] = useState(null); // index into STEPS while touring
  const [pos, setPos] = useState(null); // {x, y, side} on screen; null = home corner
  const [flying, setFlying] = useState(false);
  const tipIndex = useRef(0);
  const spoken = useRef(new Set());
  const bubbleTimer = useRef(0);
  const touring = step !== null;
  const touringRef = useRef(false);
  touringRef.current = touring;
  const active = useActiveSection(ids);
  const reduce = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const say = useCallback((text, ms = 4800) => {
    setBubble(text);
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => { setBubble(null); setOffer(false); }, ms);
  }, []);

  // ── where Bolt sits ────────────────────────────────────────────────────────
  const size = () => ({ w: wrap.current?.offsetWidth || 80, h: wrap.current?.offsetHeight || 92 });
  const vw = () => document.documentElement.clientWidth;
  const vh = () => window.innerHeight;
  const homePos = useCallback(() => {
    const { w, h } = size();
    const m = vw() < 640 ? 12 : 20;
    return { x: vw() - w - m, y: vh() - h - m, side: "left", home: true };
  }, []);
  const [home, setHome] = useState(() => ({ x: -999, y: -999, side: "left", home: true }));
  useLayoutEffect(() => {
    const fit = () => setHome(homePos());
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [homePos]);

  // Next to the section's heading text; the card goes wherever there's room.
  const targetFor = useCallback((id) => {
    const h = document.getElementById(`${id}-title`);
    const { w, h: bh } = size();
    const W = vw(), H = vh();
    if (!h) return homePos();
    const range = document.createRange();
    range.selectNodeContents(h);
    const t = range.getBoundingClientRect();
    const narrow = W < 640;
    const CARD = Math.min(320, W - 24);
    let x, side;
    if (narrow) {
      x = W - w - 12;
      side = "below";
    } else {
      x = Math.min(t.right + 24, W - w - MARGIN);
      side = W - (x + w) >= CARD + 24 ? "right" : x >= CARD + 24 ? "left" : "below";
    }
    let y = narrow ? t.bottom + 8 : t.top + t.height / 2 - bh / 2;
    y = Math.max(NAV_H, Math.min(y, H - bh - MARGIN));
    return { x, y, side };
  }, [homePos]);

  // scroll to a section, then fly Bolt to its heading
  const goTo = useCallback((i) => {
    const s = STEPS[i];
    if (!s) return;
    setStep(i);
    setMood("wow");
    setFlying(true);
    const el = document.getElementById(s.id);
    const behavior = reduce ? "auto" : "smooth";
    if (s.id === "hero") window.scrollTo({ top: 0, behavior });
    else el?.scrollIntoView({ behavior, block: "start" });
    let done = false;
    const land = () => {
      if (done || !touringRef.current) return;
      done = true;
      window.removeEventListener("scrollend", land);
      setPos(targetFor(s.id));
      setTimeout(() => { setFlying(false); setMood("happy"); nextBtn.current?.focus({ preventScroll: true }); }, reduce ? 0 : 700);
      setTimeout(() => setMood("idle"), 1600);
    };
    window.addEventListener("scrollend", land, { once: true });
    setTimeout(land, reduce ? 50 : 950); // fallback where scrollend isn't supported
  }, [reduce, targetFor]);

  const startTour = useCallback(() => {
    setOffer(false);
    setBubble(null);
    safeSet("bolt-toured", "1");
    touringRef.current = true;
    goTo(0);
  }, [goTo]);

  const endTour = useCallback(() => {
    touringRef.current = false;
    setStep(null);
    setPos(null);
    setFlying(false);
    setMood("happy");
    setBounce((b) => b + 1);
    setTimeout(() => setMood("idle"), 1400);
    setTimeout(() => say(robot.tourDone || "Have fun exploring!", 4000), reduce ? 0 : 900);
  }, [reduce, say]);

  // external requests (footer button, terminal) arrive as a changing number
  useEffect(() => {
    if (tourRequest > handledTourRequest) { handledTourRequest = tourRequest; startTour(); }
  }, [tourRequest, startTour]);

  // keyboard during the tour; keep Bolt next to the heading on resize
  useEffect(() => {
    if (!touring) return;
    const onKey = (e) => {
      if (e.key === "Escape") endTour();
      else if (e.key === "ArrowRight") step < STEPS.length - 1 ? goTo(step + 1) : endTour();
      else if (e.key === "ArrowLeft" && step > 0) goTo(step - 1);
    };
    const onResize = () => setPos(targetFor(STEPS[step].id));
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize); };
  }, [touring, step, goTo, endTour, targetFor]);

  // hello on arrival (with a tour offer)
  useEffect(() => {
    const a = setTimeout(() => {
      if (touringRef.current) return;
      setOffer(true);
      say(safeGet("bolt-toured", "") ? robot.helloBack || robot.hello : robot.hello, 9000);
    }, 900);
    const b = setTimeout(() => setMood((m) => (m === "wave" ? "idle" : m)), 2600);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(bubbleTimer.current); };
  }, [say]);

  // eyes follow the cursor; doze after 60 s without input
  useEffect(() => {
    let raf = 0, idle = 0;
    const onMove = (e) => {
      idle = 0;
      setMood((m) => (m === "sleep" ? "idle" : m));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.35);
        const d = Math.max(1, Math.hypot(dx, dy));
        setLook({ x: (dx / d) * Math.min(3, d / 40), y: (dy / d) * Math.min(2.5, d / 40) });
      });
    };
    const wake = () => { idle = 0; setMood((m) => (m === "sleep" ? "idle" : m)); };
    const tick = setInterval(() => { idle += 1; if (idle >= 60 && !touringRef.current) setMood("sleep"); }, 1000);
    const blinker = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 140); }, 3800);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("keydown", wake);
    window.addEventListener("scroll", wake, { passive: true });
    return () => {
      cancelAnimationFrame(raf); clearInterval(tick); clearInterval(blinker);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("scroll", wake);
    };
  }, []);

  // lean into the scroll: Bolt tilts with scroll speed, and says something once if you speed-scroll
  useEffect(() => {
    if (reduce) return;
    let lastY = window.scrollY, lastT = performance.now(), settle = 0, saidFast = false, raf = 0;
    const onScroll = () => {
      if (touringRef.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const now = performance.now(), y = window.scrollY;
        const v = (y - lastY) / Math.max(16, now - lastT); // px per ms
        lastY = y; lastT = now;
        setLean(Math.max(-14, Math.min(14, v * 9)));
        if (!saidFast && Math.abs(v) > 4) { saidFast = true; say("Whoa, speedrunner! Hold on to your antenna.", 3500); setMood("wow"); setTimeout(() => setMood("idle"), 1200); }
        clearTimeout(settle);
        settle = setTimeout(() => setLean(0), 140);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); clearTimeout(settle); };
  }, [reduce, say]);

  // one line per section, once per visit (not during the tour)
  useEffect(() => {
    if (touringRef.current) { spoken.current.add(active); return; }
    const line = robot.lines[active];
    if (!line || spoken.current.has(active)) return;
    const id = setTimeout(() => { if (touringRef.current) return; spoken.current.add(active); setOffer(false); say(line); setMood("wow"); setTimeout(() => setMood("idle"), 1200); }, 800);
    return () => clearTimeout(id);
  }, [active, say]);

  // other parts of the site can make Bolt react: window.dispatchEvent(new CustomEvent("bolt", { detail: { text, mood } }))
  useEffect(() => {
    const onBolt = (e) => { if (touringRef.current) return; const { text, mood: md = "happy" } = e.detail || {}; if (text) { setOffer(false); say(text); } setMood(md); setBounce((b) => b + 1); setTimeout(() => setMood("idle"), 1600); };
    window.addEventListener("bolt", onBolt);
    return () => window.removeEventListener("bolt", onBolt);
  }, [say]);

  const onClick = () => {
    if (touring) { step < STEPS.length - 1 ? goTo(step + 1) : endTour(); return; }
    setOffer(false);
    say(robot.tips[tipIndex.current % robot.tips.length], 6000);
    tipIndex.current += 1;
    setMood("happy");
    setBounce((b) => b + 1);
    setTimeout(() => setMood("idle"), 1400);
  };

  const face = mood === "sleep" ? "sleep" : hover || mood === "happy" ? "happy" : mood === "wow" ? "wow" : "idle";
  const at = pos || home;
  const card = touring && !flying ? STEPS[step] : null;
  const cardPlace =
    at.side === "right" ? "left-full top-1/2 ml-3 -translate-y-1/2"
    : at.side === "left" && !at.home ? "right-full top-1/2 mr-3 -translate-y-1/2"
    : at.y > vh() / 2 ? "bottom-full right-0 mb-3"
    : "top-full right-0 mt-3";

  return (
    <div
      className="fixed left-0 top-0 z-40"
      style={{
        transform: `translate(${at.x}px, ${at.y}px)`,
        transition: reduce ? "none" : "transform 0.85s cubic-bezier(.65,0,.35,1)",
        visibility: at.x < -100 ? "hidden" : "visible",
      }}
    >
      {/* normal speech bubble (to the left of Bolt in the corner) */}
      {bubble && !touring && (
        <div role="status" aria-live="polite" className="card pop-in absolute bottom-10 right-full mr-2 w-max max-w-[min(280px,calc(100vw-6rem))] px-3.5 py-2.5 text-sm">
          <span className="block font-hand text-lg leading-none text-blue">{robot.name}</span>
          {bubble}
          {offer && STEPS.length > 0 && (
            <span className="mt-2 flex gap-2">
              <button type="button" onClick={startTour} className="rounded-md border-2 border-ink bg-hl px-2.5 py-1 text-xs font-semibold text-ink shadow-[2px_2px_0_var(--ink)] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                Give me a tour
              </button>
              <button type="button" onClick={() => { setOffer(false); setBubble(null); }} className="rounded-md px-2 py-1 text-xs font-medium text-muted hover:text-ink">
                Not now
              </button>
            </span>
          )}
          <span aria-hidden="true" className="absolute -right-1.5 bottom-3 h-3 w-3 rotate-45 border-r border-t border-line bg-card" />
        </div>
      )}

      {/* tour card */}
      {card && (
        <div
          role="dialog"
          aria-label={`Site tour, step ${step + 1} of ${STEPS.length}: ${card.label}`}
          className={`card pop-in absolute w-[min(320px,calc(100vw-24px))] p-4 text-sm ${cardPlace}`}
        >
          <p className="hud-label flex items-center justify-between gap-3">
            <span>Tour · {card.codename}</span>
            <span className="tabular">{step + 1} / {STEPS.length}</span>
          </p>
          <p className="mt-2 leading-relaxed text-ink" aria-live="polite">{robot.tour[card.id]}</p>
          <div className="mt-3 flex items-center gap-2">
            <button type="button" onClick={() => goTo(step - 1)} disabled={step === 0} className="rounded-md border-2 border-line-strong px-2.5 py-1 text-xs font-semibold text-muted transition hover:border-ink hover:text-ink disabled:opacity-40">
              Back
            </button>
            <button
              ref={nextBtn}
              type="button"
              onClick={() => (step < STEPS.length - 1 ? goTo(step + 1) : endTour())}
              className="rounded-md border-2 border-ink bg-hl px-3 py-1 text-xs font-semibold text-ink shadow-[2px_2px_0_var(--ink)] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              {step < STEPS.length - 1 ? "Next" : "Finish"}
            </button>
            <button type="button" onClick={endTour} className="ml-auto text-xs font-medium text-muted hover:text-ink">
              End tour
            </button>
          </div>
          <div className="mt-3 flex gap-1" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span key={s.id} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-blue" : "bg-line"}`} />
            ))}
          </div>
        </div>
      )}

      <div ref={wrap} className="group relative">
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          aria-label={touring ? `${robot.name}. Press for the next tour stop` : `${robot.name} the robot. Press for a tip`}
          className="block transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${flying && !reduce ? -12 : lean}deg)`, transformOrigin: "50% 100%" }}
        >
          <svg key={bounce} viewBox="0 0 80 92" className={`h-[76px] w-[66px] sm:h-[92px] sm:w-[80px] ${bounce && !reduce ? "animate-[robot-hop_0.45s_ease-out]" : ""}`}>
            {/* antenna */}
            <line x1="40" y1="6" x2="40" y2="18" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="40" cy="6" r="4.5" fill="var(--red)" className="antenna" />
            {/* head */}
            <rect x="10" y="18" width="60" height="44" rx="12" fill="var(--card)" stroke="var(--ink)" strokeWidth="2.5" />
            <rect x="17" y="25" width="46" height="30" rx="8" fill="#1b2232" />
            {/* face */}
            <Face kind={face} look={reduce ? { x: 0, y: 0 } : look} blink={blink} />
            {/* ears */}
            <rect x="4" y="33" width="6" height="14" rx="3" fill="var(--blue)" stroke="var(--ink)" strokeWidth="2" />
            <rect x="70" y="33" width="6" height="14" rx="3" fill="var(--blue)" stroke="var(--ink)" strokeWidth="2" />
            {/* body */}
            <rect x="22" y="64" width="36" height="22" rx="7" fill="var(--hl)" stroke="var(--ink)" strokeWidth="2.5" />
            <circle cx="40" cy="75" r="3.5" fill="var(--red)" />
            {/* jet flame while flying between stops */}
            {flying && !reduce && <path d="M33 87 L40 92 L47 87" fill="var(--red)" opacity="0.85" className="antenna" />}
            {/* arms (right one waves) */}
            <path d="M22 70 L13 80" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
            <g style={{ transformOrigin: "58px 70px", transformBox: "view-box" }} className={mood === "wave" && !reduce ? "animate-[wave_0.9s_ease-in-out_2]" : ""}>
              <path d={mood === "wave" || card ? "M58 70 L68 58" : "M58 70 L67 80"} stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
        </button>
        {mood === "sleep" && <span aria-hidden="true" className="absolute -left-2 -top-2 font-hand text-xl text-muted">z<span className="text-sm">z</span></span>}
        {!touring && (
          <button
            type="button"
            onClick={onHide}
            aria-label={`Hide ${robot.name}`}
            className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-card text-xs opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

function Face({ kind, look, blink }) {
  const ex = look.x, ey = look.y;
  if (kind === "sleep") {
    return (
      <g stroke="#9fd3ff" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M27 40 q4 3 8 0M45 40 q4 3 8 0" />
        <path d="M36 48 h8" />
      </g>
    );
  }
  if (kind === "happy") {
    return (
      <g stroke="#9fd3ff" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M27 40 q4 -5 8 0M45 40 q4 -5 8 0" />
        <path d="M34 46 q6 5 12 0" />
        <circle cx="24" cy="46" r="2" fill="#ff9a8b" stroke="none" />
        <circle cx="56" cy="46" r="2" fill="#ff9a8b" stroke="none" />
      </g>
    );
  }
  const r = kind === "wow" ? 4.2 : 3.4;
  return (
    <g>
      {blink ? (
        <g stroke="#9fd3ff" strokeWidth="2.5" strokeLinecap="round"><path d="M27 39 h8M45 39 h8" /></g>
      ) : (
        <g fill="#9fd3ff">
          <circle cx={31 + ex} cy={38 + ey} r={r} />
          <circle cx={49 + ex} cy={38 + ey} r={r} />
          <circle cx={32 + ex} cy={37 + ey} r="1" fill="#fff" />
          <circle cx={50 + ex} cy={37 + ey} r="1" fill="#fff" />
        </g>
      )}
      {kind === "wow" ? <circle cx="40" cy="48" r="2.5" fill="none" stroke="#9fd3ff" strokeWidth="2" /> : <path d="M35 47 q5 3 10 0" stroke="#9fd3ff" strokeWidth="2.2" strokeLinecap="round" fill="none" />}
    </g>
  );
}
