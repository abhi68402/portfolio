import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { nowBuilding, stats } from "../../data/content";
import { funFacts } from "../../data/funFacts";

// Three small toys under the hero: what I'm building now, real numbers from my projects,
// and a scratch-off fun fact card. Light fun; none of them hide any information.
export default function HeroTiles() {
  return (
    <div className="mx-auto grid max-w-6xl items-stretch gap-6 px-4 pb-8 sm:px-6 md:grid-cols-3">
      <h2 className="sr-only">At a glance</h2>
      <NowBuilding />
      <ByTheNumbers />
      <ScratchCard />
    </div>
  );
}

function NowBuilding() {
  return (
    <article className="card tilt-l lift h-full p-5">
      <p className="hud-label flex items-center gap-2"><span className="pulse-dot h-2 w-2 rounded-full bg-red" /> Now building</p>
      <h3 className="mt-2 font-serif text-2xl font-semibold">{nowBuilding.title}</h3>
      <p className="text-sm text-muted">{nowBuilding.what}</p>
      <div className="mt-4 h-3 overflow-hidden rounded-full border border-line bg-card-2" role="progressbar" aria-label={`${nowBuilding.title} progress`} aria-valuenow={nowBuilding.progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-[repeating-linear-gradient(45deg,var(--blue)_0_8px,color-mix(in_srgb,var(--blue)_75%,white)_8px_16px)]" style={{ width: `${nowBuilding.progress}%` }} />
      </div>
      <p className="mt-2 font-hand text-xl text-red">{nowBuilding.progress}% · compiling dreams</p>
    </article>
  );
}

// "By the numbers": real figures from the projects, counting up once the
// tile scrolls into view. Edit them in `stats` in content.js.
function ByTheNumbers() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <article ref={ref} className="card tape-blue tape lift relative h-full p-5">
      <p className="hud-label">By the numbers</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <span className="block whitespace-nowrap font-serif text-[1.6rem] font-semibold leading-none text-blue tabular">
                <Counter to={s.value} run={inView} />{s.suffix}
              </span>
              <span className="mt-1 block text-xs leading-snug text-muted" aria-hidden="true">{s.label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function Counter({ to, run }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!run || reduce) { if (reduce) setN(to); return; }
    let raf, start;
    const step = (t) => {
      start ??= t;
      const p = Math.min(1, (t - start) / 1200);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run, to, reduce]);
  return n.toLocaleString("en-IN");
}

// Scratch-off card: a canvas foil sits over a hidden fun fact. Dragging erases
// the foil (destination-out); past ~45% cleared the rest fades and the fact pops.
// "Reveal" gives keyboard and screen-reader users the same result without scratching.
const CLEAR_AT = 0.45;

function paintFoil(canvas, w, h, dpr) {
  const ctx = canvas.getContext("2d");
  const dark = document.documentElement.dataset.theme === "dark";
  ctx.globalCompositeOperation = "source-over";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const g = ctx.createLinearGradient(0, 0, w, h);
  const stops = dark ? ["#3b4663", "#6d7898", "#47526f", "#7f8aab", "#3b4663"] : ["#b9bcc4", "#e6e8ec", "#c3c6ce", "#f1f2f5", "#b9bcc4"];
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // fine brushed texture + sparkle
  ctx.lineWidth = 1;
  for (let y = 0; y < h; y += 3) {
    ctx.strokeStyle = dark ? `rgba(255,255,255,${0.03 + ((y * 7) % 5) * 0.012})` : `rgba(60,70,90,${0.03 + ((y * 7) % 5) * 0.012})`;
    ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke();
  }
  ctx.fillStyle = dark ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)";
  for (let i = 0; i < 40; i++) ctx.fillRect(((i * 97) % 211) / 211 * w, ((i * 61) % 173) / 173 * h, 1.5, 1.5);
  // hint
  ctx.fillStyle = dark ? "#e8ecf8" : "#4a4f5c";
  ctx.font = "600 26px 'Caveat', 'Segoe Print', 'Bradley Hand', cursive";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("scratch me", w / 2, h / 2);
  ctx.strokeStyle = dark ? "rgba(232,236,248,0.55)" : "rgba(74,79,92,0.55)";
  ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
  ctx.strokeRect(6, 6, w - 12, h - 12); ctx.setLineDash([]);
}

