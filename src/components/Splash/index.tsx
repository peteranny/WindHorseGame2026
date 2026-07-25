import React, { useEffect, useState } from "react";
import Screen from "../Screen";
import FlyingIntro from "./FlyingIntro";
import StillSplash from "./StillSplash";
import { INTRO_DURATION_MS } from "./timing";
import styles from "./styles.css";

interface SplashProps {
  onEnter: () => void;
}

type Phase = "flying" | "still";

// App-launch splash: a short flying-monsters intro (auto-advances after
// INTRO_DURATION_MS, or a tap skips straight there) settling into a still
// title card - tapping that enters the maze via onEnter.
const Splash = ({ onEnter }: SplashProps) => {
  const [phase, setPhase] = useState<Phase>("flying");

  useEffect(() => {
    if (phase !== "flying") return undefined;
    const timer = setTimeout(() => setPhase("still"), INTRO_DURATION_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <Screen
      className={styles.splash}
      onClick={() => (phase === "flying" ? setPhase("still") : onEnter())}
    >
      {phase === "flying" ? <FlyingIntro /> : <StillSplash />}
    </Screen>
  );
};

export default Splash;
