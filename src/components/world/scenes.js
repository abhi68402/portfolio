// ─────────────────────────────────────────────────────────────────────────────
//  The seven pixel-art scenes behind the page, one per section ("level").
//  Nova's journey goes up: street → monsoon lane → lab → launch pad → orbit →
//  deep space → Moon base.
//
//  Each painter draws onto a small canvas (about 1/4 of the screen size) that
//  WorldCanvas.jsx scales up without smoothing, so every "pixel" is chunky.
//    paint(g, w, h, t, light, par)
//      g      2D context      w, h   canvas size in game pixels
//      t      time (seconds)  light  true in light mode
//      par    0..1 how far you've scrolled through this section (for parallax)
// ─────────────────────────────────────────────────────────────────────────────

// Deterministic random numbers, so scenery doesn't jump around between frames.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

// Layouts (buildings, stars, trees…) are generated once per canvas size.
const cache = new Map();
function layout(key, w, h, make) {
  const k = `${key}:${w}x${h}`;
  if (!cache.has(k)) cache.set(k, make(w, h));
  return cache.get(k);
}

// ── small drawing helpers ────────────────────────────────────────────────────
function sky(g, w, h, stops) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c));
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}
const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
function disc(g, cx, cy, r, c) {
  g.fillStyle = c;
  for (let y = -r; y <= r; y++) {
    const half = Math.round(Math.sqrt(r * r - y * y));
    g.fillRect(Math.round(cx - half), Math.round(cy + y), half * 2, 1);
  }
}
function makeStars(w, h, n, seed, maxY = 1) {
  const r = rng(seed);
  return Array.from({ length: n }, () => ({ x: Math.floor(r() * w), y: Math.floor(r() * h * maxY), p: r() * 6, big: r() < 0.08 }));
}
function drawStars(g, stars, t, alpha, color = "255,255,255") {
  for (const s of stars) {
    const a = alpha * (0.45 + 0.55 * Math.sin(t * 1.7 + s.p));
    if (a < 0.05) continue;
    g.fillStyle = `rgba(${color},${a})`;
    g.fillRect(s.x, s.y, 1, 1);
    if (s.big && a > 0.5) { g.fillRect(s.x - 1, s.y, 3, 1); g.fillRect(s.x, s.y - 1, 1, 3); }
  }
}
function makeSkyline(w, seed, minH, maxH, avgW, landmarkAt) {
  const r = rng(seed);
  const blocks = [];
  let x = -4;
  while (x < w + 10) {
    if (landmarkAt != null && x > w * landmarkAt && !blocks.some((b) => b.landmark)) { blocks.push({ x, w: 30, landmark: true }); x += 34; continue; }
    const bw = Math.round(avgW * (0.6 + r() * 0.9));
    blocks.push({ x, w: bw, h: Math.round(minH + r() * (maxH - minH)), antenna: r() < 0.2, seed: Math.floor(r() * 999) });
    x += bw + Math.floor(r() * 3);
  }
  return blocks;
}
function drawSkyline(g, blocks, baseY, color, windows, t = 0) {
  for (const b of blocks) {
    if (b.landmark) { drawCharminar(g, b.x, baseY, color); continue; }
    R(g, b.x, baseY - b.h, b.w, b.h, color);
    if (b.antenna) { R(g, b.x + Math.floor(b.w / 2), baseY - b.h - 4, 1, 4, color); }
    if (windows) {
      for (let wy = baseY - b.h + 3; wy < baseY - 2; wy += 4)
        for (let wx = b.x + 2; wx < b.x + b.w - 1; wx += 3) {
          const k = (wx * 7 + wy * 13 + b.seed) % 11;
          if (k < 3) R(g, wx, wy, 1, 2, k === 0 && Math.sin(t * 0.7 + b.seed) > 0.6 ? "rgba(255,255,255,0.9)" : windows);
        }
    }
  }
}
// a small original silhouette nod to Hyderabad: four minarets around a central arch
function drawCharminar(g, x, baseY, color) {
  R(g, x + 3, baseY - 20, 24, 20, color);
  for (const mx of [x, x + 26]) { R(g, mx, baseY - 34, 4, 34, color); R(g, mx - 1, baseY - 36, 6, 2, color); R(g, mx + 1, baseY - 39, 2, 3, color); }
  R(g, x + 12, baseY - 26, 6, 6, color);
}
function cloud(g, x, y, s, c) {
  R(g, x, y + 2 * s, 14 * s, 3 * s, c);
  R(g, x + 3 * s, y, 6 * s, 3 * s, c);
  R(g, x + 7 * s, y + s, 5 * s, 2 * s, c);
}

