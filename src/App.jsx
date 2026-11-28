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
import Lamp from "./components/fun/Lamp";
import Rocket from "./components/fun/Rocket";
import { useVisitorReactions } from "./components/fun/useVisitorReactions";

const loadFeatures = () => import("./motion-features.js").then((mod) => mod.default);

// The terminal loads only when opened, so it never slows down the content a
// recruiter came for.
const Terminal = lazy(() => import("./components/terminal/Terminal"));

export default function App() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  useVisitorReactions();

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
        <Lamp />
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
        <Footer onTerminal={openTerminal} />

        <Toasts />
        <Rocket />
        <Suspense fallback={null}>
          <AnimatePresence>
            {terminalOpen && <Terminal key="term" onClose={closeTerminal} onGame={() => {}} />}
          </AnimatePresence>
        </Suspense>
      </LazyMotion>
    </MotionConfig>
  );
}
