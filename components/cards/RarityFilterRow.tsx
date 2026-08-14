"use client";

import { RARITIES } from "@/lib/rarities";
import { RarityTier } from "@/lib/types";
import clsx from "clsx";

export default function RarityFilterRow({
  active,
  onToggle,
}: {
  active: RarityTier[];
  onToggle: (id: RarityTier) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {RARITIES.map((r) => {
        const on = active.includes(r.id);
        return (
          <button
            key={r.id}
            onClick={() => onToggle(r.id)}
            className={clsx(
              "rounded-full border px-2.5 py-1 font-display text-[10.5px] font-bold uppercase tracking-wide transition-colors",
              on ? "text-[#0a0a0a]" : "bg-panel text-inkDim"
            )}
            style={{ borderColor: r.color, background: on ? r.color : undefined, color: on ? "#0a0a0a" : r.color }}
          >
            {r.name}
          </button>
        );
      })}
    </div>
  );
}
