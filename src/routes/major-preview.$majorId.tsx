import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Vote } from "lucide-react";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { MajorMark } from "@/components/game/CampusArt";
import { getMajorExperienceConfig } from "@/data/majorExperienceConfig";
import { gameStore } from "@/lib/gameStore";

export const Route = createFileRoute("/major-preview/$majorId")({
  component: MajorPreviewRoute,
});

function MajorPreviewRoute() {
  const { majorId } = Route.useParams();
  const navigate = useNavigate();
  const config = getMajorExperienceConfig(majorId);

  useEffect(() => {
    if (config?.entryType === "community_vote") {
      navigate({ to: "/next-major-vote", replace: true });
    } else if (config?.availability === "available") {
      gameStore.selectMajor(config.id);
      navigate({ to: "/intro", replace: true });
    }
  }, [config, navigate]);

  if (config?.entryType === "community_vote" || config?.availability === "available") return null;
  return <MajorPreview majorId={majorId} />;
}

export function MajorPreview({ majorId }: { majorId: string }) {
  const navigate = useNavigate();
  const config = getMajorExperienceConfig(majorId);

  const topBar = (
    <header className="v4-topbar">
      <button className="v4-icon-button" aria-label="返回专业选择" onClick={() => navigate({ to: "/major" })}>
        <ArrowLeft size={19} />
      </button>
      <div>
        <div className="v4-title text-[19px]">录取通知</div>
        <div className="mt-0.5 text-[11px] text-[var(--v4-muted)]">先看一眼这段专业人生</div>
      </div>
    </header>
  );

  if (!config || config.entryType !== "game") {
    return (
      <PhoneFrame topBar={topBar}>
        <div className="v4-preview-wrap">
          <section className="v4-preview-letter">
            <BookOpen size={30} />
            <h1>没找到这份录取通知书。</h1>
            <p>专业名称可能写错了。回到选择页，再看看云上大学今年发出的录取通知。</p>
            <button className="v4-primary w-full" onClick={() => navigate({ to: "/major" })}>
              返回专业选择
            </button>
          </section>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame topBar={topBar}>
      <div className="v4-preview-wrap">
        <section className="v4-preview-letter">
          <div className="v4-preview-mark">
            <MajorMark id={config.id} size={68} />
            <span>云上大学录取通知书</span>
          </div>
          <div className="v4-preview-rule" />
          <div className="text-[11px] font-bold text-[var(--v4-muted)]">
            {config.graduationYear} 年制本科 · 共 {config.totalSemesters} 学期
          </div>
          <h1>{config.previewTitle ?? `你收到了${config.name}录取通知书。`}</h1>
          <p>{config.previewBody ?? config.subtitle}</p>
          <div className="v4-preview-stages">
            {config.stageNames.filter((_, index) => index % 2 === 0).map((stage) => (
              <span key={stage}>{stage.replace("上", "")}</span>
            ))}
          </div>
        </section>

        <div className="grid gap-2">
          <button className="v4-primary w-full" onClick={() => navigate({ to: "/major" })}>
            <BookOpen size={17} />先读另一个专业
          </button>
          <button className="v4-secondary w-full" onClick={() => navigate({ to: "/next-major-vote" })}>
            <Vote size={17} />看看下一专业投票
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
