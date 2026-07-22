import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BatteryMedium, Compass, GraduationCap, History, UserRound, X } from "lucide-react";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { EventCampusArt } from "@/components/game/CampusArt";
import { EventCard } from "@/components/ui/EventCard";
import { gameStore, useGameState, currentEventOf, currentSemesterLabel } from "@/lib/gameStore";
import { totalSemesters } from "@/data/script/semesterMeta";
import { majorById } from "@/data/script/majorCatalog";

export const Route = createFileRoute("/semester")({ component: SemesterPage });

function SemesterPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? majorById[game.majorId] : null;
  const [feedback, setFeedback] = useState<{ event: any; choice: any } | null>(null);
  const [drawer, setDrawer] = useState<"none" | "profile" | "log">("none");

  useEffect(() => {
    if (game.hydrated && !game.majorId) navigate({ to: "/major" });
  }, [game.hydrated, game.majorId, navigate]);
  useEffect(() => { void gameStore.ensureRuntimeData(); }, [game.majorId, game.currentEventId, game.currentEventData]);
  useEffect(() => {
    if (game.finished) navigate({ to: "/result" });
    else if (game.midwayFinished) navigate({ to: "/midway-result" });
  }, [game.finished, game.midwayFinished, navigate]);

  const currentEvent = useMemo(() => currentEventOf(game), [game]);
  if (!major) return null;

  const confirmNext = async () => {
    if (!feedback) return;
    await gameStore.applyChoice(feedback.choice);
    setFeedback(null);
  };

  const coreStats = getCoreStats(game.stats);
  const topBar = (
    <header className="v4-topbar !items-start">
      <button className="v4-icon-button" aria-label="返回首页" onClick={() => navigate({ to: "/" })}><ArrowLeft size={19} /></button>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="v4-title truncate text-[18px]">{currentSemesterLabel(game)}</div>
          <span className="shrink-0 text-[11px] font-bold text-[var(--v4-muted)]">{game.semesterIdx + 1} / {totalSemesters()}</span>
        </div>
        <div className="mt-1 truncate text-[11px] text-[var(--v4-muted)]">{major.name} · {game.characterName}</div>
        <div className="v4-progress mt-2" aria-label="本科四年进度">
          {Array.from({ length: totalSemesters() }).map((_, index) => <span key={index} className={index < game.semesterIdx ? "is-done" : index === game.semesterIdx ? "is-current" : ""} />)}
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
      {game.pendingReviveReason && !feedback && <ReviveModal onAccept={() => gameStore.acceptRevive()} onDecline={() => { gameStore.declineRevive(); navigate({ to: "/midway-result" }); }} />}
      {drawer !== "none" && <InfoDrawer type={drawer} onClose={() => setDrawer("none")} />}
    </PhoneFrame>
  );
}

function getCoreStats(stats: Record<string, number>) {
  return [
    { label: "精力", value: stats.energy ?? 0, color: "var(--v4-blue)", icon: BatteryMedium },
    { label: "专业认同", value: Math.round(((stats.obsession ?? 0) + (100 - (stats.escapeImpulse ?? 0))) / 2), color: "var(--v4-coral)", icon: Compass },
    { label: "未来筹码", value: Math.round(((stats.gpaWill ?? 0) + (stats.careerFantasy ?? 0)) / 2), color: "var(--v4-mint)", icon: GraduationCap },
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
  const deltas = visibleDeltas(choice);
  return (
    <div className="v4-overlay">
      <div className="v4-sheet">
        <div className="v4-sheet-handle" />
        <div className="flex items-start justify-between gap-4">
          <div><div className="text-[11px] font-bold text-[var(--v4-muted)]">你选择了</div><div className="v4-title mt-1 text-[19px] leading-snug">{choice.text}</div></div>
          <button className="v4-icon-button" aria-label="返回选择" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="v4-feedback-result">{choice.feedback || choice.resultText || event.description || "事情就这样发生了。"}</div>
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
            <div className="grid grid-cols-3 gap-2">{getCoreStats(game.stats).map((stat) => <CoreStat key={stat.label} {...stat} />)}</div>
            <div className="text-[12px] leading-relaxed text-[var(--v4-muted)]">已经历 {game.history.length} 个事件，解锁 {game.achievements.length} 个记录。隐藏数值仍在影响故事，但不会一直拿出来吓你。</div>
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
