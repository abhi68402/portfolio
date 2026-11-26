// One-off image pipeline. Run with: npm run images
// Reads the original photos in assets-src/photos/, crops them to a 4:5 portrait,
// and writes small WebP + JPG versions into public/photos/ (what the site loads).
// It also builds public/og-image.jpg, the preview card LinkedIn shows for your link.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const SRC = "assets-src/photos";
const OUT = "public/photos";
const WIDTHS = [480, 800, 1200];

// crop: how to cut each photo down to 4:5. "extract" picks an exact box (in original pixels).
const photos = {
  hero: { extract: { left: 0, top: 330, width: 1126, height: 1407 } },
  fun: { position: "center" },
};

await mkdir(OUT, { recursive: true });

for (const [name, opt] of Object.entries(photos)) {
  for (const w of WIDTHS) {
    let img = sharp(`${SRC}/${name}.jpg`).rotate();
    if (opt.extract) img = img.extract(opt.extract);
    img = img.resize({ width: w, height: Math.round(w * 1.25), fit: "cover", position: opt.position ?? "center" });
    await img.clone().webp({ quality: 74 }).toFile(`${OUT}/${name}-${w}.webp`);
    if (w === 800) await img.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(`${OUT}/${name}.jpg`);
  }
  console.log("✓", name);
}

// ---- Project photos (4:3), used by the About photo stack ----
// vyu is a real screenshot of cinevyu.site (assets-src/projects/vyu.png).
// The others are generated covers in the site palette (clearly covers, not screenshots).
// TODO: drop your own screenshot at assets-src/projects/<id>.png (e.g. sigrun.png) and it is
// used instead of the generated cover, cropped to 4:3 and compressed the same way.
const PROJ = "assets-src/projects";
const ink = "#1B2232", blue = "#2448B8", paper = "#F8F5EE", line = "#CFC3AA", hl = "#FFE066", red = "#B8322B";
const frame = (title, sub, art) => `
<svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
  <defs><pattern id="d" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="${blue}" fill-opacity="0.17"/></pattern></defs>
  <rect width="1200" height="900" fill="${paper}"/><rect width="1200" height="900" fill="url(#d)"/>
  <g font-family="Menlo, monospace" font-size="22" letter-spacing="4" fill="#586174"><text x="72" y="96">PROJECT COVER</text></g>
  <rect x="68" y="610" width="${Math.min(1060, 30 + title.length * 46)}" height="30" fill="${hl}" opacity="0.9"/>
  <text x="72" y="640" font-family="Georgia, serif" font-weight="700" font-size="76" fill="${ink}">${title}</text>
  <text x="72" y="706" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="34" fill="#586174">${sub}</text>
  <path d="M72 760H1128" stroke="${line}" stroke-width="2" stroke-dasharray="10 10"/>
  <g>${art}</g>
</svg>`;
const covers = {
  sigrun: frame("Sigrun", "A RISC-V kernel that asks first", `
    <g fill="none" stroke="${ink}" stroke-width="4" stroke-linejoin="round">
      <rect x="260" y="150" width="680" height="84" rx="14" fill="#fffdf8"/>
      <rect x="260" y="290" width="680" height="84" rx="14" fill="#fffdf8"/>
      <rect x="260" y="430" width="680" height="84" rx="14" fill="${hl}" fill-opacity="0.6"/>
      <path d="M600 234v56M600 374v56" stroke="${blue}" stroke-width="5"/>
    </g>
    <g font-family="Menlo, monospace" font-size="30" fill="${ink}" text-anchor="middle">
      <text x="600" y="203">AI agent</text><text x="600" y="343">Sigrun kernel</text><text x="600" y="483">CPU · RISC-V</text></g>
    <text x="990" y="338" font-family="Georgia, serif" font-style="italic" font-size="34" fill="${red}">ask first</text>`),
  "nasa-rul": frame("Jet Engine RUL", "BiLSTM predictive maintenance", `
    <g fill="none" stroke="${ink}" stroke-width="4"><path d="M170 140V520H1040"/></g>
    <path d="M190 190C330 200 430 210 560 260S800 420 1010 500" fill="none" stroke="${blue}" stroke-width="6" stroke-linecap="round"/>
    <path d="M190 240C330 235 450 255 580 290S800 400 1010 480" fill="none" stroke="${red}" stroke-width="4" stroke-dasharray="14 12" stroke-linecap="round"/>
    <g font-family="Menlo, monospace" font-size="26" fill="#586174"><text x="190" y="140">RUL</text><text x="900" y="560">cycles</text></g>
    <g font-family="Menlo, monospace" font-size="26"><text x="620" y="200" fill="${blue}">true</text><text x="620" y="236" fill="${red}">predicted</text></g>`),
  "hyd-days": frame("8bitHyd", "A living pixel city on real map data", (() => {
    let r = ""; const cols = ["#2448B8", "#8FB0FF", "#FFE066", "#CFC3AA", "#1B2232", "#B8322B"];
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let x = 0; x < 16; x++) for (let y = 0; y < 8; y++) {
      if (rnd() < 0.22) continue;
      const h = 1 + Math.floor(rnd() * 3);
      r += `<rect x="${150 + x * 56}" y="${150 + y * 52}" width="48" height="${h * 14 + 20}" fill="${cols[Math.floor(rnd() * cols.length)]}" fill-opacity="0.85"/>`;
    }
    return r;
  })()),
  clearsight: frame("Project ClearSight", "Real-time sharpening by distillation", `
    <rect x="150" y="160" width="360" height="320" rx="14" fill="#fffdf8" stroke="${ink}" stroke-width="4"/>
    <rect x="690" y="160" width="360" height="320" rx="14" fill="#fffdf8" stroke="${ink}" stroke-width="4"/>
    <g stroke="${ink}" stroke-opacity="0.35" stroke-width="22" stroke-linecap="round"><path d="M200 260H460M200 330H400M200 400H430"/></g>
    <g stroke="${ink}" stroke-width="6" stroke-linecap="round"><path d="M740 260H1000M740 330H940M740 400H970"/></g>
    <path d="M560 320H640M616 296l24 24-24 24" fill="none" stroke="${blue}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <g font-family="Menlo, monospace" font-size="26" fill="#586174" text-anchor="middle"><text x="330" y="530">blurry</text><text x="870" y="530">sharp</text></g>`),
  ecobin: frame("EcoBin", "IoT fill-level monitoring, campus-wide", (() => {
    let r = ""; const lv = [0.3, 0.75, 0.5, 0.92, 0.18];
    lv.forEach((v, i) => {
      const x = 170 + i * 180;
      r += `<rect x="${x}" y="170" width="120" height="330" rx="14" fill="#fffdf8" stroke="${ink}" stroke-width="4"/>
        <rect x="${x + 8}" y="${170 + 322 - 314 * v}" width="104" height="${314 * v}" rx="8" fill="${v > 0.85 ? red : blue}" fill-opacity="0.75"/>
        <path d="M${x - 10} 170H${x + 130}" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>`;
    });
    return r + `<g font-family="Menlo, monospace" font-size="26" fill="#586174"><text x="170" y="545">ultrasonic fill level → ThingSpeak</text></g>`;
  })()),
};

