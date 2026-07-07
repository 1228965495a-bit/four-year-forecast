import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * PixelPanel — 通用像素面板：奶油底 + 3px 深棕描边 + 硬阴影。
 */
export interface PixelPanelProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md";
  header?: ReactNode;
}

export function PixelPanel({
  size = "md",
  header,
  className,
  children,
  ...rest
}: PixelPanelProps) {
  return (
    <div
      className={cn(
        size === "sm" ? "pixel-panel-sm" : "pixel-panel",
        "relative",
        className,
      )}
      {...rest}
    >
      {header && (
        <div className="border-b-[3px] border-ink bg-sunny px-3 py-1.5 rounded-t-[7px]">
          {header}
        </div>
      )}
      {children}
    </div>
  );
}
