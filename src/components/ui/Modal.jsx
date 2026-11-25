import { useEffect, useRef } from "react";
import { m } from "motion/react";

// Accessible dialog used by project details and the game.
// - Esc closes it        - Tab stays inside it (focus trap)
// - focus returns to the button that opened it when it closes
// - the page behind can't scroll while it's open
// Wrap it in <AnimatePresence> where you render it, so it can animate out.
export default function Modal({ onClose, labelledBy, children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = ref.current?.querySelector("[data-autofocus]") || ref.current?.querySelector("button, a, input, textarea");
    first?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab" && ref.current) {
        const items = [...ref.current.querySelectorAll('a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])')];
        if (!items.length) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <m.div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <m.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={{ y: 24, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 16, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className={`relative max-h-[92vh] w-full overflow-auto rounded-xl border border-line-strong bg-panel shadow-2xl ${className}`}
      >
        {children}
      </m.div>
    </m.div>
  );
}

export function CloseButton({ onClick, label = "Close" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-line-strong px-3 font-mono text-xs uppercase tracking-widest text-muted transition hover:border-accent hover:text-accent"
    >
      <span aria-hidden="true">✕</span> Esc
    </button>
  );
}
