import { useInViewOnce } from "./useInViewOnce";

// Wraps words in a yellow highlighter stroke that swipes across on first view.
export default function Highlight({ children, className = "" }) {
  const [ref, seen] = useInViewOnce();
  return <span ref={ref} className={`hl ${seen ? "on" : ""} ${className}`}>{children}</span>;
}
