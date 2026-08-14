"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const ITEMS = [
  { href: "/", label: "Home" },
  { href: "/battle", label: "Battle" },
  { href: "/crates", label: "Crates" },
  { href: "/collection", label: "Cards" },
  { href: "/decks", label: "Decks" },
  { href: "/profile", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-lineSoft bg-[#0a0a0c]/95 px-1 pb-2.5 pt-2 backdrop-blur-md md:hidden">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-0.5 font-display text-[9.5px] font-bold uppercase",
              active ? "text-bloodBright" : "text-inkMute"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
