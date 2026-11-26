// Small tech tag, e.g. "React" on a project card.
export default function Badge({ children }) {
  return (
    <span className="inline-block border-2 border-line-strong bg-panel-2 px-1.5 py-0.5 font-mono text-[0.7rem] text-muted">
      {children}
    </span>
  );
}
