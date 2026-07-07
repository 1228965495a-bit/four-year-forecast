import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  interactive?: boolean;
  as?: "div" | "button" | "article";
  children?: ReactNode;
}

export function PixelCard({
  selected,
  interactive,
  className,
  children,
  ...rest
}: PixelCardProps) {
  return (
    <div
      className={cn(
        "quest-card p-3",
        interactive && "quest-card-hover cursor-pointer",
        selected && "quest-card-selected",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
