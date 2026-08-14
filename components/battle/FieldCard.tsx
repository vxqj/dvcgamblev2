"use client";

import { BattleCardInstance } from "@/lib/types";
import { rarityMeta } from "@/lib/rarities";
import { AnimatePresence, motion } from "framer-motion";

export default function FieldCard({
  card,
  attackingSide,
  dmg,
  dmgKey,
}: {
  card: BattleCardInstance;
  attackingSide?: "player" | "enemy" | null;
  dmg?: number | null;
  dmgKey?: number;
}) {
  const rm = rarityMeta(card.def.rarity);
  const animClass =
    attackingSide === "player" ? "attacking-player" : attackingSide === "enemy" ? "attacking-enemy" : "";

  return (
    <div className="relative h-[120px] w-[88px]">
      <div
        className={`card-shell field-card relative h-[120px] w-[88px] rounded-[10px] border-[1.5px] bg-[#0e0e12] ${animClass}`}
        data-foil={rm.foil}
        style={{ borderColor: rm.color, ["--rc" as string]: rm.color }}
      >
        <div className="card-art absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1c1c24] to-[#0a0a0d]">
          <span className="font-display text-2xl font-bold text-white/5">{card.def.name[0]}</span>
        </div>
        <div className="absolute inset-x-0 top-1 flex justify-center">
          <span
            className="rounded bg-black/55 px-1.5 py-0.5 font-display text-[7.5px] font-bold uppercase"
            style={{ color: rm.color, border: `1px solid ${rm.color}` }}
          >
            {rm.name}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-1.5 pb-1.5 pt-6" style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.9) 55%)" }}>
          <div className="mb-0.5 truncate font-display text-[10px] font-bold">{card.def.name}</div>
          <div className="flex gap-1.5 font-display text-[9px] font-bold">
            <span className="text-[#ff6b6b]">⚔ {card.atk}</span>
            <span className="text-[#6bdc7f]">♥ {Math.max(0, card.currentHp)}</span>
          </div>
        </div>
        {card.shielded && (
          <div className="absolute right-1 top-1 text-[13px]" title="Shielded">🛡</div>
        )}
        {card.statuses.length > 0 && (
          <div className="absolute left-1 top-6 flex flex-col gap-0.5">
            {card.statuses.map((s) => (
              <span key={s.id} className="rounded bg-black/60 px-1 text-[8px] font-bold uppercase text-inkDim">
                {s.id}
              </span>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {dmg !== null && dmg !== undefined && (
          <motion.div
            key={dmgKey}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="pointer-events-none absolute -top-1.5 right-2 z-10 font-display text-2xl font-bold text-bloodBright"
            style={{ textShadow: "0 0 10px rgba(255,51,85,0.8)" }}
          >
            {dmg === 0 ? "DODGE" : `-${dmg}`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
