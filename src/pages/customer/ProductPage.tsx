import { ArrowLeft, Clock, ShieldCheck, Store } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useGo } from "../../hooks/useGo";
import { findCategory } from "../../data/categories";
import { findProduct, productsByCategory } from "../../data/products";
import { findStore } from "../../data/stores";
import { discountPercent, rupee } from "../../lib/format";
import { ProductImage } from "../../components/ui/ProductImage";
import { QuantitySelector } from "../../components/ui/QuantitySelector";
import { ProductRail, Section, SectionHeader } from "../../components/customer/ProductCollections";
import { EmptyState } from "../../components/ui/Feedback";

export function ProductPage({ id }: { id: string }) {
  const { cart, setQty, storeId, showToast } = useApp();
  const go = useGo();
  const product = findProduct(id);

  if (!product) {
    return <EmptyState emoji="🤔" title="Product not found" text="It may be out of stock nearby." action="Go home" onAction={() => go({ name: "home" })} />;
  }

  const store = findStore(storeId);
  const qty = cart[product.id] ?? 0;
  const off = discountPercent(product);
  const related = productsByCategory(product.category).filter((p) => p.id !== product.id);

  return (
    <div>
      <button onClick={() => go({ name: "category", id: product.category })} className="mb-3 flex min-h-11 items-center gap-1 text-sm font-bold text-muted hover:text-ink">
        <ArrowLeft size={18} /> {findCategory(product.category)?.name}
      </button>
      <div className="grid gap-5 rounded-3xl bg-white p-4 md:grid-cols-2 md:p-6">
        <ProductImage product={product} className="aspect-square w-full md:max-h-[440px]" />
        <div className="flex flex-col">
          <span className="flex w-fit items-center gap-1 rounded bg-surface px-2 py-1 text-xs font-bold text-muted"><Clock size={12} /> {store.deliveryTime}</span>
          <h1 className="mt-2 text-2xl font-extrabold">{product.name}</h1>
          <p className="text-sm text-muted">{product.quantity}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-2xl font-extrabold">{rupee(product.price)}</span>
            {product.originalPrice && <span className="text-muted line-through">{rupee(product.originalPrice)}</span>}
            {off > 0 && <span className="rounded bg-brand-light px-1.5 py-0.5 text-xs font-extrabold text-brand-dark">{off}% OFF</span>}
          </div>
          <p className="text-xs text-muted">Inclusive of all taxes</p>
          <div className="mt-5">
            <QuantitySelector
              size="md"
              qty={qty}
              label={product.name}
              onChange={(n) => {
                if (qty === 0) showToast(`${product.name} added to cart`);
                setQty(product.id, n);
              }}
            />
          </div>
          <div className="mt-6 space-y-2.5 rounded-2xl border border-line p-4 text-sm">
            <p className="flex items-center gap-2"><Store size={16} className="text-brand" /> Fulfilled by <strong>{store.name}</strong>, {store.distance} km away</p>
            <p className="flex items-center gap-2"><ShieldCheck size={16} className="text-brand" /> Picked fresh from the store shelf</p>
          </div>
          <h2 className="mt-5 font-extrabold">About this product</h2>
          <p className="mt-1 text-sm leading-6 text-muted">{product.description}</p>
        </div>
      </div>
      {related.length > 0 && (
        <Section>
          <SectionHeader title="You might also like" />
          <ProductRail products={related} />
        </Section>
      )}
    </div>
  );
}
