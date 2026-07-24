/* eslint-disable @typescript-eslint/no-explicit-any */

import { CHINESE_EVENTS } from "../src/data/script/byMajor/chineseLiterature.events";
import { applyChoice, getCurrentEvent, initEngineForMajor, loadMajorRuntime } from "../src/lib/scriptEngine";
import {
  CHINESE_PERSONAS,
  createChineseRunState,
  deriveChineseResult,
  pickChineseCoreEvent,
} from "../src/lib/chineseLiteratureRoguelite";
import { checkMidGG } from "../src/lib/midGgRules";

const MAJOR_ID = "chinese_language_literature";
const expectedCounts = { main: 8, route: 22, major_random: 10, hidden: 8 };
for (const [type, count] of Object.entries(expectedCounts)) {
  const actual = CHINESE_EVENTS.filter((event) => event.type === type).length;
  if (actual !== count) throw new Error(`${type}: expected ${count}, got ${actual}`);
}
if (new Set(CHINESE_EVENTS.map((event) => event.id)).size !== 48) {
  throw new Error("Chinese literature event IDs are not 48 unique values");
}

await loadMajorRuntime(MAJOR_ID);
validateChineseMidGg();

const strategies = [
  { name: "文学研究型", route: "research", keywords: ["文本", "论文", "选题", "证据", "重读", "材料"] },
  { name: "师范课堂型", route: "teacher", keywords: ["试讲", "课堂", "学生", "教资", "老师", "板书"] },
  { name: "编辑内容型", route: "editor", keywords: ["校刊", "标题", "版本", "作者", "校对", "改"] },
  { name: "创作保留型", route: "writing", keywords: ["写", "投稿", "文档", "创作", "结尾", "继续"] },
  { name: "岗位规划型", route: "civil", keywords: ["岗位", "报名", "计划", "现实", "专业代码", "备选"] },
];

const reports = strategies.map((strategy, runIndex) => {
  let state: any = initEngineForMajor(MAJOR_ID);
  createChineseRunState(state, runIndex + 1);
  state.history = [];
  state.seenEvents = [];
  state.currentEventId = pickChineseCoreEvent(state);
  state.seenEvents = state.currentEventId ? [state.currentEventId] : [];
  const events: string[] = [];

  for (let guard = 0; guard < 24 && !state.finished; guard += 1) {
    const event = getCurrentEvent(state);
    if (!event) throw new Error(`${strategy.name}: missing event ${state.currentEventId}`);
    const options = event.options ?? event.choices ?? [];
    if (!options.length) throw new Error(`${event.id}: no choices`);
    const choice = [...options].sort((a, b) => choiceScore(b, strategy) - choiceScore(a, strategy))[0];
    events.push(event.id);
    state = applyChoice(state, choice).state;
    state.history = [
      ...(state.history ?? []),
      { semester: event.semester, title: event.title, choice: choice.text, feedback: choice.feedback ?? "" },
    ];
  }

  if (!state.finished) throw new Error(`${strategy.name}: did not finish`);
  if (events.length < 13 || events.length > 16) throw new Error(`${strategy.name}: ${events.length} events outside 13-16`);
  if (new Set(events).size !== events.length) throw new Error(`${strategy.name}: repeated an event`);
  const result = deriveChineseResult(state);
  return {
    strategy: strategy.name,
    eventCount: events.length,
    route: result.route.title,
    persona: result.persona.title,
    hidden: events.filter((id) => id.startsWith("chinese_hidden_")),
    closed: state.flags.filter((flag: string) => flag.startsWith("chinese_closed_")),
    routeScores: state.routeScores,
    specialExperiences: result.experiences.map((item) => item.title),
    events,
  };
});

const union = new Set(reports.flatMap((report) => report.events));
if (union.size < 28) throw new Error(`Five runs only discovered ${union.size} unique events`);
if (new Set(reports.map((report) => report.route)).size < 4) throw new Error("Five strategies produced fewer than four routes");
if (new Set(reports.map((report) => report.persona)).size < 3) throw new Error("Five strategies produced fewer than three personas");
if (reports.some((report) => report.hidden.length < 1)) throw new Error("A run exposed no hidden callback");
if (reports.some((report) => report.hidden.length > 2)) throw new Error("A run exposed more than two hidden callbacks");

console.log(JSON.stringify({
  library: expectedCounts,
  total: CHINESE_EVENTS.length,
  uniqueAcrossFiveRuns: union.size,
  runs: reports,
  personaTitles: CHINESE_PERSONAS.map((persona) => persona.title),
}, null, 2));

function choiceScore(choice: any, strategy: typeof strategies[number]) {
  const route = Number(choice.chinese?.routes?.[strategy.route] ?? 0) * 7;
  const text = `${choice.text} ${choice.feedback}`;
  return route + strategy.keywords.reduce((score, keyword) => score + (text.includes(keyword) ? 2 : 0), 0);
}

function validateChineseMidGg() {
  const energyState: any = initEngineForMajor(MAJOR_ID);
  energyState.semesterIdx = 5;
  energyState.stats.energy = 2;
  const energyHit = checkMidGG(energyState);
  if (energyHit?.reason !== "chinese_energy_shutdown") throw new Error("Chinese energy GG did not trigger");

  const overloadState: any = initEngineForMajor(MAJOR_ID);
  overloadState.semesterIdx = 6;
  overloadState.stats.energy = 12;
  overloadState.hiddenStats.overResponsibility = 80;
  const overloadHit = checkMidGG(overloadState);
  if (overloadHit?.reason !== "chinese_expression_overload") throw new Error("Chinese expression overload GG did not trigger");
}
