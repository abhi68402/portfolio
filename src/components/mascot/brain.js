// ─────────────────────────────────────────────────────────────────────────────
//  Nova's brain: a small state machine, plain JavaScript (no React, no drawing).
//
//  Every frame, Mascot.jsx calls  brain.update(dt, world)  and then draws
//  brain.pose() at brain.x. Events (clicks, scrolls, balls) call methods below.
//
//  Modes:
//    landing  rocket drop on the first visit
//    idle     standing, looking around, wagging
//    run      moving (scrolling, chasing a ball, coming when called)
//    jump     in the air (after a click); can include a backflip
//    sit      bored after ~20 s
//    sleep    asleep after ~45 s
//    leave    running off-screen when sent home
// ─────────────────────────────────────────────────────────────────────────────

const GRAVITY = 1500;

export function createBrain({ startX = 80, landing = false } = {}) {
  const b = {
    x: startX,
    y: landing ? -900 : 0, // height above the floor (negative = up)
    vy: 0,
    dir: 1,               // 1 = facing right, -1 = left
    speed: 0,
    mode: landing ? "landing" : "idle",
    legs: 0,              // walk-cycle phase 0..1
    tail: 0,
    t: 0,                 // time in current mode
    idleFor: 0,           // seconds with nothing happening
    mouthFor: 0,          // >0 while barking
    flip: 0,              // backflip rotation in radians
    flipping: false,
    target: null,         // x position to run to
    onArrive: null,       // what to do when we get there
    carrying: false,      // has the ball in its mouth
    lookAt: null,         // cursor x if close
    blinkIn: 2,
    landed: !landing,
  };

  const setMode = (m) => { if (b.mode !== m) { b.mode = m; b.t = 0; } };
  const wake = () => { b.idleFor = 0; if (b.mode === "sleep" || b.mode === "sit") setMode("idle"); };

  return {
    state: b,

    // ── events ──
    poke() {
      wake();
      if (b.mode === "jump" || b.mode === "landing" || b.mode === "leave") return;
      b.vy = -420;
      b.mouthFor = 0.45;
      setMode("jump");
    },
    backflip() {
      wake();
      if (b.mode === "landing" || b.mode === "leave") return;
      b.vy = -560;
      b.flipping = true;
      b.mouthFor = 0.6;
      setMode("jump");
    },
    bark() { wake(); b.mouthFor = 0.5; },
    runTo(x, onArrive) {
      wake();
      if (b.mode === "landing" || b.mode === "leave") return;
      b.target = x;
      b.onArrive = onArrive || null;
      if (b.mode !== "jump") setMode("run");
    },
    scrollNudge(dy) {
      // scrolling makes Nova run: down = right, up = left
      if (b.mode === "landing" || b.mode === "leave" || b.target != null) return;
      wake();
      b.dir = dy > 0 ? 1 : -1;
      b.speed = Math.min(560, Math.max(b.speed, Math.abs(dy) * 9));
      if (b.mode !== "jump") setMode("run");
    },
    setCarrying(v) { b.carrying = v; },
    look(x) { b.lookAt = x; if (x != null) b.idleFor = Math.min(b.idleFor, 10); },
    leave(done) {
      b.target = -120;
      b.onArrive = done;
      b.speed = 0;
      setMode("leave");
    },

    // ── per-frame update ──
    update(dt, { width, reduce }) {
      b.t += dt;
      b.mouthFor = Math.max(0, b.mouthFor - dt);
      b.blinkIn -= dt;
      if (b.blinkIn < -0.12) b.blinkIn = 2 + Math.random() * 3;

      if (reduce) {
        // reduced motion: Nova stays put; only the mouth/blink change
        b.y = 0;
        if (b.mode !== "sit") setMode("sit");
        return;
      }

      // landing from the rocket
      // (the rocket drops for 0.9 s, then Nova hops out of the hatch)
      if (b.mode === "landing") {
        if (b.t > 0.9) {
          if (!b.popped) { b.popped = true; b.y = -70; b.vy = -320; }
          b.vy += GRAVITY * dt;
          b.y = Math.min(0, b.y + b.vy * dt);
          if (b.y >= 0 && b.vy > 0) { b.landed = true; b.mouthFor = 0.5; setMode("idle"); }
        }
        return;
      }

      // vertical physics (jumps)
      if (b.mode === "jump" || b.y < 0) {
        b.vy += GRAVITY * dt;
        b.y += b.vy * dt;
        if (b.flipping) b.flip = Math.min(Math.PI * 2, b.flip + dt * 13);
        if (b.y >= 0) {
          b.y = 0; b.vy = 0; b.flip = 0; b.flipping = false;
          setMode(b.target != null ? "run" : "idle");
        }
      }

      // horizontal movement
      if (b.target != null) {
        const dx = b.target - b.x;
        b.dir = dx > 0 ? 1 : -1;
        const sp = b.mode === "leave" ? 420 : 340;
        const step = Math.min(Math.abs(dx), sp * dt);
        b.x += step * b.dir;
        b.legs = (b.legs + dt * 3.2) % 1;
        if (Math.abs(dx) < 2) {
          b.target = null;
          const fn = b.onArrive; b.onArrive = null;
          if (b.mode !== "jump" && b.mode !== "leave") setMode("idle");
          fn?.();
        }
      } else if (b.speed > 0) {
        b.x += b.speed * b.dir * dt;
        b.legs = (b.legs + dt * (1.5 + b.speed / 140)) % 1;
        b.speed = Math.max(0, b.speed - 650 * dt); // friction once scrolling stops
        if (b.x > width - 30) { b.x = width - 30; b.dir = -1; }
        if (b.x < 30) { b.x = 30; b.dir = 1; }
        if (b.speed === 0 && b.mode === "run") setMode("idle");
      }

      // stay on screen even if the window was resized (or started tiny)
      if (b.mode !== "leave" && b.target == null) b.x = Math.max(28, Math.min(width - 28, b.x));

      // look at a nearby cursor
      if (b.mode === "idle" && b.lookAt != null) b.dir = b.lookAt > b.x ? 1 : -1;

      // tail wag: faster when happy (cursor near, carrying, just barked)
      const happy = b.lookAt != null || b.carrying || b.mouthFor > 0;
      b.tail = Math.sin(b.t * (happy ? 22 : 6));

      // boredom
      if (b.mode === "idle" || b.mode === "sit" || b.mode === "sleep") {
        b.idleFor += dt;
        if (b.idleFor > 45) setMode("sleep");
        else if (b.idleFor > 20) setMode("sit");
      }
    },

    pose() {
      const m = b.mode;
      const base = { tail: Math.round(b.tail * 2) / 2, mouth: b.mouthFor > 0 || b.carrying, blink: b.blinkIn < 0 };
      if (m === "sleep") return { mode: "sleep" };
      if (m === "sit") return { ...base, mode: "sit" };
      if (m === "jump" || m === "landing" || b.y < -2) return { ...base, mode: "jump" };
      const moving = b.target != null || b.speed > 0;
      if (moving) return { ...base, mode: "run", legs: Math.floor(b.legs * 8) / 8 };
      return { ...base, mode: "stand" };
    },
  };
}
