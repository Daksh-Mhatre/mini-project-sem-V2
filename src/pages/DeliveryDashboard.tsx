import { ArrowDown, CheckCircle2, Home, IndianRupee, Navigation, Package, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrdersContext";
import { findStore } from "../data/stores";
import { rupee } from "../lib/format";
import type { OrderRecord } from "../types/db";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/Feedback";
import { StatCard } from "../components/ui/StatCard";

const EARNING = 35;

function Route({ order }: { order: OrderRecord }) {
  const store = findStore(order.storeId);
  const count = order.items.reduce((s, i) => s + i.qty, 0);
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-2 font-bold"><Store size={18} className="text-brand" /> {store.name} <span className="text-xs font-normal text-muted">{store.area}</span></p>
      <ArrowDown size={16} className="ml-0.5 text-muted" />
      <p className="flex items-center gap-2 font-bold"><Home size={18} /> {order.customerName} <span className="truncate text-xs font-normal text-muted">{order.address}</span></p>
      <p className="pt-2 text-sm text-muted">{store.distance} km · {rupee(order.total)} · {count} items · {order.payment}</p>
    </div>
  );
}

function ActiveDelivery({ order }: { order: OrderRecord }) {
  const { updateStatus } = useOrders();
  const store = findStore(order.storeId);

  const stage = {
    assigned: { title: `Pickup from ${store.name}`, badge: "Go to store", action: "Order picked up", next: "picked" as const },
    picked: { title: "Order picked up", badge: "Collected", action: "Start Delivery", next: "out" as const },
    out: { title: "Delivering to customer", badge: "On the way", action: "Mark as Delivered", next: "delivered" as const },
  }[order.status as "assigned" | "picked" | "out"];

  if (!stage) return null;

  return (
    <article className="animate-slide-up rounded-2xl border-2 border-brand bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-extrabold">{stage.title}</h2>
        <Badge tone="amber">{stage.badge}</Badge>
      </div>
      <Route order={order} />
      <Button block className="mt-4 h-12" onClick={() => updateStatus(order.id, stage.next)}>
        {order.status === "out" ? <CheckCircle2 size={18} /> : <Navigation size={18} />} {stage.action}
      </Button>
    </article>
  );
}

export function DeliveryDashboard() {
  const { profile } = useAuth();
  const { orders, claimDelivery, error } = useOrders();
  const partnerId = profile?.partnerId ?? profile?.id ?? "";
  const requests = orders.filter((o) => o.status === "ready" && !o.deliveryPartnerId);
  const active = orders.filter((o) => o.deliveryPartnerId === partnerId && ["assigned", "picked", "out"].includes(o.status));
  const done = orders.filter((o) => o.deliveryPartnerId === partnerId && o.status === "delivered");

  return (
    <div className="mx-auto max-w-3xl">
      {error && <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Today's deliveries" value={6 + done.length} icon={Package} tint="#EAF7EE" />
        <StatCard label="Today's earnings" value={rupee(210 + done.length * EARNING)} icon={IndianRupee} tint="#FEF3C7" />
      </div>

      <div className="mt-6 space-y-3">
        {active.map((o) => <ActiveDelivery key={o.id} order={o} />)}

        {requests.map((o) => (
          <article key={o.id} className="animate-slide-up rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">New Delivery · #{o.id}</h2>
              <span className="font-extrabold text-brand">+{rupee(EARNING)}</span>
            </div>
            <Route order={o} />
            <Button block className="mt-4 h-12" onClick={() => claimDelivery(o.id)}>
              Accept Delivery
            </Button>
          </article>
        ))}

        {done.slice(0, 3).map((o) => (
          <div key={o.id} className="flex items-center gap-3 rounded-2xl bg-brand-light p-4">
            <CheckCircle2 size={28} className="text-brand" />
            <div className="flex-1">
              <p className="font-extrabold">✓ Delivery Completed · #{o.id}</p>
              <p className="text-sm text-muted">Order value {rupee(o.total)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Delivery earnings</p>
              <p className="font-extrabold text-brand-dark">{rupee(EARNING)}</p>
            </div>
          </div>
        ))}

        {active.length === 0 && requests.length === 0 && (
          <EmptyState emoji="🛵" title="Waiting for deliveries" text="When a partner store marks an order ready, the request shows up here automatically." />
        )}
      </div>
    </div>
  );
}
