// ─────────────────────────────────────────────────────────────────────────────
//  NOVA RUN · game engine (plain JavaScript + <canvas>).
//
//  The world is drawn on a tiny 320×180 canvas, then scaled up with smoothing
//  off, which gives the chunky pixel-art look and makes sizes easy to reason
//  about. Everything below uses those 320×180 "game pixels".
//
//  Each frame:  read input → move Nova → spawn things → move things →
//               check collisions → update particles → draw
//
//  React (NovaRun.jsx) shows the score/lives/menus and calls start(), etc.
// ─────────────────────────────────────────────────────────────────────────────
import { drawPup } from "../mascot/sprite";
import { sfx } from "./sound";

const W = 320, H = 180;
const GY = 152;            // y of the ground surface
const NX = 60;             // Nova's x position (the world moves, she doesn't)
const GRAVITY = 1150;
const JUMP_V = -330, DOUBLE_V = -285;

const LEVELS = [
  { at: 0, name: "Localhost" },
  { at: 150, name: "Code review" },
  { at: 400, name: "Staging" },
  { at: 800, name: "Production" },
  { at: 1300, name: "Scaling up" },
  { at: 2000, name: "Legendary" },
];

export function createRunner(canvas, { skills, onHud, onBanner, onEnd, onPause, reduce }) {
  const view = canvas.getContext("2d");
  const off = document.createElement("canvas");
  off.width = W; off.height = H;
  const g = off.getContext("2d");
  g.imageSmoothingEnabled = false;

  let raf = 0, last = 0, mode = "demo"; // demo | play | paused | over
  let s; // all per-run state lives here
  let pal = palette();
  const far = makeSkyline(18, 90, 28, true);
  const near = makeSkyline(12, 60, 42, false);
  const stars = Array.from({ length: 60 }, () => ({ x: Math.random() * W, y: Math.random() * 110, tw: Math.random() * 6 }));
  const input = { jumpHeld: false, jumpPressed: false, duck: false };

  function reset() {
    s = {
      t: 0, speed: 100, dist: 0, score: 0, lives: 3,
      y: 0, vy: 0, onGround: true, jumps: 0, holdT: 0, squash: 0, legs: 0,
      items: [], parts: [], pops: [],
      nextSpawn: 80, level: 0,
      streak: 0, bestCombo: 1, caught: [],
      shield: false, coffee: 0, magnet: 0, invuln: 0,
      shake: 0, flash: 0,
    };
  }

  // ── input ──────────────────────────────────────────────────────────────────
  const isJumpKey = (k) => k === " " || k === "ArrowUp" || k === "w" || k === "W";
  const isDuckKey = (k) => k === "ArrowDown" || k === "s" || k === "S";
  const onKeyDown = (e) => {
    if (mode !== "play" && mode !== "paused") return;
    if (e.key === "p" || e.key === "P") { togglePause(); e.preventDefault(); return; }
    if (mode !== "play") return;
    if (isJumpKey(e.key)) { if (!e.repeat) input.jumpPressed = true; input.jumpHeld = true; e.preventDefault(); }
    if (isDuckKey(e.key)) { input.duck = true; e.preventDefault(); }
  };
  const onKeyUp = (e) => {
    if (isJumpKey(e.key)) input.jumpHeld = false;
    if (isDuckKey(e.key)) input.duck = false;
  };
  let downY = null;
  const onPointerDown = (e) => {
    if (mode !== "play") return;
    downY = e.clientY;
    input.jumpPressed = true; input.jumpHeld = true;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (downY != null && e.clientY - downY > 28) { input.duck = true; input.jumpHeld = false; } // swipe down = duck
  };
  const onPointerUp = () => { downY = null; input.jumpHeld = false; input.duck = false; };

  // ── spawning ───────────────────────────────────────────────────────────────
  function spawn() {
    const lv = s.level;
    const r = Math.random();
    const x = W + 20;
    if (r < 0.14 && mode === "play") {
      const kind = ["coffee", "shield", "magnet"][Math.floor(Math.random() * 3)];
      s.items.push({ type: "power", kind, x, y: GY - 34 - Math.random() * 20, w: 12, h: 12, bob: Math.random() * 6 });
    } else if (r < 0.5) {
      // arc of skill orbs, sometimes over a bug
      const n = 3 + Math.floor(Math.random() * 3);
      const withBug = Math.random() < 0.5;
      for (let i = 0; i < n; i++) {
        const k = i / (n - 1);
        s.items.push(orb(x + i * 16, GY - 18 - Math.sin(k * Math.PI) * (withBug ? 40 : 22)));
      }
      if (withBug) s.items.push(bug(x + ((n - 1) * 16) / 2 - 7));
      return 90 + n * 16;
    } else if (r < 0.72 + Math.min(0.12, lv * 0.03) && lv >= 1) {
      s.items.push({ type: "drone", x, y: GY - 28, w: 18, h: 10, ph: Math.random() * 6 });
      // a reward for ducking: low orbs right under the drone
      if (Math.random() < 0.5) for (let i = 0; i < 3; i++) s.items.push(orb(x - 10 + i * 14, GY - 10));
    } else {
      s.items.push(bug(x));
      if (lv >= 2 && Math.random() < 0.3) s.items.push(bug(x + 16)); // double bug later on
      // a trail of easy orbs after the bug
      if (Math.random() < 0.5) for (let i = 0; i < 3; i++) s.items.push(orb(x + 46 + i * 14, GY - 14));
      return 60;
    }
    return 0;
  }
  const orb = (x, y) => ({ type: "orb", x, y, w: 9, h: 9, label: skills[Math.floor(Math.random() * skills.length)] });
  const bug = (x) => ({ type: "bug", x, y: GY - 9, w: 14, h: 9, ph: Math.random() * 6 });

  // ── update ────────────────────────────────────────────────────────────────
  function update(dt) {
    const demo = mode === "demo";
    s.t += dt;
    const sp = s.speed * (s.coffee > 0 ? 1.35 : 1);
    s.dist += sp * dt;
    if (!demo) s.score += sp * dt * 0.1;

    // level up by distance (in "metres" = px/10)
    const m = s.dist / 10;
    while (s.level < LEVELS.length - 1 && m >= LEVELS[s.level + 1].at) {
      s.level++;
      if (!demo) { onBanner?.(`Level ${s.level + 1} · ${LEVELS[s.level].name}`); sfx.level(); }
    }
    s.speed = Math.min(255, 100 + s.level * 18 + s.t * 0.9);

    // demo mode: a simple autopilot so the title screen looks alive
    if (demo) {
      const threat = s.items.find((it) => (it.type === "bug" || it.type === "drone") && it.x > NX && it.x - NX < 46);
      input.duck = threat?.type === "drone";
      if (threat?.type === "bug" && s.onGround) { input.jumpPressed = true; input.jumpHeld = true; }
      else if (!threat) input.jumpHeld = false;
    }

    // Nova: jumping, holding for height, double jump, ducking/fast-fall
    if (input.jumpPressed) {
      if (s.onGround) { s.vy = JUMP_V; s.onGround = false; s.jumps = 1; s.holdT = 0; dust(6); !demo && sfx.jump(); }
      else if (s.jumps < 2) { s.vy = DOUBLE_V; s.jumps = 2; s.holdT = 0.12; burst(NX, GY + s.y - 6, pal.accent, 6); !demo && sfx.double(); }
    }
    input.jumpPressed = false;
    if (!s.onGround) {
      s.holdT += dt;
      const floaty = input.jumpHeld && s.vy < 0 && s.holdT < 0.22;
      s.vy += GRAVITY * (floaty ? 0.5 : 1) * (input.duck ? 2.2 : 1) * dt;
      s.y += s.vy * dt;
      if (s.y >= 0) { s.y = 0; s.vy = 0; s.onGround = true; s.jumps = 0; s.squash = 0.09; dust(5); }
    }
    s.squash = Math.max(0, s.squash - dt);
    s.legs = (s.legs + dt * (2 + sp / 60)) % 1;
    if (s.onGround && Math.random() < dt * 14) dust(1);

    s.coffee = Math.max(0, s.coffee - dt);
    s.magnet = Math.max(0, s.magnet - dt);
    s.invuln = Math.max(0, s.invuln - dt);
    s.shake = Math.max(0, s.shake - dt);
    s.flash = Math.max(0, s.flash - dt);

    // spawn by distance travelled
    s.nextSpawn -= sp * dt;
    if (s.nextSpawn <= 0) {
      const extra = spawn();
      const gap = 75 + Math.random() * 90 - Math.min(30, s.level * 6);
      s.nextSpawn = gap + extra + sp * 0.25;
    }

    // Nova's hitbox (smaller when ducking)
    const ducking = input.duck && s.onGround;
    const hb = ducking ? { x: NX - 10, y: GY - 13, w: 22, h: 13 } : { x: NX - 8, y: GY + s.y - 24, w: 19, h: 22 };

    for (const it of s.items) {
      it.x -= sp * dt;
      if (it.ph != null) it.ph += dt * 10;
      if (it.bob != null) it.bob += dt * 4;
      if (it.type === "drone") it.y = GY - 28 + Math.sin(it.ph * 0.4) * 1.5;
      // magnet pulls orbs in
      if (it.type === "orb" && s.magnet > 0) {
        const dx = NX - it.x, dy = GY + s.y - 14 - it.y;
        const d = Math.hypot(dx, dy);
        if (d < 110) { it.x += (dx / d) * 260 * dt; it.y += (dy / d) * 260 * dt; }
      }
      if (it.dead) continue;
      if (!overlap(hb, it)) {
        if (it.type === "orb" && it.x < NX - 24 && !it.missed) { it.missed = true; if (!demo) s.streak = 0; }
        continue;
      }
      if (it.type === "orb") {
        it.dead = true;
        if (demo) continue;
        s.streak++;
        const mult = Math.min(5, 1 + Math.floor(s.streak / 4));
        s.bestCombo = Math.max(s.bestCombo, mult);
        s.score += 10 * mult;
        s.caught.push(it.label);
        pop(it.x, it.y - 6, `${it.label} +${10 * mult}${mult > 1 ? ` ×${mult}` : ""}`, pal.accent);
        burst(it.x + 4, it.y + 4, pal.accent, 8);
        sfx.pickup(mult);
      } else if (it.type === "power") {
        it.dead = true;
        if (it.kind === "coffee") { s.coffee = 3.2; s.invuln = Math.max(s.invuln, 3.2); pop(it.x, it.y - 6, "CAFFEINATED!", pal.text); }
        if (it.kind === "shield") { s.shield = true; pop(it.x, it.y - 6, "UNIT TESTS ON", pal.text); }
        if (it.kind === "magnet") { s.magnet = 6; pop(it.x, it.y - 6, "GIT PULL!", pal.text); }
        burst(it.x + 6, it.y + 6, "#9fd3ff", 12);
        sfx.power();
      } else {
        // bug or drone
        if (demo || s.invuln > 0 || s.coffee > 0) {
          if (s.coffee > 0 && !demo) { it.dead = true; burst(it.x + 7, it.y + 4, pal.text, 10); s.score += 5; pop(it.x, it.y - 6, "SQUASHED +5", pal.text); }
          continue;
        }
        it.dead = true;
        if (s.shield) {
          s.shield = false; s.invuln = 0.8;
          burst(NX, GY + s.y - 12, "#9fd3ff", 16);
          pop(NX, GY + s.y - 34, "Tests caught it!", "#9fd3ff");
          sfx.shield();
        } else {
          s.lives--; s.streak = 0; s.invuln = 1.4;
          if (!reduce) { s.shake = 0.3; s.flash = 0.15; }
          burst(NX, GY + s.y - 12, "#e8697a", 18);
          pop(NX, GY + s.y - 34, it.type === "bug" ? "Bug!" : "404!", "#e8697a");
          sfx.hit();
          if (s.lives <= 0) { gameOver(); return; }
        }
      }
    }
    s.items = s.items.filter((it) => !it.dead && it.x > -40);

    for (const p of s.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= dt; }
    s.parts = s.parts.filter((p) => p.life > 0);
    for (const p of s.pops) { p.y -= 22 * dt; p.life -= dt; }
    s.pops = s.pops.filter((p) => p.life > 0);

    if (!demo) emitHud();
  }

  let lastHud = "";
  function emitHud() {
    const hud = {
      score: Math.floor(s.score),
      lives: s.lives,
      mult: Math.min(5, 1 + Math.floor(s.streak / 4)),
      shield: s.shield,
      coffee: Math.ceil(s.coffee),
      magnet: Math.ceil(s.magnet),
      metres: Math.floor(s.dist / 10),
    };
    const key = JSON.stringify(hud);
    if (key !== lastHud) { lastHud = key; onHud?.(hud); }
  }

  function gameOver() {
    mode = "over";
    sfx.over();
    onEnd?.({
      score: Math.floor(s.score),
      metres: Math.floor(s.dist / 10),
      bestCombo: s.bestCombo,
      caught: s.caught,
      level: LEVELS[s.level].name,
    });
  }

  // ── effects ────────────────────────────────────────────────────────────────
  function dust(n) {
    const count = reduce ? Math.ceil(n / 2) : n;
    for (let i = 0; i < count; i++) s.parts.push({ x: NX - 8 + Math.random() * 6, y: GY - 1, vx: -40 - Math.random() * 60, vy: -20 - Math.random() * 40, life: 0.35 + Math.random() * 0.2, c: pal.dust, size: 1 + (Math.random() < 0.3 ? 1 : 0) });
  }
  function burst(x, y, c, n) {
    const count = reduce ? Math.ceil(n / 3) : n;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 90;
      s.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, life: 0.4 + Math.random() * 0.3, c, size: Math.random() < 0.4 ? 2 : 1 });
    }
  }
  function pop(x, y, text, c) { s.pops.push({ x, y, text, c, life: 0.9 }); }

  // ── drawing ───────────────────────────────────────────────────────────────
  function draw() {
    const night = Math.min(1, s.level / 4);
    // sky
    const sky = g.createLinearGradient(0, 0, 0, GY);
    sky.addColorStop(0, mix(pal.skyTop, pal.skyTopNight, night));
    sky.addColorStop(1, mix(pal.skyBottom, pal.skyBottomNight, night));
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);

    // stars (more as it gets darker) + moon/sun
    for (const st of stars) {
      const a = (pal.stars + night * 0.6) * (0.5 + 0.5 * Math.sin(s.t * 2 + st.tw));
      if (a <= 0.02) continue;
      g.fillStyle = `rgba(255,255,255,${Math.min(1, a)})`;
      g.fillRect(Math.floor((st.x - s.dist * 0.02 + W * 10) % W), st.y, 1, 1);
    }
    g.fillStyle = pal.orb;
    g.beginPath(); g.arc(250, 38 + night * 8, 11, 0, Math.PI * 2); g.fill();

    // far + near skyline, at different speeds (parallax)
    drawSkyline(far, s.dist * 0.15, GY - 4, pal.far, null);
    drawSkyline(near, s.dist * 0.4, GY, pal.near, pal.window);

    // ground
    g.fillStyle = pal.ground; g.fillRect(0, GY, W, H - GY);
    g.fillStyle = pal.groundLine; g.fillRect(0, GY, W, 1);
    g.fillStyle = pal.accent;
    const dash = Math.floor(s.dist) % 24;
    for (let x = -dash; x < W; x += 24) g.fillRect(x, GY + 12, 10, 2);
    g.fillStyle = pal.groundLine;
    for (let x = -Math.floor(s.dist * 1.0) % 7; x < W; x += 7) g.fillRect(x, GY + 4 + ((x * 7) & 3), 1, 1);

    // items
    for (const it of s.items) {
      if (it.type === "orb") drawOrb(it);
      else if (it.type === "bug") drawBug(it);
      else if (it.type === "drone") drawDrone(it);
      else drawPower(it);
    }

    // particles
    for (const p of s.parts) { g.globalAlpha = Math.min(1, p.life * 2.5); g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size); }
    g.globalAlpha = 1;

    // Nova (+ coffee afterimages, shield bubble, hit blink)
    const ducking = input.duck && s.onGround;
    const pose = !s.onGround ? { mode: "jump", mouth: s.vy < 0, tail: 1 } : ducking || s.squash > 0 ? { mode: "crouch", legs: s.legs, tail: 0.5 } : { mode: "run", legs: Math.floor(s.legs * 8) / 8, tail: Math.round(Math.sin(s.t * 20)) , mouth: mode === "play" && s.coffee > 0 };
    if (s.coffee > 0) for (let i = 1; i <= 3; i++) { g.globalAlpha = 0.18 / i; drawPup(g, pose, NX - i * 7, GY + s.y, 1); }
    g.globalAlpha = s.invuln > 0 && s.coffee <= 0 && Math.floor(s.t * 16) % 2 ? 0.3 : 1;
    drawPup(g, pose, NX + 2, GY + Math.round(s.y), 1);
    g.globalAlpha = 1;
    if (s.shield) {
      g.strokeStyle = "rgba(159,211,255,0.85)";
      g.beginPath(); g.arc(NX + 2, GY + s.y - 13, 17 + Math.sin(s.t * 8), 0, Math.PI * 2); g.stroke();
    }
    if (s.magnet > 0) {
      g.strokeStyle = "rgba(255,178,36,0.35)";
      g.beginPath(); g.arc(NX + 2, GY + s.y - 13, 24 + (s.t * 40) % 20, 0, Math.PI * 2); g.stroke();
    }

    // popups (score text)
    g.font = "bold 8px monospace";
    g.textAlign = "center";
    for (const p of s.pops) {
      g.globalAlpha = Math.min(1, p.life * 2);
      g.fillStyle = "#000";
      g.fillText(p.text, Math.round(p.x) + 1, Math.round(p.y) + 1);
      g.fillStyle = p.c;
      g.fillText(p.text, Math.round(p.x), Math.round(p.y));
    }
    g.globalAlpha = 1;

    if (s.flash > 0) { g.fillStyle = `rgba(232,105,122,${s.flash * 2})`; g.fillRect(0, 0, W, H); }

    // scale up to the visible canvas
    const cw = canvas.width, ch = canvas.height;
    view.imageSmoothingEnabled = false;
    const k = Math.min(cw / W, ch / H);
    const dw = W * k, dh = H * k;
    // on tall screens, extend the sky above and the ground below the game picture
    const top = (ch - dh) / 2;
    view.fillStyle = mix(pal.skyTop, pal.skyTopNight, night);
    view.fillRect(0, 0, cw, top + 2);
    view.fillStyle = pal.ground;
    view.fillRect(0, top + dh - 2, cw, ch);
    const sx = s.shake > 0 ? (Math.random() - 0.5) * 6 * k : 0;
    const sy = s.shake > 0 ? (Math.random() - 0.5) * 6 * k : 0;
    view.drawImage(off, (cw - dw) / 2 + sx, (ch - dh) / 2 + sy, dw, dh);
  }

  function drawOrb(it) {
    const x = Math.round(it.x), y = Math.round(it.y);
    g.fillStyle = "rgba(255,178,36,0.25)"; g.fillRect(x - 2, y - 2, 13, 13);
    g.fillStyle = pal.outline; g.fillRect(x + 1, y, 7, 9); g.fillRect(x, y + 1, 9, 7);
    g.fillStyle = "#ffb224"; g.fillRect(x + 2, y + 1, 5, 7); g.fillRect(x + 1, y + 2, 7, 5);
    g.fillStyle = "#fff1c9"; g.fillRect(x + 2, y + 2, 2, 2);
    // first two letters of the skill, so you can see what you're grabbing
    g.font = "bold 6px monospace"; g.textAlign = "center";
    g.fillStyle = pal.text; g.globalAlpha = 0.75;
    g.fillText(it.label.slice(0, 2), x + 4.5, y - 2);
    g.globalAlpha = 1;
  }
  function drawBug(it) {
    const x = Math.round(it.x), y = Math.round(it.y);
    const step = Math.floor(it.ph) % 2;
    g.fillStyle = pal.outline;
    for (let i = 0; i < 3; i++) g.fillRect(x + 2 + i * 4, y + 7 + ((i + step) % 2), 1, 2); // legs
    g.fillRect(x + 1, y + 1, 12, 7);
    g.fillStyle = "#7a3b8f"; g.fillRect(x + 2, y + 2, 10, 5);         // shell
    g.fillStyle = "#a45ab8"; g.fillRect(x + 3, y + 2, 4, 2);
    g.fillStyle = pal.outline; g.fillRect(x + 7, y + 2, 1, 5);        // shell split
    g.fillStyle = "#3a1d44"; g.fillRect(x - 1, y + 3, 3, 4);         // head
    g.fillStyle = "#e8697a"; g.fillRect(x - 1, y + 4, 1, 1);         // angry eye
    g.fillStyle = pal.outline; g.fillRect(x - 2, y + 1, 1, 2); g.fillRect(x - 3, y, 1, 1); // antenna
  }
  function drawDrone(it) {
    const x = Math.round(it.x), y = Math.round(it.y);
    const spin = Math.floor(it.ph) % 2;
    g.fillStyle = pal.outline;
    g.fillRect(x, y - 2, spin ? 8 : 6, 1); g.fillRect(x + 10, y - 2, spin ? 6 : 8, 1); // rotors
    g.fillRect(x + 3, y - 1, 1, 2); g.fillRect(x + 14, y - 1, 1, 2);
    g.fillRect(x + 1, y + 1, 16, 8);
    g.fillStyle = "#c7ced9"; g.fillRect(x + 2, y + 2, 14, 6);
    g.fillStyle = "#e8697a"; g.fillRect(x + 3, y + 3, 12, 4);
    g.font = "bold 6px monospace"; g.textAlign = "center";
    g.fillStyle = "#fff"; g.fillText("404", x + 9, y + 7);
  }
  function drawPower(it) {
    const x = Math.round(it.x), y = Math.round(it.y + Math.sin(it.bob) * 2);
    g.fillStyle = "rgba(159,211,255,0.3)"; g.fillRect(x - 2, y - 2, 16, 16);
    g.fillStyle = pal.outline; g.fillRect(x, y, 12, 12);
    g.fillStyle = "#eef1f5"; g.fillRect(x + 1, y + 1, 10, 10);
    if (it.kind === "coffee") {
      g.fillStyle = "#7a4a2a"; g.fillRect(x + 3, y + 4, 5, 5); g.fillRect(x + 8, y + 5, 2, 2);
      g.fillStyle = "#b07a44"; g.fillRect(x + 3, y + 4, 5, 1);
      g.fillStyle = "#9aa3b1"; g.fillRect(x + 4, y + 2, 1, 1); g.fillRect(x + 6, y + 1, 1, 2);
    } else if (it.kind === "shield") {
      g.fillStyle = "#3b82c4"; g.fillRect(x + 3, y + 2, 6, 6); g.fillRect(x + 4, y + 8, 4, 1); g.fillRect(x + 5, y + 9, 2, 1);
      g.fillStyle = "#fff"; g.fillRect(x + 5, y + 4, 2, 2);
    } else {
      g.fillStyle = "#e8697a"; g.fillRect(x + 3, y + 3, 2, 6); g.fillRect(x + 7, y + 3, 2, 6); g.fillRect(x + 3, y + 7, 6, 2);
      g.fillStyle = "#c7ced9"; g.fillRect(x + 3, y + 2, 2, 1); g.fillRect(x + 7, y + 2, 2, 1);
    }
  }

  function drawSkyline(layer, offset, baseY, color, windowColor) {
    const span = layer.width;
    const o = offset % span;
    for (const b of layer.blocks) {
      for (const rep of [0, span]) {
        const x = Math.round(b.x - o + rep);
        if (x > W || x + b.w < 0) continue;
        g.fillStyle = color;
        if (b.charminar) { drawCharminar(x, baseY, color); continue; }
        g.fillRect(x, baseY - b.h, b.w, b.h);
        if (b.antenna) g.fillRect(x + Math.floor(b.w / 2), baseY - b.h - 5, 1, 5);
        if (windowColor) {
          g.fillStyle = windowColor;
          for (let wy = baseY - b.h + 4; wy < baseY - 4; wy += 6)
            for (let wx = x + 2; wx < x + b.w - 2; wx += 4)
              if (((wx - x) * 13 + wy * 7 + b.seed) % 5 === 0) g.fillRect(wx, wy, 2, 2);
        }
      }
    }
  }
  // a little original silhouette nod to Hyderabad: four minarets around an arch
  function drawCharminar(x, baseY, color) {
    g.fillStyle = color;
    g.fillRect(x + 4, baseY - 26, 30, 26);
    for (const mx of [x, x + 34]) { g.fillRect(mx, baseY - 44, 4, 44); g.fillRect(mx - 1, baseY - 46, 6, 3); g.fillRect(mx + 1, baseY - 49, 2, 3); }
    g.fillStyle = pal.skyBottom;
    g.fillRect(x + 14, baseY - 18, 10, 18);
    g.fillRect(x + 15, baseY - 20, 8, 2);
  }

  // ── loop + controls ───────────────────────────────────────────────────────
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (mode === "play" || mode === "demo") update(dt);
    draw();
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    if (s) draw();
  }

  function togglePause(force) {
    if (mode !== "play" && mode !== "paused") return;
    const next = typeof force === "boolean" ? force : mode === "play";
    mode = next ? "paused" : "play";
    input.jumpHeld = input.duck = false;
    last = performance.now();
    onPause?.(next);
  }

  const onVisibility = () => { if (document.hidden && mode === "play") togglePause(true); };
  const onTheme = () => { pal = palette(); };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("themechange", onTheme);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  reset();
  resize();
  // development only: lets automated tests peek at the game state (stripped from the production build)
  if (import.meta.env.DEV) window.__novaRun = { get s() { return s; }, input };
  last = performance.now();
  raf = requestAnimationFrame(frame);

  return {
    start() { reset(); lastHud = ""; mode = "play"; input.jumpHeld = input.duck = input.jumpPressed = false; onBanner?.(`Level 1 · ${LEVELS[0].name}`); emitHud(); },
    togglePause,
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("themechange", onTheme);
    },
  };
}

