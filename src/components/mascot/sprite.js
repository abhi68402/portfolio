// ─────────────────────────────────────────────────────────────────────────────
//  Nova the astro-pup: pixel art drawn with code (no image files).
//
//  Each pose is drawn on a tiny 32×28 canvas one "pixel" at a time, then a dark
//  outline is added automatically. Scaling that tiny canvas up with smoothing
//  turned off gives the crisp pixel-art look. Finished poses are cached.
//
//  A pose is an object like { legs: 0.25, tail: 1, mouth: true, mode: "run" }.
//  mode: "stand" | "run" | "jump" | "sit" | "sleep" | "crouch"
// ─────────────────────────────────────────────────────────────────────────────

export const SPRITE_W = 32;
export const SPRITE_H = 28;

const C = {
  fur: "#d9a066",     // tan, like the real street dog
  shade: "#b07a44",
  white: "#f6ecdc",
  dark: "#24180f",
  tongue: "#e8697a",
  rim: "#ffb224",     // helmet rim + collar: the site's amber
  glass: "rgba(190,225,255,0.22)",
  shine: "rgba(255,255,255,0.75)",
  outline: "#1a120b",
};

const cache = new Map();

export function getPupFrame(pose) {
  const key = JSON.stringify(pose);
  let c = cache.get(key);
  if (!c) {
    c = renderPose(pose);
    if (cache.size > 300) cache.clear();
    cache.set(key, c);
  }
  return c;
}

// Draw a pose onto any canvas: (x, y) is the bottom-centre point (where the paws touch).
export function drawPup(ctx, pose, x, y, scale = 1, flip = false) {
  const frame = getPupFrame(pose);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x), Math.round(y));
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(frame, (-SPRITE_W / 2) * scale, -SPRITE_H * scale, SPRITE_W * scale, SPRITE_H * scale);
  ctx.restore();
}

