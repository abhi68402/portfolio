import { useEffect, useState } from "react";
import { safeGet, safeSet } from "./storage";

// "Chaos" = Glitch the bug, the CRT effect and the other loud extras.
// Visitors can pause it from the navbar; the choice is remembered.
// <html data-chaos="on|off"> lets CSS react too.
export function getChaos() {
  return document.documentElement.dataset.chaos !== "off";
}

export function setChaos(on) {
  document.documentElement.dataset.chaos = on ? "on" : "off";
  safeSet("chaos", on ? "on" : "off");
  window.dispatchEvent(new Event("chaoschange"));
}

export function initChaos() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.dataset.chaos = safeGet("chaos", reduce ? "off" : "on");
}

export function useChaos() {
  const [on, setOn] = useState(getChaos);
  useEffect(() => {
    const sync = () => setOn(getChaos());
    window.addEventListener("chaoschange", sync);
    return () => window.removeEventListener("chaoschange", sync);
  }, []);
  return [on, setChaos];
}
