import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { useGameState } from "@/lib/gameStore";
import { majorById } from "@/data/script/gameData";
import { HUD_STATS } from "@/lib/statsMeta";
import {
  PixelStatBar,
  PixelTierBadge,
  PixelButton3,
} from "@/components/pixel/PixelSkin";

export const Route = createFileRoute("/intro")({ component: IntroPage });

/** 深棕机身背景色 —— 与参考图一致 */
const WOOD = "#3a2418";
const WOOD_HI = "#5a3a28";

/** 顶部深棕框内的「← 返回」像素按钮 */
function BackChip({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center justify-center font-display text-cream text-[12px] tracking-wider select-none border-[3px] border-cream/90 active:translate-x-[1px] active:translate-y-[1px]"
      style={{
        background: WOOD_HI,
        padding: "6px 12px",
        boxShadow: `0 2px 0 0 rgba(0,0,0,0.5), inset 0 2px 0 0 rgba(255,255,255,0.08)`,
        borderRadius: 0,
      }}
    >
      ← 返回
    </button>
  );
}

/** 顶部卷轴形标题：专业建档中... */
function ScrollTitle() {
  return (
    <div
      className="relative flex-1 inline-flex items-center justify-center font-display text-ink tracking-[0.15em] select-none border-[3px] border-ink"
      style={{
        background: "var(--parchment)",
        padding: "8px 16px",
        minHeight: 40,
        fontSize: 15,
        boxShadow: `0 3px 0 0 var(--ink), inset 0 2px 0 0 rgba(255,255,255,0.35), inset 0 -3px 0 0 rgba(0,0,0,0.12)`,
        borderRadius: 0,
      }}
    >
      {/* 卷轴左右耳朵 */}
      <span
        aria-hidden
        className="absolute -left-2 top-1/2 -translate-y-1/2 block"
        style={{ width: 8, height: 20, background: "var(--ink)" }}
      />
      <span
        aria-hidden
        className="absolute -right-2 top-1/2 -translate-y-1/2 block"
        style={{ width: 8, height: 20, background: "var(--ink)" }}
      />
      专业建档中...
    </div>
  );
}

function IntroPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? majorById[game.majorId] : null;

  useEffect(() => {
    if (major) return;
    // 首帧 SSR 快照可能 majorId 为空，等 localStorage 水合一次；
    // 若存档里也没有 majorId 才回到选专业。
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("cszmg_save_v3")
          : null;
      if (raw && JSON.parse(raw)?.majorId) return;
    } catch {
      /* ignore */
    }
    navigate({ to: "/major" });
  }, [major, navigate]);

  if (!major) return null;

  const tier = (major.tier ?? "B") as "S" | "A" | "B" | "C";

  const topBar = (
    <div
      className="flex items-center gap-3 px-3 pt-3 pb-3 border-b-[3px] border-ink"
      style={{ background: WOOD }}
    >
      <BackChip onClick={() => navigate({ to: "/major" })} />
      <ScrollTitle />
    </div>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ background: WOOD }}
      >
        <div className="p-3 pb-5">
          <PixelPanel9 variant="profile" padding="p-4">
            {/* 顶部：旗帜 · 专业名 · 段位徽章 */}
            <div className="flex items-start gap-2">
              <div
                className="shrink-0 select-none leading-none"
                style={{ fontSize: 30 }}
                aria-hidden
              >
                🚩
              </div>
              <div className="flex-1 min-w-0 text-center">
                <h1
                  className="pixel-logo leading-tight break-words"
                  style={{ fontSize: 22 }}
                >
                  {major.name}
                </h1>
                <div className="mt-1 text-[11px] text-ink/70">
                  · {game.school}
                </div>
              </div>
              <PixelTierBadge tier={tier} size={38} className="shrink-0" />
            </div>

            <div className="mt-3 border-t border-dashed border-ink/30" />

            {/* 正文文案 */}
            <div className="mt-3 text-center font-display text-[12.5px] leading-[1.75] text-ink px-1">
              <p>你被 {major.name} 录取了！</p>
              <p className="mt-1">
                {major.card?.subtitle ??
                  major.card?.description ??
                  "未来四年将充满未知与选择，做好准备。"}
              </p>
            </div>

            {/* 场景插图占位（等待美术贴图） */}
            <div
              className="mt-4 relative w-full flex items-center justify-center border-[3px] border-dashed border-ink/40 bg-cream/60"
              style={{ height: 200 }}
            >
              <div className="text-center text-ink/45 font-display text-[10.5px] tracking-[0.25em]">
                [ 专业场景插图占位 ]
                <div className="mt-1 text-[9px] tracking-[0.2em]">
                  ILLUSTRATION · ~ 320 × 200
                </div>
              </div>
            </div>

            {/* 初始属性 */}
            <div className="mt-5 flex items-center gap-1.5">
              <span className="text-ink text-[14px] leading-none">★</span>
              <span className="font-display text-[11px] tracking-[0.2em] text-ink/80">
                初始属性
              </span>
              <span
                className="flex-1 border-t border-dashed border-ink/30 ml-1"
                aria-hidden
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
              {HUD_STATS.map((s) => {
                const v = Math.max(
                  0,
                  Math.min(100, Math.round(game.stats[s.key] ?? 0)),
                );
                return (
                  <div key={s.key} className="min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[12px] text-ink whitespace-nowrap">
                        {s.label}
                      </span>
                      <span className="font-display text-[12px] tabular-nums text-ink">
                        {v}
                      </span>
                    </div>
                    <PixelStatBar
                      value={v}
                      color={s.color}
                      height={14}
                      className="mt-1"
                    />
                  </div>
                );
              })}
            </div>
          </PixelPanel9>

          {/* 进入大一上 */}
          <div className="mt-4">
            <PixelButton3
              variant="primaryTall"
              onClick={() => navigate({ to: "/semester" })}
            >
              进入大学 · 大一上
            </PixelButton3>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
