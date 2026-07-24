import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BatteryMedium, BookOpenCheck, History, KeyRound, Sparkles, UserRound, X } from "lucide-react";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { EventCampusArt } from "@/components/game/CampusArt";
import { EventCard } from "@/components/ui/EventCard";
import { gameStore, useGameState, currentEventOf, currentSemesterLabel } from "@/lib/gameStore";
import { totalSemesters } from "@/data/script/semesterMeta";
import { majorById } from "@/data/script/majorCatalog";
import { getLawTrait } from "@/lib/lawRoguelite";
import { getCSStartTrait } from "@/lib/computerScienceRoguelite";
import { getClinicalStartTrait } from "@/lib/clinicalMedicineRoguelite";
import { getChineseStartTrait } from "@/lib/chineseLiteratureRoguelite";
import { getAccountingStartTrait } from "@/lib/accountingRoguelite";
import { canEnterMajorGame, getMajorExperienceConfig } from "@/data/majorExperienceConfig";

export const Route = createFileRoute("/semester")({ component: SemesterPage });

function SemesterPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? majorById[game.majorId] : null;
  const experience = getMajorExperienceConfig(game.majorId);
  const [feedback, setFeedback] = useState<{ event: any; choice: any } | null>(null);
  const [drawer, setDrawer] = useState<"none" | "profile" | "log">("none");

  useEffect(() => {
    if (!game.hydrated) return;
    if (!experience || !major) navigate({ to: "/major" });
    else if (!canEnterMajorGame(game.majorId)) {
      navigate({ to: "/major-preview/$majorId", params: { majorId: game.majorId } });
    }
  }, [experience, game.hydrated, game.majorId, major, navigate]);
  useEffect(() => {
    if (canEnterMajorGame(game.majorId)) void gameStore.ensureRuntimeData();
  }, [game.majorId, game.currentEventId, game.currentEventData]);
  useEffect(() => {
    if (game.finished) navigate({ to: "/result" });
    else if (game.midwayFinished) navigate({ to: "/midway-result" });
  }, [game.finished, game.midwayFinished, navigate]);

  const currentEvent = useMemo(() => currentEventOf(game), [game]);
  if (!major || !experience || !canEnterMajorGame(game.majorId)) return null;

  const confirmNext = async () => {
    if (!feedback) return;
    await gameStore.applyChoice(feedback.choice);
    setFeedback(null);
  };

  const coreStats = getCoreStats(game.stats, game.majorId);
  const topBar = (
    <header className="v4-topbar !items-start">
      <button className="v4-icon-button" aria-label="返回首页" onClick={() => navigate({ to: "/" })}><ArrowLeft size={19} /></button>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="v4-title truncate text-[18px]">{currentSemesterLabel(game)}</div>
          <span className="shrink-0 text-[11px] font-bold text-[var(--v4-muted)]">{game.semesterIdx + 1} / {totalSemesters(game.majorId)}</span>
        </div>
        <div className="mt-1 truncate text-[11px] text-[var(--v4-muted)]">{major.name} · {game.characterName}</div>
        <div
          className="v4-progress mt-2"
          style={{ gridTemplateColumns: `repeat(${totalSemesters(game.majorId)}, minmax(0, 1fr))` }}
          aria-label={`本科${experience.graduationYear}年进度`}
        >
          {Array.from({ length: totalSemesters(game.majorId) }).map((_, index) => <span key={index} className={index < game.semesterIdx ? "is-done" : index === game.semesterIdx ? "is-current" : ""} />)}
        </div>
      </div>
    </header>
  );

  const bottomBar = (
    <footer className="grid grid-cols-2 gap-2 border-t border-[var(--v4-line)] bg-[var(--v4-paper)] p-3">
      <button className="v4-secondary" onClick={() => setDrawer("profile")}><UserRound size={16} />我的状态</button>
      <button className="v4-secondary" onClick={() => setDrawer("log")}><History size={16} />走过的路</button>
    </footer>
  );

  return (
    <PhoneFrame topBar={topBar} bottomBar={bottomBar}>
      <div className="v4-hud">
        {coreStats.map((stat) => <CoreStat key={stat.label} {...stat} />)}
      </div>

      <div className="v4-semester-content">
        {["law", "computer_science", "clinical_medicine", "chinese_language_literature", "accounting"].includes(game.majorId) && game.pendingTrend && <div className="v4-law-trend"><strong>趋势观察</strong><span>{game.pendingTrend}</span></div>}
        {currentEvent ? (
          <>
            <EventCampusArt majorId={major.id} mood={currentEvent.type === "gg_check" ? "crisis" : "thinking"} />
            <EventCard event={currentEvent} onPick={(choice) => setFeedback({ event: currentEvent, choice })} />
          </>
        ) : (
          <div className="grid min-h-[360px] place-items-center text-center">
            <div><div className="v4-title text-[18px]">教务系统正在加载</div><div className="mt-2 text-[12px] text-[var(--v4-muted)]">它一直不快，但一般还能用。</div></div>
          </div>
        )}
      </div>

      {feedback && <FeedbackSheet event={feedback.event} choice={feedback.choice} onClose={() => setFeedback(null)} onNext={confirmNext} />}
      {!feedback && game.pendingPortraits.length > 0 && (
        <PortraitModal portraits={game.pendingPortraits} onClose={() => gameStore.dismissPortraits()} />
      )}
      {game.pendingReviveReason && !feedback && <ReviveModal onAccept={() => gameStore.acceptRevive()} onDecline={() => { gameStore.declineRevive(); navigate({ to: "/midway-result" }); }} />}
      {drawer !== "none" && <InfoDrawer type={drawer} onClose={() => setDrawer("none")} />}
    </PhoneFrame>
  );
}

