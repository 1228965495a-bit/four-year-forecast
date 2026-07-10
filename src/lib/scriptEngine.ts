// 脚本引擎：条件求值 / 效果应用 / 事件推进 / 结局匹配 / 成就扫描。
// 与数据形态强绑定，源数据在 src/data/script/*.json。

import { majorById } from "@/data/script/majorCatalog";
import { majorDataLoaders } from "@/data/script/majorDataLoaders";
import { SEMESTER_KEYS, SEMESTER_LABEL } from "@/data/script/semesterMeta";
export { SEMESTER_KEYS } from "@/data/script/semesterMeta";
export type { SemesterKey } from "@/data/script/semesterMeta";

interface MajorRuntimeData {
  events: any[];
  endings: any[];
  achievements: any[];
  eventById: Record<string, any>;
}

const runtimeCache = new Map<string, Promise<MajorRuntimeData>>();
const loadedRuntime = new Map<string, MajorRuntimeData>();

export function hasMajorRuntime(majorId: string) {
  return loadedRuntime.has(majorId);
}

export function loadMajorRuntime(majorId: string) {
  let promise = runtimeCache.get(majorId);
  if (!promise) {
    const loader = majorDataLoaders[majorId];
    promise = (loader ? loader() : Promise.resolve({ events: [], endings: [], achievements: [] })).then((bundle) => {
      const data: MajorRuntimeData = {
        events: bundle.events ?? [],
        endings: bundle.endings ?? [],
        achievements: bundle.achievements ?? [],
        eventById: Object.fromEntries((bundle.events ?? []).map((e: any) => [e.id, e])),
      };
      loadedRuntime.set(majorId, data);
      return data;
    });
    runtimeCache.set(majorId, promise);
  }
  return promise;
}

function runtimeOf(majorId: string) {
  const data = loadedRuntime.get(majorId);
  if (!data) throw new Error(`runtime data not loaded: ${majorId}`);
  return data;
}

export interface EngineState {
  majorId: string;
  semesterIdx: number; // 0..7
  stats: Record<string, number>;
  majorStats: Record<string, number>;
  hiddenStats: Record<string, number>;
  flags: string[];
  routes: string[];
  seenEvents: string[];
  achievements: string[];
  currentEventId: string | null;
  ggRisk: number;
  finished: boolean;
  endingId: string | null;
  /** 当前学期是否已经播过随机事件 */
  semesterRandomShown: boolean;
  /** 本局是否已经用过一次嘴硬续命 */
  usedRevive: boolean;
  /** 中途 GG 触发原因（结算页展示用） */
  midGgReason: string | null;
  /** 中途 GG 生成的称号 */
  midGgTitle: string | null;
  /** 中途 GG 副标题 */
  midGgSubtitle: string | null;
  /** 中途 GG 结论 */
  midGgConclusion: string | null;
  /** 中途 GG 标签 */
  midGgTags: string[];
  /** 等待玩家决定是否嘴硬续命 —— 非 null 表示弹嘴硬续命窗 */
  pendingReviveReason: string | null;
}


// ============= 数值 =============

function clamp01_100(n: number) { return Math.max(0, Math.min(100, n)); }

