"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGameStore } from "@/store/game-store";
import { cardById } from "@/lib/cards-data";
import { rankNameFromPoints } from "@/lib/rank";

export default function ProfilePage() {
  const { profile, ownedCards, rerollUsername } = useAuth();
  const history = useGameStore((s) => s.history);
  const [rerolling, setRerolling] = useState(false);

  if (!profile) return null;

  const favCard = cardById(profile.starter_card_id ?? 101);
  const totalCards = ownedCards.length;
  const ownedCount = ownedCards.filter((o) => o.state === "owned").length;
  const collectionPct = totalCards ? ((ownedCount / totalCards) * 100).toFixed(1) : "0.0";
  const winRate = Math.round((profile.wins / Math.max(1, profile.wins + profile.losses)) * 100);
  const rank = rankNameFromPoints(profile.rank_points);

  const handleReroll = async () => {
    setRerolling(true);
    try {
      await rerollUsername();
    } finally {
      setRerolling(false);
    }
  };

  return (
    <div>
      <div className="mb-5.5">
        <h1 className="text-[22px] font-bold">Profile</h1>
      </div>

      <div className="mb-4.5 flex flex-col items-center gap-5 rounded-[14px] border border-line bg-panel p-6 sm:flex-row">
        <div className="flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-[14px] border-2 border-gold bg-gradient-to-br from-[#2a2a33] to-[#151519] font-display text-[28px] font-bold text-gold">
          {profile.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
            <h2 className="text-[22px] font-bold">{profile.username}</h2>
            <span className="rounded-md border border-[#3d8ff2]/35 bg-[#3d8ff2]/15 px-2.5 py-0.5 font-display text-[11px] font-bold uppercase tracking-wide text-[#6bb5ff]">
              {rank}
            </span>
          </div>
          <div className="mt-1 text-xs text-inkMute">
            Level {profile.level} · Member since Season 01{favCard ? ` · Starter card: ${favCard.name}` : ""}
          </div>
          <button
            onClick={handleReroll}
            disabled={rerolling}
            className="mt-2 text-[11px] font-semibold text-bloodBright hover:underline disabled:opacity-50"
          >
            {rerolling ? "Rerolling…" : "🎲 Reroll username"}
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatBox value={profile.wins} label="Wins" />
        <StatBox value={profile.losses} label="Losses" />
        <StatBox value={`${winRate}%`} label="Win Rate" color="#4fbf6a" />
        <StatBox value={profile.win_streak} label="Win Streak" color="#e8b44d" />
        <StatBox value={`${collectionPct}%`} label="Collection" />
      </div>

      <h3 className="mb-3 text-sm tracking-wide text-inkDim">Recent Battles</h3>
      <div className="rounded-xl border border-line bg-panel py-1.5">
        {history.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-inkMute">No battles yet — head to Battle and queue up.</div>
        )}
        {history.map((b) => (
          <div key={b.id} className="flex items-center justify-between border-b border-lineSoft px-4 py-2.5 text-[12.5px] last:border-none">
            <span>vs {b.opponent}</span>
            <div className="flex items-center gap-2.5">
              <span className="text-inkMute">{b.rankChange > 0 ? "+" : ""}{b.rankChange} RP</span>
              <span
                className={`rounded px-2 py-0.5 font-display text-[10.5px] font-bold tracking-wide ${
                  b.result === "win" ? "bg-[#4fbf6a]/15 text-[#4fbf6a]" : "bg-[#e0304a]/15 text-[#e0304a]"
                }`}
              >
                {b.result === "win" ? "WIN" : "LOSS"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBox({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="rounded-[10px] border border-line bg-panel p-3.5 text-center">
      <div className="font-display text-[21px] font-bold" style={color ? { color } : undefined}>{value}</div>
      <div className="mt-0.5 text-[9.5px] uppercase tracking-wide text-inkMute">{label}</div>
    </div>
  );
}
