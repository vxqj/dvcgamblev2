import { CardDef, BattleCardInstance, StatusEffect, BattleEvent, AbilityId } from "./types";

let uid = 0;
const nextId = () => `inst_${++uid}_${Date.now()}`;

export function toBattleCard(def: CardDef): BattleCardInstance {
  return {
    instanceId: nextId(),
    def,
    currentHp: def.hp,
    maxHp: def.hp,
    atk: def.atk,
    spd: def.spd,
    statuses: [],
    overcharged: false,
    shielded: false,
  };
}

export function cloneField(card: BattleCardInstance): BattleCardInstance {
  return { ...card, statuses: card.statuses.map((s) => ({ ...s })) };
}

const rand = () => Math.random();

export interface AttackResult {
  damage: number;
  crit: boolean;
  dodged: boolean;
  events: BattleEvent[];
  logLines: string[];
}

/**
 * Resolve one card attacking another. Applies ability triggers, crit chance,
 * dodge chance (Phantom), shields, execution/void-strike bonuses, and status
 * effect application. Mutates neither input; returns damage + new statuses
 * for the caller to apply.
 */
export function resolveAttack(
  attacker: BattleCardInstance,
  defender: BattleCardInstance,
  isFirstTurn: boolean = false
): AttackResult {
  const logLines: string[] = [];
  const events: BattleEvent[] = [];

  // Phantom dodge check on the defender.
  const hasPhantom = defender.def.ability === "phantom";
  if (hasPhantom && rand() < 0.22) {
    logLines.push(`${defender.def.name} phases out — the attack misses entirely.`);
    return { damage: 0, crit: false, dodged: true, events: [{ type: "attack", side: "player", dodged: true }], logLines };
  }

  let baseAtk = attacker.atk;

  // Blood Rage: below 30% HP, attack surges.
  if (attacker.def.ability === "bloodRage" && attacker.currentHp / attacker.maxHp < 0.3) {
    baseAtk = Math.round(baseAtk * 1.6);
    logLines.push(`${attacker.def.name}'s Blood Rage ignites — attack surges!`);
  }

  // Overcharge: double damage on the marked hit, then consumed.
  let overchargeMult = 1;
  if (attacker.overcharged) {
    overchargeMult = 2;
    logLines.push(`${attacker.def.name} unleashes an Overcharged strike!`);
  }

  // Void Strike: heavy bonus damage.
  let voidBonus = 0;
  if (attacker.def.ability === "voidStrike") {
    voidBonus = Math.round(baseAtk * 0.5);
  }

  // Execution: bonus damage if defender is critically low.
  let executionBonus = 0;
  if (attacker.def.ability === "execution" && defender.currentHp / defender.maxHp < 0.2) {
    executionBonus = Math.round(baseAtk * 0.75);
    logLines.push(`${attacker.def.name} moves in for the Execution!`);
  }

  // Crit chance scales lightly with speed.
  const critChance = 0.1 + Math.min(0.15, attacker.spd / 100);
  const crit = rand() < critChance;
  const critMult = crit ? 1.5 : 1;

  // Burning Strike: flat bonus damage baked into every attack.
  let burningBonus = 0;
  if (attacker.def.ability === "burningStrike") {
    burningBonus = Math.round(baseAtk * 0.3);
  }

  // Ambush: bonus damage when this attacker strikes on turn 1 (attacking first).
  let ambushBonus = 0;
  if (attacker.def.ability === "ambush" && isFirstTurn) {
    ambushBonus = Math.round(baseAtk * 0.5);
    logLines.push(`${attacker.def.name} strikes from the shadows — Ambush!`);
  }

  let rawDamage = Math.round((baseAtk + voidBonus + executionBonus + burningBonus + ambushBonus) * overchargeMult * critMult);

  // Shield absorbs a flat portion of incoming damage, then is consumed.
  let shieldAbsorbed = 0;
  if (defender.shielded) {
    shieldAbsorbed = Math.min(rawDamage, Math.round(defender.maxHp * 0.25));
    rawDamage -= shieldAbsorbed;
    logLines.push(`${defender.def.name}'s Shield absorbs ${shieldAbsorbed} damage.`);
  }

  const damage = Math.max(0, rawDamage);
  logLines.push(
    `${attacker.def.name} attacks ${defender.def.name} for ${damage} damage${crit ? " — Critical Hit!" : ""}.`
  );

  events.push({ type: "attack", side: "player", amount: damage, crit });

  return { damage, crit, dodged: false, events, logLines };
}

