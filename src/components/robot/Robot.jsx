import { useEffect, useRef, useState } from "react";
import { robot, sections } from "../../data/content";
import { useActiveSection } from "../../hooks/useActiveSection";

const ids = sections.map((s) => s.id);

// ─────────────────────────────────────────────────────────────────────────────
//  Bolt, the tiny robot co-pilot. It stays put in the bottom-right corner:
//  - its eyes follow your cursor and it blinks
//  - waves hello when you arrive, smiles when you hover it
//  - says one short line per section (once per visit)
//  - click it for a tip; it dozes off if you're idle for a minute
//  It never moves around the page or covers anything; "×" hides it.
// ─────────────────────────────────────────────────────────────────────────────
export default function Robot({ onHide }) {
  const ref = useRef(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [mood, setMood] = useState("wave"); // wave | idle | happy | wow | sleep
  const [bubble, setBubble] = useState(null);
  const [hover, setHover] = useState(false);
  const [bounce, setBounce] = useState(0);
  const tipIndex = useRef(0);
  const spoken = useRef(new Set());
  const bubbleTimer = useRef(0);
  const active = useActiveSection(ids);
  const reduce = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const say = (text, ms = 4800) => {
    setBubble(text);
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), ms);
  };

  // hello on arrival
  useEffect(() => {
    const a = setTimeout(() => say(robot.hello, 5500), 900);
    const b = setTimeout(() => setMood("idle"), 2600);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(bubbleTimer.current); };
  }, []);

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
    const tick = setInterval(() => { idle += 1; if (idle >= 60) setMood("sleep"); }, 1000);
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

  // one line per section, once per visit
  useEffect(() => {
    const line = robot.lines[active];
    if (!line || spoken.current.has(active)) return;
    const id = setTimeout(() => { spoken.current.add(active); say(line); setMood("wow"); setTimeout(() => setMood("idle"), 1200); }, 800);
    return () => clearTimeout(id);
  }, [active]);

  // other parts of the site can make Bolt react: window.dispatchEvent(new CustomEvent("bolt", { detail: { text, mood } }))
  useEffect(() => {
    const onBolt = (e) => { const { text, mood: md = "happy" } = e.detail || {}; if (text) say(text); setMood(md); setBounce((b) => b + 1); setTimeout(() => setMood("idle"), 1600); };
    window.addEventListener("bolt", onBolt);
    return () => window.removeEventListener("bolt", onBolt);
  }, []);

  const onClick = () => {
    say(robot.tips[tipIndex.current % robot.tips.length], 6000);
    tipIndex.current += 1;
    setMood("happy");
    setBounce((b) => b + 1);
    setTimeout(() => setMood("idle"), 1400);
  };

  const face = mood === "sleep" ? "sleep" : hover || mood === "happy" ? "happy" : mood === "wow" ? "wow" : "idle";

  return (
    <div className="fixed bottom-3 right-3 z-40 flex items-end gap-2 sm:bottom-5 sm:right-5">
      {bubble && (
        <div role="status" aria-live="polite" className="card pop-in absolute bottom-10 right-full mr-2 w-max max-w-[min(260px,calc(100vw-6rem))] px-3.5 py-2.5 text-sm">
          <span className="block font-hand text-lg leading-none text-blue">{robot.name}</span>
          {bubble}
          <span aria-hidden="true" className="absolute -right-1.5 bottom-3 h-3 w-3 rotate-45 border-r border-t border-line bg-card" />
        </div>
      )}
      <div className="group relative">
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          aria-label={`${robot.name} the robot. Press for a tip`}
          className="block"
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
            {/* arms (right one waves) */}
            <path d="M22 70 L13 80" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
            <g style={{ transformOrigin: "58px 70px", transformBox: "view-box" }} className={mood === "wave" && !reduce ? "animate-[wave_0.9s_ease-in-out_2]" : ""}>
              <path d={mood === "wave" ? "M58 70 L68 58" : "M58 70 L67 80"} stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
        </button>
        {mood === "sleep" && <span aria-hidden="true" className="absolute -left-2 -top-2 font-hand text-xl text-muted">z<span className="text-sm">z</span></span>}
        <button
          type="button"
          onClick={onHide}
          aria-label={`Hide ${robot.name}`}
          className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-card text-xs opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
        >
          ×
        </button>
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
