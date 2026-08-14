export interface ProfileRow {
  id: string;
  username: string;
  has_chosen_starter: boolean;
  starter_card_id: number | null;
  coins: number;
  gems: number;
  level: number;
  xp: number;
  rank_points: number;
  wins: number;
  losses: number;
  win_streak: number;
  best_win_streak: number;
  created_at: string;
}

export interface OwnedCardRow {
  user_id: string;
  card_id: number;
  state: "locked" | "owned";
  copies: number;
  shards: number;
}

export interface OpenCrateResponse {
  cardId: number;
  rarity: string;
  isNewCard: boolean;
  shardsGained: number;
  shardsNeeded: number;
}

export interface ClaimBattleRewardResponse {
  coinsGained: number;
  bonus: number;
}
