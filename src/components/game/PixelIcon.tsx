/**
 * 纯 CSS/SVG 像素图标合集。所有 icon 用 currentColor 或指定填色，
 * 后续可用 <img src="/assets/icons/xxx.png" /> 替换。
 */
import type { CSSProperties } from "react";

type IconProps = { size?: number; style?: CSSProperties };

export function IconStudy({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect x="2" y="3" width="12" height="10" fill="var(--sky)" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="8" y1="3" x2="8" y2="13" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="4" y1="6" x2="7" y2="6" stroke="var(--ink)" />
      <line x1="4" y1="8" x2="7" y2="8" stroke="var(--ink)" />
      <line x1="9" y1="6" x2="12" y2="6" stroke="var(--ink)" />
      <line x1="9" y1="8" x2="12" y2="8" stroke="var(--ink)" />
    </svg>
  );
}
export function IconMoney({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" fill="var(--sunny)" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="8" y="11" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--ink)">¥</text>
    </svg>
  );
}
export function IconMental({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <path d="M4 3h3v1h1V3h4v2h1v3h-1v2h-1v1h-1v1h-2v1H7v-1H6v-1H5v-2H4V8H3V5h1z" fill="var(--cherry)" stroke="var(--ink)" strokeWidth="1" strokeLinejoin="miter" />
    </svg>
  );
}
export function IconSocial({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect x="1" y="6" width="5" height="4" fill="var(--sage)" stroke="var(--ink)" strokeWidth="1.5" />
      <rect x="10" y="6" width="5" height="4" fill="var(--sky)" stroke="var(--ink)" strokeWidth="1.5" />
      <rect x="5.5" y="4" width="5" height="6" fill="var(--cherry)" stroke="var(--ink)" strokeWidth="1.5" />
    </svg>
  );
}
export function IconIntern({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect x="2" y="5" width="12" height="9" fill="var(--tan)" stroke="var(--ink)" strokeWidth="1.5" />
      <rect x="6" y="3" width="4" height="2" fill="var(--tan)" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="2" y1="9" x2="14" y2="9" stroke="var(--ink)" strokeWidth="1" />
    </svg>
  );
}
export function IconEnergy({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <path d="M9 1L3 9h4l-1 6 6-8H8l1-6z" fill="var(--sunny)" stroke="var(--ink)" strokeWidth="1.2" strokeLinejoin="miter" />
    </svg>
  );
}

// —— 首页/道具栏专用像素装饰 —— //

export function PixelCalendar({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="2" y="4" width="20" height="18" fill="var(--cream)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="2" y="4" width="20" height="4" fill="var(--cherry)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="6" y="2" width="2" height="4" fill="var(--ink)" />
      <rect x="16" y="2" width="2" height="4" fill="var(--ink)" />
      <text x="12" y="18" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--ink)" fontFamily="monospace">12</text>
    </svg>
  );
}

export function PixelCoffee({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="4" y="8" width="13" height="12" fill="var(--tan)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="4" y="8" width="13" height="3" fill="#6B4A2E" stroke="var(--ink)" strokeWidth="2" />
      <path d="M17 11h3v5h-3" fill="var(--tan)" stroke="var(--ink)" strokeWidth="2" />
      <path d="M8 4v2M11 3v3M14 4v2" stroke="var(--ink)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export function PixelBook({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="16" fill="var(--sage)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="3" y="4" width="18" height="2" fill="var(--ink)" />
      <line x1="6" y1="9" x2="18" y2="9" stroke="var(--ink)" strokeWidth="1" />
      <line x1="6" y1="12" x2="18" y2="12" stroke="var(--ink)" strokeWidth="1" />
      <line x1="6" y1="15" x2="14" y2="15" stroke="var(--ink)" strokeWidth="1" />
    </svg>
  );
}

export function PixelNotebook({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="4" y="3" width="16" height="19" fill="var(--sky)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="4" y="3" width="3" height="19" fill="var(--ink)" />
      <line x1="10" y1="8" x2="17" y2="8" stroke="var(--ink)" strokeWidth="1" />
      <line x1="10" y1="11" x2="17" y2="11" stroke="var(--ink)" strokeWidth="1" />
      <line x1="10" y1="14" x2="15" y2="14" stroke="var(--ink)" strokeWidth="1" />
    </svg>
  );
}

