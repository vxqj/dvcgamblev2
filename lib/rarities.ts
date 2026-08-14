import { RarityMeta, RarityTier } from "./types";

export const RARITIES: RarityMeta[] = [
  { tier: 1, id: "common", name: "Common", color: "#8a8a92", foil: "none", weight: 4000 },
  { tier: 2, id: "uncommon", name: "Uncommon", color: "#4fbf6a", foil: "sheen", weight: 2600 },
  { tier: 3, id: "rare", name: "Rare", color: "#3d8ff2", foil: "sheen", weight: 1600 },
  { tier: 4, id: "epic", name: "Epic", color: "#9a4ef2", foil: "holo", weight: 900 },
  { tier: 5, id: "legendary", name: "Legendary", color: "#f2a63d", foil: "particle", weight: 480 },
  { tier: 6, id: "mythical", name: "Mythical", color: "#f23dae", foil: "holo", weight: 260 },
  { tier: 7, id: "secret", name: "Secret", color: "#e0304a", foil: "glitch", weight: 140 },
  { tier: 8, id: "secret2", name: "Secret II", color: "#ff1f45", foil: "glitch", weight: 80 },
  { tier: 9, id: "relic", name: "Relic", color: "#2fd1c5", foil: "prism", weight: 46 },
  { tier: 10, id: "sacred", name: "Sacred", color: "#f5e6b0", foil: "prism", weight: 28 },
  { tier: 11, id: "digital", name: "Digital", color: "#33e0ff", foil: "glitch", weight: 18 },
  { tier: 12, id: "chaos", name: "Chaos", color: "#ff5cd6", foil: "holo", weight: 12 },
  { tier: 13, id: "revenant", name: "Revenant", color: "#b0202f", foil: "particle", weight: 8 },
  { tier: 14, id: "apex", name: "Apex", color: "#ff1f2e", foil: "particle", weight: 5 },
  { tier: 15, id: "prime", name: "Prime", color: "#c7d6e8", foil: "sheen", weight: 3.4 },
  { tier: 16, id: "supreme", name: "Supreme", color: "#ffcf5c", foil: "prism", weight: 2.2 },
  { tier: 17, id: "forbidden", name: "Forbidden", color: "#7a2fd6", foil: "glitch", weight: 1.3 },
  { tier: 18, id: "hollow", name: "Hollow", color: "#e8e8f2", foil: "particle", weight: 0.7 },
  { tier: 19, id: "empyrean", name: "Empyrean", color: "#f6e9c9", foil: "prism", weight: 0.3 },
];

export const rarityMeta = (id: RarityTier): RarityMeta =>
  RARITIES.find((r) => r.id === id) ?? RARITIES[0];

export const rarityByTier = (tier: number): RarityMeta =>
  RARITIES.find((r) => r.tier === tier) ?? RARITIES[0];

/** Weighted-random rarity pull, used by pack opening / rewards. */
export function rollRarity(): RarityMeta {
  const total = RARITIES.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of RARITIES) {
    if (roll < r.weight) return r;
    roll -= r.weight;
  }
  return RARITIES[0];
}
