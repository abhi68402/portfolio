import { skillGroups } from "../../data/content";

// The "training run" readout: epoch, loss, a loss curve that draws as it
// trains, and a short log. Purely for fun; the numbers are a playful curve.
export const EPOCHS = 12;
export const LOSS = Array.from({ length: EPOCHS + 1 }, (_, e) => +(2.4 * Math.exp(-0.34 * e) + 0.05 + (e && e < EPOCHS ? Math.abs(Math.sin(e * 2.3)) * 0.09 : 0)).toFixed(2));
const LEARNED = skillGroups.flatMap((g) => g.skills.map((s) => s.name));

export default function TrainConsole({ epoch, training, done, onTrain }) {
  const cw = 260, ch = 86, max = LOSS[0];
  const pts = LOSS.slice(0, epoch + 1).map((l, e) => `${(e / EPOCHS) * cw},${ch - (l / max) * (ch - 6) - 3}`).join(" ");
  const log = Array.from({ length: epoch }, (_, i) => i + 1).slice(-3);
  const acc = Math.round((1 - LOSS[epoch] / 2.6) * 100);

  return (
    <div className="mt-4 grid gap-4 border-t border-dashed border-line-strong pt-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="flex flex-col gap-2">
        <button type="button" onClick={onTrain} disabled={training} className="btn btn-primary justify-center disabled:opacity-70">
          {training ? "Training…" : done ? "↻ Train again" : "▶ Train on my skills"}
        </button>
        <p className="font-mono text-xs text-muted tabular">
          epoch {String(epoch).padStart(2, "0")}/{EPOCHS} · loss {epoch ? LOSS[epoch].toFixed(2) : "—"} · acc {epoch ? `${acc}%` : "—"}
        </p>
      </div>

      <div className="grid min-w-0 gap-2 xl:grid-cols-[auto_1fr] xl:items-center xl:gap-4">
        <svg viewBox={`-4 -2 ${cw + 8} ${ch + 6}`} className="h-[86px] w-full max-w-[260px]" aria-hidden="true">
          <line x1="0" y1={ch} x2={cw} y2={ch} stroke="var(--line-strong)" />
          <line x1="0" y1="0" x2="0" y2={ch} stroke="var(--line-strong)" />
          <text x="4" y="10" fontSize="9" fontFamily="JetBrains Mono Variable, monospace" fill="var(--muted)">loss</text>
          {epoch > 0 && <polyline points={pts} fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
          {epoch > 0 && <circle cx={(epoch / EPOCHS) * cw} cy={ch - (LOSS[epoch] / max) * (ch - 6) - 3} r="3.5" fill="var(--red)" />}
        </svg>
        <ul className="min-w-0 space-y-0.5 font-mono text-xs leading-relaxed text-muted" aria-live="polite">
          {epoch === 0 && <li>model idle. press train ←</li>}
          {log.map((e) => (
            <li key={e} className="pop-in truncate">
              <span className="text-ink">ep {String(e).padStart(2, "0")}</span> · loss {LOSS[e].toFixed(2)} · learned <span className="text-blue">{LEARNED[(e * 3) % LEARNED.length]}</span>
            </li>
          ))}
          {done && <li className="pop-in font-semibold text-blue">✓ converged · prediction: strong hire</li>}
        </ul>
      </div>
    </div>
  );
}
