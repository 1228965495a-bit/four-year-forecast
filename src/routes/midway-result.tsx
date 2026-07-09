import { useEffect, useMemo, useRef, useState } from "react";
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

  // 等 gameStore 水合完再判断是否要跳走，避免首帧就误跳回首页。
  const [hydrated, setHydrated] = useState(false);
  const settleRef = useRef<number | null>(null);
  useEffect(() => {
    if (settleRef.current) window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => setHydrated(true), 0);
    return () => { if (settleRef.current) window.clearTimeout(settleRef.current); };
  }, []);
  useEffect(() => {
    if (hydrated && !game.majorId) navigate({ to: "/" });
  }, [hydrated, game.majorId, navigate]);

  const tags = useMemo(() => {
    if (game.midGgTags && game.midGgTags.length) {
      // 用引擎生成的原因标签，长度不足再拿风格标签补齐到 6
      const seen = new Set(game.midGgTags);
      const extra = deriveResultTags(game, "midway").filter((t) => !seen.has(t.label));
      const merged = [
        ...game.midGgTags.map((label, i) => ({ id: `mg-${i}`, label, icon: "🎯", tone: (["cherry","sage","sunny","grape","sky","tan"] as const)[i % 6] })),
        ...extra,
      ];
      return merged.slice(0, 6);
    }
    return deriveResultTags(game, "midway");
  }, [game]);

  if (!major) return null;

  const total = totalSemesters();
  const semesterAt = currentSemesterLabel(game);
  const displayTitle = game.midGgTitle || "跑路预备役";
  const displaySubtitle = game.midGgSubtitle || "你按下了结束键，提前结束本科副本。";
  const displayConclusion = game.midGgConclusion || "跑路不是失败，是战略转移。";

  const backHome = () => { gameStore.reset(); navigate({ to: "/" }); };
  const retry    = () => { gameStore.reset(); navigate({ to: "/major" }); };
  const share    = () => {
    const text = `《这专业我先替你读了四年》\n中途结算·${semesterAt}\n专业：${major.name}\n称号：${displayTitle}\n结论：${displayConclusion}`;
    if (navigator.share) navigator.share({ title: displayTitle, text }).catch(() => {});
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
            <ResultBanner tag="中途结算!" title={displayTitle} tier="C" emoji="🏃" />

            <ResultRibbon>
              {displaySubtitle}<br/>
              {displayConclusion}
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
                <PixelPanel9 variant="diagnosis" padding="pt-5 pb-4 px-4" className="mt-1.5">
                  <p className="text-[12.5px] leading-[1.7]">
                    <span className="font-display text-ink/70">档案编号 </span>
                    <span className="font-display tabular-nums">#MID-{String(game.semesterIdx + 1).padStart(2, "0")}</span>
                    <span className="text-ink/50">　·　签发：教务处（离场窗口）</span>
                  </p>
                  <p className="text-[12.5px] leading-[1.7] mt-2">
                    {major.name}副本刚开场，你就先进行了战略撤离。
                    没有被通宵的 DDL 和随堂小测彻底拿下，
                    你选择在游戏还没把你榨干之前，主动按下退出键。
                  </p>
                  <p className="text-[12.5px] leading-[1.7] mt-2">
                    这不是弃权，是识时务。真正会玩的人，
                    知道哪些副本不值得肝，哪些经验值可以晚点再刷——
                    先把自己这条命保住，才有资格重开下一局。
                  </p>
                  <ul className="mt-2.5 space-y-1 text-[12px] leading-[1.55] text-ink/90">
                    <li>· 已保留：<span className="font-display">头发 / 睡眠 / 少量幻想</span></li>
                    <li>· 已释放：<span className="font-display">早八 / 全勤 / 内耗额度</span></li>
                    <li>· 建议：<span className="font-display">带上这份鉴定，去下一段人生开新号</span></li>
                  </ul>
                  <p className="text-cherry font-display text-[12.5px] mt-3">
                    结论：活着，比全勤更重要。
                  </p>
                </PixelPanel9>
              </div>
            </section>

            <FuturePinnedNote>
              {`嘿，是我，几年后的你。\n\n听说你今天在${major.name}副本按下了停止键。放心，我没有怪你——事实上，我挺感激那个时候敢喊停的自己。\n\n退出一次，不代表人生失败。真正厉害的人，也懂得在不想玩的时候先把自己救出来，休整、换地图、再重开一局。\n\n你现在觉得糟糕的这些事，很多在几年后都只是一句可以笑着讲出来的段子。等你想好了，再回来开新档，我在这边等你。❤`}
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
