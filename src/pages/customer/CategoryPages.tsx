import { ArrowLeft } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useGo } from "../../hooks/useGo";
import { categories, findCategory } from "../../data/categories";
import { productsByCategory } from "../../data/products";
import { CategoryTile } from "../../components/customer/CategoryTile";
import { ProductGrid } from "../../components/customer/ProductCollections";
import { FulfilledBy } from "../../components/customer/StoreCard";
import { EmptyState } from "../../components/ui/Feedback";
import { cn } from "../../utils/cn";

export function CategoriesPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold">All categories</h1>
      <p className="mb-5 text-sm text-muted">Stocked by supermarkets in your neighbourhood</p>
      <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6">
        {categories.map((c) => <CategoryTile key={c.id} category={c} />)}
      </div>
    </div>
  );
}

export function CategoryListingPage({ id }: { id: string }) {
  const { storeId } = useApp();
  const go = useGo();
  const category = findCategory(id);
  const items = productsByCategory(id);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => go({ name: "categories" })} aria-label="Back" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold md:text-2xl">{category?.name ?? "Products"}</h1>
          <p className="text-xs text-muted">{items.length} items</p>
        </div>
      </div>
      <FulfilledBy storeId={storeId} className="mb-4" />
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <aside className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-col md:overflow-visible md:px-0" aria-label="Categories">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => go({ name: "category", id: c.id })}
              aria-current={c.id === id ? "true" : undefined}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-left text-sm font-bold transition-colors",
                c.id === id ? "bg-brand-light text-brand-dark" : "bg-white hover:bg-line/50",
              )}
            >
              <span aria-hidden>{c.emoji}</span> <span className="whitespace-nowrap md:whitespace-normal">{c.name}</span>
            </button>
          ))}
        </aside>
        <div>
          {items.length ? (
            <ProductGrid products={items} />
          ) : (
            <EmptyState emoji="📦" title="Coming soon" text="Nearby stores are adding products here." />
          )}
        </div>
      </div>
    </div>
  );
}
