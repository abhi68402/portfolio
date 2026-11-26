import { useEffect, useRef, useState } from "react";
import { profile } from "../../data/content";
import { safeGet, safeSet } from "../../hooks/storage";
import { scrollToSection } from "../../hooks/scrollTo";
import { drawBug } from "../glitch/sprite";
import Modal, { CloseButton } from "../ui/Modal";

const ROUND = 30;
const BEST_KEY = "blitz-best";

// ─────────────────────────────────────────────────────────────────────────────
//  BUG BLITZ: the real page becomes the arena. Bugs pour out for 30 seconds;
//  click/tap to squash. Combos for fast squashes, golden bugs (+5),
//  a boss that takes 5 hits (+15), and bombs you should NOT click (-10).
//  A full-screen layer catches clicks so nothing on the page is triggered.
// ─────────────────────────────────────────────────────────────────────────────
export default function BugBlitz({ onClose }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("count"); // count | play | over
  const [count, setCount] = useState(3);
  const [hud, setHud] = useState({ score: 0, time: ROUND, combo: 1 });
  const [pops, setPops] = useState([]);
  const [result, setResult] = useState(null);
  const [best, setBest] = useState(() => Number(safeGet(BEST_KEY, 0)) || 0);
  const [round, setRound] = useState(0);

  // mark the page as "in a game" (Glitch and the screensaver step aside)
  useEffect(() => {
    document.documentElement.dataset.blitz = "1";
    document.body.style.overflow = "hidden"; // no scrolling the arena away
    return () => {
      delete document.documentElement.dataset.blitz;
      // wait a tick (the results dialog cleans up too), then unlock scrolling
      // unless some other dialog is still open
      setTimeout(() => { if (!document.querySelector("[aria-modal='true']")) document.body.style.overflow = ""; }, 0);
    };
  }, []);

  // countdown 3-2-1
  useEffect(() => {
    if (phase !== "count") return;
    if (count === 0) { setPhase("play"); return; }
    const id = setTimeout(() => setCount((c) => c - 1), 650);
    return () => clearTimeout(id);
  }, [phase, count]);

  // Esc quits mid-game (the results screen uses the normal Modal)
  useEffect(() => {
    if (phase === "over") return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onClose]);

  // the game itself
  useEffect(() => {
    if (phase !== "play") return;
    const cv = canvasRef.current;
    const ctx = cv.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth, H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let bugs = [], raf = 0, last = performance.now(), time = ROUND, spawnIn = 0, score = 0;
    let combo = 1, lastHit = 0, squashed = 0, golden = 0, bossDown = false, bombs = 0, shake = 0;
    const bossAt = [ROUND - 10, ROUND - 21];

    const spawn = (kind = "glitch") => {
      const edge = Math.floor(Math.random() * 4);
      const x = edge === 0 ? -20 : edge === 1 ? W + 20 : 40 + Math.random() * (W - 80);
      const y = edge === 2 ? 60 : edge === 3 ? H + 20 : 80 + Math.random() * (H - 140);
      const base = kind === "gold" ? 300 : kind === "boss" ? 70 : kind === "bomb" ? 60 : 120 + (ROUND - time) * 5;
      bugs.push({ kind, x, y, angle: Math.atan2(H / 2 - y, W / 2 - x), turn: (Math.random() - 0.5) * 2, speed: base * (0.8 + Math.random() * 0.4), legs: 0, hp: kind === "boss" ? 5 : 1, hurt: 0, life: kind === "bomb" ? 4 : 99, size: kind === "boss" ? 4 : 2 });
    };
    const pop = (x, y, text, color) => {
      const id = Math.random();
      setPops((p) => [...p.slice(-8), { id, x, y, text, color }]);
      setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 700);
    };

    const onDown = (e) => {
      e.preventDefault();
      const x = e.clientX, y = e.clientY;
      let hit = null;
      for (let i = bugs.length - 1; i >= 0; i--) {
        const b = bugs[i];
        if (Math.hypot(x - b.x, y - b.y) < (b.size === 4 ? 52 : 30)) { hit = b; break; }
      }
      if (!hit) { combo = 1; pop(x, y, "miss", "#b2a6d1"); return; }
      const now = performance.now();
      combo = now - lastHit < 900 ? Math.min(5, combo + 1) : 1;
      lastHit = now;
      if (hit.kind === "bomb") {
        score = Math.max(0, score - 10); combo = 1; bombs++;
        if (!reduce) shake = 0.4;
        pop(x, y, "BOOM −10", "#ff6b3d");
        bugs.splice(bugs.indexOf(hit), 1);
        return;
      }
      hit.hp--; hit.hurt = 0.12;
      if (hit.hp > 0) { pop(x, y, `${hit.hp} left!`, "#ffd23f"); return; }
      const pts = (hit.kind === "gold" ? 5 : hit.kind === "boss" ? 15 : 1) * combo;
      score += pts; squashed++;
      if (hit.kind === "gold") golden++;
      if (hit.kind === "boss") bossDown = true;
      pop(x, y, `+${pts}${combo > 1 ? ` ×${combo}` : ""}`, hit.kind === "gold" ? "#ffd23f" : "#39ff88");
      bugs.splice(bugs.indexOf(hit), 1);
    };
    cv.addEventListener("pointerdown", onDown);
    // development only: lets automated tests see the bugs (stripped from the production build)
    if (import.meta.env.DEV) window.__blitz = { get bugs() { return bugs; } };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (document.hidden) return;
      time -= dt;
      // spawning ramps up over the round
      spawnIn -= dt;
      if (spawnIn <= 0) {
        const r = Math.random();
        spawn(r < 0.08 ? "gold" : r < 0.18 ? "bomb" : "glitch");
        spawnIn = Math.max(0.22, 0.75 - (ROUND - time) * 0.017);
      }
      if (bossAt.length && time <= bossAt[0]) { bossAt.shift(); spawn("boss"); pop(W / 2, 120, "BOSS BUG!", "#ff3b3b"); }

      for (const b of [...bugs]) {
        b.turn += (Math.random() - 0.5) * dt * 6;
        b.angle += b.turn * dt;
        // bounce back in from the edges
        if (b.x < 20 || b.x > W - 20 || b.y < 70 || b.y > H - 20) b.angle = Math.atan2(H / 2 - b.y, W / 2 - b.x) + (Math.random() - 0.5);
        b.x += Math.cos(b.angle) * b.speed * dt;
        b.y += Math.sin(b.angle) * b.speed * dt;
        b.legs = (b.legs + dt * b.speed / 25) % 1;
        b.hurt = Math.max(0, b.hurt - dt);
        b.life -= dt;
        if (b.life <= 0) bugs.splice(bugs.indexOf(b), 1); // bombs fizzle out
      }
      if (now - lastHit > 1200) combo = 1;
      shake = Math.max(0, shake - dt);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (shake > 0) ctx.translate((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14);
      for (const b of bugs) {
        ctx.shadowColor = b.kind === "gold" ? "#ffd23f" : b.kind === "bomb" ? "#ff6b3d" : "#ff2bd6";
        ctx.shadowBlur = 16;
        drawBug(ctx, { x: b.x, y: b.y, angle: b.angle, size: b.size, legs: b.legs, kind: b.kind, hurt: b.hurt });
      }
      setHud((h) => (h.score !== score || h.time !== Math.ceil(time) || h.combo !== combo ? { score, time: Math.max(0, Math.ceil(time)), combo } : h));

      if (time <= 0) {
        cancelAnimationFrame(raf);
        const res = { score, squashed, golden, bossDown, bombs };
        setResult(res);
        setBest((b) => { const nb = Math.max(b, score); safeSet(BEST_KEY, String(nb)); return nb; });
        setPhase("over");
      }
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); cv.removeEventListener("pointerdown", onDown); };
  }, [phase, round]);

  const again = () => { setResult(null); setHud({ score: 0, time: ROUND, combo: 1 }); setCount(3); setPhase("count"); setRound((r) => r + 1); };

  if (phase === "over" && result) {
    const isBest = result.score >= best && result.score > 0;
    return (
      <Modal onClose={onClose} labelledBy="blitz-title" className="neon-panel neon-panel-hot max-w-md">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 id="blitz-title" className="font-display text-lg neon-mag">Bug Blitz</h2>
          <CloseButton onClick={onClose} />
        </div>
        <div className="p-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">Final score</p>
          <p className="mt-1 font-display text-6xl neon-cyan tabular">{result.score}</p>
          <p className="mt-1 text-sm text-muted">{isBest ? "🏆 New high score!" : `High score: ${best}`}</p>
          <dl className="mt-5 grid grid-cols-2 gap-2 text-left text-sm">
            <Stat k="Bugs squashed" v={result.squashed} />
            <Stat k="Golden bugs" v={result.golden} />
            <Stat k="Boss" v={result.bossDown ? "Defeated" : "Escaped"} />
            <Stat k="Bombs clicked" v={result.bombs} />
          </dl>
          <p className="mt-5 text-sm text-muted">Good reflexes. He debugs real code just as fast.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" data-autofocus onClick={again} className="neon-btn neon-btn-primary">↻ Play again</button>
            <button type="button" onClick={() => { onClose(); setTimeout(() => scrollToSection("skills"), 250); }} className="neon-btn neon-btn-ghost">See my skills</button>
            <a href={profile.resume} download className="neon-btn neon-btn-ghost">↓ Resume</a>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Bug Blitz game. Click the bugs to squash them. Press Escape to quit." className="fixed inset-0 z-[85] touch-none select-none">
      <div className="absolute inset-0 bg-[#07040f]/55" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-crosshair" />
      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
        <div className="neon-panel neon-panel-hot flex items-center gap-5 px-5 py-2 font-display text-sm uppercase">
          <span>Score <span className="neon-cyan tabular">{hud.score}</span></span>
          <span>Time <span className="neon-mag tabular">{hud.time}</span></span>
          {hud.combo > 1 && <span className="text-[#ffd23f]">×{hud.combo} combo</span>}
        </div>
      </div>
      <button type="button" onClick={onClose} className="neon-btn neon-btn-ghost absolute right-3 top-3 !px-3 !py-2 !text-xs">✕ Quit</button>
      {phase === "count" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-[8rem] leading-none neon-mag">{count || "GO!"}</p>
            <p className="mt-4 font-mono text-sm uppercase tracking-[0.25em] text-white">Squash bugs · avoid 💣 · boss takes 5 hits</p>
          </div>
        </div>
      )}
      {pops.map((p) => (
        <span key={p.id} className="toast-in pointer-events-none absolute font-display text-lg" style={{ left: p.x - 20, top: p.y - 40, color: p.color, textShadow: `0 0 10px ${p.color}` }}>{p.text}</span>
      ))}
    </div>
  );
}

function Stat({ k, v }) {
  return (
    <div className="rounded-lg border border-line bg-panel-2 px-3 py-2">
      <dt className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">{k}</dt>
      <dd className="font-display">{v}</dd>
    </div>
  );
}
