import type { Category } from "../../types";
import { useGo } from "../../hooks/useGo";

export function CategoryTile({ category }: { category: Category }) {
  const go = useGo();
  return (
    <button
      onClick={() => go({ name: "category", id: category.id })}
      className="group flex flex-col items-center gap-1.5 text-center"
      aria-label={category.name}
    >
      <span
        className="flex aspect-square w-full items-center justify-center rounded-2xl text-4xl transition-transform duration-200 group-hover:scale-[1.04] md:text-5xl"
        style={{ background: category.tint }}
        aria-hidden
      >
        {category.emoji}
      </span>
      <span className="line-clamp-2 text-xs font-bold leading-4 md:text-[13px]">{category.name}</span>
    </button>
  );
}
