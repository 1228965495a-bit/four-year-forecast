import { PixelPanel } from "./PixelPanel";

/**
 * StudentProfileCard — 左下角学生档案面板。
 * 头像使用 CSS 像素画（无 emoji）。未来素材路径：/assets/characters/*.png
 */
export interface StudentProfileCardProps {
  name?: string;
  status?: string;
  major?: string;
  school?: string;
  hasCharacter?: boolean;
}

export function StudentProfileCard({
  name = "未创建角色",
  status = "新生档案 · 待办理",
  major,
  school,
  hasCharacter = false,
}: StudentProfileCardProps) {
  return (
    <PixelPanel className="w-56 md:w-64">
      {/* 顶部标签 */}
      <div className="flex items-center justify-between border-b-[3px] border-ink bg-sunny px-3 py-1 rounded-t-[7px]">
        <span className="font-display text-[13px] tracking-wider">学生档案</span>
        <span className="pixel-panel-sm !shadow-none !border-[2px] bg-cream px-1.5 py-[1px] text-[10px]">
          NO.001
        </span>
      </div>

      <div className="flex items-center gap-3 p-3">
        {/* CSS 像素头像占位 */}
        <PixelAvatar unlocked={hasCharacter} />

        <div className="min-w-0 flex-1">
          <div className="font-display text-[15px] leading-tight truncate">{name}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{status}</div>
          {(major || school) && (
            <div className="mt-1 text-[11px] truncate">
              {school && <span>{school}</span>}
              {major && (
                <>
                  {school && <span className="mx-1 text-ink/40">·</span>}
                  <span className="font-semibold">{major}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </PixelPanel>
  );
}

function PixelAvatar({ unlocked }: { unlocked: boolean }) {
  if (!unlocked) {
    return (
      <div className="relative h-14 w-14 shrink-0">
        <div className="absolute inset-0 pixel-panel-sm !shadow-none bg-tan/60" />
        {/* 问号 pixel */}
        <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 p-1 gap-[2px]">
          {[
            [1, 1], [2, 1], [3, 1],
            [3, 2], [2, 2],
            [2, 3],
            [2, 4],
          ].map(([c, r], i) => (
            <div
              key={i}
              className="bg-ink"
              style={{ gridColumnStart: c, gridRowStart: r }}
            />
          ))}
        </div>
      </div>
    );
  }
  // 有角色：极简像素头像
  return (
    <div className="relative h-14 w-14 shrink-0 pixel-panel-sm !shadow-none bg-sky/60 overflow-hidden">
      {/* 头发 */}
      <div className="absolute top-1 left-2 right-2 h-2 bg-[#5C3A22]" />
      <div className="absolute top-2 left-1 w-2 h-2 bg-[#5C3A22]" />
      <div className="absolute top-2 right-1 w-2 h-2 bg-[#5C3A22]" />
      {/* 脸 */}
      <div className="absolute top-3 left-2 right-2 h-4 bg-[#F5D4B3]" />
      {/* 眼睛 */}
      <div className="absolute top-4 left-3 w-1.5 h-1.5 bg-ink" />
      <div className="absolute top-4 right-3 w-1.5 h-1.5 bg-ink" />
      {/* 嘴 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-[#C15A5A]" />
      {/* 校服 */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#8FD0F2] border-t-[2px] border-ink" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-4 bg-[#FFD86B]" />
    </div>
  );
}
