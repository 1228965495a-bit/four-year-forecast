/**
 * HomeHeroScene — 纯 CSS 像素校园场景。
 * 天空 · 云 · 太阳 · 校门 · 教学楼 · 树 · 草地。
 * 未来正式素材路径：
 *   /assets/backgrounds/campus_day.png  →  替换整个 <div> 为 <img />
 */
export function HomeHeroScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 天空 */}
      <div className="sky-strip absolute inset-x-0 top-0 h-[62%]" />
      {/* 草地 */}
      <div className="grass-strip absolute inset-x-0 bottom-0 h-[38%]">
        {/* 草地上的像素小草 */}
        <div className="absolute inset-x-0 top-0 h-2 bg-[#7FB47A]" />
        <div className="absolute inset-x-0 top-2 h-1 bg-[#6BA267]" />
      </div>

      {/* 太阳 */}
      <div className="absolute right-[8%] top-[8%]">
        <div className="relative h-10 w-10 md:h-14 md:w-14">
          <div className="absolute inset-0 rounded-full bg-[#FFD86B] border-[3px] border-ink" />
          <div className="absolute inset-2 rounded-full bg-[#FFE79A]" />
        </div>
      </div>

      {/* 云 */}
      <Cloud className="left-[8%] top-[10%]" />
      <Cloud className="left-[30%] top-[18%] scale-75" />
      <Cloud className="right-[26%] top-[6%] scale-90" />

      {/* 远处山脉 */}
      <div className="absolute inset-x-0 top-[46%] h-16">
        <Mountain className="left-[6%]" tone="#7FA97A" />
        <Mountain className="left-[22%] scale-110" tone="#6E9A6B" />
        <Mountain className="right-[18%] scale-95" tone="#84B27E" />
      </div>

      {/* 教学楼 - 左 */}
      <Building
        className="left-[6%] bottom-[24%]"
        w={70}
        h={90}
        bodyColor="#F0C77A"
        roofColor="#C15A5A"
        windowRows={3}
        windowCols={3}
      />
      {/* 校门 - 中 */}
      <SchoolGate className="left-1/2 -translate-x-1/2 bottom-[20%]" />
      {/* 教学楼 - 右 */}
      <Building
        className="right-[8%] bottom-[24%]"
        w={90}
        h={110}
        bodyColor="#E8B486"
        roofColor="#8FA36B"
        windowRows={4}
        windowCols={3}
      />

      {/* 树 */}
      <Tree className="left-[26%] bottom-[16%]" />
      <Tree className="right-[26%] bottom-[14%] scale-110" />
      <Tree className="left-[42%] bottom-[10%] scale-90" tone="#7FB47A" />

      {/* 前景路灯 */}
      <StreetLamp className="left-[18%] bottom-[8%]" />
      <StreetLamp className="right-[16%] bottom-[6%]" />

      {/* 石板路 */}
      <div className="absolute left-1/2 bottom-0 h-8 w-40 -translate-x-1/2 bg-[#D8B583] border-t-[3px] border-ink">
        <div className="flex h-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-1 border-r-[2px] border-[#B08957] last:border-r-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

