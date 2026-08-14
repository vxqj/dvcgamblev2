export type RarityTier =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythical"
  | "secret"
  | "secret2"
  | "relic"
  | "sacred"
  | "digital"
  | "chaos"
  | "revenant"
  | "apex"
  | "prime"
  | "supreme"
  | "forbidden"
  | "hollow"
  | "empyrean";

export type FoilEffect =
  | "none"
  | "sheen"
  | "holo"
  | "particle"
  | "glitch"
  | "prism";

export interface RarityMeta {
  tier: number;
  id: RarityTier;
  name: string;
  color: string; // hex
  foil: FoilEffect;
  weight: number; // pull weight for packs
}

export type AbilityId =
  | "none"
  | "voidStrike"
  | "bloodRage"
  | "phantom"
  | "overcharge"
  | "regeneration"
  | "execution"
  | "shield"
  | "burn"
  | "poison"
  | "freeze"
  | "stun"
  | "buff"
  | "debuff"
  | "heal"
  | "chaosSurge"
  | "burningStrike"
  | "regrowth"
  | "ambush"
  | "holyShield";

export interface CardDef {
  id: number;
  name: string;
  rarity: RarityTier;
  atk: number;
  hp: number;
  spd: number;
  energyCost: number;
  ability: AbilityId;
  level: number;
  xp: number;
  xpToNext: number;
  value: number;
  serial: string;
  flavor?: string;
  isStarter?: boolean;
  /** Human-readable unlock condition shown while the card is locked/undiscovered. */
  unlockHint?: string;
  shardsRequired?: number;
}

export type UnlockState = "owned" | "discovered" | "locked";

export interface OwnedCardState {
  state: UnlockState;
  copies: number;
  shards: number;
}

export type OwnedCards = Record<number, OwnedCardState>;

export type CrateTier = "basic" | "rare" | "epic" | "legendary";

export interface CrateOdds {
  rarity: RarityTier;
  chance: number; // 0-1
}

export interface CrateDef {
  id: CrateTier;
  name: string;
  cost: number;
  color: string;
  odds: CrateOdds[];
}

export interface Deck {
  id: string;
  name: string;
  cardIds: number[];
}

export type StatusEffectId = "burn" | "poison" | "freeze" | "stun" | "shield" | "buff" | "debuff";

export interface StatusEffect {
  id: StatusEffectId;
  turns: number;
  magnitude: number;
}

export interface BattleCardInstance {
  instanceId: string;
  def: CardDef;
  currentHp: number;
  maxHp: number;
  atk: number;
  spd: number;
  statuses: StatusEffect[];
  overcharged: boolean;
  shielded: boolean;
}

export type Side = "player" | "enemy";

export interface BattleLogEntry {
  id: string;
  text: string;
  turn: number;
  side?: Side;
}

export interface BattleState {
  turn: number;
  activeSide: Side;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerEnergy: number;
  playerMaxEnergy: number;
  enemyEnergy: number;
  enemyMaxEnergy: number;
  playerHand: BattleCardInstance[];
  playerField: BattleCardInstance | null;
  enemyHand: BattleCardInstance[];
  enemyField: BattleCardInstance | null;
  playerDeckCount: number;
  enemyDeckCount: number;
  log: BattleLogEntry[];
  winner: Side | null;
  lastEvent: BattleEvent | null;
}

export interface BattleEvent {
  type: "attack" | "ability" | "status" | "death" | "victory";
  side: Side;
  amount?: number;
  crit?: boolean;
  dodged?: boolean;
  ability?: AbilityId;
}

export interface PlayerProfile {
  username: string;
  level: number;
  xp: number;
  xpToNext: number;
  rank: string;
  rankPoints: number;
  wins: number;
  losses: number;
  winStreak: number;
  bestWinStreak: number;
  coins: number;
  gems: number;
  favoriteCardId: number;
}

export interface BattleHistoryEntry {
  id: string;
  opponent: string;
  result: "win" | "loss";
  rankChange: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  value: number;
}

// ---- Matchmaking / Lobbies ----

export interface QueuedPlayer {
  username: string;
  rating: number;
  rank: string;
}

export interface MatchmakingState {
  status: "idle" | "searching" | "found" | "starting";
  searchStartedAt: number | null;
  playersInQueue: number;
  ratingBand: number;
  opponent: QueuedPlayer | null;
}

export type LobbyMode = "ranked" | "casual" | "custom";
export type LobbyPrivacy = "public" | "private";

export interface Lobby {
  id: string;
  code: string;
  host: string;
  hostRating: number;
  hostRank: string;
  mode: LobbyMode;
  privacy: LobbyPrivacy;
  status: "waiting" | "full";
}
