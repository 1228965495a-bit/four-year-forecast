import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * GameShell — 首页最外层：浅米色纸张背景，居中承载游戏窗口。
 * 桌面端首屏不滚动，移动端可滚动。
 */
export function GameShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "paper-bg min-h-screen w-full flex items-center justify-center p-3 md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
