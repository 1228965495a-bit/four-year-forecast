// 游戏状态存储（脚本引擎版）。localStorage 持久化 + React 订阅。
// 注意：模块加载阶段不读 localStorage，避免 SSR / 客户端首帧不一致导致 hydration 失败。
// 水合流程：SSR 与客户端首帧都渲染 emptyState → 挂载后 hydrateFromStorage() 触发一次更新。

import { useEffect, useSyncExternalStore } from "react";
import type { EngineState } from "./scriptEngine";
import { SEMESTER_KEYS, currentSemesterLabelFromIndex } from "@/data/script/semesterMeta";
import { majorById } from "@/data/script/majorCatalog";
import { canEnterMajorGame } from "@/data/majorExperienceConfig";
import { checkMidGG, applyRevivePenalties } from "./midGgRules";
import { archiveLawResult, createLawRunState, deriveLawResult, EMPTY_LAW_ARCHIVE, LAW_MEMORIES, pickLawCoreEvent, type LawArchive } from "./lawRoguelite";
import { archiveCSResult, createCSRunState, CS_MEMORIES, deriveCSResult, EMPTY_CS_ARCHIVE, pickCSCoreEvent, type CSArchive } from "./computerScienceRoguelite";
import { CLINICAL_MEMORIES, createClinicalRunState, deriveClinicalResult, pickClinicalCoreEvent } from "./clinicalMedicineRoguelite";
import { CHINESE_MEMORIES, createChineseRunState, deriveChineseResult, pickChineseCoreEvent } from "./chineseLiteratureRoguelite";
import { ACCOUNTING_MEMORIES, createAccountingRunState, deriveAccountingResult, pickAccountingCoreEvent } from "./accountingRoguelite";
import {
  buildLawPreviousRunSummary,
  createLawReplayContext,
  createNextLifeIntent,
  deriveLawPortraits,
  LAW_PORTRAIT_CHECKPOINTS,
  type LawReplayRecommendation,
} from "./lawReplay";
import {
  buildMajorPreviousRunSummary,
  createMajorNextLifeIntent,
  createMajorReplayContext,
  deriveMajorPortraits,
  MAJOR_PORTRAIT_CHECKPOINTS,
  supportsMajorReplay,
} from "./majorReplay";
import {
  appendReplayRun,
  EMPTY_REPLAY_ARCHIVE,
  normalizeReplayArchive,
  type EmergingPortraitResult,
  type ReplayArchive,
  type ReplayRecommendation,
} from "./replaySystem";

type EngineModule = typeof import("./scriptEngine");

let enginePromise: Promise<EngineModule> | null = null;
function loadEngine() {
  enginePromise ??= import("./scriptEngine");
  return enginePromise;
}

export function warmGameEngine() {
  void loadEngine();
}

function firstEventIdFromCatalog(majorId: string, semesterIdx = 0): string | null {
  const major = majorById[majorId];
  const sem = SEMESTER_KEYS[semesterIdx];
  return major?.timeline?.find((x: any) => x.key === sem || x.semester === sem)?.mainEventIds?.[0]
    ?? `${majorId}_main_${sem}`;
}

function initEngineShellForMajor(majorId: string): EngineState {
  const major = majorById[majorId];
  if (!major) throw new Error(`unknown major: ${majorId}`);
  const firstId = firstEventIdFromCatalog(majorId, 0);
  return {
    majorId,
    semesterIdx: 0,
    stats: { ...(major.initialStats ?? {}) },
    majorStats: Object.fromEntries((major.majorStats ?? []).map((s: any) => [s.key, s.initialValue ?? 0])),
    hiddenStats: {},
    flags: [],
    routes: [],
    seenEvents: firstId ? [firstId] : [],
    achievements: [],
    currentEventId: firstId,
    initialTrait: null,
    legacyMemory: null,
    routeScores: {},
    specialExperiences: [],
    pendingTrend: null,
    replayContext: null,
    semesterEventCount: 0,
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
  };
}


export interface HistoryItem {
  eventId?: string;
  choiceId?: string;
  semester: string;
  title: string;
  choice: string;
  feedback: string;
}

export interface MajorProgress {
  playCount: number;
  unlockedRoutes: string[];
  unlockedPersonas: string[];
  discoveredEvents: string[];
  discoveredSpecialExperiences: string[];
  unlockedEndings: string[];
  inheritedPerks?: string[];
  lastResult?: unknown;
}

export interface GlobalProgress {
  experiencedMajorIds: string[];
  totalRuns: number;
  totalUnlockedEndings: number;
  totalDiscoveredEvents: number;
}

