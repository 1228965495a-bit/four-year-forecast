import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { CampusScene, GlyphPlay, GlyphBook, GlyphPerson, GlyphDisk } from "@/components/game/PixelIcon";
import { useGameState, gameStore } from "@/lib/gameStore";
import { majorById } from "@/data/script/majorCatalog";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelPanel } from "@/components/ui/PixelPanel";
import { PixelButton3 } from "@/components/pixel/PixelSkin";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const game = useGameState();
  const navigate = useNavigate();
  const currentMajor = game.majorId ? majorById[game.majorId] : null;
  const hasSave = !!currentMajor;

  const onStart = () => {
    if (!hasSave) gameStore.reset();
    navigate({ to: "/major" });
  };
  const onCharacter = () => {
    const name = window.prompt("给你的角色起个名字：", game.characterName) || game.characterName;
    const school = window.prompt("学校叫什么？", game.school) || game.school;
    gameStore.set({ characterName: name, school });
  };

  return (
    <PhoneFrame>
      <div className="flex flex-col gap-2.5 p-2.5 pb-4">
        {/* ============ 顶部游戏栏 ============ */}
        <div className="pixel-panel-sm !p-1.5 bg-ink !text-cream flex items-center gap-2">
          <div className="h-4 w-4 bg-cherry border-2 border-cream" />
          <span className="font-display text-[10px] tracking-widest text-cream">
            CAMPUS · SIM · v0.3
          </span>
          <span className="ml-auto flex items-center gap-1 text-[9px] text-cream/80">
            <span className="h-1.5 w-1.5 bg-sage animate-pixel-blink" />
            LIVE
          </span>
        </div>

        {/* ============ 游戏画面（校园场景 + 大标题）============ */}
        <div className="pixel-panel !p-0 overflow-hidden">
          <div className="relative">
            <CampusScene height={190} />
            <div className="absolute inset-0 pixel-scanlines pointer-events-none opacity-30" />
            {/* Logo 悬浮 */}
            <div className="absolute inset-x-0 bottom-2 flex justify-center">
              <div className="inline-block pixel-panel-sm bg-cherry !text-cream !shadow-[3px_3px_0_0_var(--ink)] px-2.5 py-0.5">
                <span className="font-display text-[10px] tracking-[0.2em] text-cream">
                  ENTER · UNIVERSITY · DUNGEON
                </span>
              </div>
            </div>
          </div>
          <div className="border-t-[3px] border-ink bg-cream text-center px-3 py-3">
            <h1 className="pixel-logo text-[24px] leading-[1.05]">
              这专业我
              <br />
              先替你读了四年
            </h1>
            <p className="mt-2 text-[11px] text-ink/70 leading-snug">
              选一个专业，进入一段离谱又真实的本科副本
            </p>
          </div>
        </div>

        {/* ============ 主菜单 ============ */}
        <PixelPanel
          title="主菜单 · MAIN MENU"
          titleRight={<span className="text-[10px] opacity-70">按 ↵ 选择</span>}
          bodyClassName="p-2.5 space-y-2"
        >
          <PixelButton3 variant="primaryTall" onClick={onStart}>
            <span className="flex items-center gap-2.5 px-1">
              <span className="inline-flex h-7 w-7 items-center justify-center bg-cream border-2 border-ink shrink-0 text-ink">
                <GlyphPlay />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-display text-[15px] text-cream">
                  {hasSave ? "继续本科副本" : "开始模拟"}
                </span>
                <span className="text-[10px] text-cream/85">
                  {hasSave ? "读取当前存档" : "创建新档案"}
                </span>
              </span>
              <span className="ml-2 text-[9px] font-display tracking-widest bg-ink text-cream px-1.5 py-0.5">
                PLAY ▶
              </span>
            </span>
          </PixelButton3>
          <div className="grid grid-cols-3 gap-2">
            <MiniMenuBtn label="专业图鉴" glyph={<GlyphBook />} accent="sky" onClick={() => navigate({ to: "/major" })} />
            <MiniMenuBtn label="角色设定" glyph={<GlyphPerson />} accent="sage" onClick={onCharacter} />
            <MiniMenuBtn
              label="读取进度"
              glyph={<GlyphDisk />}
              accent="sunny"
              onClick={() => navigate({ to: game.finished ? "/result" : "/semester" })}
              disabled={!hasSave}
            />
          </div>
        </PixelPanel>

        {/* ============ 学生档案速览 + 便签 ============ */}
        <div className="grid grid-cols-5 gap-2">
          <PixelPanel size="sm" className="col-span-3" bodyClassName="p-2">
            <div className="text-[9px] font-display tracking-widest text-ink/60">PROFILE</div>
            <div className="font-display text-[13px] leading-tight truncate mt-0.5">
              {hasSave ? game.characterName : "未创建角色"}
            </div>
            <div className="text-[10px] text-ink/70 truncate">
              {hasSave ? `${currentMajor?.name} · ${game.school}` : "点击「角色设定」创建角色"}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="tag-badge tag-fun">新生档案</span>
              {hasSave && <span className="tag-badge tag-stable">已入学</span>}
              {game.finished && <span className="tag-badge tag-hot">已毕业</span>}
            </div>
          </PixelPanel>

          {/* 便签 */}
          <div
            className="col-span-2 relative border-[3px] border-ink shadow-[3px_3px_0_0_var(--ink)] p-2 -rotate-2"
            style={{ background: "var(--parchment)" }}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-3 w-8 bg-cherry border-2 border-ink" />
            <div className="text-[9px] font-display tracking-widest text-ink/60">今日提示</div>
            <div className="text-[11px] leading-snug mt-0.5">
              嘴硬 ≠ 真爱，跑路 ≠ 失败。
            </div>
          </div>
        </div>

        <div className="text-center text-[9px] text-ink/50 pt-0.5">
          © Pixel Future · 每一次选择都会导向不同的人生
        </div>
      </div>
    </PhoneFrame>
  );
}

