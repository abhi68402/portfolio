// Colour palettes for the neon backdrop, one per section (stage), in order:
// Home, About, Skills, Projects, Experience, Certs, Contact.
// The backdrop blends from one to the next as you scroll.
const P = (skyTop, skyBottom, sun1, sun2, grid, mount, floor, stars = 0.9, glow = 1) => ({ skyTop, skyBottom, sun1, sun2, grid, mount, floor, stars, glow });

export const PALETTES_DARK = [
  P("#0b0420", "#4a0f5e", "#ffd36b", "#ff2bd6", "#ff2bd6", "#160626", "#08030f"), // sunset magenta
  P("#03081f", "#0f2a5c", "#9ff6ff", "#22e6ff", "#22e6ff", "#061127", "#030612"), // cyan night
  P("#0c0322", "#35106b", "#f6a6ff", "#a970ff", "#b98cff", "#14072b", "#07030f"), // ultraviolet
  P("#1a0410", "#6b1230", "#ffe08a", "#ff6b3d", "#ff8a3d", "#200713", "#0c0307"), // outrun orange
  P("#020a12", "#0c3b3b", "#c3ffe0", "#39ff88", "#39ff88", "#04161a", "#020809"), // matrix green
  P("#09021a", "#2a0d55", "#ffffff", "#ff2bd6", "#22e6ff", "#120626", "#05020c"), // chrome
  P("#0b0420", "#4a0f5e", "#ffd36b", "#ff2bd6", "#ff2bd6", "#160626", "#08030f"), // back to sunset
];

export const PALETTES_LIGHT = [
  P("#ffd9f3", "#ffe9cc", "#ffd36b", "#ff5fd8", "#d400a8", "#f3c7ea", "#fdf2ff", 0, 0),
  P("#d6f6ff", "#f0e6ff", "#9ff6ff", "#22b8e6", "#0089a8", "#cbe6f5", "#f4fbff", 0, 0),
  P("#eadbff", "#ffe3f6", "#f6a6ff", "#a970ff", "#7a3fd6", "#dccaf5", "#f8f3ff", 0, 0),
  P("#ffe2cf", "#fff0d6", "#ffe08a", "#ff8a3d", "#d6531c", "#f5d2c0", "#fff7f0", 0, 0),
  P("#d8fbe9", "#effff6", "#c3ffe0", "#2ad67a", "#12935a", "#c6efd9", "#f4fff9", 0, 0),
  P("#efe3ff", "#e3f7ff", "#ffffff", "#ff5fd8", "#0089a8", "#dcd0f2", "#faf6ff", 0, 0),
  P("#ffd9f3", "#ffe9cc", "#ffd36b", "#ff5fd8", "#d400a8", "#f3c7ea", "#fdf2ff", 0, 0),
];

function hexToRgb(hex) { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function mixHex(a, b, t) {
  const [r1, g1, b1] = hexToRgb(a), [r2, g2, b2] = hexToRgb(b);
  return `#${[r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}
export function mixPalette(a, b, t) {
  if (t <= 0) return a;
  const out = {};
  for (const k of Object.keys(a)) out[k] = typeof a[k] === "number" ? a[k] + (b[k] - a[k]) * t : mixHex(a[k], b[k], t);
  return out;
}

// Secret rainbow mode (Konami code / squashing Glitch 10 times): hues cycle.
export function rainbowPalette(t, light) {
  const hue = (t * 40) % 360;
  const c = (dh, s, l) => `hsl(${(hue + dh) % 360} ${s}% ${l}%)`;
  return light
    ? { skyTop: c(0, 90, 90), skyBottom: c(60, 90, 92), sun1: c(40, 100, 75), sun2: c(0, 100, 60), grid: c(180, 90, 40), mount: c(20, 60, 85), floor: c(200, 60, 97), stars: 0, glow: 0 }
    : { skyTop: c(0, 80, 6), skyBottom: c(40, 80, 25), sun1: c(60, 100, 75), sun2: c(0, 100, 60), grid: c(180, 100, 60), mount: c(20, 70, 9), floor: c(200, 70, 4), stars: 0.9, glow: 1 };
}
