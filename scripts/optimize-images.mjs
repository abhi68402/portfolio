// One-off image pipeline. Run with: npm run images
// Reads the original photos in assets-src/photos/, crops them to a 4:5 portrait,
// and writes small WebP + JPG versions into public/photos/ (what the site loads).
// It also builds public/og-image.jpg, the preview card LinkedIn shows for your link.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "assets-src/photos";
const OUT = "public/photos";
const WIDTHS = [480, 800, 1200];

// crop: how to cut each photo down to 4:5. "extract" picks an exact box (in original pixels).
const photos = {
  hero: { extract: { left: 0, top: 330, width: 1126, height: 1407 } },
  fun: { position: "center" },
  offduty: { position: "top" },
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

// Open Graph image: 1200×630, dark console panel with the hero photo on the right.
const photo = await sharp(`${SRC}/hero.jpg`)
  .resize({ width: 504, height: 630, fit: "cover", position: "top" })
  .toBuffer();

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#1E232B" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#0B0D10"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g font-family="Menlo, monospace" fill="#8A93A3" font-size="20" letter-spacing="3">
    <text x="64" y="92">MOD 01 · FLIGHT DIRECTOR</text>
    <text x="64" y="560">AI · FULL STACK · SYSTEMS · IOT</text>
  </g>
  <circle cx="72" cy="140" r="7" fill="#FFB224"/>
  <text x="92" y="147" font-family="Menlo, monospace" font-size="20" fill="#FFB224" letter-spacing="3">SYS: ONLINE</text>
  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700" fill="#F2F4F7">
    <text x="60" y="290" font-size="96" letter-spacing="-3">Harshit</text>
    <text x="60" y="390" font-size="96" letter-spacing="-3">Abhinav</text>
  </g>
  <text x="64" y="460" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="30" fill="#C4CAD4">I build models, systems &amp; the web.</text>
  <path d="M60 520H640" stroke="#FFB224" stroke-width="2"/>
</svg>`;

// Viewfinder corner brackets drawn on top of the photo.
const brackets = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <path d="M708 28h32M708 28v32M1172 28h-32M1172 28v32M708 602h32M708 602v-32M1172 602h-32M1172 602v-32" stroke="#FFB224" stroke-width="3" fill="none"/>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([{ input: photo, left: 684, top: 0 }, { input: Buffer.from(brackets), left: 0, top: 0 }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/og-image.jpg");
console.log("✓ og-image");
