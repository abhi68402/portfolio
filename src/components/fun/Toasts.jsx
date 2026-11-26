import { useEffect, useState } from "react";

// Neon toasts in the bottom-left corner. Anything on the site can show one:
//   window.dispatchEvent(new CustomEvent("toast", { detail: { text, icon } }))
// "toast-once" (with an `id`) only shows the first time per visit.
export default function Toasts() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const seen = new Set();
    const add = ({ text, icon = "✨" }) => {
      const id = Math.random().toString(36).slice(2);
      setItems((list) => [...list.slice(-2), { id, text, icon }]);
      setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 4200);
    };
    const onToast = (e) => add(e.detail || {});
    const onOnce = (e) => {
      const d = e.detail || {};
      if (seen.has(d.id)) return;
      seen.add(d.id);
      add(d);
    };
    window.addEventListener("toast", onToast);
    window.addEventListener("toast-once", onOnce);
    return () => { window.removeEventListener("toast", onToast); window.removeEventListener("toast-once", onOnce); };
  }, []);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-4 left-4 z-[75] flex max-w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {items.map((t) => (
        <div key={t.id} className="toast-in neon-panel neon-panel-hot flex items-center gap-3 px-4 py-3 text-sm">
          <span aria-hidden="true" className="text-xl">{t.icon}</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
