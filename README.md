# Harshit Abhinav · Space Notebook Portfolio

A personal portfolio styled as an engineer's mission notebook: dot-grid paper, ink text, a highlighter, taped index cards, red-pen margin notes, and hand-drawn space doodles that sketch themselves in as you scroll. It's built to be read first: everything a recruiter needs is plain, high-contrast text. The fun is light: a tiny robot co-pilot called **Bolt**, a few toys (real numbers, a live local-time sky, pet the dog, skills with receipts), an optional night-sky dark mode and hidden easter eggs.

**Stack:** React 19 · Vite · Tailwind CSS v4 · Motion (Framer Motion) · HTML5 Canvas · fully static.

---

## 1. Run it locally

You need Node.js 22 or newer (`node -v` to check).

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173. Edits show up instantly.

To check the production build:

```bash
npm run build
```

```bash
npm run preview
```

---

## 2. Edit your content (no React knowledge needed)

Almost everything lives in **`src/data/content.js`**. Search it for `TODO` to find the placeholders.

| What | Where in `content.js` |
| --- | --- |
| Name, roles that rotate in the hero, tagline, location, email, links | `profile` |
| About text and hobbies | `about` |
| Skill groups and levels (0–100); listed in the Toolkit section | `skillGroups` |
| What Bolt the robot says (hello, per-section lines, tips) | `robot` |
| The "now building" tile in the hero | `nowBuilding` |
| "Right now" card in About: what you're doing, what you're looking for, where you're based | `rightNow` |
| Hero "By the numbers" figures | `stats` |
| "Strengths" (personal skills) in the Skills section | `strengths` |
| Which project proves each skill (receipts) | `src/data/proof.js` |
| Projects (add, remove, reorder; `featured: true` gets tape; `note` is the red-pen scribble; `photo` names an optional screenshot, currently unused) | `projects` |
| Internships and jobs | `experience` |
| Certifications (set to `[]` to hide the section) | `certifications` |
| Navbar labels and stage names | `sections` |

**Other things to replace:**

- **Resume:** put your PDF at `public/resume/Harshit_Abhinav_Resume.pdf` (same name, overwrite the placeholder).
- **Contact form:** by default it opens the visitor's email app. To receive messages directly, make a free form at [formspree.io](https://formspree.io), copy the ID (the part after `/f/`), and paste it into `profile.formspreeId`.
- **Photos:** originals live in `assets-src/photos/` (`hero`, `fun`). Replace one with the same name, then run `npm run images` to rebuild the compressed versions and the link-preview image.
- **Project screenshots (currently unused):** `assets-src/projects/vyu.png` is a real screenshot of cinevyu.site; the other projects use generated covers (drawn in `scripts/optimize-images.mjs`, labelled "Project cover"). To use your own screenshot, save it as `assets-src/projects/<project id>.png` (it replaces the cover automatically), then run `npm run images`. Each project's `photo` field in `content.js` names the output (`proj-<id>`).
- **Your URL:** after deploying, replace `harshit-abhinav.vercel.app` in `index.html`, `public/robots.txt` and `public/sitemap.xml`.

---

## 3. How the code is organised

```
index.html                 title, SEO + LinkedIn preview tags
public/                    files served as-is: photos, resume, og-image, favicon, robots
scripts/optimize-images.mjs  crops + compresses photos, builds og-image.jpg
src/
  main.jsx                 starts the app, loads fonts and CSS
  App.jsx                  page order; loads Bolt + terminal; backtick shortcut
  index.css                paper/ink colour tokens (light + night), cards, buttons, highlighter, doodle animation
  data/content.js          ALL your text and data
  hooks/                   active section, safe localStorage, scrolling
  components/
    layout/                Navbar, Footer, SectionFrame (the "Log entry 0X" header + highlighter title)
    notebook/              Sketch (hand-drawn space doodles), Highlight, MarginNote, useInViewOnce
    sections/              Hero (+ HeroTiles), About, Skills, Projects, Experience, Certifications, Contact
    skills/                (skills now live in sections/Skills.jsx + data/proof.js)
    projects/              index-card ProjectCard, filters, details modal
    robot/Robot.jsx        Bolt, the tiny robot co-pilot
    fun/                   Toasts, Konami Rocket, useVisitorReactions
    terminal/              commands.js (what each command prints) + Terminal.jsx
    ui/                    Button, Badge, Modal, Photo
```

