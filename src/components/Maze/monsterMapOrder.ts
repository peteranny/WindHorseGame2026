// The map places 39 `M` cells in a fixed scan order (top-to-bottom, left-to-
// right); MONSTER_MAP_ORDER[n] is the monster id (matching monsters.generated
// .json / icons/<id>.png / conversations/<id>.json) that appears at the nth
// `M` on the map. This indirection lets the map's own encounter order differ
// from the monster roster's id order - e.g. spreading out attackFamily so
// the first several monsters a player meets aren't all the same family -
// without renumbering any monster's id, icon file, or conversation file.
//
// First 10 slots are hand-picked to spread across every attackFamily
// (動物/植物/屬性/星座/小X媽/水果) rather than mirroring monsters.generated
// .json's own id order, which clusters all 10 動物情人節 monsters at the
// front (ids 0, 4-12) and doesn't introduce another family until id 14. The
// first 3 (ids 0, 4, 5) are deliberately kept consecutive and same-family
// (動物情人節) rather than spread out too - capturing them in encounter order
// lands them adjacent in gameStore.monsterOrder, so a player who plays
// straightforwardly discovers the family-adjacency attack bonus (see
// Battle/attackGroups.ts) within their first few captures, not several dozen
// monsters in. The remaining ids just fill in afterward in their natural order.
export const MONSTER_MAP_ORDER: number[] = [
  0, 4, 5, 1, 17, 31, 13, 14, 18, 32,
  2, 3, 6, 7, 8, 9, 10, 11, 12, 15,
  16, 19, 20, 21, 22, 23, 24, 25, 26, 27,
  28, 29, 30, 33, 34, 35, 36, 37, 38,
];
