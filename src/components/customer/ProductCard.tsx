import { memo } from "react";
import { Clock } from "lucide-react";
import type { Product } from "../../types";
import { useApp } from "../../context/AppContext";
import { useGo } from "../../hooks/useGo";
import { discountPercent, rupee } from "../../lib/format";
import { ProductImage } from "../ui/ProductImage";
import { QuantitySelector } from "../ui/QuantitySelector";

function ProductCardBase({ product }: { product: Product }) {
  const { cart, setQty, showToast } = useApp();
  const go = useGo();
  const qty = cart[product.id] ?? 0;
  const off = discountPercent(product);

  const handleChange = (n: number) => {
    if (qty === 0 && n === 1) showToast(`${product.name} added to cart`);
    setQty(product.id, n);
  };

  return (
    <article className="group relative flex flex-col rounded-2xl border border-line bg-white p-2.5 transition-shadow duration-200 hover:shadow-md">
      {off > 0 && (
        <span className="absolute left-2.5 top-2.5 z-10 rounded-br-lg rounded-tl-xl bg-brand px-1.5 py-1 text-[10px] font-extrabold leading-none text-white">
          {off}% OFF
        </span>
      )}
      <button onClick={() => go({ name: "product", id: product.id })} className="text-left" aria-label={`View ${product.name}`}>
        <ProductImage product={product} className="aspect-square w-full" />
        <span className="mt-2 flex w-fit items-center gap-1 rounded bg-surface px-1.5 py-0.5 text-[10px] font-bold text-muted">
          <Clock size={10} /> 30 MINS
        </span>
        <h3 className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-5">{product.name}</h3>
        <p className="text-xs text-muted">{product.quantity}</p>
      </button>
      <div className="mt-auto flex items-end justify-between gap-1 pt-3">
        <div className="leading-tight">
          <p className="text-[15px] font-extrabold">{rupee(product.price)}</p>
          {product.originalPrice && <p className="text-xs text-muted line-through">{rupee(product.originalPrice)}</p>}
        </div>
        <QuantitySelector qty={qty} onChange={handleChange} label={product.name} />
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);
