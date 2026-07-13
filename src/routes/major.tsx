import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { majors as ALL_MAJORS } from "@/data/script/majorCatalog";
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
  PixelEnterButton,
} from "@/components/pixel/PixelSkin";
import { PixelPanel9 } from "@/components/pixel/PixelPanel9";
import sceneAsset from "@/assets/law-scene.png.asset.json";
import panelWideAsset from "@/assets/pixel/panel-wide.png.asset.json";
import panelSquareAsset from "@/assets/pixel/panel-square.png.asset.json";
import lawCardAsset from "@/assets/majors/law-card.png.asset.json";
import aiCardAsset from "@/assets/majors/ai-card.png.asset.json";
import accountingCardAsset from "@/assets/majors/accounting-card.png.asset.json";
import financeCardAsset from "@/assets/majors/finance-card.png.asset.json";
import csCardAsset from "@/assets/majors/cs-card.png.asset.json";
import clinicalCardAsset from "@/assets/majors/clinical-card.png.asset.json";
import aiSceneAsset from "@/assets/majors/ai-scene.png.asset.json";
import clinicalSceneAsset from "@/assets/majors/clinical-scene.png.asset.json";
import financeSceneAsset from "@/assets/majors/finance-scene.png.asset.json";
import csSceneAsset from "@/assets/majors/cs-scene.png.asset.json";
import accountingSceneAsset from "@/assets/majors/accounting-scene.png.asset.json";
import electronicInfoCardAsset from "@/assets/majors/electronic-info-card.png.asset.json";
import electricalCardAsset from "@/assets/majors/electrical-card.png.asset.json";
import teacherEducationSceneAsset from "@/assets/majors/teacher-education-scene.png.asset.json";
import chineseLanguageLiteratureSceneAsset from "@/assets/majors/chinese-language-literature-scene.png.asset.json";
import businessAdministrationSceneAsset from "@/assets/majors/business-administration-scene.png.asset.json";
import journalismCommunicationSceneAsset from "@/assets/majors/journalism-communication-scene.png.asset.json";
import electronicInformationSceneAsset from "@/assets/majors/electronic-information-scene.png.asset.json";
import psychologySceneAsset from "@/assets/majors/psychology-scene.png.asset.json";
import stomatologySceneAsset from "@/assets/majors/stomatology-scene.png.asset.json";
import mechanicalEngineeringSceneAsset from "@/assets/majors/mechanical-engineering-scene.png.asset.json";
import englishSceneAsset from "@/assets/majors/english-scene.png.asset.json";
import electricalEngineeringSceneAsset from "@/assets/majors/electrical-engineering-scene.png.asset.json";







// 完整整卡素材（含标题/百分比/角标烘焙在图内）。有此映射时 QuestTile 直接渲染整张图。
const MAJOR_CARD: Record<string, string> = {
  law: lawCardAsset.url,
  artificial_intelligence: aiCardAsset.url,
  accounting: accountingCardAsset.url,
  finance: financeCardAsset.url,
  computer_science: csCardAsset.url,
  clinical_medicine: clinicalCardAsset.url,
  electronic_information: electronicInfoCardAsset.url,
  electrical_engineering: electricalCardAsset.url,
};


// 每个专业的头图（会被 object-cover 裁剪到对应尺寸）。
const DEFAULT_SCENE = sceneAsset.url;
const MAJOR_SCENE: Record<string, string> = {
  law: sceneAsset.url,
  artificial_intelligence: aiSceneAsset.url,
  clinical_medicine: clinicalSceneAsset.url,
  finance: financeSceneAsset.url,
  computer_science: csSceneAsset.url,
  accounting: accountingSceneAsset.url,
  teacher_education: teacherEducationSceneAsset.url,
  chinese_language_literature: chineseLanguageLiteratureSceneAsset.url,
  business_administration: businessAdministrationSceneAsset.url,
  journalism_communication: journalismCommunicationSceneAsset.url,
  electronic_information: electronicInformationSceneAsset.url,
  psychology: psychologySceneAsset.url,
  stomatology: stomatologySceneAsset.url,
  mechanical_engineering: mechanicalEngineeringSceneAsset.url,
  english: englishSceneAsset.url,
  electrical_engineering: electricalEngineeringSceneAsset.url,
};








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

type MajorBrowserMode = "select" | "catalog";

function MajorSelectPage() {
  return <MajorBrowser mode="select" />;
}

