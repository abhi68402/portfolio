import Sketch from "./Sketch";

// A handwritten red-pen note with a little arrow, like scribbles in a notebook.
// arrow: "left" | "right" | "down" | null
export default function MarginNote({ children, arrow = "left", className = "", color = "text-red" }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none select-none items-center gap-1 font-hand text-xl leading-none ${className.includes("hidden") ? "" : "inline-flex"} ${color} ${className}`}>
      {arrow === "left" && <Sketch kind="arrowLeft" className="h-8 w-10 shrink-0" />}
      {arrow === "down" && <Sketch kind="arrowDown" className="h-10 w-8 shrink-0" />}
      <span className="-rotate-2">{children}</span>
      {arrow === "right" && <Sketch kind="arrowRight" className="h-8 w-10 shrink-0" />}
    </span>
  );
}
