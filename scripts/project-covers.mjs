// Generated illustrative covers for the projects that have no real screenshot.
// Imported by optimize-images.mjs. Everything here is drawn, not captured: the terminal
// is a mock-up of Sigrun's documented behaviour, the chart uses synthetic data, and the
// city is a pixel-art vignette. Each carries a small "illustration" tag.
import sharp from "sharp";

const ink = "#1B2232", blue = "#2448B8", paper = "#F8F5EE", line = "#CFC3AA", hl = "#FFE066", red = "#B8322B", mute = "#586174";
const MONO = "Menlo, Monaco, 'Courier New', monospace";
const SERIF = "Georgia, 'Times New Roman', serif";

const dotted = `<defs><pattern id="d" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="${blue}" fill-opacity="0.16"/></pattern></defs>
  <rect width="1200" height="900" fill="${paper}"/><rect width="1200" height="900" fill="url(#d)"/>`;
const tag = (text, x = 72, y = 866, fill = mute) =>
  `<text x="${x}" y="${y}" font-family="${MONO}" font-size="21" letter-spacing="3" fill="${fill}">${text}</text>`;

// ---------- sigrun: QEMU window, OpenSBI boot, then a consent fault ----------
const sigrun = (() => {
  const dim = "#7d8aa6", fg = "#dfe6f5", amber = "#ffc15e", green = "#7fd99b";
  const boot = [
    [dim, "OpenSBI  ·  RISC-V firmware"],
    [dim, "Platform Name      : riscv-virtio,qemu"],
    [green, "sigrun: UART up · traps armed · timer 100 Hz"],
    [fg, "sigrun: agent \"organizer\" started"],
  ];
  const bootSvg = boot.map(([c, t], i) => `<text x="132" y="${176 + i * 40}" font-size="25" fill="${c}">${t}</text>`).join("");
  const pill = (x, y, w, label, strong, stroke) =>
    `<rect x="${x}" y="${y}" width="${w}" height="56" rx="10" fill="${strong ? stroke : "none"}" fill-opacity="${strong ? 0.18 : 0}" stroke="${stroke}" stroke-width="2.5"/>
     <text x="${x + w / 2}" y="${y + 37}" font-size="26" text-anchor="middle" fill="${strong ? "#fff" : fg}">${label}</text>`;
  return `
<svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
  ${dotted}
  <rect x="96" y="104" width="1040" height="756" rx="22" fill="${ink}" fill-opacity="0.16"/>
  <rect x="80" y="76" width="1040" height="756" rx="20" fill="#121826"/>
  <path d="M80 96a20 20 0 0 1 20-20h1000a20 20 0 0 1 20 20v44H80z" fill="#262f44"/>
  <path d="M80 140h1040" stroke="#0b0f19" stroke-width="2"/>
  <circle cx="122" cy="108" r="10" fill="#ff5f57"/><circle cx="154" cy="108" r="10" fill="#febc2e"/><circle cx="186" cy="108" r="10" fill="#28c840"/>
  <text x="600" y="116" font-family="${MONO}" font-size="22" text-anchor="middle" fill="#a9b4cc">qemu-system-riscv64 — sigrun</text>
  <g font-family="${MONO}">
    ${bootSvg}
    <text x="132" y="352" font-size="25" fill="${dim}">&gt; agent.run organizer</text>
    <rect x="124" y="392" width="952" height="392" rx="16" fill="#1d1a14"/>
    <rect x="124" y="392" width="952" height="392" rx="16" fill="none" stroke="${amber}" stroke-width="3"/>
    <rect x="124" y="392" width="12" height="392" fill="${amber}"/>
    <rect x="168" y="430" width="11" height="34" rx="2" fill="${amber}"/><rect x="190" y="430" width="11" height="34" rx="2" fill="${amber}"/>
    <text x="226" y="459" font-size="32" font-weight="700" fill="${amber}">agent "organizer" was frozen</text>
    <text x="168" y="512" font-size="28" fill="${fg}">while trying to:</text>
    <rect x="164" y="540" width="560" height="56" rx="8" fill="#2b2518"/>
    <text x="184" y="578" font-size="30" fill="${fg}"><tspan fill="${red === "" ? "" : "#ff7a70"}" font-weight="700">DELETE</tspan>  downloads/old.zip</text>
    ${pill(168, 640, 224, "[allow once]", false, "#6f7d99")}
    ${pill(408, 640, 340, "[allow for this task]", false, "#6f7d99")}
    ${pill(168, 712, 150, "[deny]", true, "#ff7a70")}
    ${pill(334, 712, 330, "[deny + stop agent]", false, "#6f7d99")}
    <rect x="924" y="716" width="14" height="30" fill="${green}"/>
  </g>
  ${tag("ILLUSTRATION · CONSENT FAULT")}
</svg>`;
})();

