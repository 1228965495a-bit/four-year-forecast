// 结算页共用视觉块：横幅、鉴定徽章网格、便签、按钮行。
// 两个页面（/result 毕业，/midway-result 中途）共用，仅数据不同。
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PixelPanel9 } from "@/components/pixel/PixelPanel9";
import { PixelStatBar, PixelButton3 } from "@/components/pixel/PixelSkin";
import type { ResultTag } from "@/lib/resultTags";
import type { StatMeta } from "@/lib/statsMeta";

const TONE_BG: Record<ResultTag["tone"], string> = {
  cherry: "var(--cherry)",
  sage:   "var(--sage)",
  sky:    "var(--sky)",
  sunny:  "var(--sunny)",
  grape:  "#C9A8E8",
  tan:    "var(--tan)",
};

/* ---------------- Banner: 中途结算! / 结局达成! ---------------- */

export function ResultBanner({
  tag,
  title,
  tier,
  emoji,
}: {
  tag: string;                       // 上方小挂旗文本，如 "中途结算!"
  title: string;                     // 主标题，如 "跑路预备役"
  tier: "S" | "A" | "B" | "C" | "D"; // 章色
  emoji?: string;                    // 主视觉 emoji（占素材位）
}) {
  const tierBg = tier === "S" ? "var(--sunny)" : tier === "A" ? "var(--sage)" : tier === "C" ? "var(--tan)" : "var(--cherry)";
  return (
    <div className="relative flex items-center gap-3 px-3 pt-2 pb-3">
      <div
        className="shrink-0 relative flex items-center justify-center border-[3px] border-ink shadow-[3px_3px_0_0_var(--ink)]"
        style={{ width: 72, height: 72, background: tierBg }}
      >
        <span className="font-display text-[30px] leading-none text-ink drop-shadow-[1px_1px_0_var(--cream)]">
          {tier}
        </span>
        {emoji && (
          <span className="absolute -bottom-2 -right-2 text-[22px] leading-none bg-cream border-2 border-ink px-0.5">
            {emoji}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="inline-block border-2 border-ink bg-cherry text-cream px-2 py-0.5 text-[10px] font-display tracking-[0.25em]"
             style={{ boxShadow: "2px 2px 0 0 var(--ink)" }}>
          {tag}
        </div>
        <h1 className="mt-1.5 font-display text-[26px] leading-[1.05] text-ink break-words">
          {title}
        </h1>
      </div>
    </div>
  );
}

/* ---------------- 红缎带 quote ---------------- */

export function ResultRibbon({ children }: { children: ReactNode }) {
  return (
    <div className="mx-3 my-1 relative">
      <div
        className="relative border-[3px] border-ink px-3 py-2 text-center text-cream font-display text-[12.5px] leading-snug"
        style={{ background: "var(--cherry)", boxShadow: "3px 3px 0 0 var(--ink)" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------------- 学籍鉴定 3×2 徽章网格 ---------------- */

export function TagBadgeGrid({ tags, title }: { tags: ResultTag[]; title: string }) {
  return (
    <section className="px-3 pt-2">
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {tags.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-1 justify-center border-[3px] border-ink px-1.5 py-1.5 text-ink font-display text-[11px] leading-tight tracking-wide"
            style={{
              background: TONE_BG[t.tone],
              boxShadow: "2px 2px 0 0 var(--ink)",
            }}
          >
            <span className="text-[13px] leading-none shrink-0" aria-hidden>{t.icon}</span>
            <span className="min-w-0 truncate">{t.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- 属性条列表 ---------------- */

export function StatBarList({
  stats,
  values,
  columns = 2,
}: {
  stats: StatMeta[];
  values: Record<string, number>;
  columns?: 1 | 2;
}) {
  return (
    <div className={cn("grid gap-x-3 gap-y-1.5", columns === 2 ? "grid-cols-2" : "grid-cols-1")}>
      {stats.map((s) => {
        const v = Math.max(0, Math.min(100, Math.round(values[s.key] ?? 0)));
        return (
          <div key={s.key} className="min-w-0">
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-[11px] text-ink/80 whitespace-nowrap">{s.short}</span>
              <span className="font-display text-[11px] tabular-nums">{v}</span>
            </div>
            <PixelStatBar value={v} color={s.color} height={12} className="mt-0.5" />
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Section 小标签 ---------------- */

export function SectionLabel({
  children, accent, right,
}: { children: ReactNode; accent?: "cherry" | "sunny" | "sage"; right?: ReactNode }) {
  const barColor =
    accent === "cherry" ? "var(--cherry)" : accent === "sunny" ? "var(--sunny)" : accent === "sage" ? "var(--sage)" : "var(--ink)";
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5" style={{ background: barColor, boxShadow: "1px 1px 0 0 var(--ink)" }} />
      <span className="text-[11px] font-display tracking-[0.2em] text-ink/80">{children}</span>
      <span className="flex-1 h-px bg-ink/20" />
      {right}
    </div>
  );
}

/* ---------------- 图钉便签 ---------------- */

export function FuturePinnedNote({
  title = "来自未来的你 ❤",
  children,
}: { title?: string; children: ReactNode }) {
  return (
    <div className="mx-3 mt-3">
      <PixelPanel9 variant="noteYellow" padding="pt-8 pb-6 pl-5 pr-5">
        <div className="min-w-0">
          <div className="text-cherry font-display text-[12.5px] tracking-wider mb-1.5 pl-8">
            {title}
          </div>
          <div className="text-[12.5px] leading-[1.55] text-ink whitespace-pre-line pr-6">
            {children}
          </div>
        </div>
      </PixelPanel9>
    </div>
  );
}

/* ---------------- 按钮行（3 个） ---------------- */

/* ---------------- 按钮行（2 个）----------------
 * 尺寸规格：
 * - 容器：grid-cols-2，gap 10px，横向 padding 12px。
 * - 单键：宽度 = (容器宽 - gap) / 2，最小高 64px，内边距 12/16px。
 * - 字号：15px，行高 1.15，font-display，tracking-wider，单行 nowrap。
 * - 图标：前置符号 16px，与文字间距 6px。
 * 美工规格：
 * - 重新开始：面色 sage(#B9D9A3)，字 ink；顶部 2px 高光 #C8E6B8，底部 3px 暗边 #6A8C56。
 * - 分享结局：面色 cherry(#D8636B)，字 cream；顶部 2px 高光 #FF9AA2，底部 3px 暗边 #B5424A。
 * - 边框：3px ink 硬边；外阴影 3×3px ink 硬投影，营造像素落地感。
 * - 交互：按下 translate(2,2)，无 hover 色变。
 */
export function ResultActionRow({
  onRetry, onShare,
  shareLabel = "分享结局",
}: {
  onHome?: () => void;
  onRetry: () => void;
  onShare: () => void;
  shareLabel?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 px-3 pt-3 pb-2">
      <PixelButton3
        variant="option"
        onClick={onRetry}
        className="!min-h-[64px] !text-[15px] !px-4 whitespace-nowrap"
        style={{ backgroundColor: "var(--sage)" }}
      >
        <span className="mr-1.5 text-[16px] leading-none">↻</span>重新开始
      </PixelButton3>
      <PixelButton3
        variant="primary"
        onClick={onShare}
        className="!min-h-[64px] !text-[15px] !px-4 whitespace-nowrap"
      >
        <span className="mr-1.5 text-[16px] leading-none">↗</span>{shareLabel}
      </PixelButton3>
    </div>
  );
}

/* ---------------- 结算大卡片外壳 ---------------- */

export function ResultCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <article
      className={cn(
        "border-[3px] border-ink shadow-[5px_5px_0_0_var(--ink)] overflow-hidden",
        className,
      )}
      style={{ background: "var(--parchment)" }}
    >
      {children}
    </article>
  );
}
