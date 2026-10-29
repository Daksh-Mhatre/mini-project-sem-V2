import { useState } from "react";
import { ArrowLeft, Banknote, Clock, CreditCard, Home, Smartphone, Store } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { useOrders } from "../../context/OrdersContext";
import { useGo } from "../../hooks/useGo";
import { currentUser, findStore } from "../../data/stores";
import { findProduct } from "../../data/products";
import { rupee } from "../../lib/format";
import { BillSummary } from "../../components/customer/CartParts";
import { StorePicker } from "../../components/customer/StoreCard";
import { ProductImage } from "../../components/ui/ProductImage";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Feedback";
import { cn } from "../../utils/cn";

const payments = [
  { id: "Cash on Delivery", icon: Banknote, hint: "Pay when your order arrives" },
  { id: "UPI", icon: Smartphone, hint: "GPay, PhonePe, Paytm" },
  { id: "Card", icon: CreditCard, hint: "Debit / Credit card" },
];

export function CheckoutPage() {
  const { cart, bill, storeId, clearCart } = useApp();
  const { profile } = useAuth();
  const { placeOrder, error } = useOrders();
  const go = useGo();
  const [payment, setPayment] = useState(payments[0].id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const store = findStore(storeId);
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    return <EmptyState emoji="🧾" title="Nothing to checkout" text="Your cart is empty." action="Start Shopping" onAction={() => go({ name: "home" })} />;
  }

  const card = "rounded-2xl bg-white p-4";

  const submit = async () => {
    if (!profile || placing) return;
    setPlacing(true);
    const order = await placeOrder({
      storeId,
      items: Object.entries(cart).map(([productId, qty]) => ({ productId, qty })),
      payment,
      address: `${currentUser.addressLabel}, ${currentUser.address}, ${currentUser.city}`,
    });
    setPlacing(false);
    if (order) {
      clearCart();
      go({ name: "tracking", id: order.id });
    }
  };

  return (
    <div>
      <button onClick={() => go({ name: "cart" })} className="mb-2 flex min-h-11 items-center gap-1 text-sm font-bold text-muted hover:text-ink">
        <ArrowLeft size={18} /> Back to cart
      </button>
      <h1 className="mb-4 text-2xl font-extrabold">Checkout</h1>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-3">
          <section className={card}>
            <h2 className="mb-2 text-sm font-extrabold uppercase text-muted">Delivery address</h2>
            <div className="flex gap-3">
              <Home size={20} className="mt-0.5 text-brand" />
              <div>
                <p className="font-extrabold">{currentUser.addressLabel}</p>
                <p className="text-sm text-muted">{currentUser.address}</p>
                <p className="text-sm text-muted">{currentUser.city}</p>
              </div>
            </div>
          </section>

          <section className={card}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase text-muted">Fulfilled by</h2>
              <button onClick={() => setPickerOpen(true)} className="min-h-11 text-sm font-bold text-brand hover:underline">Change</button>
            </div>
            <div className="flex gap-3">
              <Store size={20} className="mt-0.5 text-brand" />
              <div>
                <p className="font-extrabold">{store.name}</p>
                <p className="text-sm text-muted">{store.area} · {store.distance} km away</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-bold text-brand-dark"><Clock size={14} /> Estimated delivery {store.deliveryTime}</p>
              </div>
            </div>
          </section>

          <section className={card}>
            <h2 className="mb-3 text-sm font-extrabold uppercase text-muted">Payment method</h2>
            <div className="space-y-2" role="radiogroup" aria-label="Payment method">
              {payments.map(({ id, icon: Icon, hint }) => (
                <button
                  key={id}
                  role="radio"
                  aria-checked={payment === id}
                  onClick={() => setPayment(id)}
                  className={cn(
                    "flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 text-left transition-colors",
                    payment === id ? "border-brand bg-brand-light/60" : "border-line hover:bg-surface",
                  )}
                >
                  <Icon size={20} className="text-brand" />
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{id}</span>
                    <span className="block text-xs text-muted">{hint}</span>
                  </span>
                  <span className={cn("h-5 w-5 rounded-full border-2", payment === id ? "border-[6px] border-brand" : "border-line")} />
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-32 lg:self-start">
          <section className={card}>
            <h2 className="mb-2 font-extrabold">Order summary · {bill.count} items</h2>
            <ul className="max-h-60 space-y-2 overflow-y-auto">
              {entries.map(([id, qty]) => {
                const p = findProduct(id);
                if (!p) return null;
                return (
                  <li key={id} className="flex items-center gap-2 text-sm">
                    <ProductImage product={p} className="h-10 w-10 shrink-0 rounded-lg" />
                    <span className="flex-1 truncate">{p.name} <span className="text-muted">× {qty}</span></span>
                    <span className="font-bold">{rupee(p.price * qty)}</span>
                  </li>
                );
              })}
            </ul>
          </section>
          <BillSummary {...bill} />
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <Button block className="h-14 text-base" disabled={placing} onClick={submit}>
            {placing ? "Placing order…" : `Place Order · ${rupee(bill.total)}`}
          </Button>
          <p className="text-center text-xs text-muted">Payment is simulated for this prototype. Totals are recalculated from the store's live catalogue on the backend, never trusted from the browser.</p>
        </aside>
      </div>
      <StorePicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </div>
  );
}
