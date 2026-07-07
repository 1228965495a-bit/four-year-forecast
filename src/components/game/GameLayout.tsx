import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export interface GameLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showHome?: boolean;
  className?: string;
}

export function GameLayout({ children, title, subtitle, showHome = true, className }: GameLayoutProps) {
  return (
    <div className="min-h-screen pixel-scanlines">
      {/* 顶部菜单条 */}
      <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="pixel-border-sm bg-cherry/70 flex h-8 w-8 items-center justify-center text-lg">
              🎓
            </span>
            <div>
              <div className="font-display text-sm leading-none md:text-base">
                这专业我先替你读了四年
              </div>
              {subtitle && <div className="text-[10px] text-muted-foreground">{subtitle}</div>}
            </div>
          </Link>
          {showHome && (
            <nav className="flex gap-1.5 text-xs">
              <Link to="/" className="pixel-chip hover:bg-sage/70">🏠 首页</Link>
              <Link to="/major" className="pixel-chip hover:bg-sky/70">📚 选专业</Link>
              <Link to="/semester" className="pixel-chip hover:bg-sunny/70">🎮 模拟</Link>
              <Link to="/result" className="pixel-chip hover:bg-cherry/70">🏆 结局</Link>
            </nav>
          )}
        </div>
        {title && (
          <div className="mx-auto max-w-7xl px-3 pb-2 md:px-6">
            <h1 className="font-display text-lg md:text-xl">{title}</h1>
          </div>
        )}
      </header>

      <main className={cn("mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6", className)}>{children}</main>

      <footer className="mx-auto max-w-7xl px-3 pb-6 pt-2 text-center text-[11px] text-muted-foreground md:px-6">
        像素校园生活模拟 · 原型版 v0.1 · 素材待替换
      </footer>
    </div>
  );
}
