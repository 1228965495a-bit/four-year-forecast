/* eslint-disable @typescript-eslint/no-explicit-any */

import { CLINICAL_EVENTS } from "../src/data/script/byMajor/clinicalMedicine.events";
import { applyChoice, getCurrentEvent, initEngineForMajor, loadMajorRuntime } from "../src/lib/scriptEngine";
import {
  CLINICAL_PERSONAS,
  createClinicalRunState,
  deriveClinicalResult,
  pickClinicalCoreEvent,
} from "../src/lib/clinicalMedicineRoguelite";
import { checkMidGG } from "../src/lib/midGgRules";

const MAJOR_ID = "clinical_medicine";
const expectedCounts = { main: 10, route: 24, major_random: 12, hidden: 8 };
for (const [type, count] of Object.entries(expectedCounts)) {
  const actual = CLINICAL_EVENTS.filter((event) => event.type === type).length;
  if (actual !== count) throw new Error(`${type}: expected ${count}, got ${actual}`);
}
if (new Set(CLINICAL_EVENTS.map((event) => event.id)).size !== 54) {
  throw new Error("Clinical event IDs are not 54 unique values");
}

await loadMajorRuntime(MAJOR_ID);
validateClinicalMidGg();

const strategies = [
  { name: "诊断核对型", route: "diagnosis", keywords: ["核对", "时间", "依据", "承认", "框架"] },
  { name: "技能练习型", route: "surgery", keywords: ["练", "动作", "老师", "求助", "临床"] },
  { name: "科研谨慎型", route: "research", keywords: ["数据", "口径", "报告", "返工", "科研"] },
  { name: "升学规划型", route: "planning", keywords: ["计划", "主线", "复习", "缓冲", "考研"] },
  { name: "人文低耗型", route: "humanities", keywords: ["倾听", "解释", "边界", "团队", "睡眠"] },
];

const reports = strategies.map((strategy, runIndex) => {
  let state: any = initEngineForMajor(MAJOR_ID);
  createClinicalRunState(state, runIndex + 1);
  state.history = [];
  state.seenEvents = [];
  state.currentEventId = pickClinicalCoreEvent(state);
  state.seenEvents = state.currentEventId ? [state.currentEventId] : [];
  const events: string[] = [];

  for (let guard = 0; guard < 28 && !state.finished; guard += 1) {
    const event = getCurrentEvent(state);
    if (!event) throw new Error(`${strategy.name}: missing event ${state.currentEventId}`);
    const options = event.options ?? event.choices ?? [];
    if (options.length < 1) throw new Error(`${event.id}: no choices`);
    const choice = [...options].sort((a, b) => choiceScore(b, strategy) - choiceScore(a, strategy))[0];
    events.push(event.id);
    state = applyChoice(state, choice).state;
    state.history = [
      ...(state.history ?? []),
      { semester: event.semester, title: event.title, choice: choice.text, feedback: choice.feedback ?? "" },
    ];
  }

  if (!state.finished) throw new Error(`${strategy.name}: did not finish`);
  if (events.length < 15 || events.length > 18) throw new Error(`${strategy.name}: ${events.length} events outside 15-18`);
  if (new Set(events).size !== events.length) throw new Error(`${strategy.name}: repeated an event`);
  const result = deriveClinicalResult(state);
  return {
    strategy: strategy.name,
    eventCount: events.length,
    route: result.route.title,
    persona: result.persona.title,
    hidden: events.filter((id) => id.startsWith("clinical_hidden_")),
    branchFlags: state.flags.filter((flag: string) => flag.endsWith("_entry")),
    routeScores: state.routeScores,
    events,
  };
});

const union = new Set(reports.flatMap((report) => report.events));
if (union.size < 28) throw new Error(`Five runs only discovered ${union.size} unique events`);
if (new Set(reports.map((report) => report.route)).size < 3) throw new Error("Five strategies produced fewer than three routes");
if (new Set(reports.map((report) => report.persona)).size < 3) throw new Error("Five strategies produced fewer than three personas");
if (reports.some((report) => report.hidden.length > 2)) throw new Error("A run exposed more than two hidden callbacks");

console.log(JSON.stringify({
  library: expectedCounts,
  total: CLINICAL_EVENTS.length,
  runs: reports,
  personaTitles: CLINICAL_PERSONAS.map((persona) => persona.title),
}, null, 2));

function choiceScore(choice: any, strategy: typeof strategies[number]) {
  const route = Number(choice.clinical?.routes?.[strategy.route] ?? 0) * 5;
  const text = `${choice.text} ${choice.feedback}`;
  return route + strategy.keywords.reduce((score, keyword) => score + (text.includes(keyword) ? 2 : 0), 0);
}

function validateClinicalMidGg() {
  const energyState: any = initEngineForMajor(MAJOR_ID);
  energyState.semesterIdx = 6;
  energyState.stats.energy = 2;
  const energyHit = checkMidGG(energyState);
  if (energyHit?.reason !== "clinical_energy_shutdown") throw new Error("Clinical energy GG did not trigger");

  const overloadState: any = initEngineForMajor(MAJOR_ID);
  overloadState.semesterIdx = 8;
  overloadState.stats.energy = 12;
  overloadState.stats.escapeImpulse = 84;
  const overloadHit = checkMidGG(overloadState);
  if (overloadHit?.reason !== "clinical_overload") throw new Error("Clinical overload GG did not trigger");
}
