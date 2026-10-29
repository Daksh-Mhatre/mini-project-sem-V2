import { useState } from "react";
import type { Product } from "../../types";
import { findCategory } from "../../data/categories";
import { cn } from "../../utils/cn";

export function ProductImage({ product, className }: { product: Product; className?: string }) {
  const [failed, setFailed] = useState(false);
  const tint = findCategory(product.category)?.tint ?? "#F7F7F7";

  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden rounded-xl", className)} style={{ background: tint }}>
      {failed ? (
        <span className="text-5xl" role="img" aria-label={product.name}>{product.emoji}</span>
      ) : (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
