import { Minus, Plus } from "lucide-react";
import { cn } from "../../utils/cn";

interface Props {
  qty: number;
  onChange: (qty: number) => void;
  label: string;
  size?: "sm" | "md";
}

export function QuantitySelector({ qty, onChange, label, size = "sm" }: Props) {
  if (qty === 0) {
    return (
      <button
        onClick={() => onChange(1)}
        aria-label={`Add ${label} to cart`}
        className={cn(
          "rounded-lg border border-brand bg-white font-extrabold text-brand shadow-sm transition-all duration-150 hover:bg-brand-light active:scale-95",
          size === "sm" ? "h-9 min-w-[72px] px-3 text-xs" : "h-11 min-w-[110px] px-5 text-sm",
        )}
      >
        ADD
      </button>
    );
  }

  const btn = "flex h-full items-center justify-center px-2 transition-colors hover:bg-brand-dark active:scale-90";
  return (
    <div
      className={cn(
        "animate-pop flex items-center overflow-hidden rounded-lg bg-brand text-white shadow-sm",
        size === "sm" ? "h-9 min-w-[72px]" : "h-11 min-w-[110px]",
      )}
    >
      <button className={btn} onClick={() => onChange(qty - 1)} aria-label={`Decrease ${label}`}>
        <Minus size={14} strokeWidth={3} />
      </button>
      <span key={qty} className="animate-pop flex-1 text-center text-sm font-extrabold" aria-live="polite">{qty}</span>
      <button className={btn} onClick={() => onChange(qty + 1)} aria-label={`Increase ${label}`}>
        <Plus size={14} strokeWidth={3} />
      </button>
    </div>
  );
}
