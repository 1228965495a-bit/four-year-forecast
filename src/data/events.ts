// 学期事件数据。effects 内每项对应角色属性的增减。
// 后续可以按 majorId 定制专属事件。

import type { CharStats } from "@/lib/gameStore";

export type EventCategory =
  | "学业"
  | "社交"
  | "休闲"
  | "实习"
  | "健康"
  | "特殊";

export interface EventEffect {
  key: keyof CharStats;
  delta: number;
}

export interface GameEvent {
  id: string;
  title: string;
  emoji: string;
  description: string;
  category: EventCategory;
  effects: EventEffect[];
  costLabel?: string; // 例："消耗 2 周"
  gainLabel?: string; // 例："学业 +10 精神 -5"
  weight?: number; // 抽卡权重，默认 1
}

export const EVENTS: GameEvent[] = [
  {
    id: "study_final",
    title: "准备期末",
    emoji: "📖",
    description: "关掉手机，通宵三天，只求不挂科。",
    category: "学业",
    effects: [
      { key: "study", delta: 15 },
      { key: "energy", delta: -18 },
      { key: "mental", delta: -8 },
    ],
    costLabel: "3 天",
    gainLabel: "学业 +15 · 精神 -8 · 体力 -18",
  },
  {
    id: "contest",
    title: "参加竞赛",
    emoji: "🏆",
    description: "熬夜写方案，赌一个含金量证书。",
    category: "学业",
    effects: [
      { key: "study", delta: 10 },
      { key: "internship", delta: 8 },
      { key: "energy", delta: -15 },
      { key: "mental", delta: -6 },
    ],
    costLabel: "2 周",
    gainLabel: "学业 +10 · 实习 +8 · 体力 -15",
  },
  {
    id: "club",
    title: "加入社团",
    emoji: "🎭",
    description: "认识新朋友，也可能被安排做海报。",
    category: "社交",
    effects: [
      { key: "social", delta: 12 },
      { key: "mental", delta: 6 },
      { key: "energy", delta: -6 },
      { key: "money", delta: -4 },
    ],
    gainLabel: "社交 +12 · 精神 +6 · 金钱 -4",
  },
  {
    id: "intern",
    title: "寻找实习",
    emoji: "💼",
    description: "投简历、面试、被鸽，如此循环。",
    category: "实习",
    effects: [
      { key: "internship", delta: 15 },
      { key: "money", delta: 12 },
      { key: "energy", delta: -10 },
      { key: "study", delta: -4 },
    ],
    gainLabel: "实习 +15 · 金钱 +12 · 学业 -4",
  },
  {
    id: "chill",
    title: "摸鱼休息",
    emoji: "🛌",
    description: "打游戏、追剧、逛 B 站，回血。",
    category: "休闲",
    effects: [
      { key: "energy", delta: 15 },
      { key: "mental", delta: 8 },
      { key: "study", delta: -6 },
    ],
    gainLabel: "体力 +15 · 精神 +8 · 学业 -6",
  },
  {
    id: "gym",
    title: "去趟操场",
    emoji: "🏃",
    description: "跑两圈，再来一杯电解质水。",
    category: "健康",
    effects: [
      { key: "energy", delta: 12 },
      { key: "mental", delta: 6 },
    ],
    gainLabel: "体力 +12 · 精神 +6",
  },
  {
    id: "date",
    title: "食堂偶遇",
    emoji: "💌",
    description: "打饭排队时的十秒钟对视。",
    category: "社交",
    effects: [
      { key: "social", delta: 10 },
      { key: "mental", delta: 10 },
      { key: "study", delta: -4 },
    ],
    gainLabel: "社交 +10 · 精神 +10",
  },
  {
    id: "part_time",
    title: "接个私活",
    emoji: "💸",
    description: "帮学长做 PPT，赚一顿海底捞。",
    category: "实习",
    effects: [
      { key: "money", delta: 15 },
      { key: "energy", delta: -8 },
      { key: "study", delta: -3 },
    ],
    gainLabel: "金钱 +15 · 体力 -8",
  },
  {
    id: "library",
    title: "图书馆霸位",
    emoji: "📚",
    description: "早八占座，一坐一整天。",
    category: "学业",
    effects: [
      { key: "study", delta: 12 },
      { key: "energy", delta: -8 },
      { key: "social", delta: -4 },
    ],
    gainLabel: "学业 +12 · 体力 -8",
  },
  {
    id: "trip",
    title: "周末小旅行",
    emoji: "🎒",
    description: "去邻校吃顿好的，顺便拍照。",
    category: "休闲",
    effects: [
      { key: "mental", delta: 15 },
      { key: "social", delta: 8 },
      { key: "money", delta: -12 },
      { key: "energy", delta: 4 },
    ],
    gainLabel: "精神 +15 · 社交 +8 · 金钱 -12",
  },
  {
    id: "cert",
    title: "刷证书",
    emoji: "📜",
    description: "背题库背到怀疑人生。",
    category: "学业",
    effects: [
      { key: "study", delta: 10 },
      { key: "internship", delta: 6 },
      { key: "mental", delta: -8 },
    ],
    gainLabel: "学业 +10 · 实习 +6 · 精神 -8",
  },
  {
    id: "sleep_in",
    title: "翘一节早八",
    emoji: "😴",
    description: "被窝的引力大于早八的意义。",
    category: "特殊",
    effects: [
      { key: "energy", delta: 10 },
      { key: "study", delta: -8 },
      { key: "mental", delta: 4 },
    ],
    gainLabel: "体力 +10 · 学业 -8",
  },
];

export function getEventById(id: string) {
  return EVENTS.find((e) => e.id === id);
}
