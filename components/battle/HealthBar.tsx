export default function HealthBar({
  value,
  max,
  variant,
  reverse,
}: {
  value: number;
  max: number;
  variant: "me" | "enemy";
  reverse?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`flex items-center gap-1.5 ${reverse ? "flex-row-reverse" : ""}`}>
      <span className="w-8.5 font-display text-[11px] font-bold">{value}</span>
      <div className="h-[9px] w-[130px] overflow-hidden rounded-full border border-line bg-lineSoft">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            variant === "me"
              ? "bg-gradient-to-r from-[#4fbf6a] to-[#7be08f]"
              : "bg-gradient-to-r from-[#e0304a] to-[#ff5f74]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
