import { useEffect, useRef, useState } from "react";
import { m } from "motion/react";
import { profile } from "../../data/content";
import { scrollToSection } from "../../hooks/scrollTo";
import { setGlobalTheme } from "../../hooks/useTheme";
import { complete, runCommand } from "./commands";

const BOOT = [
  { text: "MISSION CONSOLE v3 · comms online", tone: "accent" },
  { text: `Connected to ${profile.name}'s portfolio.`, tone: "muted" },
  "Type 'help' to see commands. Press Esc or ` to close.",
];

// Retro amber-on-black terminal overlay (the easter egg).
// It always looks the same regardless of light/dark theme, on purpose.
export default function Terminal({ onClose, onGame }) {
  const [lines, setLines] = useState(BOOT);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState([]);
  const [hIndex, setHIndex] = useState(-1);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      opener?.focus?.();
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  function submit(e) {
    e.preventDefault();
    const input = value;
    setValue("");
    setHIndex(-1);
    if (input.trim()) setHistory((h) => [input, ...h].slice(0, 50));
    const res = runCommand(input);
    const echo = { prompt: true, text: input };

    if (res.action === "clear") return setLines([]);
    setLines((l) => [...l, echo, ...res.lines]);

    if (res.action === "exit") setTimeout(onClose, 350);
    if (res.action === "game") setTimeout(onGame, 350);
    if (res.action === "resume") window.open(profile.resume, "_blank", "noopener");
    if (res.action === "theme") setGlobalTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    if (res.action === "launch") setTimeout(() => { onClose(); setTimeout(() => window.dispatchEvent(new Event("launch-rocket")), 250); }, 500);
    if (res.action === "goto") setTimeout(() => { onClose(); setTimeout(() => scrollToSection(res.target), 200); }, 300);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") { e.preventDefault(); onClose(); }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = Math.min(hIndex + 1, history.length - 1);
      if (history[i] !== undefined) { setHIndex(i); setValue(history[i]); }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = hIndex - 1;
      setHIndex(Math.max(i, -1));
      setValue(i >= 0 ? history[i] : "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const matches = complete(value);
      if (matches.length === 1) setValue(matches[0] + " ");
      else if (matches.length > 1) setLines((l) => [...l, { prompt: true, text: value }, matches.join("   ")]);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }

  return (
    <m.div
      role="dialog"
      aria-modal="true"
      aria-label="Terminal mode"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-2 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <m.div
        initial={{ scaleY: 0.02, opacity: 0.4 }}
        animate={{ scaleY: 1, opacity: 1 }}
        exit={{ scaleY: 0.02, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-[78vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-[#ffd166]/40 bg-[#0d1424] font-mono text-[13px] text-[#dfe7ff] shadow-[0_0_60px_rgba(255,209,102,0.15)] sm:text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {/* CRT scanlines */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.25)_0px,rgba(0,0,0,0.25)_1px,transparent_1px,transparent_3px)]" />

        <div className="flex items-center justify-between border-b border-[#ffd166]/25 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#ffd166]/70">
          <span>mission console — tty1</span>
          <button type="button" onClick={onClose} aria-label="Close terminal" className="relative z-20 rounded border border-[#ffd166]/40 px-2 py-0.5 hover:bg-[#ffd166]/10">
            ✕ esc
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 [text-shadow:0_0_6px_rgba(255,209,102,0.35)]" aria-live="polite">
          {lines.map((l, i) => <Line key={i} line={l} />)}
          <form onSubmit={submit} className="mt-1 flex items-center gap-2">
            <label htmlFor="term-input" className="shrink-0 text-[#ffd166]">guest@harshit:~$</label>
            <input
              id="term-input"
              ref={inputRef}
              data-terminal-input="true"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              className="min-w-0 flex-1 bg-transparent text-[#ffffff] caret-[#ffd166] outline-none focus-visible:outline-none"
            />
          </form>
          <div ref={endRef} />
        </div>
      </m.div>
    </m.div>
  );
}

function Line({ line }) {
  if (typeof line === "string") return <pre className="whitespace-pre-wrap break-words">{line}</pre>;
  if (line.prompt) return <pre className="whitespace-pre-wrap break-words"><span className="text-[#ffd166]">guest@harshit:~$ </span><span className="text-[#ffffff]">{line.text}</span></pre>;
  if (line.image) return <img src={line.image} alt={line.alt} className="my-2 w-40 rounded border border-[#ffd166]/40 sepia" loading="lazy" />;
  if (line.link)
    return (
      <pre className="whitespace-pre-wrap">
        <a href={line.link} target={line.link.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer" className="underline decoration-[#ffd166]/50 underline-offset-2 hover:text-white">{line.text}</a>
      </pre>
    );
  const tone = line.tone === "accent" ? "text-[#ffd166]" : line.tone === "muted" ? "text-[#dfe7ff]/60" : "";
  return <pre className={`whitespace-pre-wrap break-words ${tone}`}>{line.text}</pre>;
}