// ---------- nasa-rul: sensor drift subplots + RUL true vs predicted ----------
const nasaRul = (() => {
  // deterministic noise
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) * 1.7;

  const plot = (x0, y0, w, h, { xt = [], yt = [], xl, yl, title }) => {
    let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#fffdf8" stroke="${ink}" stroke-width="2"/>`;
    xt.forEach((t) => { const x = x0 + t * w; s += `<path d="M${x} ${y0}V${y0 + h}" stroke="#e6dfcf" stroke-width="1.5"/><path d="M${x} ${y0 + h}v8" stroke="${ink}" stroke-width="2"/>`; });
    yt.forEach((t) => { const y = y0 + h - t * h; s += `<path d="M${x0} ${y}H${x0 + w}" stroke="#e6dfcf" stroke-width="1.5"/><path d="M${x0 - 8} ${y}h8" stroke="${ink}" stroke-width="2"/>`; });
    if (title) s += `<text x="${x0 + 12}" y="${y0 + 26}" font-family="${MONO}" font-size="20" fill="${mute}">${title}</text>`;
    return s;
  };
  const poly = (pts, color, sw = 3, op = 1) =>
    `<polyline points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" stroke-opacity="${op}"/>`;

  // left: three sensors, each with three engines drifting upward toward failure
  const sensors = [
    ["sensor_2 · T24", 0.5], ["sensor_7 · P30", -0.4], ["sensor_11 · Ps30", 0.8],
  ];
  const cols = [blue, red, ink];
  let left = "";
  const lx = 112, lw = 420, lh = 160, gap = 38, ly0 = 168;
  sensors.forEach(([name, dir], k) => {
    const y0 = ly0 + k * (lh + gap);
    left += plot(lx, y0, lw, lh, { xt: [0, 1 / 3, 2 / 3, 1], yt: [0.25, 0.5, 0.75], title: name });
    cols.forEach((c, e) => {
      const life = 0.78 + e * 0.11, pts = [];
      for (let n = 0; n <= 90; n++) {
        const t = n / 90, wear = Math.pow(t / life, 3.2);
        const v = 0.5 + dir * 0.46 * Math.min(wear, 1.1) + gauss() * 0.032 + (e - 1) * 0.05;
        pts.push([lx + t * life * lw, y0 + lh - Math.max(0.04, Math.min(0.96, v)) * lh]);
      }
      left += poly(pts, c, 2.4, 0.9);
    });
    if (k === 2) left += [0, 100, 200, 300].map((t, i) => `<text x="${lx + (i / 3) * lw}" y="${y0 + lh + 30}" font-family="${MONO}" font-size="19" fill="${mute}" text-anchor="middle">${t}</text>`).join("");
  });
  left += `<text x="${lx + lw / 2}" y="${ly0 + 3 * lh + 2 * gap + 60}" font-family="${MONO}" font-size="20" fill="${ink}" text-anchor="middle">cycle</text>`;

  // right: RUL true vs predicted for one engine
  const rx = 668, ry = 168, rw = 440, rh = 3 * lh + 2 * gap - 0;
  let right = plot(rx, ry, rw, rh, { xt: [0, 1 / 3, 2 / 3, 1], yt: [0.25, 0.5, 0.75], title: "RUL · one test engine" });
  const T = 130, tru = [], pre = [], band = [];
  for (let n = 0; n <= T; n++) {
    const t = n / T, trueV = Math.min(1, (T - n) / 110);
    const err = gauss() * 0.035 + 0.045 * Math.sin(n / 11) * (1 - t * 0.6);
    const p = Math.max(0.01, Math.min(1, trueV + err));
    tru.push([rx + t * rw, ry + rh - trueV * rh * 0.92 - 6]);
    pre.push([rx + t * rw, ry + rh - p * rh * 0.92 - 6]);
  }
  right += `<polygon points="${[...tru.map((p) => `${p[0]},${p[1] - 18}`), ...tru.slice().reverse().map((p) => `${p[0]},${p[1] + 18}`)].join(" ")}" fill="${hl}" fill-opacity="0.45"/>`;
  right += poly(tru, ink, 3.4) + poly(pre, red, 3);
  right += [0, 43, 87, 130].map((t, i) => `<text x="${rx + (t / T) * rw}" y="${ry + rh + 32}" font-family="${MONO}" font-size="19" fill="${mute}" text-anchor="middle">${t}</text>`).join("");
  right += `<text x="${rx + rw / 2}" y="${ry + rh + 62}" font-family="${MONO}" font-size="20" fill="${ink}" text-anchor="middle">cycle</text>`;
  right += [0, 50, 100].map((v) => `<text x="${rx - 14}" y="${ry + rh - (v / 110) * rh * 0.92 - 6 + 6}" font-family="${MONO}" font-size="19" fill="${mute}" text-anchor="end">${v}</text>`).join("");
  // legend
  const gx = rx + 150, gy = ry + 56;
  right += `<rect x="${gx - 14}" y="${gy - 24}" width="276" height="92" rx="6" fill="#fffdf8" stroke="${line}" stroke-width="2"/>
    <path d="M${gx} ${gy}h44" stroke="${ink}" stroke-width="3.4"/><text x="${gx + 58}" y="${gy + 7}" font-family="${MONO}" font-size="20" fill="${ink}">true RUL</text>
    <path d="M${gx} ${gy + 40}h44" stroke="${red}" stroke-width="3"/><text x="${gx + 58}" y="${gy + 47}" font-family="${MONO}" font-size="20" fill="${ink}">BiLSTM pred.</text>`;

  return `
<svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
  ${dotted}
  <rect x="40" y="40" width="1120" height="820" rx="10" fill="#fffdf8" stroke="${ink}" stroke-width="2.5"/>
  <text x="112" y="104" font-family="${SERIF}" font-size="40" font-weight="700" fill="${ink}">Sensor drift  →  remaining useful life</text>
  <text x="112" y="140" font-family="${MONO}" font-size="20" fill="${mute}">C-MAPSS FD001 · sliding windows → BiLSTM</text>
  <g transform="rotate(-90 70 ${ly0 + 270})"><text x="70" y="${ly0 + 270}" font-family="${MONO}" font-size="19" fill="${mute}" text-anchor="middle">normalised reading</text></g>
  <g transform="rotate(-90 590 ${ry + rh / 2})"><text x="590" y="${ry + rh / 2}" font-family="${MONO}" font-size="19" fill="${mute}" text-anchor="middle">remaining life (cycles)</text></g>
  ${left}${right}
  ${tag("ILLUSTRATION · SYNTHETIC TRACES", 112, 838)}
</svg>`;
})();

