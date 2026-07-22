import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OutcomeView } from "@/components/result/OutcomeView";
import { LawOutcomeView } from "@/components/result/LawOutcomeView";
import { gameStore, useGameState, currentSemesterLabel } from "@/lib/gameStore";
import { totalSemesters } from "@/data/script/semesterMeta";
import { majorById } from "@/data/script/majorCatalog";
import { deriveResultTags } from "@/lib/resultTags";
import { deriveLawResult } from "@/lib/lawRoguelite";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "本科结局 · 这专业我先替你读了四年" },
      { name: "description", content: "看看你四年本科副本最后获得了什么称号。" },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? majorById[game.majorId] : null;
  const [ending, setEnding] = useState<any | null>(null);
  const [achievementNames, setAchievementNames] = useState<string[]>([]);

  useEffect(() => {
    if (game.hydrated && !major) navigate({ to: "/major" });
  }, [game.hydrated, major, navigate]);

  useEffect(() => {
    if (!major) return;
    let alive = true;
    (async () => {
      const { loadMajorRuntime, pickEnding, getAchievementsForMajor } =
        await import("@/lib/scriptEngine");
      await loadMajorRuntime(major.id);
      if (!alive) return;
      setEnding(pickEnding(game));
      const achievements = await getAchievementsForMajor(major.id);
      const nameById = new Map(achievements.map((item: any) => [item.id, item.name]));
      setAchievementNames(game.achievements.map((id) => nameById.get(id) ?? id));
    })();
    return () => {
      alive = false;
    };
  }, [game, major]);

  const tags = useMemo(() => deriveResultTags(game, "final"), [game]);
  if (!major) return null;

  const title = ending?.title ?? `${major.name}顺利毕业`;
  const summary = ending?.summary ?? "你把本科四年跑完了，说不上惊艳，也没有翻车。";
  const advice = ending?.advice ?? "别把学历当护身符，接下来才是正片。";
  const hook = ending?.shareText ?? major.shareTexts?.[0] ?? summary;
  const total = totalSemesters();
  const home = () => {
    gameStore.reset();
    navigate({ to: "/" });
  };

  if (major.id === "law") {
    const lawResult = deriveLawResult(game);
    const lawRetry = () => { gameStore.reset(); gameStore.selectMajor("law"); navigate({ to: "/intro" }); };
    const lawShare = () => shareOutcome({
      title: lawResult.persona.title,
      text: `我在法学院走完了「${lawResult.route.title}」，最后活成了「${lawResult.persona.title}」。\n\n“${lawResult.persona.verdict}”\n\n特殊经历：${lawResult.experiences.slice(0, 3).map((item) => item.title).join("、") || "法学人格拒绝注销"}\n\n你敢不敢用同一个专业，走出完全不同的结局？`,
    });
    return <LawOutcomeView game={game} result={lawResult} archive={game.lawArchive} eventTotal={game.discoverableTotals.law ?? 56} onHome={home} onRetry={lawRetry} onShare={lawShare} />;
  }

  const retry = () => {
    gameStore.reset();
    navigate({ to: "/major" });
  };
  const share = () =>
    shareOutcome({
      title,
      text: `《这专业我先替你读了四年》\n专业：${major.name}\n结局：${title}\n“${hook}”`,
    });

  return (
    <OutcomeView
      mode="final"
      game={game}
      major={major}
      semesterLabel={currentSemesterLabel(game)}
      title={title}
      hook={hook}
      summary={summary}
      advice={advice}
      tags={tags}
      achievements={achievementNames}
      progress={`${total}/${total} · 本科副本已通关`}
      onHome={home}
      onRetry={retry}
      onShare={share}
    />
  );
}

function shareOutcome({ title, text }: { title: string; text: string }) {
  if (navigator.share) navigator.share({ title, text }).catch(() => {});
  else navigator.clipboard?.writeText(text).then(() => alert("结局文案已复制。"));
}