// ── 01 · Street level: dawn over the city ────────────────────────────────────
function street(g, w, h, t, light, par) {
  sky(g, w, h, light ? ["#ffb38a", "#ffd6a0", "#fff0cf"] : ["#1b1640", "#55305f", "#c7655c"]);
  const L = layout("street", w, h, () => ({
    far: makeSkyline(w, 7, h * 0.18, h * 0.36, 14, 0.58),
    near: makeSkyline(w, 19, h * 0.1, h * 0.26, 18),
    stars: makeStars(w, h, 40, 3, 0.5),
  }));
  if (!light) drawStars(g, L.stars, t, 0.6);
  // rising sun
  disc(g, w * 0.78, h * 0.62 - par * 10, Math.max(10, w * 0.07), light ? "#fff3c4" : "#ffb35c");
  // clouds drifting
  const cc = light ? "rgba(255,255,255,0.85)" : "rgba(255,190,170,0.35)";
  for (let i = 0; i < 4; i++) cloud(g, ((i * w * 0.31 + t * (3 + i)) % (w + 60)) - 50, h * (0.12 + i * 0.07), 1 + (i % 2), cc);
  // birds
  g.fillStyle = light ? "#5a3a2a" : "#1a1020";
  for (let i = 0; i < 3; i++) {
    const bx = (t * 14 + i * 22) % (w + 40) - 20, by = h * 0.3 + i * 5 + Math.sin(t * 2 + i) * 2;
    const flap = Math.floor(t * 6 + i) % 2;
    g.fillRect(bx, by, 1, 1); g.fillRect(bx - 1, by - flap, 1, 1); g.fillRect(bx + 1, by - flap, 1, 1);
  }
  const base = h + par * 8;
  drawSkyline(g, L.far, base - h * 0.12, light ? "#e59a7a" : "#3a2448");
  drawSkyline(g, L.near, base, light ? "#b9684f" : "#1a1228", light ? "#ffe3a1" : "#ffb224", t);
}

// ── 02 · Monsoon lane: rain, trees, puddles, a red umbrella ──────────────────
function monsoon(g, w, h, t, light, par) {
  sky(g, w, h, light ? ["#8fa3b8", "#b9c6d1", "#d5dde2"] : ["#0d121b", "#1b2431", "#2a3644"]);
  const L = layout("monsoon", w, h, () => {
    const r = rng(11);
    return {
      trees: Array.from({ length: Math.ceil(w / 26) + 1 }, (_, i) => ({ x: i * 26 + r() * 8 - 4, r: 9 + r() * 7, h: 18 + r() * 14 })),
      drops: Array.from({ length: Math.round(w * h / 90) }, () => ({ x: r() * w, y: r() * h, s: 0.7 + r() * 0.6 })),
    };
  });
  // lightning flash (night only)
  if (!light && Math.sin(t * 0.9) > 0.995) { g.fillStyle = "rgba(220,230,255,0.25)"; g.fillRect(0, 0, w, h); }
  const ground = h * 0.8 + par * 6;
  // wall with faded posters
  R(g, 0, ground - h * 0.16, w, h * 0.16, light ? "#a49b8d" : "#232a33");
  for (let x = 6; x < w; x += 34) R(g, x, ground - h * 0.12, 12, 8, light ? "#d6c7a8" : "#2f3742");
  // trees
  for (const tr of L.trees) {
    R(g, tr.x - 1, ground - tr.h, 3, tr.h, light ? "#5b4636" : "#1d1712");
    disc(g, tr.x, ground - tr.h - tr.r * 0.4, tr.r, light ? "#4d7c50" : "#16301f");
    disc(g, tr.x + 4, ground - tr.h - tr.r * 0.7, tr.r * 0.6, light ? "#6b9b62" : "#1f4029");
  }
  // wet road + puddle reflections
  R(g, 0, ground, w, h - ground, light ? "#5f6670" : "#151a21");
  for (let x = 0; x < w; x += 20) R(g, (x + t * 2) % w, ground + 6, 8, 1, light ? "#8b939c" : "#2a333e");
  R(g, w * 0.55, ground + 4, 26, 2, light ? "#9fb2c4" : "#2b3a4c");
  // red umbrella on the left (a nod to the monsoon patrol photo)
  const ux = w * 0.2, uy = ground - 14;
  for (let i = 0; i < 6; i++) R(g, ux - 6 + i, uy - i * 0.6, 12 - i * 2 + i, 1, i % 2 ? "#ffffff" : "#d63a3a");
  R(g, ux - 7, uy, 15, 2, "#d63a3a");
  R(g, ux, uy, 1, 10, "#2a2a2a");
  // rain
  g.fillStyle = light ? "rgba(70,90,120,0.55)" : "rgba(170,190,220,0.45)";
  for (const d of L.drops) {
    const y = (d.y + t * 120 * d.s) % h, x = (d.x - t * 30 * d.s + w * 10) % w;
    g.fillRect(x, y, 1, 3);
  }
}

