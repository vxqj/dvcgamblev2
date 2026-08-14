"use client";

import { useMemo, useState } from "react";
import Card from "@/components/cards/Card";
import CardModal from "@/components/cards/CardModal";
import RarityFilterRow from "@/components/cards/RarityFilterRow";
import { CARDS, UNLOCK_HINTS } from "@/lib/cards-data";
import { useAuth } from "@/components/auth/AuthProvider";
import { CardDef, RarityTier } from "@/lib/types";
import clsx from "clsx";

type OwnFilter = "all" | "owned" | "missing";

export default function CollectionPage() {
  const { ownedCards } = useAuth();
  const owned = Object.fromEntries(ownedCards.map((o) => [o.card_id, o]));
  const [rarities, setRarities] = useState<RarityTier[]>([]);
  const [ownFilter, setOwnFilter] = useState<OwnFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CardDef | null>(null);

  const toggleRarity = (id: RarityTier) =>
    setRarities((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));

  const ownedCount = Object.values(owned).filter((o) => o.state === "owned").length;
  const totalCount = CARDS.length;
  const pct = ((ownedCount / totalCount) * 100).toFixed(1);

  const filtered = useMemo(() => {
    return CARDS.filter((c) => {
      const isOwned = owned[c.id]?.state === "owned";
      if (ownFilter === "owned" && !isOwned) return false;
      if (ownFilter === "missing" && isOwned) return false;
      if (rarities.length && !rarities.includes(c.rarity)) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [owned, ownFilter, rarities, search]);

  return (
    <div>
      <div className="mb-5.5">
        <h1 className="text-[22px] font-bold">Collection</h1>
        <div className="mt-0.5 text-xs text-inkMute">DVC card library</div>
      </div>

      <div className="mb-4.5 flex flex-col items-center gap-3.5 rounded-xl border border-line bg-panel px-5 py-4 sm:flex-row">
        <div className="whitespace-nowrap font-display text-2xl font-bold">
          {ownedCount} / {totalCount}
        </div>
        <div className="h-2 w-full flex-1 overflow-hidden rounded-full bg-lineSoft">
          <div className="h-full rounded-full bg-gradient-to-r from-blood to-gold" style={{ width: `${pct}%` }} />
        </div>
        <div className="whitespace-nowrap font-display text-sm font-bold text-gold">{pct}% COMPLETE</div>
      </div>

      <RarityFilterRow active={rarities} onToggle={toggleRarity} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", "owned", "missing"] as OwnFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setOwnFilter(f)}
            className={clsx(
              "rounded-[7px] border px-3.5 py-1.5 font-display text-[11.5px] font-bold uppercase tracking-wide",
              ownFilter === f ? "border-blood bg-bloodDim text-white" : "border-line bg-panel text-inkDim"
            )}
          >
            {f === "all" ? "All" : f === "owned" ? "Owned" : "Not Owned"}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cards…"
          className="ml-auto w-[200px] rounded-[7px] border border-line bg-panel px-3 py-2 text-[12.5px] text-ink placeholder:text-inkMute"
        />
      </div>

      <div className="grid grid-cols-3 gap-3.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {filtered.map((c) => {
          const isOwned = owned[c.id]?.state === "owned";
          const hint = UNLOCK_HINTS[c.id];
          return (
            <div key={c.id}>
              <Card card={c} locked={!isOwned} onClick={() => isOwned && setSelected(c)} />
              {!isOwned && hint && (
                <div className="mt-1 text-center text-[9.5px] leading-tight text-inkMute">{hint}</div>
              )}
            </div>
          );
        })}
      </div>

      <CardModal card={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
