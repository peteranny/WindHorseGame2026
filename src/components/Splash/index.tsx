import React, { useEffect, useRef, useState } from "react";
import cn from "classnames";
import Screen from "../Screen";
import Movie from "./Movie";
import { Act, ACT_TIMING, hasReached } from "./timeline";
import { LEAD_ARRIVE_MS } from "./flyers";
import styles from "./styles.css";

interface SplashProps {
  onEnter: () => void;
}

// The white "page turn" that punctuates the boundary between the movie and
// the still card becoming the tappable resting state. It deliberately
// starts *before* the leads' own "arrive" glide (flyers.ts's LEAD_ARRIVE_MS)
// has fully finished - overlapping its last stretch - so the white reaches
// full opacity right as the leads actually land, hiding that exact instant
// rather than lingering on the fully-settled frame first. Fading back out
// then reveals the now-completely-still card in one clean "boom".
const FLASH_IN_MS = 300;
const FLASH_HOLD_MS = 250;
const FLASH_OUT_MS = 300;

const ARRIVE_AT = ACT_TIMING.find((entry) => entry.act === "arrive")!.at;

// App-launch splash: plays the whole movie (see timeline.ts) hands-off, or
// skips straight to the boundary flash on a tap - either way, a white flash
// punctuates the boundary and the still frame becomes tappable (a further
// tap calls onEnter).
const Splash = ({ onEnter }: SplashProps) => {
  const [act, setAct] = useState<Act>("void");
  const [flashing, setFlashing] = useState(false);
  // Flips true the instant the white starts fading back OUT (not once it's
  // fully gone) - the title/year are already sitting there, fully rendered,
  // by that point (see Movie.tsx), so as the white dissolves the player
  // watches them emerge through it rather than having them pop in only
  // once the screen has already fully cleared.
  const [revealed, setRevealed] = useState(false);
  const [stillReady, setStillReady] = useState(false);
  const [instant, setInstant] = useState(false);
  const timersRef = useRef<number[]>([]);

  const scheduleBoundary = (afterMs: number) => {
    const delay = Math.max(afterMs, 0);
    timersRef.current.push(
      window.setTimeout(() => setFlashing(true), delay),
      window.setTimeout(
        () => {
          setFlashing(false);
          setRevealed(true);
        },
        delay + FLASH_IN_MS + FLASH_HOLD_MS
      ),
      window.setTimeout(
        () => setStillReady(true),
        delay + FLASH_IN_MS + FLASH_HOLD_MS + FLASH_OUT_MS
      )
    );
  };

  useEffect(() => {
    timersRef.current = ACT_TIMING.map(({ act: nextAct, at }) =>
      window.setTimeout(() => setAct(nextAct), at)
    );
    scheduleBoundary(ARRIVE_AT + LEAD_ARRIVE_MS - FLASH_IN_MS);
    return () => timersRef.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    if (stillReady) {
      onEnter();
      return;
    }
    // Already mid-boundary-sequence - let it finish rather than restarting.
    if (hasReached(act, "arrive")) return;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    // Jump straight to the final frame (hidden behind the flash, which
    // starts immediately below) and make every remaining CSS transition on
    // it instant - so by the time the white fades back out, the still card
    // is already fully settled rather than still catching up.
    setInstant(true);
    setAct("arrive");
    scheduleBoundary(0);
  };

  return (
    <Screen className={styles.splash} onClick={handleClick}>
      <Movie act={act} instant={instant} revealed={revealed} />
      <p className={styles.hint}>{revealed ? "輕點進入迷宮" : "輕點跳過"}</p>
      <div className={cn(styles.boundaryFlash, flashing && styles.flashing)} />
    </Screen>
  );
};

export default Splash;
