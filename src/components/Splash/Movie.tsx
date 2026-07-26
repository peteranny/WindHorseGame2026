import React, { useMemo } from "react";
import cn from "classnames";
import styles from "./styles.css";
import { Act, hasReached } from "./timeline";
import {
  EXTRA_FLYER_COUNT,
  VORTEX_OUT_MS,
  VORTEX_RETURN_MS,
  VORTEX_RETURN_TURN_DEG,
  buildFlyer,
  buildKeyframeCss,
  buildPolarTransform,
  buildLeads,
  buildLeadKeyframeCss,
} from "./flyers";
import LeadFlyer from "./LeadFlyer";

interface MovieProps {
  act: Act;
  // True once the player has skipped ahead - every remaining CSS transition
  // on this tree resolves instantly (see .stage.instant in styles.css)
  // rather than animating, so the "arrive" glide/morph is already fully
  // settled underneath by the time the boundary flash's own white fades
  // back out (see Splash/index.tsx) - the flash is the transition, not a
  // curtain over an animation still catching up.
  instant: boolean;
  // True the instant the boundary flash's white starts fading back OUT (see
  // Splash/index.tsx) - the title/year deliberately wait for this rather
  // than fading in alongside the leads' own "arrive" glide, so they're
  // already fully present (just still hidden behind the opaque white)
  // before the reveal, and emerge gradually as that white dissolves rather
  // than popping in only once the screen has fully cleared.
  revealed: boolean;
}

// The whole "short movie": a universe blinking into being (void -> a spark ->
// a big-bang burst of rainbow), the flock bursting outward to a scattered
// point and drawing back to center (a plain two-step CSS transition, not a
// hand-authored curve - see flyers.ts's buildVortexPoint/VORTEX_OUT_MS/
// VORTEX_RETURN_MS), handing off into its scattered flying form once it's
// back at center, settling into a calm sky as the flock disperses, then
// 小風/小馬 - themselves just two more members of that same flock -
// standing out, growing, and morphing into full color as they glide to
// their final resting positions. That final frame IS the still title card,
// arrived at continuously via CSS transitions rather than cut to. Every
// layer below is always mounted; only its className/inline style (driven by
// how far `act` has progressed) changes, so each transition plays smoothly
// off whatever state the layer was already in.
const Movie = ({ act, instant, revealed }: MovieProps) => {
  const flyers = useMemo(() => Array.from({ length: EXTRA_FLYER_COUNT }, buildFlyer), []);
  const keyframeCss = useMemo(() => buildKeyframeCss(flyers), [flyers]);
  const leads = useMemo(buildLeads, []);
  const leadKeyframeCss = useMemo(() => buildLeadKeyframeCss(leads), [leads]);

  const rainbowVisible = hasReached(act, "bang") && !hasReached(act, "converge");
  const vortexed = hasReached(act, "vortex");
  const vortexReturning = hasReached(act, "vortexReturn");
  const bloomed = hasReached(act, "bloom");
  const settled = hasReached(act, "converge");
  const arrived = hasReached(act, "arrive");

  return (
    <div className={cn(styles.stage, instant && styles.instant)}>
      <style>{keyframeCss}</style>
      <style>{leadKeyframeCss}</style>

      <div className={cn(styles.rainbowBackground, rainbowVisible && styles.visible)} />
      <div className={cn(styles.skyBackground, settled && styles.visible)} />
      <div className={cn(styles.ground, settled && styles.visible)} />

      {flyers.map((flyer, index) => {
        // Before "bloom": a plain two-step transition - burst out to a
        // random point (straight radial expansion), then draw back to
        // center while sweeping a further quarter turn (a real orbital
        // arc, via buildPolarTransform's rotate/translateX/rotate
        // composition) - rather than the infinite scattered-drift
        // @keyframes, which only takes over once that draw-back-in has
        // landed exactly at the same (0, 0) point it starts from (see
        // buildKeyframeCss's own comment). Stays at the resting (radius 0)
        // value until "vortex" actually fires (not just "not yet
        // returning") - otherwise this render's very first paint would
        // already show it sitting at the burst point, since a CSS
        // transition only plays when a property's value *changes* after
        // mount, never on its initial value.
        const angle = vortexReturning
          ? flyer.vortexPoint.angle + VORTEX_RETURN_TURN_DEG
          : flyer.vortexPoint.angle;
        const radius = vortexed && !vortexReturning ? flyer.vortexPoint.radius : 0;
        const vortexTransform = `translate(-50%, -50%) ${buildPolarTransform(
          angle,
          radius,
          flyer.rotateFrom
        )}`;
        return (
          <div
            key={index}
            className={cn(styles.flyerWrap, vortexed && styles.visible, settled && styles.leaving)}
            style={{ transitionDelay: `${flyer.appearDelay}ms` }}
          >
            <img
              src={flyer.icon}
              alt=""
              className={styles.flyer}
              style={
                bloomed
                  ? {
                      width: `calc(${flyer.size}px * var(--scale))`,
                      height: `calc(${flyer.size}px * var(--scale))`,
                      transition: "none",
                      animationName: `splash-fly-${index}`,
                      animationDuration: `${flyer.duration}ms`,
                      animationIterationCount: "infinite",
                      // 0, not a per-flyer stagger - the fly keyframe must
                      // start exactly at its own (0, 0) frame to continue
                      // seamlessly from where "vortexReturn" left off; a
                      // negative delay (an earlier cut's trick for start-
                      // pose variety) would jump the animation into an
                      // arbitrary mid-cycle position instead. Each flyer's
                      // own distinct waypoint path already provides plenty
                      // of variety without needing staggered timing too.
                      animationDelay: "0ms",
                    }
                  : {
                      width: `calc(${flyer.size}px * var(--scale))`,
                      height: `calc(${flyer.size}px * var(--scale))`,
                      animationName: "none",
                      transform: vortexTransform,
                      transition: `transform ${vortexReturning ? VORTEX_RETURN_MS : VORTEX_OUT_MS}ms ${
                        vortexReturning ? "ease-in" : "ease-out"
                      }`,
                    }
              }
            />
          </div>
        );
      })}

      {leads.map((lead) => (
        <LeadFlyer
          key={lead.name}
          lead={lead}
          vortexed={vortexed}
          vortexReturning={vortexReturning}
          bloomed={bloomed}
          arrived={arrived}
        />
      ))}

      <div className={cn(styles.voidBackdrop, hasReached(act, "bang") && styles.hidden)} />
      <div
        className={cn(
          styles.spark,
          act === "void" && styles.sparkAppearing,
          hasReached(act, "bang") && styles.sparkBursting
        )}
      />

      <h1 className={cn(styles.title, revealed && styles.visible)}>小風の生日禮物</h1>
      <p className={cn(styles.year, revealed && styles.visible)}>2026</p>
    </div>
  );
};

export default Movie;
