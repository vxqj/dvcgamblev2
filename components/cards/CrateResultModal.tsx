"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CrateOpenResult } from "@/lib/progression";
import { rarityMeta } from "@/lib/rarities";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";

export default function CrateResultModal({ result, onClose }: { result: CrateOpenResult | null; onClose: () => void }) {
  if (!result) return null;
  const rm = rarityMeta(result.card.rarity);
  const dramatic = rm.tier >= 5; // Legendary and up get the full-screen treatment

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-[#040406]/90 p-5 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: dramatic ? 0.8 : 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="flex flex-col items-center text-center"
        >
          {result.isNewCard ? (
            <>
              <div className="mb-2 font-display text-sm font-bold uppercase tracking-[0.14em]" style={{ color: rm.color }}>
                {rm.name}
              </div>
              <motion.div
                animate={dramatic ? { scale: [1, 1.06, 1] } : undefined}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="mb-5 w-[200px]"
              >
                <Card card={result.card} showLevel={false} />
              </motion.div>
              <h2 className="mb-1.5 text-2xl font-bold">{result.card.name}</h2>
              <div className="mb-6 font-display text-xs font-bold uppercase tracking-wide text-gold">
                ⭐ New Card · Added to Collection
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 w-[160px] opacity-70">
                <Card card={result.card} showLevel={false} />
              </div>
              <h2 className="mb-1.5 text-xl font-bold">Duplicate</h2>
              <div className="mb-2 text-sm text-inkDim">{result.card.name}</div>
              <div className="mb-2 font-display text-lg font-bold text-gold">
                +{result.shardsGained} {result.card.name} Shards
              </div>
              <div className="mb-6 w-64">
                <div className="mb-1 flex justify-between text-[10.5px] text-inkMute">
                  <span>{result.shardsAfter} / {result.shardsNeeded} Shards</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-lineSoft">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blood to-gold"
                    style={{ width: `${Math.min(100, (result.shardsAfter / result.shardsNeeded) * 100)}%` }}
                  />
                </div>
              </div>
            </>
          )}
          <Button onClick={onClose}>Continue</Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
