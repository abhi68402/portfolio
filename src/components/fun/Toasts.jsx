import { useEffect, useState } from "react";

// Small notes that pop up bottom-left. Anything on the site can show one:
//   window.dispatchEvent(new CustomEvent("toast", { detail: { text, icon } }))
export default function Toasts() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const onToast = (e) => {
      const { text, icon = "✨" } = e.detail || {};
      const id = Math.random().toString(36).slice(2);
      setItems((list) => [...list.slice(-2), { id, text, icon }]);
      setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 4200);
    };
    window.addEventListener("toast", onToast);
    return () => window.removeEventListener("toast", onToast);
  }, []);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-4 left-4 z-[55] flex max-w-[min(340px,calc(100vw-8rem))] flex-col gap-2">
      {items.map((t) => (
        <div key={t.id} className="card pop-in flex items-center gap-3 px-4 py-3 text-sm">
          <span aria-hidden="true" className="text-xl">{t.icon}</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
