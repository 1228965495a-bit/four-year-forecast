import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 通用像素面板：奶油底 + 深棕 3px 描边 + 硬阴影。
 * 支持可选羊皮纸标题条。
 */
export interface PixelPanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  titleRight?: ReactNode;
  size?: "sm" | "md";
  bodyClassName?: string;
  tone?: "cream" | "sunny" | "sky" | "sage" | "cherry" | "parchment" | "ink";
}

const toneBg: Record<NonNullable<PixelPanelProps["tone"]>, string> = {
  cream: "bg-cream",
  sunny: "bg-sunny/60",
  sky: "bg-sky/50",
  sage: "bg-sage/60",
  cherry: "bg-cherry/40",
  parchment: "",
  ink: "bg-ink text-cream",
};

export function PixelPanel({
  title,
  titleRight,
  size = "md",
  className,
  bodyClassName,
  tone = "cream",
  children,
  style,
  ...rest
}: PixelPanelProps) {
  const bodyBg = tone === "parchment" ? "" : toneBg[tone];
  const bg = tone === "parchment" ? { background: "var(--parchment)" } : undefined;
  return (
    <div
      className={cn(size === "sm" ? "pixel-panel-sm" : "pixel-panel", "overflow-hidden", bodyBg, className)}
      style={{ ...bg, ...style }}
      {...rest}
    >
      {title && (
        <div className="panel-title-strip">
          <span className="h-1.5 w-1.5 bg-ink" />
          <span className="flex-1 truncate">{title}</span>
          {titleRight}
        </div>
      )}
      <div className={cn(size === "sm" ? "p-2" : "p-3", bodyClassName)}>{children}</div>
    </div>
  );
}
