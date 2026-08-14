"use client";

import { useState } from "react";
import clsx from "clsx";
import { LEADERBOARDS } from "@/lib/demo-data";
import { useAuth } from "@/components/auth/AuthProvider";

const TABS = [
  { id: "global", label: "Global" },
  { id: "ranked", label: "Ranked" },
  { id: "collection", label: "Collection" },
  { id: "wins", label: "Wins" },
  { id: "value", label: "Value" },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState("global");
  const { profile } = useAuth();
  const username = profile?.username;
  const entries = LEADERBOARDS[tab];
  const [p1, p2, p3, ...rest] = entries;

  return (
    <div>
      <div className="mb-5.5">
        <h1 className="text-[22px] font-bold">Leaderboard</h1>
        <div className="mt-0.5 text-xs text-inkMute">Global · Season 01</div>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              "rounded-[7px] border px-4 py-2 font-display text-xs font-bold uppercase tracking-wide",
              tab === t.id ? "border-blood bg-bloodDim text-white" : "border-line bg-panel text-inkDim"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {p1 && p2 && p3 && (
        <div className="mb-6 flex items-end justify-center gap-3.5">
          <PodiumSlot entry={p2} place={2} borderColor="#c7d6e8" barH={48} />
          <PodiumSlot entry={p1} place={1} borderColor="#e8b44d" barH={70} big />
          <PodiumSlot entry={p3} place={3} borderColor="#c98a4a" barH={32} />
        </div>
      )}

      <div className="rounded-xl border border-line bg-panel py-1.5">
        {rest.map((e) => (
          <div key={e.rank} className="flex items-center gap-3.5 border-b border-lineSoft px-4 py-2.5 last:border-none">
            <span className="w-6 font-display text-sm font-bold text-inkMute">{e.rank}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-line bg-gradient-to-br from-[#2a2a33] to-[#151519] font-display text-xs font-bold">
              {e.username.slice(0, 2).toUpperCase()}
            </div>
            <span className="flex-1 text-[12.5px] font-semibold">
              {e.username}
              {e.username === username ? " (You)" : ""}
            </span>
            <span className="font-display text-[13px] font-bold text-gold">{e.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PodiumSlot({
  entry,
  place,
  borderColor,
  barH,
  big,
}: {
  entry: { username: string; value: number };
  place: number;
  borderColor: string;
  barH: number;
  big?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={clsx(
          "mx-auto mb-2 flex items-center justify-center rounded-xl border-2 bg-gradient-to-br from-[#2a2a33] to-[#151519] font-display font-bold",
          big ? "h-16 w-16 text-[22px]" : "h-[52px] w-[52px] text-lg"
        )}
        style={{ borderColor, boxShadow: big ? `0 0 20px ${borderColor}66` : undefined }}
      >
        {entry.username.slice(0, 2).toUpperCase()}
      </div>
      <div className="mb-0.5 text-[12.5px] font-bold">{entry.username}</div>
      <div className="font-display text-[10.5px] text-inkMute">{entry.value.toLocaleString()} pts</div>
      <div
        className="mt-2.5 w-[74px] rounded-t-lg border border-b-0"
        style={{ height: barH, background: `linear-gradient(180deg, ${borderColor}33, ${borderColor}0a)`, borderColor: `${borderColor}55` }}
      />
    </div>
  );
}
