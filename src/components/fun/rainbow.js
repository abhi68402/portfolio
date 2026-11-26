import { safeGet, safeSet } from "../../hooks/storage";

// Secret rainbow mode: the two neon colours cycle through every hue.
// Unlocked by the Konami code or by squashing Glitch 10 times.
let timer = 0;

export function setRainbow(on) {
  const root = document.documentElement;
  clearInterval(timer);
  if (on) {
    root.dataset.rainbow = "1";
    let h = 300;
    timer = setInterval(() => {
      h = (h + 4) % 360;
      if (root.dataset.theme === "light") { root.style.removeProperty("--mag"); root.style.removeProperty("--cyan"); return; } // keep light mode readable
      root.style.setProperty("--mag", `hsl(${h} 100% 60%)`);
      root.style.setProperty("--cyan", `hsl(${(h + 150) % 360} 100% 60%)`);
    }, 80);
  } else {
    delete root.dataset.rainbow;
    root.style.removeProperty("--mag");
    root.style.removeProperty("--cyan");
  }
  safeSet("rainbow", on ? "1" : "0");
}

export const rainbowSaved = () => safeGet("rainbow") === "1";
