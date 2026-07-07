import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GameLayout } from "@/components/game/GameLayout";
import { PixelButton } from "@/components/game/PixelButton";
import { PixelCard } from "@/components/game/PixelCard";
import { useGameState, gameStore } from "@/lib/gameStore";
import { getMajorById } from "@/data/majors";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const game = useGameState();
  const navigate = useNavigate();
  const currentMajor = game.majorId ? getMajorById(game.majorId) : null;
  const hasSave = !!currentMajor;

  return (
    <GameLayout showHome={false}>
      {/* 像素校园背景板 */}
      <PixelCard tone="sky" className="relative overflow-hidden !p-0">
        <div
          className="relative h-72 md:h-96"
          style={{
            background:
              "linear-gradient(to bottom, var(--sky) 0 55%, var(--sage) 55% 100%)",
          }}
        >
          {/* 云 */}
          <div className="absolute left-6 top-6 text-4xl animate-pixel-float">☁️</div>
          <div className="absolute right-16 top-10 text-3xl animate-pixel-float" style={{ animationDelay: "0.6s" }}>☁️</div>
          <div className="absolute left-1/3 top-4 text-2xl">☀️</div>
          {/* 校园建筑（emoji 占位） */}
          <div className="absolute bottom-16 left-6 text-6xl">🏫</div>
          <div className="absolute bottom-14 left-1/3 text-5xl">🏛️</div>
          <div className="absolute bottom-16 right-10 text-6xl">🏬</div>
          {/* 树 */}
          <div className="absolute bottom-8 left-1/2 text-4xl">🌳</div>
          <div className="absolute bottom-6 right-1/3 text-4xl">🌲</div>
          {/* 小人 */}
          <div className="absolute bottom-4 left-16 text-3xl animate-pixel-float">🧑‍🎓</div>
          <div className="absolute bottom-4 right-24 text-3xl animate-pixel-float" style={{ animationDelay: "0.4s" }}>👩‍🎓</div>

          {/* 标题 */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center">
            <div className="inline-block pixel-border bg-cream/90 px-4 py-3 md:px-6 md:py-4">
              <h1 className="font-display text-2xl md:text-4xl leading-tight">
                《这专业我先替你读了四年》
              </h1>
              <p className="mt-1 text-xs md:text-sm text-ink/80">
                选择一个专业，开启一段离谱又真实的本科人生。
              </p>
            </div>
          </div>
        </div>
      </PixelCard>

      {/* 主操作区 */}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <PixelCard tone="cream">
            <div className="flex flex-wrap items-center gap-3">
              <PixelButton
                variant="accent"
                size="lg"
                onClick={() => {
                  if (!hasSave) gameStore.reset();
                  navigate({ to: "/major" });
                }}
              >
                ▶ 开始模拟
              </PixelButton>

              <Link to="/major">
                <PixelButton variant="secondary">📚 专业图鉴</PixelButton>
              </Link>

              <PixelButton
                variant="sunny"
                onClick={() => {
                  const name = prompt("给你的角色起个名字：", game.characterName) || game.characterName;
                  const school = prompt("学校叫什么？", game.school) || game.school;
                  gameStore.set({ characterName: name, school });
                }}
              >
                🧑‍🎨 角色设定
              </PixelButton>

              <PixelButton
                variant="ghost"
                disabled={!hasSave}
                onClick={() => navigate({ to: game.finished ? "/result" : "/semester" })}
              >
                💾 读取进度
              </PixelButton>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              提示：进度自动保存到浏览器本地。想重开可以点击「开始模拟」。
            </p>
          </PixelCard>

          {/* 左下装饰行 */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <DecorCard emoji="📅" title="高考倒计时" value="T-0 天" tone="cherry" />
            <DecorCard emoji="📖" title="志愿填报手册" value="全新未拆" tone="sunny" />
            <DecorCard emoji="☕" title="咖啡杯" value="第 3 杯" tone="tan" />
            <DecorCard emoji="📓" title="笔记本" value="已翻烂" tone="sage" />
          </div>
        </div>

        {/* 学生档案卡 */}
        <PixelCard tone="cream" className="h-fit">
          <div className="text-xs uppercase tracking-widest text-ink/60">🎫 学生档案</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="pixel-border-sm bg-sky/60 flex h-16 w-16 items-center justify-center text-4xl">
              {currentMajor ? "🧑‍🎓" : "❓"}
            </div>
            <div>
              <div className="font-display text-lg leading-none">
                {hasSave ? game.characterName : "未创建角色"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {hasSave ? game.school : "新生档案 · 待办理"}
              </div>
              <div className="mt-1 text-xs">
                {hasSave ? (
                  <>专业：<b>{currentMajor?.name}</b></>
                ) : (
                  <span className="text-muted-foreground">尚未选择专业</span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 rounded border-2 border-dashed border-ink/40 bg-cream/70 p-2 text-[11px] italic">
            {hasSave
              ? `进度：大${["一", "二", "三", "四"][game.year - 1]}${game.semester === 1 ? "上" : "下"} · 第 ${game.week} 周`
              : "请到窗口领取饭卡、床铺和一份四年迷茫。"}
          </div>
        </PixelCard>
      </div>
    </GameLayout>
  );
}

function DecorCard({
  emoji,
  title,
  value,
  tone,
}: {
  emoji: string;
  title: string;
  value: string;
  tone: "cherry" | "sunny" | "tan" | "sage";
}) {
  return (
    <PixelCard tone={tone} className="!p-3">
      <div className="flex items-center gap-2">
        <div className="text-2xl">{emoji}</div>
        <div>
          <div className="text-[11px] text-ink/70">{title}</div>
          <div className="font-display text-sm">{value}</div>
        </div>
      </div>
    </PixelCard>
  );
}