// ── 03 · The lab: server racks and circuits blinking at dusk ─────────────────
function lab(g, w, h, t, light, par) {
  sky(g, w, h, light ? ["#c99bd6", "#efc0b6", "#ffe0b4"] : ["#0b0c18", "#1a1430", "#2b1d3e"]);
  const L = layout("lab", w, h, () => {
    const r = rng(23);
    const racks = [];
    for (let x = 4; x < w; x += 22 + Math.floor(r() * 6)) racks.push({ x, h: h * (0.3 + r() * 0.25), seed: Math.floor(r() * 99) });
    const traces = Array.from({ length: 7 }, () => ({ y: Math.floor(h * (0.1 + r() * 0.4)), x0: Math.floor(r() * w * 0.4), len: Math.floor(w * (0.3 + r() * 0.5)), sp: 20 + r() * 40 }));
    return { racks, traces, stars: makeStars(w, h, 30, 9, 0.4) };
  });
  if (!light) drawStars(g, L.stars, t, 0.4);
  // circuit traces in the sky with travelling pulses
  for (const tr of L.traces) {
    R(g, tr.x0, tr.y, tr.len, 1, light ? "rgba(120,70,140,0.35)" : "rgba(255,178,36,0.18)");
    R(g, tr.x0 + tr.len, tr.y, 1, 6, light ? "rgba(120,70,140,0.35)" : "rgba(255,178,36,0.18)");
    const px = tr.x0 + ((t * tr.sp) % tr.len);
    R(g, px, tr.y - 0, 3, 1, "#ffb224");
  }
  const floor = h * 0.9 + par * 6;
  // server racks
  for (const rk of L.racks) {
    const top = floor - rk.h;
    R(g, rk.x, top, 16, rk.h, light ? "#3d3350" : "#151a2a");
    R(g, rk.x + 1, top + 1, 14, rk.h - 2, light ? "#4f4466" : "#1d2438");
    for (let y = top + 3; y < floor - 3; y += 4) {
      R(g, rk.x + 2, y, 12, 2, light ? "#3d3350" : "#121726");
      const on = Math.sin(t * 3 + y * 0.7 + rk.seed) > 0.2;
      R(g, rk.x + 11, y, 1, 1, on ? (y % 3 ? "#ffb224" : "#5fe08a") : "#3a3f55");
    }
  }
  R(g, 0, floor, w, h - floor, light ? "#2f2840" : "#0a0c14");
  for (let x = 0; x < w; x += 6) R(g, x, floor, 3, 1, light ? "#5a4d73" : "#232b44");
}

