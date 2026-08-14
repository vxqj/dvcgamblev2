export default function EnergyRow({ value, max }: { value: number; max: number }) {
  return (
    <div className="mt-1.5 flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`h-3 w-3 rounded-[3px] border ${
            i < value
              ? "border-[#3d8ff2] bg-gradient-to-br from-[#3d8ff2] to-[#66aaff] shadow-[0_0_5px_rgba(61,143,242,0.6)]"
              : "border-line bg-lineSoft"
          }`}
        />
      ))}
    </div>
  );
}
