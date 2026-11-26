// ─────────────────────────────────────────────────────────────────────────────
//  Glitch the bug, drawn in code (no image files). A top-down pixel beetle
//  so it can crawl and turn in any direction.
//  drawBug(ctx, { x, y, angle, size, legs, kind, hurt })
//    kind: "glitch" (magenta) | "gold" (worth more) | "boss" (big, crowned) | "bomb"
//    legs: walk-cycle phase 0..1      size: pixel scale (2 ≈ 40 px bug)
// ─────────────────────────────────────────────────────────────────────────────

const KINDS = {
  glitch: { shell: "#ff2bd6", shade: "#a1128a", spot: "#22e6ff", eye: "#22e6ff" },
  gold: { shell: "#ffd23f", shade: "#c98f00", spot: "#ffffff", eye: "#ffffff" },
  boss: { shell: "#ff3b3b", shade: "#8f1010", spot: "#ffd23f", eye: "#ffd23f" },
};
const INK = "#14041f";

export function drawBug(ctx, { x, y, angle = 0, size = 2, legs = 0, kind = "glitch", hurt = 0, blink = false }) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2); // sprite faces "up"; angle 0 = moving right
  ctx.imageSmoothingEnabled = false;
  const p = (px, py, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(px * size, py * size, w * size, h * size); };

  if (kind === "bomb") {
    // round bomb with a fizzing fuse
    p(-5, -4, 10, 10, INK); p(-4, -5, 8, 12, INK); p(-6, -3, 12, 8, INK);
    p(-3, -3, 2, 2, "#5b4a7a");
    p(-1, -7, 2, 3, "#9a7b4f");
    const spark = Math.floor(legs * 8) % 2;
    p(-1 + spark, -9, 2, 2, "#ffd23f"); p(-2 + spark * 2, -10, 1, 1, "#ff6b3d");
    ctx.restore();
    return;
  }

  const C = KINDS[kind] || KINDS.glitch;
  const shell = hurt > 0 ? "#ffffff" : C.shell;
  // legs: 3 pairs, swinging alternately
  const swing = Math.round(Math.sin(legs * Math.PI * 2) * 1.5);
  for (let i = 0; i < 3; i++) {
    const ly = -2 + i * 3;
    const s = i % 2 ? swing : -swing;
    p(-7, ly + s, 3, 1, INK); p(-8, ly + s + 1, 1, 2, INK);
    p(4, ly - s, 3, 1, INK); p(7, ly - s + 1, 1, 2, INK);
  }
  // antennae
  p(-3, -10, 1, 3, INK); p(-4, -11, 1, 1, C.spot);
  p(2, -10, 1, 3, INK); p(3, -11, 1, 1, C.spot);
  // head
  p(-3, -8, 6, 3, INK);
  p(-2, -8, 4, 2, "#2a1440");
  // eyes (glowing)
  if (!blink) { p(-3, -8, 2, 2, C.eye); p(1, -8, 2, 2, C.eye); p(-3, -8, 1, 1, "#ffffff"); p(1, -8, 1, 1, "#ffffff"); }
  // shell (two wing cases with a split)
  p(-5, -5, 10, 11, INK);
  p(-4, -5, 8, 12, INK);
  p(-4, -4, 8, 9, shell);
  p(-3, 5, 6, 1, shell);
  p(-4, 2, 8, 3, C.shade);
  p(0, -4, 1, 10, INK);
  // spots (the "glitch" pattern)
  p(-3, -2, 2, 2, C.spot); p(2, 0, 2, 2, C.spot); p(-2, 2, 1, 1, C.spot);

  if (kind === "boss") {
    // crown
    p(-3, -14, 7, 2, "#ffd23f"); p(-3, -16, 1, 2, "#ffd23f"); p(0, -17, 1, 3, "#ffd23f"); p(3, -16, 1, 2, "#ffd23f");
  }
  ctx.restore();
}
