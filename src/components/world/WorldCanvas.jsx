import { useEffect, useRef } from "react";
import { scenes } from "./scenes";
import { getProgress, measureSections } from "./progress";

const PIXEL = 4; // each world pixel = 4×4 screen pixels

// The living pixel world behind the whole page. It figures out which level
// (section) you're in, paints that scene, and crossfades into the next one
// as you approach it. ~30 fps, paused when the tab is hidden; a still image
// when the visitor prefers reduced motion.
export default function WorldCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext("2d");
    const a = document.createElement("canvas");
    const b = document.createElement("canvas");
    const ga = a.getContext("2d"), gb = b.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, last = 0, t = 0;

    const resize = () => {
      w = Math.ceil(window.innerWidth / PIXEL);
      h = Math.ceil(window.innerHeight / PIXEL);
      for (const c of [cv, a, b]) { c.width = w; c.height = h; }
      measureSections();
      draw();
    };

    function draw() {
      const light = document.documentElement.dataset.theme === "light";
      const { i, frac } = getProgress();
      const blend = Math.max(0, Math.min(1, (frac - 0.7) / 0.3)); // crossfade in the last 30%
      scenes[i](ga, w, h, t, light, frac);
      ctx.globalAlpha = 1;
      ctx.drawImage(a, 0, 0);
      if (blend > 0 && scenes[i + 1]) {
        scenes[i + 1](gb, w, h, t, light, 0);
        ctx.globalAlpha = blend;
        ctx.drawImage(b, 0, 0);
        ctx.globalAlpha = 1;
      }
    }

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return; // ~30 fps is plenty for pixel art
      t += Math.min(0.1, (now - last) / 1000);
      last = now;
      draw();
    };

    const onScroll = () => { if (reduce) draw(); };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    const ro = new ResizeObserver(() => measureSections());
    ro.observe(document.body);

    resize();
    cv.style.opacity = "1";
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("themechange", draw);
    document.addEventListener("visibilitychange", onVis);
    if (!reduce) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("themechange", draw);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-0 transition-opacity duration-700"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