function MenuRow({
  label,
  hint,
  glyph,
  onClick,
  accent,
  primary,
}: {
  label: string;
  hint?: string;
  glyph: React.ReactNode;
  onClick: () => void;
  accent: "cherry" | "sky" | "sage" | "sunny";
  primary?: boolean;
}) {
  const bg =
    accent === "cherry" ? "var(--cherry)" :
    accent === "sky" ? "var(--sky)" :
    accent === "sage" ? "var(--sage)" : "var(--sunny)";
  return (
    <button
      onClick={onClick}
      className="pixel-btn w-full flex items-center gap-2.5 p-2.5 text-left"
      style={{ background: bg, color: primary ? "var(--cream)" : "var(--ink)" }}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center bg-cream border-2 border-ink shrink-0">
        {glyph}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-display text-[15px] leading-tight">{label}</div>
        {hint && <div className="text-[10px] opacity-80">{hint}</div>}
      </div>
      {primary && (
        <span className="text-[9px] font-display tracking-widest bg-ink text-cream px-1.5 py-0.5">
          PLAY ▶
        </span>
      )}
    </button>
  );
}

function MiniMenuBtn({
  label, glyph, onClick, accent, disabled,
}: {
  label: string;
  glyph: React.ReactNode;
  onClick: () => void;
  accent: "cherry" | "sky" | "sage" | "sunny";
  disabled?: boolean;
}) {
  const bg =
    accent === "cherry" ? "var(--cherry)" :
    accent === "sky" ? "var(--sky)" :
    accent === "sage" ? "var(--sage)" : "var(--sunny)";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="pixel-btn flex flex-col items-center gap-1 py-1.5"
      style={{ background: bg }}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center bg-cream border-2 border-ink">
        {glyph}
      </span>
      <span className="font-display text-[11px] leading-none">{label}</span>
    </button>
  );
}

// silence unused
void PixelButton;
