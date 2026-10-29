import { ArrowLeft, Bike, CheckCircle2, ExternalLink, Loader2, Phone, Store } from "lucide-react";
import { useOrders } from "../../context/OrdersContext";
import { useGo } from "../../hooks/useGo";
import { deliveryPartners, findStore } from "../../data/stores";
import { rupee, statusRank } from "../../lib/format";
import { OrderTimeline } from "../../components/customer/OrderTimeline";
import { MapPlaceholder } from "../../components/customer/MapPlaceholder";
import { BillSummary } from "../../components/customer/CartParts";
import { FulfilledBy } from "../../components/customer/StoreCard";
import { EmptyState } from "../../components/ui/Feedback";
import type { OrderRecord } from "../../types/db";

function findPartner(id: string | null) {
  return deliveryPartners.find((p) => p.id === id) ?? null;
}

function etaText(order: OrderRecord) {
  const r = statusRank[order.status];
  if (order.status === "delivered") return "Delivered";
  if (r >= 6) return "8 minutes";
  if (r >= 4) return "15 minutes";
  if (r >= 2) return "22 minutes";
  return "28 minutes";
}

function StatusBanner({ order }: { order: OrderRecord }) {
  const store = findStore(order.storeId);
  if (order.status === "finding") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-amber-900">
        <Loader2 size={24} className="animate-spin" />
        <div>
          <p className="font-extrabold">Finding your nearest partner store...</p>
          <p className="text-sm">Checking stock at supermarkets near you</p>
        </div>
      </div>
    );
  }
  if (order.status === "delivered") {
    return (
      <div className="animate-pop flex items-center gap-3 rounded-2xl bg-brand p-4 text-white">
        <CheckCircle2 size={32} />
        <div>
          <p className="text-lg font-extrabold">Order Delivered ✓</p>
          <p className="text-sm opacity-90">Thanks for shopping local with {store.name}!</p>
        </div>
      </div>
    );
  }
  if (order.status === "rejected") {
    return <div className="rounded-2xl bg-red-50 p-4 font-bold text-red-700">{store.name} couldn't fulfil this order. You won't be charged.</div>;
  }
  const messages: Record<string, string> = {
    placed: `${store.name} accepted your order. Waiting for the store to start packing.`,
    preparing: `${store.name} is packing your items`,
    ready: "Your order is packed. Assigning a delivery partner",
    assigned: "Delivery partner is heading to the store",
    picked: "Order picked up from the store",
    out: "Your order is on the way!",
  };
  return (
    <div className="animate-slide-up rounded-2xl bg-brand-light p-4">
      <p className="font-extrabold text-brand-dark">{messages[order.status]}</p>
      <p className="text-sm text-muted">Arriving in <strong className="text-ink">{etaText(order)}</strong></p>
    </div>
  );
}

export function TrackingPage({ id }: { id: string }) {
  const { orders, loading } = useOrders();
  const go = useGo();
  const order = orders.find((o) => o.id === id);

  if (loading) {
    return <div className="py-16 text-center text-sm text-muted">Loading order…</div>;
  }
  if (!order) {
    return <EmptyState emoji="📦" title="Order not found" text="Check your order history." action="View orders" onAction={() => go({ name: "orders" })} />;
  }

  const store = findStore(order.storeId);
  const partner = findPartner(order.deliveryPartnerId);
  const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
  const rank = statusRank[order.status];

  return (
    <div>
      <button onClick={() => go({ name: "orders" })} className="mb-2 flex min-h-11 items-center gap-1 text-sm font-bold text-muted hover:text-ink">
        <ArrowLeft size={18} /> My orders
      </button>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase text-muted">Order #{order.id}</p>
          <h1 className="text-2xl font-extrabold">Track your order</h1>
        </div>
        <FulfilledBy storeId={order.storeId} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-3">
          <StatusBanner order={order} />
          <MapPlaceholder moving={rank >= 5 && rank < 7} storeName={store.name} />
          <section className="rounded-2xl bg-white p-4">
            <h2 className="mb-4 font-extrabold">Order status</h2>
            <OrderTimeline status={order.status} />
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-32 lg:self-start">
          <section className="space-y-3 rounded-2xl bg-white p-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand"><Store size={18} /></span>
              <div className="flex-1">
                <p className="text-xs text-muted">Supermarket</p>
                <p className="font-bold">{store.name} · {store.distance} km</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"><Bike size={18} /></span>
              <div className="flex-1">
                <p className="text-xs text-muted">Delivery partner</p>
                <p className="font-bold">{partner ? `${partner.name} · ⭐ ${partner.rating}` : "Will be assigned soon"}</p>
              </div>
              {partner && (
                <button aria-label={`Call ${partner.name}`} className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-brand">
                  <Phone size={18} />
                </button>
              )}
            </div>
          </section>
          <section className="rounded-2xl bg-white p-4">
            <h2 className="mb-2 font-extrabold">{itemCount} items · {order.payment}</h2>
            <ul className="space-y-1 text-sm">
              {order.items.map((i) => (
                <li key={i.productId} className="flex justify-between">
                  <span className="truncate">{i.name} × {i.qty}</span>
                  <span>{rupee(i.unitPrice * i.qty)}</span>
                </li>
              ))}
            </ul>
          </section>
          <BillSummary {...order} />
          {rank < 7 && rank >= 1 && (
            <div className="rounded-2xl border border-dashed border-brand bg-white p-4 text-sm">
              <p className="font-bold">Demo tip</p>
              <p className="mb-3 text-muted">
                Open the <strong>Store</strong> and <strong>Delivery</strong> dashboards in new browser tabs to move this order forward — every tab reads the same shared order data in real time.
              </p>
              <a href="#/login" target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-brand text-sm font-bold text-brand hover:bg-brand-light">
                Open login in a new tab <ExternalLink size={14} />
              </a>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
