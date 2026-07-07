import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { SceneStage } from "@/components/game/SceneStage";
import { pickEvents, type EventOption, type GameEvent, EVENTS } from "@/data/events";
import { getMajorById } from "@/data/majors";
import {
  gameStore,
  phaseLabel,
  useGameState,
  VISIBLE_STATS,
  TOTAL_STEPS,
} from "@/lib/gameStore";
import { SemesterTimeline } from "@/components/ui/SemesterTimeline";
import { EventCard, EffectChip } from "@/components/ui/EventCard";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelPanel } from "@/components/ui/PixelPanel";

export const Route = createFileRoute("/semester")({ component: SemesterPage });

function SemesterPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? getMajorById(game.majorId) : null;

  const [feedback, setFeedback] = useState<{ option: EventOption; eventTitle: string } | null>(null);
  const [drawer, setDrawer] = useState<"none" | "profile" | "log">("none");

  useEffect(() => {
    if (!game.majorId) navigate({ to: "/major" });
  }, [game.majorId, navigate]);
  useEffect(() => {
    if (game.finished) navigate({ to: "/result" });
  }, [game.finished, navigate]);

  const currentEvent = useMemo<GameEvent>(
    () => pickEvents(game.step, 1)[0] ?? EVENTS[0],
    [game.step],
  );

  const onPick = (opt: EventOption) => setFeedback({ option: opt, eventTitle: currentEvent.title });

  const confirmNext = () => {
    if (!feedback) return;
    gameStore.applyEffects(feedback.option.effects);
    gameStore.logEvent({
      step: game.step + 1,
      phase: phaseLabel(game),
      title: feedback.eventTitle,
      choice: feedback.option.label,
    });
    const mhDelta = feedback.option.effects.find((e) => e.key === "mouthHard")?.delta ?? 0;
    if (game.stats.mouthHard + mhDelta >= 80) {
      gameStore.addAchievement({ id: "mouth_iron", label: "嘴硬续命" });
    }
    setFeedback(null);
    gameStore.advanceStep();
  };

  if (!major) return null;

  const topBar = (
    <div className="border-b-[3px] border-ink bg-ink text-cream px-3 py-1.5 flex items-center gap-2">
      <button
        onClick={() => navigate({ to: "/" })}
        className="text-[11px] px-2 py-0.5 border-2 border-cream"
      >
        ⌂
      </button>
      <div className="min-w-0">
        <div className="font-display text-[13px] leading-none truncate">{phaseLabel(game)}</div>
        <div className="text-[9px] text-cream/70 leading-none mt-0.5 truncate">
          {major.name} · {game.school}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <span className="font-display text-[11px] tabular-nums">
          {Math.min(game.step + 1, TOTAL_STEPS)} / {TOTAL_STEPS}
        </span>
        <button
          onClick={() => {
            gameStore.set({ finished: true });
            navigate({ to: "/result" });
          }}
          className="text-[10px] px-2 py-0.5 border-2 border-cream bg-cherry text-cream"
        >
          结束
        </button>
      </div>
    </div>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div className="flex flex-col h-full">
        {/* ============ 学期时间线 ============ */}
        <div className="px-2.5 pt-2 pb-1.5 border-b-2 border-ink/20 bg-cream">
          <SemesterTimeline year={game.year} semester={game.semester} />
        </div>

        {/* ============ HUD：6 项明面数值 ============ */}
        <div className="px-2.5 pt-1.5 pb-1.5 border-b-2 border-ink/20 bg-cream">
          <div className="grid grid-cols-6 gap-1">
            {VISIBLE_STATS.map((s) => (
              <HudCell key={s.key} short={s.short} value={game.stats[s.key]} color={s.color} />
            ))}
          </div>
        </div>

        {/* ============ 主场景 ============ */}
        <div className="px-2.5 pt-2">
          <SceneStage scene={currentEvent.scene} badge={currentEvent.category} />
        </div>

        {/* ============ 事件卡 ============ */}
        <div className="flex-1 min-h-0 px-2.5 pt-2 pb-2 flex flex-col gap-2">
          <EventCard event={currentEvent} onPick={onPick} />

          {/* 目标 + 抽屉入口 */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setDrawer("profile")}
              className="pixel-tab !justify-center py-1"
            >
              档案
            </button>
            <button
              onClick={() => setDrawer("log")}
              className="pixel-tab !justify-center py-1"
            >
              记录 · {game.history.length}
            </button>
            <button
              onClick={() => {
                setFeedback(null);
                gameStore.advanceStep();
              }}
              className="pixel-tab !justify-center py-1"
              title="跳过本事件"
            >
              跳过 ▷
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <FeedbackSheet
          option={feedback.option}
          eventTitle={feedback.eventTitle}
          onNext={confirmNext}
        />
      )}

      {drawer !== "none" && (
        <DrawerSheet onClose={() => setDrawer("none")}>
          {drawer === "profile" ? <CharacterPanel /> : <LogDrawer />}
        </DrawerSheet>
      )}
    </PhoneFrame>
  );
}

