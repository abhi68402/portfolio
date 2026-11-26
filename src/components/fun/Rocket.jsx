import { useEffect, useState } from "react";
import Sketch from "../notebook/Sketch";

// The Konami easter egg: a hand-drawn rocket flies across the page.
export default function Rocket() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const go = () => setN((x) => x + 1);
    window.addEventListener("launch-rocket", go);
    return () => window.removeEventListener("launch-rocket", go);
  }, []);
  if (!n) return null;
  return (
    <div key={n} aria-hidden="true" className="pointer-events-none fixed bottom-0 left-0 z-[60]">
      <div className="launch">
        <Sketch kind="rocket" className="on h-28 w-28 text-blue" />
      </div>
    </div>
  );
}
