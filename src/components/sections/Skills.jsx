import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { learning, skillGroups } from "../../data/content";
import SectionFrame from "../layout/SectionFrame";
import MarginNote from "../notebook/MarginNote";
import GaugeBar from "../skills/GaugeBar";
import NeuralNet from "../skills/NeuralNet";
import TrainConsole, { EPOCHS } from "../skills/TrainConsole";

// LOG ENTRY 03 · Neural net. Skill groups are the input layer of a small
// network; pick one to see what it fires. "Train" runs a 12-epoch fake
// training loop with a loss curve. The plain skill list is always next to it.
export default function Skills() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-120px" });
  const [active, setActive] = useState(skillGroups[0].id);
  const [touched, setTouched] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [training, setTraining] = useState(false);
  const done = epoch === EPOCHS && !training;

  // until the visitor picks one, gently cycle through the groups while in view
  useEffect(() => {
    if (!inView || touched || training || reduce) return;
    const id = setInterval(() => setActive((a) => skillGroups[(skillGroups.findIndex((g) => g.id === a) + 1) % skillGroups.length].id), 3400);
    return () => clearInterval(id);
  }, [inView, touched, training, reduce]);

  const pick = (id) => { setActive(id); setTouched(true); };

  const train = () => {
    if (training) return;
    setTouched(true);
    if (reduce) { setEpoch(EPOCHS); finish(); return; }
    setEpoch(0);
    setTraining(true);
    let e = 0;
    const id = setInterval(() => {
      e += 1;
      setEpoch(e);
      if (e >= EPOCHS) { clearInterval(id); setTraining(false); finish(); }
    }, 320);
  };
  const finish = () => {
    window.dispatchEvent(new CustomEvent("bolt", { detail: { text: "Training complete! Prediction: hire him. ✓", mood: "wow" } }));
  };

  const group = skillGroups.find((g) => g.id === active) || skillGroups[0];

  return (
    <SectionFrame id="skills" title="Neural net" kicker="My skills, wired as a tiny network. Pick a group to see what it fires, or press Train and watch the loss drop." doodle="satellite">
      <div ref={ref} className="grid items-start gap-8 lg:grid-cols-[1.45fr_1fr] [&>*]:min-w-0">
        <div className="card relative p-4 sm:p-6">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Skill groups">
            {skillGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                aria-pressed={active === g.id}
                onClick={() => pick(g.id)}
                className={`rounded-full border-2 px-3 py-1 text-sm font-medium transition ${active === g.id ? "border-ink bg-hl text-ink shadow-[2px_2px_0_var(--ink)]" : "border-line-strong text-muted hover:border-ink hover:text-ink"}`}
              >
                {g.name}{g.core ? " ★" : ""}
              </button>
            ))}
          </div>
          <div className="mt-3 -mx-1">
            <NeuralNet active={training ? null : active} onPick={pick} training={training} done={done} reduce={reduce} />
          </div>
          <TrainConsole epoch={epoch} training={training} done={done} onTrain={train} />
          <MarginNote arrow="down" className="absolute -top-12 right-6 hidden sm:inline-flex">press train!</MarginNote>
        </div>

        <div className="space-y-6">
          <div key={group.id} className="card tape pop-in p-5 sm:p-6" aria-live="polite">
            <p className="hud-label">Layer inspector</p>
            <div className="mt-1 flex items-baseline justify-between gap-3">
              <h3 className="font-serif text-2xl font-semibold">{group.name}</h3>
              <CountUp value={group.level} />
            </div>
            {group.core && <p className="font-hand text-xl text-red">★ core focus</p>}
            <div className="mt-4 space-y-3">
              {group.skills.map((s) => <GaugeBar key={s.name} {...s} on={inView || reduce} />)}
            </div>
          </div>

          <div className="card tilt-r p-5">
            <p className="hud-label">Currently learning</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {learning.map((l) => (
                <li key={l} className="rounded-lg border-2 border-dashed border-blue/60 px-3 py-1 text-sm text-blue">{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Everything at a glance, as plain text */}
      <div className="card mt-8 p-5 sm:p-6">
        <h3 className="hud-label">All skills</h3>
        <dl className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((g) => (
            <div key={g.id} className="flex gap-3 text-sm">
              <dt className="w-28 shrink-0 font-semibold">{g.name}</dt>
              <dd className="text-muted">{g.skills.map((s) => s.name).join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </div>
    </SectionFrame>
  );
}

// the group's average level, counting up when it changes
function CountUp({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (t) => {
      start ??= t;
      const p = Math.min(1, (t - start) / 700);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="font-mono text-3xl font-semibold text-blue tabular">{n}<span className="text-base text-muted">/100</span></span>;
}