function renderPose(p) {
  const cv = document.createElement("canvas");
  cv.width = SPRITE_W;
  cv.height = SPRITE_H;
  const g = cv.getContext("2d");
  const px = (x, y, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  const rect = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const line = (x0, y0, x1, y1, col, t = 2) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) rect(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, t, 1, col);
  };

  const mode = p.mode || "stand";
  const phase = (p.legs || 0) * Math.PI * 2;
  const bob = mode === "run" ? Math.round(Math.abs(Math.sin(phase)) * -1) : 0;
  const sleeping = mode === "sleep";
  const sitting = mode === "sit";
  const crouch = mode === "crouch";

  // body placement
  let bodyY = 12 + bob + (crouch ? 3 : 0);
  if (sleeping) bodyY = 19;
  let headDX = 0, headDY = bob + (crouch ? 3 : 0);
  if (sitting) headDY = -1;
  if (sleeping) { headDX = 1; headDY = 10; }

  // ── tail (behind body) ──
  const wag = p.tail ?? 0; // -1..1
  if (sleeping) line(7, bodyY + 4, 4, bodyY + 5, C.fur);
  else if (sitting) line(8, 20, 4, 19 - Math.round(wag * 2), C.fur);
  else {
    line(7, bodyY + 1, 4, bodyY - 3 - Math.round(wag * 2), C.fur);
    px(3, bodyY - 4 - Math.round(wag * 2), C.white);
  }

  // ── legs ──
  const legC = C.fur, pawC = C.white;
  const leg = (hipX, hipY, footX, footY) => { line(hipX, hipY, footX, footY - 1, legC); rect(footX, footY - 1, 2, 1, pawC); };
  if (sleeping) {
    rect(19, 25, 3, 1, pawC); rect(22, 25, 3, 1, pawC);
  } else if (sitting) {
    // folded back leg (haunch) + two straight front legs
    rect(7, 17, 7, 7, C.fur); rect(8, 23, 5, 3, C.shade); rect(12, 25, 3, 1, pawC);
    leg(17, 19, 17, 27); leg(20, 19, 20, 27);
  } else if (mode === "jump") {
    leg(9, 18, 5, 23); leg(11, 18, 8, 24);   // back legs kick out
    leg(17, 18, 22, 22); leg(19, 18, 24, 21); // front legs reach forward
  } else {
    const swing = mode === "run" ? 3 : mode === "stand" ? 0 : 2;
    const lift = (o) => (mode === "run" ? Math.max(0, Math.sin(phase + o)) * 2 : 0);
    const off = (o) => Math.round(Math.sin(phase + o) * swing);
    const top = bodyY + 6;
    leg(9, top, 9 + off(0), 27 - lift(0));
    leg(12, top, 12 + off(Math.PI), 27 - lift(Math.PI));
    leg(17, top, 17 + off(Math.PI * 0.5), 27 - lift(Math.PI * 0.5));
    leg(20, top, 20 + off(Math.PI * 1.5), 27 - lift(Math.PI * 1.5));
  }

  // ── body ──
  if (sitting) {
    rect(9, 13, 11, 8, C.fur);
    rect(17, 13, 4, 8, C.white);
  } else {
    rect(7, bodyY, 15, 7, C.fur);
    rect(8, bodyY + 6, 13, 1, C.shade);
    rect(17, bodyY + 1, 5, 5, C.white); // chest
  }

  // ── head (inside the helmet) ──
  const hx = 19 + headDX, hy = 3 + headDY;
  // ears: pointy street-dog ears
  if (!sleeping) {
    const earUp = p.ears === "down" ? 1 : 0;
    line(hx + 1, hy + 2 + earUp, hx + 2, hy - 1 + earUp, C.shade, 2);
    line(hx + 5, hy + 2 + earUp, hx + 6, hy - 1 + earUp, C.shade, 2);
  }
  rect(hx, hy + 1, 9, 7, C.fur);
  rect(hx + 6, hy + 4, 4, 3, C.white);    // muzzle
  rect(hx + 9, hy + 4, 1, 1, C.dark);     // nose
  if (p.mouth) { rect(hx + 7, hy + 7, 3, 1, C.dark); rect(hx + 8, hy + 8, 2, 1, C.tongue); }
  // eye
  if (sleeping || p.blink) rect(hx + 5, hy + 3, 2, 1, C.dark);
  else { rect(hx + 5, hy + 2, 2, 2, C.dark); px(hx + 5, hy + 2, C.white); }
  // collar
  if (!sleeping) rect(hx - 1, hy + 8, 5, 1, C.rim);

  // ── helmet: glass bubble + amber rim ──
  const cx = hx + 4.5, cy = hy + 4, r = 7.5;
  g.save();
  g.globalCompositeOperation = "destination-over";
  g.fillStyle = C.glass;
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.restore();
  for (let a = 0; a < Math.PI * 2; a += 0.09) {
    const x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
    if (a > 0.5 && a < 2.6) continue; // open at the bottom where the neck goes
    px(x, y, a > 0.25 && a < 2.9 ? C.rim : "rgba(230,240,255,0.55)");
  }
  px(cx - 3, cy - 4, C.shine); px(cx - 4, cy - 3, C.shine); px(cx - 2, cy - 5, C.shine);

  addOutline(g);
  return cv;
}

// Give every solid pixel a 1px dark outline (skips the see-through glass).
function addOutline(g) {
  const img = g.getImageData(0, 0, SPRITE_W, SPRITE_H);
  const d = img.data;
  const solid = (x, y) => x >= 0 && y >= 0 && x < SPRITE_W && y < SPRITE_H && d[(y * SPRITE_W + x) * 4 + 3] > 200;
  const out = [];
  for (let y = 0; y < SPRITE_H; y++)
    for (let x = 0; x < SPRITE_W; x++)
      if (d[(y * SPRITE_W + x) * 4 + 3] < 120 && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) out.push([x, y]);
  for (const [x, y] of out) {
    const i = (y * SPRITE_W + x) * 4;
    d[i] = 26; d[i + 1] = 18; d[i + 2] = 11; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
}
