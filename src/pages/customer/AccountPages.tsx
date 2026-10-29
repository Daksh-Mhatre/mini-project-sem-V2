import { ChevronRight, HelpCircle, MapPin, Phone, Store, Wallet } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useOrders } from "../../context/OrdersContext";
import { useGo } from "../../hooks/useGo";
import { currentUser, findStore } from "../../data/stores";
import { rupee, statusLabel } from "../../lib/format";
import { EmptyState } from "../../components/ui/Feedback";
import { Badge } from "../../components/ui/Badge";

export function OrdersPage() {
  const { orders, loading } = useOrders();
  const go = useGo();

  if (loading) return <div className="py-16 text-center text-sm text-muted">Loading orders…</div>;

  if (orders.length === 0) {
    return <EmptyState emoji="📋" title="No orders yet" text="Your next order will appear here." action="Start Shopping" onAction={() => go({ name: "home" })} />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-extrabold">My Orders</h1>
      <ul className="space-y-3">
        {orders.map((o) => {
          const count = o.items.reduce((s, i) => s + i.qty, 0);
          const tone = o.status === "delivered" ? "green" : o.status === "rejected" ? "red" : "amber";
          return (
            <li key={o.id}>
              <button
                onClick={() => go({ name: "tracking", id: o.id })}
                className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left transition-shadow hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand"><Store size={22} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-extrabold">Order #{o.id}</p>
                    <Badge tone={tone}>{statusLabel[o.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted">{findStore(o.storeId).name} · {count} items · {rupee(o.total)}</p>
                  <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                </div>
                <ChevronRight size={20} className="text-muted" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ProfilePage() {
  const { orders } = useOrders();
  const { storeId } = useApp();
  const rows = [
    { icon: MapPin, label: "Saved addresses", value: `${currentUser.addressLabel} · ${currentUser.city}` },
    { icon: Store, label: "Preferred store", value: findStore(storeId).name },
    { icon: Wallet, label: "Payments", value: "UPI, Cash on Delivery" },
    { icon: HelpCircle, label: "Help & support", value: "Chat with us 24×7" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="flex items-center gap-4 rounded-2xl bg-white p-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-2xl font-extrabold text-white">{currentUser.name[0]}</span>
        <div>
          <h1 className="text-xl font-extrabold">{currentUser.name}</h1>
          <p className="flex items-center gap-1 text-sm text-muted"><Phone size={14} /> {currentUser.phone}</p>
          <p className="text-sm font-semibold text-brand-dark">{orders.length} orders from local stores</p>
        </div>
      </div>
      <ul className="divide-y divide-line rounded-2xl bg-white">
        {rows.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex min-h-16 items-center gap-3 px-4">
            <Icon size={20} className="text-brand" />
            <div className="flex-1">
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs text-muted">{value}</p>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </li>
        ))}
      </ul>
      <div className="rounded-2xl bg-brand-light p-4 text-sm">
        <p className="font-extrabold text-brand-dark">Why Padosi?</p>
        <p className="mt-1 text-muted">We don't run warehouses. Your orders are packed by trusted supermarkets in your own town, so money stays local and delivery stays quick.</p>
      </div>
    </div>
  );
}
