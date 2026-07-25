import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
import cn from "classnames";
import Game from "./Game";
import Settings from "./Settings";
import Splash from "./Splash";
import styles from "./App.css";

type Stage = "splash" | "exiting" | "app";

// Tapping the still splash fades to a solid white cover, swaps the routed
// app in underneath while the screen is solid white (so the swap itself is
// invisible), then fades the white away to reveal it - the same cover ->
// swap -> reveal shape BattleTransition uses entering/leaving battle, just
// much shorter and with no distortion pattern of its own.
const COVER_MS = 200;
const REVEAL_MS = 300;

const App = () => {
  const [stage, setStage] = useState<Stage>("splash");
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    if (stage !== "exiting") return undefined;
    const revealTimer = window.setTimeout(() => setCovered(false), COVER_MS);
    const doneTimer = window.setTimeout(() => setStage("app"), COVER_MS + REVEAL_MS);
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(doneTimer);
    };
  }, [stage]);

  const routes = (
    <Switch>
      <Route path="/settings" component={Settings} />
      <Route path="/" component={Game} />
    </Switch>
  );

  if (stage === "app") return routes;

  // Splash stays mounted (rather than the routed app) for as long as the
  // overlay hasn't fully covered the screen yet - the instant it flips to
  // reveal, the swap happens underneath solid white, invisibly.
  const showSplash = stage === "splash" || covered;

  return (
    <>
      {showSplash ? (
        <Splash
          onEnter={() => {
            setCovered(true);
            setStage("exiting");
          }}
        />
      ) : (
        routes
      )}
      {stage === "exiting" && (
        <div
          className={cn(styles.exitOverlay, covered && styles.covered)}
          style={
            {
              "--exit-duration": `${covered ? COVER_MS : REVEAL_MS}ms`,
            } as React.CSSProperties
          }
        />
      )}
    </>
  );
};

export default App;
