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
import Starfield from "./components/notebook/Starfield";
import Rocket from "./components/fun/Rocket";
import { useVisitorReactions } from "./components/fun/useVisitorReactions";
import { safeGet, safeSet } from "./hooks/storage";

const loadFeatures = () => import("./motion-features.js").then((mod) => mod.default);

// Bolt and the terminal load only after the page is ready (or when opened),
// so they never slow down the content a recruiter came for.
const Robot = lazy(() => import("./components/robot/Robot"));
const Terminal = lazy(() => import("./components/terminal/Terminal"));

export default function App() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [botOn, setBotOn] = useState(() => safeGet("bolt", "on") !== "off");

  useEffect(() => {
    const ric = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
    ric(() => setReady(true), { timeout: 2500 });
  }, []);

  useVisitorReactions();

  const toggleBot = useCallback((on) => { setBotOn(on); safeSet("bolt", on ? "on" : "off"); }, []);
  const openTerminal = useCallback(() => setTerminalOpen(true), []);
  const closeTerminal = useCallback(() => setTerminalOpen(false), []);

  // Backtick (`) toggles the secret terminal, unless you're typing in a form field.
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
        <Starfield />
        <Navbar />
        <main id="main">
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Experience />
          <Certifications />
          <Contact />
        </main>
        <Footer onTerminal={openTerminal} botOn={botOn} onToggleBot={toggleBot} />

        <Toasts />
        <Rocket />
        <Suspense fallback={null}>
          {ready && botOn && <Robot onHide={() => toggleBot(false)} />}
          <AnimatePresence>
            {terminalOpen && <Terminal key="term" onClose={closeTerminal} onGame={() => {}} />}
          </AnimatePresence>
        </Suspense>
      </LazyMotion>
    </MotionConfig>
  );
}
