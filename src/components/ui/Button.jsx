// One ink-pen button style for the whole site. Pass `href` for a link, otherwise a <button>.
// variant: "primary" (blue ink) | "ghost" (paper)
// icon: "download" | "arrow" | "mail" (drawn as SVG so it looks the same on
// every device; text symbols like ✉ fall back to tiny system glyphs).
const ICONS = {
  download: <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" />,
  arrow: <path d="M5 12h13m0 0-5-5m5 5-5 5" />,
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
};

export default function Button({ href, variant = "primary", icon, children, className = "", ...rest }) {
  const cls = `btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${className}`;
  const inner = (
    <>
      {icon && ICONS[icon] && (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[1.1em] w-[1.1em] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {ICONS[icon]}
        </svg>
      )}
      {children}
    </>
  );
  return href ? <a href={href} className={cls} {...rest}>{inner}</a> : <button type="button" className={cls} {...rest}>{inner}</button>;
}
