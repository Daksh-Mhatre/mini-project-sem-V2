import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { Product } from "../../types";
import { ProductCard } from "./ProductCard";

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-extrabold md:text-xl">{title}</h2>
      {action && (
        <button onClick={onAction} className="flex min-h-11 items-center text-sm font-bold text-brand hover:underline">
          {action} <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

export function ProductRail({ products }: { products: Product[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
      {products.map((p) => (
        <div key={p.id} className="w-[152px] shrink-0 sm:w-[170px]">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

export function Section({ children }: { children: ReactNode }) {
  return <section className="mt-7">{children}</section>;
}
