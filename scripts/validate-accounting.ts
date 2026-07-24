/* eslint-disable @typescript-eslint/no-explicit-any */

import { ACCOUNTING_EVENTS } from "../src/data/script/byMajor/accounting.roguelite.events";
import { applyChoice, getCurrentEvent, initEngineForMajor, loadMajorRuntime } from "../src/lib/scriptEngine";
import {
  ACCOUNTING_PERSONAS,
  createAccountingRunState,
  deriveAccountingResult,
  pickAccountingCoreEvent,
} from "../src/lib/accountingRoguelite";

const MAJOR_ID = "accounting";
const expected = { main: 8, route: 22, major_random: 10, hidden: 8 };
for (const [type, count] of Object.entries(expected)) {
  const actual = ACCOUNTING_EVENTS.filter((event) => event.type === type).length;
  if (actual !== count) throw new Error(`${type}: expected ${count}, got ${actual}`);
}
if (new Set(ACCOUNTING_EVENTS.map((event) => event.id)).size !== 48) throw new Error("Accounting event IDs are not unique");

await loadMajorRuntime(MAJOR_ID);

const strategies = [
  { name: "事务所审计", route: "audit", keywords: ["凭证", "审计", "材料", "盘点", "追", "底稿"] },
  { name: "企业与分析", route: "analysis", keywords: ["企业", "月结", "分析", "业务", "预算", "Excel"] },
  { name: "考证深造", route: "cpa", keywords: ["证书", "备考", "考试", "计划", "科目"] },
  { name: "考公稳定", route: "civil", keywords: ["岗位", "报名", "专业代码", "备选", "行测"] },
  { name: "低耗跨行", route: "survival", keywords: ["边界", "跨行", "拒绝", "保住", "交接"] },
];

const reports = strategies.map((strategy, runIndex) => {
  let state: any = initEngineForMajor(MAJOR_ID);
  createAccountingRunState(state, runIndex + 1);
  state.history = [];
  state.seenEvents = [];
  state.currentEventId = pickAccountingCoreEvent(state);
  state.seenEvents = state.currentEventId ? [state.currentEventId] : [];
  const events: string[] = [];

  for (let guard = 0; guard < 24 && !state.finished; guard += 1) {
    const event = getCurrentEvent(state);
    if (!event) throw new Error(`${strategy.name}: missing event ${state.currentEventId}`);
    const choices = event.options ?? event.choices ?? [];
    const choice = [...choices].sort((a, b) => score(b, strategy) - score(a, strategy))[0];
    events.push(event.id);
    state = applyChoice(state, choice).state;
    state.history = [...(state.history ?? []), {
      semester: event.semester, title: event.title, choice: choice.text, feedback: choice.feedback ?? "",
    }];
  }

  if (!state.finished) throw new Error(`${strategy.name}: run did not finish`);
  if (events.length < 13 || events.length > 16) throw new Error(`${strategy.name}: ${events.length} events outside 13-16`);
  if (new Set(events).size !== events.length) throw new Error(`${strategy.name}: repeated event`);
  const result = deriveAccountingResult(state);
  return {
    strategy: strategy.name,
    eventCount: events.length,
    route: result.route.title,
    persona: result.persona.title,
    callbacks: events.filter((id) => id.startsWith("accounting_hidden_")),
    closed: state.flags.filter((flag: string) => flag.startsWith("accounting_closed_")),
    specialExperiences: result.experiences.map((item) => item.title),
    events,
  };
});

const union = new Set(reports.flatMap((report) => report.events));
if (union.size < 28) throw new Error(`Five runs only discovered ${union.size} unique events`);
if (new Set(reports.map((report) => report.route)).size < 4) throw new Error("Five runs produced fewer than four routes");
if (new Set(reports.map((report) => report.persona)).size < 3) throw new Error("Five runs produced fewer than three personas");
if (reports.some((report) => report.callbacks.length < 1)) throw new Error("A run exposed no hidden callback");
if (reports.some((report) => report.callbacks.length > 2)) throw new Error("A run exposed more than two hidden callbacks");

console.log(JSON.stringify({
  library: expected,
  total: ACCOUNTING_EVENTS.length,
  uniqueAcrossFiveRuns: union.size,
  runs: reports,
  personaTitles: ACCOUNTING_PERSONAS.map((persona) => persona.title),
}, null, 2));

function score(choice: any, strategy: typeof strategies[number]) {
  const route = Number(choice.accounting?.routes?.[strategy.route] ?? 0) * 8;
  const text = `${choice.text} ${choice.feedback}`;
  return route + strategy.keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 2 : 0), 0);
}
