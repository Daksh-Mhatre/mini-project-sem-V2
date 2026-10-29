import { useMemo, useState } from "react";
import { ArrowLeft, Clock, Search, TrendingUp, X } from "lucide-react";
import { useGo } from "../../hooks/useGo";
import { categories } from "../../data/categories";
import { popularSearches, products } from "../../data/products";
import { ProductGrid } from "../../components/customer/ProductCollections";
import { EmptyState } from "../../components/ui/Feedback";
import { cn } from "../../utils/cn";

type Sort = "relevance" | "low" | "high" | "discount";

export function SearchPage() {
  const go = useGo();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(["Milk", "Bread", "Eggs"]);
  const [sort, setSort] = useState<Sort>("relevance");

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    const list = products.filter((p) => p.name.toLowerCase().includes(q) || p.category.includes(q));
    const copy = [...list];
    if (sort === "low") copy.sort((a, b) => a.price - b.price);
    if (sort === "high") copy.sort((a, b) => b.price - a.price);
    if (sort === "discount") copy.sort((a, b) => (b.originalPrice ?? b.price) - b.price - ((a.originalPrice ?? a.price) - a.price));
    return copy;
  }, [q, sort]);

  const matchedCategories = q ? categories.filter((c) => c.name.toLowerCase().includes(q)) : [];

  const pick = (term: string) => {
    setQuery(term);
    setRecent((r) => [term, ...r.filter((x) => x !== term)].slice(0, 5));
  };

  const chip = "flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-sm font-semibold hover:border-brand";

  return (
    <div>
      <div className="flex items-center gap-2">
        <button onClick={() => go({ name: "home" })} aria-label="Back" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-white">
          <ArrowLeft size={20} />
        </button>
        <label className="flex h-12 flex-1 items-center gap-2 rounded-2xl border border-brand bg-white px-4 shadow-sm">
          <Search size={20} className="text-muted" />
          <span className="sr-only">Search products</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && q && pick(query.trim())}
            placeholder="Search groceries, snacks, drinks..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="flex h-8 w-8 items-center justify-center rounded-full bg-surface">
              <X size={16} />
            </button>
          )}
        </label>
      </div>

      {!q ? (
        <div className="mt-6 space-y-6">
          {recent.length > 0 && (
            <section>
              <h2 className="mb-2 font-extrabold">Recent searches</h2>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => <button key={r} onClick={() => pick(r)} className={chip}><Clock size={14} className="text-muted" /> {r}</button>)}
              </div>
            </section>
          )}
          <section>
            <h2 className="mb-2 font-extrabold">Popular searches</h2>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((r) => <button key={r} onClick={() => pick(r)} className={chip}><TrendingUp size={14} className="text-brand" /> {r}</button>)}
            </div>
          </section>
        </div>
      ) : (
        <div className="mt-5">
          {matchedCategories.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {matchedCategories.map((c) => (
                <button key={c.id} onClick={() => go({ name: "category", id: c.id })} className={chip}>
                  <span aria-hidden>{c.emoji}</span> {c.name}
                </button>
              ))}
            </div>
          )}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted">{results.length} results for “{query}”</p>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto" role="group" aria-label="Sort results">
              {(["relevance", "low", "high", "discount"] as Sort[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  aria-pressed={sort === s}
                  className={cn("min-h-9 shrink-0 rounded-full border px-3 text-xs font-bold", sort === s ? "border-brand bg-brand-light text-brand-dark" : "border-line bg-white")}
                >
                  {{ relevance: "Relevance", low: "Price ↑", high: "Price ↓", discount: "Best offers" }[s]}
                </button>
              ))}
            </div>
          </div>
          {results.length ? (
            <ProductGrid products={results} />
          ) : (
            <EmptyState emoji="🔍" title="No matches found" text="Try another search — your local store may call it something different." />
          )}
        </div>
      )}
    </div>
  );
}