// ---------- hyd-days: 2:1 dimetric pixel-art city ----------
const hydDays = await (async () => {
  const W = 300, H = 225;
  const buf = Buffer.alloc(W * H * 4);
  const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const put = (x, y, c) => {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const [r, g, b] = typeof c === "string" ? hex(c) : c;
    const o = (y * W + x) * 4; buf[o] = r; buf[o + 1] = g; buf[o + 2] = b; buf[o + 3] = 255;
  };
  let seed = 11;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const hash = (a, b, c = 0) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) >>> 0; h = ((h ^ (h >> 13)) * 1274126177) >>> 0; return ((h ^ (h >> 16)) >>> 0) / 4294967296; };

  // sky: banded gradient with 2x2 ordered dither between bands
  const sky = ["#232a63", "#2f3478", "#443a86", "#6a3f8c", "#94467f", "#bd4f78", "#df6a6c", "#f08b64", "#f9ad6a", "#fcc77a"];
  const bayer = [[0, 2], [3, 1]];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const f = Math.min(sky.length - 1.001, (y / 168) * (sky.length - 1));
    const i = Math.floor(f), fr = f - i, th = (bayer[y & 1][x & 1] + 0.5) / 4;
    put(x, y, sky[fr > th ? i + 1 : i]);
  }
  for (let n = 0; n < 70; n++) { const x = rnd() * W, y = rnd() * 58; put(x, y, rnd() > 0.5 ? "#e9e6ff" : "#a9a6d8"); }
  // sun
  const sx = 232, sy = 70;
  for (let y = -16; y <= 16; y++) for (let x = -16; x <= 16; x++) { const d = x * x + y * y; if (d < 100) put(sx + x, sy + y, "#fff1b0"); else if (d < 150) put(sx + x, sy + y, "#fdd98a"); }
  // clouds
  const cloud = (cx, cy, c) => { [[-9, 0, 18], [-5, -2, 12], [-12, 1, 24]].forEach(([dx, dy, w]) => { for (let x = 0; x < w; x++) put(cx + dx + x, cy + dy, c); }); for (let x = -13; x < 13; x++) put(cx + x, cy + 1, c); };
  cloud(54, 40, "#e8a0b0"); cloud(120, 28, "#c981ad"); cloud(190, 48, "#f3a98f");

  // iso projection
  const N = 16, ox = 150, oy = 72;
  const V = (i, j, z) => [ox + (i - j) * 8, oy + (i + j) * 4 - z];
  const inQuad = (p, x, y) => {
    let pos = false, neg = false;
    for (let k = 0; k < 4; k++) {
      const a = p[k], b = p[(k + 1) % 4];
      const cr = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
      if (cr > 0) pos = true; else if (cr < 0) neg = true;
    }
    return !(pos && neg);
  };
  const fill = (p, fn) => {
    const x0 = Math.floor(Math.min(...p.map((q) => q[0]))), x1 = Math.ceil(Math.max(...p.map((q) => q[0])));
    const y0 = Math.floor(Math.min(...p.map((q) => q[1]))), y1 = Math.ceil(Math.max(...p.map((q) => q[1])));
    for (let y = y0; y <= y1; y++) for (let x = x0; x < x1; x++) if (inQuad(p, x + 0.5, y + 0.5)) { const c = fn(x, y); if (c) put(x, y, c); }
  };
  // box with optional lit windows on the side faces
  const box = (i, j, si, sj, z, h, pal, win) => {
    const zt = z + h;
    const top = [V(i, j, zt), V(i + si, j, zt), V(i + si, j + sj, zt), V(i, j + sj, zt)];
    const lf = [V(i, j + sj, zt), V(i + si, j + sj, zt), V(i + si, j + sj, z), V(i, j + sj, z)];
    const rf = [V(i + si, j + sj, zt), V(i + si, j, zt), V(i + si, j, z), V(i + si, j + sj, z)];
    const face = (poly, base, edge) => (x, y) => {
      if (!win || h < 8) return base;
      const u = x - poly[0][0] + (edge ? 0 : 0), v = y - (poly[0][1] + (edge ? (poly[0][0] - x) * 0.5 : (x - poly[0][0]) * 0.5));
      const uu = Math.floor(Math.abs(u)), vv = Math.floor(v);
      if (vv > 2 && vv < h - 2 && uu % 4 === 1 && vv % 4 === 1 && uu > 0 && uu < Math.abs(poly[1][0] - poly[0][0]) - 1) {
        const r = hash(Math.floor(uu / 4) + i * 7, Math.floor(vv / 4) + j * 13, edge ? 1 : 2);
        if (r < 0.62) return win.lit; if (r < 0.7) return win.warm;
      }
      return base;
    };
    fill(lf, face(lf, pal[1], false)); fill(rf, face(rf, pal[2], true)); fill(top, () => pal[0]);
    // 1px top edge highlight
    const [a, b, c2] = [top[3], top[2], top[1]];
    for (let t = 0; t <= 1; t += 1 / 24) { put(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - 0, pal[3] || pal[0]); put(b[0] + (c2[0] - b[0]) * t, b[1] + (c2[1] - b[1]) * t, pal[3] || pal[0]); }
  };
  const disc = (cx, cy, r, c) => { for (let y = -r; y <= 0; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + 1) put(cx + x, cy + y, c); };

  const winP = { lit: "#ffe38a", warm: "#ff9f5a" };
  const pals = [
    ["#e9cfa6", "#cfa878", "#a88160", "#f6e4c4"], ["#efe6d6", "#cfc4b0", "#a79d8d", "#fffaf0"],
    ["#e59a9a", "#c47272", "#9a5656", "#f5bcbc"], ["#8fc6c0", "#6aa19d", "#4e7f7d", "#b6e0db"],
    ["#c9b0e0", "#a68ac2", "#816aa0", "#e2d2f2"], ["#e0b46a", "#bd9048", "#97703a", "#f4d596"],
  ];

  // island slab
  box(0, 0, N, N, -14, 14, ["#6b4a3a", "#5a3d33", "#3f2a26"], null);
  // ground tiles
  const roadI = new Set([5, 10]), roadJ = new Set([5, 10]);
  const isWater = (i, j) => i >= 11 && j <= 4;
  const isPlaza = (i, j) => i >= 6 && i <= 9 && j >= 6 && j <= 9;
  for (let s = 0; s <= 2 * N - 2; s++) for (let i = 0; i < N; i++) {
    const j = s - i; if (j < 0 || j >= N) continue;
    let c = (i + j) % 2 ? "#4f9a52" : "#4a9250";
    if (roadI.has(i) || roadJ.has(j)) c = "#3b4152";
    else if (isWater(i, j)) c = (i + j) % 2 ? "#3f86c8" : "#3a7dbe";
    else if (isPlaza(i, j)) c = (i + j) % 2 ? "#d9bf94" : "#d1b588";
    else if ((i + j) % 5 === 0) c = "#5aa55a";
    fill([V(i, j, 0), V(i + 1, j, 0), V(i + 1, j + 1, 0), V(i, j + 1, 0)], () => c);
    // lane dashes and sidewalks
    if (roadJ.has(j) && !roadI.has(i)) { const m = V(i + 0.5, j + 0.5, 0); put(m[0] - 1, m[1], "#e8d060"); put(m[0], m[1], "#e8d060"); put(m[0] + 1, m[1], "#e8d060"); }
    if (roadI.has(i) && !roadJ.has(j)) { const m = V(i + 0.5, j + 0.5, 0); put(m[0] - 1, m[1], "#e8d060"); put(m[0], m[1], "#e8d060"); put(m[0] + 1, m[1], "#e8d060"); }
    if (isWater(i, j) && hash(i, j) > 0.55) { const m = V(i + 0.5, j + 0.5, 0); put(m[0] - 2, m[1], "#bfe2ff"); put(m[0] - 1, m[1], "#bfe2ff"); }
  }

  // collect objects to paint back-to-front
  const objs = [];
  const add = (depth, fn) => objs.push({ depth, fn });
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    if (roadI.has(i) || roadJ.has(j) || isWater(i, j) || isPlaza(i, j)) continue;
    const r = hash(i, j, 5);
    if (r < 0.12) { // tree
      add(i + j + 0.5, () => { const m = V(i + 0.5, j + 0.5, 0); box(i + 0.4, j + 0.4, 0.2, 0.2, 0, 4, ["#6b4a30", "#5a3a26", "#4a2f20"], null); disc(m[0], m[1] - 6, 4, "#2f7d3c"); disc(m[0] - 1, m[1] - 8, 3, "#3f9a4a"); });
      continue;
    }
    if (r > 0.9) continue;
    const pal = pals[Math.floor(hash(i, j, 9) * pals.length)];
    const tall = hash(i, j, 3), edge = (i === 4 || i === 6 || i === 9 || i === 11 || j === 4 || j === 6 || j === 9 || j === 11);
    const h = Math.round((6 + tall * tall * 36 + (edge ? 6 : 0)) / 2) * 2;
    add(i + j + 1, () => {
      box(i + 0.1, j + 0.1, 0.8, 0.8, 0, h, pal, winP);
      if (h > 26) box(i + 0.35, j + 0.35, 0.3, 0.3, h, 4, ["#8d93a6", "#6f7587", "#555b6c"], null); // rooftop unit
    });
  }
  // water sprites: boat
  add(14 + 2, () => { box(13.2, 2.4, 0.8, 0.3, 0, 2, ["#f4efe2", "#d5cdb8", "#b0a88f"], null); box(13.5, 2.45, 0.1, 0.2, 2, 5, ["#f4efe2", "#e0d9c4", "#c8c0aa"], null); });
  // park lamps
  [[12, 6], [14, 7]].forEach(([i, j]) => add(i + j + 0.5, () => { const m = V(i + 0.5, j + 0.5, 0); for (let y = 0; y < 8; y++) put(m[0], m[1] - y, "#2b2f3d"); put(m[0], m[1] - 9, "#fff0a0"); put(m[0] - 1, m[1] - 9, "#ffd070"); put(m[0] + 1, m[1] - 9, "#ffd070"); }));
  // elevated metro along road j = 5
  const deckZ = 18;
  for (let i = 0; i < N; i++) {
    add(i + 5.5, () => {
      if (i % 3 === 1) box(i + 0.4, 5.4, 0.2, 0.2, 0, deckZ, ["#c9ccd6", "#a9adb9", "#8a8e9c"], null);
      box(i, 5.2, 1, 0.6, deckZ, 2, ["#d7dae3", "#aeb2bf", "#8c909d"], null);
    });
  }
  // train (3 cars) on the deck
  [6, 7, 8].forEach((i, k) => add(i + 5.9 + 0.01, () => {
    box(i + 0.04, 5.28, 0.92, 0.44, deckZ + 2, 6, ["#f2f2f6", "#d7d9e6", "#b4b8cc", "#ffffff"], { lit: "#6fd0ff", warm: "#6fd0ff" });
    const m = V(i + 0.5, 5.5, deckZ + 6); for (let x = -7; x <= 7; x++) if (Math.abs(x) % 2 === 0) put(m[0] + x, m[1] + 6 + Math.round(x * 0.0), "#1f5fd0");
  }));
  // Charminar-like landmark on the plaza
  add(7 + 7 + 2.5, () => {
    const c = ["#f0dcb8", "#d8bd8e", "#b39868", "#fff0d0"], dk = ["#8b6d4a", "#6b5238", "#523f2b"];
    box(6.9, 6.9, 2.2, 2.2, 0, 4, ["#e5cea4", "#c3a77a", "#9d855d"], null); // plinth
    box(7.15, 7.15, 1.7, 1.7, 4, 16, c, { lit: "#7a5a3a", warm: "#7a5a3a" }); // body, arches read as dark openings
    box(7.35, 7.35, 1.3, 1.3, 20, 5, c, { lit: "#ffe38a", warm: "#ffd070" }); // upper gallery
    box(7.55, 7.55, 0.9, 0.9, 25, 2, ["#f6ead0", "#d8bd8e", "#b39868"], null);
    const mn = [[7.0, 7.0], [8.65, 7.0], [7.0, 8.65], [8.65, 8.65]];
    mn.forEach(([i, j]) => { box(i, j, 0.35, 0.35, 4, 34, c, null); box(i + 0.07, j + 0.07, 0.21, 0.21, 38, 3, ["#f6ead0", "#d8bd8e", "#b39868"], null); const t = V(i + 0.175, j + 0.175, 41); disc(t[0], t[1], 2, "#f6ead0"); put(t[0], t[1] - 3, "#c9a24a"); put(t[0], t[1] - 4, "#c9a24a"); });
    const t = V(8, 8, 27); disc(t[0], t[1], 4, "#f6ead0"); put(t[0], t[1] - 5, "#c9a24a"); put(t[0], t[1] - 6, "#c9a24a");
  });
  // pixel birds and kites
  objs.sort((a, b) => a.depth - b.depth).forEach((o) => o.fn());
  [[70, 70], [86, 62], [100, 74]].forEach(([x, y]) => { put(x, y, "#2b2f3d"); put(x + 1, y + 1, "#2b2f3d"); put(x + 2, y, "#2b2f3d"); put(x + 3, y + 1, "#2b2f3d"); put(x + 4, y, "#2b2f3d"); });
  [[238, 112, "#ff6b6b"], [32, 96, "#ffe066"]].forEach(([x, y, c]) => { put(x, y, c); put(x - 1, y + 1, c); put(x + 1, y + 1, c); put(x, y + 2, c); put(x, y + 3, "#fff"); put(x, y + 4, "#fff"); });

  const png = await sharp(buf, { raw: { width: W, height: H, channels: 4 } }).resize(1200, 900, { kernel: "nearest" }).png().toBuffer();
  return `
<svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="1200" height="900" xlink:href="data:image/png;base64,${png.toString("base64")}"/>
  <rect x="48" y="816" width="500" height="52" rx="6" fill="${paper}" fill-opacity="0.92"/>
  <text x="66" y="850" font-family="${MONO}" font-size="21" letter-spacing="3" fill="${mute}">ILLUSTRATION · PIXEL CITY</text>
</svg>`;
})();


