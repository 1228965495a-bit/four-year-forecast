import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { MAJORS, type MajorConfig } from "@/data/majors";
import { gameStore } from "@/lib/gameStore";
import { cn } from "@/lib/utils";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelPanel } from "@/components/ui/PixelPanel";
import { StatBar } from "@/components/ui/StatBar";
import { TagBadge, inferTagTone } from "@/components/ui/TagBadge";

export const Route = createFileRoute("/major")({ component: MajorSelectPage });

// ========== 分类 Tabs（按用户口径重新聚合） ==========
type CategoryTab = { label: string; match: (m: MajorConfig) => boolean };
const CATEGORY_TABS: CategoryTab[] = [
  { label: "全部", match: () => true },
  { label: "热门", match: (m) => m.tags.includes("热门") },
  { label: "工科", match: (m) => m.category === "工科" },
  { label: "人文", match: (m) => m.category === "人文" || m.category === "艺术" },
  { label: "社科", match: (m) => m.category === "社科" || m.category === "教育" },
  { label: "经管", match: (m) => m.category === "商科" },
  { label: "医学", match: (m) => m.category === "医学" },
  { label: "理学", match: (m) => m.category === "理科" },
];

// ========== 推荐筛选 chips ==========
type RecFilter = { label: string; match: (m: MajorConfig) => boolean };
const REC_FILTERS: RecFilter[] = [
  { label: "适合我", match: (m) => m.fit >= 72 },
  { label: "就业稳", match: (m) => m.stats.employment >= 65 && m.stats.stability >= 60 },
  { label: "高挑战", match: (m) => m.stats.pressure >= 75 },
  { label: "低痛苦", match: (m) => m.stats.pressure <= 55 },
  {
    label: "家长喜欢",
    match: (m) =>
      m.stats.stability >= 60 &&
      (m.stats.employment >= 65 || m.category === "医学" || m.category === "教育"),
  },
  {
    label: "慎入但香",
    match: (m) => m.tags.includes("慎选") && (m.stats.salary >= 70 || m.fit >= 70),
  },
];

