import { CardDef } from "./types";
import { rarityMeta } from "./rarities";

// Serial format: DVC-<id padded>-<random-ish batch>, kept deterministic for demo data.
const serial = (id: number) => `DVC-${String(id).padStart(3, "0")}-A1`;

// ---- Starter cards (ids 101-105) — offered on first login, one chosen as the player's first card. ----
export const STARTER_CARDS: CardDef[] = [
  { id: 101, name: "Blaze Knight", rarity: "common", atk: 18, hp: 35, spd: 4, energyCost: 3, ability: "burningStrike", level: 1, xp: 0, xpToNext: 100, value: 10, serial: serial(101), isStarter: true },
  { id: 102, name: "Frost Mage", rarity: "common", atk: 14, hp: 30, spd: 3, energyCost: 2, ability: "freeze", level: 1, xp: 0, xpToNext: 100, value: 10, serial: serial(102), isStarter: true },
  { id: 103, name: "Forest Guardian", rarity: "common", atk: 12, hp: 48, spd: 2, energyCost: 3, ability: "regrowth", level: 1, xp: 0, xpToNext: 100, value: 10, serial: serial(103), isStarter: true },
  { id: 104, name: "Shadow Assassin", rarity: "common", atk: 25, hp: 22, spd: 8, energyCost: 2, ability: "ambush", level: 1, xp: 0, xpToNext: 100, value: 10, serial: serial(104), isStarter: true },
  { id: 105, name: "Light Paladin", rarity: "common", atk: 16, hp: 42, spd: 3, energyCost: 4, ability: "holyShield", level: 1, xp: 0, xpToNext: 100, value: 10, serial: serial(105), isStarter: true },
];

// ---- Basic starter-deck filler cards (ids 111-115), granted alongside the chosen starter. ----
export const STARTER_FILLERS: CardDef[] = [
  { id: 111, name: "Shield Soldier", rarity: "common", atk: 6, hp: 14, spd: 3, energyCost: 2, ability: "shield", level: 1, xp: 0, xpToNext: 100, value: 8, serial: serial(111), isStarter: true },
  { id: 112, name: "Quick Strike", rarity: "common", atk: 9, hp: 8, spd: 7, energyCost: 1, ability: "none", level: 1, xp: 0, xpToNext: 100, value: 8, serial: serial(112), isStarter: true },
  { id: 113, name: "Apprentice", rarity: "common", atk: 5, hp: 10, spd: 4, energyCost: 1, ability: "none", level: 1, xp: 0, xpToNext: 100, value: 6, serial: serial(113), isStarter: true },
  { id: 114, name: "Heal Spirit", rarity: "common", atk: 3, hp: 12, spd: 4, energyCost: 2, ability: "heal", level: 1, xp: 0, xpToNext: 100, value: 8, serial: serial(114), isStarter: true },
];

