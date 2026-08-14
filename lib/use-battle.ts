"use client";

import { useCallback, useMemo, useState } from "react";
import { CardDef, BattleCardInstance, BattleLogEntry, Side } from "./types";
import {
  toBattleCard,
  resolveAttack,
  applyOnHitStatus,
  tickStatuses,
  isFrozenOrStunned,
  consumeControlEffect,
  decideAiAction,
} from "./battle-engine";

const PLAYER_MAX_ENERGY = 6;
const ENEMY_MAX_ENERGY = 6;
const PLAYER_MAX_HP = 40;
const ENEMY_MAX_HP = 40;

let logSeq = 0;
const logId = () => `log_${++logSeq}_${Date.now()}`;

export interface BattleUiState {
  turn: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerEnergy: number;
  enemyEnergy: number;
  playerHand: BattleCardInstance[];
  playerField: BattleCardInstance | null;
  enemyField: BattleCardInstance | null;
  deckRemaining: number;
  log: BattleLogEntry[];
  winner: Side | null;
  lastAttackSide: Side | null;
  lastDamage: number | null;
  isAnimating: boolean;
}

export function useBattle(playerDeck: CardDef[], enemyDeck: CardDef[], opponentName: string) {
  const initial = useMemo(() => {
    const playerHand = playerDeck.slice(1).map(toBattleCard);
    const enemyHand = enemyDeck.slice(1).map(toBattleCard);
    return {
      playerField: toBattleCard(playerDeck[0]),
      enemyField: toBattleCard(enemyDeck[0]),
      playerHand,
      enemyHand,
    };
  }, [playerDeck, enemyDeck]);

  const [state, setState] = useState<BattleUiState>({
    turn: 1,
    playerHp: PLAYER_MAX_HP,
    playerMaxHp: PLAYER_MAX_HP,
    enemyHp: ENEMY_MAX_HP,
    enemyMaxHp: ENEMY_MAX_HP,
    playerEnergy: 4,
    enemyEnergy: 4,
    playerHand: initial.playerHand,
    playerField: initial.playerField,
    enemyField: initial.enemyField,
    deckRemaining: playerDeck.length,
    log: [
      { id: logId(), text: `${initial.playerField.def.name} was played to the field.`, turn: 1 },
      { id: logId(), text: "Waiting for your move — Attack or Use Ability.", turn: 1 },
    ],
    winner: null,
    lastAttackSide: null,
    lastDamage: null,
    isAnimating: false,
  });

  const pushLog = (log: BattleLogEntry[], lines: string[], turn: number, side?: Side) => [
    ...log,
    ...lines.map((text) => ({ id: logId(), text, turn, side })),
  ];

  const enemyTurn = useCallback((afterState: BattleUiState) => {
    setTimeout(() => {
      setState((s) => {
        if (s.winner || !s.enemyField || !s.playerField) return s;
        const action = decideAiAction(s.enemyField, s.playerField, s.enemyEnergy);
        let enemyField = s.enemyField;
        let playerField = s.playerField;
        let log = s.log;
        let energy = s.enemyEnergy;

        if (isFrozenOrStunned(enemyField)) {
          log = pushLog(log, [`${enemyField.def.name} is unable to act.`], s.turn, "enemy");
          enemyField = consumeControlEffect(enemyField);
          return { ...s, enemyField, log, isAnimating: false };
        }

        if (action === "ability" && energy >= 2) {
          energy -= 2;
          if (enemyField.def.ability === "overcharge") {
            enemyField = { ...enemyField, overcharged: true };
            log = pushLog(log, [`${enemyField.def.name} channels Overcharge.`], s.turn, "enemy");
          } else if (enemyField.def.ability === "shield" || enemyField.def.ability === "holyShield") {
            enemyField = { ...enemyField, shielded: true };
            log = pushLog(log, [`${enemyField.def.name} raises a Shield.`], s.turn, "enemy");
          } else if (enemyField.def.ability === "heal") {
            const heal = Math.round(enemyField.maxHp * 0.3);
            enemyField = { ...enemyField, currentHp: Math.min(enemyField.maxHp, enemyField.currentHp + heal) };
            log = pushLog(log, [`${enemyField.def.name} heals for ${heal}.`], s.turn, "enemy");
          }
          return { ...s, enemyField, enemyEnergy: energy, log, isAnimating: false };
        }

      const result = resolveAttack(enemyField, playerField, s.turn === 1);
        log = pushLog(log, result.logLines, s.turn, "enemy");
        let playerHp = s.playerHp;
        if (!result.dodged) {
          playerHp = Math.max(0, playerHp - result.damage);
          const statusResult = applyOnHitStatus(enemyField, playerField);
          playerField = statusResult.defender;
          log = pushLog(log, statusResult.logLines, s.turn, "enemy");
        }
        if (enemyField.overcharged) enemyField = { ...enemyField, overcharged: false };

        const winner: Side | null = playerHp <= 0 ? "enemy" : null;
        if (winner) log = pushLog(log, [`${opponentName} wins the battle.`], s.turn, "enemy");

        return {
          ...s,
          enemyField,
          playerField,
          playerHp,
          enemyEnergy: Math.min(ENEMY_MAX_ENERGY, energy + 1),
          log,
          winner,
          lastAttackSide: "enemy",
          lastDamage: result.dodged ? 0 : result.damage,
          isAnimating: false,
        };
      });
    }, 650);
  }, [opponentName]);

  const playAttack = useCallback(() => {
    setState((s) => {
      if (s.winner || !s.playerField || !s.enemyField || s.isAnimating) return s;
      if (isFrozenOrStunned(s.playerField)) {
        return { ...s, log: pushLog(s.log, [`${s.playerField.def.name} cannot act this turn.`], s.turn, "player") };
      }
      const result = resolveAttack(s.playerField, s.enemyField, s.turn === 1);
      let enemyField = s.enemyField;
      let log = pushLog(s.log, result.logLines, s.turn, "player");
      let enemyHp = s.enemyHp;

      if (!result.dodged) {
        enemyHp = Math.max(0, enemyHp - result.damage);
        const statusResult = applyOnHitStatus(s.playerField, enemyField);
        enemyField = statusResult.defender;
        log = pushLog(log, statusResult.logLines, s.turn, "player");
      }

      let playerField = s.playerField;
      if (playerField.overcharged) playerField = { ...playerField, overcharged: false };

      const winner: Side | null = enemyHp <= 0 ? "player" : null;
      if (winner) log = pushLog(log, [`Victory! ${playerField.def.name} claims the battle.`], s.turn, "player");

      const next: BattleUiState = {
        ...s,
        playerField,
        enemyField,
        enemyHp,
        playerEnergy: Math.max(0, s.playerEnergy - 1),
        log,
        winner,
        lastAttackSide: "player",
        lastDamage: result.dodged ? 0 : result.damage,
        isAnimating: true,
      };

      if (!winner) enemyTurn(next);
      return next;
    });
  }, [enemyTurn]);

  const playAbility = useCallback(() => {
    setState((s) => {
      if (s.winner || !s.playerField || s.playerEnergy < 2) {
        return { ...s, log: pushLog(s.log, ["Not enough energy to use an ability."], s.turn, "player") };
      }
      let playerField = s.playerField;
      let log = s.log;
      const ability = playerField.def.ability;

      if (ability === "overcharge") {
        playerField = { ...playerField, overcharged: true };
        log = pushLog(log, [`${playerField.def.name} channels Overcharge — next attack deals double damage.`], s.turn, "player");
      } else if (ability === "shield" || ability === "holyShield") {
        playerField = { ...playerField, shielded: true };
        log = pushLog(log, [`${playerField.def.name} raises a Shield.`], s.turn, "player");
      } else if (ability === "heal") {
        const heal = Math.round(playerField.maxHp * 0.3);
        playerField = { ...playerField, currentHp: Math.min(playerField.maxHp, playerField.currentHp + heal) };
        log = pushLog(log, [`${playerField.def.name} heals for ${heal}.`], s.turn, "player");
      } else if (ability === "bloodRage") {
        log = pushLog(log, [`Blood Rage is passive — it triggers automatically below 30% health.`], s.turn, "player");
      } else {
        log = pushLog(log, [`${playerField.def.name} has no active ability to trigger.`], s.turn, "player");
      }

      return { ...s, playerField, playerEnergy: s.playerEnergy - 2, log };
    });
  }, []);

  const endTurn = useCallback(() => {
    setState((s) => {
      if (s.winner || !s.playerField || !s.enemyField) return s;
      let log = pushLog(s.log, [`Turn passed to ${opponentName}.`], s.turn, "player");

      const tPlayer = tickStatuses(s.playerField);
      const tEnemy = tickStatuses(s.enemyField);
      log = pushLog(log, tPlayer.logLines, s.turn, "player");
      log = pushLog(log, tEnemy.logLines, s.turn, "enemy");

      const playerHp = Math.max(0, Math.min(s.playerHp, s.playerHp - 0)); // hp already tracked separately from card hp for simplicity
      const next: BattleUiState = {
        ...s,
        turn: s.turn + 1,
        playerField: tPlayer.card,
        enemyField: tEnemy.card,
        playerEnergy: Math.min(PLAYER_MAX_ENERGY, s.playerEnergy + 2),
        log,
        playerHp,
      };
      enemyTurn(next);
      return next;
    });
  }, [enemyTurn, opponentName]);

  const reset = useCallback(() => {
    setState({
      turn: 1,
      playerHp: PLAYER_MAX_HP,
      playerMaxHp: PLAYER_MAX_HP,
      enemyHp: ENEMY_MAX_HP,
      enemyMaxHp: ENEMY_MAX_HP,
      playerEnergy: 4,
      enemyEnergy: 4,
      playerHand: playerDeck.slice(1).map(toBattleCard),
      playerField: toBattleCard(playerDeck[0]),
      enemyField: toBattleCard(enemyDeck[0]),
      deckRemaining: playerDeck.length,
      log: [{ id: logId(), text: "A new battle begins.", turn: 1 }],
      winner: null,
      lastAttackSide: null,
      lastDamage: null,
      isAnimating: false,
    });
  }, [playerDeck, enemyDeck]);

  return { state, playAttack, playAbility, endTurn, reset };
}
