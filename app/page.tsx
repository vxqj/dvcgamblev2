"use client";

import Link from "next/link";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { cardById } from "@/lib/cards-data";
import { rankNameFromPoints } from "@/lib/rank";
import { DAILY_MISSIONS } from "@/lib/demo-data";
import { useGameStore } from "@/store/game-store";

const QUICK_PLAY = [
  { href: "/battle", title: "Quick Battle", desc: "Fast casual match" },
  { href: "/ranked", title: "Ranked", desc: "Competitive matchmaking" },
  { href: "/battle", title: "Boss Raid", desc: "Vaultbreaker awakens" },
  { href: "/battle", title: "Practice", desc: "Battle a bot" },
];

export default function HomePage() {
  const { profile } = useAuth();
  const history = useGameStore((s) => s.history);
  if (!profile) return null;
  const featured = cardById(profile.starter_card_id ?? 101)!;

  const winRate = Math.round((profile.wins / Math.max(1, profile.wins + profile.losses)) * 100);
  const rank = rankNameFromPoints(profile.rank_points);

  return (
    <div>
      <div className="mb-5.5 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">Welcome back, {profile.username}</h1>
          <div className="mt-0.5 text-xs text-inkMute">4 missions in progress · deck synced</div>
        </div>
        <div className="flex gap-2.5">
          <Pill dot="bg-gold shadow-[0_0_6px_theme(colors.gold)]" value={profile.coins.toLocaleString()} />
          <Pill dot="bg-bloodBright shadow-[0_0_6px_theme(colors.bloodBright)]" value={profile.gems} />
        </div>
      </div>

      <div className="relative mb-5 flex flex-col items-center gap-6 overflow-hidden rounded-[14px] border border-line bg-[linear-gradient(120deg,#14090c_0%,#0c0c10_55%,#0a0d12_100%)] p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 85% 30%, rgba(200,30,58,0.18), transparent 60%)" }}
        />
        <div className="relative z-10 text-center md:text-left">
          <div className="mb-1.5 font-display text-[11px] font-bold tracking-[0.16em] text-bloodBright">
            RANKED SEASON 01 · THE ASCENSION
          </div>
          <h2 className="mb-2 font-display text-[30px] font-bold leading-none md:text-[34px]">
            CLIMB TO<br />THE HOLLOW THRONE
          </h2>
          <p className="mb-4.5 max-w-[360px] text-[13px] text-inkDim">
            You&rsquo;re on a {profile.win_streak}-battle win streak — the best it&rsquo;s been all season. Keep it alive.
          </p>
          <div className="mb-5 flex justify-center gap-5.5 md:justify-start">
            <HStat value={rank.split(" ")[1] ? rank.split(" ").map((w) => w[0]).join("") : rank} label="Current Rank" />
            <HStat value={String(profile.win_streak)} label="Win Streak" color="#4fbf6a" />
            <HStat value={`${winRate}%`} label="Win Rate" />
          </div>
          <div className="flex justify-center gap-2.5 md:justify-start">
            <Link href="/battle"><Button>Play Ranked</Button></Link>
            <Link href="/decks"><Button variant="ghost">Edit Deck</Button></Link>
          </div>
        </div>
        <div className="relative z-10 w-[150px] shrink-0">
          <Card card={featured} />
        </div>
      </div>

      <SectionTitle title="Quick Play" />
      <div className="mb-2 grid grid-cols-2 gap-3 md:grid-cols-4">
        {QUICK_PLAY.map((q) => (
          <Link
            key={q.title}
            href={q.href}
            className="rounded-[10px] border border-line bg-panel p-4 transition-all hover:-translate-y-0.5 hover:border-bloodDim hover:bg-panel2"
          >
            <div className="mb-2.5 text-bloodBright">⚔</div>
            <h4 className="mb-0.5 text-[13.5px] font-semibold">{q.title}</h4>
            <p className="text-[11px] text-inkMute">{q.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5.5 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionTitle title="Daily Missions" action="View all" />
          <div className="flex flex-col gap-2">
            {DAILY_MISSIONS.map((m) => (
              <div key={m.id} className="flex items-center gap-3.5 rounded-[10px] border border-line bg-panel px-4 py-3.5">
                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border border-bloodBright/30 bg-bloodBright/12 text-[15px]">
                  ⚔
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-[13px] font-semibold">
                    {m.label} <span className="font-normal text-inkMute">{m.progress}/{m.total}</span>
                  </div>
                  <div className="h-[5px] overflow-hidden rounded-full bg-lineSoft">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blood to-bloodBright"
                      style={{ width: `${Math.min(100, (m.progress / m.total) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="whitespace-nowrap font-display text-[11px] font-semibold text-gold">{m.reward}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-panel p-4.5">
          <div className="mb-3.5 text-[12.5px] tracking-wide text-inkDim">RECENT BATTLES</div>
          {history.slice(0, 5).map((b) => (
            <div key={b.id} className="flex items-center justify-between border-b border-lineSoft py-2.5 text-[12.5px] last:border-none">
              <span>vs {b.opponent}</span>
              <span
                className={`rounded px-2 py-0.5 font-display text-[10.5px] font-bold tracking-wide ${
                  b.result === "win" ? "bg-[#4fbf6a]/15 text-[#4fbf6a]" : "bg-[#e0304a]/15 text-[#e0304a]"
                }`}
              >
                {b.result === "win" ? "WIN" : "LOSS"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Pill({ dot, value }: { dot: string; value: string | number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-[12.5px] font-semibold">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {value}
    </div>
  );
}

function HStat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div>
      <div className="font-display text-[22px] font-bold" style={color ? { color } : undefined}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-inkMute">{label}</div>
    </div>
  );
}

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 mt-6.5 flex items-center justify-between">
      <h3 className="text-sm tracking-wide text-inkDim">{title}</h3>
      {action && <span className="font-display text-[11px] font-semibold uppercase tracking-wide text-bloodBright">{action}</span>}
    </div>
  );
}
