export type ReplayTargetType = "near_miss" | "opposite";

export interface BehaviorVector {
  expression: number;
  planning: number;
  riskTaking: number;
  responsibility: number;
  exploration: number;
  stability: number;
  academicDrive: number;
  boundarySetting: number;
}

export interface PreviousRunSummary {
  runId: string;
  majorId: string;
  openingEventIds: string[];
  seenEventIds: string[];
  selectedOptionIds: string[];
  choicesByEvent: Record<string, { optionId: string; optionText: string; outcome: string }>;
  routeId: string;
  personaId: string;
  keyMemoryIds: string[];
  routeScores: Record<string, number>;
  behaviorVector: BehaviorVector;
  completedAt: number;
}

export interface NextLifeIntent {
  sourceRunId: string;
  majorId?: string;
  targetType: ReplayTargetType;
  targetRouteId: string;
  targetBehaviorTags: string[];
  sourceMemoryIds: string[];
  selectedAt: number;
}

export interface ReplayRecommendation {
  targetType: ReplayTargetType;
  routeId: string;
  routeTitle: string;
  heading: string;
  explanation: string;
  actionLabel: string;
  targetBehaviorTags: string[];
  legacyExperience: LegacyExperienceSelection;
}

export interface LegacyExperienceSelection {
  id: string;
  title: string;
  description: string;
}

export interface EmergingPortraitResult {
  id: string;
  title: string;
  description: string;
  evidenceText?: string;
}

export interface ReplayRunContext {
  intent: NextLifeIntent;
  previousRun: PreviousRunSummary;
  legacyExperience: LegacyExperienceSelection;
  shownPortraitIds: string[];
  pendingPortraits: EmergingPortraitResult[];
  behaviorCounts: Record<string, number>;
  recentBehaviorTags: string[];
  openingNovelCount: number;
  completedEventCount: number;
}

export interface ReplayArchive {
  runsByMajor: Record<string, PreviousRunSummary[]>;
  pendingIntent: NextLifeIntent | null;
  pendingLegacyExperience: LegacyExperienceSelection | null;
  analytics: Array<{ name: string; at: number; fields: Record<string, string | number | boolean | null> }>;
}

export const EMPTY_REPLAY_ARCHIVE: ReplayArchive = {
  runsByMajor: {},
  pendingIntent: null,
  pendingLegacyExperience: null,
  analytics: [],
};

export function normalizeReplayArchive(value: Partial<ReplayArchive> | null | undefined): ReplayArchive {
  return {
    runsByMajor: value?.runsByMajor && typeof value.runsByMajor === "object" ? value.runsByMajor : {},
    pendingIntent: value?.pendingIntent ?? null,
    pendingLegacyExperience: value?.pendingLegacyExperience ?? null,
    analytics: Array.isArray(value?.analytics) ? value.analytics.slice(-200) : [],
  };
}

export function appendReplayRun(
  archive: ReplayArchive,
  summary: PreviousRunSummary,
): ReplayArchive {
  const previous = archive.runsByMajor[summary.majorId] ?? [];
  if (previous.some((run) => run.runId === summary.runId)) return archive;
  return {
    ...archive,
    runsByMajor: {
      ...archive.runsByMajor,
      [summary.majorId]: [...previous, summary].slice(-3),
    },
  };
}

export function replayDistance(a: BehaviorVector, b: BehaviorVector) {
  return (Object.keys(a) as Array<keyof BehaviorVector>)
    .reduce((total, key) => total + Math.abs(a[key] - b[key]), 0);
}
