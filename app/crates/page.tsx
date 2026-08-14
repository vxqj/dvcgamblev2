"use client";

import { useState } from "react";
import { CRATES } from "@/lib/crates";
import { rarityMeta } from "@/lib/rarities";
import { cardById } from "@/lib/cards-data";
import { useAuth } from "@/components/auth/AuthProvider";
import Button from "@/components/ui/Button";
import CrateResultModal from "@/components/cards/CrateResultModal";
import { CrateTier } from "@/lib/types";
import { CrateOpenResult } from "@/lib/progression";

export default function CratesPage() {
  const { profile, ownedCards, openCrate } = useAuth();
  const [expanded, setExpanded] = useState<CrateTier | null>(null);
  const [result, setResult] = useState<CrateOpenResult | null>(null);
  const [opening, setOpening] = useState<CrateTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const coins = profile?.coins ?? 0;

  const handleOpen = async (crateId: CrateTier) => {
    setError(null);
    setOpening(crateId);
    try {
      const res = await openCrate(crateId);
      const card = cardById(res.cardId);
      if (!card) throw new Error("Unknown card returned");
      const owned = ownedCards.find((o) => o.card_id === res.cardId);
      setResult({
        card,
        isNewCard: res.isNewCard,
        shardsGained: res.shardsGained,
        shardsAfter: owned?.shards ?? res.shardsGained,
        shardsNeeded: res.shardsNeeded,
        justUnlockedFromShards: false,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't open that crate.");
    } finally {
      setOpening(null);
    }
  };

  return (
    <div>
      <div className="mb-5.5 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">Crates</h1>
          <div className="mt-0.5 text-xs text-inkMute">Spend coins from battles to unlock new cards</div>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-[12.5px] font-semibold">
          <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_6px_theme(colors.gold)]" />
          {coins.toLocaleString()}
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg border border-bloodBright/40 bg-bloodBright/10 px-3.5 py-2.5 text-xs text-bloodBright">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CRATES.map((crate) => {
          const canAfford = coins >= crate.cost;
          const isOpen = expanded === crate.id;
          const isOpening = opening === crate.id;
          return (
            <div
              key={crate.id}
              className="flex flex-col rounded-2xl border p-5 text-center"
              style={{ borderColor: `${crate.color}55`, background: `linear-gradient(160deg, ${crate.color}14, transparent 70%)` }}
            >
              <div
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 font-display text-3xl"
                style={{ borderColor: crate.color, boxShadow: `0 0 24px -6px ${crate.color}` }}
              >
                📦
              </div>
              <h3 className="mb-1 font-display text-base font-bold uppercase tracking-wide" style={{ color: crate.color }}>
                {crate.name}
              </h3>
              <div className="mb-4 font-display text-lg font-bold text-gold">🪙 {crate.cost.toLocaleString()}</div>

              <button
                onClick={() => setExpanded(isOpen ? null : crate.id)}
                className="mb-3 text-[11px] font-semibold text-inkMute underline decoration-dotted underline-offset-2"
              >
                {isOpen ? "Hide odds" : "View odds"}
              </button>

              {isOpen && (
                <div className="mb-4 flex flex-col gap-1.5 rounded-lg border border-line bg-panel2 p-3 text-left">
                  {crate.odds.map((o) => {
                    const rm = rarityMeta(o.rarity);
                    return (
                      <div key={o.rarity} className="flex items-center justify-between text-[11px]">
                        <span style={{ color: rm.color }}>{rm.name}</span>
                        <span className="font-display font-bold text-inkDim">{Math.round(o.chance * 100)}%</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-auto">
                <Button
                  className="w-full justify-center"
                  disabled={!canAfford || isOpening}
                  onClick={() => handleOpen(crate.id)}
                >
                  {isOpening ? "Opening…" : canAfford ? "Open" : "Not Enough Coins"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <CrateResultModal result={result} onClose={() => setResult(null)} />
    </div>
  );
}
