// 游戏状态存储。localStorage 持久化 + React 订阅。
// 属性体系已重构：明面 6 项 + 隐藏 2 项（不常驻显示）。

import { useSyncExternalStore } from "react";

export interface CharStats {
  /** 明面：专业上头值（短标签：上头） */
  obsession: number;
  /** 明面：精神电量（短标签：电量） */
  battery: number;
  /** 明面：滤镜厚度（短标签：滤镜） */
  filter: number;
  /** 明面：绩点求生欲（短标签：绩点） */
  gpa: number;
  /** 明面：就业幻觉值（短标签：幻觉） */
  illusion: number;
  /** 明面：跑路冲动（短标签：跑路） */
  escape: number;
  /** 隐藏：嘴硬浓度 */
  mouthHard: number;
  /** 隐藏：发际线余额 */
  hairline: number;
}

export const STAT_META: {
  key: keyof CharStats;
  label: string;
  short: string;
  color: string;
  hidden?: boolean;
}[] = [
  { key: "obsession", label: "专业上头值", short: "上头", color: "var(--cherry)" },
  { key: "battery", label: "精神电量", short: "电量", color: "#6FB6E8" },
  { key: "filter", label: "滤镜厚度", short: "滤镜", color: "var(--sunny)" },
  { key: "gpa", label: "绩点求生欲", short: "绩点", color: "var(--sage)" },
  { key: "illusion", label: "就业幻觉值", short: "幻觉", color: "#C9A8E8" },
  { key: "escape", label: "跑路冲动", short: "跑路", color: "#E58A6B" },
  { key: "mouthHard", label: "嘴硬浓度", short: "嘴硬", color: "var(--tan)", hidden: true },
  { key: "hairline", label: "发际线余额", short: "发际线", color: "#B87A4A", hidden: true },
];

export const VISIBLE_STATS = STAT_META.filter((s) => !s.hidden);

export interface Achievement {
  id: string;
  label: string;
}

export interface EventLogEntry {
  step: number;
  phase: string;
  title: string;
  choice: string;
}

export interface GameState {
  majorId: string | null;
  characterName: string;
  school: string;
  stats: CharStats;
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  week: number; // 1..16
  step: number; // 已完成的事件数
  history: EventLogEntry[];
  achievements: Achievement[];
  finished: boolean;
}

const STORAGE_KEY = "cszmg_save_v2";
const STEP_ADVANCE = 6; // 每个事件推进 6 周
export const TOTAL_STEPS = Math.ceil((4 * 2 * 16) / STEP_ADVANCE); // ~23

export const DEFAULT_STATS: CharStats = {
  obsession: 62,
  battery: 72,
  filter: 82,
  gpa: 50,
  illusion: 50,
  escape: 20,
  mouthHard: 40,
  hairline: 80,
};

export function makeInitialState(): GameState {
  return {
    majorId: null,
    characterName: "新生同学",
    school: "云上大学",
    stats: { ...DEFAULT_STATS },
    year: 1,
    semester: 1,
    week: 1,
    step: 0,
    history: [],
    achievements: [],
    finished: false,
  };
}

let state: GameState = load();
const listeners = new Set<() => void>();

function load(): GameState {
  if (typeof window === "undefined") return makeInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeInitialState();
    return { ...makeInitialState(), ...JSON.parse(raw) };
  } catch {
    return makeInitialState();
  }
}
function persist() {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}
function emit() { persist(); listeners.forEach((l) => l()); }

function clamp(n: number) { return Math.max(0, Math.min(100, n)); }

export const gameStore = {
  get(): GameState { return state; },
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  set(patch: Partial<GameState>) { state = { ...state, ...patch }; emit(); },
  reset() { state = makeInitialState(); emit(); },
  selectMajor(id: string) {
    state = { ...makeInitialState(), majorId: id };
    emit();
  },
  applyEffects(effects: { key: keyof CharStats; delta: number }[]) {
    const stats = { ...state.stats };
    for (const e of effects) stats[e.key] = clamp(stats[e.key] + e.delta);
    state = { ...state, stats };
    emit();
  },
  logEvent(entry: EventLogEntry) {
    state = { ...state, history: [entry, ...state.history].slice(0, 40) };
    emit();
  },
  addAchievement(a: Achievement) {
    if (state.achievements.find((x) => x.id === a.id)) return;
    state = { ...state, achievements: [...state.achievements, a] };
    emit();
  },
  /** 推进一个事件步（约 6 周）。到 128 周结束模拟。 */
  advanceStep() {
    let { year, semester, week, step, finished } = state;
    step += 1;
    week += STEP_ADVANCE;
    while (week > 16) {
      week -= 16;
      if (semester === 1) semester = 2;
      else {
        semester = 1;
        if (year >= 4) { finished = true; break; }
        year = (year + 1) as GameState["year"];
      }
    }
    if (step >= TOTAL_STEPS) finished = true;
    state = { ...state, year, semester, week, step, finished };
    emit();
  },
};

export function useGameState(): GameState {
  return useSyncExternalStore(gameStore.subscribe, gameStore.get, gameStore.get);
}

export function phaseLabel(g: GameState) {
  const yearMap = ["大一", "大二", "大三", "大四"] as const;
  const semMap = ["上", "下"] as const;
  return `${yearMap[g.year - 1]}${semMap[g.semester - 1]} · 第 ${g.week} 周`;
}
