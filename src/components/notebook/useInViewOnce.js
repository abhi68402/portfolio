import { useEffect, useRef, useState } from "react";

// Returns [ref, seen]: `seen` flips to true the first time the element
// scrolls into view (used to start the highlighter and doodle animations).
export function useInViewOnce(margin = "-60px") {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, margin]);
  return [ref, seen];
}
