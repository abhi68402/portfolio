# Harshit Abhinav · Mission Control Portfolio

A personal portfolio styled as a ground-station console. Recruiters get name, skills, projects, experience, resume and contact on a normal scrolling page. The extras (a minigame and a hidden terminal) only load when someone opens them.

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
| Skill groups and levels (0–100) | `skillGroups` |
| Words that fall in the minigame | `gameSkills` |
| Projects (add, remove, reorder; `featured: true` gets the amber edge) | `projects` |
| Internships and jobs | `experience` |
| Certifications (set to `[]` to hide the section) | `certifications` |
| Navbar labels and section codenames | `sections` |

**Other things to replace:**

- **Resume:** put your PDF at `public/resume/Harshit_Abhinav_Resume.pdf` (same name, overwrite the placeholder).
- **Contact form:** by default it opens the visitor's email app. To receive messages directly, make a free form at [formspree.io](https://formspree.io), copy the ID (the part after `/f/`), and paste it into `profile.formspreeId`.
- **Photos:** originals live in `assets-src/photos/` (`hero`, `about`, `fun`, `offduty`). Replace one with the same name, then run `npm run images` to rebuild the compressed versions and the link-preview image.
- **Your URL:** after deploying, replace `harshit-abhinav.vercel.app` in `index.html`, `public/robots.txt` and `public/sitemap.xml`.

---

## 3. How the code is organised

```
index.html                 page title, SEO + LinkedIn preview tags, theme picked before paint
public/                    files served as-is: photos, resume, og-image, favicon, robots
scripts/optimize-images.mjs  crops + compresses photos, builds og-image.jpg
src/
  main.jsx                 starts the app, loads fonts and CSS
  App.jsx                  page order; opens the game/terminal; backtick shortcut
  index.css                colour tokens for dark/light, HUD styles, reduced-motion rules
  data/content.js          ALL your text and data
  hooks/                   small helpers: theme, active section, safe localStorage, scrolling
  components/
    layout/                Navbar, Footer, SectionFrame (the "MOD 0X" wrapper)
    ui/                    Button, Badge, Modal, Photo, HudCorners
    sections/              one file per section: Hero, About, Skills, Projects, ...
    hero/StarfieldCanvas   the animated stars + orbits behind the hero
    skills/                RadarChart (plain SVG) and GaugeBar
    projects/              cards, filters, details modal, status chip, signal trace
    game/                  engine.js (the game loop) + SkillCatcher.jsx (its window)
    terminal/              commands.js (what each command prints) + Terminal.jsx
```

**In plain words:**

- **`content.js` is the database.** Components just read it and draw it.
- **`SectionFrame`** gives every section the same console header (`MOD 04 · MISSION LOG`) and fades it in once.
- **Theme:** `index.html` sets `data-theme="dark"` or `"light"` on `<html>` before anything paints. `index.css` swaps every colour based on that. The toggle saves your choice in localStorage (wrapped in try/catch so private windows don't break).
- **The game** (`engine.js`) is plain JavaScript: each frame it moves the catcher, spawns falling skills, checks collisions and draws to a `<canvas>`. React only shows the score and the start/end screens.
- **The terminal** is a list of commands in `commands.js`. To add one, copy an entry and change its text. Entries with `hidden: true` don't appear in `help`.
- **Speed:** the game, the terminal and the heavier animation code are split into separate files that only download when needed.

### Easter eggs

- Press `` ` `` anywhere (or click `>_` in the footer) for the terminal. Try `help`, then the hidden ones: `sudo hire harshit`, `goto projects`, `theme`, `hello`.

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

- Lighthouse (mobile, production build): Performance 94 · Accessibility 100 · Best Practices 100 · SEO 100.
- Everything works with the keyboard; Esc closes every overlay; focus returns where it was.
- With "reduce motion" turned on in the OS, the starfield freezes, typing effects stop and transitions are instant.
- Photos are served as WebP in three sizes; only the hero loads eagerly.
