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
/* 3-slice 按钮 & Chip —— left cap + middle repeat-x + right cap       */
/* ------------------------------------------------------------------ */

const B3_BASE = "/pixel-ui/buttons-3slice";

type Btn3Variant =
  | "primary"
  | "primaryTall"
  | "secondary"
  | "danger"
  | "option"
  | "optionTall"
  | "ghost"
  | "chipDefault"
  | "chipActive";

const BTN3: Record<
  Btn3Variant,
  { prefix: string; h: number; textCream: boolean }
> = {
  primary:     { prefix: "primary-h56",       h: 56, textCream: true  },
  primaryTall: { prefix: "primary-h88",       h: 88, textCream: true  },
  secondary:   { prefix: "secondary-h56",     h: 56, textCream: true  },
  danger:      { prefix: "danger-h56",        h: 56, textCream: true  },
  option:      { prefix: "option-h64",        h: 64, textCream: false },
  optionTall:  { prefix: "option-h88",        h: 88, textCream: false },
  ghost:       { prefix: "ghost-h44",         h: 44, textCream: false },
  chipDefault: { prefix: "chip-default-h32",  h: 32, textCream: false },
  chipActive:  { prefix: "chip-active-h32",   h: 32, textCream: true  },
};

export function PixelButton3({
  variant = "primary",
  full = true,
  className,
  children,
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Btn3Variant;
  full?: boolean;
}) {
  const { prefix, h, textCream } = BTN3[variant];
  const left = `${B3_BASE}/${prefix}-left.png`;
  const mid = `${B3_BASE}/${prefix}-mid.png`;
  const right = `${B3_BASE}/${prefix}-right.png`;
  return (
    <button
      {...props}
      className={cn(
        "relative inline-flex items-stretch select-none align-middle",
        full ? "w-full" : "",
        "active:translate-y-[1px] transition-transform disabled:opacity-60 disabled:pointer-events-none",
        className,
      )}
      style={{ height: h, ...style }}
    >
      <img
        src={left}
        alt=""
        aria-hidden
        draggable={false}
        className="block h-full w-auto shrink-0"
        style={PX_BG}
      />
      <span
        className={cn(
          "flex-1 flex items-center justify-center font-display tracking-wider min-w-0",
          textCream ? "text-cream" : "text-ink",
        )}
        style={{
          backgroundImage: `url(${mid})`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          textShadow: textCream ? "1px 1px 0 rgba(0,0,0,0.35)" : undefined,
          fontSize: h <= 32 ? 11.5 : h >= 88 ? 15 : 14,
          ...PX_BG,
        }}
      >
        <span className="relative block w-full text-center px-3 leading-tight">{children}</span>
      </span>
      <img
        src={right}
        alt=""
        aria-hidden
        draggable={false}
        className="block h-full w-auto shrink-0"
        style={PX_BG}
      />
    </button>
  );
}

/** 兼容旧 API：PixelImgButton 内部转为 3-slice。 */
export function PixelImgButton({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <PixelButton3 variant={variant} full className={className} {...props}>
      {children}
    </PixelButton3>
  );
}

/** 兼容旧 API：PixelChip 内部转为 3-slice chip。 */
export function PixelChip({
  active,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <PixelButton3
      variant={active ? "chipActive" : "chipDefault"}
      full={false}
      className={className}
      {...props}
    >
      {children}
    </PixelButton3>
  );
}