function PortraitModal({
  portraits,
  onClose,
}: {
  portraits: Array<{ id: string; title: string; description: string; evidenceText?: string }>;
  onClose: () => void;
}) {
  return (
    <div className="v4-overlay !items-center">
      <div className="v4-modal v4-portrait-modal">
        <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--v4-coral)]">
          <Sparkles size={15} />你身上正在长出的东西
        </div>
        <div className="mt-4 grid gap-3">
          {portraits.slice(0, 2).map((portrait) => (
            <section key={portrait.id}>
              <h3>{portrait.title}</h3>
              <p>{portrait.description}</p>
              {portrait.evidenceText && <small>{portrait.evidenceText}</small>}
            </section>
          ))}
        </div>
        <button className="v4-primary mt-4 w-full" onClick={onClose}>继续看看自己会变成谁</button>
      </div>
    </div>
  );
}

function getCoreStats(stats: Record<string, number>, majorId?: string) {
  if (majorId === "law") {
    return [
      { label: "精力", value: stats.energy ?? 0, color: "var(--v4-blue)", icon: BatteryMedium },
      { label: "专业积累", value: stats.professionalAccumulation ?? 0, color: "var(--v4-coral)", icon: BookOpenCheck },
      { label: "机会", value: stats.opportunity ?? 0, color: "var(--v4-mint)", icon: KeyRound },
    ];
  }
  if (majorId === "computer_science") {
    return [
      { label: "精力", value: stats.energy ?? 0, color: "var(--v4-blue)", icon: BatteryMedium },
      { label: "技术积累", value: stats.technicalAccumulation ?? 0, color: "var(--v4-coral)", icon: BookOpenCheck },
      { label: "项目机会", value: stats.projectOpportunity ?? 0, color: "var(--v4-mint)", icon: KeyRound },
    ];
  }
  if (majorId === "clinical_medicine") {
    return [
      { label: "精力", value: stats.energy ?? 0, color: "var(--v4-blue)", icon: BatteryMedium },
      { label: "医学积累", value: stats.medicalAccumulation ?? 0, color: "var(--v4-coral)", icon: BookOpenCheck },
      { label: "临床机会", value: stats.clinicalOpportunity ?? 0, color: "var(--v4-mint)", icon: KeyRound },
    ];
  }
  if (majorId === "chinese_language_literature") {
    return [
      { label: "精力", value: stats.energy ?? 0, color: "var(--v4-blue)", icon: BatteryMedium },
      { label: "文本积累", value: stats.textAccumulation ?? 0, color: "var(--v4-coral)", icon: BookOpenCheck },
      { label: "表达机会", value: stats.expressionOpportunity ?? 0, color: "var(--v4-mint)", icon: KeyRound },
    ];
  }
  if (majorId === "accounting") {
    return [
      { label: "精力", value: stats.energy ?? 0, color: "var(--v4-blue)", icon: BatteryMedium },
      { label: "专业积累", value: stats.accountingKnowledge ?? 0, color: "var(--v4-coral)", icon: BookOpenCheck },
      { label: "实务机会", value: stats.practicalOpportunity ?? 0, color: "var(--v4-mint)", icon: KeyRound },
    ];
  }
  return [
    { label: "精力", value: stats.energy ?? 0, color: "var(--v4-blue)", icon: BatteryMedium },
    { label: "专业认同", value: Math.round(((stats.obsession ?? 0) + (100 - (stats.escapeImpulse ?? 0))) / 2), color: "var(--v4-coral)", icon: BookOpenCheck },
    { label: "未来筹码", value: Math.round(((stats.gpaWill ?? 0) + (stats.careerFantasy ?? 0)) / 2), color: "var(--v4-mint)", icon: KeyRound },
  ];
}

