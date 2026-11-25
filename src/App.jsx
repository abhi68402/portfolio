import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { safeGet, safeSet } from "./hooks/storage";
import { AnimatePresence, LazyMotion, MotionConfig } from "motion/react";

const loadFeatures = () => import("./motion-features.js").then((mod) => mod.default);
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Skills from "./components/sections/Skills";
import Projects from "./components/sections/Projects";
import Experience from "./components/sections/Experience";
import Certifications from "./components/sections/Certifications";
import Contact from "./components/sections/Contact";

// The game and terminal are only downloaded when someone opens them,
// so they never slow down the first page load.
const NovaRun = lazy(() => import("./components/game/NovaRun"));
const Mascot = lazy(() => import("./components/mascot/Mascot"));
const Terminal = lazy(() => import("./components/terminal/Terminal"));

export default function App() {
  const [gameOpen, setGameOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);

  // Nova the mascot: on unless the visitor sent her home. She loads only after
  // the page is idle, so she never delays the important content.
  const [novaOn, setNovaOn] = useState(() => safeGet("nova", "on") !== "off");
  const [novaReady, setNovaReady] = useState(false);
  useEffect(() => {
    const ric = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
    ric(() => setNovaReady(true), { timeout: 2500 });
  }, []);
  const toggleNova = useCallback((on) => {
    setNovaOn(on);
    safeSet("nova", on ? "on" : "off");
  }, []);
  // "Say hi to Nova" (About) or terminal commands bring her back if she was sent home
  useEffect(() => {
    const onMascot = () => toggleNova(true);
    window.addEventListener("mascot", onMascot);
    return () => window.removeEventListener("mascot", onMascot);
  }, [toggleNova]);

  const openGame = useCallback(() => { setTerminalOpen(false); setGameOpen(true); }, []);
  const closeGame = useCallback(() => setGameOpen(false), []);
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
    // reducedMotion="user": every Framer Motion animation calms down automatically
    // when the visitor's OS asks for reduced motion.
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
      <Navbar onPlay={openGame} />
      <main id="main">
        <Hero onPlay={openGame} />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Certifications />
        <Contact />
      </main>
      <Footer onTerminal={openTerminal} novaOn={novaOn} onToggleNova={toggleNova} />

      <Suspense fallback={null}>
        {novaReady && novaOn && <Mascot onSendHome={() => toggleNova(false)} />}
        <AnimatePresence>{gameOpen && <NovaRun key="game" onClose={closeGame} />}</AnimatePresence>
        <AnimatePresence>
          {terminalOpen && <Terminal key="term" onClose={closeTerminal} onGame={openGame} />}
        </AnimatePresence>
      </Suspense>
      </LazyMotion>
    </MotionConfig>
  );
}
