import { useEffect, useRef } from "react";

// A soft desk-lamp glow that follows the cursor across the notebook
// (a faint flashlight in night mode). Mouse/trackpad only; CSS hides it
// on touch screens and for reduced motion. No React re-renders: it just
// moves two CSS variables.
export default function Lamp() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        ref.current?.style.setProperty("--lx", `${e.clientX}px`);
        ref.current?.style.setProperty("--ly", `${e.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="lamp" aria-hidden="true" />;
}
