import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OutcomeView } from "@/components/result/OutcomeView";
import { LawOutcomeView } from "@/components/result/LawOutcomeView";
import { ComputerScienceOutcomeView } from "@/components/result/ComputerScienceOutcomeView";
import { ClinicalMedicineOutcomeView } from "@/components/result/ClinicalMedicineOutcomeView";
import { ChineseLiteratureOutcomeView } from "@/components/result/ChineseLiteratureOutcomeView";
import { AccountingOutcomeView } from "@/components/result/AccountingOutcomeView";
import { gameStore, useGameState, currentSemesterLabel } from "@/lib/gameStore";
import { totalSemesters } from "@/data/script/semesterMeta";
import { majorById } from "@/data/script/majorCatalog";
import { deriveResultTags } from "@/lib/resultTags";
import { deriveLawResult } from "@/lib/lawRoguelite";
import { deriveCSResult } from "@/lib/computerScienceRoguelite";
import { deriveClinicalResult } from "@/lib/clinicalMedicineRoguelite";
import { deriveChineseResult } from "@/lib/chineseLiteratureRoguelite";
import { deriveAccountingResult } from "@/lib/accountingRoguelite";
import { deriveLawReplayRecommendations } from "@/lib/lawReplay";
import { deriveMajorReplayRecommendations } from "@/lib/majorReplay";
import type { ReplayRecommendation } from "@/lib/replaySystem";
import { canEnterMajorGame, getMajorExperienceConfig } from "@/data/majorExperienceConfig";

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
  const experience = getMajorExperienceConfig(game.majorId);
  const [ending, setEnding] = useState<any | null>(null);
  const [achievementNames, setAchievementNames] = useState<string[]>([]);
  const trackedResult = useRef(false);

  useEffect(() => {
    if (!game.hydrated) return;
    if (!major || !experience) navigate({ to: "/major" });
    else if (!canEnterMajorGame(game.majorId)) {
      navigate({ to: "/major-preview/$majorId", params: { majorId: game.majorId } });
    }
  }, [experience, game.hydrated, game.majorId, major, navigate]);

  useEffect(() => {
    if (!major || !canEnterMajorGame(game.majorId)) return;
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

  useEffect(() => {
    if (!game.hydrated || !["law", "computer_science", "clinical_medicine", "chinese_language_literature", "accounting"].includes(game.majorId) || !game.finished || trackedResult.current) return;
    trackedResult.current = true;
    const result = deriveReplayResult(game);
    if (!result) return;
    gameStore.trackReplayEvent("first_result_viewed", {
      previousRouteId: result.route.id,
      previousPersonaId: result.persona.id,
    });
    gameStore.trackReplayEvent("next_life_section_viewed", {
      previousRouteId: result.route.id,
      previousPersonaId: result.persona.id,
    });
  }, [game]);

  const tags = useMemo(() => deriveResultTags(game, "final"), [game]);
  if (!major || !experience || !canEnterMajorGame(game.majorId)) return null;

  const title = ending?.title ?? `${major.name}顺利毕业`;
  const summary = ending?.summary ?? "你把本科四年跑完了，说不上惊艳，也没有翻车。";
  const advice = ending?.advice ?? "别把学历当护身符，接下来才是正片。";
  const hook = ending?.shareText ?? major.shareTexts?.[0] ?? summary;
  const total = totalSemesters(game.majorId);
  const home = () => {
    gameStore.reset();
    navigate({ to: "/" });
  };
  const replayMajor = (recommendation: ReplayRecommendation) => {
    if (!gameStore.prepareMajorReplay(recommendation)) return;
    if (!gameStore.startPreparedMajorReplay()) return;
    navigate({ to: "/semester" });
  };

  if (major.id === "law") {
    const lawResult = deriveLawResult(game);
    const lawRecommendations = deriveLawReplayRecommendations(
      game,
      lawResult.route.id,
      lawResult.persona.id,
      game.replayArchive.runsByMajor.law ?? [],
    );
    const lawReplay = (recommendation: (typeof lawRecommendations)[number]) => {
      if (!gameStore.prepareLawReplay(recommendation)) return;
      if (!gameStore.startPreparedLawReplay()) return;
      navigate({ to: "/semester" });
    };
    const lawShare = () => shareOutcome({
      title: lawResult.persona.title,
      text: `${lawResult.persona.shareText}\n\n${lawResult.route.shareText}\n\n人格标签：${lawResult.persona.tags.join(" · ")}\n特殊经历：${lawResult.experiences.slice(0, 3).map((item) => item.title).join("、") || "法学人格拒绝注销"}\n\n你敢不敢用同一个专业，走出完全不同的结局？`,
    });
    return <LawOutcomeView game={game} result={lawResult} archive={game.lawArchive} eventTotal={game.discoverableTotals.law ?? 56} recommendations={lawRecommendations} onHome={home} onReplay={lawReplay} onShare={lawShare} />;
  }
  if (major.id === "computer_science") {
    const csResult = deriveCSResult(game);
    const recommendations = deriveMajorReplayRecommendations(game, csResult.route.id, csResult.persona.id, game.replayArchive.runsByMajor.computer_science ?? []);
    const csRetry = () => replayMajor(recommendations[0]);
    const csShare = () => shareOutcome({
      title: csResult.persona.title,
      text: `${csResult.persona.shareText}\n\n${csResult.route.shareText}\n\n技术人格：${csResult.persona.tags.join(" · ")}\n特殊经历：${csResult.experiences.slice(0, 3).map((item) => item.title).join("、") || "项目在最后一刻成功运行"}\n\n同一个计算机专业，你会构筑出哪条路线？`,
    });
    return <ComputerScienceOutcomeView game={game} result={csResult} archive={game.csArchive} eventTotal={game.discoverableTotals.computer_science ?? 47} recommendations={recommendations} onHome={home} onRetry={csRetry} onReplay={replayMajor} onShare={csShare} />;
  }
  if (major.id === "clinical_medicine") {
    const clinicalResult = deriveClinicalResult(game);
    const recommendations = deriveMajorReplayRecommendations(game, clinicalResult.route.id, clinicalResult.persona.id, game.replayArchive.runsByMajor.clinical_medicine ?? []);
    const clinicalRetry = () => replayMajor(recommendations[0]);
    const clinicalShare = () => shareOutcome({
      title: clinicalResult.persona.title,
      text: `${clinicalResult.persona.shareText}\n\n${clinicalResult.route.shareText}\n\n医学生人格：${clinicalResult.persona.tags.join(" · ")}\n特殊经历：${clinicalResult.experiences.slice(0, 3).map((item) => item.title).join("、") || "五年培养副本仍在运行"}\n\n同一个临床医学专业，你会把有限资源投向哪条路线？`,
    });
    const clinicalProgress = game.majorProgress.clinical_medicine ?? {
      playCount: 1, unlockedRoutes: [], unlockedPersonas: [], discoveredEvents: [],
      discoveredSpecialExperiences: [], unlockedEndings: [],
    };
    return <ClinicalMedicineOutcomeView game={game} result={clinicalResult} progress={clinicalProgress} eventTotal={game.discoverableTotals.clinical_medicine ?? 54} recommendations={recommendations} onHome={home} onRetry={clinicalRetry} onReplay={replayMajor} onShare={clinicalShare} />;
  }
  if (major.id === "chinese_language_literature") {
    const chineseResult = deriveChineseResult(game);
    const recommendations = deriveMajorReplayRecommendations(game, chineseResult.route.id, chineseResult.persona.id, game.replayArchive.runsByMajor.chinese_language_literature ?? []);
    const chineseRetry = () => replayMajor(recommendations[0]);
    const chineseShare = () => shareOutcome({
      title: chineseResult.persona.title,
      text: `${chineseResult.persona.shareText}\n\n${chineseResult.route.shareText}\n\n中文系人格：${chineseResult.persona.tags.join(" · ")}\n特殊经历：${chineseResult.experiences.slice(0, 3).map((item) => item.title).join("、") || "文学史和现实出口都成功存活"}\n\n同一个汉语言文学专业，你会把文字带去哪里？`,
    });
    const chineseProgress = game.majorProgress.chinese_language_literature ?? {
      playCount: 1, unlockedRoutes: [], unlockedPersonas: [], discoveredEvents: [],
      discoveredSpecialExperiences: [], unlockedEndings: [],
    };
    return <ChineseLiteratureOutcomeView game={game} result={chineseResult} progress={chineseProgress} eventTotal={game.discoverableTotals.chinese_language_literature ?? 48} recommendations={recommendations} onHome={home} onRetry={chineseRetry} onReplay={replayMajor} onShare={chineseShare} />;
  }
  if (major.id === "accounting") {
    const accountingResult = deriveAccountingResult(game);
    const recommendations = deriveMajorReplayRecommendations(game, accountingResult.route.id, accountingResult.persona.id, game.replayArchive.runsByMajor.accounting ?? []);
    const accountingRetry = () => replayMajor(recommendations[0]);
    const accountingShare = () => shareOutcome({
      title: accountingResult.persona.title,
      text: `${accountingResult.persona.shareText}\n\n${accountingResult.route.shareText}\n\n会计人格：${accountingResult.persona.tags.join(" · ")}\n特殊经历：${accountingResult.experiences.slice(0, 3).map((item) => item.title).join("、") || "合计行和本人都成功存活"}\n\n同一个会计学专业，你会把这张表查到什么程度？`,
    });
    const accountingProgress = game.majorProgress.accounting ?? {
      playCount: 1, unlockedRoutes: [], unlockedPersonas: [], discoveredEvents: [],
      discoveredSpecialExperiences: [], unlockedEndings: [],
    };
    return <AccountingOutcomeView game={game} result={accountingResult} progress={accountingProgress} eventTotal={game.discoverableTotals.accounting ?? 48} recommendations={recommendations} onHome={home} onRetry={accountingRetry} onReplay={replayMajor} onShare={accountingShare} />;
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

function deriveReplayResult(game: ReturnType<typeof gameStore.get>) {
  if (game.majorId === "law") return deriveLawResult(game);
  if (game.majorId === "computer_science") return deriveCSResult(game);
  if (game.majorId === "clinical_medicine") return deriveClinicalResult(game);
  if (game.majorId === "chinese_language_literature") return deriveChineseResult(game);
  if (game.majorId === "accounting") return deriveAccountingResult(game);
  return null;
}
