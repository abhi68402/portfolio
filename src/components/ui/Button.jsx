// One chunky pixel button for the whole site. Pass `href` to get a link, otherwise a <button>.
// variant: "primary" (amber) | "ghost" (panel coloured)
export default function Button({ href, variant = "primary", icon, children, className = "", ...rest }) {
  const cls = `px-btn ${variant === "primary" ? "px-btn-primary" : "px-btn-ghost"} ${className}`;
  const inner = (
    <>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </>
  );
  return href ? (
    <a href={href} className={cls} {...rest}>{inner}</a>
  ) : (
    <button type="button" className={cls} {...rest}>{inner}</button>
  );
}
