import { useState } from "react";
import { Check, ChevronDown, Clock, MapPin, Star, Store as StoreIcon } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { findStore, stores } from "../../data/stores";
import { Modal } from "../ui/Feedback";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

export function StoreCard() {
  const { storeId } = useApp();
  const [open, setOpen] = useState(false);
  const store = findStore(storeId);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left transition-shadow hover:shadow-md"
        aria-label={`Selected store ${store.name}. Change store`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
          <StoreIcon size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Your local partner store</p>
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-extrabold">{store.name}</h2>
            <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600">
              <Star size={12} fill="currentColor" /> {store.rating}
            </span>
          </div>
          <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
            <span className="flex items-center gap-1 font-semibold text-brand-dark"><Clock size={12} /> Delivery in {store.deliveryTime}</span>
            <span className="flex items-center gap-1"><MapPin size={12} /> {store.distance} km away</span>
          </p>
        </div>
        <ChevronDown size={20} className="shrink-0 text-muted" />
      </button>
      <StorePicker open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function StorePicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { storeId, setStoreId, showToast } = useApp();

  return (
    <Modal open={open} onClose={onClose} title="Stores near you">
      <p className="-mt-2 mb-4 text-sm text-muted">Local supermarkets that deliver to your area. Your order is packed by the store you choose.</p>
      <ul className="space-y-2.5">
        {stores.map((s) => {
          const selected = s.id === storeId;
          const offline = s.status === "offline";
          return (
            <li key={s.id} className={cn("flex items-center gap-3 rounded-2xl border p-3", selected ? "border-brand bg-brand-light/50" : "border-line")}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-extrabold">{s.name}</h3>
                  {offline && <Badge tone="red">Closed</Badge>}
                </div>
                <p className="text-xs text-muted">{s.area} · {s.distance} km · {s.deliveryTime}</p>
                <p className="flex items-center gap-0.5 text-xs font-bold text-amber-600"><Star size={11} fill="currentColor" /> {s.rating}</p>
              </div>
              {selected ? (
                <span className="flex items-center gap-1 text-sm font-bold text-brand"><Check size={16} /> Selected</span>
              ) : (
                <Button
                  variant="outline"
                  disabled={offline}
                  onClick={() => {
                    setStoreId(s.id);
                    showToast(`Now shopping from ${s.name}`);
                    onClose();
                  }}
                >
                  Select
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

export function FulfilledBy({ storeId, className }: { storeId: string; className?: string }) {
  const store = findStore(storeId);
  return (
    <div className={cn("flex items-center gap-2 rounded-xl bg-brand-light px-3 py-2 text-sm", className)}>
      <StoreIcon size={16} className="text-brand" />
      <span>Fulfilled by <strong>{store.name}</strong> · {store.distance} km away</span>
    </div>
  );
}
