import { QueuedPlayer, Lobby, LobbyMode, LobbyPrivacy } from "./types";

/**
 * Local/demo implementation of a matchmaking + lobby service.
 *
 * The functions below (joinQueue, leaveQueue, findMatch, createLobby,
 * joinLobby) are the exact seam a real backend would sit behind — swap the
 * bodies for API calls / websocket events later without touching callers.
 */

const SIMULATED_PLAYERS: QueuedPlayer[] = [
  { username: "Morrigath", rating: 1790, rank: "Diamond II" },
  { username: "Ferrik_9", rating: 1920, rank: "Diamond I" },
  { username: "Ashen_Queen", rating: 2410, rank: "Master" },
  { username: "Doomcaller", rating: 1650, rank: "Platinum I" },
  { username: "Nyx_Prime", rating: 2050, rank: "Diamond I" },
  { username: "Sable_Reaver", rating: 1480, rank: "Platinum III" },
  { username: "Hollowwind", rating: 1300, rank: "Gold I" },
  { username: "Emberfall", rating: 1980, rank: "Diamond I" },
  { username: "Coinwraith_X", rating: 1100, rank: "Silver I" },
  { username: "Duskrider", rating: 1560, rank: "Platinum II" },
];

/** Search band widens the longer a player waits, so low pop doesn't stall matchmaking forever. */
export function ratingBandForWaitMs(waitMs: number): number {
  if (waitMs < 8000) return 100;
  if (waitMs < 16000) return 250;
  return 500;
}

export function findOpponent(myRating: number, waitMs: number): QueuedPlayer | null {
  const band = ratingBandForWaitMs(waitMs);
  const candidates = SIMULATED_PLAYERS.filter((p) => Math.abs(p.rating - myRating) <= band);
  const pool = candidates.length ? candidates : SIMULATED_PLAYERS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Simulated players currently sitting in queue, for the "players in queue" readout. */
export function simulatedQueueSize(): number {
  return 3 + Math.floor(Math.random() * 9);
}

// ---- Lobbies ----

let lobbySeq = 0;
const genCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `DVC-${out}`;
};

export const PUBLIC_LOBBIES: Lobby[] = SIMULATED_PLAYERS.slice(0, 5).map((p, i) => ({
  id: `lobby_${i}`,
  code: genCode(),
  host: p.username,
  hostRating: p.rating,
  hostRank: p.rank,
  mode: i % 2 === 0 ? "ranked" : "casual",
  privacy: "public",
  status: "waiting",
}));

export function createLobby(host: string, hostRating: number, hostRank: string, mode: LobbyMode, privacy: LobbyPrivacy): Lobby {
  lobbySeq += 1;
  return {
    id: `lobby_new_${lobbySeq}_${Date.now()}`,
    code: genCode(),
    host,
    hostRating,
    hostRank,
    mode,
    privacy,
    status: "waiting",
  };
}

export function findLobbyByCode(code: string): Lobby | undefined {
  return PUBLIC_LOBBIES.find((l) => l.code.toLowerCase() === code.trim().toLowerCase());
}
