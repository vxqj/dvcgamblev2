import { CrateDef } from "./types";

export const CRATES: CrateDef[] = [
  {
    id: "basic",
    name: "Basic Crate",
    cost: 500,
    color: "#8a8a92",
    odds: [
      { rarity: "common", chance: 0.6 },
      { rarity: "uncommon", chance: 0.3 },
      { rarity: "rare", chance: 0.09 },
      { rarity: "epic", chance: 0.01 },
    ],
  },
  {
    id: "rare",
    name: "Rare Crate",
    cost: 2000,
    color: "#3d8ff2",
    odds: [
      { rarity: "uncommon", chance: 0.45 },
      { rarity: "rare", chance: 0.35 },
      { rarity: "epic", chance: 0.17 },
      { rarity: "legendary", chance: 0.03 },
    ],
  },
  {
    id: "epic",
    name: "Epic Crate",
    cost: 7500,
    color: "#9a4ef2",
    odds: [
      { rarity: "rare", chance: 0.4 },
      { rarity: "epic", chance: 0.38 },
      { rarity: "legendary", chance: 0.19 },
      { rarity: "mythical", chance: 0.03 },
    ],
  },
  {
    id: "legendary",
    name: "Legendary Crate",
    cost: 25000,
    color: "#e8b44d",
    odds: [
      { rarity: "epic", chance: 0.35 },
      { rarity: "legendary", chance: 0.4 },
      { rarity: "mythical", chance: 0.2 },
      { rarity: "secret", chance: 0.05 },
    ],
  },
];

export const crateById = (id: string) => CRATES.find((c) => c.id === id);

/** Roll a rarity from a crate's disclosed odds table. */
export function rollCrateRarity(crate: CrateDef) {
  const roll = Math.random();
  let acc = 0;
  for (const o of crate.odds) {
    acc += o.chance;
    if (roll <= acc) return o.rarity;
  }
  return crate.odds[0].rarity;
}