function CoreStat({ label, value, color, icon: Icon }: ReturnType<typeof getCoreStats>[number]) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="v4-stat">
      <div className="v4-stat-label"><Icon size={13} />{label}</div>
      <strong>{safe}</strong>
      <div className="v4-stat-track"><div className="v4-stat-fill" style={{ width: `${safe}%`, background: color }} /></div>
    </div>
  );
}

function FeedbackSheet({ event, choice, onClose, onNext }: { event: any; choice: any; onClose: () => void; onNext: () => void }) {
  const keepsConsequencesHidden = ["law_", "computer_science_", "clinical_", "chinese_", "accounting_"].some((prefix) => event.id?.startsWith(prefix));
  const consequenceHint = event.id?.startsWith("accounting_")
    ? "这次选择已经记进本局，后面的凭证、表格、实习或岗位可能再次提起它。"
    : event.id?.startsWith("chinese_")
    ? "这次选择已经记进本局，后面的论文、投稿或职业入口可能再次提起它。"
    : "这次选择已经进入卷宗，之后可能再次出现。";
  const deltas = keepsConsequencesHidden ? [] : visibleDeltas(choice);
  return (
    <div className="v4-overlay">
      <div className="v4-sheet">
        <div className="v4-sheet-handle" />
        <div className="flex items-start justify-between gap-4">
          <div><div className="text-[11px] font-bold text-[var(--v4-muted)]">你选择了</div><div className="v4-title mt-1 text-[19px] leading-snug">{choice.text}</div></div>
          <button className="v4-icon-button" aria-label="返回选择" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="v4-feedback-result">{choice.feedback || choice.resultText || event.description || "事情就这样发生了。"}</div>
        {keepsConsequencesHidden && <div className="mb-3 text-[11px] font-bold text-[var(--v4-muted)]">{consequenceHint}</div>}
        {deltas.length > 0 && <div className="v4-delta-row">{deltas.map((delta) => <span className={`v4-delta ${delta.value > 0 ? "positive" : "negative"}`} key={delta.label}>{delta.label} {delta.value > 0 ? "+" : ""}{delta.value}</span>)}</div>}
        <button className="v4-primary w-full" onClick={onNext}>接受这个结果，继续</button>
      </div>
    </div>
  );
}

function visibleDeltas(choice: any) {
  const stats = choice.effects?.stats ?? choice.statChanges ?? {};
  const rows = [
    { label: "精力", value: Number(stats.energy ?? 0) },
    { label: "专业认同", value: Number(stats.obsession ?? 0) - Number(stats.escapeImpulse ?? 0) },
    { label: "未来筹码", value: Math.round((Number(stats.gpaWill ?? 0) + Number(stats.careerFantasy ?? 0)) / 2) },
  ];
  return rows.filter((row) => row.value !== 0);
}

