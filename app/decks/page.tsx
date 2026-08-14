"use client";

import { useMemo, useState } from "react";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import { useGameStore, MAX_DECK_SIZE_EXPORT } from "@/store/game-store";
import { useAuth } from "@/components/auth/AuthProvider";
import { cardById, ALL_CARDS } from "@/lib/cards-data";
import { rarityMeta } from "@/lib/rarities";
import clsx from "clsx";

export default function DecksPage() {
  const decks = useGameStore((s) => s.decks);
  const toggleCardInDeck = useGameStore((s) => s.toggleCardInDeck);
  const createDeck = useGameStore((s) => s.createDeck);
  const { ownedCards: authOwnedCards } = useAuth();

  const [activeTab, setActiveTab] = useState(decks[0]?.id ?? "");
  const deck = decks.find((d) => d.id === activeTab) ?? decks[0];

  const ownedCards = useMemo(
    () => ALL_CARDS.filter((c) => authOwnedCards.find((o) => o.card_id === c.id)?.state === "owned"),
    [authOwnedCards]
  );

  const stats = useMemo(() => {
    if (!deck) return { atk: 0, hp: 0, spd: 0, avgEnergy: "0.0" };
    const cards = deck.cardIds.map((id) => cardById(id)).filter(Boolean) as ReturnType<typeof cardById>[];
    const atk = cards.reduce((s, c) => s + (c?.atk ?? 0), 0);
    const hp = cards.reduce((s, c) => s + (c?.hp ?? 0), 0);
    const spd = cards.reduce((s, c) => s + (c?.spd ?? 0), 0);
    const avgEnergy = cards.length ? (cards.reduce((s, c) => s + (c?.energyCost ?? 0), 0) / cards.length).toFixed(1) : "0.0";
    return { atk, hp, spd, avgEnergy };
  }, [deck]);

  if (!deck) {
    return (
      <div>
        <h1 className="mb-2 text-[22px] font-bold">Deck Builder</h1>
        <p className="text-sm text-inkMute">Head to Battle first — a starter deck is created automatically once you pick your first card.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5.5 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">Deck Builder</h1>
          <div className="mt-0.5 text-xs text-inkMute">{deck.name} · active deck</div>
        </div>
      </div>

      <div className="mb-4.5 flex flex-wrap gap-1.5">
        {decks.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveTab(d.id)}
            className={clsx(
              "rounded-[7px] border px-4 py-2 font-display text-xs font-bold uppercase tracking-wide",
              d.id === activeTab ? "border-blood bg-bloodDim text-white" : "border-line bg-panel text-inkDim"
            )}
          >
            {d.name}
          </button>
        ))}
        <button
          onClick={() => createDeck(`New Deck ${decks.length + 1}`)}
          className="rounded-[7px] border border-line bg-panel px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-inkDim"
        >
          + New Deck
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-[1.4fr_320px]">
        <div>
          <div className="grid grid-cols-3 gap-3.5 sm:grid-cols-4 md:grid-cols-5">
            {ownedCards.map((c) => {
              const inDeck = deck.cardIds.includes(c.id);
              return (
                <div key={c.id} className="relative">
                  <Card card={c} onClick={() => toggleCardInDeck(deck.id, c.id)} className={inDeck ? "ring-2 ring-bloodBright" : ""} />
                  {inDeck && (
                    <div className="pointer-events-none absolute right-1.5 top-1.5 z-[4] flex h-5 w-5 items-center justify-center rounded-full bg-bloodBright text-[10px] font-bold text-white">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-panel p-4.5">
          <div className="mb-3.5 text-[12.5px] tracking-wide text-inkDim">
            DECK STATS · {deck.cardIds.length}/{MAX_DECK_SIZE_EXPORT} CARDS
          </div>
          <div className="mb-3.5 grid grid-cols-2 gap-2.5">
            <DStat label="Attack" value={stats.atk} color="#ff6b6b" />
            <DStat label="Defence" value={stats.hp} color="#6bdc7f" />
            <DStat label="Speed" value={stats.spd} color="#6bb5ff" />
            <DStat label="Avg Energy" value={stats.avgEnergy} />
          </div>
          <div className="flex max-h-[520px] flex-col gap-1.5 overflow-y-auto">
            {deck.cardIds.map((id) => {
              const c = cardById(id);
              if (!c) return null;
              const rm = rarityMeta(c.rarity);
              return (
                <div key={id} className="flex items-center gap-2.5 rounded-lg border border-line bg-panel2 px-2.5 py-2">
                  <div className="h-10 w-7.5 shrink-0 rounded border-[1.5px]" style={{ borderColor: rm.color }} />
                  <div className="flex-1 text-xs font-semibold">{c.name}</div>
                  <button onClick={() => toggleCardInDeck(deck.id, id)} className="text-base leading-none text-inkMute hover:text-bloodBright">
                    ✕
                  </button>
                </div>
              );
            })}
            {deck.cardIds.length === 0 && (
              <div className="py-6 text-center text-xs text-inkMute">Tap cards to add them to this deck.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DStat({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="rounded-[9px] border border-line bg-panel2 px-3.5 py-2.5">
      <div className="mb-1 text-[10px] uppercase tracking-wide text-inkMute">{label}</div>
      <div className="font-display text-[19px] font-bold" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}
