"use client";

import { CardDef } from "@/lib/types";
import { rarityMeta } from "@/lib/rarities";
import clsx from "clsx";
import { motion } from "framer-motion";

interface CardProps {
  card: CardDef;
  locked?: boolean;
  showLevel?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

export default function Card({ card, locked = false, showLevel = true, size = "md", onClick, className }: CardProps) {
  const rm = rarityMeta(card.rarity);

  return (
    <motion.div
      whileHover={locked ? undefined : { y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={clsx(
        "card-shell relative aspect-[5/7] w-full cursor-pointer rounded-xl border-[1.5px] bg-[#0e0e12]",
        locked && "locked",
        className
      )}
      data-foil={locked ? "none" : rm.foil}
      style={{ borderColor: rm.color, ["--rc" as string]: rm.color }}
    >
      <div
        className="pointer-events-none absolute inset-[-1px] rounded-xl"
        style={{ boxShadow: `0 0 0 1px ${rm.color} inset, 0 0 22px -4px ${rm.color}` }}
      />

      <div className="card-art absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1c1c24] to-[#0a0a0d]">
        <span className="font-display text-[15%] font-bold text-white/5" style={{ fontSize: size === "lg" ? 64 : 40 }}>
          {card.name[0]}
        </span>
      </div>

      <div className="absolute inset-x-0 top-0 z-[3] flex items-start justify-between p-2">
        <span
          className="rounded bg-black/55 px-1.5 py-0.5 font-display text-[8.5px] font-bold uppercase tracking-wide"
          style={{ color: rm.color, border: `1px solid ${rm.color}` }}
        >
          {rm.name}
        </span>
        {showLevel && !locked && (
          <span className="rounded bg-black/55 px-1.5 py-0.5 font-display text-[9.5px] font-bold text-white">
            Lv {card.level}
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[3] px-2.5 pb-2.5 pt-9" style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.88) 55%)" }}>
        <div className="mb-1 font-display text-[12.5px] font-bold leading-tight">
          {locked ? "???" : card.name}
        </div>
        {!locked && (
          <div className="flex gap-2 font-display text-[10px] font-bold">
            <span className="flex items-center gap-0.5 text-[#ff6b6b]">⚔ {card.atk}</span>
            <span className="flex items-center gap-0.5 text-[#6bdc7f]">♥ {card.hp}</span>
            <span className="flex items-center gap-0.5 text-[#6bb5ff]">➤ {card.spd}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
