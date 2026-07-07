import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { majors as ALL_MAJORS } from "@/data/script/gameData";
import { gameStore } from "@/lib/gameStore";
import { cn } from "@/lib/utils";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelPanel } from "@/components/ui/PixelPanel";
import { TagBadge, inferTagTone } from "@/components/ui/TagBadge";
import { majorEmoji, displayCategory, categoryTint } from "@/lib/majorDisplay";
import {
  PixelHeader,
  PixelChip,
  PixelTierBadge,
  PixelImgButton,
} from "@/components/pixel/PixelSkin";

export const Route = createFileRoute("/major")({ component: MajorSelectPage });

// 分类 tabs：按展示大类聚合
const CATEGORY_TABS: { label: string; match: (m: any) => boolean }[] = [
  { label: "全部",  match: () => true },
  { label: "热门",  match: (m) => m.tier === "S" },
  { label: "工科",  match: (m) => displayCategory(m.category) === "工科" },
  { label: "人文",  match: (m) => displayCategory(m.category) === "人文" },
  { label: "医学",  match: (m) => displayCategory(m.category) === "医学" },
  { label: "经管",  match: (m) => displayCategory(m.category) === "经管" },
  { label: "教育",  match: (m) => displayCategory(m.category) === "教育" },
  { label: "艺术",  match: (m) => displayCategory(m.category) === "艺术" },
  { label: "文理",  match: (m) => displayCategory(m.category) === "文理" },
];

// 推荐 chips：基于初始 stats 推断
const REC_FILTERS: { label: string; match: (m: any) => boolean }[] = [
  { label: "适合我",    match: (m) => (m.initialStats?.obsession ?? 0) >= 60 },
  { label: "就业稳",    match: (m) => (m.initialStats?.careerFantasy ?? 0) >= 70 },
  { label: "高挑战",    match: (m) => m.tier === "S" },
  { label: "低痛苦",    match: (m) => (m.initialStats?.energy ?? 100) >= 78 },
  { label: "家长喜欢",  match: (m) => ["医学健康池","教育稳定池","商科管理池"].includes(m.category) },
  { label: "慎入但香",  match: (m) => (m.initialStats?.filter ?? 0) >= 78 && m.tier === "S" },
];

function tierOf(m: any): "S" | "A" | "B" | "C" {
  return (m.tier ?? "B") as any;
}

function fitOf(m: any): number {
  return Math.min(99, Math.max(40, Math.round((m.initialStats?.obsession ?? 60) * 0.6 + (m.initialStats?.filter ?? 60) * 0.4)));
}

