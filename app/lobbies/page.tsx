"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import BattleArena from "@/components/battle/BattleArena";
import { useGameStore } from "@/store/game-store";
import { useAuth } from "@/components/auth/AuthProvider";
import { cardById } from "@/lib/cards-data";
import { rankNameFromPoints } from "@/lib/rank";
import { PUBLIC_LOBBIES } from "@/lib/matchmaking";
import { Lobby, LobbyMode, LobbyPrivacy } from "@/lib/types";

export default function LobbiesPage() {
  const decks = useGameStore((s) => s.decks);
  const activeDeckId = useGameStore((s) => s.activeDeckId);
  const { profile } = useAuth();
  const username = profile?.username ?? "Player";
  const rankPoints = profile?.rank_points ?? 0;
  const rank = rankNameFromPoints(rankPoints);
  const myLobbies = useGameStore((s) => s.myLobbies);
  const createLobbyAction = useGameStore((s) => s.createLobbyAction);
  const findLobbyByCodeAction = useGameStore((s) => s.findLobbyByCodeAction);
  const cancelLobby = useGameStore((s) => s.cancelLobby);

  const activeDeck = decks.find((d) => d.id === activeDeckId) ?? decks[0];
  const playerCards = useMemo(
    () => (activeDeck ? activeDeck.cardIds.map((id) => cardById(id)!).filter(Boolean) : []),
    [activeDeck]
  );

  const [mode, setMode] = useState<LobbyMode>("ranked");
  const [privacy, setPrivacy] = useState<LobbyPrivacy>("public");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [activeOpponent, setActiveOpponent] = useState<{ name: string; rank: string } | null>(null);

  const myOpenLobby = myLobbies[myLobbies.length - 1] ?? null;

  const handleCreate = () => {
    createLobbyAction(username, rankPoints || 1000, rank, mode, privacy);
  };

  const handleJoinPublic = (lobby: Lobby) => {
    setActiveOpponent({ name: lobby.host, rank: lobby.hostRank });
  };

  const handleJoinCode = () => {
    const lobby = findLobbyByCodeAction(joinCode) ?? PUBLIC_LOBBIES.find((l) => l.code.toLowerCase() === joinCode.trim().toLowerCase());
    if (!lobby) {
      setJoinError("Code doesn't exist. Note: without a shared backend, lobby codes only work between browser tabs/devices signed into the same account — a friend on their own device can't join yet.");
      return;
    }
    setJoinError(null);
    setActiveOpponent({ name: lobby.host, rank: lobby.hostRank });
  };

  if (activeOpponent) {
    return (
      <BattleArena
        playerCards={playerCards}
        deckName={activeDeck?.name ?? "Deck"}
        opponentName={activeOpponent.name}
        opponentRank={activeOpponent.rank}
        onExit={() => setActiveOpponent(null)}
      />
    );
  }

  return (
    <div>
      <div className="mb-5.5">
        <h1 className="text-[22px] font-bold">Battle Lobbies</h1>
        <div className="mt-0.5 text-xs text-inkMute">Create your own room or join someone else&rsquo;s</div>
      </div>

      {!myOpenLobby ? (
        <div className="mb-6 rounded-xl border border-line bg-panel p-5">
          <div className="mb-3.5 text-[12.5px] tracking-wide text-inkDim">CREATE BATTLE</div>
          <div className="mb-3.5">
            <div className="mb-1.5 text-[10.5px] uppercase tracking-wide text-inkMute">Mode</div>
            <div className="flex gap-1.5">
              {(["ranked", "casual", "custom"] as LobbyMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={clsx(
                    "rounded-[7px] border px-3.5 py-1.5 font-display text-[11.5px] font-bold uppercase tracking-wide",
                    mode === m ? "border-blood bg-bloodDim text-white" : "border-line bg-panel2 text-inkDim"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4.5">
            <div className="mb-1.5 text-[10.5px] uppercase tracking-wide text-inkMute">Privacy</div>
            <div className="flex gap-1.5">
              {(["public", "private"] as LobbyPrivacy[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPrivacy(p)}
                  className={clsx(
                    "rounded-[7px] border px-3.5 py-1.5 font-display text-[11.5px] font-bold uppercase tracking-wide",
                    privacy === p ? "border-blood bg-bloodDim text-white" : "border-line bg-panel2 text-inkDim"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleCreate}>Create</Button>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-gold/40 bg-panel p-6 text-center">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-inkMute">Battle Lobby</div>
          <div className="mb-3 font-display text-2xl font-bold text-gold">{myOpenLobby.code}</div>
          <div className="mb-4 text-xs text-inkMute">Host: {myOpenLobby.host} · Waiting for opponent…</div>
          <div className="flex justify-center gap-2.5">
            <Button
              variant="ghost"
              onClick={() => navigator.clipboard?.writeText(myOpenLobby.code)}
            >
              Copy Code
            </Button>
            <Button variant="ghost" onClick={() => cancelLobby(myOpenLobby.id)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="mb-4.5 rounded-xl border border-line bg-panel p-4">
        <div className="mb-2 text-[12.5px] tracking-wide text-inkDim">JOIN PRIVATE BATTLE</div>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="DVC-XXXX"
            className="flex-1 rounded-lg border border-line bg-panel2 px-3 py-2 text-[13px] uppercase tracking-wide text-ink placeholder:text-inkMute"
          />
          <Button variant="ghost" onClick={handleJoinCode}>Join</Button>
        </div>
        {joinError && <div className="mt-2 text-[11px] text-bloodBright">{joinError}</div>}
      </div>

      <h3 className="mb-3 text-sm tracking-wide text-inkDim">Public Battles</h3>
      <div className="rounded-xl border border-line bg-panel py-1.5">
        {[...myLobbies.filter((l) => l.privacy === "public"), ...PUBLIC_LOBBIES].map((lobby) => (
          <div key={lobby.id} className="flex items-center gap-3.5 border-b border-lineSoft px-4 py-3 text-[12.5px] last:border-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-line bg-gradient-to-br from-[#2a2a33] to-[#151519] font-display text-xs font-bold">
              {lobby.host.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{lobby.host}</div>
              <div className="text-[10.5px] text-inkMute">{lobby.hostRank} · {lobby.hostRating.toLocaleString()} rating · {lobby.mode}</div>
            </div>
            <Button variant="ghost" onClick={() => handleJoinPublic(lobby)}>Join</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
