import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { MAJORS, MAJOR_CATEGORIES, type MajorConfig } from "@/data/majors";
import { gameStore } from "@/lib/gameStore";
import { cn } from "@/lib/utils";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelPanel } from "@/components/ui/PixelPanel";
import { StatBar } from "@/components/ui/StatBar";
import { TagBadge, inferTagTone } from "@/components/ui/TagBadge";

export const Route = createFileRoute("/major")({ component: MajorSelectPage });

const TABS = ["全部", "热门", ...MAJOR_CATEGORIES] as const;
type Tab = (typeof TABS)[number];

const STAT_LABELS: { key: keyof MajorConfig["stats"]; label: string; color: string }[] = [
  { key: "interest", label: "兴趣", color: "var(--cherry)" },
  { key: "pressure", label: "压力", color: "var(--danger)" },
  { key: "employment", label: "就业", color: "var(--sage)" },
  { key: "salary", label: "薪资", color: "var(--sunny)" },
  { key: "growth", label: "成长", color: "var(--sky)" },
  { key: "stability", label: "稳定", color: "var(--tan)" },
];

// 副本图标背景色（按分类分配，纯像素方块色块，等实际素材替换）
const CATEGORY_TINT: Record<MajorConfig["category"], string> = {
  人文: "var(--tan)",
  社科: "var(--sky)",
  理科: "var(--sage)",
  工科: "var(--sunny)",
  医学: "var(--cherry)",
  商科: "#f4b860",
  艺术: "#e59fd0",
  教育: "#b7d8a3",
};

function rankOf(fit: number): "S" | "A" | "B" | "C" {
  if (fit >= 78) return "S";
  if (fit >= 68) return "A";
  if (fit >= 58) return "B";
  return "C";
}

function MajorSelectPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("全部");
  const [kw, setKw] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const list = useMemo(() => {
    return MAJORS.filter((m) => {
      if (tab === "热门" && !m.tags.includes("热门")) return false;
      if (tab !== "全部" && tab !== "热门" && m.category !== tab) return false;
      if (kw && !m.name.includes(kw) && !m.tags.some((t) => t.includes(kw))) return false;
      return true;
    }).sort((a, b) => b.fit - a.fit);
  }, [tab, kw]);

  const selected = MAJORS.find((m) => m.id === selectedId) ?? null;

  const confirm = () => {
    if (!selected) return;
    gameStore.selectMajor(selected.id);
    navigate({ to: "/semester" });
  };

  const topBar = (
    <div className="border-b-[3px] border-ink bg-ink text-cream px-3 py-2 flex items-center gap-2">
      <button
        onClick={() => navigate({ to: "/" })}
        className="text-[11px] px-2 py-0.5 border-2 border-cream shrink-0"
      >
        ← 返回
      </button>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[14px] leading-none">选择你的本科副本</div>
        <div className="text-[9px] opacity-70 leading-none mt-1 tracking-wider">
          SELECT · YOUR · QUEST — 共 {MAJORS.length} 个可选副本
        </div>
      </div>
    </div>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-2.5 p-2.5 pb-32">
          {/* 搜索 */}
          <div className="pixel-border-sm bg-cream flex items-center px-2 py-1.5">
            <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0">
              <circle cx="7" cy="7" r="4.5" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="var(--ink)" strokeWidth="2" />
            </svg>
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="搜索专业 / 标签"
              className="w-full bg-transparent px-2 text-[13px] outline-none placeholder:text-ink/40"
            />
          </div>

          {/* 分类 tab（横向滚动，紧凑药丸） */}
          <div className="-mx-2.5 px-2.5 overflow-x-auto scrollbar-none">
            <div className="flex gap-1.5 pb-1 w-max">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "shrink-0 font-display text-[11px] tracking-wider px-2.5 py-1 border-2 border-ink transition-colors",
                    tab === t
                      ? "bg-ink text-cream shadow-[2px_2px_0_0_var(--ink)]"
                      : "bg-cream text-ink/70 hover:text-ink",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 章节标题 */}
          <div className="flex items-center gap-2 px-1 pt-0.5">
            <span className="inline-block h-2.5 w-2.5 bg-cherry border-2 border-ink" />
            <span className="font-display text-[11px] tracking-[0.2em] text-ink/70">
              可选副本 · {list.length}
            </span>
            <span className="h-px flex-1 bg-ink/20" />
            <span className="text-[9px] font-display tracking-wider text-ink/50">
              按适配度排序
            </span>
          </div>

          {/* 副本网格：2 列紧凑瓦片 */}
          <div className="grid grid-cols-2 gap-2">
            {list.map((m) => (
              <QuestTile
                key={m.id}
                major={m}
                selected={m.id === selectedId}
                onClick={() => {
                  setSelectedId(m.id);
                  setSheetOpen(true);
                }}
              />
            ))}
          </div>

          {list.length === 0 && (
            <div className="pixel-panel-sm p-6 text-center text-[12px] text-ink/60">
              没有匹配的副本，换个筛选试试
            </div>
          )}
        </div>
      </div>

      {/* 底部选中副本悬浮确认条 */}
      {selected && !sheetOpen && (
        <div className="absolute inset-x-0 bottom-0 z-30 border-t-[3px] border-ink bg-cream shadow-[0_-3px_0_0_var(--ink)] animate-pop-in">
          <div className="p-2.5 flex items-center gap-2.5">
            <div
              className="shrink-0 border-2 border-ink shadow-[2px_2px_0_0_var(--ink)] flex items-center justify-center text-[22px] leading-none"
              style={{ width: 44, height: 44, background: CATEGORY_TINT[selected.category] }}
            >
              {selected.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-display tracking-[0.2em] text-ink/60 leading-none">
                当前选中副本
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={cn("rank-badge", `rank-${rankOf(selected.fit)}`)}>
                  {rankOf(selected.fit)}
                </span>
                <span className="font-display text-[14px] truncate">{selected.name}</span>
              </div>
              <div className="text-[10px] text-ink/60 truncate mt-0.5">
                {selected.diagnosis}
              </div>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={() => setSheetOpen(true)}
                className="text-[10px] font-display px-2 py-1 border-2 border-ink bg-cream"
              >
                详情
              </button>
              <PixelButton variant="accent" size="sm" onClick={confirm}>
                进入 ✓
              </PixelButton>
            </div>
          </div>
        </div>
      )}

      {/* 详情 sheet */}
      {sheetOpen && selected && (
        <>
          <button
            aria-label="关闭"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 z-40 bg-ink/50"
          />
          <div className="sheet-panel absolute bottom-0 left-0 right-0 z-50 max-h-[85%] overflow-y-auto p-3 pb-6 animate-pop-in">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/40" />
            <DetailContent major={selected} onConfirm={confirm} />
          </div>
        </>
      )}
    </PhoneFrame>
  );
}

