import { useEffect, useRef, useState } from "react";
import { glitch as LINES } from "../../data/content";
import { safeGet, safeSet } from "../../hooks/storage";
import { setRainbow } from "../fun/rainbow";
import { drawBug } from "./sprite";
import { pickMischief } from "./mischief";

// ─────────────────────────────────────────────────────────────────────────────
//  Glitch: a mischievous bug that crawls over the whole page.
//  One full-screen canvas draws every bug; small DOM bits handle speech
//  bubbles, bite marks, the stolen cursor and splats. Clicking a bug squashes
//  it (the click never reaches whatever is underneath).
//
//  Each bug has a `mode`:
//    wander → strolls around      goto → heading somewhere for mischief
//    busy   → doing the mischief  flee → running from a fast cursor
//    carry  → running off with your cursor   hidden → burrowed in a card
// ─────────────────────────────────────────────────────────────────────────────
const HIT_R = 30;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function Glitch() {
  const canvasRef = useRef(null);
  const layerRef = useRef(null);
  const cursorRef = useRef(null);
  const [bubbles, setBubbles] = useState([]); // {id, text, x, y}
  const [splats, setSplats] = useState([]);
  const [count, setCount] = useState(() => Number(safeGet("bugs-total", 0)) || 0);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv.getContext("2d");
    const layer = layerRef.current;
    const fine = matchMedia("(pointer: fine)").matches;
    let dpr = 1, W = 0, H = 0, raf = 0, last = performance.now();
    let pointer = { x: -999, y: -999, vx: 0, t: 0, still: 0 };
    let squashedThisVisit = 0, speedBoost = 1, lastSpawn = performance.now(), mischiefIn = 4, respawnTimer = 0;
    const MAX_BUGS = 3;
    const bites = []; // { el, rx, ry, r, born, node }
    let nextId = 1;
    const bugs = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
    };
    resize();

    function spawn({ x, y, main = false } = {}) {
      if (bugs.length >= MAX_BUGS) return bugs[0];
      const edge = Math.floor(Math.random() * 4);
      const sx = x ?? (edge === 0 ? -20 : edge === 1 ? W + 20 : Math.random() * W);
      const sy = y ?? (edge === 2 ? -20 : edge === 3 ? H + 20 : 120 + Math.random() * (H - 200));
      const b = { id: nextId++, x: sx, y: sy, angle: Math.atan2(H / 2 - sy, W / 2 - sx), legs: 0, mode: "wander", wanderA: Math.random() * 6.28, speed: 0, timer: 0, target: null, onArrive: null, main, alpha: 1, fleeCD: 0, blink: 0 };
      bugs.push(b);
      lastSpawn = performance.now();
      return b;
    }
    spawn({ main: true });

    // ── speech bubbles ──
    function say(b, text, ms = 2200) {
      const id = Math.random();
      setBubbles((list) => [...list.filter((x) => x.bug !== b.id), { id, bug: b.id, text }]);
      setTimeout(() => setBubbles((list) => list.filter((x) => x.id !== id)), ms);
    }
    const toast = (icon, text) => window.dispatchEvent(new CustomEvent("toast", { detail: { icon, text } }));

    // ── movement ──
    function goTo(b, x, y, onArrive, speed = 170) { b.mode = "goto"; b.target = { x, y }; b.onArrive = onArrive; b.goSpeed = speed; }
    function busy(b, secs, then) { b.mode = "busy"; b.timer = secs; b.then = then; }

    // ── mischief ──
    const api = {
      W: () => W, H: () => H, pointer: () => pointer, fine, say, toast, goTo, busy,
      bite(el) {
        const r = el.getBoundingClientRect();
        el.classList.add("chewed");
        const n = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) {
          const node = document.createElement("span");
          node.className = "absolute rounded-full";
          node.style.cssText = `background: var(--bg); width:${10 + Math.random() * 10}px; height:${10 + Math.random() * 10}px; transition: opacity .8s;`;
          layer.appendChild(node);
          bites.push({ el, rx: Math.random() * r.width, ry: Math.random() < 0.5 ? -4 : r.height - 8, born: performance.now(), node });
        }
        setTimeout(() => el.classList.remove("chewed"), 1600);
      },
      stealCursor(b) {
        document.documentElement.classList.add("cursor-stolen");
        cursorRef.current.style.display = "block";
        b.carrying = true;
        say(b, pick(LINES.onSteal));
        const tx = Math.random() < 0.5 ? 60 : W - 60, ty = 120 + Math.random() * (H - 240);
        goTo(b, tx, ty, () => api.dropCursor(b), 260);
        b.mode = "carry";
      },
      dropCursor(b) {
        b.carrying = false;
        document.documentElement.classList.remove("cursor-stolen");
        const c = cursorRef.current;
        c.style.transition = "opacity 1s"; c.style.opacity = "0";
        setTimeout(() => { c.style.display = "none"; c.style.opacity = "1"; c.style.transition = ""; }, 1000);
        b.mode = "wander";
      },
    };

    // ── squash: clicks that land on a bug never reach the page ──
    function squash(b) {
      setSplats((s) => [...s, { id: Math.random(), x: b.x, y: b.y }]);
      setTimeout(() => setSplats((s) => s.slice(1)), 600);
      if (b.carrying) api.dropCursor(b);
      bugs.splice(bugs.indexOf(b), 1);
      squashedThisVisit++;
      const total = Number(safeGet("bugs-total", 0)) + 1;
      safeSet("bugs-total", String(total));
      setCount(total);
      if (squashedThisVisit === 1) toast("👾", "Squashed! It'll be back, faster.");
      if (squashedThisVisit === 5) toast("🏅", "Achievement: Exterminator. 5 bugs squashed.");
      if (squashedThisVisit === 10) { setRainbow(true); toast("🌈", "Glitch surrenders! Secret rainbow mode unlocked."); }
      if (!bugs.length && !respawnTimer) {
        speedBoost = Math.min(2.2, speedBoost + 0.15);
        respawnTimer = setTimeout(() => {
          respawnTimer = 0;
          if (!bugs.length) { const nb = spawn({ main: true }); say(nb, pick(LINES.onSquash)); }
        }, 3500);
      }
    }
    const onPointerDown = (e) => {
      for (const b of bugs) {
        if (b.mode === "hidden") continue;
        if (Math.hypot(e.clientX - b.x, e.clientY - b.y) < HIT_R) {
          e.preventDefault(); e.stopPropagation();
          document.documentElement.dataset.justSquashed = "1";
          setTimeout(() => delete document.documentElement.dataset.justSquashed, 500);
          squash(b);
          return;
        }
      }
    };
    const onClickCapture = (e) => {
      // swallow the click that follows a squash
      if (document.documentElement.dataset.justSquashed) { e.preventDefault(); e.stopPropagation(); delete document.documentElement.dataset.justSquashed; }
    };
    const onPointerMove = (e) => {
      const now = performance.now();
      const dt = Math.max(1, now - pointer.t);
      const sp = Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) / dt * 1000;
      pointer = { x: e.clientX, y: e.clientY, vx: sp, t: now, still: 0 };
      // stolen cursor: moving the mouse snatches it back
      const carrier = bugs.find((b) => b.carrying);
      if (carrier && sp > 300) { api.dropCursor(carrier); say(carrier, "fine, have it back"); }
      const over = bugs.some((b) => b.mode !== "hidden" && Math.hypot(e.clientX - b.x, e.clientY - b.y) < HIT_R);
      document.documentElement.classList.toggle("bug-hover", over);
    };

    // ── main loop ──
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const covered = document.body.style.overflow === "hidden" || document.documentElement.dataset.blitz;
      layer.style.visibility = covered ? "hidden" : "visible";
      if (covered) return;
      pointer.still += dt;

      // mischief timer (main bug only, never while someone is typing)
      const typing = document.activeElement?.matches?.("input, textarea");
      mischiefIn -= dt;
      const main = bugs.find((b) => b.main) || bugs[0];
      if (main && mischiefIn <= 0 && main.mode === "wander" && !typing) {
        mischiefIn = 6 + Math.random() * 6;
        pickMischief(main, api);
      }
      // breeding when ignored
      if (bugs.length && bugs.length < MAX_BUGS && now - lastSpawn > 40000) {
        const src = bugs[0];
        const kid = spawn({ x: src.x + 10, y: src.y + 10 });
        say(kid, pick(LINES.onBreed), 2600);
        window.dispatchEvent(new CustomEvent("toast-once", { detail: { id: "breed", icon: "🐛", text: "Ignored bugs multiply. Click to squash them!" } }));
      }

      for (const b of [...bugs]) {
        b.fleeCD -= dt;
        b.blink = Math.random() < 0.01 ? 0.12 : Math.max(0, b.blink - dt);
        // flee from a fast cursor
        const dp = Math.hypot(pointer.x - b.x, pointer.y - b.y);
        if (dp < 120 && pointer.vx > 700 && b.fleeCD <= 0 && b.mode !== "carry" && b.mode !== "hidden") {
          b.mode = "flee"; b.timer = 0.9; b.fleeCD = 1.6;
          if (Math.random() < 0.5) say(b, pick(LINES.taunts));
        }
        let desired = b.angle, speed = 0;
        if (b.mode === "wander") {
          b.wanderA += (Math.random() - 0.5) * 2.4 * dt * 3;
          // steer back toward the middle near the edges
          const m = 70;
          if (b.x < m || b.x > W - m || b.y < 90 || b.y > H - m) b.wanderA = Math.atan2(H / 2 - b.y, W / 2 - b.x);
          desired = b.wanderA; speed = 70 * speedBoost;
        } else if (b.mode === "goto" || b.mode === "carry") {
          desired = Math.atan2(b.target.y - b.y, b.target.x - b.x);
          speed = (b.goSpeed || 170) * speedBoost;
          if (Math.hypot(b.target.x - b.x, b.target.y - b.y) < 14) { const fn = b.onArrive; b.onArrive = null; b.mode = "wander"; fn?.(); }
        } else if (b.mode === "flee") {
          desired = Math.atan2(b.y - pointer.y, b.x - pointer.x); speed = 460 * speedBoost;
          b.timer -= dt; if (b.timer <= 0) b.mode = "wander";
        } else if (b.mode === "busy") {
          b.timer -= dt; b.legs += dt * 2;
          if (b.timer <= 0) { b.mode = "wander"; const fn = b.then; b.then = null; fn?.(); }
        } else if (b.mode === "hidden") {
          b.timer -= dt; b.alpha = Math.max(0, b.alpha - dt * 3);
          if (b.timer <= 0) { b.mode = "wander"; b.x = b.peekX; b.y = b.peekY; say(b, "peekaboo!"); }
        }
        if (b.mode !== "hidden") b.alpha = Math.min(1, b.alpha + dt * 3);
        // turn toward the desired heading, then move
        let da = ((desired - b.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        b.angle += Math.max(-7 * dt, Math.min(7 * dt, da));
        b.x += Math.cos(b.angle) * speed * dt;
        b.y += Math.sin(b.angle) * speed * dt;
        if (b.mode !== "goto" && b.mode !== "carry") { b.x = Math.max(16, Math.min(W - 16, b.x)); b.y = Math.max(76, Math.min(H - 16, b.y)); }
        b.legs = (b.legs + dt * speed / 28) % 1;
      }

      // draw
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const b of bugs) {
        ctx.globalAlpha = b.alpha;
        ctx.shadowColor = "#ff2bd6"; ctx.shadowBlur = 14;
        drawBug(ctx, { x: b.x, y: b.y, angle: b.angle, size: 2, legs: b.legs, blink: b.blink > 0 });
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      // stolen cursor rides in the bug's mouth
      const carrier = bugs.find((b) => b.carrying);
      if (carrier) cursorRef.current.style.transform = `translate3d(${carrier.x + Math.cos(carrier.angle) * 18}px, ${carrier.y + Math.sin(carrier.angle) * 18}px, 0)`;

      // bite marks follow their element; they "regrow" (fade) after 4 s
      for (let i = bites.length - 1; i >= 0; i--) {
        const bt = bites[i], r = bt.el.getBoundingClientRect();
        bt.node.style.transform = `translate3d(${r.left + bt.rx}px, ${r.top + bt.ry}px, 0)`;
        const age = now - bt.born;
        if (age > 4000) bt.node.style.opacity = "0";
        if (age > 5000) { bt.node.remove(); bites.splice(i, 1); }
      }

      // bubbles follow their bug
      layer.querySelectorAll("[data-bubble]").forEach((node) => {
        const b = bugs.find((x) => x.id === Number(node.dataset.bubble));
        if (!b) return;
        const bw = node.offsetWidth;
        node.style.transform = `translate3d(${Math.max(8, Math.min(W - bw - 8, b.x - bw / 2))}px, ${Math.max(70, b.y - 58)}px, 0)`;
      });
    }

    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    window.addEventListener("resize", resize);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("click", onClickCapture, true);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(frame);
    if (import.meta.env.DEV) window.__glitch = { bugs, api, spawn, squash };

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(respawnTimer);
      bites.forEach((b) => b.node.remove());
      document.documentElement.classList.remove("cursor-stolen", "bug-hover");
      window.removeEventListener("resize", resize);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={layerRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[65] overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* the stolen cursor */}
      <svg ref={cursorRef} width="22" height="26" viewBox="0 0 22 26" className="absolute left-0 top-0" style={{ display: "none" }}>
        <path d="M2 2l0 19 5-5 4 8 3-1-4-8 7 0z" fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      {splats.map((s) => (
        <span key={s.id} className="splat absolute h-16 w-16 rounded-full" style={{ left: s.x - 32, top: s.y - 32, background: "radial-gradient(circle, #39ff88 0 30%, #ff2bd6 31% 45%, transparent 46%)" }} />
      ))}
      {bubbles.map((b) => (
        <span key={b.id} data-bubble={b.bug} className="neon-panel neon-panel-hot absolute left-0 top-0 whitespace-nowrap px-2.5 py-1 font-mono text-xs">
          {b.text}
        </span>
      ))}
      {count > 0 && (
        <span className="neon-panel absolute right-4 top-20 px-3 py-1.5 font-display text-xs uppercase">
          <span className="neon-mag">👾 {count}</span> squashed
        </span>
      )}
    </div>
  );
}
