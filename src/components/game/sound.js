// Tiny sound effects made with the Web Audio API: no audio files to download.
// Muted by default; the game's speaker button turns it on.
let ac = null;
let muted = true;

export function setMuted(m) {
  muted = m;
  if (!m && !ac) {
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; }
  }
  if (ac && ac.state === "suspended") ac.resume();
}

// one short "blip": a frequency sweep with a quick fade out
function blip(from, to, dur = 0.12, type = "square", vol = 0.06) {
  if (muted || !ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination);
  o.start(t);
  o.stop(t + dur);
}

export const sfx = {
  jump: () => blip(320, 640, 0.12),
  double: () => blip(520, 980, 0.1),
  pickup: (mult = 1) => blip(700 + mult * 90, 1300 + mult * 120, 0.09, "triangle", 0.07),
  power: () => { blip(400, 800, 0.1, "triangle"); setTimeout(() => blip(600, 1200, 0.14, "triangle"), 90); },
  hit: () => blip(220, 60, 0.28, "sawtooth", 0.08),
  shield: () => blip(900, 300, 0.2, "sine", 0.08),
  level: () => [0, 110, 220].forEach((d, i) => setTimeout(() => blip(440 * (1 + i * 0.25), 440 * (1 + i * 0.25), 0.1, "triangle"), d)),
  over: () => [0, 160, 320].forEach((d, i) => setTimeout(() => blip(500 - i * 120, 400 - i * 120, 0.18, "triangle"), d)),
};
