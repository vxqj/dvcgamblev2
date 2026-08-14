"use client";

import { useMemo } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import MatchmakingScreen from "@/components/battle/MatchmakingScreen";
import BattleArena from "@/components/battle/BattleArena";
import { useGameStore } from "@/store/game-store";
import { useAuth } from "@/components/auth/AuthProvider";
import { cardById } from "@/lib/cards-data";
import { rankNameFromPoints } from "@/lib/rank";
import { useMatchmaking } from "@/lib/use-matchmaking";

export default function BattlePage() {
  const decks = useGameStore((s) => s.decks);
  const activeDeckId = useGameStore((s) => s.activeDeckId);
  const { profile } = useAuth();
  const rankPoints = profile?.rank_points ?? 0;
  const rank = rankNameFromPoints(rankPoints);

  const activeDeck = decks.find((d) => d.id === activeDeckId) ?? decks[0];
  const playerCards = useMemo(
    () => (activeDeck ? activeDeck.cardIds.map((id) => cardById(id)!).filter(Boolean) : []),
    [activeDeck]
  );

  const { state, joinQueue, leaveQueue, confirmStart } = useMatchmaking(rankPoints || 1000);

  const deckReady = playerCards.length >= 2;

  if (state.status === "starting" && state.opponent) {
    return (
      <BattleArena
        playerCards={playerCards}
        deckName={activeDeck?.name ?? "Deck"}
        opponentName={state.opponent.username}
        opponentRank={state.opponent.rank}
        onExit={leaveQueue}
      />
    );
  }

  return (
    <div>
      <div className="mb-5.5">
        <h1 className="text-[22px] font-bold">Battle</h1>
        <div className="mt-0.5 text-xs text-inkMute">Queue for ranked, or create/join a lobby</div>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-[14px] border border-line bg-[linear-gradient(120deg,#14090c_0%,#0c0c10_55%,#0a0d12_100%)] p-7 text-center">
        <div className="mb-1.5 font-display text-[11px] font-bold tracking-[0.16em] text-bloodBright">
          {activeDeck?.name.toUpperCase() ?? "NO DECK"} · {rank}
        </div>
        <h2 className="mb-4 font-display text-3xl font-bold">READY TO BATTLE?</h2>
        {!deckReady && (
          <p className="mb-4 text-xs text-inkDim">
            Your deck needs at least 2 cards. <Link href="/decks" className="text-bloodBright">Edit your deck</Link>.
          </p>
        )}
        <Button onClick={joinQueue} disabled={!deckReady} className="px-10 py-3.5 text-base">
          PLAY
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/lobbies" className="rounded-[10px] border border-line bg-panel p-4 transition-all hover:-translate-y-0.5 hover:border-bloodDim hover:bg-panel2">
          <h4 className="mb-0.5 text-[13.5px] font-semibold">Create Battle</h4>
          <p className="text-[11px] text-inkMute">Set up a ranked, casual, or custom lobby</p>
        </Link>
        <Link href="/lobbies" className="rounded-[10px] border border-line bg-panel p-4 transition-all hover:-translate-y-0.5 hover:border-bloodDim hover:bg-panel2">
          <h4 className="mb-0.5 text-[13.5px] font-semibold">Join Battle</h4>
          <p className="text-[11px] text-inkMute">Browse public lobbies or enter a room code</p>
        </Link>
      </div>

      <MatchmakingScreen state={state} onCancel={leaveQueue} onReady={confirmStart} />
    </div>
  );
}