function MajorSelectPage() {
  const navigate = useNavigate();
  const [tabLabel, setTabLabel] = useState<string>("全部");
  const [recSet, setRecSet] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const toggleRec = (label: string) => {
    setRecSet((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  const tab = CATEGORY_TABS.find((t) => t.label === tabLabel) ?? CATEGORY_TABS[0];

  const list = useMemo(() => {
    return ALL_MAJORS.filter((m: any) => {
      if (!tab.match(m)) return false;
      for (const r of REC_FILTERS) if (recSet.has(r.label) && !r.match(m)) return false;
      return true;
    }).sort((a: any, b: any) => {
      const tierRank = { S: 3, A: 2, B: 1, C: 0 } as Record<string, number>;
      return (tierRank[b.tier] ?? 0) - (tierRank[a.tier] ?? 0);
    });
  }, [tab, recSet]);

  const selected = ALL_MAJORS.find((m: any) => m.id === selectedId) ?? null;

  const confirm = () => {
    if (!selected) return;
    gameStore.selectMajor(selected.id);
    navigate({ to: "/intro" });
  };

  const topBar = (
    <div className="relative border-b-[3px] border-ink bg-ink px-2 py-1">
      <button
        onClick={() => navigate({ to: "/" })}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-cream text-[10px] px-1.5 py-0.5 border border-cream leading-none"
      >
        ←
      </button>
      <PixelHeader variant="majorSelect" className="!max-w-[220px]" />
    </div>
  );


  return (
    <PhoneFrame topBar={topBar}>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-2 p-2.5 pb-4">

          <div className="-mx-2.5 px-2.5 overflow-x-auto scrollbar-none">
            <div className="flex gap-1 pb-1 w-max items-end">
              {CATEGORY_TABS.map((t) => (
                <PixelChip
                  key={t.label}
                  active={tabLabel === t.label}
                  onClick={() => setTabLabel(t.label)}
                  className="!text-[10px]"
                  style={{ minWidth: 42, padding: "4px 8px 8px" }}
                >
                  {t.label}
                </PixelChip>
              ))}
            </div>
          </div>



          <div className="-mx-2.5 px-2.5 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 pb-1 w-max">
              <span className="text-[9px] font-display tracking-[0.2em] text-ink/50 shrink-0 pr-0.5">推荐 ▸</span>
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

          <SelectionPreview
            major={selected}
            onOpenDetail={() => selected && setSheetOpen(true)}
            onConfirm={confirm}
          />

          <div className="flex items-center gap-2 px-1 pt-0.5">
            <span className="inline-block h-2.5 w-2.5 bg-cherry border-2 border-ink" />
            <span className="font-display text-[11px] tracking-[0.2em] text-ink/70">
              可选副本 · {list.length}
            </span>
            <span className="h-px flex-1 bg-ink/20" />
            <span className="text-[9px] font-display tracking-wider text-ink/50">按分档排序</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {list.map((m: any) => (
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

      {sheetOpen && selected && (
        <>
          <button aria-label="关闭" onClick={() => setSheetOpen(false)} className="absolute inset-0 z-40 bg-ink/50" />
          <div className="sheet-panel absolute bottom-0 left-0 right-0 z-50 max-h-[85%] overflow-y-auto p-3 pb-6 animate-pop-in">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/40" />
            <DetailContent major={selected} onConfirm={confirm} />
          </div>
        </>
      )}
    </PhoneFrame>
  );
}

function SelectionPreview({
  major, onOpenDetail, onConfirm,
}: { major: any; onOpenDetail: () => void; onConfirm: () => void }) {
  if (!major) {
    return (
      <div className="border-[3px] border-dashed border-ink/40 bg-cream/60 p-3 text-center">
        <div className="text-[10px] font-display tracking-[0.2em] text-ink/50">当前选中副本</div>
        <div className="text-[12px] text-ink/60 mt-1">👇 从下方点一个专业，先预览再进入</div>
      </div>
    );
  }

  const rank = tierOf(major);
  const tint = categoryTint(major.category);
  const cardTags: string[] = major.card?.tags ?? major.tags?.slice(0, 3) ?? [];

  return (
    <div className="relative border-[3px] border-ink bg-cream shadow-[3px_3px_0_0_var(--cherry)] p-2">
      <span className="absolute -top-2 left-2 text-[9px] font-display tracking-[0.2em] px-1.5 py-0.5 bg-ink text-cream">
        ▌ 当前选中副本
      </span>
      <button
        onClick={onOpenDetail}
        className="absolute -top-2 right-2 text-[9px] font-display tracking-wider px-1.5 py-0.5 bg-cream border-2 border-ink"
      >
        详情 ›
      </button>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 items-start pt-1">
        <div
          className="border-2 border-ink shadow-[2px_2px_0_0_var(--ink)] flex items-center justify-center text-[22px] shrink-0"
          style={{ width: 42, height: 42, background: tint }}
        >
          {majorEmoji(major.id)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <PixelTierBadge tier={rank} size={22} className="shrink-0 -my-1" />
            <span className="font-display text-[14px] truncate flex-1">{major.name}</span>
            <span className="font-display text-[11px] text-cherry tabular-nums shrink-0">
              {fitOf(major)}%
            </span>
          </div>
          <div className="text-[11px] text-ink/70 mt-0.5 leading-snug line-clamp-2">
            「{major.card?.subtitle ?? major.card?.description ?? ""}」
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {cardTags.slice(0, 3).map((t: string) => (
              <TagBadge key={t} tone={inferTagTone(t)}>{t}</TagBadge>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <PixelImgButton variant="primary" compact onClick={onConfirm}>
          ✓ 进入「{major.name}」副本
        </PixelImgButton>
      </div>
    </div>
  );
}



function QuestTile({
  major, selected, onClick,
}: { major: any; selected: boolean; onClick: () => void }) {
  const rank = tierOf(major);
  const tint = categoryTint(major.category);
  const memeTag: string | undefined = major.card?.tags?.[0] ?? major.tags?.[0];
  const hasWarn = !!major.card?.riskWarning;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative text-left border-[3px] border-ink bg-cream overflow-hidden transition-all",
        "shadow-[3px_3px_0_0_var(--ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_var(--ink)]",
        selected && "-translate-y-0.5 shadow-[3px_5px_0_0_var(--cherry)] ring-2 ring-cherry",
      )}
    >
      <PixelTierBadge tier={rank} size={30} className="absolute top-1 right-1 z-10" />

      {major.tier === "S" && (
        <span className="absolute top-1 left-1 z-10 text-[8.5px] font-display tracking-wider px-1 py-0.5 bg-cherry text-cream border border-ink">
          HOT
        </span>
      )}

      <div
        className="h-[60px] flex items-center justify-center border-b-[3px] border-ink relative"
        style={{ background: tint }}
      >
        <div className="text-[30px] leading-none select-none" aria-hidden>
          {majorEmoji(major.id)}
        </div>
        <div className="absolute inset-0 pixel-scanlines opacity-15 pointer-events-none" />
      </div>

      <div className="p-1.5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-1">
          <span className="font-display text-[13px] truncate">{major.name}</span>
          <span className="text-[9px] font-display tabular-nums text-cherry shrink-0">
            {fitOf(major)}%
          </span>
        </div>
        <div className="text-[9px] text-ink/60 mt-0.5 leading-none tracking-wider truncate">
          {displayCategory(major.category)} · {major.tier}
        </div>

        <div className="mt-1.5 flex items-center gap-1 min-h-[16px]">
          {memeTag && <TagBadge tone={inferTagTone(memeTag)}>{memeTag}</TagBadge>}
          {hasWarn && (
            <span className="text-[9px] font-display px-1 border border-cherry text-cherry ml-auto shrink-0">⚠</span>
          )}
        </div>
      </div>
    </button>
  );
}

function DetailContent({ major, onConfirm }: { major: any; onConfirm: () => void }) {
  const rank = tierOf(major);
  const tint = categoryTint(major.category);
  const memes: string[] = major.memes ?? [];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <div
          className="border-[3px] border-ink shadow-[3px_3px_0_0_var(--ink)] flex items-center justify-center text-[28px] shrink-0"
          style={{ width: 62, height: 62, background: tint }}
        >
          {majorEmoji(major.id)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <PixelTierBadge tier={rank} size={30} className="shrink-0 -my-2" />
            <div className="font-display text-[18px] leading-tight truncate">{major.name}</div>
          </div>
          <div className="text-[11px] text-ink/70 mt-0.5">
            {displayCategory(major.category)} · 分档 {major.tier} · 适配 {fitOf(major)}%
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {(major.card?.tags ?? []).map((t: string) => (
              <TagBadge key={t} tone={inferTagTone(t)}>{t}</TagBadge>
            ))}
          </div>
        </div>
      </div>

      <div className="diag-note">
        <div className="text-[10px] font-display tracking-widest text-ink/60 mb-0.5">系统诊断</div>
        {major.card?.subtitle ?? major.card?.description}
      </div>

      <PixelPanel title="推荐画像 · WHY YOU" size="sm" tone="sage" bodyClassName="p-2.5">
        <ul className="space-y-0.5 text-[12px]">
          {(major.fitProfile ?? []).map((r: string) => (
            <li key={r} className="flex gap-1.5"><span>▸</span><span>{r}</span></li>
          ))}
        </ul>
      </PixelPanel>

      <PixelPanel title="慎入人群 · AVOID" size="sm" tone="cherry" bodyClassName="p-2.5">
        <ul className="space-y-0.5 text-[12px]">
          {(major.avoidProfile ?? []).map((r: string) => (
            <li key={r} className="flex gap-1.5"><span style={{ color: "var(--danger)" }}>✕</span><span>{r}</span></li>
          ))}
        </ul>
      </PixelPanel>

      {memes.length > 0 && (
        <div>
          <div className="text-[10px] font-display tracking-widest text-ink/60 mb-1">专业梗 · MEMES</div>
          <div className="flex flex-wrap gap-1.5">
            {memes.map((e) => (
              <span key={e} className="pixel-chip bg-sky/40 !text-[11px]">{e}</span>
            ))}
          </div>
        </div>
      )}

      {major.card?.riskWarning && (
        <div className="border-2 border-cherry bg-cherry/10 p-2.5 text-[12px] leading-snug text-ink">
          ⚠ {major.card.riskWarning}
        </div>
      )}

      <PixelImgButton variant="primary" onClick={onConfirm}>
        ✓ 确认进入「{major.name}」副本
      </PixelImgButton>
    </div>
  );
}