// ── 04 · Launch pad: night city, searchlights, a rocket ready to go ──────────
function launch(g, w, h, t, light, par) {
  sky(g, w, h, light ? ["#f08a5d", "#f7b47c", "#ffd9a0"] : ["#05070f", "#10162e", "#22284a"]);
  const L = layout("launch", w, h, () => ({
    stars: makeStars(w, h, 70, 41, 0.7),
    city: makeSkyline(w, 77, h * 0.06, h * 0.2, 12),
  }));
  drawStars(g, L.stars, t, light ? 0.15 : 0.8);
  // searchlights
  const base = h + par * 8;
  for (const [x0, ph] of [[w * 0.2, 0], [w * 0.62, 2]]) {
    const ang = -Math.PI / 2 + Math.sin(t * 0.5 + ph) * 0.5;
    g.fillStyle = light ? "rgba(255,255,255,0.18)" : "rgba(255,240,200,0.08)";
    g.beginPath();
    g.moveTo(x0, base - h * 0.12);
    g.lineTo(x0 + Math.cos(ang - 0.08) * h, base - h * 0.12 + Math.sin(ang - 0.08) * h);
    g.lineTo(x0 + Math.cos(ang + 0.08) * h, base - h * 0.12 + Math.sin(ang + 0.08) * h);
    g.fill();
  }
  drawSkyline(g, L.city, base - h * 0.08, light ? "#a5584a" : "#0d1124", light ? "#ffe3a1" : "#ffb224", t);
  // launch gantry + rocket
  const rx = w * 0.8, ground = base - h * 0.08;
  R(g, 0, ground, w, h, light ? "#6a3d33" : "#080a14");
  R(g, rx - 14, ground - 50, 3, 50, light ? "#4a2a24" : "#3a4058");
  for (let y = ground - 48; y < ground; y += 6) R(g, rx - 14, y, 8, 1, light ? "#4a2a24" : "#3a4058");
  R(g, rx - 4, ground - 44, 8, 36, "#eef1f5");
  R(g, rx - 3, ground - 48, 6, 4, "#eef1f5");
  R(g, rx - 2, ground - 51, 4, 3, "#e8697a");
  R(g, rx - 1, ground - 53, 2, 2, "#e8697a");
  R(g, rx - 2, ground - 34, 4, 4, "#9fd3ff");
  R(g, rx - 7, ground - 12, 3, 8, "#ffb224"); R(g, rx + 4, ground - 12, 3, 8, "#ffb224");
  // idle steam at the base
  for (let i = 0; i < 6; i++) {
    const a = (t * 0.8 + i / 6) % 1;
    disc(g, rx - 10 + i * 4 + a * 6, ground - 2 - a * 10, 2 + a * 3, `rgba(230,235,245,${0.35 * (1 - a)})`);
  }
  R(g, rx - 6, ground - 6, 12, 2, light ? "#4a2a24" : "#3a4058");
}

// ── 05 · Orbit: the curve of the Earth, satellites drifting by ───────────────
function orbit(g, w, h, t, light, par) {
  sky(g, w, h, light ? ["#0f1d45", "#203a7a", "#3d63b0"] : ["#02030a", "#060b1d", "#0b1634"]);
  const L = layout("orbit", w, h, () => ({ stars: makeStars(w, h, 110, 55, 0.8) }));
  drawStars(g, L.stars, t, 0.9);
  // Earth's limb
  const r = w * 1.3, cx = w * 0.45, cy = h + r - h * 0.28 + par * 12;
  disc(g, cx, cy, r + 3, light ? "rgba(140,200,255,0.5)" : "rgba(90,160,255,0.35)");
  disc(g, cx, cy, r, light ? "#2f6fc0" : "#1b4f9a");
  // continents (simple blobs riding the surface)
  for (let i = 0; i < 5; i++) {
    const x = ((i * w * 0.4 - t * 2) % (w * 2) + w * 2) % (w * 2) - w * 0.4;
    disc(g, x, cy - r + 8 + (i % 2) * 6, 7 + (i % 3) * 3, light ? "#4f9a5a" : "#2d6e3e");
  }
  // satellites
  for (let i = 0; i < 2; i++) {
    const sx = ((t * (8 + i * 5) + i * w * 0.6) % (w + 40)) - 20, sy = h * (0.25 + i * 0.2);
    R(g, sx - 5, sy, 4, 2, "#5a86c9"); R(g, sx - 1, sy - 1, 3, 4, "#d9dee8"); R(g, sx + 2, sy, 4, 2, "#5a86c9");
    if (Math.floor(t * 2 + i) % 2) R(g, sx, sy - 2, 1, 1, "#ff6b6b");
  }
}

