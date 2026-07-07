import type { SceneKey } from "@/data/events";
import type { SceneAssetConfig } from "@/data/sceneAssets";

/**
 * 场景舞台：根据事件的 sceneKey 渲染一个像素风校园场景。
 * 默认使用 CSS 像素块拼接作为占位；后续只需在 sceneAssets.ts 中配置对应
 * 场景的素材（image/gif/sprite/lottie），即可无缝替换为真实素材。
 */
export function SceneStage({
  scene,
  badge,
  title,
  caption,
  asset,
}: {
  scene: SceneKey;
  badge?: string;
  title?: string;
  caption?: string;
  asset?: SceneAssetConfig;
}) {
  const hideCharacter = asset?.hideCharacter ?? false;
  return (
    <div className="scene-stage">
      <div className="absolute inset-0">
        {asset ? <SceneAsset config={asset} /> : renderScene(scene)}
      </div>
      {title && <div className="scene-title-banner">{title}</div>}
      {caption && <div className="scene-speech">{shortenCaption(caption)}</div>}
      {!hideCharacter && <PixelStudent />}
      {badge && (
        <div className="scene-badge">
          <span className="h-1.5 w-1.5 bg-cherry" />
          {badge}
        </div>
      )}
      {/* 扫描线 */}
      <div className="absolute inset-0 pixel-scanlines pointer-events-none opacity-40" />
    </div>
  );
}

function SceneAsset({ config }: { config: SceneAssetConfig }) {
  const { type, src, alt = "", objectFit = "cover", backgroundColor = "var(--cream)" } = config;

  switch (type) {
    case "image":
    case "gif": {
      return (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full"
          style={{ objectFit, backgroundColor, imageRendering: "pixelated" }}
        />
      );
    }
    case "sprite": {
      // 有精灵图参数时启用 CSS steps 动画；暂时无素材时直接展示第一帧占位
      if (config.frameWidth && config.frameCount && config.frameHeight) {
        return (
          <SpriteSheet
            src={src}
            frameWidth={config.frameWidth}
            frameHeight={config.frameHeight}
            frameCount={config.frameCount}
            fps={config.fps ?? 8}
            backgroundColor={backgroundColor}
          />
        );
      }
      return (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full"
          style={{ objectFit, backgroundColor, imageRendering: "pixelated" }}
        />
      );
    }
    case "lottie": {
      // Lottie 素材由外部库渲染，此处预留容器，接入时替换为 Lottie 播放器
      return (
        <div
          className="absolute inset-0 grid place-items-center text-[10px] text-ink/60"
          style={{ backgroundColor }}
        >
          <span className="font-display">Lottie 素材占位：{alt}</span>
        </div>
      );
    }
    default:
      return null;
  }
}

function SpriteSheet({
  src,
  frameWidth,
  frameHeight,
  frameCount,
  fps,
  backgroundColor,
}: {
  src: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps: number;
  backgroundColor: string;
}) {
  const duration = Math.max(0.3, frameCount / fps);
  return (
    <div
      className="absolute inset-0 h-full w-full"
      style={{
        backgroundColor,
        backgroundImage: `url(${src})`,
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 100%",
        imageRendering: "pixelated",
        animation: `sprite-steps-${frameCount} ${duration}s steps(${frameCount - 1}) infinite`,
      }}
    />
  );
}


function shortenCaption(text: string) {
  return text.length > 18 ? `${text.slice(0, 18)}…` : text;
}

function PixelStudent() {
  return (
    <div className="pixel-student" aria-hidden>
      <div className="pixel-student-head" />
      <div className="pixel-student-hair" />
      <div className="pixel-student-face" />
      <div className="pixel-student-body" />
      <div className="pixel-student-leg left" />
      <div className="pixel-student-leg right" />
    </div>
  );
}

function renderScene(k: SceneKey) {
  switch (k) {
    case "classroom":
      return <SceneClassroom />;
    case "library":
      return <SceneLibrary />;
    case "dorm":
      return <SceneDorm />;
    case "canteen":
      return <SceneCanteen />;
    case "field":
      return <SceneField />;
    case "club":
      return <SceneClub />;
    case "office":
      return <SceneOffice />;
    case "corridor":
    default:
      return <SceneCorridor />;
  }
}

/* --- 单独场景。均为绝对定位的 CSS 拼块。 --- */