const STAT_LABELS: { key: keyof MajorConfig["stats"]; label: string; color: string }[] = [
  { key: "interest", label: "兴趣", color: "var(--cherry)" },
  { key: "pressure", label: "压力", color: "var(--danger)" },
  { key: "employment", label: "就业", color: "var(--sage)" },
  { key: "salary", label: "薪资", color: "var(--sunny)" },
  { key: "growth", label: "成长", color: "var(--sky)" },
  { key: "stability", label: "稳定", color: "var(--tan)" },
];

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
  const [tabLabel, setTabLabel] = useState<string>("全部");
  const [recSet, setRecSet] = useState<Set<string>>(new Set());
  const [kw, setKw] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const toggleRec = (label: string) => {
    setRecSet((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const tab = CATEGORY_TABS.find((t) => t.label === tabLabel) ?? CATEGORY_TABS[0];

  const list = useMemo(() => {
    return MAJORS.filter((m) => {
      if (!tab.match(m)) return false;
      for (const r of REC_FILTERS) {
        if (recSet.has(r.label) && !r.match(m)) return false;
      }
      if (kw && !m.name.includes(kw) && !m.tags.some((t) => t.includes(kw))) return false;
      return true;
    }).sort((a, b) => b.fit - a.fit);
  }, [tab, recSet, kw]);

  const selected = MAJORS.find((m) => m.id === selectedId) ?? null;

  const confirm = () => {
    if (!selected) return;
    gameStore.selectMajor(selected.id);
    navigate({ to: "/semester" });
  };

  const topBar = (
    <div className="border-b-[3px] border-ink bg-ink text-cream px-3 py-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
      <button
        onClick={() => navigate({ to: "/" })}
        className="text-[11px] px-2 py-0.5 border-2 border-cream shrink-0"
      >
        ← 返回
      </button>
      <div className="min-w-0">
        <div className="font-display text-[14px] leading-tight truncate">选择你的本科副本</div>
        <div className="text-[10px] opacity-75 leading-tight mt-0.5 truncate">
          选一个专业，快进体验本科四年
        </div>
      </div>
    </div>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-2.5 p-2.5 pb-4">
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

          {/* 分类 tabs（横向滚动） */}
          <div className="-mx-2.5 px-2.5 overflow-x-auto scrollbar-none">
            <div className="flex gap-1.5 pb-1 w-max">
              {CATEGORY_TABS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setTabLabel(t.label)}
                  className={cn(
                    "shrink-0 font-display text-[11px] tracking-wider px-2.5 py-1 border-2 border-ink transition-colors",
                    tabLabel === t.label
                      ? "bg-ink text-cream shadow-[2px_2px_0_0_var(--ink)]"
                      : "bg-cream text-ink/70 hover:text-ink",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 推荐筛选 chips */}
          <div className="-mx-2.5 px-2.5 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 pb-1 w-max">
              <span className="text-[9px] font-display tracking-[0.2em] text-ink/50 shrink-0 pr-0.5">
                推荐 ▸
              </span>
              {REC_FILTERS.map((r) => {
                const active = recSet.has(r.label);
                return (
                  <button
                    key={r.label}
                    onClick={() => toggleRec(r.label)}
                    className={cn(
                      "shrink-0 text-[11px] px-2 py-0.5 border-2 border-ink transition-colors",
                      active
                        ? "bg-cherry text-cream shadow-[2px_2px_0_0_var(--ink)]"
                        : "bg-cream text-ink/70",
                    )}
                  >
                    #{r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 当前选中副本预览卡 */}
          <SelectionPreview
            major={selected}
            onOpenDetail={() => selected && setSheetOpen(true)}
            onConfirm={confirm}
          />

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
                onClick={() => setSelectedId(m.id)}
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

/** 当前选中副本预览卡（未选时给出占位提示） */
function SelectionPreview({
  major,
  onOpenDetail,
  onConfirm,
}: {
  major: MajorConfig | null;
  onOpenDetail: () => void;
  onConfirm: () => void;
}) {
  if (!major) {
    return (
      <div
        className="border-[3px] border-dashed border-ink/40 bg-cream/60 p-3 text-center"
      >
        <div className="text-[10px] font-display tracking-[0.2em] text-ink/50">
          当前选中副本
        </div>
        <div className="text-[12px] text-ink/60 mt-1">
          👇 从下方点一个专业，先预览再进入
        </div>
      </div>
    );
  }

  const rank = rankOf(major.fit);
  const tint = CATEGORY_TINT[major.category];
  // 3 个核心标签：优先梗标签
  const coreTags = major.tags.filter((t) => t !== "热门").slice(0, 3);
  const fillerTags = major.tags.slice(0, 3);
  const shown = coreTags.length ? coreTags : fillerTags;

  return (
    <div
      className="relative border-[3px] border-ink bg-cream shadow-[4px_4px_0_0_var(--cherry)] p-2.5"
    >
      <span className="absolute -top-2 left-2 text-[9px] font-display tracking-[0.2em] px-1.5 py-0.5 bg-ink text-cream">
        ▌ 当前选中副本
      </span>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2.5 items-start pt-0.5">
        <div
          className="border-[3px] border-ink shadow-[2px_2px_0_0_var(--ink)] flex items-center justify-center text-[28px] shrink-0"
          style={{ width: 54, height: 54, background: tint }}
        >
          {major.emoji}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn("rank-badge shrink-0", `rank-${rank}`)}>{rank}</span>
            <span className="font-display text-[15px] truncate flex-1">{major.name}</span>
            <span className="font-display text-[11px] text-cherry tabular-nums shrink-0">
              {major.fit}%
            </span>
          </div>
          <div className="text-[11px] text-ink/70 mt-1 leading-snug line-clamp-2">
            「{major.diagnosis}」
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {shown.map((t) => (
              <TagBadge key={t} tone={inferTagTone(t)}>{t}</TagBadge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 mt-2.5">
        <button
          onClick={onOpenDetail}
          className="text-[11px] font-display px-2.5 py-1.5 border-2 border-ink bg-cream shadow-[2px_2px_0_0_var(--ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          详情
        </button>
        <PixelButton variant="accent" size="block" onClick={onConfirm}>
          ✓ 确认进入「{major.name}」副本
        </PixelButton>
      </div>
    </div>
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
      <span className={cn("absolute top-1 right-1 z-10 rank-badge", `rank-${rank}`)}>
        {rank}
      </span>

      {major.tags.includes("热门") && (
        <span className="absolute top-1 left-1 z-10 text-[8.5px] font-display tracking-wider px-1 py-0.5 bg-cherry text-cream border border-ink">
          HOT
        </span>
      )}

      <div
        className="h-[60px] flex items-center justify-center border-b-[3px] border-ink relative"
        style={{ background: tint }}
      >
        <div className="text-[30px] leading-none select-none" aria-hidden>
          {major.emoji}
        </div>
        <div className="absolute inset-0 pixel-scanlines opacity-15 pointer-events-none" />
      </div>

      <div className="p-1.5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-1">
          <span className="font-display text-[13px] truncate">{major.name}</span>
          <span className="text-[9px] font-display tabular-nums text-cherry shrink-0">
            {major.fit}%
          </span>
        </div>
        <div className="text-[9px] text-ink/60 mt-0.5 leading-none tracking-wider truncate">
          {major.category} · 压力 {major.pressureLevel}
        </div>

        <div className="mt-1.5 flex items-center gap-1 min-h-[16px]">
          {memeTag && <TagBadge tone={inferTagTone(memeTag)}>{memeTag}</TagBadge>}
          {hasWarn && (
            <span className="text-[9px] font-display px-1 border border-cherry text-cherry ml-auto shrink-0">
              ⚠
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
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <div
          className="border-[3px] border-ink shadow-[3px_3px_0_0_var(--ink)] flex items-center justify-center text-[28px] shrink-0"
          style={{ width: 62, height: 62, background: tint }}
        >
          {major.emoji}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("rank-badge shrink-0", `rank-${rank}`)}>{rank}</span>
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