function ScratchCard() {
  const reduce = useReducedMotion();
  const order = useRef(null);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [round, setRound] = useState(0);
  const wrap = useRef(null);
  const canvas = useRef(null);
  const state = useRef({ down: false, last: null, tick: 0 });
  const revealedRef = useRef(false);
  revealedRef.current = revealed;

  // shuffled queue: every fact once before any repeats
  const nextFact = (prevIdx) => {
    if (!order.current || !order.current.length) {
      const all = funFacts.map((_, i) => i).sort(() => Math.random() - 0.5);
      if (all[0] === prevIdx && all.length > 1) all.push(all.shift());
      order.current = all;
    }
    return order.current.shift();
  };
  const [factIdx, setFactIdx] = useState(() => nextFact(-1));

  // size + paint foil (and repaint on resize / theme change while still covered)
  useEffect(() => {
    const el = wrap.current, cv = canvas.current;
    if (!el || !cv) return;
    const fit = () => {
      if (revealedRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      cv.width = Math.round(width * dpr); cv.height = Math.round(height * dpr);
      paintFoil(cv, width, height, dpr);
      state.current.tick = 0;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    const mo = new MutationObserver(fit);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { ro.disconnect(); mo.disconnect(); };
  }, [round, factIdx]);

  const clearedRatio = () => {
    const cv = canvas.current;
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    const { data } = ctx.getImageData(0, 0, cv.width, cv.height);
    const step = 4 * 6; let clear = 0, total = 0;
    for (let i = 3; i < data.length; i += step) { total++; if (data[i] < 128) clear++; }
    return total ? clear / total : 0;
  };

  const scratch = (e) => {
    const st = state.current;
    if (!st.down || revealedRef.current) return;
    const cv = canvas.current, ctx = cv.getContext("2d");
    const r = cv.getBoundingClientRect();
    const dpr = cv.width / r.width;
    const x = (e.clientX - r.left) * dpr, y = (e.clientY - r.top) * dpr;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.lineWidth = 30 * dpr;
    ctx.beginPath();
    ctx.moveTo(st.last ? st.last.x : x, st.last ? st.last.y : y);
    ctx.lineTo(x + 0.01, y);
    ctx.stroke();
    st.last = { x, y };
    if (++st.tick % 6 === 0 && clearedRatio() >= CLEAR_AT) setRevealed(true);
  };

  const onDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    state.current.down = true; state.current.last = null;
    scratch(e);
  };
  const onUp = () => {
    state.current.down = false; state.current.last = null;
    if (!revealedRef.current && canvas.current && clearedRatio() >= CLEAR_AT) setRevealed(true);
  };

  const again = () => {
    setFactIdx((cur) => nextFact(cur));
    setRevealed(false);
    setRound((r) => r + 1);
  };

  return (
    <article className="card tilt-r lift tape relative flex h-full flex-col p-5">
      <p className="hud-label">Scratch for a fun fact</p>
      <div ref={wrap} className="relative mt-3 min-h-[7.5rem] flex-1 overflow-hidden rounded-md border border-line bg-card-2">
        <p
          key={`${round}-${revealed}`}
          aria-live="polite"
          aria-hidden={!revealed}
          className={`absolute inset-0 grid place-items-center px-4 text-center font-serif text-lg leading-snug text-ink ${revealed && !reduce ? "animate-[scratch-pop_0.45s_ease-out]" : ""}`}
        >
          <span>{funFacts[factIdx]}</span>
        </p>
        <canvas
          key={round}
          ref={canvas}
          aria-hidden="true"
          onPointerDown={onDown}
          onPointerMove={scratch}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{ touchAction: "none", opacity: revealed ? 0 : 1, pointerEvents: revealed ? "none" : "auto", transition: reduce ? "none" : "opacity 0.5s ease" }}
          className="absolute inset-0 h-full w-full cursor-crosshair"
        />
      </div>
      <div className="mt-3 flex min-h-11 items-center justify-between gap-3">
        {revealed ? (
          <button type="button" onClick={again} className="min-h-11 rounded-md border-2 border-ink bg-hl/60 px-4 font-hand text-xl shadow-[2px_2px_0_var(--ink)] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
            New card
          </button>
        ) : (
          <button type="button" onClick={() => setRevealed(true)} className="min-h-11 rounded-md border border-line bg-card px-4 text-sm font-medium text-ink transition hover:bg-hl/40">
            Reveal
          </button>
        )}
        <span className="font-hand text-lg text-red" aria-hidden="true">{revealed ? "ta-da" : "use your finger or mouse"}</span>
      </div>
    </article>
  );
}
