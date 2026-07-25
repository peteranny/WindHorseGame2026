import React from "react";
import styles from "./styles.css";
import PLAYER_SPRITE from "../../assets/playerSprite.png";
import GOAL_SPRITE from "../../assets/goalSprite.png";

// The resting title card: 小風 and 小馬 standing face to face - the player
// sprite's native art already faces right and the goal sprite's is fixed
// facing left (see CLAUDE.md's "The goal tile"), so placing 小風 on the left
// and 小馬 on the right has them looking at each other with no mirroring
// needed at all.
const StillSplash = () => (
  <div className={styles.stillStage}>
    <div className={styles.sky} />
    <div className={styles.ground} />
    <h1 className={styles.title}>小風小馬遊戲</h1>
    <div className={styles.duo}>
      <div className={styles.character}>
        <div className={styles.shadow} />
        <img src={PLAYER_SPRITE} alt="小風" className={styles.characterSprite} />
      </div>
      <div className={styles.character}>
        <div className={styles.shadow} />
        <img src={GOAL_SPRITE} alt="小馬" className={styles.characterSprite} />
      </div>
    </div>
    <p className={styles.year}>2026</p>
    <p className={styles.hint}>輕點進入迷宮</p>
  </div>
);

export default StillSplash;
