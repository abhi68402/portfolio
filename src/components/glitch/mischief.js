// ─────────────────────────────────────────────────────────────────────────────
//  What Glitch gets up to. Every few seconds Glitch.jsx calls pickMischief(),
//  which chooses one trick based on what's on screen right now.
//  Everything here is visual only: no real text or content is ever changed.
// ─────────────────────────────────────────────────────────────────────────────
import { glitch as LINES, projects } from "../../data/content";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const onScreen = (el) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.top > 80 && r.bottom < window.innerHeight - 20 && r.left > 0 && r.right < window.innerWidth;
};

export function pickMischief(b, api) {
  const tricks = [];
  const chewable = [...document.querySelectorAll("[data-chewable]")].filter(onScreen);
  const cards = [...document.querySelectorAll("#main .neon-panel")].filter((el) => onScreen(el) && el.offsetWidth < 520);
  const name = document.querySelector("#hero-name h1");
  const p = api.pointer();

  if (chewable.length) tricks.push(["nibble", 4]);
  if (cards.length) tricks.push(["shove", 3], ["burrow", 1]);
  if (name && onScreen(name)) tricks.push(["kick", 3]);
  if (api.fine && p.still > 1.2 && p.x > 0 && !document.elementFromPoint(p.x, p.y)?.closest("a, button, input, textarea")) tricks.push(["steal", 4]);
  if (!tricks.length) return;

  // weighted random choice
  const total = tricks.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total, choice = tricks[0][0];
  for (const [name, w] of tricks) { if ((r -= w) <= 0) { choice = name; break; } }

  if (choice === "nibble") {
    // walk to a heading and chew on it
    const el = pick(chewable);
    const rect = el.getBoundingClientRect();
    const x = rect.left + Math.random() * rect.width, y = rect.top + rect.height / 2;
    api.goTo(b, x, y, () => {
      api.say(b, "*nom nom nom*");
      api.bite(el);
      const proj = projects.find((pr) => pr.title === el.textContent);
      api.busy(b, 1.6, () => { if (proj?.quip) api.say(b, proj.quip, 3800); });
    });
  } else if (choice === "shove") {
    // shove a card so it wobbles
    const el = pick(cards);
    const rect = el.getBoundingClientRect();
    const fromLeft = Math.random() < 0.5;
    api.goTo(b, fromLeft ? rect.left + 4 : rect.right - 4, rect.top + rect.height * (0.3 + Math.random() * 0.4), () => {
      const dir = fromLeft ? 1 : -1;
      el.animate(
        [{ transform: "none" }, { transform: `translateX(${dir * 14}px) rotate(${dir * 3}deg)` }, { transform: `translateX(${-dir * 5}px) rotate(${-dir}deg)` }, { transform: "none" }],
        { duration: 650, easing: "cubic-bezier(.3,1.6,.5,1)" },
      );
      api.say(b, pick(["hup!", "oops", "*shove*", "boop"]));
      api.busy(b, 0.6);
    }, 200);
  } else if (choice === "kick") {
    // run into the hero name and scatter the letters
    const rect = name.getBoundingClientRect();
    api.goTo(b, rect.left + rect.width * (0.2 + Math.random() * 0.6), rect.top + rect.height / 2, () => {
      window.dispatchEvent(new Event("kick-letters"));
      api.say(b, "oops… was that your name?", 2600);
      api.busy(b, 0.8);
    }, 240);
  } else if (choice === "steal") {
    api.goTo(b, p.x, p.y, () => {
      // only if the mouse is still sitting there
      if (api.pointer().still > 0.8) api.stealCursor(b);
    }, 230);
  } else if (choice === "burrow") {
    // dive into a card and pop out of another one a few seconds later
    const a = pick(cards), z = pick(cards);
    const ra = a.getBoundingClientRect(), rz = z.getBoundingClientRect();
    api.goTo(b, ra.right - 12, ra.bottom - 12, () => {
      api.say(b, "you can't see me…");
      b.mode = "hidden"; b.timer = 4.5;
      b.peekX = rz.left + 14; b.peekY = rz.top + 14;
    });
  }
}

export { LINES };
