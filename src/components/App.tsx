import React, { useState } from "react";
import { Switch, Route } from "react-router-dom";
import Game from "./Game";
import Settings from "./Settings";
import Splash from "./Splash";

// Gates every route behind the app-launch splash - once dismissed for this
// page load, the actual routed screen (map or settings) takes over for good.
const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Splash onEnter={() => setShowSplash(false)} />;
  }

  return (
    <Switch>
      <Route path="/settings" component={Settings} />
      <Route path="/" component={Game} />
    </Switch>
  );
};

export default App;