export const CARDS: CardDef[] = [
  { id: 1, name: "Ember Whelp", rarity: "common", atk: 2, hp: 3, spd: 4, energyCost: 1, ability: "none", level: 1, xp: 40, xpToNext: 100, value: 12, serial: serial(1) },
  { id: 2, name: "Ashen Footman", rarity: "common", atk: 3, hp: 4, spd: 2, energyCost: 1, ability: "none", level: 3, xp: 210, xpToNext: 400, value: 15, serial: serial(2) },
  { id: 3, name: "Coalbound Recruit", rarity: "common", atk: 2, hp: 2, spd: 5, energyCost: 1, ability: "none", level: 2, xp: 90, xpToNext: 200, value: 10, serial: serial(3) },
  { id: 4, name: "Vault Initiate", rarity: "common", atk: 2, hp: 4, spd: 3, energyCost: 1, ability: "none", level: 1, xp: 20, xpToNext: 100, value: 10, serial: serial(4) },
  { id: 5, name: "Dustwalker Scout", rarity: "uncommon", atk: 3, hp: 3, spd: 6, energyCost: 2, ability: "phantom", level: 5, xp: 640, xpToNext: 900, value: 42, serial: serial(5) },
  { id: 6, name: "Ironclad Vaultkeeper", rarity: "uncommon", atk: 4, hp: 6, spd: 2, energyCost: 2, ability: "shield", level: 4, xp: 380, xpToNext: 700, value: 46, serial: serial(6) },
  { id: 7, name: "Marsh Stalker", rarity: "uncommon", atk: 4, hp: 3, spd: 5, energyCost: 2, ability: "poison", level: 4, xp: 410, xpToNext: 700, value: 44, serial: serial(7) },
  { id: 8, name: "Cinder Adept", rarity: "rare", atk: 5, hp: 4, spd: 5, energyCost: 3, ability: "burn", level: 6, xp: 1200, xpToNext: 1600, value: 118, serial: serial(8) },
  { id: 9, name: "Riftbound Archer", rarity: "rare", atk: 5, hp: 3, spd: 7, energyCost: 3, ability: "overcharge", level: 2, xp: 150, xpToNext: 400, value: 96, serial: serial(9) },
  { id: 10, name: "Cracked Coinwraith", rarity: "rare", atk: 4, hp: 5, spd: 4, energyCost: 3, ability: "debuff", level: 5, xp: 900, xpToNext: 1600, value: 104, serial: serial(10) },
  { id: 11, name: "Grimoire Warden", rarity: "epic", atk: 6, hp: 6, spd: 4, energyCost: 4, ability: "regeneration", level: 8, xp: 2400, xpToNext: 3200, value: 280, serial: serial(11) },
  { id: 12, name: "Sable Reaver", rarity: "epic", atk: 7, hp: 5, spd: 5, energyCost: 4, ability: "execution", level: 7, xp: 1900, xpToNext: 3200, value: 310, serial: serial(12) },
  { id: 13, name: "Thornback Colossus", rarity: "epic", atk: 6, hp: 8, spd: 2, energyCost: 4, ability: "buff", level: 7, xp: 2000, xpToNext: 3200, value: 265, serial: serial(13) },
  { id: 14, name: "Doomcaller", rarity: "legendary", atk: 7, hp: 9, spd: 3, energyCost: 5, ability: "voidStrike", level: 9, xp: 4100, xpToNext: 6000, value: 720, serial: serial(14) },
  { id: 15, name: "Frostmourne Sentinel", rarity: "legendary", atk: 6, hp: 10, spd: 2, energyCost: 5, ability: "freeze", level: 6, xp: 2600, xpToNext: 6000, value: 640, serial: serial(15) },
  { id: 16, name: "Vaelith, Ashbound", rarity: "mythical", atk: 8, hp: 7, spd: 6, energyCost: 5, ability: "bloodRage", level: 10, xp: 5200, xpToNext: 8000, value: 1450, serial: serial(16) },
  { id: 17, name: "Nyx, the Hollow Queen", rarity: "mythical", atk: 9, hp: 8, spd: 5, energyCost: 5, ability: "stun", level: 9, xp: 4600, xpToNext: 8000, value: 1520, serial: serial(17) },
  { id: 18, name: "Morrigath, Nightshard", rarity: "mythical", atk: 8, hp: 8, spd: 7, energyCost: 5, ability: "phantom", level: 9, xp: 4400, xpToNext: 8000, value: 1380, serial: serial(18) },
  { id: 19, name: "The Vaultbreaker", rarity: "secret", atk: 10, hp: 11, spd: 3, energyCost: 6, ability: "voidStrike", level: 12, xp: 8800, xpToNext: 12000, value: 3200, serial: serial(19) },
  { id: 20, name: "Wraith of the First Vault", rarity: "secret2", atk: 11, hp: 9, spd: 7, energyCost: 6, ability: "execution", level: 11, xp: 7600, xpToNext: 12000, value: 3900, serial: serial(20) },
  { id: 21, name: "Ancient Coinbound Relic", rarity: "relic", atk: 9, hp: 13, spd: 4, energyCost: 6, ability: "regeneration", level: 10, xp: 6900, xpToNext: 14000, value: 6400, serial: serial(21) },
  { id: 22, name: "Sacred Ledgerkeeper", rarity: "sacred", atk: 10, hp: 12, spd: 5, energyCost: 6, ability: "heal", level: 13, xp: 9200, xpToNext: 16000, value: 8900, serial: serial(22) },
  { id: 23, name: "Signal Ghost .exe", rarity: "digital", atk: 9, hp: 8, spd: 9, energyCost: 6, ability: "overcharge", level: 8, xp: 5400, xpToNext: 18000, value: 12400, serial: serial(23) },
  { id: 24, name: "Entropy Herald", rarity: "chaos", atk: 12, hp: 10, spd: 8, energyCost: 7, ability: "chaosSurge", level: 14, xp: 11800, xpToNext: 20000, value: 18600, serial: serial(24) },
  { id: 25, name: "Emberfall Revenant", rarity: "revenant", atk: 13, hp: 9, spd: 6, energyCost: 7, ability: "burn", level: 12, xp: 9600, xpToNext: 24000, value: 26800, serial: serial(25) },
  { id: 26, name: "Apex Bloodwarden", rarity: "apex", atk: 14, hp: 11, spd: 7, energyCost: 7, ability: "bloodRage", level: 15, xp: 14200, xpToNext: 28000, value: 41200, serial: serial(26) },
  { id: 27, name: "Prime Construct Zeta", rarity: "prime", atk: 11, hp: 14, spd: 5, energyCost: 7, ability: "shield", level: 11, xp: 8200, xpToNext: 34000, value: 62400, serial: serial(27) },
  { id: 28, name: "Duskrider Cavalier", rarity: "prime", atk: 10, hp: 13, spd: 6, energyCost: 6, ability: "overcharge", level: 8, xp: 5800, xpToNext: 34000, value: 58900, serial: serial(28) },
  { id: 29, name: "Supreme Vaultlord", rarity: "supreme", atk: 15, hp: 15, spd: 6, energyCost: 8, ability: "overcharge", level: 16, xp: 16400, xpToNext: 40000, value: 96500, serial: serial(29) },
  { id: 30, name: "The Forbidden Ledger", rarity: "forbidden", atk: 14, hp: 12, spd: 8, energyCost: 8, ability: "execution", level: 14, xp: 12600, xpToNext: 52000, value: 148000, serial: serial(30) },
  { id: 31, name: "Hollow Warden", rarity: "hollow", atk: 13, hp: 16, spd: 5, energyCost: 8, ability: "voidStrike", level: 15, xp: 15100, xpToNext: 70000, value: 240000, serial: serial(31) },
  { id: 32, name: "Empyrean, Herald of the Vault", rarity: "empyrean", atk: 16, hp: 16, spd: 9, energyCost: 9, ability: "regeneration", level: 20, xp: 26000, xpToNext: 100000, value: 500000, serial: serial(32) },
];

