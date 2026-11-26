import { useEffect } from "react";

const COLORS = ["#ffb224", "#ffe08a", "#e8697a", "#9fd3ff", "#ffffff"];

// Every click throws a tiny burst of square pixel "sparks". Pure decoration:
// skipped when the visitor prefers reduced motion.
export function useClickSparkles() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onClick = (e) => {
      if (e.button !== 0 || !e.isTrusted && !e.clientX) return;
      for (let i = 0; i < 8; i++) {
        const s = document.createElement("span");
        const a = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
        const d = 18 + Math.random() * 22;
        s.className = "spark";
        s.style.left = `${e.clientX - 3}px`;
        s.style.top = `${e.clientY - 3}px`;
        s.style.background = COLORS[i % COLORS.length];
        s.style.setProperty("--dx", `${Math.cos(a) * d}px`);
        s.style.setProperty("--dy", `${Math.sin(a) * d}px`);
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 560);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);
}
