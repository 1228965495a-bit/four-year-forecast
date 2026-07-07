import { useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { PixelAvatar } from "@/components/game/PixelIcon";
import { getMajorById } from "@/data/majors";
import { matchResult } from "@/data/results";
import { gameStore, useGameState } from "@/lib/gameStore";

export const Route = createFileRoute("/result")({
  component: ResultPage,
});

const STATS: { key: keyof ReturnType<typeof useGameState>["stats"]; label: string; color: string }[] = [
  { key: "study", label: "兴趣", color: "var(--cherry)" },
  { key: "mental", label: "压力", color: "#D9534F" },
  { key: "internship", label: "就业", color: "var(--sage)" },
  { key: "money", label: "薪资", color: "var(--sunny)" },
  { key: "social", label: "成长", color: "var(--sky)" },
  { key: "energy", label: "稳定", color: "var(--tan)" },
];

function ResultPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? getMajorById(game.majorId) : null;

  useEffect(() => {
    if (!major) navigate({ to: "/major" });
  }, [major, navigate]);

  const result = useMemo(
    () => (major ? matchResult(game.stats, major) : null),
    [game.stats, major]
  );

  const fitScore = useMemo(() => {
    if (!major) return 0;
    const vals = Object.values(game.stats);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.round((avg + major.fit) / 2);
  }, [game.stats, major]);

  if (!major || !result) return null;

  const share = () => {
    const text = `《这专业我先替你读了四年》\n专业：${major.name}\n结局：${result.title}（适配 ${fitScore}%）\n${result.shareText}`;
    if (navigator.share) {
      navigator.share({ title: "这专业我先替你读了四年", text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      alert("分享文案已复制到剪贴板");
    }
  };

  const save = () => {
    const blob = new Blob(
      [JSON.stringify({ major: major.name, stats: game.stats, result }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${major.name}-${result.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bottomBar = (
    <div className="border-t-[3px] border-ink bg-cream px-3 py-2 grid grid-cols-3 gap-2">
      <button
        onClick={() => {
          gameStore.reset();
          navigate({ to: "/" });
        }}
        className="pixel-btn py-2 text-[12px]"
        style={{ background: "var(--sage)" }}
      >
        ↻ 重新
      </button>
      <button
        onClick={save}
        className="pixel-btn py-2 text-[12px]"
        style={{ background: "var(--sky)" }}
      >
        ⤓ 保存
      </button>
      <button
        onClick={share}
        className="pixel-btn py-2 text-[12px]"
        style={{ background: "var(--cherry)", color: "var(--cream)" }}
      >
        ⤴ 分享
      </button>
    </div>
  );

  return (
    <PhoneFrame bottomBar={bottomBar}>
      {/* 结局卡：竖屏可截图，比例接近 1080×1920 */}
      <div className="p-3 pb-4 space-y-3">
        <div className="pixel-panel !p-0 overflow-hidden bg-cream">
          {/* 顶部像素条纹 header */}
          <div className="relative bg-cherry text-cream px-3 py-3 border-b-[3px] border-ink">
            <div className="absolute inset-0 pixel-scanlines opacity-30" />
            <div className="relative">
              <div className="text-[10px] tracking-widest font-display opacity-90">
                CAMPUS · SIM · ENDING
              </div>
              <h1 className="pixel-logo text-[22px] leading-tight mt-1">
                你的本科人生结局
              </h1>
              <div className="text-[11px] mt-1 opacity-90">
                《这专业我先替你读了四年》
              </div>
            </div>
          </div>

          {/* 结局主体 */}
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="pixel-border overflow-hidden"
                style={{ width: 64, height: 64 }}
              >
                <PixelAvatar size={64} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-ink/60">你的专业人格</div>
                <div className="font-display text-[22px] leading-tight text-ink">
                  {result.title}
                </div>
                <div className="text-[11px] text-ink/70 truncate">
                  {major.name} · {game.school} · {game.characterName}
                </div>
              </div>
              <div className="text-center pixel-border-sm bg-sunny p-1.5 shrink-0">
                <div className="text-[9px] leading-none">适配</div>
                <div className="font-display text-[20px] leading-none mt-0.5">
                  {fitScore}%
                </div>
              </div>
            </div>

            {/* 六边形数值 */}
            <div className="pixel-border-sm !shadow-none bg-sage/20 p-2">
              <div className="text-[10px] font-display tracking-widest mb-1.5 text-ink/70">
                本科属性总结
              </div>
              <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
                {STATS.map((s) => (
                  <div key={s.key} className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-ink/70">{s.label}</span>
                      <span className="font-display">{game.stats[s.key]}</span>
                    </div>
                    <div className="bar-track !h-2">
                      <div
                        className="bar-fill"
                        style={{ width: `${game.stats[s.key]}%`, background: s.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 本科路径总结 */}
            <div className="pixel-border-sm !shadow-none bg-sky/20 p-2">
              <div className="text-[10px] font-display tracking-widest mb-1 text-ink/70">
                本科路径总结
              </div>
              <div className="text-[12px] leading-snug">{result.summary}</div>
            </div>

            {/* 后遗症 + 诊断 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="pixel-border-sm !shadow-none bg-cherry/20 p-2">
                <div className="text-[10px] font-display tracking-widest text-ink/70 mb-1">
                  专业后遗症
                </div>
                <div className="flex flex-wrap gap-1">
                  {major.aftereffects.map((a) => (
                    <span key={a} className="text-[10px] px-1 py-0.5 border-2 border-ink bg-cream leading-none">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pixel-border-sm !shadow-none bg-sunny/30 p-2">
                <div className="text-[10px] font-display tracking-widest text-ink/70 mb-1">
                  系统诊断
                </div>
                <div className="text-[11px] leading-snug">{major.diagnosis}</div>
              </div>
            </div>

            {/* 报考建议 */}
            <div className="pixel-border-sm !shadow-none bg-sage/25 p-2">
              <div className="text-[10px] font-display tracking-widest text-ink/70 mb-1">
                报考建议
              </div>
              <div className="text-[12px] leading-snug">{result.advice}</div>
            </div>

            {/* 代表成就 */}
            <div>
              <div className="text-[10px] font-display tracking-widest text-ink/70 mb-1">
                代表成就
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.achievements.map((a) => (
                  <span
                    key={a}
                    className="pixel-chip bg-sunny/50 !text-[11px]"
                  >
                    ★ {a}
                  </span>
                ))}
              </div>
            </div>

            {/* 分享文案 */}
            <div className="pixel-border bg-ink text-cream p-2.5">
              <div className="text-[10px] tracking-widest opacity-80 mb-1">
                分享文案 · SHARE
              </div>
              <div className="font-display text-[14px] leading-snug">
                「{result.shareText}」
              </div>
            </div>

            {/* 底部品牌 */}
            <div className="text-center pt-1">
              <div className="pixel-logo text-[13px]">这专业我先替你读了四年</div>
              <div className="text-[9px] text-ink/50 mt-0.5 tracking-widest">
                CAMPUS · SIM · v0.2
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