function HudCell({ short, value, color }: { short: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="w-full bar-track !h-2">
        <div className="bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <div className="flex items-center gap-0.5 leading-none">
        <span className="text-[9px] text-ink/70">{short}</span>
        <span className="font-display text-[10px] tabular-nums">{Math.round(value)}</span>
      </div>
    </div>
  );
}

function FeedbackSheet({
  option, eventTitle, onNext,
}: {
  option: EventOption;
  eventTitle: string;
  onNext: () => void;
}) {
  return (
    <>
      <div className="absolute inset-0 z-40 bg-ink/50" />
      <div className="absolute inset-x-0 bottom-0 z-50 sheet-panel p-3 pb-5 animate-pop-in max-h-[80%] overflow-y-auto">
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/40" />
        <div className="text-[10px] font-display tracking-widest text-ink/60">系统记录</div>
        <div className="mt-1 font-display text-[15px] leading-tight">
          {eventTitle} · {option.label}
        </div>
        <PixelPanel size="sm" className="mt-2" bodyClassName="p-2">
          <div className="text-[10px] text-ink/60 mb-1">数值变化</div>
          <div className="flex flex-wrap gap-1.5">
            {option.effects.map((e, i) => (
              <EffectChip key={i} effect={e} kind={e.delta >= 0 ? "gain" : "cost"} />
            ))}
          </div>
        </PixelPanel>
        <div className="diag-note mt-3">
          <div className="text-[10px] font-display tracking-widest text-ink/60 mb-0.5">
            系统吐槽
          </div>
          {option.feedback}
        </div>
        <PixelButton variant="primary" size="block" className="mt-3" onClick={onNext}>
          进入下一周 →
        </PixelButton>
      </div>
    </>
  );
}

function DrawerSheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <button
        aria-label="关闭"
        onClick={onClose}
        className="absolute inset-0 z-40 bg-ink/40"
      />
      <div className="absolute inset-x-0 bottom-0 z-50 sheet-panel p-3 pb-5 animate-pop-in max-h-[78%] overflow-y-auto">
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/40" />
        {children}
      </div>
    </>
  );
}

function LogDrawer() {
  const game = useGameState();
  return (
    <div>
      <div className="font-display text-[15px] mb-2">事件记录</div>
      {game.history.length === 0 && (
        <div className="text-[12px] text-ink/60">还没有记录。</div>
      )}
      <ul className="space-y-1.5">
        {game.history.map((h, i) => (
          <li key={i} className="pixel-border-sm !shadow-none bg-cream p-2 text-[12px]">
            <div className="flex justify-between text-[10px] text-ink/60">
              <span>{h.phase}</span>
              <span>#{h.step}</span>
            </div>
            <div className="font-display text-[13px] mt-0.5">{h.title}</div>
            <div className="text-[11px] text-ink/80">→ {h.choice}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
