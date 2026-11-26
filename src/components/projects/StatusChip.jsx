// LIVE / SHIPPED / R&D stamp on each project.
export default function StatusChip({ status }) {
  const live = status === "LIVE";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border-2 px-1.5 py-0.5 font-mono text-[0.68rem] font-semibold tracking-wider ${live ? "border-blue text-blue" : "border-line-strong text-muted"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "pulse-dot bg-blue" : status === "R&D" ? "border border-current" : "bg-current"}`} />
      {status}
    </span>
  );
}
