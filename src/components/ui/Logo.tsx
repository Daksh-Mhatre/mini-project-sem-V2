export function Logo({ light }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-lg font-black text-white">p</span>
      <span className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        padosi<span className="text-brand">.</span>
      </span>
    </span>
  );
}
