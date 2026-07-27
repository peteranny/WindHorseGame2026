import { MONSTER_MAP_ORDER } from "./monsterMapOrder";

export const computeMonsterIds = (map: string[][]): (number | null)[][] => {
  let nextIndex = 0;
  return map.map((row) =>
    row.map((cell) => (cell === "M" ? MONSTER_MAP_ORDER[nextIndex++] : null))
  );
};
