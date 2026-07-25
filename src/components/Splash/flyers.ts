import MONSTERS from "../../data/monsters/monsters";
import GOAL_SPRITE from "../../assets/goalSprite.png";
import PLAYER_SPRITE from "../../assets/playerSprite.png";

export const EXTRA_FLYER_COUNT = 12;
const WAYPOINT_COUNT = 4;

// A small, mostly-synchronized jitter for entrance/exit - the flock is
// meant to pop into its vortex burst and later fade apart as one
// coordinated group, not trickle in individually, so this only adds a
// touch of organic variance rather than a wide staggered trickle.
const APPEAR_SPREAD_MS = 200;

export interface VortexPoint {
  x: number;
  y: number;
}

export interface Flyer {
  icon: string;
  size: number;
  duration: number;
  appearDelay: number;
  rotateFrom: number;
  rotateTo: number;
  waypoints: [number, number][];
  vortexPoint: VortexPoint;
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

// A single point (in vh, both axes - so it reads as a true circle rather
// than stretching with the viewport's own aspect ratio) at a random angle
// and radius from the stage's dead center - the "expand out" target of the
// vortex's two-step CSS transition (see Movie.tsx/LeadFlyer.tsx): plain
// `transition: transform` between a couple of discrete points, rather than
// a hand-authored curve of many @keyframes steps.
const VORTEX_MIN_RADIUS_VH = 14;
const VORTEX_MAX_RADIUS_VH = 26;

const buildVortexPoint = (): VortexPoint => {
  const angle = randomBetween(0, 360);
  const radius = randomBetween(VORTEX_MIN_RADIUS_VH, VORTEX_MAX_RADIUS_VH);
  const rad = (angle * Math.PI) / 180;
  return { x: radius * Math.cos(rad), y: radius * Math.sin(rad) };
};

// How long the flock's own expand-out and draw-back-in transitions each
// take - must stay comfortably under timeline.ts's own vortex->vortexReturn
// and vortexReturn->bloom gaps so each finishes (rather than getting cut
// off mid-transition) before the next stage swaps in.
export const VORTEX_OUT_MS = 450;
export const VORTEX_RETURN_MS = 450;

// Only the 39 monster icons - 小風/小馬 are their own dedicated leads (see
// below), not part of this random pool, so they never show up twice.
const EXTRA_ICONS = MONSTERS.map((monster) => monster.icon);

export const buildFlyer = (): Flyer => ({
  icon: EXTRA_ICONS[Math.floor(Math.random() * EXTRA_ICONS.length)],
  size: randomBetween(36, 72),
  duration: randomBetween(4000, 7500),
  appearDelay: randomBetween(0, APPEAR_SPREAD_MS),
  rotateFrom: randomBetween(-18, 18),
  rotateTo: randomBetween(-18, 18),
  waypoints: Array.from({ length: WAYPOINT_COUNT }, () => [
    randomBetween(-42, 42),
    randomBetween(-38, 38),
  ]),
  vortexPoint: buildVortexPoint(),
});

// Each flyer's own scattered-drift path is random, so it needs its own
// @keyframes rule - built into one <style> tag rather than a shared
// keyframes every flyer would otherwise have to conform to. translate(-50%,
// -50%) re-centers the icon on every step, since its wrapper is a zero-size
// box (see Movie.tsx) sitting at the stage's dead center - and is also the
// exact point the vortex's own draw-back-in transition (a plain CSS
// transition, not a keyframe - see Movie.tsx) lands on, so handing off to
// this keyframe at "bloom" is a seamless continuation, not a jump.
export const buildKeyframeCss = (flyers: Flyer[]) =>
  flyers
    .map((flyer, index) => {
      const steps: [number, number][] = [[0, 0], ...flyer.waypoints, [0, 0]];
      const body = steps
        .map(([x, y], stepIndex) => {
          const pct = Math.round((stepIndex / (steps.length - 1)) * 100);
          const isEndpoint = stepIndex === 0 || stepIndex === steps.length - 1;
          const rotate = isEndpoint ? flyer.rotateFrom : flyer.rotateTo;
          return `${pct}% { transform: translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh)) rotate(${rotate}deg); }`;
        })
        .join(" ");
      return `@keyframes splash-fly-${index} { ${body} }`;
    })
    .join("\n");

// ---------- The two leads: 小風 and 小馬 ----------

export type LeadName = "player" | "goal";

export interface Lead {
  name: LeadName;
  icon: string;
  displayName: string;
  duration: number;
  appearDelay: number;
  rotateFrom: number;
  rotateTo: number;
  waypoints: [number, number][];
  vortexPoint: VortexPoint;
}

// How long the "arrive" glide - growing from flock-sized to full size,
// sliding from wherever it actually was flying to its final resting spot,
// and morphing from silhouette to full color, all at once - takes once
// triggered. This is deliberately long: it's the movie's own centerpiece,
// where 小風/小馬 visibly stand out from the rest of the flock and become
// the main roles. Must match the transition-duration on Splash/styles.css's
// .leadWrap.arrivedLeft/Right and .leadSprite.revealed.
export const LEAD_ARRIVE_MS = 3200;

const LEAD_APPEAR_SPREAD_MS = 100;
const LEAD_WAYPOINT_COUNT = 4;

// A lead's own flock behavior (vortex burst, then scattered flight) is
// built exactly like an ordinary flyer's - same waypoint range, same
// infinite looping drift, no special "settle back to center" behavior of
// its own. 小風/小馬 are meant to look like genuine members of the flock
// right up until they peel off, not something that quietly waits at dead
// center - LeadFlyer.tsx captures whatever live position/rotation/scale a
// lead actually has the instant "arrive" fires (a plain CSS transition
// can't do this on its own - see that file's own comment) and continues
// smoothly from there, so there's no requirement here for the drift to end
// up anywhere in particular.
const buildLead = (name: LeadName, icon: string, displayName: string): Lead => ({
  name,
  icon,
  displayName,
  duration: randomBetween(4000, 7500),
  appearDelay: randomBetween(0, LEAD_APPEAR_SPREAD_MS),
  rotateFrom: randomBetween(-10, 10),
  rotateTo: randomBetween(-10, 10),
  waypoints: Array.from({ length: LEAD_WAYPOINT_COUNT }, () => [
    randomBetween(-42, 42),
    randomBetween(-38, 38),
  ]),
  vortexPoint: buildVortexPoint(),
});

export const buildLeads = (): [Lead, Lead] => [
  buildLead("player", PLAYER_SPRITE, "小風"),
  buildLead("goal", GOAL_SPRITE, "小馬"),
];

// Unlike an ordinary flyer, a lead's own *wrapper* (not a child img) carries
// this animation - LeadFlyer.tsx needs a single element whose live transform
// it can capture wholesale (position + rotation + scale together) the
// instant "arrive" fires, and needs that same element to already be the one
// .leadWrap.arrivedLeft/Right's own transition targets. Splitting drift
// across a wrapper *and* an inner img (the way ordinary flyers do it) would
// mean capturing two separate live transforms and recombining them - the
// small "still part of the flock" scale therefore has to live inside this
// keyframe too, exactly like an ordinary flyer's own translate/rotate, and
// inside the vortex's own two transition targets (see Movie.tsx/
// LeadFlyer.tsx).
export const LEAD_FLOCK_SCALE = 0.32;

export const buildLeadKeyframeCss = (leads: Lead[]) =>
  leads
    .map((lead) => {
      const steps: [number, number][] = [[0, 0], ...lead.waypoints, [0, 0]];
      const body = steps
        .map(([x, y], stepIndex) => {
          const pct = Math.round((stepIndex / (steps.length - 1)) * 100);
          const isEndpoint = stepIndex === 0 || stepIndex === steps.length - 1;
          const rotate = isEndpoint ? lead.rotateFrom : lead.rotateTo;
          return `${pct}% { transform: translate(${x}vw, ${y}vh) rotate(${rotate}deg) scale(${LEAD_FLOCK_SCALE}); }`;
        })
        .join(" ");
      return `@keyframes splash-fly-lead-${lead.name} { ${body} }`;
    })
    .join("\n");