export const cardById = (id: number): CardDef | undefined =>
  CARDS.find((c) => c.id === id) || STARTER_CARDS.find((c) => c.id === id) || STARTER_FILLERS.find((c) => c.id === id);

export const ALL_CARDS: CardDef[] = [...STARTER_CARDS, ...STARTER_FILLERS, ...CARDS];

/** Shard cost to craft-unlock a card scales with rarity tier. */
export function shardsRequiredFor(card: CardDef): number {
  return card.shardsRequired ?? 40 + rarityMeta(card.rarity).tier * 20;
}

export const UNLOCK_HINTS: Record<number, string> = {
  14: "Reach Player Level 5",
  16: "Win 10 ranked battles",
  17: "Win 10 ranked battles",
  19: "Reach Gold Rank",
  20: "Defeat the Vaultbreaker boss raid",
  21: "Win a tournament",
  22: "Complete the Epic-tier collection",
  23: "Extremely rare random crate unlock",
  24: "Reach Diamond Rank",
  25: "Complete the Legendary-tier collection",
  26: "Reach Master Rank",
  29: "Win 100 ranked battles",
  30: "Extremely rare random crate unlock",
  31: "Reach Grandmaster Rank",
  32: "Extremely rare random crate unlock — Legend Rank only",
};

export const ABILITY_LABELS: Record<string, { name: string; desc: string }> = {
  none: { name: "—", desc: "No special ability." },
  voidStrike: { name: "Void Strike", desc: "Deals massive damage but costs extra energy." },
  bloodRage: { name: "Blood Rage", desc: "Attack increases sharply once health falls below 30%." },
  phantom: { name: "Phantom", desc: "Chance to dodge an incoming attack entirely." },
  overcharge: { name: "Overcharge", desc: "Next attack deals double damage." },
  regeneration: { name: "Regeneration", desc: "Restores health at the start of every turn." },
  execution: { name: "Execution", desc: "Deals bonus damage to enemies below 20% health." },
  shield: { name: "Shield", desc: "Blocks a portion of the next hit taken." },
  burn: { name: "Burn", desc: "Applies a damage-over-time burn on hit." },
  poison: { name: "Poison", desc: "Applies a stacking poison on hit." },
  freeze: { name: "Freeze", desc: "Chance to freeze the enemy, skipping their next action." },
  stun: { name: "Stun", desc: "Chance to stun the enemy for one turn." },
  buff: { name: "Buff", desc: "Increases this card's attack for a few turns." },
  debuff: { name: "Debuff", desc: "Lowers the enemy's attack for a few turns." },
  heal: { name: "Heal", desc: "Restores a burst of health immediately." },
  chaosSurge: { name: "Chaos Surge", desc: "Randomly triggers one of several powerful effects." },
  burningStrike: { name: "Burning Strike", desc: "Deals bonus damage on attack." },
  regrowth: { name: "Regrowth", desc: "Restores health at the start of every turn." },
  ambush: { name: "Ambush", desc: "Deals bonus damage when attacking first in a battle." },
  holyShield: { name: "Holy Shield", desc: "Blocks a portion of incoming damage." },
};
