// One ink-pen button style for the whole site. Pass `href` for a link, otherwise a <button>.
// variant: "primary" (blue ink) | "ghost" (paper)
export default function Button({ href, variant = "primary", icon, children, className = "", ...rest }) {
  const cls = `btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${className}`;
  const inner = (
    <>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </>
  );
  return href ? <a href={href} className={cls} {...rest}>{inner}</a> : <button type="button" className={cls} {...rest}>{inner}</button>;
}
