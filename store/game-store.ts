"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Deck, BattleHistoryEntry, Lobby, LobbyMode, LobbyPrivacy } from "@/lib/types";
import { createLobby as buildLobby } from "@/lib/matchmaking";

/**
 * Local-only game state: deck composition, the recent-battles log, and the
 * demo lobby list. Identity, coins, and card ownership are NOT here anymore —
 * those are server-authoritative via Supabase (see components/auth/AuthProvider.tsx),
 * specifically so they can't be edited from devtools' Application/Storage tab.
 */
interface GameStore {
  decks: Deck[];
  activeDeckId: string;
  history: BattleHistoryEntry[];
  myLobbies: Lobby[];
  hasHydrated: boolean;

  setActiveDeck: (id: string) => void;
  toggleCardInDeck: (deckId: string, cardId: number) => void;
  renameDeck: (deckId: string, name: string) => void;
  createDeck: (name: string) => void;

  recordBattleHistory: (opponent: string, result: "win" | "loss", rankChange: number) => void;

  createLobbyAction: (hostName: string, hostRating: number, hostRank: string, mode: LobbyMode, privacy: LobbyPrivacy) => Lobby;
  findLobbyByCodeAction: (code: string) => Lobby | undefined;
  cancelLobby: (id: string) => void;

  setHydrated: () => void;
}

const MAX_DECK_SIZE = 8;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      decks: [],
      activeDeckId: "",
      history: [],
      myLobbies: [],
      hasHydrated: false,

      setActiveDeck: (id) => set({ activeDeckId: id }),

      toggleCardInDeck: (deckId, cardId) =>
        set((state) => ({
          decks: state.decks.map((d) => {
            if (d.id !== deckId) return d;
            const has = d.cardIds.includes(cardId);
            if (has) return { ...d, cardIds: d.cardIds.filter((id) => id !== cardId) };
            if (d.cardIds.length >= MAX_DECK_SIZE) return d;
            return { ...d, cardIds: [...d.cardIds, cardId] };
          }),
        })),

      renameDeck: (deckId, name) =>
        set((state) => ({
          decks: state.decks.map((d) => (d.id === deckId ? { ...d, name } : d)),
        })),

      createDeck: (name) =>
        set((state) => {
          const id = `deck-${Date.now()}`;
          return { decks: [...state.decks, { id, name, cardIds: [] }], activeDeckId: id };
        }),

      recordBattleHistory: (opponent, result, rankChange) =>
        set((state) => ({
          history: [{ id: `b-${Date.now()}`, opponent, result, rankChange }, ...state.history].slice(0, 12),
        })),

      createLobbyAction: (hostName, hostRating, hostRank, mode, privacy) => {
        const lobby = buildLobby(hostName, hostRating, hostRank, mode, privacy);
        set((s) => ({ myLobbies: [...s.myLobbies, lobby] }));
        return lobby;
      },

      findLobbyByCodeAction: (code) => {
        const normalized = code.trim().toLowerCase();
        return get().myLobbies.find((l) => l.code.toLowerCase() === normalized);
      },

      cancelLobby: (id) => set((s) => ({ myLobbies: s.myLobbies.filter((l) => l.id !== id) })),

      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "dvc-card-wars-local", // decks/history/lobbies only — never identity or currency
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

export const MAX_DECK_SIZE_EXPORT = MAX_DECK_SIZE;
