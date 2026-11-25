// The four amber "viewfinder" brackets drawn on the corners of a box.
// Put it inside any element that has `position: relative`.
export default function HudCorners({ size = 14, className = "" }) {
  const s = { width: size, height: size };
  const base = "pointer-events-none absolute border-accent";
  return (
    <span aria-hidden="true" className={className}>
      <span style={s} className={`${base} left-0 top-0 border-l-2 border-t-2`} />
      <span style={s} className={`${base} right-0 top-0 border-r-2 border-t-2`} />
      <span style={s} className={`${base} bottom-0 left-0 border-b-2 border-l-2`} />
      <span style={s} className={`${base} bottom-0 right-0 border-b-2 border-r-2`} />
    </span>
  );
}
