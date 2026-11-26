import { useCallback, useEffect, useState } from "react";
import { safeSet } from "./storage";

// Reads the theme that index.html already applied, and lets you flip it.
// Other parts of the page (the starfield, the terminal) listen for "themechange".
export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "dark");

  useEffect(() => {
    const sync = () => setTheme(document.documentElement.dataset.theme);
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  const toggle = useCallback(() => setGlobalTheme(theme === "dark" ? "light" : "dark"), [theme]);
  return { theme, toggle };
}

export function setGlobalTheme(next) {
  document.documentElement.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#07040F" : "#F4EEFC");
  safeSet("theme", next);
  window.dispatchEvent(new Event("themechange"));
}
