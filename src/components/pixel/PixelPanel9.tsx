import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 9-slice 面板组件。
 * 素材放在 public/pixel-ui/panels-9slice/，inset 统一为 32px。
 * 用 CSS border-image 拉伸四条边和填充，四角保持像素完整。
 */

export const panel9Assets = {
  report: "/pixel-ui/panels-9slice/panel-report-source.png",
  event: "/pixel-ui/panels-9slice/panel-event-source.png",
  card: "/pixel-ui/panels-9slice/panel-card-source.png",
  profile: "/pixel-ui/panels-9slice/panel-profile-source.png",
  noteYellow: "/pixel-ui/panels-9slice/panel-note-yellow-source.png",
  noteBlue: "/pixel-ui/panels-9slice/panel-note-blue-source.png",
  diagnosis: "/pixel-ui/panels-9slice/panel-diagnosis-source.png",
  sheet: "/pixel-ui/panels-9slice/panel-sheet-source.png",
  small: "/pixel-ui/panels-9slice/panel-small-source.png",
  warning: "/pixel-ui/panels-9slice/panel-warning-source.png",
} as const;

export type Panel9Variant = keyof typeof panel9Assets;

const INSET = 32;
// CSS 端把 32px 源缩放到 ~18px 边框，视觉更贴合手机端；内部再留 padding。
const BORDER_PX = 18;

export function PixelPanel9({
  variant,
  className,
  style,
  padding = "p-4",
  children,
}: {
  variant: Panel9Variant;
  className?: string;
  style?: CSSProperties;
  padding?: string;
  children: ReactNode;
}) {
  const src = panel9Assets[variant];
  const s: CSSProperties = {
    borderStyle: "solid",
    borderWidth: `${BORDER_PX}px`,
    borderImageSource: `url(${src})`,
    borderImageSlice: `${INSET} fill`,
    borderImageRepeat: "stretch",
    borderImageWidth: `${BORDER_PX}px`,
    imageRendering: "pixelated",
    ...style,
  };
  return (
    <div className={cn("relative", className)} style={s}>
      {/* 抵消 border 视觉，让内容贴合面板内壁 */}
      <div className={cn("relative -m-1", padding)}>{children}</div>
    </div>
  );
}
