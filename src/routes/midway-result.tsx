import { useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OutcomeView } from "@/components/result/OutcomeView";
import { gameStore, useGameState, currentSemesterLabel } from "@/lib/gameStore";
import { totalSemesters } from "@/data/script/semesterMeta";
import { majorById } from "@/data/script/majorCatalog";
import { deriveResultTags } from "@/lib/resultTags";
import { canEnterMajorGame, getMajorExperienceConfig } from "@/data/majorExperienceConfig";

export const Route = createFileRoute("/midway-result")({
  head: () => ({
    meta: [
      { title: "中途结算 · 这专业我先替你读了四年" },
      { name: "description", content: "提前结束本科副本，也会获得一个值得转发的称号。" },
    ],
  }),
  component: MidwayResultPage,
});

function MidwayResultPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? majorById[game.majorId] : null;
  const experience = getMajorExperienceConfig(game.majorId);

  useEffect(() => {
    if (!game.hydrated) return;
    if (!major || !experience) navigate({ to: "/major" });
    else if (!canEnterMajorGame(game.majorId)) {
      navigate({ to: "/major-preview/$majorId", params: { majorId: game.majorId } });
    }
  }, [experience, game.hydrated, game.majorId, major, navigate]);

  const tags = useMemo(() => {
    if (!game.midGgTags?.length) return deriveResultTags(game, "midway");
    const seen = new Set(game.midGgTags);
    const extras = deriveResultTags(game, "midway").filter((tag) => !seen.has(tag.label));
    return [
      ...game.midGgTags.map((label, index) => ({
        id: `mid-${index}`,
        label,
        icon: "",
        tone: (["cherry", "sage", "sunny", "grape", "sky", "tan"] as const)[index % 6],
      })),
      ...extras,
    ].slice(0, 6);
  }, [game]);

  if (!major || !experience || !canEnterMajorGame(game.majorId)) return null;

  const semester = currentSemesterLabel(game);
  const title = game.midGgTitle || "本局先存档的人";
  const summary = game.midGgSubtitle || "你没有等系统把电量清零，先亲手按下了结束键。这个本科副本停在这里，人生进度条还在继续，换方向也算一种有效操作。";
  const hook = game.midGgConclusion || "我不是没通关，只是拒绝给错误副本继续续费。";
  const advice = `已保留：头发、睡眠和少量幻想。\n已释放：早八、全勤和内耗额度。\n建议：带上这份鉴定，去下一段人生开新号。`;
  const total = totalSemesters(game.majorId);

  const retry = () => { gameStore.reset(); navigate({ to: "/major" }); };
  const home = () => { gameStore.reset(); navigate({ to: "/" }); };
  const share = () => shareOutcome({
    title,
    text: `《这专业我先替你读了四年》\n${major.name} · ${semester}\n中途称号：${title}\n“${hook}”`,
  });

  return (
    <OutcomeView
      mode="midway"
      game={game}
      major={major}
      semesterLabel={semester}
      title={title}
      hook={hook}
      summary={summary}
      advice={advice}
      tags={tags}
      progress={`${game.semesterIdx + 1}/${total} · 在这里主动离场`}
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
