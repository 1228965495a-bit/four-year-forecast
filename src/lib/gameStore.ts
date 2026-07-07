// 游戏状态存储（脚本引擎版）。localStorage 持久化 + React 订阅。

import { useSyncExternalStore } from "react";
import {
  initEngineForMajor,
  applyChoice as engineApplyChoice,
  getCurrentEvent,
  currentSemesterLabel,
  SEMESTER_KEYS,
  type EngineState,
} from "./scriptEngine";

export interface HistoryItem {
  semester: string;
  title: string;
  choice: string;
  feedback: string;
}

export interface GameState extends EngineState {
  characterName: string;
  school: string;
  history: HistoryItem[];
  /** 最近解锁的成就 id，用于弹 toast */
  pendingAchievement: string | null;
}

const STORAGE_KEY = "cszmg_save_v3";

function emptyState(): GameState {
  return {
    majorId: "",
    semesterIdx: 0,
    stats: {},
    majorStats: {},
    hiddenStats: {},
    flags: [],
    routes: [],
    seenEvents: [],
    achievements: [],
    currentEventId: null,
    ggRisk: 0,
    finished: false,
    endingId: null,
    semesterRandomShown: false,
    characterName: "新生同学",
    school: "云上大学",
    history: [],
    pendingAchievement: null,
  };
}

let state: GameState = load();
const listeners = new Set<() => void>();

function load(): GameState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}
function persist() {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}
function emit() { persist(); listeners.forEach((l) => l()); }

export const gameStore = {
  get(): GameState { return state; },
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  set(patch: Partial<GameState>) { state = { ...state, ...patch }; emit(); },
  reset() { state = emptyState(); emit(); },

  selectMajor(id: string) {
    const engine = initEngineForMajor(id);
    state = {
      ...emptyState(),
      ...engine,
      characterName: state.characterName,
      school: state.school,
    };
    emit();
  },

  applyChoice(choice: any) {
    const before = state;
    const { state: next, event, newAchievements } = engineApplyChoice(state, choice);
    const history: HistoryItem = {
      semester: currentSemesterLabel(before),
      title: event?.title ?? "",
      choice: choice?.text ?? "",
      feedback: choice?.feedback ?? choice?.resultText ?? "",
    };
    state = {
      ...state,
      ...next,
      history: [history, ...state.history].slice(0, 60),
      pendingAchievement: newAchievements[0] ?? state.pendingAchievement,
    };
    emit();
  },

  clearPendingAchievement() {
    state = { ...state, pendingAchievement: null };
    emit();
  },
};

export function useGameState(): GameState {
  return useSyncExternalStore(gameStore.subscribe, gameStore.get, gameStore.get);
}

export function currentEventOf(g: GameState) {
  return getCurrentEvent(g);
}

export { SEMESTER_KEYS, currentSemesterLabel };
