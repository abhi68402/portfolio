import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { nowBuilding, profile, stats } from "../../data/content";

// Three small toys under the hero: what I'm building now, real numbers from my projects,
// and my local time (with a sun or moon riding across the sky).
export default function HeroTiles() {
  return (
    <div className="mx-auto grid max-w-6xl items-stretch gap-6 px-4 pb-8 sm:px-6 md:grid-cols-3">
      <h2 className="sr-only">At a glance</h2>
      <NowBuilding />
      <ByTheNumbers />
      <LocalTime />
    </div>
  );
}

function NowBuilding() {
  return (
    <article className="card tilt-l lift h-full p-5">
      <p className="hud-label flex items-center gap-2"><span className="pulse-dot h-2 w-2 rounded-full bg-red" /> Now building</p>
      <h3 className="mt-2 font-serif text-2xl font-semibold">{nowBuilding.title}</h3>
      <p className="text-sm text-muted">{nowBuilding.what}</p>
      <div className="mt-4 h-3 overflow-hidden rounded-full border border-line bg-card-2" role="progressbar" aria-label={`${nowBuilding.title} progress`} aria-valuenow={nowBuilding.progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-[repeating-linear-gradient(45deg,var(--blue)_0_8px,color-mix(in_srgb,var(--blue)_75%,white)_8px_16px)]" style={{ width: `${nowBuilding.progress}%` }} />
      </div>
      <p className="mt-2 font-hand text-xl text-red">{nowBuilding.progress}% · compiling dreams</p>
    </article>
  );
}

// "By the numbers": real figures from the projects, counting up once the
// tile scrolls into view. Edit them in `stats` in content.js.
function ByTheNumbers() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <article ref={ref} className="card tape-blue tape lift relative h-full p-5">
      <p className="hud-label">By the numbers</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <span className="block whitespace-nowrap font-serif text-[1.6rem] font-semibold leading-none text-blue tabular">
                <Counter to={s.value} run={inView} />{s.suffix}
              </span>
              <span className="mt-1 block text-xs leading-snug text-muted" aria-hidden="true">{s.label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function Counter({ to, run }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!run || reduce) { if (reduce) setN(to); return; }
    let raf, start;
    const step = (t) => {
      start ??= t;
      const p = Math.min(1, (t - start) / 1200);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run, to, reduce]);
  return n.toLocaleString("en-IN");
}

// "My local time": a little sky where the sun (or moon) rides an arc across
// the day in my time zone, plus what I'm probably doing and how far ahead or
// behind the visitor is. Updates every 30 seconds. Time zone: profile.timezone.
const TZ = profile.timezone || "Asia/Kolkata";

function nowIn(tz) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZoneName: "shortOffset" })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
  const h = Number(parts.hour), m = Number(parts.minute);
  // offset like "GMT+5:30" -> minutes
  const om = /GMT([+-]\d+)(?::(\d+))?/.exec(parts.timeZoneName || "");
  const offset = om ? Number(om[1]) * 60 + Math.sign(Number(om[1]) || 1) * Number(om[2] || 0) : 330;
  return { h, m, offset };
}

function mood(h) {
  if (h >= 23 || h < 7) return "Probably asleep. I'll reply in the morning.";
  if (h < 10) return "Morning coffee, inbox open.";
  if (h < 18) return "At my desk, building things.";
  return "Evening. Still tinkering on side projects.";
}

function gap(myOffset) {
  const visitor = -new Date().getTimezoneOffset();
  const d = myOffset - visitor;
  if (d === 0) return "Same time zone as you.";
  const a = Math.abs(d), hh = Math.floor(a / 60), mm = a % 60;
  const span = `${hh ? `${hh}h` : ""}${hh && mm ? " " : ""}${mm ? `${mm}m` : ""}`;
  return `I'm ${span} ${d > 0 ? "ahead of" : "behind"} you.`;
}

function LocalTime() {
  const [t, setT] = useState(() => nowIn(TZ));
  useEffect(() => {
    const id = setInterval(() => setT(nowIn(TZ)), 30000);
    return () => clearInterval(id);
  }, []);

  const mins = t.h * 60 + t.m;
  const day = mins >= 360 && mins < 1080; // 6:00 to 18:00
  // progress along the arc: day 6am->6pm, night 6pm->6am
  const p = day ? (mins - 360) / 720 : ((mins - 1080 + 1440) % 1440) / 720;
  const cx = 100 - 72 * Math.cos(p * Math.PI);
  const cy = 62 - 48 * Math.sin(p * Math.PI);
  const h12 = ((t.h + 11) % 12) + 1;
  const time = `${h12}:${String(t.m).padStart(2, "0")}`;
  const ampm = t.h < 12 ? "am" : "pm";

  return (
    <article className="card tilt-r lift tape relative flex h-full flex-col p-5">
      <p className="hud-label">My local time</p>
      <div className="relative mt-2">
        <svg viewBox="0 0 200 68" className="h-auto w-full" aria-hidden="true">
          {!day && [[30, 20], [58, 9], [92, 22], [128, 8], [160, 20], [180, 38], [16, 40], [112, 36]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 ? 1.1 : 1.6} fill="var(--muted)" className="twinkle" style={{ animationDelay: `${i * 0.45}s` }} />
          ))}
          <path d="M28 62 A72 48 0 0 1 172 62" fill="none" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="4 5" />
          <line x1="8" y1="62" x2="192" y2="62" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
          {day ? (
            <g>
              <circle cx={cx} cy={cy} r="13" fill="var(--hl)" opacity="0.45" />
              <circle cx={cx} cy={cy} r="8" fill="var(--hl)" stroke="var(--ink)" strokeWidth="1.5" />
            </g>
          ) : (
            <g>
              <circle cx={cx} cy={cy} r="8" fill="var(--card-2)" stroke="var(--ink)" strokeWidth="1.5" />
              <circle cx={cx + 3.5} cy={cy - 2.5} r="6.5" fill="var(--card)" />
            </g>
          )}
        </svg>
      </div>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="font-serif text-[1.75rem] font-semibold leading-none tabular">{time}</span>
        <span className="font-mono text-sm text-muted">{ampm} · India (IST)</span>
      </p>
      <p className="mt-2 text-sm text-ink">{mood(t.h)}</p>
      <p className="mt-auto pt-2 font-hand text-lg text-red">{gap(t.offset)}</p>
    </article>
  );
}
