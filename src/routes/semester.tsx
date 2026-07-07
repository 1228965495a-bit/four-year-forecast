import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { SceneStage } from "@/components/game/SceneStage";
import { PixelAvatar } from "@/components/game/PixelIcon";
import {
  EVENTS,
  pickEvents,
  type EventEffect,
  type GameEvent,
  type EventOption,
} from "@/data/events";
import { getMajorById } from "@/data/majors";
import {
  gameStore,
  phaseLabel,
  useGameState,
  VISIBLE_STATS,
  TOTAL_STEPS,
  STAT_META,
  type CharStats,
} from "@/lib/gameStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/semester")({ component: SemesterPage });

function SemesterPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? getMajorById(game.majorId) : null;

  const [feedback, setFeedback] = useState<{
    option: EventOption;
    eventTitle: string;
  } | null>(null);
  const [drawer, setDrawer] = useState<"none" | "profile" | "log">("none");

  useEffect(() => {
    if (!game.majorId) navigate({ to: "/major" });
  }, [game.majorId, navigate]);
  useEffect(() => {
    if (game.finished) navigate({ to: "/result" });
  }, [game.finished, navigate]);

  const currentEvent = useMemo<GameEvent>(() => {
    return pickEvents(game.step, 1)[0] ?? EVENTS[0];
  }, [game.step]);

  const onPick = (opt: EventOption) => {
    setFeedback({ option: opt, eventTitle: currentEvent.title });
  };

  const confirmNext = () => {
    if (!feedback) return;
    gameStore.applyEffects(feedback.option.effects);
    gameStore.logEvent({
      step: game.step + 1,
      phase: phaseLabel(game),
      title: feedback.eventTitle,
      choice: feedback.option.label,
    });
    // 挂成就示例
    if (game.stats.mouthHard + (feedback.option.effects.find(e=>e.key==="mouthHard")?.delta ?? 0) >= 80) {
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
        aria-label="返回主页"
      >
        ⌂
      </button>
      <div className="min-w-0">
        <div className="font-display text-[13px] leading-none truncate">
          {phaseLabel(game)}
        </div>
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
          className="text-[10px] px-2 py-1 border-2 border-cream bg-cherry text-cream ml-1"
        >
          结束
        </button>
      </div>
    </div>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div className="flex flex-col h-full">
        {/* ============ 顶部轻 HUD ============ */}
        <div className="px-2.5 pt-2 pb-1.5 border-b-2 border-ink/20 bg-cream">
          <div className="grid grid-cols-6 gap-1">
            {VISIBLE_STATS.map((s) => (
              <HudCell key={s.key} short={s.short} value={game.stats[s.key]} color={s.color} />
            ))}
          </div>
        </div>

        {/* ============ 中间主场景 ============ */}
        <div className="px-2.5 pt-2">
          <SceneStage scene={currentEvent.scene} badge={currentEvent.category} />
        </div>

        {/* ============ 底部事件面板 ============ */}
        <div className="flex-1 min-h-0 px-2.5 pt-2 pb-2 flex flex-col">
          <div className="event-panel flex-1 flex flex-col">
            <div className="flex items-start gap-2 mb-1.5">
              <span className="pixel-chip !text-[10px] !py-0 bg-cream shrink-0">
                {currentEvent.category}
              </span>
              <h3 className="font-display text-[15px] leading-tight flex-1">
                {currentEvent.title}
              </h3>
            </div>
            <p className="text-[12px] leading-snug text-ink/85 mb-2">
              {currentEvent.description}
            </p>
            <div className="flex-1" />
            <div className="space-y-1.5">
              {currentEvent.options.map((opt, i) => (
                <OptionButton key={i} option={opt} onPick={onPick} />
              ))}
            </div>
          </div>

          {/* 底部次级抽屉入口 */}
          <div className="mt-2 grid grid-cols-2 gap-2">
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
              事件记录 · {game.history.length}
            </button>
          </div>
        </div>
      </div>

      {/* ============ 反馈面板 ============ */}
      {feedback && (
        <FeedbackSheet
          option={feedback.option}
          eventTitle={feedback.eventTitle}
          onNext={confirmNext}
        />
      )}

      {/* ============ 次级抽屉 ============ */}
      {drawer !== "none" && (
        <DrawerSheet onClose={() => setDrawer("none")}>
          {drawer === "profile" ? (
            <ProfileDrawer />
          ) : (
            <LogDrawer />
          )}
        </DrawerSheet>
      )}
    </PhoneFrame>
  );
}

/* ============ 子组件 ============ */

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

