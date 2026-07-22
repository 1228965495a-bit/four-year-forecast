import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 新版游戏画布。名称暂时保留，避免迁移期间改动所有路由接口。 */
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
    <main className="v4-page">
      <section className={cn("v4-game", className)}>
        {topBar}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        {bottomBar}
      </section>
    </main>
  );
}
