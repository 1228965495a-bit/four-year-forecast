import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GameLayout } from "@/components/game/GameLayout";
import { MajorCard } from "@/components/game/MajorCard";
import { MajorDetailPanel } from "@/components/game/MajorDetailPanel";
import { PixelCard } from "@/components/game/PixelCard";
import { PixelButton } from "@/components/game/PixelButton";
import {
  MAJORS,
  MAJOR_CATEGORIES,
  PRESSURE_LEVELS,
  type MajorCategory,
} from "@/data/majors";
import { gameStore } from "@/lib/gameStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/major")({
  component: MajorSelectPage,
});

function MajorSelectPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(MAJORS[0]?.id ?? null);
  const [cat, setCat] = useState<MajorCategory | "全部">("全部");
  const [pressure, setPressure] = useState<(typeof PRESSURE_LEVELS)[number] | "全部">("全部");
  const [keyword, setKeyword] = useState("");

  const list = useMemo(() => {
    return MAJORS.filter((m) => {
      if (cat !== "全部" && m.category !== cat) return false;
      if (pressure !== "全部" && m.pressureLevel !== pressure) return false;
      if (keyword && !m.name.includes(keyword) && !m.tags.some((t) => t.includes(keyword))) return false;
      return true;
    });
  }, [cat, pressure, keyword]);

  const selected = MAJORS.find((m) => m.id === selectedId) ?? null;

  const confirm = () => {
    if (!selected) return;
    gameStore.selectMajor(selected.id);
    navigate({ to: "/semester" });
  };

  return (
    <GameLayout title="📚 专业图鉴 · 选一个你要替我读四年的专业">
      <div className="grid gap-4 lg:grid-cols-[220px_1fr_360px]">
        {/* 左：筛选栏 */}
        <PixelCard tone="cream" className="h-fit lg:sticky lg:top-24">
          <div className="mb-2 text-xs font-semibold">🔎 搜索</div>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="输入专业/标签"
            className="pixel-border-sm w-full bg-cream px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-sage"
          />

          <div className="mt-4 mb-2 text-xs font-semibold">🎓 学科大类</div>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={cat === "全部"} onClick={() => setCat("全部")}>全部</FilterChip>
            {MAJOR_CATEGORIES.map((c) => (
              <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</FilterChip>
            ))}
          </div>

          <div className="mt-4 mb-2 text-xs font-semibold">😵 压力等级</div>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={pressure === "全部"} onClick={() => setPressure("全部")}>全部</FilterChip>
            {PRESSURE_LEVELS.map((p) => (
              <FilterChip key={p} active={pressure === p} onClick={() => setPressure(p)}>{p}</FilterChip>
            ))}
          </div>

          <div className="mt-4 text-[11px] text-muted-foreground">
            共 {list.length} / {MAJORS.length} 个专业
          </div>
        </PixelCard>

        {/* 中：卡片列表 */}
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((m) => (
            <MajorCard
              key={m.id}
              major={m}
              selected={m.id === selectedId}
              onClick={() => setSelectedId(m.id)}
            />
          ))}
          {list.length === 0 && (
            <PixelCard tone="cream" className="col-span-full text-center text-sm text-muted-foreground">
              没有匹配的专业，换个筛选试试～
            </PixelCard>
          )}
        </div>

        {/* 右：详情 */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <MajorDetailPanel major={selected} onConfirm={confirm} />
        </div>
      </div>

      {/* 移动端底部固定确认 */}
      <div className="sticky bottom-3 mt-4 flex justify-end lg:hidden">
        <PixelButton variant="accent" size="lg" onClick={confirm} disabled={!selected}>
          确认选择「{selected?.name ?? "未选择"}」→
        </PixelButton>
      </div>
    </GameLayout>
  );
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "pixel-chip transition-colors hover:bg-sage/70",
        active && "bg-cherry/80",
      )}
    >
      {children}
    </button>
  );
}
