import simpleMap from "./map.txt";
import { compileMap } from "./compileMap";
import { MONSTER_MAP_ORDER } from "./monsterMapOrder";
import MONSTERS from "../../data/monsters/monsters";

test("MONSTER_MAP_ORDER is a permutation covering every monster exactly once", () => {
  expect(new Set(MONSTER_MAP_ORDER).size).toBe(MONSTER_MAP_ORDER.length);
  expect([...MONSTER_MAP_ORDER].sort((a, b) => a - b)).toEqual(
    MONSTERS.map((monster) => monster.id).sort((a, b) => a - b)
  );
});

test("MONSTER_MAP_ORDER has exactly as many entries as the map has M cells", () => {
  const map = compileMap(simpleMap);
  const monsterCellCount = map.reduce(
    (count, row) => count + row.filter((cell) => cell === "M").length,
    0
  );
  expect(MONSTER_MAP_ORDER.length).toBe(monsterCellCount);
});