function InfoDrawer({ type, onClose }: { type: "profile" | "log"; onClose: () => void }) {
  const game = useGameState();
  const major = majorById[game.majorId];
  const discovered = game.discoveries[game.majorId]?.length ?? 0;
  const discoverableTotal = game.discoverableTotals[game.majorId] ?? 0;
  const lawPersona = game.majorId === "law" ? revealedLawPersona(game.hiddenStats) : null;
  const csPersona = game.majorId === "computer_science" ? revealedCSPersona(game.hiddenStats) : null;
  const lawTrait = game.majorId === "law" ? getLawTrait(game.initialTrait) : null;
  const csTrait = game.majorId === "computer_science" ? getCSStartTrait(game.initialTrait) : null;
  const clinicalTrait = game.majorId === "clinical_medicine" ? getClinicalStartTrait(game.initialTrait) : null;
  const chineseTrait = game.majorId === "chinese_language_literature" ? getChineseStartTrait(game.initialTrait) : null;
  const accountingTrait = game.majorId === "accounting" ? getAccountingStartTrait(game.initialTrait) : null;
  return (
    <div className="v4-overlay">
      <div className="v4-sheet">
        <div className="v4-sheet-handle" />
        <div className="flex items-center justify-between">
          <div className="v4-title text-[20px]">{type === "profile" ? "我的状态" : "走过的路"}</div>
          <button className="v4-icon-button" aria-label="关闭" onClick={onClose}><X size={18} /></button>
        </div>
        {type === "profile" ? (
          <div className="mt-4 grid gap-3">
            <div className="v4-save-line"><UserRound size={18} /><span><strong>{game.characterName}</strong> · {major?.name} · {currentSemesterLabel(game)}</span></div>
            <div className="grid grid-cols-3 gap-2">{getCoreStats(game.stats, game.majorId).map((stat) => <CoreStat key={stat.label} {...stat} />)}</div>
            {lawTrait && <div className="v4-detail-section"><div className="text-[10px] font-bold text-[var(--v4-muted)]">本局入学状态</div><div className="mt-1 text-[13px] font-bold">{lawTrait.title}</div><div className="mt-1 text-[11px] leading-relaxed text-[var(--v4-muted)]">{lawTrait.description}</div></div>}
            {csTrait && <div className="v4-detail-section"><div className="text-[10px] font-bold text-[var(--v4-muted)]">本局开局状况</div><div className="mt-1 text-[13px] font-bold">{csTrait.title}</div><div className="mt-1 text-[11px] leading-relaxed text-[var(--v4-muted)]">{csTrait.description}</div></div>}
            {clinicalTrait && <div className="v4-detail-section"><div className="text-[10px] font-bold text-[var(--v4-muted)]">本局入学变量</div><div className="mt-1 text-[13px] font-bold">{clinicalTrait.title}</div><div className="mt-1 text-[11px] leading-relaxed text-[var(--v4-muted)]">{clinicalTrait.description}</div></div>}
            {chineseTrait && <div className="v4-detail-section"><div className="text-[10px] font-bold text-[var(--v4-muted)]">本局入学状态</div><div className="mt-1 text-[13px] font-bold">{chineseTrait.title}</div><div className="mt-1 text-[11px] leading-relaxed text-[var(--v4-muted)]">{chineseTrait.description}</div></div>}
            {accountingTrait && <div className="v4-detail-section"><div className="text-[10px] font-bold text-[var(--v4-muted)]">本局入学状态</div><div className="mt-1 text-[13px] font-bold">{accountingTrait.title}</div><div className="mt-1 text-[11px] leading-relaxed text-[var(--v4-muted)]">{accountingTrait.description}</div></div>}
            {game.majorId === "law" && <div className="v4-detail-section"><div className="text-[10px] font-bold text-[var(--v4-muted)]">当前趋势</div><div className="mt-1 text-[13px] font-bold">{lawPersona ?? "路线尚未收窄"}</div><div className="mt-1 text-[11px] leading-relaxed text-[var(--v4-muted)]">这里只给模糊提示。最终人格会综合路线、关键选择和特殊经历结算。</div></div>}
            {game.majorId === "computer_science" && <div className="v4-detail-section"><div className="text-[10px] font-bold text-[var(--v4-muted)]">当前构筑</div><div className="mt-1 text-[13px] font-bold">{csPersona}</div><div className="mt-1 text-[11px] leading-relaxed text-[var(--v4-muted)]">这里只显示模糊倾向。最终路线和人格会由项目、排错习惯与机会共同结算。</div></div>}
            {game.majorId === "clinical_medicine" && <div className="v4-detail-section"><div className="text-[10px] font-bold text-[var(--v4-muted)]">当前构筑</div><div className="mt-1 text-[13px] font-bold">医学路线仍在收窄</div><div className="mt-1 text-[11px] leading-relaxed text-[var(--v4-muted)]">最终路线会综合医学积累、临床机会、关闭的入口与五年内反复出现的选择。</div></div>}
            {game.majorId === "chinese_language_literature" && <div className="v4-detail-section"><div className="text-[10px] font-bold text-[var(--v4-muted)]">当前构筑</div><div className="mt-1 text-[13px] font-bold">文本路线仍在收窄</div><div className="mt-1 text-[11px] leading-relaxed text-[var(--v4-muted)]">最终路线会综合文本积累、表达机会、关闭的入口与四年里反复出现的选择。</div></div>}
            {game.majorId === "accounting" && <div className="v4-detail-section"><div className="text-[10px] font-bold text-[var(--v4-muted)]">当前构筑</div><div className="mt-1 text-[13px] font-bold">账表路线仍在收窄</div><div className="mt-1 text-[11px] leading-relaxed text-[var(--v4-muted)]">最终结果会综合复核习惯、风险边界、实务经历与四年里反复出现的选择。</div></div>}
            <div className="text-[12px] leading-relaxed text-[var(--v4-muted)]">本局经历 {game.history.length} 个事件，累计发现 {discovered}{discoverableTotal ? ` / ${discoverableTotal}` : ""} 个事件，解锁 {game.achievements.length} 个记录。</div>
          </div>
        ) : (
          <div className="mt-4 grid gap-2">
            {game.history.length === 0 && <div className="py-8 text-center text-[12px] text-[var(--v4-muted)]">还没做出第一个决定。</div>}
            {game.history.map((item, index) => (
              <div className="v4-detail-section" key={`${item.title}-${index}`}>
                <div className="text-[10px] font-bold text-[var(--v4-muted)]">{item.semester}</div>
                <div className="mt-1 text-[13px] font-bold">{item.title}</div>
                <div className="mt-1 text-[12px] leading-relaxed text-[var(--v4-muted)]">你选择：{item.choice}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function revealedLawPersona(hiddenStats: Record<string, number>) {
  const candidates = [
    { label: "论证上瘾型", value: hiddenStats.lawTheory ?? 0 },
    { label: "证据优先型", value: hiddenStats.lawEvidence ?? 0 },
    { label: "依法逃生型", value: hiddenStats.lawEscape ?? 0 },
  ].sort((a, b) => b.value - a.value);
  return candidates[0].value >= 2 ? candidates[0].label : null;
}

function revealedCSPersona(hiddenStats: Record<string, number>) {
  const candidates = [
    { label: "排错耐心正在形成", value: hiddenStats.debugPatience ?? 0 },
    { label: "交付优先倾向上升", value: hiddenStats.deliveryFirst ?? 0 },
    { label: "DDL 爆发模式活跃", value: hiddenStats.ddlBurst ?? 0 },
    { label: "团队整合倾向上升", value: hiddenStats.teamRepair ?? 0 },
    { label: "技术栈探索范围扩大", value: hiddenStats.stackTourism ?? 0 },
  ].sort((a, b) => b.value - a.value);
  return candidates[0]?.value > 55 ? candidates[0].label : "技术路线尚未收窄";
}

function ReviveModal({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="v4-overlay !items-center">
      <div className="v4-modal">
        <div className="text-[11px] font-bold text-[var(--v4-red)]">状态预警</div>
        <div className="v4-title mt-1 text-[22px]">这一局快撑不住了</div>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--v4-muted)]">你可以接受现在的结局，也可以使用一次“嘴硬续命”：先缓一口气，降低跑路冲动，再继续往下读。</p>
        <div className="mt-5 grid grid-cols-2 gap-2"><button className="v4-secondary" onClick={onDecline}>到这里也行</button><button className="v4-primary" onClick={onAccept}>再撑一学期</button></div>
      </div>
    </div>
  );
}