function OptionButton({ option, onPick }: { option: EventOption; onPick: (o: EventOption) => void }) {
  return (
    <button onClick={() => onPick(option)} className="option-btn group">
      <div className="flex-1 text-left">
        <div className="font-display text-[13px] leading-snug">{option.label}</div>
        <div className="mt-1 flex flex-wrap gap-1">
          {option.effects.map((e, i) => (
            <EffectChip key={i} effect={e} />
          ))}
        </div>
      </div>
      <span className="option-arrow">▶</span>
    </button>
  );
}

function EffectChip({ effect }: { effect: EventEffect }) {
  const meta = STAT_META.find((m) => m.key === effect.key)!;
  const pos = effect.delta >= 0;
  return (
    <span
      className="inline-flex items-center gap-1 border-2 border-ink px-1 py-[1px] text-[10px] leading-none bg-cream"
      style={{ boxShadow: "1px 1px 0 0 var(--ink)" }}
    >
      <span
        className="inline-block h-1.5 w-1.5"
        style={{ background: meta.color }}
      />
      <span>{meta.short}</span>
      <span className={cn("font-display tabular-nums", pos ? "text-[#2E7A3A]" : "text-[#C1443C]")}>
        {pos ? "+" : ""}{effect.delta}
      </span>
    </span>
  );
}

function FeedbackSheet({
  option,
  eventTitle,
  onNext,
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
        <div className="mt-2 pixel-border-sm !shadow-none bg-cream p-2">
          <div className="text-[10px] text-ink/60 mb-1">数值变化</div>
          <div className="flex flex-wrap gap-1.5">
            {option.effects.map((e, i) => (
              <EffectChip key={i} effect={e} />
            ))}
          </div>
        </div>
        <div className="mt-2 pixel-border-sm !shadow-none bg-sunny/40 p-2 text-[12px] leading-snug">
          <div className="text-[10px] text-ink/60 mb-1 font-display tracking-widest">系统提示</div>
          {option.feedback}
        </div>
        <button
          onClick={onNext}
          className="pixel-btn w-full mt-3 py-2.5 text-[14px]"
          style={{ background: "var(--sage)" }}
        >
          进入下一周 →
        </button>
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
      <div className="absolute inset-x-0 bottom-0 z-50 sheet-panel p-3 pb-5 animate-pop-in max-h-[75%] overflow-y-auto">
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/40" />
        {children}
      </div>
    </>
  );
}

function ProfileDrawer() {
  const game = useGameState();
  const major = game.majorId ? getMajorById(game.majorId) : null;
  if (!major) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="pixel-border-sm !shadow-none overflow-hidden" style={{ width: 48, height: 48 }}>
          <PixelAvatar size={48} />
        </div>
        <div>
          <div className="font-display text-[16px]">{game.characterName}</div>
          <div className="text-[11px] text-ink/70">{major.name} · {game.school}</div>
        </div>
      </div>
      <div>
        <div className="text-[10px] font-display tracking-widest text-ink/60 mb-1">明面属性</div>
        <div className="grid grid-cols-2 gap-2">
          {VISIBLE_STATS.map((s) => (
            <div key={s.key} className="pixel-border-sm !shadow-none bg-cream p-1.5">
              <div className="flex justify-between text-[11px]">
                <span>{s.label}</span>
                <span className="font-display tabular-nums">{Math.round(game.stats[s.key])}</span>
              </div>
              <div className="bar-track !h-2 mt-1">
                <div className="bar-fill" style={{ width: `${game.stats[s.key]}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-display tracking-widest text-ink/60 mb-1">
          本学期目标（示意）
        </div>
        <ul className="text-[12px] space-y-0.5">
          <li>· 绩点求生欲 ≥ 60</li>
          <li>· 精神电量 &gt; 30</li>
          <li>· 完成 1 段实习</li>
        </ul>
      </div>
      <div>
        <div className="text-[10px] font-display tracking-widest text-ink/60 mb-1">
          可能成为…
        </div>
        <div className="flex flex-wrap gap-1">
          {major.endings.slice(0, 4).map((e) => (
            <span key={e} className="pixel-chip !text-[10px] bg-cream">{e}</span>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-display tracking-widest text-ink/60 mb-1">
          成就 · {game.achievements.length}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {game.achievements.length === 0 && (
            <span className="text-[11px] text-ink/60">还没成就，去做点事。</span>
          )}
          {game.achievements.map((a) => (
            <span key={a.id} className="pixel-chip bg-sunny/60 !text-[11px]">★ {a.label}</span>
          ))}
        </div>
      </div>
    </div>
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

export type { CharStats };
