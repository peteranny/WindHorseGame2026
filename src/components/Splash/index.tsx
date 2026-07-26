import React, { useEffect, useRef, useState } from "react";
import cn from "classnames";
import Screen from "../Screen";
import Movie from "./Movie";
import { Act, ACT_TIMING } from "./timeline";
import { LEAD_ARRIVE_MS } from "./flyers";
import styles from "./styles.css";

interface SplashProps {
  onEnter: () => void;
}

// The white "page turn" that punctuates the boundary between the movie and
// the still card becoming the tappable resting state. On the natural,
// unskipped playthrough it deliberately starts *before* the leads' own
// "arrive" glide (flyers.ts's LEAD_ARRIVE_MS) has fully finished -
// overlapping its last stretch - so the white reaches full opacity right as
// the leads actually land, hiding that exact instant rather than lingering
// on the fully-settled frame first. Skipping ahead instead shows the white
// *instantly* (see scheduleBoundary's own flashInMs param) - there's no
// glide tail left to overlap, so fading in gracefully would mean the player
// glimpses the already-settled last frame for a moment before the flash
// covers it. Fading back out is always the same graceful reveal either way.
const FLASH_HOLD_MS = 250;
const FLASH_OUT_MS = 300;
const NATURAL_FLASH_IN_MS = 300;

const ARRIVE_AT = ACT_TIMING.find((entry) => entry.act === "arrive")!.at;

// App-launch splash: plays the whole movie (see timeline.ts) hands-off, or
// skips straight to the boundary flash on a tap - either way, a white flash
// punctuates the boundary and the still frame becomes tappable (a further
// tap calls onEnter).
const Splash = ({ onEnter }: SplashProps) => {
  const [act, setAct] = useState<Act>("void");
  const [flashing, setFlashing] = useState(false);
  const [flashInMs, setFlashInMs] = useState(NATURAL_FLASH_IN_MS);
  // Flips true the instant the white starts fading back OUT (not once it's
  // fully gone) - the title/year are already sitting there, fully rendered,
  // by that point (see Movie.tsx), so as the white dissolves the player
  // watches them emerge through it rather than having them pop in only
  // once the screen has already fully cleared.
  const [revealed, setRevealed] = useState(false);
  const [stillReady, setStillReady] = useState(false);
  const [instant, setInstant] = useState(false);
  const timersRef = useRef<number[]>([]);

  const scheduleBoundary = (afterMs: number, flashInDurationMs: number) => {
    const delay = Math.max(afterMs, 0);
    setFlashInMs(flashInDurationMs);
    timersRef.current.push(
      window.setTimeout(() => setFlashing(true), delay),
      window.setTimeout(
        () => {
          setFlashing(false);
          setRevealed(true);
        },
        delay + flashInDurationMs + FLASH_HOLD_MS
      ),
      window.setTimeout(
        () => setStillReady(true),
        delay + flashInDurationMs + FLASH_HOLD_MS + FLASH_OUT_MS
      )
    );
  };

  useEffect(() => {
    timersRef.current = ACT_TIMING.map(({ act: nextAct, at }) =>
      window.setTimeout(() => setAct(nextAct), at)
    );
    scheduleBoundary(ARRIVE_AT + LEAD_ARRIVE_MS - NATURAL_FLASH_IN_MS, NATURAL_FLASH_IN_MS);
    return () => timersRef.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    if (stillReady) {
      onEnter();
      return;
    }
    // Any tap before `stillReady` skips straight to the flash - including
    // mid-"arrive", before the boundary flash has actually started. `act`
    // itself flips to "arrive" well before the flash does (the flash only
    // starts once the leads' own glide is nearly done - see the mount
    // effect below), so gating this on `hasReached(act, "arrive")` used to
    // leave a multi-second window where taps were silently ignored right
    // when a player is most likely to tap, waiting for the movie to
    // finally end. Re-triggering here (even if the flash is already
    // running) just restarts the same instant-flash sequence, which is
    // harmless - it still converges on `stillReady` either way.
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    // Jump straight to the final frame and make every remaining CSS
    // transition on it instant, then cover it with an instantly-opaque
    // flash (flashInDurationMs: 0) - so the player never sees the settled
    // last frame at all, only the flash fading into the still screen.
    setInstant(true);
    setAct("arrive");
    scheduleBoundary(0, 0);
  };

  return (
    <Screen className={styles.splash} onClick={handleClick}>
      <Movie act={act} instant={instant} revealed={revealed} />
      <p className={styles.hint}>輕點以繼續</p>
      <div
        className={cn(styles.boundaryFlash, flashing && styles.flashing)}
        style={{ "--flash-in-duration": `${flashInMs}ms` } as React.CSSProperties}
      />
    </Screen>
  );
};

export default Splash;