// ---------- shared card chrome for the RUL-style covers ----------
const card = (title, sub, body, tagText) => `
<svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
  ${dotted}
  <rect x="40" y="40" width="1120" height="820" rx="10" fill="#fffdf8" stroke="${ink}" stroke-width="2.5"/>
  <text x="112" y="104" font-family="${SERIF}" font-size="40" font-weight="700" fill="${ink}">${title}</text>
  <text x="112" y="140" font-family="${MONO}" font-size="20" fill="${mute}">${sub}</text>
  ${body}
  ${tag(tagText, 112, 838)}
</svg>`;
const T = (x, y, t, size = 20, fill = ink, extra = "") => `<text x="${x}" y="${y}" font-family="${MONO}" font-size="${size}" fill="${fill}" ${extra}>${t}</text>`;
const arrowDefs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${blue}"/></marker>
  <filter id="blur"><feGaussianBlur stdDeviation="7"/></filter></defs>`;

// ---------- clearsight: teacher -> student distillation ----------
const clearsight = (() => {
  const stripes = (x, y, w, h, filt) => {
    let s = `<g ${filt ? 'filter="url(#blur)"' : ""}><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f3ead8"/>`;
    for (let k = -4; k < 9; k++) s += `<path d="M${x + k * 34} ${y + h}l${h * 0.6} ${-h}" stroke="${ink}" stroke-width="13"/>`;
    s += `<circle cx="${x + w * 0.62}" cy="${y + h * 0.4}" r="${w * 0.17}" fill="#e8622c"/></g>`;
    return `<clipPath id="c${x}${filt ? "b" : "s"}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#c${x}${filt ? "b" : "s"})">${s}</g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${ink}" stroke-width="2"/>`;
  };
  const body = `${arrowDefs}
  <rect x="112" y="190" width="400" height="200" rx="10" fill="#e8edfb" stroke="${blue}" stroke-width="3"/>
  ${[0, 1, 2, 3, 4].map((k) => `<rect x="${140 + k * 72}" y="${232 + (k % 2) * 8}" width="56" height="${100 - (k % 2) * 16}" rx="6" fill="${blue}" fill-opacity="${0.25 + k * 0.1}" stroke="${blue}" stroke-width="2"/>`).join("")}
  ${T(132, 366, "SwinIR · teacher (large)", 21, blue, 'font-weight="700"')}
  <path d="M312 396V508" stroke="${blue}" stroke-width="4" marker-end="url(#ah)" stroke-dasharray="2 0"/>
  <rect x="332" y="424" width="188" height="40" rx="4" fill="${hl}" fill-opacity="0.8"/>${T(344, 451, "distillation loss", 20)}
  <rect x="212" y="520" width="200" height="110" rx="10" fill="#fdecea" stroke="${red}" stroke-width="3"/>
  ${[0, 1, 2].map((k) => `<rect x="${232 + k * 56}" y="552" width="42" height="40" rx="5" fill="${red}" fill-opacity="${0.3 + k * 0.15}" stroke="${red}" stroke-width="2"/>`).join("")}
  ${T(232, 614, "IMDN · student", 21, red, 'font-weight="700"')}
  ${T(112, 690, "small model learns to mimic the big one", 19, mute)}
  <!-- right panel -->
  ${stripes(620, 190, 220, 220, true)}${stripes(880, 190, 220, 220, false)}
  ${T(620, 440, "LR frame", 20)}${T(880, 440, "student output", 20)}
  <path d="M846 300h28" stroke="${blue}" stroke-width="4" marker-end="url(#ah)"/>
  <rect x="620" y="490" width="480" height="92" rx="8" fill="#fffdf8" stroke="${ink}" stroke-width="2"/>
  ${T(644, 528, "target", 19, mute)}<rect x="640" y="540" width="436" height="30" fill="${hl}" fill-opacity="0.75"/>${T(650, 562, "30–60 FPS · real-time video", 22, ink, 'font-weight="700"')}
  <rect x="620" y="612" width="480" height="92" rx="8" fill="#fffdf8" stroke="${line}" stroke-width="2"/>
  ${T(644, 650, "measured on one sample image", 19, mute)}${T(644, 686, "SSIM 0.9115 · PSNR 31.99 dB", 24, ink, 'font-weight="700"')}`;
  return card("Teacher → student distillation", "real-time sharpening for video · SwinIR → IMDN", body, "ILLUSTRATION · KNOWLEDGE DISTILLATION");
})();

