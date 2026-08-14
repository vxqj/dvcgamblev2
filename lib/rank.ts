import { RANK_LADDER } from "./demo-data";

const THRESHOLDS = [0, 300, 700, 1200, 1800, 2500, 3400, 4500]; // points needed for Bronze..Legend

export function rankNameFromPoints(points: number): string {
  let idx = 0;
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (points >= THRESHOLDS[i]) idx = i;
  }
  return RANK_LADDER[idx]?.name ?? "Bronze";
}

export function rankTierIndex(points: number): number {
  let idx = 0;
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (points >= THRESHOLDS[i]) idx = i;
  }
  return idx;
}
