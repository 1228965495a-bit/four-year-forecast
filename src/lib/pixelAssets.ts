// 集中管理像素风素材路径，图片存放在 public/pixel-ui/**
// 使用示例：<img src={pixelAssets.headers.finalReport} />
export const pixelAssets = {
  panels: {
    large: "/pixel-ui/panels/panel-large.png",
    medium: "/pixel-ui/panels/panel-medium.png",
    small: "/pixel-ui/panels/panel-small.png",
    note: "/pixel-ui/panels/panel-note-yellow.png",
    report: "/pixel-ui/panels/panel-report-main.png",
  },
  buttons: {
    primary: "/pixel-ui/buttons/primary-default.png",
    secondary: "/pixel-ui/buttons/secondary-default.png",
    danger: "/pixel-ui/buttons/danger-default.png",
    chipDefault: "/pixel-ui/buttons/chip-default.png",
    chipActive: "/pixel-ui/buttons/chip-active.png",
  },
  badges: {
    tierS: "/pixel-ui/badges/tier-s.png",
    tierA: "/pixel-ui/badges/tier-a.png",
    tierB: "/pixel-ui/badges/tier-b.png",
    debuff: "/pixel-ui/badges/debuff-red.png",
    achievement: "/pixel-ui/badges/achievement-gold.png",
    tagRed: "/pixel-ui/badges/tag-red.png",
    tagGreen: "/pixel-ui/badges/tag-green.png",
    tagBlue: "/pixel-ui/badges/tag-blue.png",
    tagYellow: "/pixel-ui/badges/tag-yellow.png",
  },
  bars: {
    frame: "/pixel-ui/bars/stat-bar-frame.png",
    green: "/pixel-ui/bars/stat-bar-green.png",
    red: "/pixel-ui/bars/stat-bar-red.png",
    blue: "/pixel-ui/bars/stat-bar-blue.png",
    yellow: "/pixel-ui/bars/stat-bar-yellow.png",
  },
  headers: {
    finalReport: "/pixel-ui/headers/final-report.png",
    majorSelect: "/pixel-ui/headers/major-select.png",
    semester: "/pixel-ui/headers/semester.png",
  },
} as const;

export type PixelTier = "S" | "A" | "B" | "C";

export function tierBadgeSrc(tier: PixelTier): string {
  if (tier === "S") return pixelAssets.badges.tierS;
  if (tier === "A") return pixelAssets.badges.tierA;
  return pixelAssets.badges.tierB; // B/C 都用 B 徽章
}

export type BarColor = "green" | "red" | "blue" | "yellow";

export function pickBarColor(hex: string | undefined): BarColor {
  if (!hex) return "green";
  const c = hex.toLowerCase();
  if (c.includes("f47c") || c.includes("cherry") || c.includes("#e") || c.includes("red")) return "red";
  if (c.includes("8fd0") || c.includes("sky") || c.includes("blue")) return "blue";
  if (c.includes("ffd8") || c.includes("sunny") || c.includes("yellow")) return "yellow";
  return "green";
}
