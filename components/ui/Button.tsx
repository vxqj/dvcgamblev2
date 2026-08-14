"use client";

import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export default function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center gap-2 rounded-lg border border-transparent px-5.5 py-2.5 font-display text-sm font-bold uppercase tracking-wide transition-all active:scale-[0.97]",
        variant === "primary" &&
          "bg-gradient-to-br from-bloodBright to-blood text-white shadow-glow hover:-translate-y-px",
        variant === "ghost" && "border-line bg-white/[0.04] text-ink hover:bg-white/[0.08]",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
