import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import panelEventAsset from "@/assets/pixel/panels-9slice/panel-event.png.asset.json";
import panelNoteYellowAsset from "@/assets/pixel/panels-9slice/panel-note-yellow.png.asset.json";
import panelDiagnosisAsset from "@/assets/pixel/panels-9slice/panel-diagnosis.png.asset.json";

/**
 * 9-slice 面板组件。
 * 素材放在 public/pixel-ui/panels-9slice/，inset 统一为 32px。
 * 用 CSS border-image 拉伸四条边和填充，四角保持像素完整。
 */

export const panel9Assets = {
  report: "/pixel-ui/panels-9slice/panel-report-source.png",
  event: panelEventAsset.url,
  card: "/pixel-ui/panels-9slice/panel-card-source.png",
  profile: "/pixel-ui/panels-9slice/panel-profile-source.png",
  noteYellow: panelNoteYellowAsset.url,
  noteBlue: "/pixel-ui/panels-9slice/panel-note-blue-source.png",
  diagnosis: panelDiagnosisAsset.url,
  sheet: "/pixel-ui/panels-9slice/panel-sheet-source.png",
  small: "/pixel-ui/panels-9slice/panel-small-source.png",
  warning: "/pixel-ui/panels-9slice/panel-warning-source.png",
} as const;

export type Panel9Variant = keyof typeof panel9Assets;

const INSET = 32;
// 每个 variant 的默认 9-slice inset(源图像素)。未列出的走 INSET=32。
const VARIANT_SLICE: Partial<Record<Panel9Variant, number>> = {
  event: 60,
  noteYellow: 240,
  diagnosis: 220,
};
// 每个 variant 的默认 CSS 边框宽度。
const VARIANT_BORDER: Partial<Record<Panel9Variant, number>> = {
  event: 26,
  noteYellow: 28,
  diagnosis: 26,
};
// CSS 端把 32px 源缩放到 ~18px 边框，视觉更贴合手机端；内部再留 padding。
const BORDER_PX = 18;


export function PixelPanel9({
  variant,
  className,
  style,
  padding = "p-4",
  children,
  src,
  slice,
  borderPx,
}: {
  variant?: Panel9Variant;
  className?: string;
  style?: CSSProperties;
  padding?: string;
  children: ReactNode;
  /** 自定义 9-slice 图源，优先于 variant */
  src?: string;
  /** 自定义 slice inset（源图像素） */
  slice?: number;
  /** 自定义 CSS 边框宽度 */
  borderPx?: number;
}) {
  const resolvedSrc = src ?? (variant ? panel9Assets[variant] : "");
  const resolvedSlice = slice ?? (variant ? VARIANT_SLICE[variant] ?? INSET : INSET);
  const resolvedBorder = borderPx ?? (variant ? VARIANT_BORDER[variant] ?? BORDER_PX : BORDER_PX);
  const s: CSSProperties = {
    borderStyle: "solid",
    borderWidth: `${resolvedBorder}px`,
    borderImageSource: `url(${resolvedSrc})`,
    borderImageSlice: `${resolvedSlice} fill`,
    borderImageRepeat: "stretch",
    borderImageWidth: `${resolvedBorder}px`,
    imageRendering: "pixelated",
    ...style,
  };
  return (
    <div className={cn("relative", className)} style={s}>
      <div className={cn("relative -m-1", padding)}>{children}</div>
    </div>
  );
}
