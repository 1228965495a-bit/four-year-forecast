/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  applyChoice,
  getCurrentEvent,
  initEngineForMajor,
  loadMajorRuntime,
} from "../src/lib/scriptEngine";
import {
  createCSRunState,
  CS_PERSONAS,
  deriveCSResult,
  pickCSCoreEvent,
} from "../src/lib/computerScienceRoguelite";
import { checkMidGG } from "../src/lib/midGgRules";

const MAJOR_ID = "computer_science";

const strategies = [
  {
    name: "工程交付型",
    preferred: {
      computer_science_y1s1_main_002: "b",
      computer_science_y2s1_main_008: "a",
      computer_science_y2s2_main_012: "a",
      computer_science_random_001: "a",
      computer_science_random_002: "a",
      computer_science_random_003: "a",
      computer_science_random_009: "a",
    },
    keywords: ["流程", "日志", "核对", "完整", "现场", "项目", "补齐", "真实"],
  },
  {
    name: "截止日爆发型",
    preferred: {
      computer_science_y1s2_main_004: "b",
      computer_science_y1s2_main_006: "c",
      computer_science_y2s1_main_009: "a",
      computer_science_y2s2_main_012: "d",
      computer_science_y3s1_main_014: "b",
      computer_science_y3s1_route_015: "a",
      computer_science_y3s2_route_016: "a",
      computer_science_y3s2_route_017: "a",
      computer_science_y3s2_main_018: "a",
      computer_science_y4s1_main_019: "d",
      computer_science_y4s1_route_020: "a",
      computer_science_y4s2_main_022: "c",
      computer_science_random_006: "b",
      computer_science_random_001: "b",
      computer_science_random_002: "b",
      computer_science_random_003: "b",
      computer_science_random_004: "b",
      computer_science_random_005: "b",
      computer_science_random_009: "b",
      computer_science_random_007: "b",
      computer_science_random_008: "b",
      computer_science_random_010: "b",
    },
    keywords: ["最后", "极限", "复制", "速成", "先跑", "重启", "今晚"],
  },
  {
    name: "探索开源型",
    preferred: {
      computer_science_y1s1_main_002: "b",
      computer_science_y1s2_main_004: "c",
      computer_science_y1s1_main_003: "c",
      computer_science_y1s2_main_006: "b",
      computer_science_y2s1_main_008: "b",
      computer_science_y2s1_main_009: "c",
      computer_science_y2s2_main_010: "d",
      computer_science_y3s1_main_014: "d",
      computer_science_y3s2_main_018: "c",
      computer_science_y4s1_main_019: "d",
      computer_science_y4s2_main_022: "d",
      computer_science_random_008: "a",
      computer_science_random_003: "b",
    },
    keywords: ["文档", "README", "社区", "论文", "原理", "自己", "真实需求", "开源"],
  },
];

await loadMajorRuntime(MAJOR_ID);
validateTransferChain();
validateComputerScienceMidGg();

const reports = strategies.map((strategy, runIndex) => {
  let state: any = initEngineForMajor(MAJOR_ID);
  createCSRunState(state, { runs: runIndex + 1, routes: [], personas: [], experiences: [] });
  state.history = [];
  state.currentEventId = pickCSCoreEvent(state);
  state.seenEvents = state.currentEventId ? [state.currentEventId] : [];

  const eventIds: string[] = [];
  for (let guard = 0; guard < 30 && !state.finished; guard += 1) {
    const event = getCurrentEvent(state);
    if (!event) throw new Error(`${strategy.name}: missing event ${state.currentEventId}`);
    const options = event.options ?? event.choices ?? [];
    if (!options.length) throw new Error(`${strategy.name}: event ${event.id} has no options`);
    const preferredId = (strategy.preferred as Record<string, string>)[event.id];
    const choice =
      options.find((option: any) => option.id === preferredId) ??
      [...options].sort(
        (a, b) => keywordScore(b.text, strategy.keywords) - keywordScore(a.text, strategy.keywords),
      )[0];
    eventIds.push(event.id);
    const applied = applyChoice(state, choice);
    state = applied.state;
    state.history = [
      ...(state.history ?? []),
      {
        semester: event.semester,
        title: event.title,
        choice: choice.text,
        feedback: choice.feedback ?? "",
      },
    ];
  }

  if (!state.finished) throw new Error(`${strategy.name}: run did not finish`);
  const result = deriveCSResult(state);
  return {
    strategy: strategy.name,
    choices: eventIds.length,
    uniqueEvents: new Set(eventIds).size,
    route: result.route.title,
    persona: result.persona.title,
    hiddenCallbacks: eventIds.filter((id) => id.includes("_hidden_")),
    personaScores: Object.fromEntries(
      CS_PERSONAS.map((persona) => [persona.title, Math.round(persona.score(state))]),
    ),
    events: eventIds,
  };
});

