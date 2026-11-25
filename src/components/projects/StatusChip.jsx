// LIVE / SHIPPED / R&D label on each project.
export default function StatusChip({ status }) {
  const live = status === "LIVE";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[0.62rem] tracking-widest ${live ? "border-accent text-accent" : "border-line-strong text-muted"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "pulse-dot bg-accent-fill" : status === "R&D" ? "border border-current" : "bg-current"}`} />
      {status}
    </span>
  );
}
