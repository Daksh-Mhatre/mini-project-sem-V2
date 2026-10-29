import { Trash2 } from "lucide-react";
import type { Product } from "../../types";
import { useApp } from "../../context/AppContext";
import { rupee } from "../../lib/format";
import { ProductImage } from "../ui/ProductImage";
import { QuantitySelector } from "../ui/QuantitySelector";

export function CartItem({ product, qty }: { product: Product; qty: number }) {
  const { setQty } = useApp();
  return (
    <li className="flex items-center gap-3 py-3">
      <ProductImage product={product} className="h-16 w-16 shrink-0" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold">{product.name}</h3>
        <p className="text-xs text-muted">{product.quantity}</p>
        <button onClick={() => setQty(product.id, 0)} className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline">
          <Trash2 size={12} /> Remove
        </button>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <QuantitySelector qty={qty} onChange={(n) => setQty(product.id, n)} label={product.name} />
        <span className="text-sm font-extrabold">{rupee(product.price * qty)}</span>
      </div>
    </li>
  );
}

interface BillProps {
  itemTotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export function BillSummary({ itemTotal, deliveryFee, discount, total }: BillProps) {
  const row = "flex justify-between text-sm";
  return (
    <div className="rounded-2xl bg-white p-4">
      <h2 className="mb-3 font-extrabold">Bill details</h2>
      <div className="space-y-2">
        <div className={row}><span className="text-muted">Item total</span><span>{rupee(itemTotal)}</span></div>
        <div className={row}>
          <span className="text-muted">Delivery fee</span>
          <span className={deliveryFee === 0 ? "font-bold text-brand" : ""}>{deliveryFee === 0 ? "FREE" : rupee(deliveryFee)}</span>
        </div>
        {discount > 0 && (
          <div className={row}><span className="text-muted">Store discount</span><span className="font-bold text-brand">−{rupee(discount)}</span></div>
        )}
        <div className="flex justify-between border-t border-dashed border-line pt-2.5 text-base font-extrabold">
          <span>Total</span><span>{rupee(total)}</span>
        </div>
      </div>
    </div>
  );
}