function SceneClassroom() {
  return (
    <div className="absolute inset-0 bg-[#F4E8D0]">
      {/* 黑板 */}
      <div className="absolute left-4 right-4 top-3 h-14 bg-[#3D4E38] border-[3px] border-ink shadow-[3px_3px_0_0_var(--ink)]">
        <div className="absolute bottom-1 left-2 h-0.5 w-6 bg-cream/70" />
        <div className="absolute bottom-1 left-10 h-0.5 w-10 bg-cream/70" />
        <div className="absolute top-2 left-3 h-0.5 w-16 bg-cream/60" />
        <div className="absolute top-4 left-3 h-0.5 w-10 bg-cream/50" />
      </div>
      {/* 讲台 */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-10 h-4 w-14 bg-tan border-[3px] border-ink" />
      {/* 学生桌椅 */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <div
            key={`${row}-${col}`}
            className="absolute h-2.5 w-4 bg-[#B57C4D] border-2 border-ink"
            style={{
              left: 20 + col * 32,
              bottom: 14 + row * 14,
            }}
          />
        ))
      )}
      {/* 地板 */}
      <div className="absolute inset-x-0 bottom-0 h-3 bg-[#7B4A2A] border-t-[3px] border-ink" />
    </div>
  );
}

function SceneLibrary() {
  return (
    <div className="absolute inset-0 bg-[#EFE0BF]">
      {/* 书架 */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute top-3 h-24 w-8 border-[3px] border-ink bg-[#7B4A2A]"
          style={{ left: 12 + i * 44 }}
        >
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="absolute inset-x-0 h-4 border-b-2 border-ink flex gap-[1px] px-0.5 pt-0.5">
              {[0, 1, 2].map((c) => (
                <div key={c} className={`flex-1 border border-ink`} style={{ background: ["#F47C8C","#8FD0F2","#A8CFA3","#FFD86B","#E4C79A"][((row+c+i)*3)%5] }} />
              ))}
            </div>
          ))}
        </div>
      ))}
      {/* 台灯 + 桌 */}
      <div className="absolute right-3 bottom-8 h-10 w-16 bg-[#B57C4D] border-[3px] border-ink" />
      <div className="absolute right-5 bottom-16 h-6 w-4 bg-sunny border-2 border-ink animate-lamp" />
      {/* 地板 */}
      <div className="absolute inset-x-0 bottom-0 h-3 bg-[#7B4A2A] border-t-[3px] border-ink" />
    </div>
  );
}

function SceneDorm() {
  return (
    <div className="absolute inset-0 bg-[#FCE9D6]">
      {/* 窗户（夜） */}
      <div className="absolute top-3 right-4 h-14 w-16 bg-[#22314A] border-[3px] border-ink">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {[0,1,2,3].map(i => <div key={i} className="border border-ink" />)}
        </div>
        <div className="absolute top-1 right-1 h-1.5 w-1.5 bg-cream animate-star" />
        <div className="absolute top-4 right-4 h-1 w-1 bg-cream animate-star2" />
      </div>
      {/* 上下铺 */}
      <div className="absolute left-3 top-4 h-8 w-24 bg-tan border-[3px] border-ink" />
      <div className="absolute left-3 top-16 h-8 w-24 bg-[#F47C8C] border-[3px] border-ink" />
      <div className="absolute left-3 top-4 h-20 w-2 bg-ink" />
      <div className="absolute left-25 top-4 h-20 w-2 bg-ink" style={{ left: 100 }} />
      {/* 台灯闪烁 */}
      <div className="absolute right-4 bottom-8 h-4 w-3 bg-sunny border-2 border-ink animate-lamp" />
      <div className="absolute inset-x-0 bottom-0 h-3 bg-[#B57C4D] border-t-[3px] border-ink" />
    </div>
  );
}

function SceneCanteen() {
  return (
    <div className="absolute inset-0 bg-[#F6E3C4]">
      {/* 打饭窗口 */}
      <div className="absolute top-3 left-3 right-3 h-10 bg-[#D9B27A] border-[3px] border-ink">
        <div className="absolute inset-x-2 top-2 h-1.5 bg-ink/70" />
        <div className="absolute inset-x-2 bottom-2 h-1.5 bg-ink/70" />
      </div>
      {/* 桌子 */}
      <div className="absolute left-4 bottom-4 h-6 w-24 bg-cream border-[3px] border-ink" />
      {/* 餐盘 */}
      <div className="absolute left-8 bottom-10 h-3 w-6 bg-cream border-2 border-ink" />
      <div className="absolute left-10 bottom-11 h-1.5 w-2 bg-cherry border border-ink" />
      <div className="absolute left-14 bottom-11 h-1.5 w-2 bg-sage border border-ink" />
      {/* 水汽（动） */}
      <div className="absolute left-11 bottom-14 h-3 w-1 bg-cream/70 border border-ink/30 animate-steam" />
      <div className="absolute inset-x-0 bottom-0 h-2 bg-[#7B4A2A] border-t-[3px] border-ink" />
    </div>
  );
}

