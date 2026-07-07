import { PixelPanel } from "./PixelPanel";

/**
 * PropStatusBar — 桌面便签风格的道具/状态条。
 * 每项道具使用纯 CSS 像素图标，无 emoji。
 * 未来素材路径：/assets/icons/{key}.png
 */
export interface PropItem {
  key: string;
  label: string;
  value: string;
  icon: "calendar" | "book" | "coffee";
}

const DEFAULT_ITEMS: PropItem[] = [
  { key: "countdown", label: "高考倒计时", value: "T-12 天", icon: "calendar" },
  { key: "manual", label: "志愿填报手册", value: "未拆封", icon: "book" },
  { key: "coffee", label: "咖啡杯", value: "第 3 杯", icon: "coffee" },
];

export function PropStatusBar({ items = DEFAULT_ITEMS }: { items?: PropItem[] }) {
  return (
    <PixelPanel className="w-full">
      <div className="grid grid-cols-3 divide-x-[3px] divide-ink">
        {items.map((it) => (
          <div key={it.key} className="flex items-center gap-3 px-3 py-2">
            <PixelIcon type={it.icon} />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">
                {it.label}
              </div>
              <div className="font-display text-[14px] leading-tight truncate">
                {it.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PixelPanel>
  );
}

function PixelIcon({ type }: { type: PropItem["icon"] }) {
  return (
    <div className="pixel-panel-sm !shadow-none h-10 w-10 shrink-0 relative bg-cream">
      {type === "calendar" && <CalendarArt />}
      {type === "book" && <BookArt />}
      {type === "coffee" && <CoffeeArt />}
    </div>
  );
}

function CalendarArt() {
  return (
    <div className="absolute inset-1">
      <div className="absolute inset-x-0 top-0 h-2 bg-[#C15A5A] border-[1px] border-ink" />
      <div className="absolute left-1 -top-1 w-1 h-2 bg-ink" />
      <div className="absolute right-1 -top-1 w-1 h-2 bg-ink" />
      <div className="absolute inset-x-0 top-2 bottom-0 bg-white border-[1px] border-ink" />
      <div className="absolute left-1/2 -translate-x-1/2 top-3 text-[8px] font-bold text-ink leading-none">
        12
      </div>
    </div>
  );
}

function BookArt() {
  return (
    <div className="absolute inset-1">
      <div className="absolute inset-0 bg-[#8FD0F2] border-[1px] border-ink rounded-[2px]" />
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-ink" />
      <div className="absolute top-1 left-1 right-1/2 mr-1 h-[1px] bg-ink/60" />
      <div className="absolute top-2.5 left-1 right-1/2 mr-1 h-[1px] bg-ink/60" />
      <div className="absolute top-1 right-1 left-1/2 ml-1 h-[1px] bg-ink/60" />
      <div className="absolute top-2.5 right-1 left-1/2 ml-1 h-[1px] bg-ink/60" />
    </div>
  );
}

function CoffeeArt() {
  return (
    <div className="absolute inset-1">
      {/* 杯身 */}
      <div className="absolute left-0 top-2 right-2 bottom-0 bg-[#F5D4B3] border-[1px] border-ink rounded-b-sm" />
      {/* 咖啡液面 */}
      <div className="absolute left-[2px] top-[9px] right-[10px] h-1 bg-[#5C3A22]" />
      {/* 杯耳 */}
      <div className="absolute right-0 top-3 h-3 w-2 border-[1px] border-ink rounded-r-sm bg-transparent" />
      {/* 热气 */}
      <div className="absolute left-1 top-0 w-[2px] h-2 bg-ink/40" />
      <div className="absolute left-3 top-0 w-[2px] h-2 bg-ink/40" />
    </div>
  );
}
