// Every terminal command lives here. Each one returns a list of output lines.
// A line is either a plain string, or an object:
//   { text, tone: "accent" | "muted" }   coloured text
//   { link, text }                        clickable link
//   { image, alt }                        a picture
// Commands can also return an `action` the terminal performs (clear, exit, game…).
import { profile, about, skillGroups, projects, sections } from "../../data/content";

const pad = (s, n) => String(s).padEnd(n, " ");

export const commands = {
  help: {
    desc: "list commands",
    run: () => [
      { text: "Available commands:", tone: "accent" },
      ...visible().map(([name, c]) => `  ${pad(name, 10)} ${c.desc}`),
      { text: "Tip: ↑/↓ for history, Tab to autocomplete. There may be hidden ones…", tone: "muted" },
    ],
  },
  about: {
    desc: "who is this?",
    run: () => [{ text: profile.name, tone: "accent" }, ...about.lines, `${profile.education.degree}, ${profile.education.school} (${profile.education.year})`],
  },
  skills: {
    desc: "subsystem status",
    run: () => [
      { text: "SYSTEMS CHECK ........ ALL NOMINAL", tone: "accent" },
      ...skillGroups.map((g) => `  ${pad(g.name, 11)} ${bar(g.level)} ${g.level}%   ${g.skills.map((s) => s.name).join(", ")}`),
    ],
  },
  projects: {
    desc: "mission log",
    run: () => [
      { text: `${projects.length} missions logged:`, tone: "accent" },
      ...projects.flatMap((p, i) => [
        `  ${String(i + 1).padStart(2, "0")}  ${pad(p.title, 28)} [${p.status}]`,
        { text: `      ${p.subtitle}`, tone: "muted" },
      ]),
      { text: "Full details: type 'goto projects'", tone: "muted" },
    ],
  },
  resume: {
    desc: "download my resume",
    run: () => ({ lines: ["Fetching resume…", { link: profile.resume, text: "→ Harshit_Abhinav_Resume.pdf" }], action: "resume" }),
  },
  contact: {
    desc: "open a channel",
    run: () => [
      { link: `mailto:${profile.email}`, text: `  email     ${profile.email}` },
      { link: profile.links.linkedin, text: "  linkedin  in/harshit-abhinav" },
      { link: profile.links.github, text: "  github    github.com/abhi68402" },
    ],
  },
  launch: { desc: "launch a rocket", run: () => ({ lines: ["T-minus 3… 2… 1…", { text: "(watch the page!)", tone: "muted" }], action: "launch" }) },
  clear: { desc: "clear the screen", run: () => ({ lines: [], action: "clear" }) },
  exit: { desc: "close the terminal", run: () => ({ lines: ["Goodbye, commander."], action: "exit" }) },

  // ── hidden extras (not listed in help) ──
  ls: { hidden: true, run: () => [sections.map((s) => s.id).join("   ")] },
  goto: {
    hidden: true,
    run: (args) => {
      const id = args[0];
      if (!sections.some((s) => s.id === id)) return [`goto: unknown section '${id ?? ""}'. Try: ${sections.map((s) => s.id).join(", ")}`];
      return { lines: [`Navigating to ${id}…`], action: "goto", target: id };
    },
  },
  whoami: { hidden: true, run: () => ["a very welcome visitor (probably a recruiter with great taste)"] },
  theme: { hidden: true, run: () => ({ lines: ["Toggling daylight ops…"], action: "theme" }) },
  date: { hidden: true, run: () => [new Date().toString()] },
  echo: { hidden: true, run: (args) => [args.join(" ")] },
  sudo: {
    hidden: true,
    run: (args) =>
      args.join(" ").toLowerCase().includes("hire")
        ? [{ text: "[sudo] permission granted ✓", tone: "accent" }, "Initiating hiring sequence…", { link: `mailto:${profile.email}?subject=Let's talk`, text: `→ send the offer to ${profile.email}` }]
        : ["Nice try. This incident will be reported to Darth Vader."],
  },
  "rm": { hidden: true, run: () => ["rm: nope. This portfolio is load-bearing."] },
  bolt: {
    hidden: true,
    run: () => [
      { text: "BOLT · tiny robot · co-pilot", tone: "accent" },
      "  battery   97%",
      "  hobbies   blinking, waving, giving tips",
      "  location  bottom-right corner (it likes the view)",
    ],
  },
  hello: { hidden: true, run: () => ["General Kenobi!"] },
};

function visible() {
  return Object.entries(commands).filter(([, c]) => !c.hidden);
}

function bar(level) {
  const n = Math.round(level / 10);
  return "█".repeat(n) + "░".repeat(10 - n);
}

export function runCommand(input) {
  const [name, ...args] = input.trim().split(/\s+/);
  if (!name) return { lines: [] };
  const cmd = commands[name.toLowerCase()];
  if (!cmd) {
    return { lines: [{ text: `'${name}' isn't a command I know, but I like the curiosity. Type 'help' to see what I can do.`, tone: "muted" }] };
  }
  const out = cmd.run(args);
  return Array.isArray(out) ? { lines: out } : out;
}

export function complete(partial) {
  const p = partial.toLowerCase();
  return visible().map(([n]) => n).filter((n) => n.startsWith(p));
}
