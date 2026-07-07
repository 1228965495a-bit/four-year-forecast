import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "cream" | "sage" | "sky" | "cherry" | "tan" | "sunny";
  selected?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  as?: "div" | "article" | "section" | "button";
}

const toneClass = {
  cream: "bg-card",
  sage: "bg-sage/60",
  sky: "bg-sky/60",
  cherry: "bg-cherry/50",
  tan: "bg-tan/60",
  sunny: "bg-sunny/60",
};

export function PixelCard({
  tone = "cream",
  selected,
  header,
  footer,
  className,
  children,
  ...rest
}: PixelCardProps) {
  return (
    <div
      className={cn(
        "pixel-border relative p-4 transition-all",
        toneClass[tone],
        selected && "-translate-y-[2px] ring-2 ring-cherry ring-offset-2 ring-offset-cream",
        className,
      )}
      {...rest}
    >
      {header && <div className="mb-3">{header}</div>}
      {children}
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}
