import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BatteryMedium, BookOpenCheck, KeyRound } from "lucide-react";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { MajorMark } from "@/components/game/CampusArt";
import { gameStore, useGameState } from "@/lib/gameStore";
import { majorById } from "@/data/script/majorCatalog";
import { getLawTrait, LAW_MEMORIES } from "@/lib/lawRoguelite";

export const Route = createFileRoute("/intro")({ component: IntroPage });

function IntroPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? majorById[game.majorId] : null;

  useEffect(() => {
    if (game.hydrated && !major) navigate({ to: "/major" });
  }, [game.hydrated, major, navigate]);

  if (!major) return null;

  const coreStats = major.id === "law" ? [
    { label: "精力", value: game.stats.energy ?? 0, color: "var(--v4-blue)", icon: BatteryMedium },
    { label: "专业积累", value: game.stats.professionalAccumulation ?? 0, color: "var(--v4-coral)", icon: BookOpenCheck },
    { label: "机会", value: game.stats.opportunity ?? 0, color: "var(--v4-mint)", icon: KeyRound },
  ] : [
    { label: "精力", value: game.stats.energy ?? 0, color: "var(--v4-blue)", icon: BatteryMedium },
    { label: "专业认同", value: game.stats.obsession ?? 0, color: "var(--v4-coral)", icon: BookOpenCheck },
    { label: "未来筹码", value: Math.round(((game.stats.gpaWill ?? 0) + (game.stats.careerFantasy ?? 0)) / 2), color: "var(--v4-mint)", icon: KeyRound },
  ];
  const lawTrait = major.id === "law" ? getLawTrait(game.initialTrait) : null;

  const topBar = (
    <header className="v4-topbar">
      <button className="v4-icon-button" aria-label="返回专业选择" onClick={() => navigate({ to: "/major" })}><ArrowLeft size={19} /></button>
      <div><div className="v4-title text-[19px]">入学确认</div><div className="mt-0.5 text-[11px] text-[var(--v4-muted)]">最后看一眼，然后真的去读</div></div>
    </header>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div className="v4-scroll">
        <div className="v4-detail">
          <div className="flex items-center gap-4 rounded-[8px] border-[1.5px] border-[var(--v4-ink)] bg-white p-4">
            <MajorMark id={major.id} size={64} />
            <div className="min-w-0">
              <div className="text-[12px] font-bold text-[var(--v4-muted)]">{game.characterName} 的本科录取结果</div>
              <h1 className="v4-title mt-1 text-[28px] leading-tight">{major.name}</h1>
              <div className="mt-1 text-[12px] text-[var(--v4-muted)]">云上大学 · 四年制本科</div>
            </div>
          </div>

          <p className="m-0 text-[14px] leading-[1.75] text-[var(--v4-muted)]">{major.intro?.body?.split("\n")[0] ?? major.card?.description}</p>

          {lawTrait && <section className="v4-law-trait"><div className="text-[10px] font-bold text-[var(--v4-muted)]">本局随机入学状态</div><h2>{lawTrait.title}</h2><p>{lawTrait.description}</p></section>}

          {major.id === "law" && game.lawArchive.runs > 1 && <section className="v4-detail-section">
            <h3 className="v4-title">带一条过来人记忆</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--v4-muted)]">你已经替自己读过一次法学。这一局可以带走一项轻量经验，不会替你决定路线。</p>
            <div className="mt-3 grid gap-2">{LAW_MEMORIES.map((memory) => <button className={`v4-memory-choice ${game.legacyMemory === memory.id ? "is-selected" : ""}`} key={memory.id} onClick={() => gameStore.chooseLawMemory(memory.id)}><span><strong>{memory.title}</strong><small>{memory.description}</small></span>{game.legacyMemory === memory.id && <span>已携带</span>}</button>)}</div>
          </section>}

          <div className="grid grid-cols-3 gap-2">
            {coreStats.map(({ label, value, color, icon: Icon }) => (
              <div className="v4-stat" key={label}>
                <div className="v4-stat-label"><Icon size={13} />{label}</div>
                <strong>{Math.round(value)}</strong>
                <div className="v4-stat-track"><div className="v4-stat-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} /></div>
              </div>
            ))}
          </div>

          <section className="v4-detail-section">
            <h3 className="v4-title">未来四年大概率会遇到</h3>
            <ul>{(major.painPoints ?? []).slice(0, 4).map((item: string) => <li key={item}>{item}</li>)}</ul>
          </section>

          <div className="rounded-[8px] bg-[var(--v4-soft)] p-3 text-[12px] leading-relaxed text-[var(--v4-muted)]">提示：这不是专业测评，也没有标准答案。选你当下最想选的，后果才会像你自己的故事。</div>
        </div>
      </div>
      <div className="border-t border-[var(--v4-line)] p-4">
        <button className="v4-primary w-full" onClick={() => navigate({ to: "/semester" })}>从大一上开始<ArrowRight size={19} /></button>
      </div>
    </PhoneFrame>
  );
}
