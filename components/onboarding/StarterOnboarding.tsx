"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STARTER_CARDS } from "@/lib/cards-data";
import { ABILITY_LABELS } from "@/lib/cards-data";
import { rarityMeta } from "@/lib/rarities";
import { CardDef } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGameStore } from "@/store/game-store";
import { STARTER_FILLERS } from "@/lib/cards-data";
import Button from "@/components/ui/Button";
import Card from "@/components/cards/Card";

type Step = "pick" | "confirm" | "reveal";

export default function StarterOnboarding() {
  const { chooseStarter } = useAuth();
  const createDeck = useGameStore((s) => s.createDeck);
  const toggleCardInDeck = useGameStore((s) => s.toggleCardInDeck);
  const decks = useGameStore((s) => s.decks);
  const [step, setStep] = useState<Step>("pick");
  const [selected, setSelected] = useState<CardDef | null>(null);
  const [finishing, setFinishing] = useState(false);

  const handlePick = (card: CardDef) => {
    setSelected(card);
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (!selected) return;
    setStep("reveal");
  };

  const handleFinish = async () => {
    if (!selected || finishing) return;
    setFinishing(true);
    await chooseStarter(selected.id);
    if (decks.length === 0) {
      createDeck("Starter Deck");
      // toggleCardInDeck needs a deck id — grab whatever createDeck just made active.
      const newDeckId = useGameStore.getState().activeDeckId;
      toggleCardInDeck(newDeckId, selected.id);
      for (const filler of STARTER_FILLERS) toggleCardInDeck(newDeckId, filler.id);
    }
    // profile.has_chosen_starter is now true — AppShell swaps to the real app automatically.
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-y-auto bg-bg px-5 py-10">
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 900px 500px at 50% -10%, rgba(200,30,58,0.14), transparent 60%)" }}
      />

      <AnimatePresence mode="wait">
        {step === "pick" && (
          <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 w-full max-w-5xl text-center">
            <div className="mb-1.5 font-display text-[11px] font-bold tracking-[0.16em] text-bloodBright">
              WELCOME TO DVC CARD WARS
            </div>
            <h1 className="mb-8 font-display text-3xl font-bold md:text-4xl">Choose your first card.</h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {STARTER_CARDS.map((c) => (
                <StarterCard key={c.id} card={c} onClick={() => handlePick(c)} />
              ))}
            </div>
          </motion.div>
        )}

        {step === "confirm" && selected && (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 w-[220px]">
              <Card card={selected} size="lg" showLevel={false} />
            </div>
            <h2 className="mb-2 font-display text-2xl font-bold">Are you sure?</h2>
            <p className="mb-7 max-w-sm text-sm text-inkDim">
              You will receive <b className="text-ink">{selected.name}</b> as your first starter card.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleConfirm}>Choose Card</Button>
              <Button variant="ghost" onClick={() => setStep("pick")}>Back</Button>
            </div>
          </motion.div>
        )}

        {step === "reveal" && selected && (
          <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-2 font-display text-[11px] font-bold tracking-[0.16em] text-bloodBright">YOUR FIRST CARD</div>
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotateY: 90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-5 w-[220px]"
            >
              <Card card={selected} size="lg" showLevel={false} />
            </motion.div>
            <h2 className="mb-1 font-display text-2xl font-bold">{selected.name}</h2>
            <div className="mb-1 font-display text-xs font-bold uppercase tracking-wide text-inkMute">
              {rarityMeta(selected.rarity).name}
            </div>
            <div className="mb-6 text-xs text-gold">Added to Collection</div>
            <p className="mb-7 text-sm text-inkDim">Your journey begins.</p>
            <Button onClick={handleFinish} disabled={finishing}>
              {finishing ? "…" : "Build Your Deck"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StarterCard({ card, onClick }: { card: CardDef; onClick: () => void }) {
  const rm = rarityMeta(card.rarity);
  const ability = ABILITY_LABELS[card.ability];
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.04 }}
      animate={{ y: [0, -4, 0] }}
      transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
      className="flex flex-col items-center rounded-2xl border border-line bg-panel p-3.5 text-left"
    >
      <div className="mb-2.5 w-full">
        <Card card={card} showLevel={false} />
      </div>
      <div className="mb-1 w-full font-display text-[13px] font-bold" style={{ color: rm.color }}>
        {card.name}
      </div>
      <div className="mb-1.5 flex gap-2 font-display text-[10px] font-bold">
        <span className="text-[#ff6b6b]">⚔ {card.atk}</span>
        <span className="text-[#6bdc7f]">♥ {card.hp}</span>
        <span className="text-gold">⚡ {card.energyCost}</span>
      </div>
      <div className="text-[10px] leading-snug text-inkMute">
        <b className="text-inkDim">{ability.name}</b> — {ability.desc}
      </div>
    </motion.button>
  );
}
