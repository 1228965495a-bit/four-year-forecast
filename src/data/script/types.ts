export type SemesterKey = 'y1s1' | 'y1s2' | 'y2s1' | 'y2s2' | 'y3s1' | 'y3s2' | 'y4s1' | 'y4s2';

export type EventType = 'main' | 'major_random' | 'hidden' | 'route' | 'transfer' | 'gg_check' | 'settlement' | string;

export type Condition =
  | { type: 'stat' | 'majorStat' | 'hiddenStat'; key: string; op: '>=' | '<=' | '>' | '<' | '==' | '!='; value: number }
  | { type: 'flag' | 'route' | 'eventSeen'; key?: string; eventId?: string }
  | { type: 'achievement'; achievementId: string }
  | { type: 'semester'; key: SemesterKey }
  | Record<string, unknown>;

export interface ConditionGroup {
  all?: Condition[];
  any?: Condition[];
  not?: Condition | ConditionGroup;
  [key: string]: unknown;
}

export interface EffectBundle {
  stats?: Record<string, number>;
  majorStats?: Record<string, number>;
  hiddenStats?: Record<string, number>;
  flagsAdd?: string[];
  routeAdd?: string[];
  achievementIds?: string[];
  transfer?: Record<string, unknown>;
  ggRisk?: number;
  [key: string]: unknown;
}

export interface ChoiceConfig {
  id: string;
  choiceId: string;
  text: string;
  feedback: string;
  resultText: string;
  effects: EffectBundle;
  statChanges: Record<string, number>;
  routeChanges: string[];
  condition?: ConditionGroup | Condition | null;
  tagsUnlocked: string[];
  achievementUnlocked: string[];
  nextEventId?: string | null;
  nextEvent?: string | null;
}

export interface EventConfig {
  id: string;
  eventId: string;
  majorId: string;
  title: string;
  type: EventType;
  semester?: SemesterKey | string | null;
  stage?: string | null;
  description: string;
  tags: string[];
  weight?: number | null;
  conditions: ConditionGroup | Record<string, unknown>;
  triggerCondition: ConditionGroup | Record<string, unknown>;
  options: ChoiceConfig[];
  choices: ChoiceConfig[];
  fallbackEventId?: string | null;
  resultText: string;
  statChanges: Record<string, number>;
  routeChanges: string[];
  tagsUnlocked: string[];
  achievementUnlocked: string[];
  nextEvent?: string | null;
}

export interface MajorStatConfig {
  key: string;
  name: string;
  initialValue: number;
  description: string;
}

export interface TimelineItem {
  key: string;
  semester: string;
  label?: string;
  theme: string;
  coreEvents?: string;
  statTrend?: string;
  routeForeshadow?: string;
  mainEventIds: string[];
  [key: string]: unknown;
}

export interface MajorConfig {
  id: string;
  majorId: string;
  name: string;
  tier: 'S' | 'A' | 'B' | string;
  category: string;
  card: Record<string, unknown>;
  intro: { title?: string; body: string; startButton?: string };
  tags: string[];
  fitProfile: string[];
  avoidProfile: string[];
  commonFilters: string[];
  painPoints: string[];
  memes: string[];
  initialStats: Record<string, number>;
  majorStats: MajorStatConfig[];
  timeline: TimelineItem[];
  randomEvents: string[];
  hiddenEvents: string[];
  routeEvents: string[];
  achievements: string[];
  endings: string[];
  shareTexts: string[];
}

export interface RouteConfig {
  id: string;
  routeId: string;
  majorId: string;
  name: string;
  description: string;
  triggerCondition: ConditionGroup | Record<string, unknown>;
  tags: string[];
}

export interface EndingConfig {
  id: string;
  endingId: string;
  majorId: string;
  title: string;
  description: string;
  condition: ConditionGroup | Condition | Record<string, unknown>;
  priority: number;
  shareText: string;
  advice: string;
}

export interface AchievementConfig {
  id: string;
  achievementId: string;
  majorId: string;
  title: string;
  description: string;
  condition: ConditionGroup | Condition | Record<string, unknown>;
  shareText: string;
}

export interface GameData {
  majors: MajorConfig[];
  events: EventConfig[];
  routes: RouteConfig[];
  endings: EndingConfig[];
  achievements: AchievementConfig[];
  transferRules: Record<string, unknown>;
  globalStats: Record<string, unknown>;
}