function SceneField() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-0 top-0 h-[55%] sky-strip" />
      <div className="absolute top-2 left-8 h-2 w-8 bg-cream border-2 border-ink rounded-sm animate-cloud" />
      <div className="absolute top-6 left-24 h-2 w-6 bg-cream border-2 border-ink rounded-sm animate-cloud2" />
      {/* 跑道 */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[#C86A5A] border-t-[3px] border-ink">
        <div className="absolute inset-x-0 top-4 h-0.5 bg-cream/70" />
        <div className="absolute inset-x-0 top-9 h-0.5 bg-cream/70" />
        <div className="absolute inset-x-0 top-14 h-0.5 bg-cream/70" />
      </div>
      {/* 小人 */}
      <div className="absolute bottom-6 left-8 w-4 h-6 animate-runner">
        <div className="absolute inset-x-0 top-0 h-2 bg-[#F4D2B0] border border-ink" />
        <div className="absolute inset-x-0 bottom-0 h-3 bg-cherry border border-ink" />
      </div>
    </div>
  );
}

function SceneClub() {
  return (
    <div className="absolute inset-0 bg-[#EAF3E2]">
      {/* 招新横幅 */}
      <div className="absolute top-3 left-3 right-3 h-8 bg-cherry border-[3px] border-ink flex items-center justify-center">
        <span className="font-display text-cream text-[12px] tracking-wide">社团招新</span>
      </div>
      {/* 桌子摊位 */}
      {[0,1,2].map(i => (
        <div key={i} className="absolute bottom-8 h-6 w-12 border-[3px] border-ink" style={{ left: 8 + i*44, background: ["#FFD86B","#8FD0F2","#F47C8C"][i] }}>
          <div className="absolute inset-x-1 top-1 h-1 bg-ink/60" />
        </div>
      ))}
      {/* 气球 */}
      <div className="absolute top-14 left-16 h-4 w-3 bg-sunny border border-ink animate-balloon" />
      <div className="absolute top-14 right-16 h-4 w-3 bg-sky border border-ink animate-balloon2" />
      <div className="absolute inset-x-0 bottom-0 h-4 grass-strip border-t-[3px] border-ink" />
    </div>
  );
}

function SceneOffice() {
  return (
    <div className="absolute inset-0 bg-[#EEE1CB]">
      {/* 显示器 */}
      <div className="absolute top-4 left-4 h-14 w-20 bg-ink border-[3px] border-ink">
        <div className="absolute inset-1 bg-[#2C4C6B] flex flex-col justify-around p-1">
          <div className="h-0.5 bg-cream/70" />
          <div className="h-0.5 bg-cream/70 w-2/3" />
          <div className="h-0.5 bg-cream/70 w-1/2" />
          <div className="h-0.5 bg-cherry/70 animate-cursor" />
        </div>
      </div>
      {/* 桌子 */}
      <div className="absolute inset-x-3 bottom-8 h-4 bg-tan border-[3px] border-ink" />
      {/* 椅子 */}
      <div className="absolute right-6 bottom-2 h-6 w-6 bg-[#B57C4D] border-[3px] border-ink" />
      {/* 咖啡 */}
      <div className="absolute right-2 bottom-14 h-4 w-4 bg-[#6B4A2E] border-2 border-ink" />
      <div className="absolute right-3 bottom-18 h-2 w-1 bg-cream/60 border border-ink/30 animate-steam" />
      <div className="absolute inset-x-0 bottom-0 h-2 bg-[#7B4A2A] border-t-[3px] border-ink" />
    </div>
  );
}

function SceneCorridor() {
  return (
    <div className="absolute inset-0 bg-[#F0E4C7]">
      {/* 墙上通知栏 */}
      <div className="absolute top-3 left-4 h-16 w-24 bg-cream border-[3px] border-ink">
        {[0,1,2,3].map(i => (
          <div key={i} className="absolute h-3 w-4 border border-ink" style={{ left: 4 + (i%2)*10, top: 4 + Math.floor(i/2)*7, background: ["#F47C8C","#8FD0F2","#A8CFA3","#FFD86B"][i], transform: `rotate(${(i%2? -3: 3)}deg)` }} />
        ))}
      </div>
      {/* 门 */}
      <div className="absolute right-6 top-3 h-24 w-14 bg-[#7B4A2A] border-[3px] border-ink">
        <div className="absolute right-2 top-1/2 h-1 w-1 bg-sunny border border-ink" />
      </div>
      {/* 地板透视线 */}
      <div className="absolute inset-x-0 bottom-0 h-6 bg-[#B57C4D] border-t-[3px] border-ink">
        <div className="absolute inset-x-0 top-1 h-0.5 bg-ink/40" />
        <div className="absolute inset-x-0 top-3 h-0.5 bg-ink/30" />
      </div>
    </div>
  );
}