export interface GameState extends EngineState {
  /** 客户端是否已经从本地存档完成水合；避免 /semester 首帧空状态误跳转 */
  hydrated: boolean;
  /** 当前事件的运行时数据；避免首页/选专业页为了查事件把完整脚本包提前加载进来 */
  currentEventData: any | null;
  characterName: string;
  school: string;
  history: HistoryItem[];
  /** 跨周目保留的事件图鉴，按专业记录。 */
  discoveries: Record<string, string[]>;
  discoverableTotals: Record<string, number>;
  /** 最近解锁的成就 id，用于弹 toast */
  pendingAchievement: string | null;
  /** 中途主动结束游戏（点顶部 结 按钮） */
  midwayFinished: boolean;
  lawArchive: LawArchive;
  csArchive: CSArchive;
  majorProgress: Record<string, MajorProgress>;
  globalProgress: GlobalProgress;
  replayArchive: ReplayArchive;
  pendingPortraits: EmergingPortraitResult[];
  shownPortraitIds: string[];
}

const STORAGE_KEY = "cszmg_save_v3";

function emptyMajorProgress(): MajorProgress {
  return {
    playCount: 0,
    unlockedRoutes: [],
    unlockedPersonas: [],
    discoveredEvents: [],
    discoveredSpecialExperiences: [],
    unlockedEndings: [],
  };
}

function emptyState(): GameState {
  return {
    majorId: "",
    hydrated: false,
    semesterIdx: 0,
    stats: {},
    majorStats: {},
    hiddenStats: {},
    flags: [],
    routes: [],
    seenEvents: [],
    achievements: [],
    currentEventId: null,
    initialTrait: null,
    legacyMemory: null,
    routeScores: {},
    specialExperiences: [],
    pendingTrend: null,
    replayContext: null,
    semesterEventCount: 0,
    currentEventData: null,
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
    discoveries: {},
    discoverableTotals: {},
    pendingAchievement: null,
    midwayFinished: false,
    lawArchive: { ...EMPTY_LAW_ARCHIVE },
    csArchive: { ...EMPTY_CS_ARCHIVE },
    majorProgress: {},
    globalProgress: {
      experiencedMajorIds: [],
      totalRuns: 0,
      totalUnlockedEndings: 0,
      totalDiscoveredEvents: 0,
    },
    replayArchive: { ...EMPTY_REPLAY_ARCHIVE },
    pendingPortraits: [],
    shownPortraitIds: [],
  };
}

