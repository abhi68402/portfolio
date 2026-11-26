// ─────────────────────────────────────────────────────────────────────────────
//  Nova's brain: movement + moods. Plain JavaScript, no React, no drawing.
//
//  Nova lives in screen coordinates: (x, y) is the point between her paws.
//  She stands on "platforms": the top edges of page panels marked data-perch,
//  or the floor (bottom of the screen). Every frame Mascot.jsx passes in the
//  current platforms; because they're re-read each frame, scrolling the page
//  carries her along on whatever she's standing on.
//
//  Modes: landing · idle · air · sit · sleep · sniff · howl · spin · leave
// ─────────────────────────────────────────────────────────────────────────────

const G = 1700;      // gravity, px/s²
const WALK = 300;    // trotting speed
const NAV_TOP = 72;  // ignore platforms hidden under the navbar

export function createBrain({ startX = 90, landing = false } = {}) {
  const b = {
    x: startX, y: -200, vx: 0, vy: 0,
    on: null,            // platform key, "floor", or null while in the air
    dir: 1,
    mode: landing ? "landing" : "air",
    t: 0, modeLeft: 0,   // time in mode / time until a timed mode ends
    idleFor: 0,
    mouthFor: 0,
    flip: 0, flipping: false,
    target: null, onArrive: null,
    speed: 0,            // floor zoomies from scrolling
    legs: 0, tail: 0, blinkIn: 2,
    listening: false,
    wanderIn: 4 + Math.random() * 4,
    onLand: null,
    popped: false,
  };
  let world = { width: 1024, floorY: 700, plats: [] };

  const setMode = (m, secs = 0) => { b.mode = m; b.t = 0; b.modeLeft = secs; };
  const grounded = () => b.on != null;
  const busy = () => ["landing", "leave", "spin", "sniff", "howl"].includes(b.mode);
  const plat = (key) => (key === "floor" ? { key: "floor", l: -1e4, r: 1e4, top: world.floorY } : world.plats.find((p) => p.key === key));

  // Launch toward a point and let gravity do the rest; the landing check
  // catches her on whatever platform she meets on the way down.
  function hopTo(tx, ty, onLand) {
    const top = Math.min(b.y, ty) - 36;
    const h1 = Math.max(24, b.y - top);
    const vy0 = -Math.sqrt(2 * G * h1);
    const tUp = -vy0 / G;
    const tDown = Math.sqrt(Math.max(0, 2 * (ty - (b.y - h1))) / G);
    b.vx = (tx - b.x) / Math.max(0.25, tUp + tDown);
    b.vy = vy0;
    b.dir = tx >= b.x ? 1 : -1;
    b.on = null;
    b.target = null;
    b.onLand = onLand || null;
    setMode("air");
  }

  function wake() {
    b.idleFor = 0;
    if (b.mode === "sleep" || b.mode === "sit") setMode("idle");
  }

  // Little bits of "free will" when the visitor has been active recently.
  function wander() {
    // on narrow screens panels sit close together, so Nova keeps to the floor
    const reach = world.width < 640 ? [] : world.plats.filter((p) => p.r - p.l > 70 && p.top > NAV_TOP + 40 && p.top < world.floorY - 70 && Math.abs((p.l + p.r) / 2 - b.x) < 460 && p.key !== b.on);
    const r = Math.random();
    if (reach.length && r < 0.55) {
      const p = reach[Math.floor(Math.random() * reach.length)];
      const tx = Math.max(p.l + 20, Math.min(p.r - 20, b.x + (Math.random() - 0.5) * 200));
      hopTo(tx, p.top);
    } else if (b.on !== "floor" && r < 0.75) {
      const p = plat(b.on);
      if (p) b.target = Math.random() < 0.5 ? p.l - 30 : p.r + 30; // trot off the edge and drop down
    } else {
      const p = plat(b.on);
      if (p) b.target = Math.max(p.l + 16, Math.min(p.r - 16, Math.max(40, Math.min(world.width - 40, b.x + (Math.random() - 0.5) * 360))));
    }
  }

  return {
    state: b,
    get world() { return world; },

    // ── commands ──
    poke() {
      wake();
      if (busy() || !grounded()) return;
      b.mouthFor = 0.45;
      b.vy = -430; b.vx = 0; b.on = null;
      setMode("air");
    },
    backflip() {
      wake();
      if (b.mode === "landing" || b.mode === "leave" || !grounded()) return;
      b.mouthFor = 0.6;
      b.vy = -600; b.vx = 0; b.on = null; b.flipping = true;
      setMode("air");
    },
    bark() { b.mouthFor = 0.5; },
    hopTo(tx, ty, onLand) { wake(); if (b.mode === "landing" || b.mode === "leave") return; hopTo(tx, ty, onLand); },
    runTo(x, onArrive) {
      wake();
      if (b.mode === "landing" || b.mode === "leave") return;
      b.target = x; b.onArrive = onArrive || null;
      if (b.mode !== "air") setMode("idle");
    },
    spin(secs = 0.7) { wake(); if (grounded() && b.mode !== "leave") { b.mouthFor = secs; setMode("spin", secs); } },
    sniff(secs = 1.4) { if (grounded()) setMode("sniff", secs); },
    howl(secs = 2.4) { if (grounded()) { b.mouthFor = 0; setMode("howl", secs); } },
    listen(on) { b.listening = on; if (on) { b.idleFor = 0; if (grounded()) setMode("sit"); } else if (b.mode === "sit") setMode("idle"); },
    scrollNudge(dy) {
      b.idleFor = 0;
      if (b.mode === "sleep" || b.mode === "sit") setMode("idle");
      // only floor-Nova does zoomies; on a panel she just rides along
      if (b.on !== "floor" || busy() || b.target != null) return;
      b.dir = dy > 0 ? 1 : -1;
      b.speed = Math.min(560, Math.max(b.speed, Math.abs(dy) * 9));
    },
    zoomies() {
      wake();
      if (b.on === "floor") { b.speed = 520; b.dir = b.x < world.width / 2 ? 1 : -1; }
      else if (grounded()) { const p = plat(b.on); if (p) b.target = b.x - p.l < p.r - b.x ? p.l - 30 : p.r + 30; }
    },
    touch() { b.idleFor = 0; },
    look(x) { b.lookAt = x; },
    leave(done) { b.target = -140; b.onArrive = done; b.listening = false; setMode("leave"); },

    // ── per-frame update ──
    update(dt, w) {
      world = w;
      b.t += dt;
      b.mouthFor = Math.max(0, b.mouthFor - dt);
      b.blinkIn -= dt;
      if (b.blinkIn < -0.12) b.blinkIn = 2 + Math.random() * 3;

      if (w.reduce) { // reduced motion: sit quietly on the floor
        b.on = "floor"; b.y = w.floorY; b.x = Math.max(40, Math.min(w.width - 40, b.x));
        if (b.mode !== "sit") setMode("sit");
        return;
      }

      // rocket landing (first visit): hidden for 0.9 s, then pops out of the hatch
      if (b.mode === "landing") {
        if (b.t > 0.9) { b.y = w.floorY - 70; b.vy = -330; b.vx = 0; b.on = null; setMode("air"); }
        else b.y = -200;
        return;
      }

      // timed moods
      if (b.modeLeft > 0) {
        b.modeLeft -= dt;
        if (b.mode === "spin" && Math.floor(b.t * 10) !== Math.floor((b.t - dt) * 10)) b.dir *= -1;
        if (b.modeLeft <= 0) setMode("idle");
      }

      // keep standing on our platform (it moves when the page scrolls)
      if (b.on) {
        const p = plat(b.on);
        if (!p || p.top < NAV_TOP || p.top > w.floorY + 2 || b.x < p.l - 2 || b.x > p.r + 2) {
          // platform scrolled away or we walked off its edge: fall
          b.on = null; b.vy = 0;
          b.vx = b.target != null ? Math.sign(b.target - b.x) * WALK * 0.8 : 0;
          if (!busy()) setMode("air");
        } else b.y = p.top;
      }

      // airborne physics + landing
      if (!b.on) {
        const prevY = b.y;
        b.vy += G * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.flipping) b.flip = Math.min(Math.PI * 2, b.flip + dt * 13);
        if (b.vy > 0) {
          let land = null;
          for (const p of w.plats) {
            if (p.top < NAV_TOP || b.x < p.l + 2 || b.x > p.r - 2) continue;
            if (prevY <= p.top + 3 && b.y >= p.top && (!land || p.top < land.top)) land = p;
          }
          if (!land && b.y >= w.floorY) land = { key: "floor", top: w.floorY };
          if (land) {
            b.on = land.key; b.y = land.top; b.vy = 0; b.vx = 0; b.flip = 0; b.flipping = false;
            if (b.mode === "air") setMode(b.listening ? "sit" : "idle");
            const cb = b.onLand; b.onLand = null; cb?.();
          }
        }
        if (b.y > w.floorY) { b.y = w.floorY; b.on = "floor"; b.vy = 0; b.vx = 0; }
      }

      // walking toward a target (along the current surface)
      if (b.on && b.target != null && b.mode !== "spin" && b.mode !== "sniff" && b.mode !== "howl") {
        if (b.mode === "sit" || b.mode === "sleep") setMode("idle");
        const dx = b.target - b.x;
        b.dir = dx > 0 ? 1 : -1;
        const step = Math.min(Math.abs(dx), (b.mode === "leave" ? 420 : WALK) * dt);
        b.x += step * b.dir;
        b.legs = (b.legs + dt * 3.2) % 1;
        if (Math.abs(dx) < 2) {
          b.target = null;
          const fn = b.onArrive; b.onArrive = null;
          if (b.mode !== "leave") setMode(b.listening ? "sit" : "idle");
          fn?.();
        }
      } else if (b.on === "floor" && b.speed > 0) {
        b.x += b.speed * b.dir * dt;
        b.legs = (b.legs + dt * (1.5 + b.speed / 140)) % 1;
        b.speed = Math.max(0, b.speed - 650 * dt);
        if (b.x > w.width - 34) { b.x = w.width - 34; b.dir = -1; }
        if (b.x < 34) { b.x = 34; b.dir = 1; }
      }

      // never wander off-screen (except when leaving)
      if (b.mode !== "leave") b.x = Math.max(24, Math.min(w.width - 24, b.x));

      if ((b.mode === "idle") && b.lookAt != null && b.target == null) b.dir = b.lookAt > b.x ? 1 : -1;
      const happy = b.lookAt != null || b.mouthFor > 0 || b.mode === "sniff" || b.mode === "spin";
      b.tail = Math.sin(b.t * (happy ? 22 : 6));

      // on phones, hop back down to the floor after a visit to a panel
      if (w.width < 640 && b.on && b.on !== "floor" && b.mode === "idle" && b.target == null && b.t > 4) {
        const p = plat(b.on);
        if (p) b.target = b.x - p.l < p.r - b.x ? p.l - 30 : p.r + 30;
      }

      // free will + boredom
      const calm = b.on && b.target == null && b.speed === 0 && !busy() && !b.listening;
      if (calm && (b.mode === "idle" || b.mode === "sit" || b.mode === "sleep")) {
        b.idleFor += dt;
        if (b.idleFor < 16) {
          b.wanderIn -= dt;
          if (b.wanderIn <= 0) { b.wanderIn = 6 + Math.random() * 7; wander(); }
        } else if (b.idleFor > 45) { if (b.mode !== "sleep") setMode("sleep"); }
        else if (b.idleFor > 20 && b.mode !== "sit") setMode("sit");
      }
    },

    pose(acc = []) {
      const m = b.mode;
      const base = { tail: Math.round(b.tail * 2) / 2, mouth: b.mouthFor > 0, blink: b.blinkIn < 0, acc };
      if (m === "sleep") return { mode: "sleep", acc };
      if (m === "howl") return { ...base, mode: "sit", head: "up", mouth: true };
      if (m === "sit") return { ...base, mode: "sit", head: b.listening && Math.floor(b.t * 0.7) % 2 ? "tilt" : undefined };
      if (m === "sniff") return { ...base, mode: "stand", head: "down", legs: 0 };
      if (!b.on) return { ...base, mode: "jump" };
      const moving = b.target != null || b.speed > 0;
      if (moving) return { ...base, mode: "run", legs: Math.floor(b.legs * 8) / 8 };
      return { ...base, mode: "stand" };
    },
  };
}
