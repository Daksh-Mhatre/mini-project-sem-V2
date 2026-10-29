import { useEffect, type ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../utils/cn";

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="status" className="animate-slide-up fixed inset-x-0 bottom-24 z-50 mx-auto flex w-fit max-w-[90vw] items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-lg md:bottom-8">
      <CheckCircle2 size={18} className="text-green-400" />
      {message}
    </div>
  );
}

export function EmptyState({ emoji, title, text, action, onAction }: { emoji: string; title: string; text: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-14 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-light text-4xl">{emoji}</div>
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="mt-1 max-w-xs text-sm text-muted">{text}</p>
      {action && <Button className="mt-5" onClick={onAction}>{action}</Button>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-line/70", className)} />;
}

export function ProductSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl bg-white p-2.5">
          <Skeleton className="aspect-square" />
          <Skeleton className="mt-3 h-3 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/3" />
          <Skeleton className="mt-4 h-8" />
        </div>
      ))}
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 sm:max-w-md sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
