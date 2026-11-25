// ─────────────────────────────────────────────────────────────────────────────
//  Skill Catcher game engine: plain JavaScript + <canvas>, no React inside.
//  React (SkillCatcher.jsx) creates it, starts it, and listens to callbacks.
//
//  How a frame works (60 times a second):
//    1. move the catcher toward the keys / pointer
//    2. maybe spawn a new falling item
//    3. move every item down; check if the catcher touched it
//    4. draw everything
// ─────────────────────────────────────────────────────────────────────────────

export function createGame(canvas, { skills, duration = 30, onTick, onCatch, onEnd }) {
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1;
  let raf = 0, last = 0, running = false, paused = false;
  let timeLeft = duration, spawnTimer = 0, score = 0;
  let items = [], popups = [], caught = [];
  const keys = { left: false, right: false };
  const player = { x: 0, w: 96, h: 14, speed: 620, target: null };
  let colors = readColors();

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    const v = (n) => cs.getPropertyValue(n).trim();
    return { bg: v("--panel"), grid: v("--line"), text: v("--text"), muted: v("--muted"), accent: v("--accent"), fill: v("--accent-fill"), ink: v("--accent-ink"), panel2: v("--panel-2") };
  }

  // Match the canvas pixels to its on-screen size (sharp on retina screens).
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    player.w = Math.max(72, Math.min(120, w * 0.16));
    if (!player.x) player.x = w / 2;
    player.x = clamp(player.x, player.w / 2, w - player.w / 2);
    draw();
  }

  function spawn() {
    const bug = Math.random() < 0.16;
    const label = bug ? "bug" : skills[Math.floor(Math.random() * skills.length)];
    ctx.font = "600 13px 'JetBrains Mono Variable', monospace";
    const iw = ctx.measureText(label).width + 22;
    const speedScale = h / 520;
    const progress = 1 - timeLeft / duration; // things speed up as time runs out
    items.push({
      label, bug,
      w: iw, h: 26,
      x: 8 + Math.random() * (w - iw - 16),
      y: -30,
      vy: (110 + Math.random() * 90 + progress * 120) * speedScale,
      wobble: Math.random() * Math.PI * 2,
    });
  }

  function update(dt) {
    timeLeft = Math.max(0, timeLeft - dt);

    // 1. catcher movement: keyboard wins, otherwise glide toward the pointer
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dir) { player.x += dir * player.speed * dt; player.target = null; }
    else if (player.target != null) player.x += (player.target - player.x) * Math.min(1, dt * 14);
    player.x = clamp(player.x, player.w / 2, w - player.w / 2);

    // 2. spawning gets faster over the round
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawn();
      spawnTimer = 0.75 - (1 - timeLeft / duration) * 0.35;
    }

    // 3. move items + collisions
    const py = h - 34; // top of the catcher
    for (const it of items) {
      it.y += it.vy * dt;
      it.wobble += dt * 3;
      const cx = it.x + it.w / 2;
      const bottom = it.y + it.h;
      if (!it.done && bottom >= py && bottom <= py + 22 && Math.abs(cx - player.x) < player.w / 2 + it.w / 2 - 6) {
        it.done = true;
        if (it.bug) {
          score = Math.max(0, score - 2);
          popups.push({ text: "−2 bug!", x: cx, y: py - 10, life: 1, bad: true });
        } else {
          score += 1;
          caught.push(it.label);
          popups.push({ text: `${it.label} caught!`, x: cx, y: py - 10, life: 1 });
          onCatch?.(it.label);
        }
      }
    }
    items = items.filter((it) => !it.done && it.y < h + 40);
    for (const p of popups) { p.y -= 40 * dt; p.life -= dt * 0.9; }
    popups = popups.filter((p) => p.life > 0);

    onTick?.({ timeLeft, score });
    if (timeLeft <= 0) end();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    // grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke(); }
    ctx.globalAlpha = 1;

    // falling items ("payload capsules")
    ctx.font = "600 13px 'JetBrains Mono Variable', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const it of items) {
      const x = it.x + Math.sin(it.wobble) * 2;
      if (it.bug) {
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = colors.muted;
        ctx.fillStyle = colors.bg;
        roundRect(x, it.y, it.w, it.h, 6); ctx.fill(); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = colors.muted;
        ctx.fillText("✕ bug", x + it.w / 2, it.y + it.h / 2 + 1);
      } else {
        ctx.fillStyle = colors.panel2;
        ctx.strokeStyle = colors.accent;
        roundRect(x, it.y, it.w, it.h, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = colors.text;
        ctx.fillText(it.label, x + it.w / 2, it.y + it.h / 2 + 1);
      }
    }

    // catcher: a tray with amber edge and corner brackets
    const py = h - 34, px = player.x - player.w / 2;
    ctx.fillStyle = colors.fill;
    roundRect(px, py, player.w, player.h, 4); ctx.fill();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - 6, py - 8); ctx.lineTo(px - 6, py + player.h + 4); ctx.lineTo(px + 6, py + player.h + 4);
    ctx.moveTo(px + player.w + 6, py - 8); ctx.lineTo(px + player.w + 6, py + player.h + 4); ctx.lineTo(px + player.w - 6, py + player.h + 4);
    ctx.stroke();
    ctx.lineWidth = 1;

    // popups
    ctx.font = "600 12px 'JetBrains Mono Variable', monospace";
    for (const p of popups) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.bad ? colors.muted : colors.accent;
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  function roundRect(x, y, rw, rh, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, rw, rh, r);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); // clamp so a lag spike can't teleport things
    last = now;
    if (!paused) update(dt);
    draw();
  }

  function end() {
    running = false;
    cancelAnimationFrame(raf);
    draw();
    onEnd?.({ score, caught: [...caught] });
  }

  // ── input ──
  const onKeyDown = (e) => {
    if (!running) return;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { keys.left = true; e.preventDefault(); }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { keys.right = true; e.preventDefault(); }
  };
  const onKeyUp = (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
  };
  const onPointer = (e) => {
    const rect = canvas.getBoundingClientRect();
    player.target = e.clientX - rect.left;
  };
  const onVisibility = () => { paused = document.hidden; last = performance.now(); };
  const onTheme = () => { colors = readColors(); draw(); };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  canvas.addEventListener("pointermove", onPointer);
  canvas.addEventListener("pointerdown", onPointer);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("themechange", onTheme);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  return {
    start() {
      cancelAnimationFrame(raf);
      items = []; popups = []; caught = [];
      score = 0; timeLeft = duration; spawnTimer = 0.2;
      player.x = w / 2; player.target = null;
      running = true; paused = false;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("themechange", onTheme);
    },
  };
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
