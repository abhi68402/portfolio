import { lazy, Suspense, useCallback, useEffect, useState } from "react";
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
const SkillCatcher = lazy(() => import("./components/game/SkillCatcher"));
const Terminal = lazy(() => import("./components/terminal/Terminal"));

export default function App() {
  const [gameOpen, setGameOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);

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
      <Footer onTerminal={openTerminal} />

      <Suspense fallback={null}>
        <AnimatePresence>{gameOpen && <SkillCatcher key="game" onClose={closeGame} />}</AnimatePresence>
        <AnimatePresence>
          {terminalOpen && <Terminal key="term" onClose={closeTerminal} onGame={openGame} />}
        </AnimatePresence>
      </Suspense>
      </LazyMotion>
    </MotionConfig>
  );
}