// ---------- ecobin: fill level -> pickup route ----------
const ecobin = (() => {
  const rows = [["Main Gate", 0.92, "High", red], ["Cafeteria", 0.55, "Medium", "#b8860b"], ["Parking Area", 0.86, "High", red], ["Library", 0.3, "Low", "#2a8f5a"], ["Auditorium", 0.45, "Medium", "#b8860b"]];
  const bx = 620, bw = 330;
  const bars = rows.map(([n, v, lab, c], k) => {
    const y = 196 + k * 88;
    return `${T(bx, y, n, 21)}<rect x="${bx}" y="${y + 12}" width="${bw}" height="30" rx="4" fill="#f1ecdf" stroke="${ink}" stroke-width="2"/>
      <rect x="${bx}" y="${y + 12}" width="${bw * v}" height="30" rx="4" fill="${c}" fill-opacity="0.8"/>
      <rect x="${bx + bw + 20}" y="${y + 12}" width="110" height="30" rx="15" fill="none" stroke="${c}" stroke-width="2.5"/>${T(bx + bw + 75, y + 34, lab, 19, c, 'text-anchor="middle" font-weight="700"')}`;
  }).join("");
  const thr = bx + bw * 0.8;
  const body = `${arrowDefs}
  <!-- bin + sensor -->
  <path d="M170 330L190 700H410L430 330z" fill="#eef2ee" stroke="${ink}" stroke-width="3"/>
  <path d="M184 520H416L410 700H190z" fill="#8aa59a" fill-opacity="0.55"/><path d="M184 520H416" stroke="${ink}" stroke-width="2" stroke-dasharray="8 6"/>
  <rect x="150" y="310" width="300" height="22" rx="5" fill="${ink}"/>
  <rect x="246" y="262" width="108" height="48" rx="6" fill="${blue}"/><circle cx="272" cy="286" r="14" fill="#fffdf8"/><circle cx="328" cy="286" r="14" fill="#fffdf8"/>
  ${T(300, 250, "HC-SR04", 20, blue, 'text-anchor="middle" font-weight="700"')}
  ${[34, 58, 82].map((r) => `<path d="M${300 - r} ${340 + r * 0.45}a${r} ${r} 0 0 0 ${2 * r} 0" fill="none" stroke="${blue}" stroke-width="2.5" stroke-opacity="${1 - r / 110}"/>`).join("")}
  <path d="M300 336V516" stroke="${blue}" stroke-width="3" marker-start="url(#ah)" marker-end="url(#ah)" stroke-dasharray="6 5"/>
  <rect x="312" y="410" width="110" height="36" rx="4" fill="${hl}" fill-opacity="0.8"/>${T(322, 436, "echo → d", 20)}
  ${T(112, 744, "fill % = (bin height − d) / bin height", 20, ink)}
  ${T(112, 776, "ESP32 posts readings to ThingSpeak", 19, mute)}
  ${bars}
  <path d="M${thr} 176V620" stroke="${red}" stroke-width="2.5" stroke-dasharray="8 7"/>${T(thr, 168, "80%", 18, red, 'text-anchor="middle"')}
  <rect x="${bx}" y="660" width="${bw + 130}" height="76" rx="8" fill="${hl}" fill-opacity="0.7" stroke="${ink}" stroke-width="2"/>${T(bx + 20, 706, "bins above 80% → pickup route", 23, ink, 'font-weight="700"')}`;
  return card("Fill level → smarter pickup", "ultrasonic sensing · campus bins on one dashboard", body, "ILLUSTRATION · ESP32 + THINGSPEAK");
})();

