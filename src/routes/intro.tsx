import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { useGameState } from "@/lib/gameStore";
import { majorById } from "@/data/script/gameData";
import { HUD_STATS } from "@/lib/statsMeta";
import { majorEmoji, displayCategory, categoryTint } from "@/lib/majorDisplay";
import {
  PixelHeader,
  PixelStatBar,
  PixelTierBadge,
  PixelImgButton,
} from "@/components/pixel/PixelSkin";
import { PixelPanel9 } from "@/components/pixel/PixelPanel9";

export const Route = createFileRoute("/intro")({ component: IntroPage });

function IntroPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? majorById[game.majorId] : null;

  useEffect(() => {
    if (!major) navigate({ to: "/major" });
  }, [major, navigate]);

  if (!major) return null;

  const tint = categoryTint(major.category);
  const tier = (major.tier ?? "B") as "S" | "A" | "B" | "C";

  const topBar = (
    <div className="relative border-b-[3px] border-ink bg-ink px-2 pt-2 pb-2">
      <button
        onClick={() => navigate({ to: "/major" })}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-cream text-[11px] px-2 py-0.5 border-2 border-cream"
      >
        ← 换专业
      </button>
      <PixelHeader variant="majorSelect" className="!max-w-[280px]" />
    </div>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-3 p-3 pb-6">
          {/* 专业建档主卡 */}
          <PixelPanel9 variant="profile" padding="px-5 pt-5 pb-5">
            <div className="text-center">
              <div className="text-[10px] font-display tracking-[0.3em] text-ink/60">
                专业建档 · NEW FILE
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <PixelTierBadge tier={tier} size={34} />
                <h1 className="pixel-logo leading-none" style={{ fontSize: 26 }}>
                  {major.name}
                </h1>
              </div>
              <div className="text-[11px] text-ink/70 mt-1">
                {displayCategory(major.category)} · 分档 {major.tier}
              </div>
            </div>

            <div className="mt-4 mx-auto flex items-center justify-center">
              <div
                className="border-[3px] border-ink shadow-[3px_3px_0_0_var(--ink)] flex items-center justify-center text-[42px]"
                style={{ width: 84, height: 84, background: tint }}
                aria-hidden
              >
                {majorEmoji(major.id)}
              </div>
            </div>

            <blockquote className="mt-4 mx-auto max-w-[92%] text-left relative px-3 py-2 border-l-[4px] border-cherry bg-cream/80">
              <div className="absolute -top-2 -left-1 font-display text-cherry text-[20px] leading-none">"</div>
              <p className="font-display text-[13px] leading-[1.55] text-ink pl-1">
                {major.card?.subtitle ?? major.card?.description ?? "本科四年 · 现在存档，随时可以入学。"}
              </p>
            </blockquote>

            <div className="mt-3 flex items-center justify-between text-[10px] font-display tracking-widest text-ink/60">
              <span>档案 · {game.characterName}</span>
              <span>{game.school ?? "未定学校"}</span>
            </div>
          </PixelPanel9>

          {/* 初始数值面板 */}
          <div>
            <div className="flex items-center gap-1.5 px-1 mb-1.5">
              <span className="inline-block h-2.5 w-2.5 bg-cherry border-2 border-ink" />
              <span className="font-display text-[11px] tracking-[0.2em] text-ink/70">
                初始属性 · STATS
              </span>
              <span className="h-px flex-1 bg-ink/20" />
            </div>

            <PixelPanel9 variant="noteYellow" padding="px-4 py-3">
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {HUD_STATS.map((s) => {
                  const v = Math.max(0, Math.min(100, Math.round(game.stats[s.key] ?? 0)));
                  return (
                    <div key={s.key} className="min-w-0">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="text-[11px] text-ink/80 whitespace-nowrap">{s.label}</span>
                        <span className="font-display text-[11px] tabular-nums">{v}</span>
                      </div>
                      <PixelStatBar value={v} color={s.color} height={16} className="mt-0.5" />
                    </div>
                  );
                })}
              </div>
            </PixelPanel9>
          </div>

          {/* 进入大一上 */}
          <PixelImgButton
            variant="primary"
            onClick={() => navigate({ to: "/semester" })}
          >
            ▶ 进入大一上学期
          </PixelImgButton>

          <div className="text-center text-[10px] font-display tracking-widest text-ink/50">
            按下即建档 · 存档后不可回头
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