export function MajorBrowser({ mode }: { mode: MajorBrowserMode }) {
  const navigate = useNavigate();
  const isCatalog = mode === "catalog";
  const [tabLabel, setTabLabel] = useState<string>("全部");
  const [recSet, setRecSet] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);

  const toggleRec = (label: string) => {
    setRecSet((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  const tab = CATEGORY_TABS.find((t) => t.label === tabLabel) ?? CATEGORY_TABS[0];

  const list = useMemo(() => {
    const tierRank = { S: 3, A: 2, B: 1, C: 0 } as Record<string, number>;
    return ALL_MAJORS.filter((m: any) => {
      if (!tab.match(m)) return false;
      for (const r of REC_FILTERS) if (recSet.has(r.label) && !r.match(m)) return false;
      return true;
    }).sort((a: any, b: any) => {
      const diff = (tierRank[b.tier] ?? 0) - (tierRank[a.tier] ?? 0);
      return sortDesc ? diff : -diff;
    });
  }, [tab, recSet, sortDesc]);

  const selected = ALL_MAJORS.find((m: any) => m.id === selectedId) ?? null;

  const confirm = () => {
    if (!selected || isCatalog) return;
    gameStore.selectMajor(selected.id);
    navigate({ to: "/intro" });
  };

  const topBar = (
    <div className="relative border-b-[3px] border-ink bg-ink px-2 pt-2 pb-2">
      <button
        onClick={() => navigate({ to: "/" })}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-cream text-[11px] px-2 py-0.5 border-2 border-cream"
      >
        ←&nbsp;
      </button>
      <PixelHeader variant="majorSelect" className="!max-w-[280px]" />
    </div>
  );

  const selectMajorCard = (id: string) => {
    setSelectedId(id);
    if (isCatalog) setSheetOpen(true);
  };


  return (
    <PhoneFrame topBar={topBar}>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-2.5 p-2.5 pb-4">

          <div className="-mx-2.5 px-2.5 overflow-x-auto scrollbar-none">
            <div className="flex gap-1 pb-1 w-max items-end">
              {CATEGORY_TABS.map((t) => (
                <PixelChip
                  key={t.label}
                  active={tabLabel === t.label}
                  onClick={() => setTabLabel(t.label)}
                  className="!text-[11px]"
                  style={{ minWidth: 56, padding: "10px 12px 14px" }}
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
                      "shrink-0 text-[11px] leading-none px-2.5 py-1.5 rounded-full border-2 border-ink transition-transform",
                      "shadow-[2px_2px_0_0_var(--ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
                      active
                        ? "bg-sage text-ink"
                        : "bg-cream text-ink/80",
                    )}
                  >
                    #{r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {!isCatalog && (
            <SelectionPreview
              major={selected}
              mode={mode}
              onOpenDetail={() => selected && setSheetOpen(true)}
              onConfirm={confirm}
            />
          )}

          <PagedQuestGrid
            list={list}
            selectedId={selectedId}
            onSelect={selectMajorCard}
            sortDesc={sortDesc}
            onToggleSort={() => setSortDesc((v) => !v)}
            mode={mode}
          />

        </div>
      </div>

      {sheetOpen && selected && (
        <>
          <button aria-label="关闭" onClick={() => setSheetOpen(false)} className="absolute inset-0 z-40 bg-ink/50" />
          <div className="sheet-panel absolute bottom-0 left-0 right-0 z-50 max-h-[85%] overflow-y-auto p-3 pb-6 animate-pop-in">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/40" />
            <DetailContent major={selected} mode={mode} onConfirm={confirm} />
          </div>
        </>
      )}
    </PhoneFrame>
  );
}

function SelectionPreview({
  major, mode, onOpenDetail, onConfirm,
}: { major: any; mode: MajorBrowserMode; onOpenDetail: () => void; onConfirm: () => void }) {
  const isCatalog = mode === "catalog";
  if (!major) {
    return (
      <PixelPanel9
        src={panelSquareAsset.url}
        slice={150}
        borderPx={22}
        padding="px-4 py-5"
        className="text-center"
      >
        <div className="text-[10px] font-display tracking-[0.2em] text-ink/50">
          {isCatalog ? "专业图鉴" : "当前选中副本"}
        </div>
        <div className="text-[12px] text-ink/60 mt-1">
          &nbsp;{isCatalog ? "从下方点一个专业，查看图鉴详情" : "从下方点一个专业，先预览再进入"}
        </div>
      </PixelPanel9>
    );
  }

  const rank = tierOf(major);
  const tint = categoryTint(major.category);
  const cardTags: string[] = major.card?.tags ?? major.tags?.slice(0, 3) ?? [];

  return (
    <PixelPanel9
      src={panelWideAsset.url}
      slice={80}
      borderPx={18}
      padding="p-2.5"
      className="relative"
    >
      <span className="absolute -top-2 left-3 z-10 text-[9px] font-display tracking-[0.2em] px-1.5 py-0.5 bg-ink text-cream">
        ▌ {isCatalog ? "当前查看专业" : "当前选中副本"}
      </span>


      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2.5 items-start pt-0.5">
        <div
          className="border-[3px] border-ink shadow-[2px_2px_0_0_var(--ink)] relative overflow-hidden shrink-0"
          style={{ width: 54, height: 54, background: tint }}
        >
          <img
            src={MAJOR_SCENE[major.id] ?? DEFAULT_SCENE}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover select-none"
            style={{ imageRendering: "pixelated" }}
          />
          {majorEmoji(major.id) && (
            <span
              className="absolute bottom-0 right-0 text-[14px] leading-none px-0.5 bg-cream/85 border-l-2 border-t-2 border-ink"
              aria-hidden
            >
              {majorEmoji(major.id)}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <PixelTierBadge tier={rank} size={26} className="shrink-0 -my-2" />
            <span className="font-display text-[15px] truncate flex-1">{major.name}</span>
            <span className="font-display text-[11px] text-cherry tabular-nums shrink-0">
              {fitOf(major)}%
            </span>
          </div>
          <div className="text-[11px] text-ink/70 mt-1 leading-snug line-clamp-2">
            「{major.card?.subtitle ?? major.card?.description ?? ""}」
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {cardTags.slice(0, 3).map((t: string) => (
              <TagBadge key={t} tone={inferTagTone(t)}>{t}</TagBadge>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex justify-center">
        {isCatalog ? (
          <button
            onClick={onOpenDetail}
            className="font-display text-[11px] px-3 py-1.5 border-2 border-ink bg-sky shadow-[2px_2px_0_0_var(--ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            查看详情
          </button>
        ) : (
          <PixelEnterButton onClick={onConfirm} />
        )}
      </div>
    </PixelPanel9>
  );
}


/**
 * 分页展示副本网格：每页 4 个（2×2），支持左右按钮 / 圆点 / 触屏横向滑动。
 * 目的：滚动时不再让顶部「当前选中副本 + ENTER」滑出视野。
 */
const PAGE_SIZE = 4;

function PagedQuestGrid({
  list,
  selectedId,
  onSelect,
  sortDesc,
  onToggleSort,
  mode,
}: {
  list: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  sortDesc: boolean;
  onToggleSort: () => void;
  mode: MajorBrowserMode;
}) {
  const total = list.length;
  const usesPaging = mode !== "catalog";
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const [page, setPage] = useState(0);

  // 列表变化（切 tab / 换筛选 / 换排序）时回到第一页
  const listSig = `${sortDesc}|${total}|${list[0]?.id ?? ""}|${list[list.length - 1]?.id ?? ""}`;
  useEffect(() => {
    setPage(0);
  }, [listSig]);

  // 当前选中若跳到别的页，自动翻过去
  useEffect(() => {
    if (!usesPaging) return;
    if (!selectedId) return;
    const idx = list.findIndex((m) => m.id === selectedId);
    if (idx < 0) return;
    const p = Math.floor(idx / PAGE_SIZE);
    if (p !== page) setPage(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, usesPaging]);

  const clamp = (p: number) => Math.max(0, Math.min(pageCount - 1, p));
  const prev = () => setPage((p) => clamp(p - 1));
  const next = () => setPage((p) => clamp(p + 1));

  // 触屏横向滑动
  const touchRef = useRef<{ x: number; y: number; done: boolean } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, done: false };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const s = touchRef.current;
    if (!s || s.done) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) next(); else prev();
      s.done = true;
    }
  };

  const visibleItems = usesPaging ? list.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE) : list;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1 pt-0.5">
        <span className="text-[15px] leading-none" aria-hidden>📖</span>
        <span className="font-display text-[12px] tracking-[0.15em] text-ink">
          {mode === "catalog" ? "专业图鉴" : "可选副本"} · {total}
        </span>
        <span className="h-px flex-1 bg-ink/20" />
        {usesPaging && (
          <span className="font-display text-[10px] tabular-nums text-ink/60">
            {pageCount > 0 ? page + 1 : 0}/{pageCount}
          </span>
        )}
        <button
          onClick={onToggleSort}
          className="flex items-center gap-1 text-[10px] font-display tracking-wider text-ink/70 px-1.5 py-1 border-2 border-ink bg-cream shadow-[1px_1px_0_0_var(--ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          aria-label="切换分档排序"
        >
          <span>按分档</span>
          <span className="text-[10px] leading-none">{sortDesc ? "▼" : "▲"}</span>
        </button>
      </div>

      {total === 0 ? (
        <PixelPanel9 variant="small" padding="p-5" className="text-center">
          <div className="text-[12px] text-ink/60">没有匹配的副本，换个筛选试试</div>
        </PixelPanel9>
      ) : (
        <div className="relative">
          <div
            className="grid grid-cols-2 gap-2 select-none touch-pan-y"
            onTouchStart={usesPaging ? onTouchStart : undefined}
            onTouchMove={usesPaging ? onTouchMove : undefined}
          >
            {visibleItems.map((m: any) => (
              <QuestTile
                key={m.id}
                major={m}
                selected={m.id === selectedId}
                onClick={() => onSelect(m.id)}
              />
            ))}
            {/* 占位保持每页高度一致 */}
            {usesPaging && Array.from({ length: PAGE_SIZE - visibleItems.length }).map((_, i) => (
                <div key={`ph-${i}`} aria-hidden className="invisible" />
              ))}
          </div>

          {/* 翻页控制 */}
          {usesPaging && (
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                onClick={prev}
                disabled={page === 0}
                className={cn(
                  "font-display text-[11px] px-2.5 py-1.5 border-2 border-ink bg-cream shadow-[2px_2px_0_0_var(--ink)]",
                  "active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[2px_2px_0_0_var(--ink)]",
                )}
                aria-label="上一页"
              >
                ◀ 上一页
              </button>

              <div className="flex items-center gap-1.5" aria-label="页码指示">
                {Array.from({ length: pageCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    aria-label={`第 ${i + 1} 页`}
                    className={cn(
                      "border-2 border-ink",
                      i === page ? "bg-cherry" : "bg-cream",
                    )}
                    style={{ width: 10, height: 10 }}
                  />
                ))}
              </div>

              <button
                onClick={next}
                disabled={page >= pageCount - 1}
                className={cn(
                  "font-display text-[11px] px-2.5 py-1.5 border-2 border-ink bg-cream shadow-[2px_2px_0_0_var(--ink)]",
                  "active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[2px_2px_0_0_var(--ink)]",
                )}
                aria-label="下一页"
              >
                下一页 ▶
              </button>
            </div>
          )}
        </div>
      )}
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

  const bannerSrc = MAJOR_CARD[major.id];


  return (
    <button
      onClick={onClick}
      className={cn(
        "relative text-left block transition-all",
        "active:translate-x-[1px] active:translate-y-[1px]",
        selected && "-translate-y-0.5 drop-shadow-[3px_5px_0_var(--cherry)]",
      )}
    >
      <PixelPanel9
        src={panelWideAsset.url}
        slice={80}
        borderPx={12}
        padding="p-0"
        className={cn("overflow-hidden", selected && "ring-2 ring-cherry")}
      >
        <div className="relative">
          <PixelTierBadge tier={rank} size={30} className="absolute top-1 right-1 z-10" />
          {major.tier === "S" && (
            <span className="absolute top-1 left-1 z-10 text-[8.5px] font-display tracking-wider px-1 py-0.5 bg-cherry text-cream border border-ink">
              HOT
            </span>
          )}

          <div
            className="h-[60px] flex items-center justify-center border-b-[3px] border-ink relative overflow-hidden"
            style={{ background: tint }}
          >
            {MAJOR_SCENE[major.id] ? (
              <img
                src={MAJOR_SCENE[major.id]}
                alt=""
                aria-hidden
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover select-none"
                style={{ imageRendering: "pixelated" }}
              />
            ) : (
              <div className="text-[30px] leading-none select-none" aria-hidden>
                {majorEmoji(major.id) || (
                  <span className="text-ink/30 text-[12px]">暂无图片</span>
                )}
              </div>
            )}
            <div className="absolute inset-0 pixel-scanlines opacity-15 pointer-events-none" />
          </div>

          {bannerSrc ? (
            <img
              src={bannerSrc}
              alt={major.name}
              draggable={false}
              className="block w-full h-auto select-none"
              style={{ imageRendering: "pixelated" }}
            />
          ) : (
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
          )}

        </div>
      </PixelPanel9>
    </button>
  );
}

function DetailContent({ major, mode, onConfirm }: { major: any; mode: MajorBrowserMode; onConfirm: () => void }) {
  const rank = tierOf(major);
  const tint = categoryTint(major.category);
  const memes: string[] = major.memes ?? [];
  const isCatalog = mode === "catalog";
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

      {!isCatalog && (
        <PixelImgButton variant="primary" onClick={onConfirm}>
          ✓ 确认进入「{major.name}」副本
        </PixelImgButton>
      )}
    </div>
  );
}
