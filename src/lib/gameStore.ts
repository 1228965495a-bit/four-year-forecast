// 游戏状态存储（脚本引擎版）。localStorage 持久化 + React 订阅。
// 注意：模块加载阶段不读 localStorage，避免 SSR / 客户端首帧不一致导致 hydration 失败。
// 水合流程：SSR 与客户端首帧都渲染 emptyState → 挂载后 hydrateFromStorage() 触发一次更新。

import { useEffect, useSyncExternalStore } from "react";
import {
  initEngineForMajor,
  applyChoice as engineApplyChoice,
  getCurrentEvent,
  currentSemesterLabel,
  SEMESTER_KEYS,
  type EngineState,
} from "./scriptEngine";
import { checkMidGG, applyRevivePenalties } from "./midGgRules";


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
  /** 中途主动结束游戏（点顶部 结 按钮） */
  midwayFinished: boolean;
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
    usedRevive: false,
    midGgReason: null,
    midGgTitle: null,
    midGgSubtitle: null,
    midGgConclusion: null,
    midGgTags: [],
    pendingReviveReason: null,
    characterName: "新生同学",
    school: "云上大学",
    history: [],
    pendingAchievement: null,
    midwayFinished: false,
  };
}

// 稳定的 server / 首帧快照 —— 引用必须始终相同，否则 useSyncExternalStore 会死循环。
const SERVER_SNAPSHOT: GameState = emptyState();

let state: GameState = SERVER_SNAPSHOT;
let hydrated = false;
const listeners = new Set<() => void>();

let persistScheduled = false;
function persist() {
  if (typeof window === "undefined") return;
  if (persistScheduled) return;
  persistScheduled = true;
  // 把 JSON.stringify + localStorage 写入延后到下一个空闲，避免阻塞点击 → 界面切换
  const flush = () => {
    persistScheduled = false;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  };
  const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void) => void);
  if (ric) ric(flush); else setTimeout(flush, 0);
}
function emit() { listeners.forEach((l) => l()); persist(); }

function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    state = { ...emptyState(), ...JSON.parse(raw) };
    listeners.forEach((l) => l());
  } catch {
    /* ignore */
  }
}

export const gameStore = {
  get(): GameState { return state; },
  getServerSnapshot(): GameState { return SERVER_SNAPSHOT; },
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
    let merged: GameState = {
      ...state,
      ...next,
      history: [history, ...state.history].slice(0, 60),
      pendingAchievement: newAchievements[0] ?? state.pendingAchievement,
    };

    // 中途 GG 判定 —— 只在还没进入结局 / 还没排队续命时跑
    if (!merged.finished && !merged.midwayFinished && !merged.pendingReviveReason) {
      const hit = checkMidGG(merged, { usedRevive: merged.usedRevive });
      if (hit?.type === "revive_offer") {
        merged = { ...merged, pendingReviveReason: hit.reason };
      } else if (hit?.type === "mid_gg") {
        merged = {
          ...merged,
          midwayFinished: true,
          midGgReason: hit.reason,
          midGgTitle: hit.title,
          midGgSubtitle: hit.subtitle,
          midGgConclusion: hit.conclusion,
          midGgTags: hit.tags,
        };
      }
    }

    state = merged;
    emit();
  },

  /** 玩家接受嘴硬续命 —— 扣属性、清除续命窗口 */
  acceptRevive() {
    const s: GameState = {
      ...state,
      stats: { ...state.stats },
      hiddenStats: { ...state.hiddenStats },
    };
    applyRevivePenalties(s);
    s.usedRevive = true;
    s.pendingReviveReason = null;
    if (!s.achievements.includes("嘴硬续命")) s.achievements = [...s.achievements, "嘴硬续命"];
    state = s;
    emit();
  },

  /** 玩家拒绝嘴硬续命 —— 直接进入中途结算 */
  declineRevive() {
    const reason = state.pendingReviveReason;
    if (!reason) return;
    const hit = checkMidGG(state, { usedRevive: true });
    // usedRevive=true 会强制走 mid_gg 分支
    if (hit?.type === "mid_gg") {
      state = {
        ...state,
        midwayFinished: true,
        pendingReviveReason: null,
        midGgReason: hit.reason,
        midGgTitle: hit.title,
        midGgSubtitle: hit.subtitle,
        midGgConclusion: hit.conclusion,
        midGgTags: hit.tags,
      };
    } else {
      // 兜底：直接清窗口并结算
      state = { ...state, midwayFinished: true, pendingReviveReason: null, midGgReason: reason };
    }
    emit();
  },

  /** 主动结束按钮 —— 生成 manual_quit 结算数据 */
  quitToMidway() {
    const hit = checkMidGG(state, { manual: true, usedRevive: state.usedRevive });
    if (hit) {
      state = {
        ...state,
        midwayFinished: true,
        pendingReviveReason: null,
        midGgReason: hit.reason,
        midGgTitle: hit.title,
        midGgSubtitle: hit.subtitle,
        midGgConclusion: hit.conclusion,
        midGgTags: hit.tags,
      };
    } else {
      state = { ...state, midwayFinished: true };
    }
    emit();
  },


  clearPendingAchievement() {
    state = { ...state, pendingAchievement: null };
    emit();
  },
};

export function useGameState(): GameState {
  const snap = useSyncExternalStore(
    gameStore.subscribe,
    gameStore.get,
    gameStore.getServerSnapshot,
  );
  // 挂载后从 localStorage 水合一次；已水合则无操作。
  useEffect(() => { hydrateFromStorage(); }, []);
  return snap;
}

export function currentEventOf(g: GameState) {
  return getCurrentEvent(g);
}

export { SEMESTER_KEYS, currentSemesterLabel };