// ── 06 · Deep space: nebula, twinkling stars, a comet ────────────────────────
function deep(g, w, h, t, light, par) {
  sky(g, w, h, light ? ["#1d1442", "#2d1d5c", "#4a2a72"] : ["#04030b", "#0b0718", "#160b26"]);
  const L = layout("deep", w, h, () => {
    const r = rng(91);
    return {
      stars: makeStars(w, h, 160, 92, 1),
      neb: Array.from({ length: 14 }, () => ({ x: r() * w, y: r() * h, r: 6 + r() * 16, c: r() < 0.5 ? "232,105,180" : r() < 0.5 ? "120,140,255" : "255,178,36" })),
    };
  });
  for (const n of L.neb) disc(g, n.x, n.y - par * 10, n.r, `rgba(${n.c},${light ? 0.14 : 0.1})`);
  drawStars(g, L.stars, t, 1);
  // comet every few seconds
  const ct = (t % 9) / 9;
  if (ct < 0.4) {
    const k = ct / 0.4, x = w * (1.1 - k * 1.3), y = h * (0.1 + k * 0.4);
    for (let i = 0; i < 14; i++) R(g, x + i * 2, y - i * 0.7, 2, 1, `rgba(255,240,210,${0.9 - i / 15})`);
    R(g, x - 1, y - 1, 3, 3, "#ffffff");
  }
}

// ── 07 · Moon base: Nova's dog house, a radio dish beaming home ──────────────
function moon(g, w, h, t, light, par) {
  sky(g, w, h, light ? ["#120d2e", "#1d1846", "#2a2458"] : ["#020309", "#05070f", "#0a0d1a"]);
  const L = layout("moon", w, h, () => {
    const r = rng(101);
    return {
      stars: makeStars(w, h, 130, 102, 0.75),
      craters: Array.from({ length: Math.ceil(w / 30) }, () => ({ x: r() * w, y: r() * 0.8, r: 2 + r() * 5 })),
    };
  });
  drawStars(g, L.stars, t, 1);
  // Earth hanging in the sky
  disc(g, w * 0.2, h * 0.25, Math.max(7, w * 0.04), "#2f6fc0");
  disc(g, w * 0.2 - 2, h * 0.25 - 2, Math.max(3, w * 0.018), "#4f9a5a");
  const ground = h * 0.78 + par * 8;
  // lunar surface
  R(g, 0, ground, w, h - ground, light ? "#a9a6b8" : "#8a8798");
  R(g, 0, ground, w, 2, light ? "#cfcde0" : "#b3b0c3");
  for (const c of L.craters) disc(g, c.x, ground + 4 + c.y * (h - ground - 8), c.r, light ? "#8d8aa0" : "#6d6a7e");
  // Nova's dog house with a name sign
  const hx = w * 0.6;
  R(g, hx, ground - 14, 20, 14, "#b0503b");
  for (let i = 0; i < 6; i++) R(g, hx - 2 + i, ground - 15 - i, 24 - i * 2, 1, "#7a2e22");
  R(g, hx + 7, ground - 9, 7, 9, "#1b0f0c");
  R(g, hx + 4, ground - 21, 12, 4, "#ffb224");
  // radio dish beaming a signal
  const dx = w * 0.82;
  R(g, dx, ground - 10, 2, 10, "#c7ced9");
  for (let i = 0; i < 5; i++) R(g, dx - 6 + i, ground - 16 + i, 14 - i * 2, 1, "#e6e9f0");
  for (let i = 0; i < 3; i++) {
    const a = (t * 0.6 + i / 3) % 1;
    g.strokeStyle = `rgba(255,178,36,${1 - a})`;
    g.beginPath(); g.arc(dx + 1, ground - 17, 3 + a * 16, -Math.PI * 0.85, -Math.PI * 0.55); g.stroke();
  }
  // flag
  R(g, w * 0.4, ground - 16, 1, 16, "#d9dee8");
  R(g, w * 0.4 + 1, ground - 16, 8, 5, "#ffb224");
}

export const scenes = [street, monsoon, lab, launch, orbit, deep, moon];
