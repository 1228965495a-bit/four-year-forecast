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
import { EventCard } from "@/components/ui/EventCard";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { PixelButton } from "@/components/ui/PixelButton";

export const Route = createFileRoute("/semester")({ component: SemesterPage });

const LAYOUT_HEIGHT = "calc(100dvh - 98px)";

function SemesterPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? getMajorById(game.majorId) : null;

  const [feedback, setFeedback] = useState<{ option: EventOption; event: GameEvent } | null>(null);
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

  const onPick = (opt: EventOption) => setFeedback({ option: opt, event: currentEvent });

  const confirmNext = () => {
    if (!feedback) return;
    gameStore.applyEffects(feedback.option.effects);
    gameStore.logEvent({
      step: game.step + 1,
      phase: phaseLabel(game),
      title: feedback.event.title,
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
    <div className="border-b-[3px] border-ink bg-ink text-cream px-3 py-3 min-h-[58px] flex items-center gap-2">
      <button
        onClick={() => navigate({ to: "/" })}
        className="text-[12px] px-2 py-1 border-2 border-cream leading-none"
      >
        ⌂
      </button>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[14px] leading-none truncate">{phaseLabel(game)}</div>
        <div className="text-[11px] text-cream/70 leading-none mt-1 truncate">
          {major.name} · {game.school}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-display text-[12px] tabular-nums">
          {Math.min(game.step + 1, TOTAL_STEPS)} / {TOTAL_STEPS}
        </span>
        <button
          onClick={() => {
            gameStore.set({ finished: true });
            navigate({ to: "/result" });
          }}
          className="text-[11px] px-2.5 py-1 border-2 border-cream bg-cherry text-cream leading-none"
        >
          结
        </button>
      </div>
    </div>
  );

  const bottomBar = (
    <div className="border-t-[3px] border-ink bg-cream px-2.5 py-2 grid grid-cols-2 gap-2">
      <button onClick={() => setDrawer("profile")} className="pixel-tab !justify-center py-1.5">
        档案
      </button>
      <button onClick={() => setDrawer("log")} className="pixel-tab !justify-center py-1.5">
        事件记录
      </button>
    </div>
  );

  return (
    <PhoneFrame topBar={topBar} bottomBar={bottomBar}>
      <div className="semester-screen" style={{ height: LAYOUT_HEIGHT }}>
        {/* HUD：6 项明面数值 */}
        <div className="semester-hud">
          <div className="grid grid-cols-3 gap-3">
            {VISIBLE_STATS.map((s) => (
              <HudCell key={s.key} short={s.short} value={game.stats[s.key]} color={s.color} />
            ))}
          </div>
        </div>

        {/* 主场景 */}
        <div className="semester-scene-wrap">
          <SceneStage
            scene={currentEvent.scene}
            badge={currentEvent.category}
            title={currentEvent.title}
            caption={currentEvent.description}
          />
        </div>

        {/* 事件卡（不显示属性变化） */}
        <div className="semester-event-wrap">
          <EventCard event={currentEvent} onPick={onPick} />
        </div>
      </div>

      {feedback && (
        <FeedbackModal
          option={feedback.option}
          event={feedback.event}
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
    <div className="flex flex-col items-center gap-2">
      <div className="w-full hud-bar">
        <div className="hud-bar-fill" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <div className="flex items-baseline justify-center gap-1 leading-none whitespace-nowrap">
        <span className="font-display text-[13px] text-ink/70">{short}</span>
        <span className="font-display text-[16px] tabular-nums">{Math.round(value)}</span>
      </div>
    </div>
  );
}


function FeedbackModal({
  option,
  event,
  onNext,
}: {
  option: EventOption;
  event: GameEvent;
  onNext: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/55" />
      <div className="modal-card relative z-10 w-full max-w-[320px] animate-pop-in">
        <div className="inline-flex items-center border-2 border-ink bg-cream px-2 py-0.5 text-[10px] font-display tracking-wider"
             style={{ boxShadow: "2px 2px 0 0 var(--ink)" }}>
          系统记录
        </div>
        <div className="mt-2.5 font-display text-[16px] leading-tight">{event.title}</div>
        <p className="mt-1.5 text-[12.5px] leading-snug text-ink/85">{option.label}。</p>
        <div className="diag-note mt-3">
          <div className="text-[10px] font-display tracking-widest text-ink/60 mb-0.5">
            系统提示
          </div>
          {option.feedback}
        </div>
        <PixelButton variant="primary" size="block" className="mt-3.5" onClick={onNext}>
          进入下一周 →
        </PixelButton>
      </div>
    </div>
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