// ── helpers ─────────────────────────────────────────────────────────────────
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function makeSkyline(count, maxH, avgW, withLandmark) {
  const blocks = [];
  let x = 0;
  for (let i = 0; i < count; i++) {
    if (withLandmark && i === Math.floor(count / 2)) { blocks.push({ x, w: 38, h: 49, charminar: true }); x += 46; continue; }
    const w = Math.round(avgW * (0.6 + Math.random() * 0.8));
    blocks.push({ x, w, h: Math.round(maxH * (0.35 + Math.random() * 0.65)), antenna: Math.random() < 0.25, seed: Math.floor(Math.random() * 97) });
    x += w + Math.round(Math.random() * 6);
  }
  return { blocks, width: Math.max(x, W + 40) };
}

function palette() {
  const dark = document.documentElement.dataset.theme !== "light";
  return dark
    ? { skyTop: "#0c1222", skyTopNight: "#05070d", skyBottom: "#2a2340", skyBottomNight: "#121a2e", stars: 0.5, orb: "#f3ead2", far: "#161d2e", near: "#1f2738", window: "#ffb224", ground: "#10131a", groundLine: "#343c48", dust: "#5b6472", accent: "#ffb224", text: "#eef1f5", outline: "#1a120b" }
    : { skyTop: "#f7c58a", skyTopNight: "#c9739a", skyBottom: "#fbe8cc", skyBottomNight: "#f2b99a", stars: 0, orb: "#fff6e0", far: "#e2b98f", near: "#c9946a", window: "#fff1c9", ground: "#e8e0cf", groundLine: "#b9ab92", dust: "#b9ab92", accent: "#c97a00", text: "#2a1d10", outline: "#1a120b" };
}

function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}
