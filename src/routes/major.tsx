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
    <div className="border-b-[3px] border-ink bg-ink text-cream px-3 py-1.5 flex items-center gap-2">
      <button
        onClick={() => navigate({ to: "/" })}
        className="text-[11px] px-2 py-0.5 border-2 border-cream"
      >
        ← 返回
      </button>
      <div className="min-w-0">
        <div className="font-display text-[13px] leading-none">专业排行 · 选择副本</div>
        <div className="text-[9px] opacity-70 leading-none mt-0.5">
          筛选出 {list.length} / {MAJORS.length}
        </div>
      </div>
    </div>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div className="flex flex-col gap-2.5 p-2.5">
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

        {/* 分类 tab */}
        <div className="-mx-2.5 px-2.5 overflow-x-auto scrollbar-none">
          <div className="flex gap-1.5 pb-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn("pixel-tab", tab === t && "pixel-tab-active")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 排行榜标题 */}
        <div className="flex items-center gap-2 px-1">
          <span className="h-1 w-1 bg-ink" />
          <span className="font-display text-[11px] tracking-widest text-ink/70">
            专业排行榜 · TOP {list.length}
          </span>
          <span className="h-px flex-1 bg-ink/20" />
        </div>

        {/* 专业列表 */}
        <div className="flex flex-col gap-2.5 pb-4">
          {list.map((m, i) => (
            <MajorQuestCard
              key={m.id}
              major={m}
              rankNo={i + 1}
              selected={m.id === selectedId}
              onClick={() => {
                setSelectedId(m.id);
                setSheetOpen(true);
              }}
            />
          ))}
          {list.length === 0 && (
            <div className="pixel-panel-sm p-6 text-center text-[12px] text-ink/60">
              没有匹配的专业，换个筛选试试
            </div>
          )}
        </div>
      </div>

      {/* 详情 sheet */}
      {sheetOpen && selected && (
        <>
          <button
            aria-label="关闭"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 z-40 bg-ink/50"
          />
          <div className="sheet-panel absolute bottom-0 left-0 right-0 z-50 max-h-[82%] overflow-y-auto p-3 pb-6 animate-pop-in">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/40" />
            <DetailContent major={selected} onConfirm={confirm} />
          </div>
        </>
      )}
    </PhoneFrame>
  );
}

function MajorQuestCard({
  major, rankNo, selected, onClick,
}: {
  major: MajorConfig;
  rankNo: number;
  selected: boolean;
  onClick: () => void;
}) {
  const rank = rankOf(major.fit);
  const rankClass = `rank-${rank}`;
  return (
    <button
      onClick={onClick}
      className={cn(
        "quest-card quest-card-hover text-left overflow-hidden",
        selected && "quest-card-selected",
      )}
    >
      {/* 标题条：#排名 + 名称 + 分档 */}
      <div className="panel-title-strip">
        <span className="text-ink/60 tabular-nums text-[11px]">#{rankNo}</span>
        <span className="flex-1 truncate font-display text-[13px]">{major.name}</span>
        <span className={cn("rank-badge", rankClass)}>{rank}</span>
      </div>

      {/* 主体 */}
      <div className="p-2.5 flex gap-2.5">
        {/* 左：图标块 */}
        <div
          className="pixel-border-sm !shadow-none shrink-0 flex flex-col items-center justify-center"
          style={{ width: 46, background: "var(--sunny)" }}
        >
          <div className="font-display text-[18px] leading-none pt-1">{major.name.slice(0, 1)}</div>
          <div className="text-[8px] text-ink/70 mt-0.5 leading-none pb-1">{major.category}</div>
        </div>

        {/* 右：数值 + 标签 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-ink/60">适配度</span>
            <span className="font-display text-[13px] text-cherry tabular-nums">{major.fit}%</span>
            <span className="ml-auto text-[10px] text-ink/60">压力 {major.pressureLevel}</span>
          </div>

          {/* 6 项 mini stat bar */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            {STAT_LABELS.map((s) => (
              <StatBar
                key={s.key}
                label={s.label}
                value={major.stats[s.key]}
                color={s.color}
                size="xs"
                showValue={false}
              />
            ))}
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1">
            {major.tags.slice(0, 4).map((t) => (
              <TagBadge key={t} tone={inferTagTone(t)}>{t}</TagBadge>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

function DetailContent({ major, onConfirm }: { major: MajorConfig; onConfirm: () => void }) {
  const rank = rankOf(major.fit);
  return (
    <div className="space-y-3">
      {/* 头部 */}
      <div className="flex items-center gap-3">
        <div
          className="pixel-border-sm !shadow-none flex items-center justify-center font-display text-[22px]"
          style={{ width: 56, height: 56, background: "var(--sunny)" }}
        >
          {major.name.slice(0, 1)}
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

      {/* 适配度雷达（用条代替） */}
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

      {/* 推荐理由 */}
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

      {/* 慎入 */}
      <PixelPanel title="慎入人群" size="sm" tone="cherry" bodyClassName="p-2.5">
        <ul className="space-y-0.5 text-[12px]">
          {major.warnings.map((r) => (
            <li key={r} className="flex gap-1.5">
              <span className="text-danger" style={{ color: "var(--danger)" }}>✕</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </PixelPanel>

      {/* 结局方向 */}
      <div>
        <div className="text-[10px] font-display tracking-widest text-ink/60 mb-1">可能结局方向</div>
        <div className="flex flex-wrap gap-1.5">
          {major.endings.map((e) => (
            <span key={e} className="pixel-chip bg-sky/40 !text-[11px]">{e}</span>
          ))}
        </div>
      </div>

      {/* 系统诊断 */}
      <div className="diag-note">
        <div className="text-[10px] font-display tracking-widest text-ink/60 mb-0.5">
          系统诊断
        </div>
        {major.diagnosis}
      </div>

      <PixelButton variant="accent" size="block" onClick={onConfirm}>
        ✓ 进入「{major.name}」副本
      </PixelButton>
    </div>
  );
}