function normalizeSavedState(saved: any): GameState {
  const base = emptyState();
  const discoveries = saved?.discoveries ?? {};
  const majorProgress: Record<string, MajorProgress> = { ...(saved?.majorProgress ?? {}) };

  for (const [majorId, events] of Object.entries(discoveries as Record<string, string[]>)) {
    majorProgress[majorId] = {
      ...emptyMajorProgress(),
      ...majorProgress[majorId],
      discoveredEvents: [...new Set(events)],
    };
  }

  if (saved?.lawArchive) {
    majorProgress.law = {
      ...emptyMajorProgress(),
      ...majorProgress.law,
      playCount: Math.max(majorProgress.law?.playCount ?? 0, saved.lawArchive.runs ?? 0),
      unlockedRoutes: [...new Set([...(majorProgress.law?.unlockedRoutes ?? []), ...(saved.lawArchive.routes ?? [])])],
      unlockedPersonas: [...new Set([...(majorProgress.law?.unlockedPersonas ?? []), ...(saved.lawArchive.personas ?? [])])],
      discoveredSpecialExperiences: [...new Set([...(majorProgress.law?.discoveredSpecialExperiences ?? []), ...(saved.lawArchive.experiences ?? [])])],
    };
  }
  if (saved?.csArchive) {
    majorProgress.computer_science = {
      ...emptyMajorProgress(),
      ...majorProgress.computer_science,
      playCount: Math.max(majorProgress.computer_science?.playCount ?? 0, saved.csArchive.runs ?? 0),
      unlockedRoutes: [...new Set([...(majorProgress.computer_science?.unlockedRoutes ?? []), ...(saved.csArchive.routes ?? [])])],
      unlockedPersonas: [...new Set([...(majorProgress.computer_science?.unlockedPersonas ?? []), ...(saved.csArchive.personas ?? [])])],
      discoveredSpecialExperiences: [...new Set([...(majorProgress.computer_science?.discoveredSpecialExperiences ?? []), ...(saved.csArchive.experiences ?? [])])],
    };
  }

  for (const [majorId, progress] of Object.entries(majorProgress)) {
    majorProgress[majorId] = {
      ...emptyMajorProgress(),
      ...progress,
    };
  }

  const inferredMajorIds = Object.entries(majorProgress)
    .filter(([, progress]) => progress.playCount > 0)
    .map(([majorId]) => majorId);
  const globalProgress: GlobalProgress = {
    ...base.globalProgress,
    ...(saved?.globalProgress ?? {}),
    experiencedMajorIds: [...new Set([...(saved?.globalProgress?.experiencedMajorIds ?? []), ...inferredMajorIds])],
    totalRuns: Math.max(
      saved?.globalProgress?.totalRuns ?? 0,
      Object.values(majorProgress).reduce((total, progress) => total + progress.playCount, 0),
    ),
    totalUnlockedEndings: Object.values(majorProgress).reduce(
      (total, progress) => total + progress.unlockedEndings.length,
      0,
    ),
    totalDiscoveredEvents: Object.values(majorProgress).reduce(
      (total, progress) => total + progress.discoveredEvents.length,
      0,
    ),
  };

  return {
    ...base,
    ...saved,
    currentEventData: null,
    discoveries,
    majorProgress,
    globalProgress,
    replayArchive: normalizeReplayArchive(saved?.replayArchive),
    pendingPortraits: Array.isArray(saved?.pendingPortraits) ? saved.pendingPortraits : [],
    shownPortraitIds: Array.isArray(saved?.shownPortraitIds) ? saved.shownPortraitIds : [],
    hydrated: true,
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

function recordDiscovery(source: GameState, majorId: string, eventId: string | null): GameState {
  if (!majorId || !eventId) return source;
  const current = source.discoveries[majorId] ?? [];
  if (current.includes(eventId)) return source;
  return {
    ...source,
    discoveries: { ...source.discoveries, [majorId]: [...current, eventId] },
    majorProgress: {
      ...source.majorProgress,
      [majorId]: {
        ...emptyMajorProgress(),
        ...source.majorProgress[majorId],
        discoveredEvents: [...current, eventId],
      },
    },
    globalProgress: {
      ...source.globalProgress,
      totalDiscoveredEvents: Object.values({
        ...source.discoveries,
        [majorId]: [...current, eventId],
      }).reduce((total, events) => total + events.length, 0),
    },
  };
}

function recordMajorResult(
  source: GameState,
  routeId: string,
  personaId: string,
  experiences: string[],
): GameState {
  const majorId = source.majorId;
  const previous = { ...emptyMajorProgress(), ...source.majorProgress[majorId] };
  const next: MajorProgress = {
    ...previous,
    unlockedRoutes: [...new Set([...previous.unlockedRoutes, routeId])],
    unlockedPersonas: [...new Set([...previous.unlockedPersonas, personaId])],
    discoveredEvents: [...new Set([...(source.discoveries[majorId] ?? []), ...previous.discoveredEvents])],
    discoveredSpecialExperiences: [
      ...new Set([...previous.discoveredSpecialExperiences, ...experiences]),
    ],
    unlockedEndings: source.endingId
      ? [...new Set([...previous.unlockedEndings, source.endingId])]
      : previous.unlockedEndings,
    lastResult: {
      routeId,
      personaId,
      endingId: source.endingId,
      semesterIdx: source.semesterIdx,
    },
  };
  const majorProgress = { ...source.majorProgress, [majorId]: next };
  return {
    ...source,
    majorProgress,
    globalProgress: {
      ...source.globalProgress,
      totalUnlockedEndings: Object.values(majorProgress).reduce(
        (total, progress) => total + progress.unlockedEndings.length,
        0,
      ),
      totalDiscoveredEvents: Object.values(majorProgress).reduce(
        (total, progress) => total + progress.discoveredEvents.length,
        0,
      ),
    },
  };
}

function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    state = saved ? normalizeSavedState(saved) : { ...state, hydrated: true };
    listeners.forEach((l) => l());
  } catch {
    state = { ...state, hydrated: true };
    listeners.forEach((l) => l());
  }
}

