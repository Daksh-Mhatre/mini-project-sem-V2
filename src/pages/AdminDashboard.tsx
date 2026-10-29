import { Bike, CheckCircle2, ShoppingBag, Store } from "lucide-react";
import { useOrders } from "../context/OrdersContext";
import { findStore, stores } from "../data/stores";
import { statusLabel } from "../lib/format";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/Feedback";

export function AdminDashboard() {
  const { orders, loading } = useOrders();
  const delivered = orders.filter((o) => o.status === "delivered").length;

  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted">Platform admin</p>
      <h1 className="mb-5 text-2xl font-extrabold">Network overview</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Orders" value={184 + orders.length} icon={ShoppingBag} tint="#E0F2FE" />
        <StatCard label="Partner Stores" value={12} icon={Store} tint="#EAF7EE" />
        <StatCard label="Delivery Partners" value={21} icon={Bike} tint="#FEF3C7" />
        <StatCard label="Completed" value={162 + delivered} icon={CheckCircle2} tint="#F1ECFB" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-4">
          <h2 className="mb-3 font-extrabold">Live orders</h2>
          {loading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : orders.length === 0 ? (
            <EmptyState emoji="📡" title="No orders yet" text="Orders placed by customers across the network will appear here in real time." />
          ) : (
            <ul className="max-h-96 divide-y divide-line overflow-y-auto">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                  <span><strong>#{o.id}</strong> <span className="text-muted">· {findStore(o.storeId).name}</span></span>
                  <Badge tone={o.status === "delivered" ? "green" : o.status === "rejected" ? "red" : "amber"}>{statusLabel[o.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl bg-white p-4">
          <h2 className="mb-3 font-extrabold">Partner stores</h2>
          <ul className="divide-y divide-line">
            {stores.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                <span><strong>{s.name}</strong> <span className="text-muted">· {s.area}</span></span>
                <Badge tone={s.status === "online" ? "green" : "red"}>{s.status === "online" ? "🟢 Online" : "🔴 Offline"}</Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
