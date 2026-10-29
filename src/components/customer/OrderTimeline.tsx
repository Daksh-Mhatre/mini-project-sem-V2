import { Check } from "lucide-react";
import type { OrderStatus } from "../../types";
import { statusRank } from "../../lib/format";
import { cn } from "../../utils/cn";

const steps: { label: string; rank: number }[] = [
  { label: "Order placed", rank: 1 },
  { label: "Store accepted order", rank: 2 },
  { label: "Order packed & ready", rank: 3 },
  { label: "Delivery partner assigned", rank: 4 },
  { label: "Out for delivery", rank: 6 },
  { label: "Delivered", rank: 7 },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const current = statusRank[status];
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => {
        const done = current >= step.rank;
        const active = !done && (i === 0 || current >= steps[i - 1].rank);
        return (
          <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
            {i < steps.length - 1 && (
              <span className={cn("absolute left-[13px] top-7 h-[calc(100%-24px)] w-0.5 transition-colors duration-300", done ? "bg-brand" : "bg-line")} />
            )}
            <span
              className={cn(
                "z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                done && "border-brand bg-brand text-white",
                active && "border-brand bg-white",
                !done && !active && "border-line bg-white",
              )}
            >
              {done ? <Check size={14} strokeWidth={3} /> : active ? <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand" /> : null}
            </span>
            <div className="pt-0.5">
              <p className={cn("text-sm font-bold", !done && !active && "text-muted")}>{step.label}</p>
              <p className="text-xs text-muted">{done ? "Completed" : active ? "In progress" : "Pending"}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
