// ─────────────────────────────────────────────────────────────────────────────
//  Nova reacts to what you do on the page. Each block below listens for one
//  kind of event and tells Nova what to do through the small `api` object
//  that Mascot.jsx passes in. Returns a function that removes every listener.
// ─────────────────────────────────────────────────────────────────────────────
import { projects } from "../../data/content";

export function attachReactions(api) {
  const off = [];
  const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); off.push(() => target.removeEventListener(type, fn, opts)); };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Hover a project card → hop onto it, sniff, say something about it
  let hoverTimer = 0;
  const sniffed = new Map(); // project id → last time
  on(document, "pointerover", (e) => {
    if (e.pointerType !== "mouse") return;
    const card = e.target.closest?.("[data-project]");
    clearTimeout(hoverTimer);
    if (!card || api.busy) return;
    const id = card.dataset.project;
    if (Date.now() - (sniffed.get(id) || 0) < 20000) return;
    hoverTimer = setTimeout(() => {
      sniffed.set(id, Date.now());
      const p = projects.find((x) => x.id === id);
      api.hopToElement(card, () => {
        api.brain.sniff(1.4);
        if (p?.nova) api.say(p.nova, { force: true, ms: 5200 });
      });
    }, 450);
  });

  // 2. Theme switch → shades (light) or a sleepy remark (dark)
  on(window, "themechange", () => {
    const light = document.documentElement.dataset.theme === "light";
    api.brain.bark();
    api.say(light ? "Shades on. 😎 Bright out here." : "Night mode. *yawns* Love the stars.", { force: true });
  });

  // 3. Resume download → grab the paper and run
  on(document, "click", (e) => {
    const a = e.target.closest?.("a[download], a[href$='.pdf']");
    if (!a) return;
    api.carryPaper(4);
    api.say("Fetching his resume! 📄 Good choice.", { force: true });
  }, true);

  // 4. Little celebrations sent by other components (copy email, form sent)
  on(window, "nova-react", (e) => {
    const { type, text } = e.detail || {};
    if (type === "happy") api.happy(text);
  });

  // 5. Typing in the contact form → come over, sit, tilt head
  let listening = false, said = false;
  on(document, "focusin", (e) => {
    const form = e.target.closest?.("#contact-form");
    if (!form || !e.target.matches("input, textarea") || listening) return;
    listening = true;
    api.hopToElement(form, () => api.brain.listen(true));
    if (!said) { said = true; api.say("I'm a good listener. Take your time. 🐾", { force: true }); }
  });
  on(document, "focusout", (e) => {
    if (!e.target.closest?.("#contact-form")) return;
    setTimeout(() => {
      if (!document.activeElement?.closest?.("#contact-form")) { listening = false; api.brain.listen(false); }
    }, 50);
  });

  // 6. Navbar / altitude-meter clicks → zoomies
  on(document, "click", (e) => {
    if (e.target.closest?.("header nav a, nav[aria-label='Altitude'] a")) api.zoomies();
  });

  // 7. Wiggle the mouse fast over empty space → a laser pointer appears
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    let trail = [], lastX = 0, lastY = 0, laserOn = false;
    on(window, "mousemove", (e) => {
      const now = performance.now();
      const d = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      lastX = e.clientX; lastY = e.clientY;
      const interactive = e.target.closest?.("a, button, input, textarea, [data-perch], [role='dialog']");
      if (laserOn) { if (interactive) { laserOn = false; api.laserOff(); } else api.laserAt(e.clientX, e.clientY); return; }
      if (interactive) { trail = []; return; }
      trail.push([now, d]);
      trail = trail.filter(([t]) => now - t < 700);
      const dist = trail.reduce((s, [, x]) => s + x, 0);
      if (dist > 1700) {
        laserOn = true; trail = [];
        api.laserAt(e.clientX, e.clientY);
        api.say("Is that… THE RED DOT?! 🔴", { force: true });
        setTimeout(() => { laserOn = false; }, 6000);
      }
    }, { passive: true });
    on(document, "click", () => { if (laserOn) { laserOn = false; api.laserOff(); } });
  }

  return () => off.forEach((f) => f());
}