function QuestTile({
  major,
  selected,
  onClick,
}: {
  major: MajorConfig;
  selected: boolean;
  onClick: () => void;
}) {
  const rank = rankOf(major.fit);
  const tint = CATEGORY_TINT[major.category];
  // 用第一个非"热门"的 tag 作为主梗标签
  const memeTag = major.tags.find((t) => t !== "热门") ?? major.tags[0];
  const hasWarn = major.tags.includes("慎选") || major.pressureLevel === "极高";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative text-left border-[3px] border-ink bg-cream overflow-hidden transition-all",
        "shadow-[3px_3px_0_0_var(--ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_var(--ink)]",
        selected && "-translate-y-0.5 shadow-[3px_5px_0_0_var(--cherry)] ring-2 ring-cherry",
      )}
    >
      {/* 右上角适配度分档章 */}
      <span
        className={cn(
          "absolute top-1 right-1 z-10 rank-badge",
          `rank-${rank}`,
        )}
      >
        {rank}
      </span>

      {/* 热门角标 */}
      {major.tags.includes("热门") && (
        <span className="absolute top-1 left-1 z-10 text-[8.5px] font-display tracking-wider px-1 py-0.5 bg-cherry text-cream border border-ink">
          HOT
        </span>
      )}

      {/* 图标区（占位色块，等素材替换） */}
      <div
        className="h-[68px] flex items-center justify-center border-b-[3px] border-ink relative"
        style={{ background: tint }}
      >
        <div className="text-[34px] leading-none select-none" aria-hidden>
          {major.emoji}
        </div>
        {/* 像素扫描线纹理 */}
        <div className="absolute inset-0 pixel-scanlines opacity-15 pointer-events-none" />
      </div>

      {/* 信息区 */}
      <div className="p-1.5">
        <div className="flex items-baseline justify-between gap-1">
          <span className="font-display text-[13px] truncate">{major.name}</span>
          <span className="text-[9px] font-display tabular-nums text-cherry shrink-0">
            {major.fit}%
          </span>
        </div>
        <div className="text-[9px] text-ink/60 mt-0.5 leading-none tracking-wider">
          {major.category} · 压力 {major.pressureLevel}
        </div>

        {/* 梗标签 + 慎入警告 */}
        <div className="mt-1.5 flex items-center gap-1 min-h-[16px]">
          {memeTag && (
            <TagBadge tone={inferTagTone(memeTag)}>{memeTag}</TagBadge>
          )}
          {hasWarn && (
            <span className="text-[9px] font-display px-1 border border-cherry text-cherry ml-auto">
              ⚠ 慎入
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function DetailContent({ major, onConfirm }: { major: MajorConfig; onConfirm: () => void }) {
  const rank = rankOf(major.fit);
  const tint = CATEGORY_TINT[major.category];
  return (
    <div className="space-y-3">
      {/* 头部 */}
      <div className="flex items-center gap-3">
        <div
          className="border-[3px] border-ink shadow-[3px_3px_0_0_var(--ink)] flex items-center justify-center text-[28px] shrink-0"
          style={{ width: 62, height: 62, background: tint }}
        >
          {major.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("rank-badge", `rank-${rank}`)}>{rank}</span>
            <div className="font-display text-[18px] leading-tight truncate">{major.name}</div>
          </div>
          <div className="text-[11px] text-ink/70 mt-0.5">
            {major.category} · 压力{major.pressureLevel} · 适配 {major.fit}%
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {major.tags.map((t) => (
              <TagBadge key={t} tone={inferTagTone(t)}>{t}</TagBadge>
            ))}
          </div>
        </div>
      </div>

      <PixelPanel title="综合数值 · STATS" size="sm" bodyClassName="p-2.5">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {STAT_LABELS.map((s) => (
            <StatBar
              key={s.key}
              label={s.label}
              value={major.stats[s.key]}
              color={s.color}
              size="sm"
            />
          ))}
        </div>
      </PixelPanel>

      <PixelPanel title="推荐理由" size="sm" tone="sage" bodyClassName="p-2.5">
        <ul className="space-y-0.5 text-[12px]">
          {major.reasons.map((r) => (
            <li key={r} className="flex gap-1.5">
              <span className="text-ink">▸</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </PixelPanel>

      <PixelPanel title="慎入人群" size="sm" tone="cherry" bodyClassName="p-2.5">
        <ul className="space-y-0.5 text-[12px]">
          {major.warnings.map((r) => (
            <li key={r} className="flex gap-1.5">
              <span style={{ color: "var(--danger)" }}>✕</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </PixelPanel>

      <div>
        <div className="text-[10px] font-display tracking-widest text-ink/60 mb-1">可能结局方向</div>
        <div className="flex flex-wrap gap-1.5">
          {major.endings.map((e) => (
            <span key={e} className="pixel-chip bg-sky/40 !text-[11px]">{e}</span>
          ))}
        </div>
      </div>

      <div className="diag-note">
        <div className="text-[10px] font-display tracking-widest text-ink/60 mb-0.5">
          系统诊断
        </div>
        {major.diagnosis}
      </div>

      <PixelButton variant="accent" size="block" onClick={onConfirm}>
        ✓ 确认进入「{major.name}」副本
      </PixelButton>
    </div>
  );
}
