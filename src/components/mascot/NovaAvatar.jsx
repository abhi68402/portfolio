import { useEffect, useRef } from "react";
import { drawPup, SPRITE_H, SPRITE_W } from "./sprite";

// A tiny live portrait of Nova for the contact card: idles, blinks, wags.
export default function NovaAvatar({ scale = 2 }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext("2d");
    const W = SPRITE_W * scale, H = SPRITE_H * scale;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    let t = 0;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = () => {
      t++;
      const light = document.documentElement.dataset.theme === "light";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      drawPup(ctx, { mode: "sit", tail: t % 2 ? 1 : -1, blink: t % 7 === 0, head: t % 10 < 3 ? "tilt" : undefined, acc: light ? ["shades"] : [] }, W / 2, H, scale);
    };
    draw();
    if (reduce) return;
    const id = setInterval(draw, 400);
    return () => clearInterval(id);
  }, [scale]);
  return (
    <span className="grid h-[76px] w-[68px] shrink-0 place-items-end border-[3px] border-[var(--px-edge)] bg-panel-2">
      <canvas ref={ref} aria-label="Nova, the astro-pup" role="img" style={{ width: SPRITE_W * scale, height: SPRITE_H * scale, imageRendering: "pixelated" }} />
    </span>
  );
}