/** Apply on-hit status effects (burn/poison/freeze/stun) from the attacker's ability. */
export function applyOnHitStatus(
  attacker: BattleCardInstance,
  defender: BattleCardInstance
): { defender: BattleCardInstance; logLines: string[] } {
  const logLines: string[] = [];
  const statuses = [...defender.statuses];

  const addStatus = (id: StatusEffect["id"], turns: number, magnitude: number, label: string) => {
    const existing = statuses.find((s) => s.id === id);
    if (existing) {
      existing.turns = Math.max(existing.turns, turns);
      existing.magnitude += magnitude;
    } else {
      statuses.push({ id, turns, magnitude });
    }
    logLines.push(`${defender.def.name} is afflicted with ${label}.`);
  };

  switch (attacker.def.ability as AbilityId) {
    case "burn":
      if (rand() < 0.65) addStatus("burn", 3, Math.max(1, Math.round(attacker.atk * 0.25)), "Burn");
      break;
    case "poison":
      if (rand() < 0.7) addStatus("poison", 4, Math.max(1, Math.round(attacker.atk * 0.18)), "Poison");
      break;
    case "freeze":
      if (rand() < 0.35) addStatus("freeze", 1, 0, "Freeze");
      break;
    case "stun":
      if (rand() < 0.3) addStatus("stun", 1, 0, "Stun");
      break;
    case "debuff":
      if (rand() < 0.5) addStatus("debuff", 2, Math.max(1, Math.round(attacker.atk * 0.2)), "Debuff");
      break;
    default:
      break;
  }

  return { defender: { ...defender, statuses }, logLines };
}

/** Resolve start-of-turn status ticks (burn/poison damage, regen heal, buff/debuff decay). */
export function tickStatuses(card: BattleCardInstance): { card: BattleCardInstance; logLines: string[] } {
  const logLines: string[] = [];
  let hp = card.currentHp;
  const statuses: StatusEffect[] = [];

  for (const s of card.statuses) {
    if (s.id === "burn" || s.id === "poison") {
      hp = Math.max(0, hp - s.magnitude);
      logLines.push(`${card.def.name} takes ${s.magnitude} ${s.id} damage.`);
    }
    const turnsLeft = s.turns - 1;
    if (turnsLeft > 0) statuses.push({ ...s, turns: turnsLeft });
  }

  if (card.def.ability === "regeneration" || card.def.ability === "regrowth") {
    const heal = Math.round(card.maxHp * 0.12);
    hp = Math.min(card.maxHp, hp + heal);
    if (heal > 0) logLines.push(`${card.def.name} regenerates ${heal} health.`);
  }

  return { card: { ...card, currentHp: hp, statuses }, logLines };
}

export function isFrozenOrStunned(card: BattleCardInstance): boolean {
  return card.statuses.some((s) => s.id === "freeze" || s.id === "stun");
}

export function consumeControlEffect(card: BattleCardInstance): BattleCardInstance {
  return { ...card, statuses: card.statuses.filter((s) => s.id !== "freeze" && s.id !== "stun") };
}

/** Basic "reasonable" AI decision: attack, unless it should use its ability first. */
export function decideAiAction(
  enemyField: BattleCardInstance,
  playerField: BattleCardInstance,
  enemyEnergy: number
): "ability" | "attack" {
  const lowHpSelf = enemyField.currentHp / enemyField.maxHp < 0.35;
  const lowHpTarget = playerField.currentHp / playerField.maxHp < 0.25;
  const abilityIsUseful =
    (enemyField.def.ability === "overcharge" && !enemyField.overcharged) ||
    (enemyField.def.ability === "shield" && !enemyField.shielded && lowHpSelf) ||
    (enemyField.def.ability === "holyShield" && !enemyField.shielded && lowHpSelf) ||
    (enemyField.def.ability === "heal" && lowHpSelf) ||
    (enemyField.def.ability === "execution" && lowHpTarget);

  if (abilityIsUseful && enemyEnergy >= 2) return "ability";
  return "attack";
}