await mkdir(OUT, { recursive: true });
const projectSources = {
  vyu: sharp(`${PROJ}/vyu.png`).extract({ left: 640, top: 110, width: 600, height: 450 }),
  ...Object.fromEntries(Object.entries(covers).map(([k, svg]) => [
    k,
    existsSync(`${PROJ}/${k}.png`) ? sharp(`${PROJ}/${k}.png`) : sharp(Buffer.from(svg), { density: 96 }),
  ])),
};
for (const [id, base] of Object.entries(projectSources)) {
  const buf = await base.png().toBuffer();
  for (const w of WIDTHS) {
    const img = sharp(buf).resize({ width: w, height: Math.round(w * 0.75), fit: "cover" });
    await img.clone().webp({ quality: 78 }).toFile(`${OUT}/proj-${id}-${w}.webp`);
    if (w === 800) await img.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}/proj-${id}.jpg`);
  }
  console.log("✓ proj-" + id);
}

// Open Graph image: 1200×630, dark console panel with the hero photo on the right.
const photo = await sharp(`${SRC}/hero.jpg`)
  .resize({ width: 504, height: 630, fit: "cover", position: "top" })
  .toBuffer();

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#E4DCCB" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#F8F5EE"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g font-family="Menlo, monospace" fill="#586174" font-size="20" letter-spacing="3">
    <text x="64" y="92">MISSION LOG · PAGE 01</text>
    <text x="64" y="560">AI · FULL STACK · SYSTEMS · IOT</text>
  </g>
  <circle cx="72" cy="140" r="7" fill="#2448B8"/>
  <text x="92" y="147" font-family="Menlo, monospace" font-size="20" fill="#2448B8" letter-spacing="3">AI / ML · OPEN TO ROLES · 2026</text>
  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700" fill="#1B2232">
    <text x="60" y="290" font-size="96" letter-spacing="-3">Harshit</text>
    <text x="60" y="390" font-size="96" letter-spacing="-3">Abhinav</text>
  </g>
  <text x="64" y="460" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="30" fill="#1B2232">AI / ML engineer: models that ship.</text>
  <path d="M60 520H640" stroke="#2448B8" stroke-width="2"/>
</svg>`;

// Viewfinder corner brackets drawn on top of the photo.
const brackets = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <path d="M708 28h32M708 28v32M1172 28h-32M1172 28v32M708 602h32M708 602v-32M1172 602h-32M1172 602v-32" stroke="#2448B8" stroke-width="3" fill="none"/>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([{ input: photo, left: 684, top: 0 }, { input: Buffer.from(brackets), left: 0, top: 0 }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/og-image.jpg");
console.log("✓ og-image");
