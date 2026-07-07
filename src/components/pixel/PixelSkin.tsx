import { type ButtonHTMLAttributes, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import {
  pixelAssets,
  tierBadgeSrc,
  pickBarColor,
  type PixelTier,
  type BarColor,
} from "@/lib/pixelAssets";

/** 通用像素图 css：像素化不模糊，铺满容器 */
const PX_BG: CSSProperties = {
  imageRendering: "pixelated",
};

/* ------------------------------------------------------------------ */
/* 面板 —— 用图片当背景，内容正常撑开容器                              */
/* ------------------------------------------------------------------ */

type PanelVariant = keyof typeof pixelAssets.panels;

export function PixelBgPanel({
  variant = "large",
  className,
  style,
  children,
  padding = "p-4",
}: {
  variant?: PanelVariant;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  padding?: string;
}) {
  const src = pixelAssets.panels[variant];
  return (
    <div
      className={cn("relative", className)}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        ...PX_BG,
        ...style,
      }}
    >
      <div className={cn("relative", padding)}>{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 页面标题条 —— 头图                                                  */
/* ------------------------------------------------------------------ */

type HeaderVariant = keyof typeof pixelAssets.headers;

export function PixelHeader({
  variant,
  className,
}: {
  variant: HeaderVariant;
  className?: string;
}) {
  return (
    <img
      src={pixelAssets.headers[variant]}
      alt=""
      aria-hidden
      className={cn("block mx-auto w-full max-w-[420px] h-auto select-none", className)}
      style={PX_BG}
      draggable={false}
    />
  );
}

/* ------------------------------------------------------------------ */
/* 段徽章 S/A/B —— 尺寸小型化，用于卡片角落 / 报告页                    */
/* ------------------------------------------------------------------ */

export function PixelTierBadge({
  tier,
  size = 32,
  className,
}: {
  tier: PixelTier | string;
  size?: number;
  className?: string;
}) {
  const t = (tier === "S" || tier === "A" || tier === "B" || tier === "C" ? tier : "B") as PixelTier;
  return (
    <img
      src={tierBadgeSrc(t)}
      alt={t}
      className={cn("inline-block select-none", className)}
      style={{ width: size, height: "auto", ...PX_BG }}
      draggable={false}
    />
  );
}

/* ------------------------------------------------------------------ */
/* 减益 / 成就 徽章 —— 图片背景 + 文字覆盖                             */
/* ------------------------------------------------------------------ */

export function PixelDebuffBadge({ children }: { children: ReactNode }) {
  return (
    <span
      className="relative inline-flex items-center justify-center font-display text-cream text-[11.5px] tracking-wider select-none"
      style={{
        backgroundImage: `url(${pixelAssets.badges.debuff})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        padding: "10px 18px 14px",
        minWidth: 92,
        textShadow: "1px 1px 0 rgba(0,0,0,0.4)",
        ...PX_BG,
      }}
    >
      <span className="relative -mt-0.5">× {children}</span>
    </span>
  );
}

export function PixelAchievementBadge({ children }: { children: ReactNode }) {
  return (
    <span
      className="relative inline-flex items-center justify-center font-display text-ink text-[11.5px] tracking-wider select-none"
      style={{
        backgroundImage: `url(${pixelAssets.badges.achievement})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        padding: "12px 16px 14px",
        minWidth: 92,
        ...PX_BG,
      }}
    >
      <span className="relative">★ {children}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 状态条 —— 帧图 + 填充图，宽度百分比控制                              */
/* ------------------------------------------------------------------ */

export function PixelStatBar({
  value,
  color = "green",
  height = 18,
  className,
}: {
  value: number;
  color?: BarColor | string;
  height?: number;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  const c: BarColor =
    color === "green" || color === "red" || color === "blue" || color === "yellow"
      ? color
      : pickBarColor(color as string);
  const fillSrc = pixelAssets.bars[c];
  return (
    <div
      className={cn("relative w-full", className)}
      style={{
        height,
        backgroundImage: `url(${pixelAssets.bars.frame})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        ...PX_BG,
      }}
    >
      {/* 内部填充区，留出边框像素 */}
      <div className="absolute inset-y-[18%] left-[3%] right-[3%] overflow-hidden">
        <div
          style={{
            height: "100%",
            width: `${v}%`,
            backgroundImage: `url(${fillSrc})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            ...PX_BG,
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chip / 按钮 —— 图片背景 button                                      */
/* ------------------------------------------------------------------ */

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean };

export function PixelChip({ active, className, children, style, ...props }: ChipProps) {
  const bg = active ? pixelAssets.buttons.chipActive : pixelAssets.buttons.chipDefault;
  return (
    <button
      {...props}
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 select-none",
        "font-display text-[10.5px] tracking-wider",
        active ? "text-cream" : "text-ink",
        "active:translate-y-[1px] transition-transform",
        className,
      )}
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        padding: "6px 10px 10px",
        minWidth: 48,
        ...PX_BG,
        ...style,
      }}
    >
      <span className="relative">{children}</span>
    </button>
  );
}

type BtnVariant = "primary" | "secondary" | "danger";
export function PixelImgButton({
  variant = "primary",
  className,
  children,
  compact = false,
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; compact?: boolean }) {
  const bg =
    variant === "secondary"
      ? pixelAssets.buttons.secondary
      : variant === "danger"
      ? pixelAssets.buttons.danger
      : pixelAssets.buttons.primary;
  return (
    <button
      {...props}
      className={cn(
        "relative inline-flex items-center justify-center w-full select-none",
        "font-display text-cream tracking-wider",
        compact ? "text-[12px]" : "text-[14px]",
        "active:translate-y-[1px] transition-transform",
        className,
      )}
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        padding: compact ? "10px 16px 14px" : "14px 20px 18px",
        textShadow: "1px 1px 0 rgba(0,0,0,0.35)",
        ...PX_BG,
        ...style,
      }}
    >
      <span className="relative">{children}</span>
    </button>
  );
}

