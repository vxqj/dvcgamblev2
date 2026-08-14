"use client";

import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { CRATES } from "@/lib/crates";
import Link from "next/link";

export default function BattleResultModal({
  reward,
  coinsTotal,
  onClose,
}: {
  reward: { coins: number; bonus: number; result: "win" | "loss" } | null;
  coinsTotal: number;
  onClose: () => void;
}) {
  if (!reward) return null;

  const nextCrate = CRATES.find((c) => c.cost > coinsTotal) ?? CRATES[0];
  const progressPct = Math.min(100, (coinsTotal / nextCrate.cost) * 100);
  const remaining = Math.max(0, nextCrate.cost - coinsTotal);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-[#040406]/90 p-5 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          className="w-full max-w-sm rounded-2xl border border-line bg-panel p-7 text-center"
        >
          <h2
            className={`mb-5 font-display text-3xl font-bold ${reward.result === "win" ? "text-[#4fbf6a]" : "text-[#e0304a]"}`}
          >
            {reward.result === "win" ? "VICTORY" : "DEFEAT"}
          </h2>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-1.5 font-display text-2xl font-bold text-gold"
          >
            +{reward.coins.toLocaleString()} Coins
          </motion.div>
          {reward.bonus > 0 && (
            <div className="mb-1.5 font-display text-sm font-bold text-bloodBright">
              +{reward.bonus} Win Streak Bonus
            </div>
          )}
          <div className="mb-6 text-xs text-inkMute">+{reward.result === "win" ? 150 : 50} XP</div>

          <div className="mb-6 rounded-xl border border-line bg-panel2 p-4 text-left">
            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-inkDim">
              <span style={{ color: nextCrate.color }}>{nextCrate.name} Progress</span>
              <span>{coinsTotal.toLocaleString()} / {nextCrate.cost.toLocaleString()}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-lineSoft">
              <div className="h-full rounded-full bg-gradient-to-r from-blood to-gold" style={{ width: `${progressPct}%` }} />
            </div>
            {remaining > 0 ? (
              <div className="mt-2 text-[11px] text-inkMute">{remaining.toLocaleString()} coins until next crate</div>
            ) : (
              <div className="mt-2 text-[11px] font-semibold text-gold">Ready to open!</div>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <Link href="/crates" onClick={onClose}>
              <Button className="w-full justify-center">Open Crates</Button>
            </Link>
            <Button variant="ghost" className="w-full justify-center" onClick={onClose}>
              Continue
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
