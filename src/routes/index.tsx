import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import {
  CampusScene,
  PixelAvatar,
  PixelCalendar,
  PixelCoffee,
  PixelBook,
  PixelNotebook,
  GlyphPlay,
  GlyphBook,
  GlyphPerson,
  GlyphDisk,
} from "@/components/game/PixelIcon";
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

  const onStart = () => {
    if (!hasSave) gameStore.reset();
    navigate({ to: "/major" });
  };
  const onCharacter = () => {
    const name =
      window.prompt("给你的角色起个名字：", game.characterName) ||
      game.characterName;
    const school = window.prompt("学校叫什么？", game.school) || game.school;
    gameStore.set({ characterName: name, school });
  };

  return (
    <PhoneFrame>
      <div className="flex flex-col gap-3 p-3 pb-6">
        {/* 顶部游戏标题栏 */}
        <div className="flex items-center gap-2 pixel-panel-sm !p-1.5 bg-ink !text-cream">
          <div className="h-5 w-5 bg-cherry border-2 border-cream" />
          <span className="font-display text-[11px] tracking-widest text-cream">
            CAMPUS · SIM · v0.2
          </span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-cream/80">
            <span className="h-1.5 w-1.5 bg-sage animate-pixel-blink" />
            LIVE
          </span>
        </div>

        {/* 中间校园主视觉 */}
        <div className="pixel-panel !p-0 overflow-hidden">
          <CampusScene height={170} />
        </div>

        {/* 主 Logo */}
        <div className="text-center pt-1">
          <div className="inline-block pixel-panel-sm bg-cherry !text-cream px-2 py-0.5 mb-2">
            <span className="font-display text-[10px] tracking-widest">
              CAMPUS LIFE SIMULATOR
            </span>
          </div>
          <h1 className="pixel-logo text-[30px] leading-[1.05]">
            这专业我
            <br />
            先替你读了四年
          </h1>
          <p className="mt-2 text-[12px] text-ink/80 leading-snug px-2">
            选择一个专业，开启一段离谱又真实的本科人生
          </p>
        </div>

        {/* 主菜单按钮区 */}
        <div className="pixel-panel !p-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-[12px] tracking-widest text-ink">
              主菜单
            </span>
            <span className="text-[10px] text-ink/50">按 ↵ 选择</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <MenuBtn label="开始模拟" hint={hasSave ? "继续" : "新档"} glyph={<GlyphPlay />} onClick={onStart} accent="cherry" primary />
            <MenuBtn label="专业图鉴" glyph={<GlyphBook />} onClick={() => navigate({ to: "/major" })} accent="sky" />
            <MenuBtn label="角色设定" glyph={<GlyphPerson />} onClick={onCharacter} accent="sage" />
            <MenuBtn
              label="读取进度"
              hint={hasSave ? "有存档" : "无存档"}
              glyph={<GlyphDisk />}
              onClick={() => navigate({ to: game.finished ? "/result" : "/semester" })}
              accent="sunny"
              disabled={!hasSave}
            />
          </div>
        </div>

        {/* 学生档案 */}
        <div className="pixel-panel !p-2.5 flex items-center gap-3">
          <div className="pixel-border-sm !shadow-none overflow-hidden shrink-0" style={{ width: 52, height: 52 }}>
            <PixelAvatar size={52} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="pixel-chip !py-0 !text-[10px] bg-sunny">新生档案</span>
              {hasSave && <span className="pixel-chip !py-0 !text-[10px] bg-sage">已入学</span>}
            </div>
            <div className="font-display text-[15px] leading-tight truncate">
              {hasSave ? game.characterName : "未创建角色"}
            </div>
            <div className="text-[11px] text-ink/70 truncate">
              {hasSave
                ? `${currentMajor?.name} · ${game.school}`
                : "点击「角色设定」创建你的角色"}
            </div>
          </div>
        </div>

        {/* 底部道具状态区 */}
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-1 w-1 bg-ink" />
            <span className="font-display text-[11px] tracking-widest text-ink/70">道具栏 · INVENTORY</span>
            <span className="h-px flex-1 bg-ink/20" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <PropItem
              icon={<PixelCalendar size={30} />}
              title="高考倒计时"
              value="12 天"
              tone="cherry"
            />
            <PropItem
              icon={<PixelBook size={30} />}
              title="志愿手册"
              value="未拆封"
              tone="sage"
            />
            <PropItem
              icon={<PixelCoffee size={30} />}
              title="今日咖啡"
              value="第 3 杯"
              tone="tan"
            />
            <PropItem
              icon={<PixelNotebook size={30} />}
              title="错题笔记"
              value="已翻烂"
              tone="sky"
            />
          </div>
        </div>

        <div className="text-center text-[10px] text-ink/50 pt-1">
          © Pixel Future · 每一次选择都会导向不同的人生
        </div>
      </div>
    </PhoneFrame>
  );
}

function MenuBtn({
  label,
  hint,
  glyph,
  onClick,
  accent,
  primary,
  disabled,
}: {
  label: string;
  hint?: string;
  glyph: React.ReactNode;
  onClick: () => void;
  accent: "cherry" | "sky" | "sage" | "sunny";
  primary?: boolean;
  disabled?: boolean;
}) {
  const bg =
    accent === "cherry"
      ? "var(--cherry)"
      : accent === "sky"
      ? "var(--sky)"
      : accent === "sage"
      ? "var(--sage)"
      : "var(--sunny)";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="pixel-btn flex flex-col items-start gap-1 p-2.5 text-left disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: bg, color: "var(--ink)" }}
    >
      <div className="flex items-center gap-1.5 w-full">
        <span className="inline-flex h-5 w-5 items-center justify-center bg-cream border-2 border-ink">
          {glyph}
        </span>
        {primary && <span className="ml-auto text-[9px] font-bold tracking-widest">PLAY</span>}
      </div>
      <div className="font-display text-[15px] leading-tight">{label}</div>
      {hint && <div className="text-[10px] text-ink/70">{hint}</div>}
    </button>
  );
}

function PropItem({
  icon,
  title,
  value,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  tone: "cherry" | "sky" | "sage" | "tan";
}) {
  const bg =
    tone === "cherry"
      ? "bg-cherry/25"
      : tone === "sky"
      ? "bg-sky/30"
      : tone === "sage"
      ? "bg-sage/30"
      : "bg-tan/40";
  return (
    <div className={`pixel-border-sm ${bg} flex items-center gap-2 p-1.5`}>
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] text-ink/70 leading-tight truncate">{title}</div>
        <div className="font-display text-[13px] leading-tight truncate">{value}</div>
      </div>
    </div>
  );
}
