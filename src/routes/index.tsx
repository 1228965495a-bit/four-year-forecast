import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GameShell } from "@/components/game/GameShell";
import { HomeHeroScene } from "@/components/game/HomeHeroScene";
import { StudentProfileCard } from "@/components/game/StudentProfileCard";
import { PropStatusBar } from "@/components/game/PropStatusBar";
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
    <GameShell>
      {/* 游戏窗口：像掌机屏幕。桌面 16:9，移动端自适应 */}
      <div
        className="pixel-panel relative w-full max-w-[1160px] overflow-hidden !p-0"
        style={{ aspectRatio: "16 / 9", minHeight: 520 }}
      >
        {/* 顶部游戏窗口条 */}
        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between border-b-[3px] border-ink bg-ink px-3 py-1.5 text-cream">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-cherry border-[1.5px] border-cream" />
            <span className="h-2.5 w-2.5 bg-sunny border-[1.5px] border-cream" />
            <span className="h-2.5 w-2.5 bg-sage border-[1.5px] border-cream" />
            <span className="ml-2 font-display text-[11px] tracking-widest text-cream/90">
              CAMPUS · SIM · v0.1
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px] tracking-widest text-cream/70">
            <span>SAVE · AUTO</span>
            <span>▶</span>
            <span>FULLSCREEN</span>
          </div>
        </div>

        {/* 场景层 */}
        <HomeHeroScene />

        {/* 标题层（左上方） */}
        <div className="absolute left-[4%] top-[16%] z-20 max-w-[62%]">
          <TitleBlock />
        </div>

        {/* 主菜单（右侧） */}
        <div className="absolute right-[4%] top-[22%] z-20 w-[240px] max-w-[42%]">
          <MainMenu
            hasSave={hasSave}
            onStart={() => {
              if (!hasSave) gameStore.reset();
              navigate({ to: "/major" });
            }}
            onDex={() => navigate({ to: "/major" })}
            onCharacter={() => {
              const name =
                window.prompt("给你的角色起个名字：", game.characterName) ||
                game.characterName;
              const school =
                window.prompt("学校叫什么？", game.school) || game.school;
              gameStore.set({ characterName: name, school });
            }}
            onLoad={() =>
              navigate({ to: game.finished ? "/result" : "/semester" })
            }
            canLoad={hasSave}
          />
        </div>

        {/* 学生档案 - 左下 */}
        <div className="absolute left-[3%] bottom-[16%] z-20">
          <StudentProfileCard
            name={hasSave ? game.characterName : "未创建角色"}
            status={
              hasSave
                ? `进度：大${["一", "二", "三", "四"][game.year - 1]}${
                    game.semester === 1 ? "上" : "下"
                  } · 第 ${game.week} 周`
                : "新生档案 · 待办理"
            }
            major={currentMajor?.name}
            school={hasSave ? game.school : undefined}
            hasCharacter={hasSave}
          />
        </div>

        {/* 底部道具栏 */}
        <div className="absolute inset-x-0 bottom-0 z-20 border-t-[3px] border-ink bg-cream/95 backdrop-blur-[1px]">
          <div className="px-3 py-2">
            <PropStatusBar />
          </div>
        </div>
      </div>
    </GameShell>
  );
}

function TitleBlock() {
  return (
    <div className="relative">
      {/* 副 tag */}
      <div className="mb-2 inline-flex items-center gap-2 pixel-panel-sm bg-cherry !text-cream px-2 py-0.5">
        <span className="h-1.5 w-1.5 bg-cream" />
        <span className="font-display text-[11px] tracking-widest">
          CAMPUS LIFE SIMULATOR
        </span>
      </div>
      <h1 className="pixel-logo text-[36px] leading-none md:text-[56px]">
        这专业我
        <br />
        先替你读了四年
      </h1>
      <p className="mt-3 pixel-panel-sm inline-block bg-cream/95 px-2.5 py-1 font-display text-[13px] md:text-[15px]">
        选择一个专业，开启一段离谱又真实的本科人生
      </p>
    </div>
  );
}

interface MainMenuProps {
  hasSave: boolean;
  canLoad: boolean;
  onStart: () => void;
  onDex: () => void;
  onCharacter: () => void;
  onLoad: () => void;
}

function MainMenu({ onStart, onDex, onCharacter, onLoad, canLoad, hasSave }: MainMenuProps) {
  const items: {
    key: string;
    label: string;
    hint?: string;
    onClick: () => void;
    accent?: boolean;
    disabled?: boolean;
    glyph: React.ReactNode;
  }[] = [
    {
      key: "start",
      label: "开始模拟",
      hint: hasSave ? "继续新档" : "创建新档",
      onClick: onStart,
      accent: true,
      glyph: <GlyphPlay />,
    },
    { key: "dex", label: "专业图鉴", onClick: onDex, glyph: <GlyphBook /> },
    { key: "char", label: "角色设定", onClick: onCharacter, glyph: <GlyphPerson /> },
    {
      key: "load",
      label: "读取进度",
      onClick: onLoad,
      disabled: !canLoad,
      hint: canLoad ? "上次进度" : "无存档",
      glyph: <GlyphDisk />,
    },
  ];

  return (
    <div className="pixel-panel !p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-[13px] tracking-widest text-ink">主菜单</span>
        <span className="text-[10px] text-muted-foreground">按 ↵ 选择</span>
      </div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.key}>
            <button
              disabled={it.disabled}
              onClick={it.onClick}
              className="menu-btn disabled:opacity-50 disabled:cursor-not-allowed"
              style={it.accent ? { background: "var(--cherry)", color: "var(--cream)" } : undefined}
            >
              <span
                className="pixel-panel-sm !shadow-none flex h-7 w-7 shrink-0 items-center justify-center bg-cream"
              >
                {it.glyph}
              </span>
              <span className="flex-1 text-left">{it.label}</span>
              {it.hint && (
                <span className="text-[10px] font-normal tracking-normal text-ink/60 font-[var(--font-body)]">
                  {it.hint}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================= 像素 Glyphs（无 emoji） ================= */

function GlyphPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M4 3 h2 v2 h2 v2 h2 v2 h-2 v2 h-2 v2 h-2 z"
        fill="var(--ink)"
      />
    </svg>
  );
}
function GlyphBook() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="10" fill="var(--sky)" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="8" y1="3" x2="8" y2="13" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="3.5" y1="5.5" x2="7" y2="5.5" stroke="var(--ink)" />
      <line x1="3.5" y1="7.5" x2="7" y2="7.5" stroke="var(--ink)" />
      <line x1="9" y1="5.5" x2="12.5" y2="5.5" stroke="var(--ink)" />
      <line x1="9" y1="7.5" x2="12.5" y2="7.5" stroke="var(--ink)" />
    </svg>
  );
}
function GlyphPerson() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="6" y="2" width="4" height="4" fill="var(--sunny)" stroke="var(--ink)" strokeWidth="1.5" />
      <rect x="4" y="7" width="8" height="6" fill="var(--sage)" stroke="var(--ink)" strokeWidth="1.5" />
    </svg>
  );
}
function GlyphDisk() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" fill="var(--tan)" stroke="var(--ink)" strokeWidth="1.5" />
      <rect x="4" y="2" width="8" height="4" fill="var(--cream)" stroke="var(--ink)" strokeWidth="1" />
      <rect x="6" y="9" width="4" height="4" fill="var(--cream)" stroke="var(--ink)" strokeWidth="1" />
      <rect x="9.5" y="3" width="1.5" height="2" fill="var(--ink)" />
    </svg>
  );
}
