import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type Tone = "green" | "amber" | "red" | "blue" | "gray";

const tones: Record<Tone, string> = {
  green: "bg-brand-light text-brand-dark",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
  blue: "bg-sky-50 text-sky-700",
  gray: "bg-surface text-muted",
};

export function Badge({ tone = "gray", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}
