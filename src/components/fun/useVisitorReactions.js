import { useEffect } from "react";
import { safeGet, safeSet } from "../../hooks/storage";

const toast = (icon, text) => window.dispatchEvent(new CustomEvent("toast", { detail: { icon, text } }));
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

// A few gentle ways the site notices the visitor. Nothing here gets in the way.
export function useVisitorReactions() {
  useEffect(() => {
    const off = [];
    const on = (t, type, fn, o) => { t.addEventListener(type, fn, o); off.push(() => t.removeEventListener(type, fn, o)); };
    const timers = [];

    // 1. Returning visitors get a small welcome back
    const visits = Number(safeGet("visits", 0)) + 1;
    safeSet("visits", String(visits));
    if (visits > 1) timers.push(setTimeout(() => toast("🛰️", `Welcome back! This is visit #${visits}.`), 2200));

    // 2. Switching tabs: the tab title waves at you
    const title = document.title;
    on(document, "visibilitychange", () => {
      document.title = document.hidden ? "👋 Come back soon! · Harshit" : title;
    });

    // 3. Konami code → a doodle rocket launches across the page
    let k = 0;
    on(window, "keydown", (e) => {
      if (e.target.closest?.("input, textarea")) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      k = key === KONAMI[k] ? k + 1 : key === KONAMI[0] ? 1 : 0;
      if (k === KONAMI.length) {
        k = 0;
        window.dispatchEvent(new Event("launch-rocket"));
        toast("🚀", "Konami code accepted. Liftoff!");
      }
    });

    return () => { off.forEach((f) => f()); timers.forEach(clearTimeout); };
  }, []);
}
