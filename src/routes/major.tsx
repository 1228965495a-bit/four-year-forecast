import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Info, X } from "lucide-react";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { MajorMark } from "@/components/game/CampusArt";
import { majors as ALL_MAJORS } from "@/data/script/majorCatalog";
import { gameStore } from "@/lib/gameStore";
import { displayCategory } from "@/lib/majorDisplay";

export const Route = createFileRoute("/major")({ component: MajorSelectPage });

type MajorBrowserMode = "select" | "catalog";

const FILTERS = ["全部", "人文", "工科", "医学", "经管", "教育", "文理"];

function fitOf(major: any) {
  return Math.min(99, Math.max(40, Math.round((major.initialStats?.obsession ?? 60) * .6 + (major.initialStats?.filter ?? 60) * .4)));
}

function MajorSelectPage() {
  return <MajorBrowser mode="select" />;
}

export function MajorBrowser({ mode }: { mode: MajorBrowserMode }) {
  const navigate = useNavigate();
  const isCatalog = mode === "catalog";
  const [filter, setFilter] = useState("全部");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const list = useMemo(() => ALL_MAJORS.filter((m: any) => filter === "全部" || displayCategory(m.category) === filter), [filter]);
  const selected = ALL_MAJORS.find((m: any) => m.id === selectedId) ?? null;
  const detail = ALL_MAJORS.find((m: any) => m.id === detailId) ?? null;

  const choose = (major: any) => {
    if (isCatalog) setDetailId(major.id);
    else setSelectedId(major.id);
  };

  const confirm = () => {
    if (!selected) return;
    gameStore.selectMajor(selected.id);
    navigate({ to: "/intro" });
  };

  const topBar = (
    <header className="v4-topbar">
      <button className="v4-icon-button" aria-label="返回首页" onClick={() => navigate({ to: "/" })}><ArrowLeft size={19} /></button>
      <div className="min-w-0 flex-1">
        <div className="v4-title text-[19px]">{isCatalog ? "专业档案" : "选一个专业"}</div>
        <div className="mt-0.5 truncate text-[11px] text-[var(--v4-muted)]">{isCatalog ? `共 ${ALL_MAJORS.length} 个专业，点开看看真实日常` : "没有完美选项，只有不同版本的四年"}</div>
      </div>
      {!isCatalog && <span className="text-[11px] font-bold text-[var(--v4-muted)]">{selected ? "已选 1" : "未选择"}</span>}
    </header>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div className="v4-filter-row" role="group" aria-label="专业分类">
        {FILTERS.map((item) => (
          <button key={item} className="v4-filter" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>

      <div className="v4-scroll">
        <div className="v4-major-list">
          {list.map((major: any) => (
            <button key={major.id} className="v4-major-card" aria-pressed={!isCatalog && selectedId === major.id} onClick={() => choose(major)}>
              <MajorMark id={major.id} />
              <span className="min-w-0">
                <span className="v4-major-card-title block">{major.name}</span>
                <span className="v4-major-card-copy block">{major.card?.description ?? major.card?.subtitle}</span>
                <span className="v4-major-card-meta">
                  <span className="v4-mini-tag">{displayCategory(major.category)}</span>
                  <span className="v4-mini-tag">适配 {fitOf(major)}%</span>
                  {(major.card?.tags ?? []).slice(0, 1).map((tag: string) => <span className="v4-mini-tag" key={tag}>{tag}</span>)}
                </span>
              </span>
              {isCatalog ? <Info size={18} /> : selectedId === major.id ? <Check size={20} color="var(--v4-mint)" /> : <ArrowRight size={18} color="var(--v4-muted)" />}
            </button>
          ))}
        </div>
      </div>

      {!isCatalog && selected && (
        <div className="v4-sticky-action">
          <button className="v4-primary w-full" onClick={confirm}>就读 {selected.name}<ArrowRight size={19} /></button>
        </div>
      )}

      {detail && (
        <div className="v4-overlay">
          <div className="v4-sheet">
            <div className="v4-sheet-handle" />
            <div className="flex items-start gap-3">
              <MajorMark id={detail.id} size={52} />
              <div className="min-w-0 flex-1">
                <div className="v4-title text-[22px]">{detail.name}</div>
                <div className="mt-1 text-[12px] text-[var(--v4-muted)]">{displayCategory(detail.category)} · 适配 {fitOf(detail)}%</div>
              </div>
              <button className="v4-icon-button" aria-label="关闭专业详情" onClick={() => setDetailId(null)}><X size={18} /></button>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-[var(--v4-muted)]">{detail.card?.description ?? detail.card?.subtitle}</p>
            <div className="v4-detail !px-0 !pb-0">
              <section className="v4-detail-section">
                <h3 className="v4-title">什么人可能读得舒服一点</h3>
                <ul>{(detail.fitProfile ?? []).map((item: string) => <li key={item}>{item}</li>)}</ul>
              </section>
              <section className="v4-detail-section">
                <h3 className="v4-title">哪些误会最好先放下</h3>
                <ul>{(detail.avoidProfile ?? []).map((item: string) => <li key={item}>{item}</li>)}</ul>
              </section>
              <div className="flex flex-wrap gap-2">{(detail.memes ?? []).map((item: string) => <span className="v4-mini-tag" key={item}>{item}</span>)}</div>
            </div>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}
