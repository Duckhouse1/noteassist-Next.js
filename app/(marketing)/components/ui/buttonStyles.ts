type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export function buttonStyles({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:pointer-events-none";

  const sizes: Record<Size, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
  };

  const variants: Record<Variant, string> = {
    primary:
      "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm shadow-zinc-900/10",
    secondary:
      "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 shadow-sm",
    ghost: "bg-transparent text-zinc-900 hover:bg-zinc-100",
  };

  return [base, sizes[size], variants[variant], className]
    .filter(Boolean)
    .join(" ");
}