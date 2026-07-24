import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Dices, GitBranch, Pencil, Play, RotateCcw, UserRound, X } from "lucide-react";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { HomeCampusArt } from "@/components/game/CampusArt";
import { useGameState, gameStore } from "@/lib/gameStore";
import { majorById } from "@/data/script/majorCatalog";
import { canEnterMajorGame, getMajorExperienceConfig } from "@/data/majorExperienceConfig";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const game = useGameState();
  const navigate = useNavigate();
  const currentMajor = game.majorId ? majorById[game.majorId] : null;
  const currentExperience = getMajorExperienceConfig(game.majorId);
  const hasSave = !!currentMajor && canEnterMajorGame(game.majorId);
  const [characterOpen, setCharacterOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(game.characterName);

  const startFresh = () => {
    const { characterName } = gameStore.get();
    gameStore.reset();
    gameStore.set({ characterName, school: "云上大学" });
    setRestartOpen(false);
    navigate({ to: "/major" });
  };

  const continueGame = () => {
    if (!hasSave) return startFresh();
    navigate({ to: game.finished ? "/result" : game.midwayFinished ? "/midway-result" : "/semester" });
  };

  const openCharacter = () => {
    setNameDraft(game.characterName);
    setCharacterOpen(true);
  };

  const saveCharacter = () => {
    gameStore.set({ characterName: nameDraft.trim() || "新生同学", school: "云上大学" });
    setCharacterOpen(false);
  };

  return (
    <PhoneFrame>
      <div className="v4-home-scroll">
        <div className="v4-home">
          <div className="v4-brand-row">
            <span className="v4-kicker">云上大学 · 本科人生模拟器</span>
          </div>

          <HomeCampusArt />

          <h1 className="v4-title">如果你真的读了这个专业，毕业时会变成谁？</h1>
          <p className="v4-home-lead">选一个你想报、正在读，或者已经后悔过的专业，重新开一局大学人生。</p>
          <div className="v4-home-loop">
            <span><Dices size={14} />随机事件</span>
            <span><GitBranch size={14} />多路线结局</span>
            <span><RotateCcw size={14} />反复重开</span>
          </div>
          <div className="v4-home-question text-[12px] font-bold text-[var(--v4-muted)]">同一个专业，你能活出几种结局？</div>

          {hasSave && (
            <div className="v4-save-line">
              <UserRound size={18} />
              <span><strong>{game.characterName}</strong> 正在读 {currentMajor?.name} · {currentExperience?.stageNames[game.semesterIdx] ?? `第 ${game.semesterIdx + 1} 学期`}</span>
            </div>
          )}

          <div className="v4-home-actions">
            <button className="v4-primary" onClick={continueGame}>
              {hasSave ? <Play size={19} fill="currentColor" /> : <ArrowRight size={20} />}
              {hasSave ? "继续这一局" : "选择专业"}
            </button>
            <div className="v4-home-subactions">
              <button className="v4-secondary" onClick={() => navigate({ to: "/catalog" })}><BookOpen size={17} />专业档案</button>
              <button className="v4-secondary" onClick={openCharacter}><Pencil size={17} />改个名字</button>
            </div>
            {hasSave && (
              <button className="mx-auto flex items-center gap-1.5 px-3 py-2 text-[12px] text-[var(--v4-muted)]" onClick={() => setRestartOpen(true)}>
                <RotateCcw size={14} />重新选专业
              </button>
            )}
          </div>
        </div>
      </div>

      {characterOpen && (
        <div className="v4-overlay">
          <div className="v4-modal">
            <div className="flex items-center justify-between">
              <div><div className="v4-title text-[20px]">角色设定</div><div className="mt-1 text-[12px] text-[var(--v4-muted)]">学校固定为云上大学，名字你说了算。</div></div>
              <button className="v4-icon-button" aria-label="关闭角色设定" onClick={() => setCharacterOpen(false)}><X size={18} /></button>
            </div>
            <label className="mt-5 block text-[12px] font-bold text-[var(--v4-muted)]">你的名字</label>
            <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={12} className="mt-2 w-full rounded-[8px] border-[1.5px] border-[var(--v4-ink)] bg-white px-3 py-3 text-[15px] outline-none" />
            <button className="v4-primary mt-5 w-full" onClick={saveCharacter}>保存</button>
          </div>
        </div>
      )}

      {restartOpen && (
        <div className="v4-overlay">
          <div className="v4-modal">
            <div className="v4-title text-[20px]">真的重新开始？</div>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--v4-muted)]">当前这局会被新存档覆盖。名字会保留，专业和进度会重新选择。</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="v4-secondary" onClick={() => setRestartOpen(false)}>先不重开</button>
              <button className="v4-primary" onClick={startFresh}>重新开始</button>
            </div>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}
