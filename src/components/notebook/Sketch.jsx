import { useInViewOnce } from "./useInViewOnce";

// Hand-drawn space doodles for the notebook margins. Each one "draws itself"
// (stroke animation) the first time it scrolls into view. Pure decoration.
//   <Sketch kind="planet" className="w-24 text-blue" />
const P = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", pathLength: 1 };

const DOODLES = {
  planet: (
    <>
      <path {...P} d="M50 22c15-1 28 12 28 28 0 15-12 28-28 28S22 66 22 50c0-15 12-27 27-28" />
      <path {...P} d="M14 60c-8 7-6 12 6 11 14-1 38-9 56-20 14-9 20-17 12-19-4-1-9 0-14 2" />
      <path {...P} d="M40 38c3 1 4 3 3 5M58 60c2 0 4 2 3 4M55 33c1 0 2 1 2 2" />
    </>
  ),
  rocket: (
    <>
      <path {...P} d="M50 12c12 10 17 26 15 46H36C34 38 39 22 50 12z" />
      <path {...P} d="M50 38c4 0 6 3 6 6s-3 6-6 6-6-3-6-6 2-6 6-6z" />
      <path {...P} d="M36 50c-8 4-11 10-11 16l11-5M65 50c8 4 11 10 11 16l-11-5" />
      <path {...P} d="M42 62c0 7 3 12 8 18 5-6 8-11 8-18M47 66c0 4 1 7 3 10 2-3 3-6 3-10" />
    </>
  ),
  orbit: (
    <>
      <path {...P} d="M10 50c0-12 18-21 40-21s40 9 40 21-18 21-40 21S10 62 10 50z" />
      <path {...P} d="M50 41c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9z" />
      <path {...P} d="M86 44c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4z" />
    </>
  ),
  moon: <path {...P} d="M62 18C44 22 33 38 36 56s20 30 38 27c-22 9-48-6-50-30-2-21 14-38 38-35z" />,
  satellite: (
    <>
      <path {...P} d="M42 42l16-4 4 16-16 4z" />
      <path {...P} d="M40 46L14 52l4 14 26-6M62 42l26-6 4 14-26 6" />
      <path {...P} d="M52 58l4 12M50 74c4-2 8-2 10 2" />
    </>
  ),
  constellation: (
    <>
      <polyline {...P} points="10,70 30,48 52,56 70,28 90,36" />
      <path {...P} d="M10 66v8M6 70h8M30 44v8M26 48h8M52 52v8M48 56h8M70 24v8M66 28h8M90 32v8M86 36h8" />
    </>
  ),
  comet: (
    <>
      <path {...P} d="M70 30c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9z" />
      <path {...P} d="M62 44L20 78M64 34L22 60M72 48L36 88" />
    </>
  ),
  telescope: (
    <>
      <path {...P} d="M20 52l52-22 6 14-52 22z" />
      <path {...P} d="M72 30l8-3 6 14-8 3" />
      <path {...P} d="M44 58l-12 30M48 56l4 32M46 57l18 29" />
    </>
  ),
  star: <path {...P} d="M50 14c2 20 8 30 30 36-22 4-28 14-30 36-2-22-8-32-30-36 22-6 28-16 30-36z" />,
  arrowLeft: <path {...P} d="M92 30c-20-14-50-12-70 14M22 44l-2-14M22 44l14 2" />,
  arrowRight: <path {...P} d="M8 30c20-14 50-12 70 14M78 44l2-14M78 44l-14 2" />,
  arrowDown: <path {...P} d="M40 8c-14 20-12 50 14 70M54 78l-14 2M54 78l2-14" />,
};

export default function Sketch({ kind, className = "", label }) {
  const [ref, seen] = useInViewOnce("-20px");
  return (
    <svg ref={ref} viewBox="0 0 100 100" aria-hidden={label ? undefined : "true"} role={label ? "img" : undefined} aria-label={label} className={`sketch ${seen ? "on" : ""} ${className}`}>
      {DOODLES[kind]}
    </svg>
  );
}
