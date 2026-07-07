import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "danger" | "sunny";
type Size = "sm" | "md" | "lg";

export interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClass: Record<Variant, string> = {
  primary: "bg-sage text-ink",
  secondary: "bg-sky text-ink",
  accent: "bg-cherry text-ink",
  sunny: "bg-sunny text-ink",
  ghost: "bg-cream text-ink",
  danger: "bg-destructive text-destructive-foreground",
};

const sizeClass: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn("pixel-btn", variantClass[variant], sizeClass[size], className)}
        {...props}
      />
    );
  },
);
PixelButton.displayName = "PixelButton";
