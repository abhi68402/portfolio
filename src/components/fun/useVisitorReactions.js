import { useEffect } from "react";
import { safeGet, safeSet } from "../../hooks/storage";
import { rainbowSaved, setRainbow } from "./rainbow";

const toast = (icon, text) => window.dispatchEvent(new CustomEvent("toast", { detail: { icon, text } }));
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

// Small ways the site notices what the visitor is doing.
export function useVisitorReactions() {
  useEffect(() => {
    const off = [];
    const on = (t, type, fn, o) => { t.addEventListener(type, fn, o); off.push(() => t.removeEventListener(type, fn, o)); };
    const timers = [];

    // 1. Returning visitors get a welcome back (with last visit's bug count)
    const visits = Number(safeGet("visits", 0)) + 1;
    safeSet("visits", String(visits));
    const bugs = Number(safeGet("bugs-total", 0));
    if (visits > 1) timers.push(setTimeout(() => toast("🕹️", `Welcome back, player! Visit #${visits}${bugs ? ` · ${bugs} bugs squashed so far` : ""}.`), 1800));
    if (rainbowSaved()) setRainbow(true);

    // 2. Switching tabs: the tab title begs you to come back
    const title = document.title;
    let leftAt = 0;
    on(document, "visibilitychange", () => {
      if (document.hidden) { document.title = "👾 Glitch is eating your tabs…"; leftAt = Date.now(); }
      else {
        document.title = title;
        if (Date.now() - leftAt > 5000) toast("👋", "You're back! Glitch missed you. (It didn't.)");
      }
    });

    // 3. Konami code → rainbow mode
    let k = 0;
    on(window, "keydown", (e) => {
      if (e.target.closest?.("input, textarea")) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      k = key === KONAMI[k] ? k + 1 : key === KONAMI[0] ? 1 : 0;
      if (k === KONAMI.length) {
        k = 0;
        const turnOn = !document.documentElement.dataset.rainbow;
        setRainbow(turnOn);
        toast("🌈", turnOn ? "Konami code! 30 extra lives and rainbow mode." : "Rainbow mode off. Classic neon restored.");
      }
    });

    // 4. Shaking the browser window → the page wobbles like an earthquake
    let lx = window.screenX, ly = window.screenY, energy = 0, quakeCD = 0;
    const shake = setInterval(() => {
      const dx = window.screenX - lx, dy = window.screenY - ly;
      lx = window.screenX; ly = window.screenY;
      energy = energy * 0.6 + Math.hypot(dx, dy);
      quakeCD = Math.max(0, quakeCD - 1);
      if (energy > 140 && !quakeCD) {
        quakeCD = 30;
        document.documentElement.classList.add("quake");
        setTimeout(() => document.documentElement.classList.remove("quake"), 950);
        window.dispatchEvent(new CustomEvent("toast-once", { detail: { id: "quake", icon: "🌋", text: "Whoa, earthquake! Stop shaking the window 😵" } }));
      }
    }, 100);

    return () => { off.forEach((f) => f()); timers.forEach(clearTimeout); clearInterval(shake); };
  }, []);
}
