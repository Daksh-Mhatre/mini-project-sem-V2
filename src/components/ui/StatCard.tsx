import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, tint }: { label: string; value: number | string; icon: LucideIcon; tint: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: tint }}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-2xl font-extrabold leading-none">{value}</p>
        <p className="mt-1 text-xs font-semibold text-muted">{label}</p>
      </div>
    </div>
  );
}
