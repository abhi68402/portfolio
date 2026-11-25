// Responsive photo: the browser picks the smallest WebP that looks sharp,
// with a JPG fallback. Lazy-loaded unless `priority` is set (only the hero).
export default function Photo({ name, alt, sizes = "(min-width: 1024px) 400px, 90vw", priority = false, className = "" }) {
  const set = [480, 800, 1200].map((w) => `/photos/${name}-${w}.webp ${w}w`).join(", ");
  return (
    <picture>
      <source type="image/webp" srcSet={set} sizes={sizes} />
      <img
        src={`/photos/${name}.jpg`}
        alt={alt}
        width="800"
        height="1000"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={`h-full w-full object-cover ${className}`}
      />
    </picture>
  );
}
