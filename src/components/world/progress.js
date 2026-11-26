import { sections } from "../../data/content";

// Where are we in the journey? Uses the middle of the screen.
// Returns { i, frac }: section index, and how far (0..1) through it.
let tops = [];
export function measureSections() {
  tops = sections.map((s) => {
    const el = document.getElementById(s.id);
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  });
}
export function getProgress() {
  if (!tops.length) measureSections();
  const mid = window.scrollY + window.innerHeight * 0.5;
  let i = 0;
  while (i < tops.length - 1 && mid >= tops[i + 1]) i++;
  const end = i < tops.length - 1 ? tops[i + 1] : document.documentElement.scrollHeight;
  const frac = Math.max(0, Math.min(1, (mid - tops[i]) / Math.max(1, end - tops[i])));
  return { i, frac };
}
