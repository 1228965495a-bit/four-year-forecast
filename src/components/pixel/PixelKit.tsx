import {
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type CSSProperties,
  type ButtonHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

/**
 * PixelKit —— 一套零贴图、纯 CSS 的像素风 UI 组件。
 * 所有组件共享同一套「奶油底 + 深棕描边 + 硬阴影 + inset 高光」的语言。
 * 不依赖任何 PNG，尺寸/文案任意变化都不变形。
 */

const INK = "var(--ink)";
const CREAM = "var(--cream)";

/** 通用「像素立体」box-shadow */
function raised(faceHi: string, faceLo: string, depth = 3): string {
  return [
    `inset 0 2px 0 0 ${faceHi}`,
    `inset 0 -3px 0 0 ${faceLo}`,
    `inset 2px 0 0 0 ${faceHi}`,
    `inset -2px 0 0 0 ${faceLo}`,
    `${depth}px ${depth}px 0 0 ${INK}`,
  ].join(", ");
}

/** 凹陷（用于输入框、进度条底槽） */
function inset(): string {
  return [
    "inset 2px 2px 0 0 rgba(63,42,31,0.35)",
    "inset -2px -2px 0 0 rgba(255,255,255,0.55)",
  ].join(", ");
}

/* ============ 面板 ============ */

type PanelTone = "cream" | "sunny" | "sage" | "sky" | "cherry" | "parchment" | "tan";

const PANEL_TONE: Record<PanelTone, { face: string; hi: string; lo: string }> = {
  cream:     { face: "var(--cream)",     hi: "#fff8e6", lo: "#d8c8a4" },
  sunny:     { face: "var(--sunny)",     hi: "#ffe89a", lo: "#c99a2b" },
  sage:      { face: "var(--sage)",      hi: "#c8e6b8", lo: "#6a8c56" },
  sky:       { face: "var(--sky)",       hi: "#c8ebff", lo: "#5a9dc8" },
  cherry:    { face: "var(--cherry)",    hi: "#ffb0bd", lo: "#b5424a" },
  parchment: { face: "var(--parchment)", hi: "#fff5d8", lo: "#c9b98a" },
  tan:       { face: "var(--tan)",       hi: "#f2dcb0", lo: "#a88a5c" },
};

export function PixelPanel({
  tone = "cream",
  title,
  right,
  className,
  children,
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  tone?: PanelTone;
  title?: ReactNode;
  right?: ReactNode;
}) {
  const t = PANEL_TONE[tone];
  return (
    <div
      {...rest}
      className={cn("relative", className)}
      style={{
        background: t.face,
        border: `3px solid ${INK}`,
        boxShadow: raised(t.hi, t.lo, 3),
        borderRadius: 0,
        color: "var(--text)",
        ...style,
      }}
    >
      {(title || right) && (
        <div
          className="flex items-center justify-between px-3 py-1.5 font-display text-[12px] tracking-wider"
          style={{
            background: "var(--parchment)",
            borderBottom: `3px solid ${INK}`,
            color: INK,
          }}
        >
          <span className="truncate">{title}</span>
          {right && <span className="shrink-0 ml-2">{right}</span>}
        </div>
      )}
      <div className="p-3">{children}</div>
    </div>
  );
}

/* ============ 卡片（可点击/可选中） ============ */

export function PixelCard({
  tone = "cream",
  selected,
  className,
  children,
  onClick,
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  tone?: PanelTone;
  selected?: boolean;
}) {
  const t = PANEL_TONE[tone];
  const clickable = !!onClick;
  return (
    <div
      {...rest}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={cn(
        "relative p-3 select-none",
        clickable && "cursor-pointer transition-transform active:translate-x-[2px] active:translate-y-[2px]",
        className,
      )}
      style={{
        background: t.face,
        border: `3px solid ${selected ? "var(--cherry)" : INK}`,
        boxShadow: raised(t.hi, t.lo, selected ? 4 : 3),
        borderRadius: 0,
        color: "var(--text)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ============ 输入框 ============ */

export function PixelInput({
  className,
  style,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full font-body text-[13px] px-3 py-2 outline-none",
        "placeholder:text-ink/45",
        className,
      )}
      style={{
        background: "#FFFBEE",
        color: "var(--text)",
        border: `3px solid ${INK}`,
        boxShadow: inset(),
        borderRadius: 0,
        ...style,
      }}
    />
  );
}

export function PixelTextarea({
  className,
  style,
  rows = 3,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={cn(
        "w-full font-body text-[13px] px-3 py-2 outline-none resize-none",
        "placeholder:text-ink/45",
        className,
      )}
      style={{
        background: "#FFFBEE",
        color: "var(--text)",
        border: `3px solid ${INK}`,
        boxShadow: inset(),
        borderRadius: 0,
        ...style,
      }}
    />
  );
}

/* ============ Tabs ============ */

export function PixelTabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
}) {
  return (
    <div
      className={cn("inline-flex", className)}
      style={{ border: `3px solid ${INK}`, boxShadow: `3px 3px 0 0 ${INK}` }}
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className="font-display text-[12px] px-3 py-1.5 tracking-wider transition-transform active:translate-y-[1px]"
            style={{
              background: active ? "var(--sunny)" : "var(--cream)",
              color: INK,
              borderRight: i < options.length - 1 ? `3px solid ${INK}` : undefined,
              boxShadow: active
                ? `inset 0 3px 0 0 rgba(63,42,31,0.35)`
                : `inset 0 2px 0 0 #fff8e6, inset 0 -3px 0 0 #d8c8a4`,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ============ 进度条 ============ */

const BAR_COLOR: Record<string, { fill: string; hi: string }> = {
  green:  { fill: "var(--sage)",   hi: "#c8e6b8" },
  red:    { fill: "var(--cherry)", hi: "#ffb0bd" },
  blue:   { fill: "var(--sky)",    hi: "#c8ebff" },
  yellow: { fill: "var(--sunny)",  hi: "#ffe89a" },
  gold:   { fill: "var(--gold)",   hi: "#f8d78a" },
};

export function PixelProgress({
  value,
  color = "green",
  height = 16,
  showValue = false,
  className,
}: {
  value: number;
  color?: keyof typeof BAR_COLOR;
  height?: number;
  showValue?: boolean;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  const c = BAR_COLOR[color] ?? BAR_COLOR.green;
  return (
    <div
      className={cn("relative w-full", className)}
      style={{
        height,
        background: "#EFE1C1",
        border: `2px solid ${INK}`,
        boxShadow: inset(),
        borderRadius: 0,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${v}%`,
          background: c.fill,
          boxShadow: `inset 0 2px 0 0 ${c.hi}, inset 0 -2px 0 0 rgba(0,0,0,0.15)`,
          transition: "width 300ms ease-out",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.22) 0 2px, transparent 2px 6px)",
        }}
      />
      {showValue && (
        <span
          className="absolute inset-0 flex items-center justify-center font-display text-[10px]"
          style={{ color: INK, textShadow: "1px 1px 0 rgba(255,255,255,0.6)" }}
        >
          {Math.round(v)}
        </span>
      )}
    </div>
  );
}

/* ============ 徽章 ============ */

type BadgeTone = "cream" | "sunny" | "sage" | "sky" | "cherry" | "ink" | "gold" | "danger";
const BADGE_TONE: Record<BadgeTone, { bg: string; fg: string }> = {
  cream:  { bg: "var(--cream)",  fg: INK },
  sunny:  { bg: "var(--sunny)",  fg: INK },
  sage:   { bg: "var(--sage)",   fg: INK },
  sky:    { bg: "var(--sky)",    fg: INK },
  cherry: { bg: "var(--cherry)", fg: CREAM },
  ink:    { bg: INK,             fg: CREAM },
  gold:   { bg: "var(--gold)",   fg: INK },
  danger: { bg: "var(--danger)", fg: CREAM },
};

export function PixelBadge({
  tone = "cream",
  className,
  children,
  style,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  const t = BADGE_TONE[tone];
  return (
    <span
      {...rest}
      className={cn(
        "inline-flex items-center gap-1 font-display text-[11px] px-2 py-0.5 tracking-wider select-none",
        className,
      )}
      style={{
        background: t.bg,
        color: t.fg,
        border: `2px solid ${INK}`,
        boxShadow: `2px 2px 0 0 ${INK}`,
        borderRadius: 0,
        textShadow: t.fg === CREAM ? "1px 1px 0 rgba(0,0,0,0.35)" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ============ 图标框（用来包 emoji / 单字 / SVG） ============ */

export function PixelIconBox({
  size = 36,
  tone = "sunny",
  className,
  children,
  style,
}: {
  size?: number;
  tone?: PanelTone;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const t = PANEL_TONE[tone];
  return (
    <span
      className={cn("inline-flex items-center justify-center select-none", className)}
      style={{
        width: size,
        height: size,
        background: t.face,
        border: `3px solid ${INK}`,
        boxShadow: raised(t.hi, t.lo, 2),
        borderRadius: 0,
        fontSize: Math.round(size * 0.5),
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ============ 列表行（菜单项） ============ */

export function PixelListItem({
  icon,
  title,
  hint,
  right,
  onClick,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  hint?: ReactNode;
  right?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 text-left transition-transform active:translate-x-[2px] active:translate-y-[2px]",
        className,
      )}
      style={{
        background: CREAM,
        border: `3px solid ${INK}`,
        boxShadow: raised("#fff8e6", "#d8c8a4", 3),
        color: "var(--text)",
        borderRadius: 0,
      }}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="flex-1 min-w-0">
        <span className="block font-display text-[14px] leading-tight truncate">{title}</span>
        {hint && <span className="block text-[11px] text-ink/60 leading-tight mt-0.5 truncate">{hint}</span>}
      </span>
      {right && <span className="shrink-0 ml-1">{right}</span>}
    </button>
  );
}

/* ============ 分隔线 ============ */

export function PixelDivider({ label, className }: { label?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 my-2", className)}>
      <div className="flex-1" style={{ height: 3, background: INK, opacity: 0.85 }} />
      {label && <span className="font-display text-[11px] text-ink/70 tracking-wider">{label}</span>}
      <div className="flex-1" style={{ height: 3, background: INK, opacity: 0.85 }} />
    </div>
  );
}

/* ============ 对话框 ============ */

export function PixelDialog({
  open,
  onClose,
  title,
  children,
  footer,
  width = 320,
}: {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <button
        aria-label="关闭"
        onClick={onClose}
        className="absolute inset-0 bg-ink/55"
      />
      <div
        className="relative animate-pop-in"
        style={{
          width,
          maxWidth: "92vw",
          background: CREAM,
          border: `3px solid ${INK}`,
          boxShadow: raised("#fff8e6", "#d8c8a4", 4),
          borderRadius: 0,
        }}
      >
        {title && (
          <div
            className="flex items-center justify-between px-3 py-1.5 font-display text-[13px]"
            style={{ background: "var(--parchment)", borderBottom: `3px solid ${INK}`, color: INK }}
          >
            <span>{title}</span>
            {onClose && (
              <button onClick={onClose} className="font-display text-[13px] leading-none">✕</button>
            )}
          </div>
        )}
        <div className="p-3 text-[13px] leading-relaxed">{children}</div>
        {footer && (
          <div className="p-3 pt-0 flex gap-2 justify-end">{footer}</div>
        )}
      </div>
    </div>
  );
}

/* ============ 开关 ============ */

export function PixelToggle({
  checked,
  onChange,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn("relative inline-block", className)}
      style={{
        width: 48,
        height: 26,
        background: checked ? "var(--sage)" : "#EFE1C1",
        border: `3px solid ${INK}`,
        boxShadow: `2px 2px 0 0 ${INK}`,
        borderRadius: 0,
      }}
    >
      <span
        className="absolute top-0 transition-[left] duration-150"
        style={{
          left: checked ? 20 : 0,
          width: 20,
          height: 20,
          background: CREAM,
          border: `2px solid ${INK}`,
          borderRadius: 0,
          boxShadow: "inset 0 2px 0 0 #fff8e6, inset 0 -2px 0 0 #d8c8a4",
        }}
      />
    </button>
  );
}

/* ============ 小型 IconButton（方形） ============ */

export function PixelIconButton({
  tone = "cream",
  size = 36,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: PanelTone; size?: number }) {
  const t = PANEL_TONE[tone];
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center transition-transform active:translate-x-[1px] active:translate-y-[1px]",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: t.face,
        color: INK,
        border: `3px solid ${INK}`,
        boxShadow: raised(t.hi, t.lo, 2),
        borderRadius: 0,
        fontSize: Math.round(size * 0.45),
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}
