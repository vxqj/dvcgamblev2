import { BattleHistoryEntry, LeaderboardEntry } from "./types";

export const AI_OPPONENTS = [
  "Morrigath", "Ferrik_9", "Ashen_Queen", "Doomcaller", "Nyx_Prime",
  "Sable_Reaver", "Hollowwind", "Emberfall", "Coinwraith_X", "Duskrider",
];

export const LEADERBOARDS: Record<string, LeaderboardEntry[]> = {
  global: [
    { rank: 1, username: "Ashen_Queen", value: 21940 },
    { rank: 2, username: "Ferrik_9", value: 18220 },
    { rank: 3, username: "Nyx_Prime", value: 16510 },
    { rank: 4, username: "Doomcaller", value: 15120 },
    { rank: 5, username: "Vaelkhor", value: 14860 },
    { rank: 6, username: "Morrigath", value: 14010 },
    { rank: 7, username: "Sable_Reaver", value: 13455 },
    { rank: 8, username: "Hollowwind", value: 12980 },
  ],
  ranked: [
    { rank: 1, username: "Ashen_Queen", value: 2410 },
    { rank: 2, username: "Nyx_Prime", value: 2260 },
    { rank: 3, username: "Ferrik_9", value: 2190 },
    { rank: 4, username: "Doomcaller", value: 2050 },
    { rank: 5, username: "Vaelkhor", value: 1840 },
  ],
  collection: [
    { rank: 1, username: "Hollowwind", value: 412 },
    { rank: 2, username: "Ashen_Queen", value: 388 },
    { rank: 3, username: "Doomcaller", value: 355 },
    { rank: 4, username: "Vaelkhor", value: 127 },
    { rank: 5, username: "Ferrik_9", value: 119 },
  ],
  wins: [
    { rank: 1, username: "Ashen_Queen", value: 512 },
    { rank: 2, username: "Doomcaller", value: 470 },
    { rank: 3, username: "Ferrik_9", value: 402 },
    { rank: 4, username: "Vaelkhor", value: 214 },
    { rank: 5, username: "Morrigath", value: 198 },
  ],
  value: [
    { rank: 1, username: "Hollowwind", value: 892000 },
    { rank: 2, username: "Ashen_Queen", value: 664000 },
    { rank: 3, username: "Doomcaller", value: 410500 },
    { rank: 4, username: "Vaelkhor", value: 96200 },
    { rank: 5, username: "Nyx_Prime", value: 81400 },
  ],
};

export const RANK_LADDER = [
  { name: "Bronze", color: "#c98a4a" },
  { name: "Silver", color: "#c7d6e8" },
  { name: "Gold", color: "#e8b44d" },
  { name: "Platinum", color: "#6bb5ff" },
  { name: "Diamond", color: "#e0f2ff" },
  { name: "Master", color: "#f23dae" },
  { name: "Grandmaster", color: "#ff1f2e" },
  { name: "Legend", color: "#f6e9c9" },
];

export const DAILY_MISSIONS = [
  { id: "m1", label: "Win 3 ranked battles", progress: 2, total: 3, reward: "+250 XP" },
  { id: "m2", label: "Deal 500 damage with abilities", progress: 340, total: 500, reward: "+180 XP" },
  { id: "m3", label: "Open 2 card packs", progress: 0, total: 2, reward: "120 Gold" },
];
