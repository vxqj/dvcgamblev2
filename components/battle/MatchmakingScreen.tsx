"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { MatchmakingState } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { rankNameFromPoints } from "@/lib/rank";

export default function MatchmakingScreen({
  state,
  onCancel,
  onReady,
}: {
  state: MatchmakingState;
  onCancel: () => void;
  onReady: () => void;
}) {
  const { profile } = useAuth();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (state.status !== "found") return;
    setCountdown(3);
    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(iv);
          return 0;
        }
        return c - 1;
      });
    }, 700);
    return () => clearInterval(iv);
  }, [state.status]);

  useEffect(() => {
    if (state.status === "found" && countdown === 0) {
      onReady();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, state.status]);

  if (state.status === "idle") return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-bg/97 backdrop-blur-md">
      <AnimatePresence mode="wait">
        {state.status === "searching" && (
          <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-6 h-14 w-14 rounded-full border-[3px] border-lineSoft border-t-bloodBright"
            />
            <h2 className="mb-2 font-display text-xl font-bold uppercase tracking-wide">Searching for opponent…</h2>
            <div className="mb-1 text-xs text-inkMute">Players in queue: {state.playersInQueue}</div>
            <div className="mb-6 text-xs text-inkMute">Rating search: ±{state.ratingBand}</div>
            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          </motion.div>
        )}

        {(state.status === "found" || state.status === "starting") && state.opponent && (
          <motion.div key="found" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="mb-6 font-display text-xs font-bold uppercase tracking-[0.16em] text-gold">Match Found</div>
            <div className="mb-6 flex items-center justify-center gap-8">
              <PlayerBadge name={profile?.username ?? "You"} rank={rankNameFromPoints(profile?.rank_points ?? 0)} />
              <div className="font-display text-lg font-bold text-inkMute">VS</div>
              <PlayerBadge name={state.opponent.username} rank={state.opponent.rank} />
            </div>
            <div className="mb-1 font-display text-xs font-bold uppercase tracking-wide text-inkMute">Ranked</div>
            <motion.div key={countdown} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-5xl font-bold text-bloodBright">
              {countdown > 0 ? countdown : "GO"}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlayerBadge({ name, rank }: { name: string; rank: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-line bg-gradient-to-br from-[#2a2a33] to-[#151519] font-display text-xl font-bold">
        {name.slice(0, 2).toUpperCase()}
      </div>
      <div className="text-[13px] font-bold">{name}</div>
      <div className="text-[10.5px] text-inkMute">{rank}</div>
    </div>
  );
}