export const gameStore = {
  get(): GameState { return state; },
  getServerSnapshot(): GameState { return SERVER_SNAPSHOT; },
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  set(patch: Partial<GameState>) { state = { ...state, ...patch }; emit(); },
  reset() {
    const { discoveries, discoverableTotals, lawArchive, csArchive, majorProgress, globalProgress, replayArchive } = state;
    state = {
      ...emptyState(),
      discoveries,
      discoverableTotals,
      lawArchive,
      csArchive,
      majorProgress,
      globalProgress,
      replayArchive,
      hydrated: hydrated || typeof window !== "undefined",
    };
    emit();
  },

  selectMajor(id: string) {
    if (!canEnterMajorGame(id)) return false;
    const engine = initEngineShellForMajor(id);
    const lawArchive = id === "law" ? { ...state.lawArchive, runs: state.lawArchive.runs + 1 } : state.lawArchive;
    const csArchive = id === "computer_science" ? { ...state.csArchive, runs: state.csArchive.runs + 1 } : state.csArchive;
    const majorProgress = {
      ...state.majorProgress,
      [id]: {
        ...emptyMajorProgress(),
        ...state.majorProgress[id],
        playCount: Number(state.majorProgress[id]?.playCount ?? 0) + 1,
      },
    };
    const experiencedMajorIds = [...new Set([...state.globalProgress.experiencedMajorIds, id])];
    if (id === "law") {
      createLawRunState(engine, lawArchive);
      const intent = state.replayArchive.pendingIntent;
      const previousRun = intent
        ? (state.replayArchive.runsByMajor.law ?? []).find((run) => run.runId === intent.sourceRunId)
        : null;
      const legacy = state.replayArchive.pendingLegacyExperience;
      if (intent && previousRun && legacy) {
        engine.replayContext = createLawReplayContext(intent, previousRun, legacy);
      }
      const firstLawEvent = pickLawCoreEvent(engine);
      engine.currentEventId = firstLawEvent;
      engine.seenEvents = firstLawEvent ? [firstLawEvent] : [];
    }
    if (id === "computer_science") {
      createCSRunState(engine, csArchive);
      attachMajorReplayContext(engine, state.replayArchive, id);
      const firstCSEvent = pickCSCoreEvent(engine);
      engine.currentEventId = firstCSEvent;
      engine.seenEvents = firstCSEvent ? [firstCSEvent] : [];
    }
    if (id === "clinical_medicine") {
      createClinicalRunState(engine, majorProgress[id].playCount);
      attachMajorReplayContext(engine, state.replayArchive, id);
      const firstClinicalEvent = pickClinicalCoreEvent(engine);
      engine.currentEventId = firstClinicalEvent;
      engine.seenEvents = firstClinicalEvent ? [firstClinicalEvent] : [];
    }
    if (id === "chinese_language_literature") {
      createChineseRunState(engine, majorProgress[id].playCount);
      attachMajorReplayContext(engine, state.replayArchive, id);
      const firstChineseEvent = pickChineseCoreEvent(engine);
      engine.currentEventId = firstChineseEvent;
      engine.seenEvents = firstChineseEvent ? [firstChineseEvent] : [];
    }
    if (id === "accounting") {
      createAccountingRunState(engine, majorProgress[id].playCount);
      attachMajorReplayContext(engine, state.replayArchive, id);
      const firstAccountingEvent = pickAccountingCoreEvent(engine);
      engine.currentEventId = firstAccountingEvent;
      engine.seenEvents = firstAccountingEvent ? [firstAccountingEvent] : [];
    }
    state = {
      ...emptyState(),
      ...engine,
      hydrated: true,
      currentEventData: null,
      characterName: state.characterName,
      school: state.school,
      discoveries: state.discoveries,
      discoverableTotals: state.discoverableTotals,
      lawArchive,
      csArchive,
      majorProgress,
      globalProgress: {
        ...state.globalProgress,
        experiencedMajorIds,
        totalRuns: state.globalProgress.totalRuns + 1,
      },
      replayArchive: supportsMajorReplay(id)
        ? { ...state.replayArchive, pendingIntent: null, pendingLegacyExperience: null }
        : state.replayArchive,
    };
    emit();
    // 立刻在后台把完整脚本包拉起来，等玩家看完 intro 到 /semester 时已就绪
    void loadEngine().then(async (engineRuntime) => {
      await engineRuntime.loadMajorRuntime(id);
      if (state.majorId !== id || state.currentEventData) return;
      const existingEvent = engineRuntime.getCurrentEvent(state);
      const currentEventId = existingEvent ? state.currentEventId : engineRuntime.firstEventIdForSemester(id, state.semesterIdx);
      state = recordDiscovery({
        ...state,
        currentEventId,
        seenEvents: currentEventId && !state.seenEvents.includes(currentEventId) ? [...state.seenEvents, currentEventId] : state.seenEvents,
        currentEventData: existingEvent ?? engineRuntime.getCurrentEvent({ ...state, currentEventId }),
        discoverableTotals: {
          ...state.discoverableTotals,
          [id]: engineRuntime.discoverableEventCount(id),
        },
      }, id, currentEventId);
      emit();
    });
    return true;
  },

  async applyChoice(choice: any) {
    const before = state;
    const engineRuntime = await loadEngine();
    await engineRuntime.loadMajorRuntime(state.majorId);
    const { state: next, event, newAchievements } = engineRuntime.applyChoice(state, choice);
    const currentEventData = engineRuntime.getCurrentEvent(next);
    const history: HistoryItem = {
      eventId: event?.id,
      choiceId: choice?.id ?? choice?.choiceId,
      semester: currentSemesterLabel(before),
      title: event?.title ?? "",
      choice: choice?.text ?? "",
      feedback: choice?.feedback ?? choice?.resultText ?? "",
    };
    let merged: GameState = recordDiscovery({
      ...state,
      ...next,
      currentEventData,
      history: [history, ...state.history].slice(0, 60),
      pendingAchievement: newAchievements[0] ?? state.pendingAchievement,
      discoverableTotals: {
        ...state.discoverableTotals,
        [state.majorId]: engineRuntime.discoverableEventCount(state.majorId),
      },
    }, state.majorId, next.currentEventId);

    if (merged.majorId === "law" && merged.finished && !merged.hiddenStats.lawRunArchived) {
      const result = deriveLawResult(merged);
      const replaySummary = buildLawPreviousRunSummary(merged, result.route.id, result.persona.id);
      merged = {
        ...merged,
        hiddenStats: { ...merged.hiddenStats, lawRunArchived: 1 },
        lawArchive: archiveLawResult(merged.lawArchive, result),
        replayArchive: appendReplayRun(merged.replayArchive, replaySummary),
      };
      merged = recordMajorResult(merged, result.route.id, result.persona.id, result.experiences.map((item) => item.title));
      if (merged.replayContext) {
        merged = appendAnalytics(merged, "replay_run_completed", replayFields(merged, result.route.id, result.persona.id));
      }
    }

    if (merged.majorId === "law" && !merged.finished) {
      for (const checkpoint of LAW_PORTRAIT_CHECKPOINTS) {
        if (before.semesterIdx < checkpoint && merged.semesterIdx >= checkpoint) {
          const portraits = deriveLawPortraits(merged, checkpoint)
            .filter((portrait) => !merged.shownPortraitIds.includes(portrait.id));
          if (portraits.length) {
            merged = { ...merged, pendingPortraits: portraits };
            break;
          }
        }
      }
    }

    if (merged.majorId === "law" && merged.replayContext) {
      const count = merged.replayContext.completedEventCount;
      if (count === 1) merged = appendAnalytics(merged, "replay_first_event_completed", replayFields(merged));
      if (count === 3) merged = appendAnalytics(merged, "replay_third_event_completed", replayFields(merged));
    }
    if (merged.majorId === "computer_science" && merged.finished && !merged.hiddenStats.csRunArchived) {
      const result = deriveCSResult(merged);
      const replaySummary = buildMajorPreviousRunSummary(merged, result.route.id, result.persona.id);
      merged = {
        ...merged,
        hiddenStats: { ...merged.hiddenStats, csRunArchived: 1 },
        csArchive: archiveCSResult(merged.csArchive, result),
        replayArchive: appendReplayRun(merged.replayArchive, replaySummary),
      };
      merged = recordMajorResult(merged, result.route.id, result.persona.id, result.experiences.map((item) => item.title));
    }
    if (merged.majorId === "clinical_medicine" && merged.finished && !merged.hiddenStats.clinicalRunArchived) {
      const result = deriveClinicalResult(merged);
      const replaySummary = buildMajorPreviousRunSummary(merged, result.route.id, result.persona.id);
      merged = {
        ...merged,
        hiddenStats: { ...merged.hiddenStats, clinicalRunArchived: 1 },
        replayArchive: appendReplayRun(merged.replayArchive, replaySummary),
      };
      merged = recordMajorResult(merged, result.route.id, result.persona.id, result.experiences.map((item) => item.title));
    }
    if (merged.majorId === "chinese_language_literature" && merged.finished && !merged.hiddenStats.chineseRunArchived) {
      const result = deriveChineseResult(merged);
      const replaySummary = buildMajorPreviousRunSummary(merged, result.route.id, result.persona.id);
      merged = {
        ...merged,
        hiddenStats: { ...merged.hiddenStats, chineseRunArchived: 1 },
        replayArchive: appendReplayRun(merged.replayArchive, replaySummary),
      };
      merged = recordMajorResult(merged, result.route.id, result.persona.id, result.experiences.map((item) => item.title));
    }
    if (merged.majorId === "accounting" && merged.finished && !merged.hiddenStats.accountingRunArchived) {
      const result = deriveAccountingResult(merged);
      const replaySummary = buildMajorPreviousRunSummary(merged, result.route.id, result.persona.id);
      merged = {
        ...merged,
        hiddenStats: { ...merged.hiddenStats, accountingRunArchived: 1 },
        replayArchive: appendReplayRun(merged.replayArchive, replaySummary),
      };
      merged = recordMajorResult(merged, result.route.id, result.persona.id, result.experiences.map((item) => item.title));
    }

    const portraitCheckpoints = MAJOR_PORTRAIT_CHECKPOINTS[merged.majorId] ?? [];
    if (!merged.finished && portraitCheckpoints.length) {
      for (const checkpoint of portraitCheckpoints) {
        if (before.semesterIdx < checkpoint && merged.semesterIdx >= checkpoint) {
          const portraits = deriveMajorPortraits(merged, checkpoint)
            .filter((portrait) => !merged.shownPortraitIds.includes(portrait.id));
          if (portraits.length) {
            merged = { ...merged, pendingPortraits: portraits };
            break;
          }
        }
      }
    }

    if (merged.majorId !== "law" && merged.replayContext) {
      const count = merged.replayContext.completedEventCount;
      if (count === 1) merged = appendAnalytics(merged, "replay_first_event_completed", replayFields(merged));
      if (count === 3) merged = appendAnalytics(merged, "replay_third_event_completed", replayFields(merged));
      if (merged.finished) merged = appendAnalytics(merged, "replay_run_completed", replayFields(merged));
    }

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

  /** 从旧存档恢复时补齐当前事件详情；只在游戏页需要时加载完整脚本包。 */
  async ensureRuntimeData() {
    if (!canEnterMajorGame(state.majorId) || state.currentEventData) return;
    const engineRuntime = await loadEngine();
    await engineRuntime.loadMajorRuntime(state.majorId);
    const existingEvent = engineRuntime.getCurrentEvent(state);
    const currentEventId = existingEvent ? state.currentEventId : engineRuntime.firstEventIdForSemester(state.majorId, state.semesterIdx);
    const nextState = { ...state, currentEventId };
    state = recordDiscovery({
      ...nextState,
      seenEvents: currentEventId && !nextState.seenEvents.includes(currentEventId) ? [...nextState.seenEvents, currentEventId] : nextState.seenEvents,
      currentEventData: existingEvent ?? engineRuntime.getCurrentEvent(nextState),
      discoverableTotals: {
        ...nextState.discoverableTotals,
        [state.majorId]: engineRuntime.discoverableEventCount(state.majorId),
      },
    }, state.majorId, currentEventId);
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

  chooseLegacyMemory(memoryId: string) {
    if (state.legacyMemory === memoryId) return;
    const next = { ...state, stats: { ...state.stats }, hiddenStats: { ...state.hiddenStats } };
    const memories = state.majorId === "law"
      ? LAW_MEMORIES
      : state.majorId === "computer_science"
        ? CS_MEMORIES
        : state.majorId === "clinical_medicine"
          ? CLINICAL_MEMORIES
          : state.majorId === "chinese_language_literature"
            ? CHINESE_MEMORIES
          : state.majorId === "accounting"
            ? ACCOUNTING_MEMORIES
          : null;
    const memory = memories?.find((item) => item.id === memoryId);
    if (!memory) return;

    if (state.legacyMemory === "exam_notice") next.stats.professionalAccumulation = Math.max(0, (next.stats.professionalAccumulation ?? 0) - 6);
    if (state.legacyMemory === "saved_chance") next.stats.opportunity = Math.max(0, (next.stats.opportunity ?? 0) - 8);
    if (state.legacyMemory === "route_hint") next.hiddenStats.realityPlanning = (next.hiddenStats.realityPlanning ?? 50) - 7;
    if (state.legacyMemory === "cs_error_archive") next.stats.technicalAccumulation = Math.max(0, (next.stats.technicalAccumulation ?? 0) - 6);
    if (state.legacyMemory === "cs_saved_demo") next.stats.projectOpportunity = Math.max(0, (next.stats.projectOpportunity ?? 0) - 8);
    if (state.legacyMemory === "cs_route_map") next.hiddenStats.realityPlanning = (next.hiddenStats.realityPlanning ?? 50) - 7;
    if (state.legacyMemory === "clinical_exam_framework") next.stats.medicalAccumulation = Math.max(0, (next.stats.medicalAccumulation ?? 0) - 6);
    if (state.legacyMemory === "clinical_skill_slot") next.stats.clinicalOpportunity = Math.max(0, (next.stats.clinicalOpportunity ?? 0) - 8);
    if (state.legacyMemory === "clinical_route_note") next.hiddenStats.realityPlanning = (next.hiddenStats.realityPlanning ?? 50) - 7;
    if (state.legacyMemory === "chinese_saved_notes") next.stats.textAccumulation = Math.max(0, (next.stats.textAccumulation ?? 0) - 6);
    if (state.legacyMemory === "chinese_saved_submission") next.stats.expressionOpportunity = Math.max(0, (next.stats.expressionOpportunity ?? 0) - 8);
    if (state.legacyMemory === "chinese_route_sheet") next.hiddenStats.realityPlanning = (next.hiddenStats.realityPlanning ?? 50) - 7;
    if (state.legacyMemory === "accounting_saved_checklist") next.stats.accountingKnowledge = Math.max(0, (next.stats.accountingKnowledge ?? 0) - 6);
    if (state.legacyMemory === "accounting_saved_contact") next.stats.practicalOpportunity = Math.max(0, (next.stats.practicalOpportunity ?? 0) - 8);
    if (state.legacyMemory === "accounting_route_sheet") next.hiddenStats.realityPlanning = (next.hiddenStats.realityPlanning ?? 50) - 7;

    next.legacyMemory = memory.id;
    if (memory.id === "exam_notice") next.stats.professionalAccumulation = Math.min(100, (next.stats.professionalAccumulation ?? 0) + 6);
    if (memory.id === "saved_chance") next.stats.opportunity = Math.min(100, (next.stats.opportunity ?? 0) + 8);
    if (memory.id === "route_hint") next.hiddenStats.realityPlanning = (next.hiddenStats.realityPlanning ?? 50) + 7;
    if (memory.id === "cs_error_archive") next.stats.technicalAccumulation = Math.min(100, (next.stats.technicalAccumulation ?? 0) + 6);
    if (memory.id === "cs_saved_demo") next.stats.projectOpportunity = Math.min(100, (next.stats.projectOpportunity ?? 0) + 8);
    if (memory.id === "cs_route_map") next.hiddenStats.realityPlanning = (next.hiddenStats.realityPlanning ?? 50) + 7;
    if (memory.id === "clinical_exam_framework") next.stats.medicalAccumulation = Math.min(100, (next.stats.medicalAccumulation ?? 0) + 6);
    if (memory.id === "clinical_skill_slot") next.stats.clinicalOpportunity = Math.min(100, (next.stats.clinicalOpportunity ?? 0) + 8);
    if (memory.id === "clinical_route_note") next.hiddenStats.realityPlanning = (next.hiddenStats.realityPlanning ?? 50) + 7;
    if (memory.id === "chinese_saved_notes") next.stats.textAccumulation = Math.min(100, (next.stats.textAccumulation ?? 0) + 6);
    if (memory.id === "chinese_saved_submission") next.stats.expressionOpportunity = Math.min(100, (next.stats.expressionOpportunity ?? 0) + 8);
    if (memory.id === "chinese_route_sheet") next.hiddenStats.realityPlanning = (next.hiddenStats.realityPlanning ?? 50) + 7;
    if (memory.id === "accounting_saved_checklist") next.stats.accountingKnowledge = Math.min(100, (next.stats.accountingKnowledge ?? 0) + 6);
    if (memory.id === "accounting_saved_contact") next.stats.practicalOpportunity = Math.min(100, (next.stats.practicalOpportunity ?? 0) + 8);
    if (memory.id === "accounting_route_sheet") next.hiddenStats.realityPlanning = (next.hiddenStats.realityPlanning ?? 50) + 7;
    state = next;
    emit();
  },

  prepareLawReplay(recommendation: LawReplayRecommendation) {
    let replayArchive = state.replayArchive;
    let runs = replayArchive.runsByMajor.law ?? [];
    let sourceRun = runs[runs.length - 1];
    if (!sourceRun && state.majorId === "law" && state.finished) {
      const result = deriveLawResult(state);
      const summary = buildLawPreviousRunSummary(state, result.route.id, result.persona.id);
      replayArchive = appendReplayRun(replayArchive, summary);
      runs = replayArchive.runsByMajor.law ?? [];
      sourceRun = runs[runs.length - 1];
    }
    if (!sourceRun) return false;
    const intent = createNextLifeIntent(recommendation, sourceRun);
    state = {
      ...state,
      replayArchive: {
        ...replayArchive,
        pendingIntent: intent,
        pendingLegacyExperience: recommendation.legacyExperience,
      },
    };
    state = appendAnalytics(
      state,
      recommendation.targetType === "near_miss" ? "near_miss_target_clicked" : "opposite_target_clicked",
      {
        ...replayFields(state),
        selectedTargetType: recommendation.targetType,
        selectedTargetId: recommendation.routeId,
        legacyExperienceId: recommendation.legacyExperience.id,
      },
    );
    state = appendAnalytics(state, "legacy_experience_viewed", {
      ...replayFields(state),
      selectedTargetType: recommendation.targetType,
      selectedTargetId: recommendation.routeId,
      legacyExperienceId: recommendation.legacyExperience.id,
    });
    emit();
    return true;
  },

  prepareMajorReplay(recommendation: ReplayRecommendation) {
    const majorId = state.majorId;
    if (!supportsMajorReplay(majorId) || majorId === "law") return false;
    let replayArchive = state.replayArchive;
    let runs = replayArchive.runsByMajor[majorId] ?? [];
    let sourceRun = runs[runs.length - 1];
    if (!sourceRun && state.finished) {
      const result = deriveReplayResult(state);
      if (!result) return false;
      const summary = buildMajorPreviousRunSummary(state, result.route.id, result.persona.id);
      replayArchive = appendReplayRun(replayArchive, summary);
      runs = replayArchive.runsByMajor[majorId] ?? [];
      sourceRun = runs[runs.length - 1];
    }
    if (!sourceRun) return false;
    state = {
      ...state,
      replayArchive: {
        ...replayArchive,
        pendingIntent: createMajorNextLifeIntent(majorId, recommendation, sourceRun),
        pendingLegacyExperience: recommendation.legacyExperience,
      },
    };
    state = appendAnalytics(
      state,
      recommendation.targetType === "near_miss" ? "near_miss_target_clicked" : "opposite_target_clicked",
      {
        ...replayFields(state),
        selectedTargetType: recommendation.targetType,
        selectedTargetId: recommendation.routeId,
        legacyExperienceId: recommendation.legacyExperience.id,
      },
    );
    emit();
    return true;
  },

  startPreparedLawReplay() {
    if (!state.replayArchive.pendingIntent || !state.replayArchive.pendingLegacyExperience) return false;
    gameStore.reset();
    const started = gameStore.selectMajor("law");
    if (started) {
      state = appendAnalytics(state, "same_major_replay_started", replayFields(state));
      emit();
    }
    return started;
  },

  startPreparedMajorReplay() {
    const intent = state.replayArchive.pendingIntent;
    if (!intent || !state.replayArchive.pendingLegacyExperience) return false;
    const majorId = intent.majorId
      ?? Object.entries(state.replayArchive.runsByMajor)
        .find(([, runs]) => runs.some((run) => run.runId === intent.sourceRunId))?.[0];
    if (!majorId || majorId === "law") return false;
    gameStore.reset();
    const started = gameStore.selectMajor(majorId);
    if (started) {
      state = appendAnalytics(state, "same_major_replay_started", replayFields(state));
      emit();
    }
    return started;
  },

  dismissPortraits() {
    if (!state.pendingPortraits.length) return;
    const dismissedIds = state.pendingPortraits.map((item) => item.id);
    state = {
      ...state,
      shownPortraitIds: [...new Set([...state.shownPortraitIds, ...dismissedIds])],
      pendingPortraits: [],
      replayContext: state.replayContext ? {
        ...state.replayContext,
        shownPortraitIds: [...new Set([...state.replayContext.shownPortraitIds, ...dismissedIds])],
      } : null,
    };
    emit();
  },

  trackReplayEvent(name: string, fields: Record<string, string | number | boolean | null> = {}) {
    state = appendAnalytics(state, name, { ...replayFields(state), ...fields });
    emit();
  },


  clearPendingAchievement() {
    state = { ...state, pendingAchievement: null };
    emit();
  },
};

function attachMajorReplayContext(engine: EngineState, archive: ReplayArchive, majorId: string) {
  const intent = archive.pendingIntent;
  const legacy = archive.pendingLegacyExperience;
  if (!intent || !legacy || (intent.majorId && intent.majorId !== majorId)) return;
  const previousRun = (archive.runsByMajor[majorId] ?? [])
    .find((run) => run.runId === intent.sourceRunId);
  if (previousRun) engine.replayContext = createMajorReplayContext(intent, previousRun, legacy);
}

function deriveReplayResult(source: GameState) {
  if (source.majorId === "computer_science") return deriveCSResult(source);
  if (source.majorId === "clinical_medicine") return deriveClinicalResult(source);
  if (source.majorId === "chinese_language_literature") return deriveChineseResult(source);
  if (source.majorId === "accounting") return deriveAccountingResult(source);
  return null;
}

function replayFields(source: GameState, routeId?: string, personaId?: string) {
  return {
    majorId: source.majorId,
    previousRouteId: source.replayContext?.previousRun.routeId ?? routeId ?? "",
    previousPersonaId: source.replayContext?.previousRun.personaId ?? personaId ?? "",
    selectedTargetType: source.replayContext?.intent.targetType ?? null,
    selectedTargetId: source.replayContext?.intent.targetRouteId ?? null,
    legacyExperienceId: source.replayContext?.legacyExperience.id ?? null,
    runIndex: source.majorProgress[source.majorId]?.playCount ?? 0,
  };
}

function appendAnalytics(
  source: GameState,
  name: string,
  fields: Record<string, string | number | boolean | null>,
) {
  const duplicate = source.replayArchive.analytics.slice(-3).some((event) =>
    event.name === name
    && event.fields.runIndex === fields.runIndex
    && event.fields.selectedTargetId === fields.selectedTargetId);
  if (duplicate) return source;
  return {
    ...source,
    replayArchive: {
      ...source.replayArchive,
      analytics: [...source.replayArchive.analytics, { name, at: Date.now(), fields }].slice(-200),
    },
  };
}

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
  return g.currentEventData ?? null;
}

export function currentSemesterLabel(state: Pick<GameState, "semesterIdx" | "majorId">) {
  return currentSemesterLabelFromIndex(state.semesterIdx, state.majorId);
}

export { SEMESTER_KEYS };
