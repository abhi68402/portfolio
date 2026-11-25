// Small tech tag, e.g. "React" on a project card.
export default function Badge({ children }) {
  return (
    <span className="rounded border border-line bg-panel-2 px-2 py-0.5 font-mono text-[0.7rem] text-muted">
      {children}
    </span>
  );
}
