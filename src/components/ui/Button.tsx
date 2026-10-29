import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type Variant = "primary" | "outline" | "ghost" | "danger" | "dark";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark shadow-sm",
  outline: "border border-brand text-brand bg-white hover:bg-brand-light",
  ghost: "text-ink hover:bg-surface",
  danger: "border border-red-200 text-red-600 bg-white hover:bg-red-50",
  dark: "bg-ink text-white hover:bg-black",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

export function Button({ variant = "primary", block, className, ...rest }: Props) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        block && "w-full",
        className,
      )}
      {...rest}
    />
  );
}
