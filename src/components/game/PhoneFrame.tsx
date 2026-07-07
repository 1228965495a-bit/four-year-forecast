import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * PhoneFrame — 移动端优先竖屏游戏容器。
 * - 手机屏 (<640px)：全屏占满，无边框，纯游戏体验
 * - 桌面 (>=640px)：居中展示一个 390×844 的像素手机窗口，
 *   带深棕描边和硬阴影，像掌机 / 手机游戏窗口
 */
export function PhoneFrame({
  children,
  className,
  topBar,
  bottomBar,
}: {
  children: ReactNode;
  className?: string;
  topBar?: ReactNode;
  bottomBar?: ReactNode;
}) {
  return (
    <div className="paper-bg min-h-screen w-full flex items-center justify-center sm:p-6">
      {/* 桌面端"手机机身"外框（媒体断点 640px 以下不显示） */}
      <div className="hidden sm:flex flex-col items-center">
        <PhoneShell className={className}>
          {topBar}
          <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden scrollbar-none">{children}</div>
          {bottomBar}
        </PhoneShell>
        <div className="mt-3 font-display text-[11px] tracking-widest text-ink/60">
          CAMPUS · SIM · v0.2 · 竖屏像素小游戏
        </div>
      </div>
      {/* 手机原生视图 */}
      <div className="relative flex sm:hidden w-full h-[100dvh] min-h-[100dvh] flex-col bg-cream overflow-hidden">
        {topBar}
        <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden">{children}</div>
        {bottomBar}
      </div>
    </div>
  );
}

function PhoneShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("phone-frame flex flex-col", className)}>
      {/* 顶部"听筒 / 摄像头"装饰 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-center pt-1.5">
        <div className="flex items-center gap-2">
          <span className="block h-1.5 w-1.5 rounded-full bg-ink/50" />
          <span className="block h-2 w-16 rounded-full bg-ink" />
          <span className="block h-1.5 w-1.5 rounded-full bg-ink/50" />
        </div>
      </div>
      <div className="pt-5 flex-1 flex flex-col min-h-0">{children}</div>
      {/* 底部 home 指示条 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-40 flex justify-center">
        <span className="block h-1 w-24 rounded-full bg-ink/70" />
      </div>
    </div>
  );
}
