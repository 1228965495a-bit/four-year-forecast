/* eslint-disable @typescript-eslint/no-explicit-any */

import { applyChoice, getCurrentEvent, initEngineForMajor, loadMajorRuntime } from "../src/lib/scriptEngine";
import { createLawRunState, deriveLawResult, pickLawCoreEvent } from "../src/lib/lawRoguelite";
import {
  buildLawPreviousRunSummary,
  createLawReplayContext,
  createNextLifeIntent,
  deriveLawPortraits,
  deriveLawReplayRecommendations,
  LAW_PORTRAIT_CHECKPOINTS,
  LAW_REPLAY_OPENING_EVENTS,
} from "../src/lib/lawReplay";

await loadMajorRuntime("law");

const reports: any[] = [];
let summaries: any[] = [];
let previousRecommendations: string[] = [];

for (let runIndex = 1; runIndex <= 3; runIndex += 1) {
  let state: any = initEngineForMajor("law");
  createLawRunState(state, { runs: runIndex, routes: [], personas: [], experiences: [] });
  state.history = [];

  if (runIndex > 1) {
    const previous = summaries[summaries.length - 1];
    const fakeState = reports[reports.length - 1].finalState;
    const result = deriveLawResult(fakeState);
    const recommendations = deriveLawReplayRecommendations(fakeState, result.route.id, result.persona.id, summaries);
    const recommendation = recommendations[(runIndex - 2) % 2];
    previousRecommendations = recommendations.map((item) => item.routeId);
    state.replayContext = createLawReplayContext(
      createNextLifeIntent(recommendation, previous),
      previous,
      recommendation.legacyExperience,
    );
  }

  state.seenEvents = [];
  state.currentEventId = pickLawCoreEvent(state);
  state.seenEvents = state.currentEventId ? [state.currentEventId] : [];
  const eventIds: string[] = [];
  const novelty: boolean[] = [];
  const portraits: string[] = [];
  const previous = state.replayContext?.previousRun;

  for (let guard = 0; guard < 60 && !state.finished; guard += 1) {
    const event = getCurrentEvent(state);
    if (!event) throw new Error(`run ${runIndex}: missing ${state.currentEventId}`);
    const options = event.options ?? event.choices ?? [];
    if (!options.length) throw new Error(`run ${runIndex}: no choices for ${event.id}`);
    const intentChoice = options.find((choice: any) => choice.isIntentOption);
    const choice = intentChoice ?? options[(guard + runIndex) % options.length];
    const beforeSemester = state.semesterIdx;
    eventIds.push(event.id);
    novelty.push(!previous?.seenEventIds.includes(event.id) || Boolean(event.isNewVariant || event.hasNewIntentOption));
    const applied = applyChoice(state, choice);
    state = applied.state;
    state.history = [{
      eventId: event.id,
      choiceId: choice.id,
      semester: event.semester,
      title: event.title,
      choice: choice.text,
      feedback: choice.feedback ?? "",
    }, ...state.history];
    for (const checkpoint of LAW_PORTRAIT_CHECKPOINTS) {
      if (beforeSemester < checkpoint && state.semesterIdx >= checkpoint) {
        portraits.push(...deriveLawPortraits(state, checkpoint).map((item) => item.id));
      }
    }
  }

  if (!state.finished) throw new Error(`run ${runIndex}: did not finish`);
  const result = deriveLawResult(state);
  const summary = buildLawPreviousRunSummary(state, result.route.id, result.persona.id);
  summaries = [...summaries, summary].slice(-3);

  if (runIndex > 1) {
    if (!LAW_REPLAY_OPENING_EVENTS.some((event) => event.id === eventIds[0])) {
      throw new Error(`run ${runIndex}: replay did not use an opening variant`);
    }
    if (eventIds[0] === previous.openingEventIds[0]) {
      throw new Error(`run ${runIndex}: first event repeated`);
    }
    if (novelty.slice(0, 3).filter(Boolean).length < 2) {
      throw new Error(`run ${runIndex}: fewer than two fresh opening events`);
    }
    if (!state.replayContext?.legacyExperience?.id) {
      throw new Error(`run ${runIndex}: missing legacy experience`);
    }
    if (Array.isArray((state.replayContext as any).legacyExperiences)) {
      throw new Error(`run ${runIndex}: legacy experiences stacked`);
    }
  }
  if (portraits.length < 3) throw new Error(`run ${runIndex}: missing portrait checkpoints`);

  reports.push({
    runIndex,
    route: result.route.id,
    persona: result.persona.id,
    eventCount: eventIds.length,
    opening: eventIds.slice(0, 3),
    novelOpeningCount: novelty.slice(0, 3).filter(Boolean).length,
    portraits: [...new Set(portraits)],
    legacy: state.replayContext?.legacyExperience.id ?? null,
    target: state.replayContext?.intent.targetRouteId ?? null,
    finalState: state,
  });
}

const recommendationPairs = reports.map((report) => {
  const result = deriveLawResult(report.finalState);
  return deriveLawReplayRecommendations(
    report.finalState,
    result.route.id,
    result.persona.id,
    summaries,
  ).map((item) => `${item.targetType}:${item.routeId}`);
});
if (recommendationPairs.some((pair) => pair.length !== 2 || pair[0] === pair[1])) {
  throw new Error("recommendation pair is invalid");
}
if (previousRecommendations.length !== 2) throw new Error("recommendations were not generated");

console.log(JSON.stringify({
  openingVariants: LAW_REPLAY_OPENING_EVENTS.length,
  runs: reports.map(({ finalState: _finalState, ...report }) => report),
  recommendationPairs,
  historyKept: summaries.length,
}, null, 2));
