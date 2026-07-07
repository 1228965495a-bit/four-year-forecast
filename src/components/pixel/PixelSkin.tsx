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
/* 纯 CSS 像素按钮 —— 不再依赖贴图，任意尺寸/文案都自适应              */
/* ------------------------------------------------------------------ */

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

type BtnSkin = {
  face: string;        // 按钮正面色
  faceHi: string;      // 顶部高光色
  faceLo: string;      // 底部阴影色
  border: string;      // 外描边（通常 ink）
  text: string;        // 文字色
  minH: number;        // 最小高度
  fs: number;          // 字号
  padX: number;
  padY: number;
};

const INK = "var(--ink)";
const CREAM = "var(--cream)";

const BTN3: Record<Btn3Variant, BtnSkin> = {
  primary:     { face: "var(--cherry)", faceHi: "#ff9aa2", faceLo: "#b5424a", border: INK, text: CREAM, minH: 52, fs: 14,   padX: 18, padY: 10 },
  primaryTall: { face: "var(--cherry)", faceHi: "#ff9aa2", faceLo: "#b5424a", border: INK, text: CREAM, minH: 68, fs: 15,   padX: 20, padY: 12 },
  secondary:   { face: "var(--sky)",    faceHi: "#c8ebff", faceLo: "#5a9dc8", border: INK, text: INK,   minH: 52, fs: 14,   padX: 18, padY: 10 },
  danger:      { face: "#c8434b",       faceHi: "#f47c8a", faceLo: "#7d2830", border: INK, text: CREAM, minH: 52, fs: 14,   padX: 18, padY: 10 },
  option:      { face: CREAM,           faceHi: "#fff8e6", faceLo: "#d8c8a4", border: INK, text: INK,   minH: 52, fs: 14,   padX: 16, padY: 10 },
  optionTall:  { face: CREAM,           faceHi: "#fff8e6", faceLo: "#d8c8a4", border: INK, text: INK,   minH: 68, fs: 14,   padX: 16, padY: 12 },
  ghost:       { face: "var(--parchment)", faceHi: "#fff5d8", faceLo: "#c9b98a", border: INK, text: INK, minH: 40, fs: 13, padX: 14, padY: 8 },
  chipDefault: { face: CREAM,           faceHi: "#fff8e6", faceLo: "#d8c8a4", border: INK, text: INK,   minH: 28, fs: 11.5, padX: 10, padY: 4 },
  chipActive:  { face: "var(--sage)",   faceHi: "#c8e6b8", faceLo: "#6a8c56", border: INK, text: INK,   minH: 28, fs: 11.5, padX: 10, padY: 4 },
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
  const s = BTN3[variant];
  // 分层 box-shadow 做像素立体：
  //  - inset 高光/底影
  //  - 外部 2px 硬阴影 = 像素落地感
  const shadow = [
    `inset 0 2px 0 0 ${s.faceHi}`,
    `inset 0 -3px 0 0 ${s.faceLo}`,
    `inset 2px 0 0 0 ${s.faceHi}`,
    `inset -2px 0 0 0 ${s.faceLo}`,
    `0 3px 0 0 ${s.border}`,
    `3px 0 0 0 ${s.border}`,
    `3px 3px 0 0 ${s.border}`,
  ].join(", ");

  return (
    <button
      {...props}
      className={cn(
        "relative inline-flex items-center justify-center select-none align-middle font-display tracking-wider",
        "border-[3px] outline-none",
        "transition-transform active:translate-x-[2px] active:translate-y-[2px]",
        "disabled:opacity-60 disabled:pointer-events-none",
        full ? "w-full" : "",
        className,
      )}
      style={{
        background: s.face,
        color: s.text,
        borderColor: s.border,
        minHeight: s.minH,
        padding: `${s.padY}px ${s.padX}px`,
        fontSize: s.fs,
        lineHeight: 1.2,
        boxShadow: shadow,
        textShadow: s.text === CREAM ? "1px 1px 0 rgba(0,0,0,0.35)" : undefined,
        borderRadius: 0,
        ...style,
      }}
    >
      <span className="relative block text-center break-words">{children}</span>
    </button>
  );
}

/** 兼容旧 API */
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
