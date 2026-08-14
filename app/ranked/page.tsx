"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { rankNameFromPoints, rankTierIndex } from "@/lib/rank";
import { RANK_LADDER } from "@/lib/demo-data";

export default function RankedPage() {
  const { profile } = useAuth();
  if (!profile) return null;
  const rank = rankNameFromPoints(profile.rank_points);
  const currentTierIndex = rankTierIndex(profile.rank_points);

  return (
    <div>
      <div className="mb-5.5">
        <h1 className="text-[22px] font-bold">Ranked</h1>
        <div className="mt-0.5 text-xs text-inkMute">Season 01 · The Ascension</div>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-[14px] border border-line bg-[linear-gradient(120deg,#14090c_0%,#0c0c10_55%,#0a0d12_100%)] p-6 md:p-7">
        <div className="mb-1.5 font-display text-[11px] font-bold tracking-[0.16em] text-bloodBright">CURRENT RANK</div>
        <h2 className="mb-2 font-display text-[28px] font-bold">{rank.toUpperCase()}</h2>
        <p className="mb-4.5 max-w-[360px] text-[13px] text-inkDim">
          {profile.rank_points.toLocaleString()} rank points. Keep winning to climb the ladder this season.
        </p>
        <Link href="/battle"><Button>Find Ranked Match</Button></Link>
      </div>

      <h3 className="mb-3 text-sm tracking-wide text-inkDim">Rank Ladder</h3>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {RANK_LADDER.map((r, i) => (
          <div
            key={r.name}
            className="rounded-xl border bg-panel p-4 text-center"
            style={{ borderColor: i === currentTierIndex ? r.color : undefined }}
          >
            <div className="font-display text-lg font-bold" style={{ color: r.color }}>
              {r.name}
              {i === currentTierIndex ? " ★" : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
