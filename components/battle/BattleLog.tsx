"use client";

import { BattleLogEntry } from "@/lib/types";
import { useEffect, useRef } from "react";

export default function BattleLog({ entries }: { entries: BattleLogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [entries]);

  return (
    <div
      ref={ref}
      className="mt-3.5 max-h-[110px] overflow-y-auto rounded-[10px] border border-line bg-panel px-3.5 py-3 font-display text-[11.5px] tracking-wide text-inkDim"
    >
      {entries.map((e) => (
        <div key={e.id} className="py-0.5">
          {e.text}
        </div>
      ))}
    </div>
  );
}
