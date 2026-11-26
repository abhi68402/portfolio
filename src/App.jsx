import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { AnimatePresence, LazyMotion, MotionConfig } from "motion/react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Skills from "./components/sections/Skills";
import Projects from "./components/sections/Projects";
import Experience from "./components/sections/Experience";
import Certifications from "./components/sections/Certifications";
import Contact from "./components/sections/Contact";
import Toasts from "./components/fun/Toasts";
import Screensaver from "./components/fun/Screensaver";
import { useVisitorReactions } from "./components/fun/useVisitorReactions";
import { useChaos } from "./hooks/useChaos";

const loadFeatures = () => import("./motion-features.js").then((mod) => mod.default);

// The heavy/fun pieces load only after the page is ready (or when opened),
// so they never slow down the content a recruiter came for.
const NeonGrid = lazy(() => import("./components/neon/NeonGrid"));
const Glitch = lazy(() => import("./components/glitch/Glitch"));
const BugBlitz = lazy(() => import("./components/blitz/BugBlitz"));
const Terminal = lazy(() => import("./components/terminal/Terminal"));

export default function App() {
  const [blitzOpen, setBlitzOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [chaos] = useChaos();

  useEffect(() => {
    const ric = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
    ric(() => setReady(true), { timeout: 2500 });
  }, []);

  useVisitorReactions();
  useNeonSpotlight();
  useClickSparks(chaos);

  const openBlitz = useCallback(() => { setTerminalOpen(false); setBlitzOpen(true); }, []);
  const closeBlitz = useCallback(() => setBlitzOpen(false), []);
  const openTerminal = useCallback(() => setTerminalOpen(true), []);
  const closeTerminal = useCallback(() => setTerminalOpen(false), []);

  // Backtick (`) toggles the terminal, unless you're typing in a form field.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "`") return;
      const el = e.target;
      const typing = el.closest?.("input, textarea, select, [contenteditable='true']");
      if (typing && !el.dataset.terminalInput) return;
      e.preventDefault();
      setTerminalOpen((o) => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    // reducedMotion="user": every Motion animation calms down when the OS asks for reduced motion
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        <Suspense fallback={null}>{ready && <NeonGrid />}</Suspense>
        <Navbar onPlay={openBlitz} />
        <main id="main">
          <Hero onPlay={openBlitz} />
          <About />
          <Skills />
          <Projects />
          <Experience />
          <Certifications />
          <Contact />
        </main>
        <Footer onTerminal={openTerminal} />

        <Toasts />
        <Screensaver enabled={chaos} />
        {ready && chaos && <div className="crt" aria-hidden="true" />}

        <Suspense fallback={null}>
          {ready && chaos && <Glitch />}
          {blitzOpen && <BugBlitz key="blitz" onClose={closeBlitz} />}
          <AnimatePresence>
            {terminalOpen && <Terminal key="term" onClose={closeTerminal} onGame={openBlitz} />}
          </AnimatePresence>
        </Suspense>
      </LazyMotion>
    </MotionConfig>
  );
}

// Neon panels get a spotlight that follows the cursor (CSS reads --mx / --my).
function useNeonSpotlight() {
  useEffect(() => {
    const onMove = (e) => {
      const el = e.target.closest?.(".neon-panel");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
}

// Every click throws a few neon sparks (only while chaos is on).
function useClickSparks(on) {
  useEffect(() => {
    if (!on || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#ff2bd6", "#22e6ff", "#ffd23f", "#a970ff"];
    const onClick = (e) => {
      if (!e.clientX && !e.clientY) return;
      for (let i = 0; i < 8; i++) {
        const s = document.createElement("span");
        const a = (Math.PI * 2 * i) / 8 + Math.random() * 0.4, d = 18 + Math.random() * 24;
        s.className = "spark";
        s.style.cssText = `left:${e.clientX - 2}px;top:${e.clientY - 2}px;background:${colors[i % 4]};color:${colors[i % 4]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 560);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [on]);
}
