import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "accent" | "sunny" | "ghost" | "danger" | "gold";
type Size = "sm" | "md" | "lg" | "block";

export interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  suffix?: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: "bg-sage text-ink",
  secondary: "bg-sky text-ink",
  accent: "bg-cherry text-cream",
  sunny: "bg-sunny text-ink",
  ghost: "bg-cream text-ink",
  danger: "text-cream",
  gold: "text-ink",
};

const variantStyle: Partial<Record<Variant, React.CSSProperties>> = {
  danger: { background: "var(--danger)" },
  gold: { background: "var(--gold)" },
};

const sizeClass: Record<Size, string> = {
  sm: "px-2.5 py-1 text-[11px]",
  md: "px-3.5 py-1.5 text-[13px]",
  lg: "px-4 py-2.5 text-[15px]",
  block: "w-full px-4 py-3 text-[15px]",
};

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = "primary", size = "md", icon, suffix, children, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "pixel-btn inline-flex items-center justify-center gap-1.5",
          variantClass[variant],
          sizeClass[size],
          className,
        )}
        style={{ ...variantStyle[variant], ...style }}
        {...props}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        <span className="font-display leading-none tracking-wider">{children}</span>
        {suffix && <span className="ml-auto shrink-0 opacity-80">{suffix}</span>}
      </button>
    );
  },
);
PixelButton.displayName = "PixelButton";
