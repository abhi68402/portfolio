// One button style for the whole site. Pass `href` to get a link, otherwise a <button>.
// variant: "primary" (amber fill) | "ghost" (outlined)
export default function Button({ href, variant = "primary", icon, children, className = "", ...rest }) {
  const styles = {
    primary: "bg-accent-fill text-accent-ink border-accent-fill hover:brightness-110",
    ghost: "border-line-strong text-text hover:border-accent hover:text-accent",
  };
  const cls = `group inline-flex items-center gap-2 rounded-md border px-4 py-2.5 font-mono text-[0.8rem] font-semibold uppercase tracking-[0.12em] transition ${styles[variant]} ${className}`;
  const inner = (
    <>
      {icon && <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">{icon}</span>}
      {children}
    </>
  );
  return href ? (
    <a href={href} className={cls} {...rest}>{inner}</a>
  ) : (
    <button type="button" className={cls} {...rest}>{inner}</button>
  );
}
