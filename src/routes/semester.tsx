import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GameLayout } from "@/components/game/GameLayout";
import { PixelCard } from "@/components/game/PixelCard";
import { PixelButton } from "@/components/game/PixelButton";
import { StatBar } from "@/components/game/StatBar";
import { SemesterEventCard } from "@/components/game/SemesterEventCard";
import { CharacterStatusPanel } from "@/components/game/CharacterStatusPanel";
import { AchievementBadge } from "@/components/game/AchievementBadge";
import { EVENTS, type GameEvent } from "@/data/events";
import { getMajorById } from "@/data/majors";
import { gameStore, phaseLabel, useGameState } from "@/lib/gameStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/semester")({
  component: SemesterPage,
});

interface Toast {
  id: number;
  text: string;
}

const TIMELINE = [1, 4, 8, 12, 16, 17]; // 17 = 期末周

function SemesterPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? getMajorById(game.majorId) : null;
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!game.majorId) {
      navigate({ to: "/major" });
    }
  }, [game.majorId, navigate]);

  useEffect(() => {
    if (game.finished) navigate({ to: "/result" });
  }, [game.finished, navigate]);

  // 事件抽 4 张，与阶段无关，简单洗牌
  const eventPool = useMemo<GameEvent[]>(() => {
    const arr = [...EVENTS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.year, game.semester, game.week]);

  const totalWeeks = ((game.year - 1) * 2 + (game.semester - 1)) * 16 + game.week;
  const totalTarget = 4 * 2 * 16;
  const progressPct = Math.min(100, (totalWeeks / totalTarget) * 100);

  const pushToast = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1700);
  };

  const pickEvent = (ev: GameEvent) => {
    gameStore.applyEffects(ev.effects);
    gameStore.logEvent({
      week: game.week,
      phase: phaseLabel(game),
      title: ev.title,
      emoji: ev.emoji,
    });
    // 简单成就
    if (ev.id === "study_final") {
      gameStore.addAchievement({ id: "no_fail", label: "0 挂科成就", emoji: "🎯" });
    }
    if (ev.id === "intern") {
      gameStore.addAchievement({ id: "first_intern", label: "第一份实习", emoji: "💼" });
    }
    if (ev.id === "trip") {
      gameStore.addAchievement({ id: "wanderer", label: "校外漫游者", emoji: "🎒" });
    }
    const label = ev.gainLabel ?? ev.title;
    pushToast(`${ev.emoji} ${ev.title}｜${label}`);
    gameStore.advanceWeek(4);
  };

  const diagnosis = useMemo(() => {
    const s = game.stats;
    if (s.mental < 35) return "精神状态告急，建议休学一周去看海。";
    if (s.study > 75 && s.internship > 60) return "两开花选手，前途一片光明。";
    if (s.money < 25) return "已进入吃土模式，请注意生活质量。";
    if (s.social < 30) return "社交电量偏低，室友都快忘了你长什么样。";
    return "稳中有进，注意别把自己卷坏。";
  }, [game.stats]);

  if (!major) return null;

  const currentWeekIdx = TIMELINE.findIndex((w) => game.week <= w);

  return (
    <GameLayout showHome title={`🎮 学期模拟 · ${phaseLabel(game)}`} subtitle={major.name}>
      {/* 顶部 HUD */}
      <PixelCard tone="cream" className="!p-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-6">
          <StatBar label="学业" icon="📘" value={game.stats.study} tone="sky" size="sm" />
          <StatBar label="金钱" icon="💰" value={game.stats.money} tone="sunny" size="sm" />
          <StatBar label="精神" icon="🧠" value={game.stats.mental} tone="cherry" size="sm" />
          <StatBar label="社交" icon="🎈" value={game.stats.social} tone="cherry" size="sm" />
          <StatBar label="实习" icon="💼" value={game.stats.internship} tone="sage" size="sm" />
          <StatBar label="体力" icon="⚡" value={game.stats.energy} tone="tan" size="sm" />
        </div>
      </PixelCard>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* 中间：时间线 + 事件 */}
        <div className="space-y-4">
          {/* 时间线 */}
          <PixelCard tone="sky" className="!p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold">🗓️ 本学期时间线</span>
              <span className="text-ink/70">总进度 {Math.round(progressPct)}%</span>
            </div>
            <div className="flex items-center gap-1">
              {TIMELINE.map((w, i) => (
                <div key={w} className="flex flex-1 items-center">
                  <div
                    className={cn(
                      "pixel-border-sm flex h-8 w-8 items-center justify-center text-[10px] font-bold shrink-0",
                      i <= currentWeekIdx ? "bg-cherry/80" : "bg-cream",
                    )}
                  >
                    {w === 17 ? "期末" : `W${w}`}
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className={cn("mx-1 h-1 flex-1", i < currentWeekIdx ? "bg-cherry" : "bg-ink/20")} />
                  )}
                </div>
              ))}
            </div>
          </PixelCard>

          {/* 事件卡 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-base">🎴 本周可选事件</h3>
              <button
                onClick={() => gameStore.advanceWeek(4)}
                className="pixel-chip hover:bg-sunny/70"
              >
                ⏭ 跳过 4 周
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {eventPool.map((ev) => (
                <SemesterEventCard key={ev.id + game.week} event={ev} onPick={pickEvent} />
              ))}
            </div>
          </div>

          {/* 底部：目标 & 成就 */}
          <div className="grid gap-3 md:grid-cols-2">
            <PixelCard tone="sage">
              <div className="mb-1 text-xs font-semibold">🎯 本学期目标</div>
              <ul className="space-y-1 text-sm">
                <li>· 学业保持在 60 以上</li>
                <li>· 至少完成 1 段实习尝试</li>
                <li>· 精神值不要跌破 30</li>
              </ul>
              <div className="mt-2">
                <StatBar label="学期进度" value={progressPct} tone="sage" />
              </div>
            </PixelCard>
            <PixelCard tone="sunny">
              <div className="mb-1 text-xs font-semibold">🏅 成就进度 · 你可能成为……</div>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {major.endings.map((e) => (
                  <span key={e} className="pixel-chip bg-cream !text-[11px]">{e}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {game.achievements.length === 0 && (
                  <span className="text-xs text-ink/70">还没有成就，去做点事情吧。</span>
                )}
                {game.achievements.map((a) => (
                  <AchievementBadge key={a.id} label={a.label} emoji={a.emoji} />
                ))}
              </div>
            </PixelCard>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <PixelButton variant="ghost" onClick={() => navigate({ to: "/major" })}>
              ← 换个专业
            </PixelButton>
            <PixelButton
              variant="accent"
              onClick={() => {
                gameStore.set({ finished: true });
                navigate({ to: "/result" });
              }}
            >
              🏁 结束模拟看结果
            </PixelButton>
          </div>
        </div>

        {/* 右：角色状态 */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <CharacterStatusPanel game={game} major={major} diagnosis={diagnosis} />
        </div>
      </div>

      {/* Toast 层 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="pixel-border bg-cream px-3 py-2 text-sm animate-toast">
            {t.text}
          </div>
        ))}
      </div>
    </GameLayout>
  );
}
