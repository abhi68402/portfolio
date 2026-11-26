# Harshit Abhinav · Neon Arcade Portfolio

A personal portfolio styled as a neon arcade. Recruiters get name, skills, projects, experience, resume and contact on a normal scrolling page. Everyone else also gets a living synthwave backdrop, a name you can fling around, a skill ball pit, throwable cards, **Glitch** (a mischievous bug that roams the page), the **Bug Blitz** mini-game, and a pile of easter eggs. A **Pause chaos** switch in the navbar calms it all down.

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
| Skill groups and levels (0–100); these also become the ball-pit balls | `skillGroups` |
| What Glitch says (taunts, squash lines…) | `glitch` |
| Projects (add, remove, reorder; `featured: true` gets the magenta frame; `quip` is what Glitch says when it chews the card) | `projects` |
| Internships and jobs | `experience` |
| Certifications (set to `[]` to hide the section) | `certifications` |
| Navbar labels and stage names | `sections` |

**Other things to replace:**

- **Resume:** put your PDF at `public/resume/Harshit_Abhinav_Resume.pdf` (same name, overwrite the placeholder).
- **Contact form:** by default it opens the visitor's email app. To receive messages directly, make a free form at [formspree.io](https://formspree.io), copy the ID (the part after `/f/`), and paste it into `profile.formspreeId`.
- **Photos:** originals live in `assets-src/photos/` (`hero`, `fun`). Replace one with the same name, then run `npm run images` to rebuild the compressed versions and the link-preview image.
- **Your URL:** after deploying, replace `harshit-abhinav.vercel.app` in `index.html`, `public/robots.txt` and `public/sitemap.xml`.

---

## 3. How the code is organised

```
index.html                 title, SEO + LinkedIn preview tags, theme picked before paint
public/                    files served as-is: photos, resume, og-image, favicon, robots
scripts/optimize-images.mjs  crops + compresses photos, builds og-image.jpg
src/
  main.jsx                 starts the app, loads fonts and CSS
  App.jsx                  page order; loads the fun layers; terminal shortcut; spotlight + sparks
  index.css                neon colour tokens (dark/light), panels, buttons, CRT, effects
  data/content.js          ALL your text and data
  hooks/                   theme, chaos switch, active section, safe localStorage, scrolling
  components/
    layout/                Navbar (with Pause chaos), Footer, SectionFrame (the "STAGE 0X" sign)
    ui/                    Button, Badge, Modal, Photo
    sections/              one file per section: Hero, About, Skills, Projects, ...
    neon/                  NeonGrid.jsx (the synthwave backdrop) + palettes.js (colours per section)
    physics/               physics.js (springs, circles), KineticName.jsx (fling the letters), BallPit.jsx
    glitch/                sprite.js (the bug, drawn in code), Glitch.jsx (movement, squashing), mischief.js (its tricks)
    blitz/                 BugBlitz.jsx (the 30-second mini-game)
    fun/                   Toasts, Screensaver, useVisitorReactions (visits, tab title, shake, Konami), rainbow mode
    projects/              cards (tilt + throw), filters, details modal
    terminal/              commands.js (what each command prints) + Terminal.jsx
```

**In plain words:**

- **`content.js` is the database.** Components just read it and draw it.
- **Theme:** `index.html` picks dark or light before anything paints (your saved choice, otherwise light by day and dark at night). `index.css` swaps every colour from that.
- **The backdrop** (`NeonGrid.jsx`) draws the sun, mountains and a perspective grid on a canvas ~30 times a second. Scroll speed drives the grid, the cursor dents it, clicks ripple it, and each section has its own palette.
- **Physics** (`physics.js`) is a few lines of springs and bouncing circles. `KineticName` turns each letter into a body you can fling; `BallPit` drops every skill into a box with gravity.
- **Glitch** (`Glitch.jsx`) steers one to three bugs around the screen. Every few seconds `mischief.js` picks a trick based on what's visible: chew a heading, shove a card, kick your name, steal an idle cursor, or burrow into a card. Clicking a bug squashes it before the click reaches the page.
- **Bug Blitz** covers the page with a click-catching layer, spawns bugs for 30 s and scores your squashes.
- **Pause chaos** (`hooks/useChaos.js`) removes Glitch, the CRT scanlines and click sparks, and is remembered.
- **Speed:** the backdrop, Glitch, the game and the terminal are split into separate files that load after the page is ready or when opened.

### Glitch, the chaos bug

- Click/tap it to squash it. It comes back faster. 5 squashes = Exterminator; 10 = it surrenders and unlocks rainbow mode.
- It chews headings (the text grows back), shoves cards, scatters your name, steals your cursor if you leave the mouse still (move the mouse to get it back), and hides inside cards.
- Ignore it for 40 seconds and it brings a friend (up to three).

### Bug Blitz

Squash as many bugs as you can in 30 s. Fast squashes build a combo (up to ×5), golden bugs are worth 5, a crowned boss takes 5 hits (15 points), and bombs cost 10. Esc quits.

### Easter eggs and reactions

- Press `` ` `` anywhere (or click `>_` in the footer) for the terminal. Try `help`, then the hidden ones: `sudo hire harshit`, `goto projects`, `theme`, `hello`, `bugs`, `squash`, `blitz`, `chaos off`.
- Konami code (↑↑↓↓←→←→BA) toggles rainbow mode.
- The hero greets you by time of day; returning visitors get a welcome-back with their visit number.
- Switch tabs and the title changes; come back and you get a toast.
- Scroll very fast for warp speed; shake the browser window for an earthquake; sit idle for 30 s for the arcade screensaver.

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

- Everything a recruiter needs is plain text in the page; the fun layers are decoration on top and can be paused.
- Everything works with the keyboard; Esc closes every overlay; focus returns where it was.
- With "reduce motion" turned on in the OS, chaos starts paused, the backdrop is a still image, and animations are instant.
- Photos are served as WebP in three sizes; only the hero loads eagerly.
