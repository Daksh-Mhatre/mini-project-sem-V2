import { useApp } from "../../context/AppContext";
import { useGo } from "../../hooks/useGo";
import { FREE_DELIVERY_ABOVE } from "../../lib/pricing";
import { findProduct } from "../../data/products";
import { rupee } from "../../lib/format";
import { BillSummary, CartItem } from "../../components/customer/CartParts";
import { FulfilledBy } from "../../components/customer/StoreCard";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Feedback";

export function CartPage() {
  const { cart, bill, storeId, clearCart } = useApp();
  const go = useGo();
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    return (
      <EmptyState
        emoji="🛒"
        title="Your cart is empty"
        text="Add some essentials and we'll get them to you quickly."
        action="Start Shopping"
        onAction={() => go({ name: "home" })}
      />
    );
  }

  const remaining = FREE_DELIVERY_ABOVE - bill.itemTotal;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">My Cart</h1>
        <button onClick={clearCart} className="min-h-11 text-sm font-bold text-red-500 hover:underline">Clear all</button>
      </div>
      <FulfilledBy storeId={storeId} className="mb-3" />
      {remaining > 0 && (
        <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Add items worth <strong>{rupee(remaining)}</strong> more for FREE delivery
        </p>
      )}
      <div className="rounded-2xl bg-white px-4">
        <p className="border-b border-line py-3 text-sm font-bold">{bill.count} item{bill.count > 1 ? "s" : ""} · Delivery in 30 minutes</p>
        <ul className="divide-y divide-line">
          {entries.map(([id, qty]) => {
            const p = findProduct(id);
            return p ? <CartItem key={id} product={p} qty={qty} /> : null;
          })}
        </ul>
      </div>
      <div className="mt-3">
        <BillSummary {...bill} />
      </div>
      <div className="sticky bottom-[72px] mt-4 md:bottom-4">
        <Button block className="h-14 justify-between px-5 text-base shadow-lg" onClick={() => go({ name: "checkout" })}>
          <span>{rupee(bill.total)} <span className="text-xs font-semibold opacity-90">TOTAL</span></span>
          <span>Proceed to Checkout ›</span>
        </Button>
      </div>
    </div>
  );
}
