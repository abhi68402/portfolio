// ─────────────────────────────────────────────────────────────────────────────
//  A tiny physics toolkit (no library). Used by the flingable name letters
//  and the skill ball pit.
// ─────────────────────────────────────────────────────────────────────────────

// Spring a value back toward 0: returns the new [position, velocity].
// k = stiffness, c = damping. Classic "mass on a spring".
export function spring(pos, vel, dt, k = 180, c = 14) {
  const acc = -k * pos - c * vel;
  vel += acc * dt;
  pos += vel * dt;
  return [pos, vel];
}

// Circles in a box with gravity, bouncing off the walls and each other.
// bodies: [{ x, y, vx, vy, r }]   box: { w, h }
export function stepCircles(bodies, box, dt, { gravity = 1400, bounce = 0.45, friction = 0.995 } = {}) {
  for (const b of bodies) {
    if (b.held) continue;
    b.vy += gravity * dt;
    b.vx *= friction;
    b.vy *= friction;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    // walls
    if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * bounce; }
    if (b.x > box.w - b.r) { b.x = box.w - b.r; b.vx = -Math.abs(b.vx) * bounce; }
    if (b.y > box.h - b.r) { b.y = box.h - b.r; b.vy = -Math.abs(b.vy) * bounce; b.vx *= 0.96; }
    if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy) * bounce; }
  }
  // circle vs circle: push apart, then exchange velocity along the contact normal
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const min = a.r + b.r;
      const d2 = dx * dx + dy * dy;
      if (d2 >= min * min || d2 === 0) continue;
      const d = Math.sqrt(d2);
      const nx = dx / d, ny = dy / d;
      const overlap = min - d;
      const ma = a.held ? 0 : a.r * a.r, mb = b.held ? 0 : b.r * b.r;
      const total = ma + mb || 1;
      a.x -= nx * overlap * (ma / total); a.y -= ny * overlap * (ma / total);
      b.x += nx * overlap * (mb / total); b.y += ny * overlap * (mb / total);
      const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (rel < 0) {
        const imp = (-(1 + bounce) * rel) / ((ma ? 1 / ma : 0) + (mb ? 1 / mb : 0) || 1);
        if (ma) { a.vx -= (imp / ma) * nx; a.vy -= (imp / ma) * ny; }
        if (mb) { b.vx += (imp / mb) * nx; b.vy += (imp / mb) * ny; }
      }
    }
  }
}
