import { useEffect, useState } from "react";
import { Search, Store, User } from "lucide-react";
import { useGo } from "../../hooks/useGo";
import { categories } from "../../data/categories";
import { deals, productsByTag } from "../../data/products";
import { currentUser } from "../../data/stores";
import { greeting } from "../../lib/format";
import { StoreCard } from "../../components/customer/StoreCard";
import { CategoryTile } from "../../components/customer/CategoryTile";
import { ProductRail, Section, SectionHeader } from "../../components/customer/ProductCollections";
import { ProductSkeletonGrid } from "../../components/ui/Feedback";

export function HomePage() {
  const go = useGo();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-muted">{greeting()}</p>
          <h1 className="text-2xl font-extrabold md:text-3xl">Hello, {currentUser.name} 👋</h1>
        </div>
        <button onClick={() => go({ name: "profile" })} aria-label="Profile" className="flex h-11 w-11 items-center justify-center rounded-full bg-white md:hidden">
          <User size={20} />
        </button>
      </div>

      <button
        onClick={() => go({ name: "search" })}
        className="mt-4 flex h-12 w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 text-sm text-muted shadow-sm md:hidden"
      >
        <Search size={20} className="text-ink" /> Search for groceries, snacks and more
      </button>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_1fr]">
        <StoreCard />
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand to-emerald-500 p-3.5 text-white">
          <Store size={28} className="shrink-0" />
          <div>
            <p className="text-sm font-extrabold">No warehouses. Just your neighbourhood store.</p>
            <p className="text-xs opacity-90">Every order is packed by a local supermarket near you.</p>
          </div>
        </div>
      </div>

      <Section>
        <SectionHeader title="What's on your mind?" action="See all" onAction={() => go({ name: "categories" })} />
        <div className="grid grid-cols-4 gap-x-3 gap-y-4 md:grid-cols-8">
          {categories.slice(0, 8).map((c) => <CategoryTile key={c.id} category={c} />)}
        </div>
      </Section>

      {loading ? (
        <Section><ProductSkeletonGrid /></Section>
      ) : (
        <>
          <Section>
            <SectionHeader title="Popular near you" />
            <ProductRail products={productsByTag("popular")} />
          </Section>
          <Section>
            <SectionHeader title="Breakfast essentials" />
            <ProductRail products={productsByTag("breakfast")} />
          </Section>
          <Section>
            <SectionHeader title="Fresh picks from your local stores" />
            <ProductRail products={productsByTag("fresh")} />
          </Section>
        </>
      )}

      <Section>
        <SectionHeader title="Deals near you" />
        <div className="grid gap-3 sm:grid-cols-3">
          {deals.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-2xl p-4" style={{ background: d.tint }}>
              <span className="text-4xl" aria-hidden>{d.emoji}</span>
              <div className="min-w-0">
                <p className="font-extrabold">{d.title}</p>
                <p className="text-xs text-muted">{d.subtitle}</p>
                <p className="mt-1 w-fit rounded border border-dashed border-ink/30 px-1.5 text-[11px] font-bold">{d.code}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
