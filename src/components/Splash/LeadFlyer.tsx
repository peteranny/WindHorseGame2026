import React, { useLayoutEffect, useRef, useState } from "react";
import cn from "classnames";
import styles from "./styles.css";
import { Lead, LEAD_FLOCK_SCALE, VORTEX_OUT_MS, VORTEX_RETURN_MS } from "./flyers";

interface LeadFlyerProps {
  lead: Lead;
  vortexed: boolean;
  vortexReturning: boolean;
  bloomed: boolean;
  arrived: boolean;
}

// A single lead (小風/小馬) - part of the flock exactly like any ordinary
// flyer through vortex and bloom (same burst-out/draw-back-in, same
// infinite scattered drift, see flyers.ts's buildLead), so it never looks
// like it's idling at center waiting to be noticed. Only once `arrived`
// fires does it peel off toward its own final resting spot - and it has to
// *continue* from wherever it actually was, not snap back to center first.
//
// CSS alone can't do that hand-off: the instant the drift keyframe stops
// (animation-name -> "none"), the element's transform reverts to whatever
// the static cascade says, not wherever the animation had it - a plain
// `transition` only takes over cleanly if the "before" value is already
// exactly right. So this captures the live computed transform in a layout
// effect - fired on the very same render `arrived` first turns true, while
// the drift keyframe is *still* the one being rendered (this component
// hasn't reacted to `arrived` for animation-name purposes yet) - freezes it
// as an inline override, then releases that override one frame later so
// the CSS transition to the final position (.leadWrap.arrivedLeft/Right)
// picks up smoothly from that exact captured point instead of the cascade's
// own default.
const LeadFlyer = ({ lead, vortexed, vortexReturning, bloomed, arrived }: LeadFlyerProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [stopped, setStopped] = useState(false);
  const capturedRef = useRef(false);

  useLayoutEffect(() => {
    if (!arrived || capturedRef.current) return;
    capturedRef.current = true;
    const el = wrapRef.current;
    if (el) {
      const live = getComputedStyle(el).transform;
      el.style.animationName = "none";
      el.style.transition = "none";
      el.style.transform = live;
      // Force a reflow so the browser commits this frozen frame as its own
      // style before the next effect releases it - otherwise the writes
      // could be coalesced and the freeze would never get painted.
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      void el.offsetHeight;
    }
    setStopped(true);
  }, [arrived]);

  useLayoutEffect(() => {
    if (!stopped) return undefined;
    const el = wrapRef.current;
    if (!el) return undefined;
    const raf = requestAnimationFrame(() => {
      el.style.transition = "";
      el.style.transform = "";
    });
    return () => cancelAnimationFrame(raf);
  }, [stopped]);

  // Before "bloom": a plain two-step transition - burst out to a random
  // point, then draw back to center - rather than the infinite scattered-
  // drift @keyframes, which only takes over once that draw-back-in has
  // landed exactly at the same (0, 0) point it starts from. Stays at the
  // center value until "vortex" actually fires (not just "not yet
  // returning") - otherwise this render's very first paint would already
  // show it sitting at the burst point, since a CSS transition only plays
  // when a property's value *changes* after mount, never on its initial
  // value.
  const restingTransform = `translate(0, 0) rotate(${lead.rotateFrom}deg) scale(${LEAD_FLOCK_SCALE})`;
  const vortexTransform =
    vortexed && !vortexReturning
      ? `translate(${lead.vortexPoint.x}vh, ${lead.vortexPoint.y}vh) rotate(${lead.rotateFrom}deg) scale(${LEAD_FLOCK_SCALE})`
      : restingTransform;

  const style: React.CSSProperties = stopped
    ? { transitionDelay: `${lead.appearDelay}ms` }
    : bloomed
    ? {
        transitionDelay: `${lead.appearDelay}ms`,
        animationName: `splash-fly-lead-${lead.name}`,
        animationDuration: `${lead.duration}ms`,
        animationIterationCount: "infinite",
        // 0, not a per-lead stagger - must start exactly at its own (0, 0)
        // frame to continue seamlessly from where "vortexReturn" left off
        // (see Movie.tsx's own matching comment for ordinary flyers).
        animationDelay: "0ms",
      }
    : {
        transitionDelay: `${lead.appearDelay}ms`,
        animationName: "none",
        transform: vortexTransform,
        transition: `transform ${vortexReturning ? VORTEX_RETURN_MS : VORTEX_OUT_MS}ms ${
          vortexReturning ? "ease-in" : "ease-out"
        }`,
      };

  return (
    <div
      ref={wrapRef}
      className={cn(
        styles.leadWrap,
        vortexed && styles.visible,
        stopped && (lead.name === "player" ? styles.arrivedLeft : styles.arrivedRight)
      )}
      style={style}
    >
      <div className={cn(styles.leadShadow, stopped && styles.visible)} />
      <img
        src={lead.icon}
        alt={lead.displayName}
        className={cn(styles.leadSprite, stopped && styles.revealed)}
      />
    </div>
  );
};

export default LeadFlyer;
