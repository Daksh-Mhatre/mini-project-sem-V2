import { CheckCircle2, Clock, PackageCheck, Bell } from "lucide-react";
import { useOrders } from "../context/OrdersContext";
import { statusRank } from "../lib/format";
import { StatCard } from "../components/ui/StatCard";
import { EmptyState } from "../components/ui/Feedback";
import { StoreOrderCard } from "../components/supermarket/StoreOrderCard";

const BASE_COMPLETED = 128;

export function StoreDashboard() {
  const { orders, loading, error } = useOrders();
  const incoming = orders.filter((o) => o.status === "placed");
  const preparing = orders.filter((o) => o.status === "preparing");
  const ready = orders.filter((o) => o.status === "ready" || o.status === "assigned");
  const completed = orders.filter((o) => statusRank[o.status] >= 5).length;
  const active = [...incoming, ...preparing, ...ready];

  if (loading) return <div className="py-16 text-center text-sm text-muted">Loading orders…</div>;

  return (
    <div>
      {error && <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="New Orders" value={incoming.length} icon={Bell} tint="#E0F2FE" />
        <StatCard label="Preparing" value={preparing.length} icon={Clock} tint="#FEF3C7" />
        <StatCard label="Ready" value={ready.length} icon={PackageCheck} tint="#EAF7EE" />
        <StatCard label="Completed" value={BASE_COMPLETED + completed} icon={CheckCircle2} tint="#F1ECFB" />
      </div>

      <h2 className="mb-3 mt-7 text-lg font-extrabold">Incoming & active orders</h2>
      {active.length === 0 ? (
        <EmptyState emoji="🛎️" title="No active orders" text="New orders placed by customers for your store will appear here automatically — no refresh needed." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {active.map((o) => <StoreOrderCard key={o.id} order={o} />)}
        </div>
      )}
    </div>
  );
}
