import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Info, Vote, X } from "lucide-react";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { MajorMark } from "@/components/game/CampusArt";
import {
  FORMAL_MAJOR_EXPERIENCES,
  MAJOR_EXPERIENCES,
  type MajorExperienceConfig,
} from "@/data/majorExperienceConfig";
import { majorById } from "@/data/script/majorCatalog";
import { gameStore } from "@/lib/gameStore";
import { displayCategory } from "@/lib/majorDisplay";

export const Route = createFileRoute("/major")({ component: MajorSelectPage });

type MajorBrowserMode = "select" | "catalog";

function MajorSelectPage() {
  return <MajorBrowser mode="select" />;
}

export function MajorBrowser({ mode }: { mode: MajorBrowserMode }) {
  const navigate = useNavigate();
  const isCatalog = mode === "catalog";
  const [detailId, setDetailId] = useState<string | null>(null);
  const list = isCatalog ? FORMAL_MAJOR_EXPERIENCES : MAJOR_EXPERIENCES;
  const detailConfig = FORMAL_MAJOR_EXPERIENCES.find((major) => major.id === detailId) ?? null;
  const detail = detailConfig ? majorById[detailConfig.id] : null;

  const enter = (config: MajorExperienceConfig) => {
    if (isCatalog) {
      setDetailId(config.id);
      return;
    }
    if (config.entryType === "community_vote") {
      navigate({ to: "/next-major-vote" });
      return;
    }
    if (config.availability === "unavailable") {
      navigate({ to: "/major-preview/$majorId", params: { majorId: config.id } });
      return;
    }
    gameStore.selectMajor(config.id);
    navigate({ to: "/intro" });
  };

  const topBar = (
    <header className="v4-topbar v4-major-topbar">
      <button className="v4-icon-button" aria-label="返回首页" onClick={() => navigate({ to: "/" })}>
        <ArrowLeft size={19} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="v4-title text-[17px]">{isCatalog ? "专业档案" : "选择你的本科副本"}</div>
        <div className="truncate text-[10px] text-[var(--v4-muted)]">
          {isCatalog ? "五种专业人生，先看看各自的真实日常" : "同一个专业，也能活出完全不同的人生"}
        </div>
      </div>
    </header>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div className="v4-scroll">
        <div className="v4-major-list v4-launch-major-list">
          {list.map((config) => (
            <article className="v4-major-card v4-launch-major-card" key={config.id}>
              <MajorMark id={config.id} size={42} />
              <div className="min-w-0 flex-1">
                <h2 className="v4-major-card-title">{config.name}</h2>
                <p className="v4-major-card-copy">{config.subtitle}</p>
                <button className="v4-major-entry" onClick={() => enter(config)}>
                  {isCatalog ? (
                    <>
                      查看档案 <Info size={15} />
                    </>
                  ) : config.entryType === "community_vote" ? (
                    <>
                      去投票 <Vote size={15} />
                    </>
                  ) : (
                    <>
                      进入专业 <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {detailConfig && detail && (
        <div className="v4-overlay">
          <div className="v4-sheet">
            <div className="v4-sheet-handle" />
            <div className="flex items-start gap-3">
              <MajorMark id={detail.id} size={52} />
              <div className="min-w-0 flex-1">
                <div className="v4-title text-[22px]">{detailConfig.name}</div>
                <div className="mt-1 text-[12px] text-[var(--v4-muted)]">
                  {displayCategory(detail.category)} · {detailConfig.graduationYear} 年制本科
                </div>
              </div>
              <button
                className="v4-icon-button"
                aria-label="关闭专业详情"
                onClick={() => setDetailId(null)}
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-[var(--v4-muted)]">
              {detailConfig.subtitle}
            </p>
            <div className="v4-detail !px-0 !pb-0">
              <section className="v4-detail-section">
                <h3 className="v4-title">什么人可能读得舒服一点</h3>
                <ul>
                  {(detail.fitProfile ?? []).map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section className="v4-detail-section">
                <h3 className="v4-title">哪些误会最好先放下</h3>
                <ul>
                  {(detail.avoidProfile ?? []).map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}
