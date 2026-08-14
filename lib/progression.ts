import { CardDef, OwnedCards, OwnedCardState, CrateDef } from "./types";
import { CARDS, shardsRequiredFor } from "./cards-data";
import { rollCrateRarity } from "./crates";

export interface CrateOpenResult {
  card: CardDef;
  isNewCard: boolean;
  shardsGained: number;
  shardsAfter: number;
  shardsNeeded: number;
  justUnlockedFromShards: boolean;
}

/** Pick a random locked/undiscovered card of the rolled rarity; falls back to any card of that rarity. */
function pickCardOfRarity(rarity: CardDef["rarity"], owned: OwnedCards): CardDef {
  const pool = CARDS.filter((c) => c.rarity === rarity);
  const notOwned = pool.filter((c) => (owned[c.id]?.state ?? "locked") !== "owned");
  const source = notOwned.length ? notOwned : pool;
  return source[Math.floor(Math.random() * source.length)] ?? CARDS[0];
}

/**
 * Open a crate: roll a rarity from its disclosed odds, pick a card, and apply
 * either a new-card unlock or a duplicate -> shards conversion.
 */
export function openCrate(crate: CrateDef, owned: OwnedCards): { result: CrateOpenResult; owned: OwnedCards } {
  const rarity = rollCrateRarity(crate);
  const card = pickCardOfRarity(rarity, owned);
  const existing: OwnedCardState = owned[card.id] ?? { state: "locked", copies: 0, shards: 0 };
  const shardsNeeded = shardsRequiredFor(card);

  let next: OwnedCards = { ...owned };

  if (existing.state !== "owned") {
    next[card.id] = { state: "owned", copies: 1, shards: 0 };
    return {
      result: { card, isNewCard: true, shardsGained: 0, shardsAfter: 0, shardsNeeded, justUnlockedFromShards: false },
      owned: next,
    };
  }

  // Duplicate: convert to shards. Higher rarity duplicates are worth more shards.
  const shardsGained = Math.max(5, Math.round(shardsNeeded * 0.12));
  const shardsAfter = existing.shards + shardsGained;
  const copies = existing.copies + 1;
  next[card.id] = { ...existing, copies, shards: shardsAfter };

  return {
    result: { card, isNewCard: false, shardsGained, shardsAfter, shardsNeeded, justUnlockedFromShards: false },
    owned: next,
  };
}

export function startingOwnedCards(starterId: number, fillerIds: number[]): OwnedCards {
  const owned: OwnedCards = {};
  for (const c of CARDS) owned[c.id] = { state: "locked", copies: 0, shards: 0 };
  owned[starterId] = { state: "owned", copies: 1, shards: 0 };
  for (const id of fillerIds) owned[id] = { state: "owned", copies: 1, shards: 0 };
  return owned;
}

export function coinsForBattle(result: "win" | "loss", winStreak: number): { base: number; bonus: number } {
  const base = result === "win" ? 250 : 75;
  const bonus = result === "win" && winStreak >= 3 ? Math.min(400, winStreak * 25) : 0;
  return { base, bonus };
}
