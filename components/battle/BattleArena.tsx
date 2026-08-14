"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/cards/Card";
import HealthBar from "@/components/battle/HealthBar";
import EnergyRow from "@/components/battle/EnergyRow";
import FieldCard from "@/components/battle/FieldCard";
import BattleLog from "@/components/battle/BattleLog";
import BattleResultModal from "@/components/battle/BattleResultModal";
import { useGameStore } from "@/store/game-store";
import { useAuth } from "@/components/auth/AuthProvider";
import { ABILITY_LABELS } from "@/lib/cards-data";
import { useBattle } from "@/lib/use-battle";
import { CardDef } from "@/lib/types";
import { ClaimBattleRewardResponse } from "@/lib/supabase/types";

export default function BattleArena({
  playerCards,
  deckName,
  opponentName,
  opponentRank,
  onExit,
}: {
  playerCards: CardDef[];
  deckName: string;
  opponentName: string;
  opponentRank: string;
  onExit: () => void;
}) {
  const recordBattleHistory = useGameStore((s) => s.recordBattleHistory);
  const { profile, startBattle, claimBattleReward } = useAuth();
  const username = profile?.username ?? "You";
  const coins = profile?.coins ?? 0;

  const [enemyCards] = useState(() => [...playerCards].sort(() => Math.random() - 0.5));
  const { state, playAttack, playAbility, endTurn, reset } = useBattle(playerCards, enemyCards, opponentName);

  const [battleId, setBattleId] = useState<string | null>(null);
  const [reward, setReward] = useState<{ coins: number; bonus: number; result: "win" | "loss" } | null>(null);
  const [resultRecorded, setResultRecorded] = useState(false);

  useEffect(() => {
    startBattle().then(setBattleId).catch(() => setBattleId(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.winner || resultRecorded || !battleId) return;
    setResultRecorded(true);
    const result: "win" | "loss" = state.winner === "player" ? "win" : "loss";
    const rankChange = result === "win" ? 20 : -12;
    recordBattleHistory(opponentName, result, rankChange);
    claimBattleReward(battleId, result)
      .then((res: ClaimBattleRewardResponse) => {
        setReward({ coins: res.coinsGained - res.bonus, bonus: res.bonus, result });
      })
      .catch(() => {
        setReward({ coins: 0, bonus: 0, result });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.winner, resultRecorded, battleId]);

  const handleRematch = async () => {
    setResultRecorded(false);
    setReward(null);
    reset();
    const newId = await startBattle().catch(() => null);
    setBattleId(newId);
  };

  const abilityInfo = state.playerField ? ABILITY_LABELS[state.playerField.def.ability] : null;

  return (
    <div>
      <div className="mb-5.5 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">Ranked Battle</h1>
          <div className="mt-0.5 text-xs text-inkMute">Turn-based · best of 1 · {deckName}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onExit}>Leave</Button>
          <Button variant="ghost" onClick={handleRematch}>Reset</Button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[14px] border border-line bg-gradient-to-b from-[#0f0d12] via-[#0a0a0d] to-[#0a0a0d]">
        <div className="flex items-center justify-between px-3 py-3.5 md:px-5">
          <div className="flex flex-row-reverse items-center gap-3">
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[9px] border border-line bg-gradient-to-br from-[#2a2a33] to-[#151519] font-display text-[15px] font-bold">
              {opponentName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-[150px] text-right">
              <div className="mb-1.5 text-[12.5px] font-bold">
                {opponentName} <span className="font-normal text-inkMute">{opponentRank}</span>
              </div>
              <HealthBar value={state.enemyHp} max={state.enemyMaxHp} variant="enemy" reverse />
            </div>
          </div>
          <div className="font-display text-[13px] font-bold tracking-widest text-inkMute">
            DECK {playerCards.length - state.playerHand.length + 1}/{playerCards.length}
          </div>
        </div>

        <div className="relative flex h-[230px] items-center justify-between border-y border-lineSoft px-8 md:px-14">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 500px 200px at 50% 50%, rgba(200,30,58,0.06), transparent 70%)" }}
          />
          {!state.winner && (
            <div className="absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-gold/35 bg-black/50 px-3.5 py-1 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-gold">
              Your Turn
            </div>
          )}
          {state.winner && (
            <div className="absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-gold/50 bg-black/60 px-4 py-1.5 font-display text-[13px] font-bold uppercase tracking-[0.12em] text-gold">
              {state.winner === "player" ? "Victory" : "Defeat"}
            </div>
          )}

          <div className="flex h-[120px] w-[88px] items-center justify-center rounded-[10px] border border-dashed border-line">
            {state.enemyField && (
              <FieldCard
                card={state.enemyField}
                attackingSide={state.lastAttackSide === "enemy" ? "enemy" : null}
                dmg={state.lastAttackSide === "player" ? state.lastDamage : undefined}
                dmgKey={state.log.length}
              />
            )}
          </div>
          <div className="font-display text-[13px] font-bold tracking-[0.15em] text-inkMute">VS</div>
          <div className="flex h-[120px] w-[88px] items-center justify-center rounded-[10px] border border-dashed border-line">
            {state.playerField && (
              <FieldCard
                card={state.playerField}
                attackingSide={state.lastAttackSide === "player" ? "player" : null}
                dmg={state.lastAttackSide === "enemy" ? state.lastDamage : undefined}
                dmgKey={state.log.length}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-3.5 md:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[9px] border border-line bg-gradient-to-br from-[#2a2a33] to-[#151519] font-display text-[15px] font-bold">
              VK
            </div>
            <div className="min-w-[150px]">
              <div className="mb-1.5 text-[12.5px] font-bold">
                {username} <span className="font-normal text-inkMute">You</span>
              </div>
              <HealthBar value={state.playerHp} max={state.playerMaxHp} variant="me" />
              <EnergyRow value={state.playerEnergy} max={6} />
            </div>
          </div>
        </div>

        {abilityInfo && (
          <div className="flex gap-2 px-3 pb-4 md:px-5">
            <div className="flex-1 rounded-lg border border-line bg-panel2 px-2.5 py-2.5 text-center text-[10.5px]">
              <b className="mb-0.5 block font-display text-[11.5px] text-gold">{abilityInfo.name}</b>
              {abilityInfo.desc}
            </div>
          </div>
        )}

        <div className="flex gap-2.5 overflow-x-auto px-3 pb-4.5 pt-1 md:px-5">
          {state.playerHand.map((c) => (
            <div key={c.instanceId} className="w-24 shrink-0">
              <Card card={c.def} size="sm" />
            </div>
          ))}
        </div>
      </div>

      <BattleLog entries={state.log} />

      <div className="mt-3 flex gap-2.5">
        <Button onClick={playAttack} disabled={!!state.winner}>Attack</Button>
        <Button variant="ghost" onClick={playAbility} disabled={!!state.winner}>Use Ability</Button>
        <Button variant="ghost" onClick={endTurn} disabled={!!state.winner}>End Turn</Button>
      </div>

      {state.winner && reward && (
        <BattleResultModal reward={reward} coinsTotal={coins} onClose={() => setReward(null)} />
      )}
    </div>
  );
}
