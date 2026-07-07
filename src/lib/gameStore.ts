// 极简游戏状态存储。localStorage 持久化 + React 订阅。
// 后续可平滑替换为 Zustand / Redux。

import { useSyncExternalStore } from "react";

export interface CharStats {
  study: number;
  money: number;
  mental: number;
  social: number;
  internship: number;
  energy: number;
}

export interface Achievement {
  id: string;
  label: string;
  emoji: string;
}

export interface EventLogEntry {
  week: number;
  phase: string;
  title: string;
  emoji: string;
}

export interface GameState {
  majorId: string | null;
  characterName: string;
  school: string;
  stats: CharStats;
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2; // 上/下
  week: number; // 1..16
  history: EventLogEntry[];
  achievements: Achievement[];
  finished: boolean;
}

const STORAGE_KEY = "cszmg_save_v1";

export const DEFAULT_STATS: CharStats = {
  study: 50,
  money: 40,
  mental: 60,
  social: 45,
  internship: 20,
  energy: 65,
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
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

export const gameStore = {
  get(): GameState {
    return state;
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  set(patch: Partial<GameState>) {
    state = { ...state, ...patch };
    emit();
  },
  reset() {
    state = makeInitialState();
    emit();
  },
  selectMajor(id: string) {
    state = { ...makeInitialState(), majorId: id };
    emit();
  },
  applyEffects(effects: { key: keyof CharStats; delta: number }[]) {
    const stats = { ...state.stats };
    for (const e of effects) {
      stats[e.key] = clamp(stats[e.key] + e.delta);
    }
    state = { ...state, stats };
    emit();
  },
  logEvent(entry: EventLogEntry) {
    state = { ...state, history: [entry, ...state.history].slice(0, 30) };
    emit();
  },
  addAchievement(a: Achievement) {
    if (state.achievements.find((x) => x.id === a.id)) return;
    state = { ...state, achievements: [...state.achievements, a] };
    emit();
  },
  advanceWeek(step = 4) {
    let { year, semester, week, finished } = state;
    week += step;
    if (week > 16) {
      week = 1;
      if (semester === 1) {
        semester = 2;
      } else {
        semester = 1;
        if (year >= 4) {
          finished = true;
        } else {
          year = (year + 1) as GameState["year"];
        }
      }
    }
    state = { ...state, year, semester, week, finished };
    emit();
  },
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

export function useGameState(): GameState {
  return useSyncExternalStore(
    gameStore.subscribe,
    gameStore.get,
    gameStore.get,
  );
}

export function phaseLabel(g: GameState) {
  const yearMap = ["大一", "大二", "大三", "大四"] as const;
  const semMap = ["上", "下"] as const;
  return `${yearMap[g.year - 1]}${semMap[g.semester - 1]} · 第 ${g.week} 周`;
}