export function initEngineForMajor(majorId: string): EngineState {
  const major = majorById[majorId];
  if (!major) throw new Error(`unknown major: ${majorId}`);

  const stats: Record<string, number> = { ...(major.initialStats ?? {}) };
  const majorStats: Record<string, number> = {};
  for (const s of major.majorStats ?? []) {
    majorStats[s.key] = s.initialValue ?? 0;
  }

  // 找到 y1s1 的第一个主事件作为起点
  const firstId = firstEventOfSemester(majorId, 0);

  return {
    majorId,
    semesterIdx: 0,
    stats,
    majorStats,
    hiddenStats: {},
    flags: [],
    routes: [],
    seenEvents: firstId ? [firstId] : [],
    achievements: [],
    currentEventId: firstId,
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

function firstEventOfSemester(majorId: string, semIdx: number): string | null {
  const ids = timelineEventIdsForSemester(majorId, semIdx);
  const loaded = loadedRuntime.get(majorId);
  for (const id of ids) if (!loaded || loaded.eventById[id]) return id;
  const sem = SEMESTER_KEYS[semIdx];
  const namedMain = `${majorId}_main_${sem}`;
  if (!loaded || loaded.eventById[namedMain]) return namedMain;
  return loaded.events.find((e: any) => e.semester === sem && e.type === "main")?.id ?? null;
}

export function firstEventIdForSemester(majorId: string, semIdx: number) {
  return firstEventOfSemester(majorId, semIdx);
}

function timelineEventIdsForSemester(majorId: string, semIdx: number): string[] {
  const major = majorById[majorId];
  const sem = SEMESTER_KEYS[semIdx];
  const t = major?.timeline?.find((x: any) => x.key === sem || x.semester === sem);
  return t?.mainEventIds ?? [];
}

function nextTimelineEventInSemester(state: EngineState): string | null {
  if (!state.currentEventId) return null;
  const runtime = runtimeOf(state.majorId);
  const ids = timelineEventIdsForSemester(state.majorId, state.semesterIdx);
  const currentIdx = ids.indexOf(state.currentEventId);
  if (currentIdx < 0) return null;
  for (const id of ids.slice(currentIdx + 1)) {
    const event = runtime.eventById[id];
    if (!event || state.seenEvents.includes(id)) continue;
    if (!evalCond(state, event.triggerCondition) || !evalCond(state, event.conditions)) continue;
    return id;
  }
  return null;
}

// ============= 条件求值 =============

type Leaf = Record<string, any>;
type Group = { all?: any[]; any?: any[]; not?: any } & Leaf;

function isEmpty(x: any) {
  return !x || (typeof x === "object" && Object.keys(x).length === 0);
}

export function evalCond(state: EngineState, cond: any): boolean {
  if (isEmpty(cond)) return true;
  // group?
  if (cond.all || cond.any || cond.not) return evalGroup(state, cond as Group);
  return evalLeaf(state, cond as Leaf);
}

function evalGroup(state: EngineState, g: Group): boolean {
  if (g.all && !g.all.every((c) => evalCond(state, c))) return false;
  if (g.any && !g.any.some((c) => evalCond(state, c))) return false;
  if (g.not && evalCond(state, g.not)) return false;
  return true;
}

function evalLeaf(state: EngineState, c: Leaf): boolean {
  switch (c.type) {
    case "stat":
    case "majorStat":
    case "hiddenStat": {
      const bag =
        c.type === "stat" ? state.stats :
        c.type === "majorStat" ? state.majorStats : state.hiddenStats;
      const v = bag[c.key] ?? 0;
      return cmp(v, c.op ?? ">=", Number(c.value ?? 0));
    }
    case "flag":       return state.flags.includes(c.key);
    case "route":      return state.routes.includes(c.key ?? c.routeId);
    case "eventSeen":  return state.seenEvents.includes(c.eventId ?? c.key);
    case "achievement":return state.achievements.includes(c.achievementId ?? c.key);
    case "semester":   return SEMESTER_KEYS[state.semesterIdx] === c.key;
    default:           return true; // 未知类型宽松放行
  }
}

function cmp(a: number, op: string, b: number): boolean {
  switch (op) {
    case ">=": return a >= b;
    case "<=": return a <= b;
    case ">":  return a > b;
    case "<":  return a < b;
    case "==": case "=": return a === b;
    case "!=": return a !== b;
    default:   return a >= b;
  }
}

// ============= 应用选项 =============

export interface ApplyResult {
  state: EngineState;
  event: any;
  choice: any;
  newAchievements: string[];
}

export function applyChoice(prev: EngineState, choice: any): ApplyResult {
  const runtime = runtimeOf(prev.majorId);
  const event = runtime.eventById[prev.currentEventId ?? ""];
  if (!event || !choice) return { state: prev, event, choice, newAchievements: [] };

  const state: EngineState = {
    ...prev,
    stats: { ...prev.stats },
    majorStats: { ...prev.majorStats },
    hiddenStats: { ...prev.hiddenStats },
    flags: [...prev.flags],
    routes: [...prev.routes],
    seenEvents: [...prev.seenEvents],
    achievements: [...prev.achievements],
  };

  const eff = choice.effects ?? {};

  mergeDelta(state.stats, eff.stats, true);
  mergeDelta(state.majorStats, eff.majorStats, true);
  mergeDelta(state.hiddenStats, eff.hiddenStats, false);

  for (const f of eff.flagsAdd ?? []) if (!state.flags.includes(f)) state.flags.push(f);
  for (const r of eff.routeAdd ?? []) if (!state.routes.includes(r)) state.routes.push(r);
  const explicitAchs: string[] = [...(eff.achievementIds ?? []), ...(choice.achievementUnlocked ?? [])];
  for (const a of explicitAchs) if (!state.achievements.includes(a)) state.achievements.push(a);

  if (typeof eff.ggRisk === "number") state.ggRisk = Math.max(0, state.ggRisk + eff.ggRisk);

  // 事件已见（当前事件）
  if (state.currentEventId && !state.seenEvents.includes(state.currentEventId)) {
    state.seenEvents.push(state.currentEventId);
  }

  // 扫描成就（兜底）
  const scanned = scanAchievements(state);
  for (const id of scanned) {
    if (!state.achievements.includes(id)) state.achievements.push(id);
  }
  const newAchievements = state.achievements.filter((a) => !prev.achievements.includes(a));

  // 决定下一事件
  const nextId = normalizeId(choice.nextEventId ?? choice.nextEvent);
  if (nextId && runtime.eventById[nextId]) {
    state.currentEventId = nextId;
    if (!state.seenEvents.includes(nextId)) state.seenEvents.push(nextId);
  } else {
    advanceSemester(state);
  }

  // 提前结局判定
  const endingHit = pickEnding(state);
  if (endingHit && endingHit.type && ["mid_gg", "transfer_success", "transfer_fail"].includes(endingHit.type)) {
    state.finished = true;
    state.endingId = endingHit.id;
    state.currentEventId = null;
  }

  return { state, event, choice, newAchievements };
}

function normalizeId(v: any): string | null {
  if (!v || typeof v !== "string") return null;
  return v;
}

function mergeDelta(bag: Record<string, number>, delta: any, clamp: boolean) {
  if (!delta) return;
  for (const [k, v] of Object.entries(delta)) {
    const n = (bag[k] ?? 0) + Number(v ?? 0);
    bag[k] = clamp ? clamp01_100(n) : n;
  }
}

function advanceSemester(state: EngineState) {
  const nextTimelineId = nextTimelineEventInSemester(state);
  if (nextTimelineId) {
    state.currentEventId = nextTimelineId;
    if (!state.seenEvents.includes(nextTimelineId)) state.seenEvents.push(nextTimelineId);
    return;
  }

  // 在推进到下学期前，如果本学期还没播过随机事件，尝试插一个
  if (!state.semesterRandomShown) {
    const rid = pickRandomEvent(state);
    if (rid) {
      state.currentEventId = rid;
      state.semesterRandomShown = true;
      if (!state.seenEvents.includes(rid)) state.seenEvents.push(rid);
      return;
    }
  }

  const nextIdx = state.semesterIdx + 1;
  if (nextIdx >= SEMESTER_KEYS.length) {
    // 结算：跑一次结局判定
    const ending = pickEnding(state);
    state.finished = true;
    state.endingId = ending?.id ?? null;
    state.currentEventId = null;
    return;
  }
  state.semesterIdx = nextIdx;
  state.semesterRandomShown = false;
  const next = firstEventOfSemester(state.majorId, nextIdx);
  state.currentEventId = next;
  if (next && !state.seenEvents.includes(next)) state.seenEvents.push(next);
  if (!next) advanceSemester(state); // 空学期继续推进
}

// ============= 随机事件 =============

function pickRandomEvent(state: EngineState): string | null {
  const major = majorById[state.majorId];
  const runtime = runtimeOf(state.majorId);
  const pool = (major?.randomEvents ?? []) as string[];
  const eligible = pool
    .map((id) => runtime.eventById[id])
    .filter((e): e is any => !!e && !state.seenEvents.includes(e.id))
    .filter((e) => evalCond(state, e.triggerCondition) && evalCond(state, e.conditions));
  if (!eligible.length) return null;
  // 用 semesterIdx + seenEvents.length 做确定性抽取
  const seed = (state.semesterIdx + 1) * 9301 + state.seenEvents.length * 49297;
  const totalW = eligible.reduce((s, e) => s + (e.weight ?? 1), 0);
  let r = (seed >>> 0) % Math.max(1, Math.floor(totalW));
  for (const e of eligible) {
    r -= e.weight ?? 1;
    if (r < 0) return e.id;
  }
  return eligible[0].id;
}

// ============= 结局 =============

export function pickEnding(state: EngineState): any | null {
  const pool = runtimeOf(state.majorId).endings.slice()
    .sort((a: any, b: any) => (b.priority ?? 0) - (a.priority ?? 0));
  for (const e of pool) {
    const cond = e.conditions ?? e.condition;
    if (evalCond(state, cond)) return e;
  }
  return null;
}

// ============= 成就扫描 =============

export function scanAchievements(state: EngineState): string[] {
  const pool = runtimeOf(state.majorId).achievements;
  const hit: string[] = [];
  for (const a of pool) {
    if (state.achievements.includes(a.id)) continue;
    const cond = a.trigger ?? a.condition;
    if (!isEmpty(cond) && evalCond(state, cond)) hit.push(a.id);
  }
  return hit;
}

// ============= 查询辅助 =============

export function getCurrentEvent(state: EngineState): any | null {
  if (!state.currentEventId || !hasMajorRuntime(state.majorId)) return null;
  return runtimeOf(state.majorId).eventById[state.currentEventId] ?? null;
}

export async function getAchievementsForMajor(majorId: string) {
  return (await loadMajorRuntime(majorId)).achievements;
}

export function currentSemesterLabel(state: EngineState): string {
  return SEMESTER_LABEL[SEMESTER_KEYS[state.semesterIdx]];
}

export function totalSemesters() {
  return SEMESTER_KEYS.length;
}

export { majorById };
