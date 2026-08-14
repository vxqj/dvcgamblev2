"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/components/auth/AuthProvider";
import { rankNameFromPoints } from "@/lib/rank";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/battle", label: "Battle" },
  { href: "/lobbies", label: "Lobbies" },
  { href: "/crates", label: "Crates" },
  { href: "/collection", label: "Collection" },
  { href: "/decks", label: "Decks" },
  { href: "/ranked", label: "Ranked" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  return (
    <nav className="hidden md:flex sticky top-0 h-screen w-[220px] shrink-0 flex-col border-r border-lineSoft bg-gradient-to-b from-[#0c0c0f] to-bg px-3.5 py-5.5">
      <div className="flex items-center gap-2.5 px-2 pb-6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-bloodBright to-bloodDim font-display text-[15px] font-bold shadow-glow">
          ⚔
        </div>
        <div className="font-display text-[16.5px] font-bold leading-tight tracking-wide">
          DVC CARD WARS
          <span className="mt-0.5 block text-[9.5px] font-semibold tracking-[0.18em] text-inkMute">
            SEASON 01
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative rounded-md border border-transparent px-3 py-2.5 font-display text-[13px] font-semibold uppercase tracking-wide transition-all",
                active
                  ? "border-bloodBright/35 bg-bloodBright/12 text-white"
                  : "text-inkDim hover:bg-white/[0.03] hover:text-ink"
              )}
            >
              {active && (
                <span className="absolute -left-3.5 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded bg-bloodBright shadow-[0_0_8px_theme(colors.bloodBright)]" />
              )}
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2.5 border-t border-lineSoft pt-3.5">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[7px] border border-line bg-gradient-to-br from-[#2a2a33] to-[#151519] font-display text-[13px] font-bold text-gold">
          {(profile?.username ?? "??").slice(0, 2).toUpperCase()}
        </div>
        <div className="leading-tight">
          <div className="text-[12.5px] font-semibold">{profile?.username}</div>
          <div className="text-[10.5px] text-inkMute">{rankNameFromPoints(profile?.rank_points ?? 0)}</div>
        </div>
        <button onClick={signOut} className="ml-auto text-[10px] text-inkMute hover:text-bloodBright">
          Log out
        </button>
      </div>
    </nav>
  );
}
