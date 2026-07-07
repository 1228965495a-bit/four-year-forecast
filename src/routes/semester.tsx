import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import {
  IconStudy,
  IconMoney,
  IconMental,
  IconSocial,
  IconIntern,
  IconEnergy,
  PixelAvatar,
} from "@/components/game/PixelIcon";
import { EVENTS, type GameEvent } from "@/data/events";
import { getMajorById } from "@/data/majors";
import {
  gameStore,
  phaseLabel,
  useGameState,
  type CharStats,
} from "@/lib/gameStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/semester")({
  component: SemesterPage,
});

const TIMELINE: { w: number; label: string }[] = [
  { w: 1, label: "W1" },
  { w: 4, label: "W4" },
  { w: 8, label: "W8" },
  { w: 12, label: "W12" },
  { w: 16, label: "W16" },
  { w: 17, label: "期末" },
];

interface Toast {
  id: number;
  text: string;
}

function SemesterPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? getMajorById(game.majorId) : null;
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [charOpen, setCharOpen] = useState(false);

  useEffect(() => {
    if (!game.majorId) navigate({ to: "/major" });
  }, [game.majorId, navigate]);
  useEffect(() => {
    if (game.finished) navigate({ to: "/result" });
  }, [game.finished, navigate]);

  const eventPool = useMemo<GameEvent[]>(() => {
    const arr = [...EVENTS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.year, game.semester, game.week]);

  const totalWeeks =
    ((game.year - 1) * 2 + (game.semester - 1)) * 16 + game.week;
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
    if (ev.id === "study_final")
      gameStore.addAchievement({ id: "no_fail", label: "0 挂科", emoji: "🎯" });
    if (ev.id === "intern")
      gameStore.addAchievement({ id: "first_intern", label: "第一份实习", emoji: "💼" });
    if (ev.id === "trip")
      gameStore.addAchievement({ id: "wanderer", label: "校外漫游者", emoji: "🎒" });
    pushToast(`✦ ${ev.title}｜${ev.gainLabel ?? ""}`);
    gameStore.advanceWeek(4);
  };

  const diagnosis = useMemo(() => {
    const s = game.stats;
    if (s.mental < 35) return "精神状态告急，建议休学一周看海。";
    if (s.study > 75 && s.internship > 60) return "两开花选手，前途光明。";
    if (s.money < 25) return "已进入吃土模式。";
    if (s.social < 30) return "社交电量偏低。";
    return "稳中有进，注意别卷坏了。";
  }, [game.stats]);

  if (!major) return null;
  const currentIdx = TIMELINE.findIndex((t) => game.week <= t.w);

  const topBar = (
    <div className="border-b-[3px] border-ink bg-ink text-cream px-3 py-1.5 flex items-center gap-2">
      <button
        onClick={() => navigate({ to: "/" })}
        className="text-[11px] px-2 py-0.5 border-2 border-cream bg-transparent"
      >
        ⌂
      </button>
      <div>
        <div className="font-display text-[13px] leading-none">
          {phaseLabel(game)}
        </div>
        <div className="text-[9px] text-cream/70 leading-none mt-0.5">
          {major.name} · {game.school}
        </div>
      </div>
      <button
        onClick={() => {
          gameStore.set({ finished: true });
          navigate({ to: "/result" });
        }}
        className="ml-auto text-[10px] px-2 py-1 border-2 border-cream bg-cherry text-cream"
      >
        结束模拟 →
      </button>
    </div>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div className="p-3 space-y-3 pb-6">
        {/* HUD 两行 */}
        <div className="pixel-panel !p-2">
          <div className="grid grid-cols-3 gap-2">
            <HudStat label="学业" val={game.stats.study} icon={<IconStudy />} color="var(--sky)" />
            <HudStat label="金钱" val={game.stats.money} icon={<IconMoney />} color="var(--sunny)" />
            <HudStat label="精神" val={game.stats.mental} icon={<IconMental />} color="var(--cherry)" />
            <HudStat label="社交" val={game.stats.social} icon={<IconSocial />} color="var(--sage)" />
            <HudStat label="实习" val={game.stats.internship} icon={<IconIntern />} color="var(--tan)" />
            <HudStat label="体力" val={game.stats.energy} icon={<IconEnergy />} color="#D9534F" />
          </div>
        </div>

        {/* 时间线 */}
        <div className="pixel-panel !p-2.5 bg-sky/30">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-[12px]">本学期时间线</span>
            <span className="text-[10px] text-ink/70">总进度 {Math.round(progressPct)}%</span>
          </div>
          <div className="flex items-center gap-0.5">
            {TIMELINE.map((t, i) => (
              <div key={t.w} className="flex flex-1 items-center">
                <div
                  className={cn(
                    "pixel-border-sm !shadow-none flex h-7 flex-1 items-center justify-center text-[9px] font-bold",
                    i <= currentIdx ? "bg-cherry text-cream" : "bg-cream"
                  )}
                >
                  {t.label}
                </div>
                {i < TIMELINE.length - 1 && (
                  <div className={cn("h-1 w-1.5", i < currentIdx ? "bg-cherry" : "bg-ink/20")} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 事件卡 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-display text-[13px] flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-cherry" />
              本周可选事件
            </span>
            <button
              onClick={() => gameStore.advanceWeek(4)}
              className="pixel-tab !py-0.5"
            >
              ⏭ 跳过 4 周
            </button>
          </div>
          <div className="space-y-2">
            {eventPool.map((ev) => (
              <EventCard key={ev.id + game.week} event={ev} onPick={pickEvent} />
            ))}
          </div>
        </div>

        {/* 角色状态折叠 */}
        <div className="pixel-panel !p-0 overflow-hidden">
          <button
            onClick={() => setCharOpen((v) => !v)}
            className="w-full flex items-center gap-2 p-2 bg-cream border-b-[3px] border-ink"
          >
            <div className="pixel-border-sm !shadow-none overflow-hidden" style={{ width: 36, height: 36 }}>
              <PixelAvatar size={36} />
            </div>
            <div className="min-w-0 text-left flex-1">
              <div className="font-display text-[13px] truncate">{game.characterName}</div>
              <div className="text-[10px] text-ink/70 truncate">{major.name} · 大{["一","二","三","四"][game.year-1]}</div>
            </div>
            <span className="text-[12px]">{charOpen ? "▲" : "▼"}</span>
          </button>
          {charOpen && (
            <div className="p-2.5 space-y-2 text-[12px]">
              <div className="grid grid-cols-2 gap-2">
                <InfoCell label="姓名" value={game.characterName} />
                <InfoCell label="学校" value={game.school} />
                <InfoCell label="专业" value={major.name} />
                <InfoCell label="年级" value={`大${["一","二","三","四"][game.year-1]}`} />
              </div>
              <div>
                <div className="text-[11px] text-ink/60 mb-1 font-display tracking-widest">专业后遗症</div>
                <div className="flex flex-wrap gap-1">
                  {major.aftereffects.map((a) => (
                    <span key={a} className="pixel-chip bg-cherry/20 !text-[10px]">{a}</span>
                  ))}
                </div>
              </div>
              <div className="pixel-border-sm !shadow-none bg-sage/25 p-2">
                <div className="text-[10px] text-ink/60 mb-0.5">系统诊断</div>
                <div className="text-[12px]">{diagnosis}</div>
              </div>
            </div>
          )}
        </div>

        {/* 底部快捷区 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="pixel-panel-sm !p-2 bg-sunny/40">
            <div className="text-[11px] font-display tracking-widest mb-1">本学期目标</div>
            <ul className="space-y-0.5 text-[11px]">
              <li>· 学业 ≥ 60</li>
              <li>· 完成 1 段实习</li>
              <li>· 精神 &gt; 30</li>
            </ul>
          </div>
          <div className="pixel-panel-sm !p-2 bg-sky/30">
            <div className="text-[11px] font-display tracking-widest mb-1">你可能成为…</div>
            <div className="flex flex-wrap gap-1">
              {major.endings.slice(0, 4).map((e) => (
                <span key={e} className="pixel-chip !text-[10px] bg-cream">{e}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="pixel-panel-sm !p-2">
          <div className="text-[11px] font-display tracking-widest mb-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-sunny" />
            阶段性成就
          </div>
          <div className="flex flex-wrap gap-1.5">
            {game.achievements.length === 0 && (
              <span className="text-[11px] text-ink/60">还没成就，去做点事情。</span>
            )}
            {game.achievements.map((a) => (
              <span key={a.id} className="pixel-chip bg-sunny/60 !text-[11px]">
                ★ {a.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className="pointer-events-none absolute inset-x-0 bottom-16 z-50 flex flex-col items-center gap-1.5 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pixel-panel-sm bg-ink text-cream px-3 py-1.5 text-[12px] animate-toast"
          >
            {t.text}
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

function HudStat({
  label,
  val,
  icon,
  color,
}: {
  label: string;
  val: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="pixel-border-sm !shadow-none bg-cream shrink-0 flex items-center justify-center" style={{ width: 22, height: 22 }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] text-ink/70">{label}</span>
          <span className="font-display text-[11px] ml-auto">{val}</span>
        </div>
        <div className="bar-track !h-1.5 mt-0.5">
          <div className="bar-fill" style={{ width: `${val}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, onPick }: { event: GameEvent; onPick: (e: GameEvent) => void }) {
  const iconLetter = event.title.slice(0, 1);
  return (
    <div className="pixel-panel !p-2.5 flex gap-2.5">
      <div
        className="pixel-border-sm !shadow-none flex items-center justify-center font-display text-[16px] shrink-0"
        style={{ width: 42, height: 42, background: "var(--sage)" }}
      >
        {iconLetter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display text-[14px]">{event.title}</span>
          <span className="pixel-chip !text-[9px] !py-0 bg-cream">{event.category}</span>
        </div>
        <div className="text-[11px] text-ink/70 mt-0.5 leading-snug">{event.description}</div>
        {event.gainLabel && (
          <div className="mt-1 text-[11px] font-display text-ink/80">{event.gainLabel}</div>
        )}
        <button
          onClick={() => onPick(event)}
          className="pixel-btn mt-1.5 px-3 py-1 text-[12px]"
          style={{ background: "var(--sky)" }}
        >
          去做 →
        </button>
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="pixel-border-sm !shadow-none bg-cream p-1.5">
      <div className="text-[9px] text-ink/60 leading-none">{label}</div>
      <div className="font-display text-[12px] leading-tight mt-0.5 truncate">{value}</div>
    </div>
  );
}

export type { CharStats };
