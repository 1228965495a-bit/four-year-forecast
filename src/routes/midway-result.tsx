import { useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { gameStore, useGameState, currentSemesterLabel } from "@/lib/gameStore";
import { totalSemesters } from "@/lib/scriptEngine";
import { majorById } from "@/data/script/gameData";
import { HUD_STATS } from "@/lib/statsMeta";
import { deriveResultTags } from "@/lib/resultTags";
import {
  ResultCard,
  ResultBanner,
  ResultRibbon,
  TagBadgeGrid,
  StatBarList,
  FuturePinnedNote,
  ResultActionRow,
  SectionLabel,
} from "@/components/result/ResultShell";
import { PixelPanel9 } from "@/components/pixel/PixelPanel9";

export const Route = createFileRoute("/midway-result")({
  head: () => ({
    meta: [
      { title: "跑路预备役 · 中途结算" },
      { name: "description", content: "你提前结束了本科副本，看看这次跑路的中途学籍鉴定。" },
    ],
  }),
  component: MidwayResultPage,
});

function MidwayResultPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? majorById[game.majorId] : null;

  useEffect(() => {
    if (!game.majorId) navigate({ to: "/" });
  }, [game.majorId, navigate]);

  const tags = useMemo(() => deriveResultTags(game, "midway"), [game]);

  if (!major) return null;

  const total = totalSemesters();
  const semesterAt = currentSemesterLabel(game);

  const backHome = () => { gameStore.reset(); navigate({ to: "/" }); };
  const retry    = () => { gameStore.reset(); navigate({ to: "/major" }); };
  const share    = () => {
    const text = `《这专业我先替你读了四年》\n中途结算·${semesterAt}\n专业：${major.name}\n结论：跑路不是失败，是战略转移。`;
    if (navigator.share) navigator.share({ title: "跑路预备役", text }).catch(() => {});
    else { navigator.clipboard?.writeText(text); alert("已复制烂尾结局文案。"); }
  };

  const topBar = (
    <div className="border-b-[3px] border-ink bg-ink text-cream px-3 py-3 min-h-[58px] flex items-center gap-2">
      <button
        onClick={() => navigate({ to: "/" })}
        className="text-[12px] px-2 py-1 border-2 border-cream leading-none"
      >⌂</button>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[14px] leading-none truncate">{semesterAt}</div>
        <div className="text-[11px] text-cream/70 leading-none mt-1 truncate">
          {major.name} · {game.school}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-display text-[12px] tabular-nums">{game.semesterIdx + 1} / {total}</span>
        <span className="text-[11px] px-2.5 py-1 border-2 border-cream bg-cherry text-cream leading-none">结</span>
      </div>
    </div>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-3 pb-6 space-y-3">
          <ResultCard>
            <ResultBanner tag="中途结算!" title="跑路预备役" tier="C" emoji="🏃" />

            <ResultRibbon>
              你按下了结束键，提前结束本科副本。<br/>
              跑路不是失败，是战略转移。
            </ResultRibbon>

            {/* 场景素材位 */}
            <div
              className="mx-3 mt-2 border-[3px] border-ink relative overflow-hidden"
              style={{ height: 132, background: "linear-gradient(180deg,#B8DDF2 0%,#A8CFA3 100%)" }}
            >
              <div className="absolute inset-0 flex items-end justify-center pb-2">
                <div className="font-display text-[10px] text-ink/60 tracking-[0.3em]">
                  · 校门口 · 素材位 ·
                </div>
              </div>
              <span className="absolute left-4 bottom-3 text-[36px] leading-none">🎒</span>
              <span className="absolute right-4 top-3 text-[26px] leading-none">🏛️</span>
            </div>

            <TagBadgeGrid tags={tags} title="你的中途学籍鉴定" />

            <section className="px-3 pt-3 grid grid-cols-1 gap-3">
              <div>
                <SectionLabel accent="cherry">当前状态</SectionLabel>
                <div className="mt-2">
                  <StatBarList stats={HUD_STATS} values={game.stats} columns={2} />
                </div>
              </div>
              <div>
                <SectionLabel>中途报告</SectionLabel>
                <PixelPanel9 variant="diagnosis" padding="pt-4 pb-3 px-4" className="mt-1.5">
                  <p className="text-[12.5px] leading-[1.6]">
                    {major.name}副本刚开场，你就先进行了战略撤离。
                    还没被课程和考试彻底拿下，已经先把自己救出副本。
                  </p>
                  <p className="text-cherry font-display text-[12.5px] mt-2">
                    结论：活着，比全勤更重要。
                  </p>
                </PixelPanel9>
              </div>
            </section>

            <FuturePinnedNote>
              {`退出一次，不代表人生失败。\n真正厉害的人，也懂得在不想玩的时候按下停止键。\n等你想好了，再回来开新档。❤`}
            </FuturePinnedNote>

            <div className="px-3 py-2 text-center text-[10px] font-display tracking-[0.3em] text-ink/50">
              · 本次退场记录 · 在 {game.semesterIdx + 1}/{total} 进度主动结束游戏 ·
            </div>
          </ResultCard>

          <ResultActionRow
            onHome={backHome}
            onRetry={retry}
            onShare={share}
            shareLabel="分享烂尾结局"
          />
        </div>
      </div>
    </PhoneFrame>
  );
}