console.log(JSON.stringify(reports, null, 2));
const personaDistribution = simulatePersonaDistribution(48);
console.log("persona distribution", personaDistribution);

if (new Set(reports.map((report) => report.persona)).size < 3) {
  throw new Error("Three strategies did not produce three distinct personas");
}
if (new Set(reports.map((report) => report.route)).size < 3) {
  throw new Error("Three strategies did not produce three distinct routes");
}
if (new Set(reports.flatMap((report) => report.events)).size < 7) {
  throw new Error("Run seeds did not produce enough event variation");
}
if (reports.some((report) => report.choices < 10 || report.choices > 18)) {
  throw new Error("A run fell outside the expected 10-18 choice envelope");
}
if (Math.max(...Object.values(personaDistribution)) > 22) {
  throw new Error("One computer science persona dominates more than 45% of mixed runs");
}

function keywordScore(text: string, keywords: string[]) {
  return keywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0);
}

function simulatePersonaDistribution(runCount: number) {
  const counts: Record<string, number> = {};
  for (let run = 1; run <= runCount; run += 1) {
    let state: any = initEngineForMajor(MAJOR_ID);
    createCSRunState(state, { runs: run, routes: [], personas: [], experiences: [] });
    state.history = [];
    state.currentEventId = pickCSCoreEvent(state);
    state.seenEvents = state.currentEventId ? [state.currentEventId] : [];
    for (let guard = 0; guard < 30 && !state.finished; guard += 1) {
      const event = getCurrentEvent(state);
      if (!event) throw new Error(`mixed run ${run}: missing event ${state.currentEventId}`);
      const options = event.options ?? event.choices ?? [];
      if (!options.length) throw new Error(`mixed run ${run}: event ${event.id} has no options`);
      const choiceIndex = (run * 17 + guard * 13 + event.id.length * 7) % options.length;
      const choice = options[choiceIndex];
      const applied = applyChoice(state, choice);
      state = applied.state;
      state.history = [
        ...(state.history ?? []),
        { semester: event.semester, title: event.title, choice: choice.text, feedback: choice.feedback ?? "" },
      ];
    }
    if (!state.finished) throw new Error(`mixed run ${run}: run did not finish`);
    const persona = deriveCSResult(state).persona.title;
    counts[persona] = Number(counts[persona] ?? 0) + 1;
  }
  return counts;
}

function validateTransferChain() {
  let state: any = initEngineForMajor(MAJOR_ID);
  createCSRunState(state, { runs: 4, routes: [], personas: [], experiences: [] });
  state.semesterIdx = 3;
  state.stats.escapeImpulse = 55;
  state.stats.gpaWill = 70;
  state.hiddenStats.transferChance = 50;
  state.currentEventId = "computer_science_y2s2_transfer_011";
  state.seenEvents = [state.currentEventId];

  for (const expectedId of [
    "computer_science_y2s2_transfer_011",
    "computer_science_transfer_apply_001",
    "computer_science_transfer_apply_002",
    "computer_science_transfer_apply_003",
  ]) {
    const event = getCurrentEvent(state);
    if (event?.id !== expectedId) throw new Error(`Transfer chain stopped before ${expectedId}`);
    const options = event.options ?? event.choices ?? [];
    const choice = expectedId.endsWith("transfer_011")
      ? options.find((option: any) => option.id === "a")
      : options[0];
    state = applyChoice(state, choice).state;
  }
  if (!state.finished || !state.flags.includes("computer_science_flag_transfer_success")) {
    throw new Error("Transfer result did not finish with a resolved outcome");
  }
}

function validateComputerScienceMidGg() {
  const state: any = initEngineForMajor(MAJOR_ID);
  state.semesterIdx = 5;
  state.stats.energy = 20;
  state.majorStats.bugDebt = 90;
  const hit = checkMidGG(state);
  if (hit?.reason !== "cs_project_offline") {
    throw new Error("Computer science project crash did not trigger its dedicated GG");
  }
}