// ---------- vyu: pick a seat -> see the view ----------
const vyu = (() => {
  const rowsN = 8, cols = 11, x0 = 156, dx = 46, y0 = 300, dy = 50, selR = 3, selC = 5;
  let seats = "";
  for (let r = 0; r < rowsN; r++) for (let c = 0; c < cols; c++) {
    const x = x0 + c * dx, y = y0 + r * dy + (r >= 5 ? 24 : 0), sel = r === selR && c === selC, back = r >= 5;
    seats += `<rect x="${x - 15}" y="${y - 14}" width="30" height="26" rx="7" fill="${sel ? blue : back ? "#e4ddcd" : "#efe9db"}" stroke="${sel ? ink : "#9a9484"}" stroke-width="${sel ? 3 : 1.8}"/>`;
  }
  const sx = x0 + selC * dx, sy = y0 + selR * dy;
  const body = `${arrowDefs}
  <path d="M170 230Q${x0 + (cols - 1) * dx / 2} 196 ${x0 + (cols - 1) * dx + 16} 230" fill="none" stroke="${ink}" stroke-width="8" stroke-linecap="round"/>${T(x0 + (cols - 1) * dx / 2, 270, "SCREEN", 19, mute, 'text-anchor="middle" letter-spacing="6"')}
  <polygon points="${sx},${sy} ${x0 + 1.2 * dx},236 ${x0 + 8.8 * dx},236" fill="${hl}" fill-opacity="0.5"/>
  <path d="M${sx} ${sy}L${x0 + 1.2 * dx} 236M${sx} ${sy}L${x0 + 8.8 * dx} 236" stroke="${blue}" stroke-width="2.5" stroke-dasharray="8 6"/>
  ${seats}
  <rect x="${sx - 15}" y="${sy - 14}" width="30" height="26" rx="7" fill="${blue}" stroke="${ink}" stroke-width="3"/>
  <path d="M134 ${y0 + 4 * dy + 30}H${x0 + (cols - 1) * dx + 34}" stroke="${ink}" stroke-width="5" stroke-dasharray="3 0"/>${T(134, y0 + 4 * dy + 54, "balcony overhang", 18, mute)}
  ${T(112, 744, "pick a seat in the plan", 20, ink)}${T(112, 776, "50 Hyderabad cinemas · 3D views in three.js", 19, mute)}
  <!-- inset: view from the seat -->
  <rect x="716" y="190" width="392" height="300" rx="8" fill="#171c2a" stroke="${ink}" stroke-width="2.5"/>
  <polygon points="780,240 1044,240 1070,370 754,370" fill="#dfe6f7"/><polygon points="780,240 1044,240 1070,370 754,370" fill="none" stroke="#9fb0d8" stroke-width="3"/>
  <polygon points="716,300 780,240 754,370 716,430" fill="#232b40"/><polygon points="1108,300 1044,240 1070,370 1108,430" fill="#232b40"/>
  <clipPath id="vyuInset"><rect x="716" y="190" width="392" height="300" rx="8"/></clipPath>
  <g clip-path="url(#vyuInset)">${[0, 1, 2, 3, 4].map((k) => `<rect x="${730 + k * 76}" y="${430 + (k % 2) * 6}" width="66" height="60" rx="14" fill="#0c101b"/>`).join("")}</g>
  <rect x="716" y="190" width="392" height="300" rx="8" fill="none" stroke="${ink}" stroke-width="2.5"/>
  ${T(716, 524, "view from the highlighted seat", 20, ink)}
  <rect x="716" y="560" width="392" height="86" rx="8" fill="#fffdf8" stroke="${line}" stroke-width="2"/>${T(738, 596, "check the sight-line", 19, mute)}${T(738, 630, "before you book", 24, ink, 'font-weight="700"')}`;
  return card("Pick a seat → see the view", "cinema seat previews · plan, sight-line, perspective", body, "ILLUSTRATION · SEAT VIEW");
})();

export const covers = { sigrun, "nasa-rul": nasaRul, "hyd-days": hydDays, clearsight, ecobin, vyu };
