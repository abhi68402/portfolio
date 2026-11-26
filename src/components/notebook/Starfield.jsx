// The night sky behind the page in dark mode: two layers of stars (they drift
// at different speeds as you scroll), a few twinkling ones, soft nebula glows
// and the odd shooting star. Hidden in light mode by CSS. Drawn once, no JS loop.

// tiny seeded random so the sky is the same on every visit
function rng(seed) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

function makeStars(n, seed, rMin, rMax) {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => ({
    x: r() * 1000,
    y: r() * 1000,
    r: rMin + r() * (rMax - rMin),
    o: 0.35 + r() * 0.55,
    tw: i % 6 === 0,
    delay: (r() * 4).toFixed(2),
    tint: i % 11 === 0 ? "#ffd98a" : i % 13 === 0 ? "#a9c4ff" : "#ffffff",
  }));
}
const FAR = makeStars(150, 7, 0.5, 1.2);
const NEAR = makeStars(45, 42, 1.1, 2.1);

function Layer({ stars, className }) {
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className={className}>
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={s.tint}
          opacity={s.o}
          className={s.tw ? "twinkle" : undefined}
          style={s.tw ? { animationDelay: `${s.delay}s` } : undefined}
        />
      ))}
    </svg>
  );
}

export default function Starfield() {
  return (
    <div className="starfield" aria-hidden="true">
      <Layer stars={FAR} className="stars-far" />
      <Layer stars={NEAR} className="stars-near" />
      <span className="shooting" />
      <span className="shooting two" />
    </div>
  );
}
