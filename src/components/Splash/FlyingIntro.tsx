import React, { useMemo } from "react";
import styles from "./styles.css";
import MONSTERS from "../../data/monsters/monsters";
import GOAL_SPRITE from "../../assets/goalSprite.png";
import PLAYER_SPRITE from "../../assets/playerSprite.png";

const FLYER_COUNT = 16;
const WAYPOINT_COUNT = 4;

interface Flyer {
  icon: string;
  size: number;
  duration: number;
  delay: number;
  rotateFrom: number;
  rotateTo: number;
  waypoints: [number, number][];
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

// A wide mix of monster icons plus both leads, so the flock reads as "the
// whole cast celebrating together" rather than just background filler.
const FLYER_ICONS = [...MONSTERS.map((monster) => monster.icon), GOAL_SPRITE, PLAYER_SPRITE];

const buildFlyer = (): Flyer => ({
  icon: FLYER_ICONS[Math.floor(Math.random() * FLYER_ICONS.length)],
  size: randomBetween(36, 72),
  duration: randomBetween(4000, 7500),
  delay: randomBetween(-4000, 0),
  rotateFrom: randomBetween(-18, 18),
  rotateTo: randomBetween(-18, 18),
  waypoints: Array.from({ length: WAYPOINT_COUNT }, () => [
    randomBetween(-42, 42),
    randomBetween(-38, 38),
  ]),
});

// Each flyer's own path is random, so it needs its own @keyframes rule - built
// into one <style> tag rather than a shared keyframes every flyer would
// otherwise have to conform to. translate(-50%, -50%) re-centers the icon on
// every step, since top/left: 50% only places its top-left corner at center.
const buildKeyframeCss = (flyers: Flyer[]) =>
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

// The animated rainbow backdrop + flock of monster icons drifting around the
// screen - the "happy and cute" launch moment before settling on the still
// splash. Each flyer's path/size/timing is randomized once per mount so the
// flock never looks mechanically identical across page loads.
const FlyingIntro = () => {
  const flyers = useMemo(() => Array.from({ length: FLYER_COUNT }, buildFlyer), []);
  const keyframeCss = useMemo(() => buildKeyframeCss(flyers), [flyers]);

  return (
    <div className={styles.flyingStage}>
      <style>{keyframeCss}</style>
      <div className={styles.rainbowBackground} />
      {flyers.map((flyer, index) => (
        <img
          key={index}
          src={flyer.icon}
          alt=""
          className={styles.flyer}
          style={{
            width: `calc(${flyer.size}px * var(--scale))`,
            height: `calc(${flyer.size}px * var(--scale))`,
            animationName: `splash-fly-${index}`,
            animationDuration: `${flyer.duration}ms`,
            animationDelay: `${flyer.delay}ms`,
          }}
        />
      ))}
      <p className={styles.hint}>輕點跳過</p>
    </div>
  );
};

export default FlyingIntro;
