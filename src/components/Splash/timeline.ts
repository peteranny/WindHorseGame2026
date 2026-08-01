// The splash plays as one continuous short movie (~10s hands-off), in order -
// void, then a spark, then a big-bang burst of white, then the flock
// expanding outward to a single rotated point and drawing back in (a plain
// two-step CSS transition, see flyers.ts/Movie.tsx - "vortex" triggers the
// expand-out, "vortexReturn" triggers the draw-back-in), handing off into
// its scattered flying form once it's back at center, settling into a calm
// sky as the flock disperses, then 小風/小馬 (already part of the flock, see
// flyers.ts's leads - they get the same vortex-then-flying treatment as
// everyone else) growing and gliding to their final resting positions -
// which IS the still title card, arrived at rather than cut to (see
// Splash/index.tsx for how the white boundary flash overlaps the tail end of
// that glide).
export type Act = "void" | "bang" | "vortex" | "vortexReturn" | "bloom" | "converge" | "arrive";

const ACT_ORDER: Act[] = [
  "void",
  "bang",
  "vortex",
  "vortexReturn",
  "bloom",
  "converge",
  "arrive",
];

// Relative to mount, up through "arrive" - "still" itself isn't listed here
// since it's not on a fixed clock: Splash/index.tsx derives it from however
// long the leads' own "arrive" glide (flyers.ts's LEAD_ARRIVE_MS) takes,
// minus the boundary flash's own overlap. Tapping before "still" jumps
// straight to "arrive" (see Splash/index.tsx) rather than racing this
// timeline, so these times only govern the unskipped, hands-off playthrough.
//
// vortex->vortexReturn->bloom (1200ms total) is just enough for the flock's
// own expand-out and draw-back-in transitions (flyers.ts's
// VORTEX_OUT_MS/VORTEX_RETURN_MS) to each finish before the next stage
// swaps in, so "bloom" always picks up from a flyer that's actually back at
// center. bloom->converge (2600ms) is deliberately brief relative to the
// leads' own long "arrive" glide+morph (flyers.ts's LEAD_ARRIVE_MS) - most
// of the movie's runtime goes there, since that's where the actual drama
// lives.
export const ACT_TIMING: { act: Act; at: number }[] = [
  { act: "bang", at: 800 },
  { act: "vortex", at: 1100 },
  { act: "vortexReturn", at: 1700 },
  { act: "bloom", at: 2300 },
  { act: "converge", at: 4900 },
  { act: "arrive", at: 6200 },
];

export const hasReached = (current: Act, target: Act) =>
  ACT_ORDER.indexOf(current) >= ACT_ORDER.indexOf(target);