// —— 通用主菜单 glyph（无 emoji） —— //
export function GlyphPlay({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <path d="M3 2h2v2h2v2h2v2H7v2H5v2H3z" fill="var(--ink)" />
    </svg>
  );
}
export function GlyphBook({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <rect x="1" y="2" width="12" height="10" fill="currentColor" opacity="0.15" />
      <rect x="1" y="2" width="12" height="10" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="7" y1="2" x2="7" y2="12" stroke="var(--ink)" strokeWidth="1.5" />
    </svg>
  );
}
export function GlyphPerson({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <rect x="5" y="1" width="4" height="4" fill="var(--sunny)" stroke="var(--ink)" strokeWidth="1.2" />
      <rect x="3" y="6" width="8" height="6" fill="var(--sage)" stroke="var(--ink)" strokeWidth="1.2" />
    </svg>
  );
}
export function GlyphDisk({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <rect x="1" y="1" width="12" height="12" fill="var(--tan)" stroke="var(--ink)" strokeWidth="1.2" />
      <rect x="3" y="1" width="8" height="4" fill="var(--cream)" stroke="var(--ink)" strokeWidth="1" />
      <rect x="5" y="8" width="4" height="4" fill="var(--cream)" stroke="var(--ink)" strokeWidth="1" />
    </svg>
  );
}

// —— 像素头像占位 —— //
export function PixelAvatar({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="0" y="0" width="24" height="24" fill="var(--sky)" />
      {/* 头发 */}
      <rect x="5" y="3" width="14" height="6" fill="#3B2418" />
      <rect x="4" y="5" width="2" height="5" fill="#3B2418" />
      <rect x="18" y="5" width="2" height="5" fill="#3B2418" />
      {/* 脸 */}
      <rect x="6" y="7" width="12" height="8" fill="#F4D2B0" stroke="var(--ink)" strokeWidth="0.6" />
      {/* 眼睛 */}
      <rect x="8" y="10" width="2" height="2" fill="var(--ink)" />
      <rect x="14" y="10" width="2" height="2" fill="var(--ink)" />
      {/* 嘴 */}
      <rect x="10" y="13" width="4" height="1" fill="var(--ink)" />
      {/* 身体 */}
      <rect x="4" y="15" width="16" height="9" fill="var(--sage)" stroke="var(--ink)" strokeWidth="0.6" />
      <rect x="10" y="15" width="4" height="9" fill="var(--cream)" stroke="var(--ink)" strokeWidth="0.6" />
    </svg>
  );
}

// —— 校园像素场景（CSS 分层，非 emoji，非图片）—— //
export function CampusScene({ height = 180 }: { height?: number }) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height, imageRendering: "pixelated" }}
    >
      {/* 天空 */}
      <div className="absolute inset-x-0 top-0 h-[70%] sky-strip" />
      {/* 云 */}
      <div className="absolute top-4 left-6 h-3 w-10 bg-cream border-2 border-ink rounded-sm" />
      <div className="absolute top-8 left-12 h-2 w-6 bg-cream border-2 border-ink rounded-sm" />
      <div className="absolute top-6 right-8 h-3 w-12 bg-cream border-2 border-ink rounded-sm" />
      {/* 太阳 */}
      <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-sunny border-2 border-ink" />
      {/* 教学楼 */}
      <div className="absolute left-6 bottom-[30%] h-16 w-16 bg-tan border-[3px] border-ink">
        <div className="absolute inset-x-0 top-0 h-2 bg-ink" />
        <div className="grid grid-cols-3 gap-1 p-1.5 pt-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-2 w-full bg-sky border border-ink" />
          ))}
        </div>
      </div>
      {/* 校门 */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[30%] h-14 w-14">
        <div className="absolute inset-x-0 top-0 h-3 bg-cherry border-[3px] border-ink" />
        <div className="absolute inset-y-0 left-0 w-2 bg-tan border-[3px] border-ink" />
        <div className="absolute inset-y-0 right-0 w-2 bg-tan border-[3px] border-ink" />
      </div>
      {/* 树 */}
      <div className="absolute right-6 bottom-[30%] h-12 w-10">
        <div className="absolute inset-x-1 top-0 h-8 rounded-md bg-sage border-[3px] border-ink" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 h-4 w-2 bg-[#7B4A2A] border-2 border-ink" />
      </div>
      {/* 草地 */}
      <div className="absolute inset-x-0 bottom-0 h-[30%] grass-strip border-t-[3px] border-ink" />
      {/* 小花点缀 */}
      <div className="absolute left-4 bottom-2 h-1.5 w-1.5 bg-cherry border border-ink" />
      <div className="absolute left-24 bottom-3 h-1.5 w-1.5 bg-sunny border border-ink" />
      <div className="absolute right-20 bottom-2 h-1.5 w-1.5 bg-cream border border-ink" />
    </div>
  );
}
