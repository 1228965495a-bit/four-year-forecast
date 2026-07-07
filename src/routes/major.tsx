import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import {
  MAJORS,
  MAJOR_CATEGORIES,
  type MajorConfig,
} from "@/data/majors";
import { gameStore } from "@/lib/gameStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/major")({
  component: MajorSelectPage,
});

const TABS = ["全部", "热门", ...MAJOR_CATEGORIES] as const;
type Tab = (typeof TABS)[number];

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
    });
  }, [tab, kw]);

  const selected = MAJORS.find((m) => m.id === selectedId) ?? null;

  const confirm = () => {
    if (!selected) return;
    gameStore.selectMajor(selected.id);
    navigate({ to: "/semester" });
  };

  const topBar = (
    <div className="border-b-[3px] border-ink bg-cream px-3 py-2 flex items-center gap-2">
      <button
        onClick={() => navigate({ to: "/" })}
        className="pixel-tab !py-1"
        aria-label="返回"
      >
        ← 返回
      </button>
      <h2 className="font-display text-[16px]">专业选择</h2>
      <span className="ml-auto text-[10px] text-ink/60">
        {list.length}/{MAJORS.length}
      </span>
    </div>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div className="flex flex-col gap-3 p-3">
        {/* 搜索框 */}
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

        {/* 分类标签横向滚动 */}
        <div className="-mx-3 px-3 overflow-x-auto scrollbar-none">
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

        {/* 专业卡片列表 */}
        <div className="flex flex-col gap-2.5 pb-4">
          {list.map((m) => (
            <MajorRow
              key={m.id}
              major={m}
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

      {/* 底部弹出详情面板 */}
      {sheetOpen && selected && (
        <>
          <button
            aria-label="关闭"
            onClick={() => setSheetOpen(false)}
            className="fixed inset-0 z-40 bg-ink/40 sm:absolute"
          />
          <div className="sheet-panel absolute bottom-0 left-0 right-0 z-50 max-h-[75%] overflow-y-auto p-3 pb-6 animate-pop-in">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/40" />
            <DetailContent major={selected} onConfirm={confirm} />
          </div>
        </>
      )}
    </PhoneFrame>
  );
}

const STAT_LABELS: { key: keyof MajorConfig["stats"]; label: string; color: string }[] = [
  { key: "interest", label: "兴趣", color: "var(--cherry)" },
  { key: "pressure", label: "压力", color: "#D9534F" },
  { key: "employment", label: "就业", color: "var(--sage)" },
  { key: "salary", label: "薪资", color: "var(--sunny)" },
  { key: "growth", label: "成长", color: "var(--sky)" },
  { key: "stability", label: "稳定", color: "var(--tan)" },
];

function MajorRow({
  major,
  selected,
  onClick,
}: {
  major: MajorConfig;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "pixel-panel !p-2.5 text-left flex gap-2.5 transition-transform active:translate-y-[2px]",
        selected && "!bg-sky/50 outline outline-[3px] outline-offset-[2px] outline-cherry"
      )}
      style={{ background: selected ? "#BFE0F5" : undefined }}
    >
      {/* icon 占位 */}
      <div
        className="pixel-border-sm !shadow-none shrink-0 flex items-center justify-center font-display text-[18px]"
        style={{
          width: 44,
          height: 44,
          background: "var(--sunny)",
        }}
        aria-hidden
      >
        {major.name.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-display text-[15px] truncate">{major.name}</span>
          <span className="ml-auto text-[10px] text-ink/60">适配</span>
          <span className="font-display text-[13px] text-cherry">{major.fit}%</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {major.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[9px] px-1.5 py-0.5 border-2 border-ink bg-cream leading-none"
            >
              {t}
            </span>
          ))}
        </div>
        {/* 6 项迷你 bar */}
        <div className="mt-1.5 grid grid-cols-6 gap-1">
          {STAT_LABELS.map((s) => (
            <div key={s.key} className="flex flex-col items-center gap-0.5">
              <div className="bar-track w-full !h-1.5">
                <div
                  className="bar-fill"
                  style={{ width: `${major.stats[s.key]}%`, background: s.color }}
                />
              </div>
              <span className="text-[8px] text-ink/60 leading-none">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

function DetailContent({ major, onConfirm }: { major: MajorConfig; onConfirm: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div
          className="pixel-border-sm !shadow-none flex items-center justify-center font-display text-[22px]"
          style={{ width: 52, height: 52, background: "var(--sunny)" }}
        >
          {major.name.slice(0, 1)}
        </div>
        <div className="flex-1">
          <div className="font-display text-[20px] leading-tight">{major.name}</div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {major.tags.map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 border-2 border-ink bg-cream leading-none">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-ink/60">适配度</div>
          <div className="font-display text-[22px] text-cherry leading-none">{major.fit}%</div>
        </div>
      </div>

      <div className="pixel-panel-sm !p-2">
        <div className="text-[11px] text-ink/60 mb-1 font-display tracking-widest">推荐理由</div>
        <ul className="space-y-0.5 text-[12px]">
          {major.reasons.map((r) => (
            <li key={r} className="flex gap-1.5">
              <span className="text-sage">▸</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pixel-panel-sm !p-2 bg-cherry/15">
        <div className="text-[11px] text-ink/60 mb-1 font-display tracking-widest">慎入人群</div>
        <ul className="space-y-0.5 text-[12px]">
          {major.warnings.map((r) => (
            <li key={r} className="flex gap-1.5">
              <span className="text-cherry">✕</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="text-[11px] text-ink/60 mb-1 font-display tracking-widest">可能结局方向</div>
        <div className="flex flex-wrap gap-1.5">
          {major.endings.map((e) => (
            <span key={e} className="pixel-chip bg-sky/40 !text-[11px]">
              {e}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={onConfirm}
        className="pixel-btn w-full py-3 font-display text-[15px]"
        style={{ background: "var(--cherry)", color: "var(--cream)" }}
      >
        ✓ 确认选择「{major.name}」
      </button>
    </div>
  );
}
