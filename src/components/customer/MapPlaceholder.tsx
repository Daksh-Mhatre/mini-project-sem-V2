import { Home, Store } from "lucide-react";

export function MapPlaceholder({ moving, storeName }: { moving: boolean; storeName: string }) {
  return (
    <div
      className="relative h-44 overflow-hidden rounded-2xl border border-line md:h-56"
      style={{
        backgroundColor: "#EEF3EC",
        backgroundImage:
          "linear-gradient(#dfe7dc 1px, transparent 1px), linear-gradient(90deg, #dfe7dc 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
      role="img"
      aria-label={`Map showing route from ${storeName} to your home`}
    >
      <div className="absolute left-[10%] right-[10%] top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white">
        <div className="h-full w-full rounded-full border-t-2 border-dashed border-brand" />
      </div>
      <div className="absolute left-[6%] top-1/2 flex -translate-y-1/2 flex-col items-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-md"><Store size={18} /></span>
        <span className="mt-1 rounded bg-white px-1.5 text-[10px] font-bold shadow-sm">{storeName}</span>
      </div>
      <div className="absolute right-[6%] top-1/2 flex -translate-y-1/2 flex-col items-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white shadow-md"><Home size={18} /></span>
        <span className="mt-1 rounded bg-white px-1.5 text-[10px] font-bold shadow-sm">You</span>
      </div>
      {moving && (
        <span className="animate-ride absolute top-[calc(50%-34px)] text-3xl" aria-hidden>🛵</span>
      )}
    </div>
  );
}
