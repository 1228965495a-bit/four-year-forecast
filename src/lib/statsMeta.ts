// 通用可视 stats 元数据（对应 globalStats.json 的 visibleStats + hiddenStats）。

export interface StatMeta {
  key: string;
  label: string;
  short: string;
  color: string;
  hidden?: boolean;
}

export const STAT_META: StatMeta[] = [
  { key: "obsession",     label: "专业上头值", short: "上头",   color: "var(--cherry)" },
  { key: "energy",        label: "精神电量",   short: "电量",   color: "#6FB6E8" },
  { key: "filter",        label: "滤镜厚度",   short: "滤镜",   color: "var(--sunny)" },
  { key: "gpaWill",       label: "绩点求生欲", short: "绩点",   color: "var(--sage)" },
  { key: "careerFantasy", label: "就业幻觉值", short: "幻觉",   color: "#C9A8E8" },
  { key: "escapeImpulse", label: "跑路冲动",   short: "跑路",   color: "#E58A6B" },
  { key: "stubbornness",  label: "嘴硬浓度",   short: "嘴硬",   color: "var(--tan)",   hidden: true },
  { key: "hairline",      label: "发际线余额", short: "发际线", color: "#B87A4A",       hidden: true },
];

/** 学期页 HUD 展示的 6 项 */
export const HUD_STATS: StatMeta[] = STAT_META.filter((s) => !s.hidden);