function Cloud({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute ${className}`}>
      {/* 块状像素云 */}
      <div className="relative h-6 w-20">
        <div className="absolute left-2 top-0 h-3 w-16 bg-white border-[2px] border-ink" />
        <div className="absolute left-0 top-2 h-3 w-20 bg-white border-[2px] border-ink" />
        <div className="absolute left-4 top-4 h-2 w-12 bg-[#F1F7FB]" />
      </div>
    </div>
  );
}

function Mountain({ className = "", tone = "#7FA97A" }: { className?: string; tone?: string }) {
  return (
    <div className={`absolute bottom-0 ${className}`}>
      <div
        className="h-12 w-24"
        style={{
          background: tone,
          clipPath: "polygon(0 100%, 50% 20%, 100% 100%)",
        }}
      />
    </div>
  );
}

function Tree({ className = "", tone = "#8FBF88" }: { className?: string; tone?: string }) {
  return (
    <div className={`absolute ${className}`}>
      <div className="relative h-14 w-10 md:h-20 md:w-14">
        {/* 树冠：多层像素方块 */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-6 w-8 md:h-8 md:w-12 border-[3px] border-ink rounded-md" style={{ background: tone }} />
        <div className="absolute left-1/2 top-3 -translate-x-1/2 h-6 w-10 md:h-9 md:w-14 border-[3px] border-ink rounded-md" style={{ background: tone }} />
        <div className="absolute left-1/2 top-6 -translate-x-1/2 h-2 w-4 md:h-3 md:w-5 bg-[#6E9E68] border-x-[2px] border-ink" />
        {/* 树干 */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-4 w-3 md:h-5 md:w-4 bg-[#8B5A3B] border-[2px] border-ink rounded-b-sm" />
      </div>
    </div>
  );
}

function Building({
  className = "",
  w,
  h,
  bodyColor,
  roofColor,
  windowRows,
  windowCols,
}: {
  className?: string;
  w: number;
  h: number;
  bodyColor: string;
  roofColor: string;
  windowRows: number;
  windowCols: number;
}) {
  return (
    <div className={`absolute ${className}`} style={{ width: w, height: h }}>
      {/* 屋顶 */}
      <div
        className="absolute inset-x-0 top-0 h-4 border-[3px] border-ink"
        style={{ background: roofColor }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[-6px] w-2 h-3 bg-[#C15A5A] border-[2px] border-ink"
        title="旗杆"
      />
      {/* 楼身 */}
      <div
        className="absolute inset-x-0 top-4 bottom-0 border-[3px] border-ink border-t-0 rounded-b-sm"
        style={{ background: bodyColor }}
      >
        {/* 窗户网格 */}
        <div
          className="absolute inset-2 grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${windowCols}, minmax(0,1fr))`,
            gridTemplateRows: `repeat(${windowRows}, minmax(0,1fr))`,
          }}
        >
          {Array.from({ length: windowRows * windowCols }).map((_, i) => (
            <div
              key={i}
              className="border-[2px] border-ink bg-[#FFE79A]"
              style={i === 2 ? { background: "#8FD0F2" } : undefined}
            />
          ))}
        </div>
        {/* 门 */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-4 h-6 bg-[#8B5A3B] border-x-[2px] border-t-[2px] border-ink rounded-t-sm" />
      </div>
    </div>
  );
}

function SchoolGate({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute ${className}`}>
      <div className="relative w-40 h-24">
        {/* 横匾 */}
        <div className="absolute inset-x-0 top-0 h-6 bg-[#C15A5A] border-[3px] border-ink flex items-center justify-center">
          <div className="pixel-panel-sm !bg-cream !shadow-none !border-[2px] px-2 py-[1px] text-[10px] font-bold text-ink font-[var(--font-display)]">
            云 上 大 学
          </div>
        </div>
        {/* 立柱左 */}
        <div className="absolute left-0 top-5 bottom-0 w-6 bg-[#E8B486] border-[3px] border-ink" />
        {/* 立柱右 */}
        <div className="absolute right-0 top-5 bottom-0 w-6 bg-[#E8B486] border-[3px] border-ink" />
        {/* 门开口的灯 */}
        <div className="absolute left-8 top-8 w-2 h-2 bg-[#FFD86B] border-[2px] border-ink animate-pixel-blink" />
        <div className="absolute right-8 top-8 w-2 h-2 bg-[#FFD86B] border-[2px] border-ink animate-pixel-blink" />
      </div>
    </div>
  );
}

function StreetLamp({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute ${className}`}>
      <div className="relative h-16 w-3">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 h-4 w-4 bg-[#FFD86B] border-[2px] border-ink rounded-sm" />
        <div className="absolute left-1/2 -translate-x-1/2 top-4 h-12 w-1 bg-ink" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 h-1 w-4 bg-ink" />
      </div>
    </div>
  );
}