**In plain words:**

- **`content.js` is the database.** Components just read it and draw it.
- **Theme:** light notebook by default; the moon button switches to a night-sky mode with a starfield (`notebook/Starfield.jsx`). The choice is remembered. Every colour is a token at the top of `index.css`.
- **Doodles** (`notebook/Sketch.jsx`) are small SVG drawings. Each path has `pathLength="1"`, so CSS can animate the stroke from hidden to drawn when it scrolls into view.
- **The highlighter** (`Highlight.jsx`) is a yellow background that grows from 0% to 100% width the first time the words are seen.
- **Bolt** (`robot/Robot.jsx`) is one SVG. Its pupils move toward your cursor, it blinks on a timer, waves on arrival, says one line per section, gives a tip on click and dozes after a minute idle. It never moves around or covers content; the × or the footer hides it.

### Fun bits

- Hero tiles: **Now building** progress, **By the numbers** (real figures that count up), and **My local time** (a sun or moon crosses a little sky as the day passes in India, with what I'm probably doing and how far ahead or behind the visitor is; time zone is `profile.timezone`).
- **Pet the dog** in About (hearts + a pet counter).
- **Toolkit:** click a skill marked ↗ to see the project that proves it.
- **Polish:** cards you hover come forward while the rest fade back, a soft desk-lamp glow follows the cursor, buttons have a springy feel, the email copy button morphs to "Copied", and the footer links to every earlier version of the site.
- **Flight record:** a little rocket climbs the dashed flight path as you scroll.
- **Contact:** sending folds your note into a paper plane.
- **Badges** spin when you hover them.

### Easter eggs

- Press `` ` `` anywhere (or click `>_` in the footer) for the terminal. Try `help`, then the hidden ones: `sudo hire harshit`, `goto projects`, `hello`, `bolt`, `launch`.
- The Konami code (↑↑↓↓←→←→BA) launches a doodle rocket.
- Switch tabs and the title waves at you; returning visitors get a welcome back.

---

## 4. Deploy to Vercel (free)

1. **Put the code on GitHub.** In this folder:
   ```bash
   git init
   ```
   ```bash
   git add . && git commit -m "Portfolio"
   ```
   Then create an empty repo on github.com (for example `portfolio`) and run the two commands GitHub shows you (`git remote add origin ...` and `git push -u origin main`).
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New → Project**, pick your `portfolio` repo, and click **Import**.
4. Vercel detects Vite automatically (build command `npm run build`, output folder `dist`). Click **Deploy**.
5. In about a minute you get a URL like `portfolio-xyz.vercel.app`. Under **Settings → Domains** you can rename it (for example `harshit-abhinav.vercel.app`) or add your own domain.
6. Put that final URL into `index.html`, `public/robots.txt` and `public/sitemap.xml`, commit and push. Vercel redeploys on every push.
7. Check the LinkedIn preview at [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/).

**Alternative, GitHub Pages:** run `npm run build` and publish the `dist/` folder (for example with the `gh-pages` package). If the site lives at `username.github.io/portfolio/`, add `base: "/portfolio/"` to `vite.config.js`.

---

## 5. Quality notes

- Everything a recruiter needs is plain, high-contrast text on solid paper; the doodles are decoration in the margins.
- Everything works with the keyboard; Esc closes every overlay; focus returns where it was.
- With "reduce motion" turned on in the OS, doodles and highlights appear already drawn and all animations are instant.
- Photos are served as WebP in three sizes; only the hero loads eagerly.
