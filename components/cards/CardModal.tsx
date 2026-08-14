"use client";

import { CardDef } from "@/lib/types";
import { rarityMeta } from "@/lib/rarities";
import { ABILITY_LABELS } from "@/lib/cards-data";
import Card from "./Card";
import { AnimatePresence, motion } from "framer-motion";

export default function CardModal({ card, onClose }: { card: CardDef | null; onClose: () => void }) {
  if (!card) return null;
  const rm = rarityMeta(card.rarity);
  const ability = ABILITY_LABELS[card.ability];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#040406]/82 p-5 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex w-full max-w-[640px] flex-col gap-7 rounded-2xl border border-line bg-panel p-7.5 md:flex-row"
        >
          <button onClick={onClose} className="absolute right-4 top-3.5 text-xl text-inkMute hover:text-ink">
            ✕
          </button>
          <div className="mx-auto w-[160px] shrink-0 md:mx-0 md:w-[220px]">
            <Card card={card} size="lg" />
          </div>
          <div className="flex-1">
            <div className="mb-1.5 font-display text-xs font-bold uppercase tracking-wider" style={{ color: rm.color }}>
              {rm.name} · #{String(card.id).padStart(3, "0")}
            </div>
            <h2 className="mb-3.5 text-2xl font-bold">{card.name}</h2>
            <div className="mb-4 flex gap-5">
              <Stat label="Attack" value={card.atk} color="#ff6b6b" />
              <Stat label="Health" value={card.hp} color="#6bdc7f" />
              <Stat label="Speed" value={card.spd} color="#6bb5ff" />
              <Stat label="Level" value={card.level} />
            </div>
            <div className="mb-3.5 rounded-[10px] border border-line bg-panel2 px-3.5 py-3">
              <b className="mb-1 block font-display text-[12.5px] font-bold uppercase tracking-wide text-gold">
                {ability.name}
              </b>
              <p className="text-xs text-inkDim">{ability.desc}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-[11px] text-inkMute">
              <span>XP {card.xp.toLocaleString()} / {card.xpToNext.toLocaleString()}</span>
              <span>Value {card.value.toLocaleString()}</span>
              <span>Serial {card.serial}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="font-display text-xl font-bold" style={color ? { color } : undefined}>
        {value}
      </div>
      <div className="text-[9.5px] uppercase text-inkMute">{label}</div>
    </div>
  );
}
