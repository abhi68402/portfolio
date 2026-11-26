// One glowing arcade button for the whole site. Pass `href` for a link, otherwise a <button>.
// variant: "primary" (magenta, filled) | "ghost" (cyan outline)
export default function Button({ href, variant = "primary", icon, children, className = "", ...rest }) {
  const cls = `neon-btn ${variant === "primary" ? "neon-btn-primary" : "neon-btn-ghost"} ${className}`;
  const inner = (
    <>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </>
  );
  return href ? <a href={href} className={cls} {...rest}>{inner}</a> : <button type="button" className={cls} {...rest}>{inner}</button>;
}
