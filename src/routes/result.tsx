import { useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GameLayout } from "@/components/game/GameLayout";
import { PixelButton } from "@/components/game/PixelButton";
import { ResultCard } from "@/components/game/ResultCard";
import { getMajorById } from "@/data/majors";
import { matchResult } from "@/data/results";
import { gameStore, useGameState } from "@/lib/gameStore";

export const Route = createFileRoute("/result")({
  component: ResultPage,
});

function ResultPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? getMajorById(game.majorId) : null;

  useEffect(() => {
    if (!major) navigate({ to: "/major" });
  }, [major, navigate]);

  const result = useMemo(() => (major ? matchResult(game.stats, major) : null), [game.stats, major]);

  const fitScore = useMemo(() => {
    if (!major) return 0;
    const vals = Object.values(game.stats);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.round((avg + major.fit) / 2);
  }, [game.stats, major]);

  if (!major || !result) return null;

  const share = () => {
    const text = `《这专业我先替你读了四年》\n专业：${major.name}\n结果：${result.title}（适配 ${fitScore}%）\n${result.shareText}`;
    if (navigator.share) {
      navigator.share({ title: "这专业我先替你读了四年", text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      alert("结果已复制到剪贴板，快分享给你的同桌～");
    }
  };

  const save = () => {
    const blob = new Blob(
      [JSON.stringify({ major: major.name, stats: game.stats, result }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${major.name}-${result.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <GameLayout title="🏆 四年本科模拟结束">
      <ResultCard result={result} major={major} stats={game.stats} fitScore={fitScore} />

      <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-3">
        <PixelButton
          variant="accent"
          size="lg"
          onClick={() => {
            gameStore.reset();
            navigate({ to: "/" });
          }}
        >
          🔁 重新模拟
        </PixelButton>
        <PixelButton variant="secondary" onClick={save}>💾 保存结果</PixelButton>
        <PixelButton variant="sunny" onClick={share}>📸 分享文案</PixelButton>
        <PixelButton variant="ghost" onClick={() => navigate({ to: "/major" })}>
          🎲 换个专业再来
        </PixelButton>
      </div>
    </GameLayout>
  );
}
